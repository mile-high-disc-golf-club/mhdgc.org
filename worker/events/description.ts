import type { DescriptionParagraph, DescriptionSegment } from '../../shared/api'

// Google Calendar stores descriptions as HTML when they're edited in its web
// app (`<a>`, `<br>`, `<b>`, entities), and as plain text otherwise. Both are
// reduced to lines of text and http(s) links. Line breaks and block tags start
// a new line, every other tag is dropped (keeping its text), and the contents
// of <script> and <style> are dropped with them.

const TOKEN = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g
const BREAK_TAGS = new Set([
  'br',
  'p',
  'div',
  'li',
  'ul',
  'ol',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'tr',
  'table',
  'blockquote',
  'hr',
  'pre',
])
const HIDDEN_TAGS = new Set(['script', 'style', 'head', 'title'])
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}
// Bare URLs in text become links too, as Google Calendar shows them.
const BARE_URL = /https?:\/\/[^\s<>"]+/g

export function parseDescription(raw: string | null | undefined): DescriptionParagraph[] {
  if (!raw) return []
  const paragraphs: DescriptionParagraph[] = []
  let line: DescriptionSegment[] = []
  let link: { href: string; text: string } | null = null
  let hidden = 0

  function closeLink() {
    if (!link) return
    const text = collapse(link.text).trim()
    const href = httpUrl(link.href)
    if (href) line.push({ href, text: text || href })
    else line.push(text)
    link = null
  }
  function breakLine() {
    closeLink()
    const paragraph = finishLine(line)
    if (paragraph.length) paragraphs.push(paragraph)
    line = []
  }

  for (const [token, closing, rawName, attributes] of raw.matchAll(TOKEN)) {
    if (token.startsWith('<!--')) continue
    if (rawName) {
      const name = rawName.toLowerCase()
      if (HIDDEN_TAGS.has(name)) hidden = Math.max(0, hidden + (closing ? -1 : 1))
      else if (hidden) continue
      else if (name === 'a') {
        closeLink()
        if (!closing) link = { href: decodeEntities(attribute(attributes, 'href') ?? ''), text: '' }
      } else if (BREAK_TAGS.has(name)) {
        if (link) link.text += ' '
        else breakLine()
      }
      continue
    }
    if (hidden) continue
    const pieces = decodeEntities(token).split(/\r\n|\r|\n/)
    pieces.forEach((piece, index) => {
      if (index > 0) {
        if (link) link.text += ' '
        else breakLine()
      }
      if (link) link.text += piece
      else line.push(piece)
    })
  }
  breakLine()
  return paragraphs
}

// Joins neighbouring text, collapses whitespace, finds bare URLs and trims the line.
function finishLine(segments: DescriptionSegment[]): DescriptionParagraph {
  const merged: DescriptionSegment[] = []
  for (const segment of segments) {
    const last = merged.at(-1)
    if (typeof segment === 'string' && typeof last === 'string')
      merged[merged.length - 1] = last + segment
    else merged.push(segment)
  }
  const result: DescriptionSegment[] = []
  for (const segment of merged) {
    if (typeof segment !== 'string') {
      result.push(segment)
      continue
    }
    const text = collapse(segment)
    let index = 0
    for (const match of text.matchAll(BARE_URL)) {
      const url = trimUrl(match[0])
      const href = httpUrl(url)
      if (!href) continue
      result.push(text.slice(index, match.index), { href, text: url })
      index = match.index + url.length
    }
    result.push(text.slice(index))
  }
  // Trim the line's ends and drop empty text.
  const first = result[0]
  if (typeof first === 'string') result[0] = first.trimStart()
  const lastIndex = result.length - 1
  const last = result[lastIndex]
  if (typeof last === 'string') result[lastIndex] = last.trimEnd()
  return result.filter((segment) => segment !== '')
}

function collapse(text: string) {
  return text.replace(/\s+/g, ' ')
}

// Leaves sentence punctuation, and a closing bracket without an opening one, out of a bare URL.
function trimUrl(url: string) {
  let end = url.length
  while (end > 0) {
    const char = url[end - 1]
    if ('.,;:!?\'"'.includes(char)) end--
    else if (char === ')' && !url.slice(0, end - 1).includes('(')) end--
    else break
  }
  return url.slice(0, end)
}

/** The URL, normalized, if it's an absolute http(s) URL. */
export function httpUrl(href: string): string | null {
  try {
    const url = new URL(href.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function attribute(attributes: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(
    attributes,
  )
  if (!match) return undefined
  const [, double, single, bare] = match as (string | undefined)[]
  return double ?? single ?? bare
}

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entity, body: string) => {
    if (body.startsWith('#')) {
      const code =
        body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : Number(body.slice(1))
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? entity
  })
}
