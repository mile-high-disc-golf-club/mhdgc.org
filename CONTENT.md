# Editing the website

Content is stored in this repository. Changes go live after a pull request (PR)
passes the checks and a maintainer merges it. You can do all of this in GitHub's
web editor, without installing software.

## Edit a page

1. Open `content/pages/` on GitHub, choose a `.md` file and select the pencil
   (**Edit this file**).
2. Keep the `---` lines at the top. Between them, edit `title` (the page heading)
   and `description` (the search description). Quote values containing a colon,
   for example `title: "About: our club"`. Optional `ogImage` is the path of an
   image inside `content/images/`, such as `board/jane-doe.jpg`, for link previews.
3. Below the second `---`, write the page copy in Markdown. Use blank lines
   between paragraphs, `##` for sections, `###` for subsections, `**bold**`,
   `-` for list items, and `[link text](https://www.mhdgc.org)` for links.
   The title already supplies the main heading; don't add a `#` heading.
   Raw HTML and Markdown image syntax are rejected. Links can start with
   `https://`, `http://`, `mailto:`, `/` (a site path) or `#` (an anchor).
4. Select **Commit changes**, choose **Create a new branch for this commit and
   start a pull request**, and describe what changed.

So far only the About page reads its Markdown, and only its heading. Its copy and
board display come in issue #13.
Other placeholder routes have not yet been connected to Markdown. Adding a file
alone doesn't create a URL: a developer must connect the page's route loader.

## Edit the board list

Open `content/board.json` and use the pencil button. It is a JSON array, in display
order. Each entry needs `name`, `roles` (a list, which can be empty: `[]`) and
`tenure` (a list of one or more lines). Optional `photo` is the path of an image
inside `content/images/`, such as `board/jane-doe.jpg`. Use double quotes around
keys and values, put commas between entries, and don't put a comma after the last
entry. For example, the shape is:

```json
[
  {
    "name": "<verified name>",
    "roles": ["<verified role>"],
    "tenure": ["<verified tenure line>"],
    "photo": "board/<filename.jpg>"
  }
]
```

Replace the angle-bracket values with verified information, or leave out `photo`
when there isn't one. Don't paste the example into the live list. The list starts
empty; issue #13 fills it in and shows it on the About page. It is checked on
every build.

## Add a photo

1. Open `content/images/` on GitHub (or a folder in it, such as `board/` for
   board photos) and choose **Add file → Upload files**.
2. Upload a JPEG, PNG, WebP or AVIF original with a simple descriptive filename.
   Keep originals here, rather than uploading pre-sized variants. Use photos the
   club has permission to publish; don't link to an external image host.
3. Commit to the same branch as your content changes. Refer to the photo by its
   path inside `content/images/` in `ogImage` or a board entry's `photo`.
4. For a photo in a page's body, ask a developer to place `ResponsiveImage` in
   the page component with useful alt text (or empty alt text for decoration).
   Describe what the photo shows and where it should go in the PR.

The build rotates photos using their orientation metadata, removes metadata,
creates AVIF and WebP sizes up to the original width, and adds a JPEG fallback
(PNG for images with transparency). It never enlarges an original. Width and height
reserve space before loading.

## Check the preview and publish

On your PR, wait for the checks and the automated preview comment. Open its preview
link, check your page on a phone and a larger screen, and check links and spelling.
Push another edit to the same branch to refresh the preview. A failed check can
mean a misspelled field, missing title/description, invalid JSON or an unknown image
path; open the failed check's log for the error and edit the same branch.

Previews are available for eligible same-repository PRs after deployment setup.
Fork PRs do not receive a preview; ask a maintainer to review them and prepare one.
A preview is temporary and does not change the public site. Ask a maintainer to
review and merge the PR when it is ready. Merging to `main` deploys the site.

## For developers

`content.config.ts` validates **all** content during Vite startup/build, even files
no route uses yet. Marked renders Markdown in Node; Zod validates strict schemas
(unknown fields fail); Sharp generates content-hashed local image assets.
These are build dependencies. No Markdown parser, schema library or image processor
is included in the browser or Worker runtime.

Import `readPage`, `readBoard` and `readImage` from `~/.server` in a route loader.
Pass the result to a page as props. Use `Prose` for the HTML and `ResponsiveImage`
from `~/components` for images, passing `image`, `alt` and layout-specific `sizes`.
`readBoard()` resolves photo paths to image build output. Page metadata includes
`title`, `description`, optional `ogImage`, and `html`. The image's `src` is a local
fallback URL; its `sources` hold AVIF/WebP srcsets. Routes must remain prerendered.
Content edits trigger a full reload during `bun run dev`.

These tools were chosen because Marked produces plain HTML without a client
runtime, Zod catches malformed JSON/YAML and misspelled fields before deployment,
and Sharp supports explicit image dimensions, orientation and both modern formats
without a third-party service. Validate changes with the checks in `AGENTS.md`.
