import { expect, test } from 'vitest'

import { parseDescription } from './description'

test('an empty description has no paragraphs', () => {
  expect(parseDescription('')).toEqual([])
  expect(parseDescription(null)).toEqual([])
  expect(parseDescription(' <br> \n ')).toEqual([])
})

test("keeps Google's links as link segments", () => {
  expect(
    parseDescription(
      '<a href="https://www.discgolfscene.com/tournament/X">https://www.discgolfscene.com/tournament/X</a>',
    ),
  ).toEqual([
    [
      {
        href: 'https://www.discgolfscene.com/tournament/X',
        text: 'https://www.discgolfscene.com/tournament/X',
      },
    ],
  ])
})

test('splits lines at <br>, block tags and newlines, and drops other tags', () => {
  expect(
    parseDescription(
      'Line one<br>Line <b>two</b> &amp; more&nbsp;text<br><br><p>Para</p><ul><li>Item</li></ul>Tail\nNext',
    ),
  ).toEqual([['Line one'], ['Line two & more text'], ['Para'], ['Item'], ['Tail'], ['Next']])
})

test('decodes entities', () => {
  expect(parseDescription('Tom &lt;3 &quot;tags&quot; &#39;n&#x27; &#128512; &bogus;')).toEqual([
    ['Tom <3 "tags" \'n\' 😀 &bogus;'],
  ])
})

test('keeps only http(s) links, and their text when the link is dropped', () => {
  expect(
    parseDescription(
      '<a href="https://example.com/a?b=1&amp;c=2">Register</a> or <a href="javascript:alert(1)">not this</a> or <a href=\'mailto:x@example.com\'>mail</a>',
    ),
  ).toEqual([[{ href: 'https://example.com/a?b=1&c=2', text: 'Register' }, ' or not this or mail']])
})

test('uses the URL when a link has no text, and collapses whitespace in link text', () => {
  expect(parseDescription('<a href="https://example.com/"></a>')).toEqual([
    [{ href: 'https://example.com/', text: 'https://example.com/' }],
  ])
  expect(parseDescription('<a href="https://example.com/"> Sign\n up <i>here</i> </a>')).toEqual([
    [{ href: 'https://example.com/', text: 'Sign up here' }],
  ])
})

test('links bare URLs in text, leaving out trailing punctuation', () => {
  expect(
    parseDescription('Register at https://udisc.com/leagues/x. (or https://example.com/y)'),
  ).toEqual([
    [
      'Register at ',
      { href: 'https://udisc.com/leagues/x', text: 'https://udisc.com/leagues/x' },
      '. (or ',
      { href: 'https://example.com/y', text: 'https://example.com/y' },
      ')',
    ],
  ])
})

test('drops scripts, styles and comments with their contents', () => {
  expect(
    parseDescription('<style>p{color:red}</style>Hi<script>alert(1)</script><!-- note --> there'),
  ).toEqual([['Hi there']])
})

test('keeps a stray < as text', () => {
  expect(parseDescription('3 < 4')).toEqual([['3 < 4']])
})
