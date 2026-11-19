import { readFile } from 'node:fs/promises'
import { expect, test } from 'vitest'
import { parse } from 'yaml'

import { listCmsFiles } from './cms.config'
import { boardSchema } from './content.config'

interface CmsField {
  name: string
  widget: string
  required?: boolean
  min?: number
  root?: boolean
  fields?: CmsField[]
}
interface CmsConfig {
  collections: { name: string; files: { file: string; fields: CmsField[] }[] }[]
}

const config = parse(await readFile('public/admin/config.yml', 'utf8')) as CmsConfig

test('edits board.json with the fields its schema allows', () => {
  const [list] = config.collections
    .flatMap((collection) => collection.files)
    .filter(({ file }) => file === 'content/board.json')
    .map(({ fields }) => fields)
    .flat()
  expect(list).toMatchObject({ widget: 'list', root: true })

  const member = boardSchema.element.shape
  const fields = Object.fromEntries((list.fields ?? []).map((field) => [field.name, field]))
  expect(Object.keys(fields)).toEqual(Object.keys(member))
  // Optional in the CMS exactly where the schema allows it to be missing.
  expect(fields.photo).toMatchObject({ widget: 'image', required: false })
  expect(fields.roles).toMatchObject({ widget: 'list', required: false })
  expect(fields.tenure).toMatchObject({ widget: 'list', min: 1 })
  expect(fields.name.required).toBeUndefined()
})

test('serves the CMS script and the chunks it loads, without source maps', async () => {
  const files = await listCmsFiles('node_modules/@sveltia/cms/dist')
  expect(files[0]).toBe('sveltia-cms.js')
  expect(files.some((file) => file.startsWith('chunks/'))).toBe(true)
  expect(files.some((file) => file.endsWith('.map'))).toBe(false)
})
