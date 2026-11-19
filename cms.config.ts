import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Serves Sveltia CMS's browser build at /admin/, beside public/admin/index.html
 * and config.yml. The version is pinned in package.json, and the files come from
 * this site rather than a CDN, so /admin's CSP can leave the CDN out.
 * `chunks/` holds the parts the main script loads on demand, such as local Git
 * support, which would otherwise come from unpkg.com.
 */
export async function listCmsFiles(dist: string) {
  const chunks = (await readdir(join(dist, 'chunks'), { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && !entry.name.endsWith('.map'))
    .map((entry) => relative(dist, join(entry.parentPath, entry.name)).replaceAll(sep, '/'))
  return ['sveltia-cms.js', ...chunks.sort()]
}

export function cmsPlugin(): Plugin {
  let dist: string
  let building = false
  return {
    name: 'sveltia-cms',
    configResolved(config) {
      dist = join(config.root, 'node_modules', '@sveltia', 'cms', 'dist')
      building = config.command === 'build'
    },
    async buildStart() {
      if (!building || this.environment.name !== 'client') return
      for (const file of await listCmsFiles(dist))
        this.emitFile({
          type: 'asset',
          fileName: `admin/${file}`,
          source: await readFile(join(dist, file)),
        })
    },
    configureServer(server) {
      server.middlewares.use('/admin/', (req, res, next) => {
        const path = new URL(req.url ?? '/', 'http://localhost').pathname.slice(1)
        void listCmsFiles(dist)
          .then(async (files) => {
            if (!files.includes(path)) {
              next()
              return
            }
            res.setHeader('Content-Type', 'text/javascript')
            res.end(await readFile(join(dist, path)))
          })
          .catch(next)
      })
    },
  }
}
