import { createHash } from 'node:crypto'
import { type DefaultTreeAdapterTypes, parse } from 'parse5'

import { documentPolicy, securityHeaders } from './shared/security-headers'

function* inlineScriptHashes(node: DefaultTreeAdapterTypes.Node): Generator<string> {
  if (
    'tagName' in node &&
    node.tagName === 'script' &&
    !node.attrs.some(({ name }) => name === 'src')
  ) {
    const script = node.childNodes.map((child) => ('value' in child ? child.value : '')).join('')
    yield `'sha256-${createHash('sha256').update(script).digest('base64')}'`
  }
  if ('childNodes' in node) {
    for (const child of node.childNodes) yield* inlineScriptHashes(child)
  }
}

export function buildStaticHeaders(
  staticRules: string,
  documents: readonly { path: string; html: string }[],
): string {
  const commonRule = [
    '/*',
    ...Object.entries(securityHeaders).map(([name, value]) => `  ${name}: ${value}`),
  ].join('\n')
  const documentRules = documents.map(({ path, html }) => {
    // Hash the parsed text the browser will execute, including the
    // route-specific hydration scripts. The hashes change with the build.
    const hashes = [...new Set(inlineScriptHashes(parse(html, { scriptingEnabled: true })))]
    return `${path}\n  Cache-Control: public, max-age=300\n  Content-Security-Policy: ${documentPolicy(hashes)}`
  })
  const output = `${[staticRules.trimEnd(), commonRule, ...documentRules].join('\n\n')}\n`

  // https://developers.cloudflare.com/workers/static-assets/headers/#attach-a-header
  const lines = output.split(/\r?\n/)
  const tooLong = lines.findIndex((line) => !line.trimStart().startsWith('#') && line.length > 2000)
  if (tooLong !== -1) {
    throw new Error(`_headers line ${tooLong + 1} exceeds Cloudflare's 2,000-character limit.`)
  }
  const ruleCount = lines.filter((line) => /^\s*(?:\/|https:\/\/)/.test(line)).length
  // CI appends one rule to set X-Robots-Tag on preview assets.
  if (ruleCount >= 100) {
    throw new Error(
      `_headers has ${ruleCount} rules. Keep one of Cloudflare's 100 rules for PR previews.`,
    )
  }
  return output
}
