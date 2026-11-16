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
   image inside `content/images/`, such as `board/jane-doe.jpg`. It sets the
   page's link-preview image, the picture shown when the page is shared on
   Facebook, Slack or in a text message. Without it, the club's default image is
   used. A wrong path fails the checks.
3. Below the second `---`, write the page copy in Markdown. Use blank lines
   between paragraphs, `##` for sections, `###` for subsections, `**bold**`,
   `-` for list items, and `[link text](https://www.mhdgc.org)` for links.
   The title already supplies the main heading; don't add a `#` heading.
   Raw HTML and Markdown image syntax are rejected. Links can start with
   `https://`, `http://`, `mailto:`, `/` (a site path) or `#` (an anchor).
4. Select **Commit changes**, choose **Create a new branch for this commit and
   start a pull request**, and describe what changed.

The Home page reads `home.md` for its welcome, `home-activities.md` for the
What We Do cards, and `home-involved.md` for Get Involved. Keep the activities
as a list, with each activity name in bold and its description on the next line,
indented by two spaces; each becomes a card. The About page also reads its Markdown;
its full copy and board display come in issue #13.
Membership reads `membership.md` for the bag tag explainer and pools,
`membership-join.md` for the How to Join card, and `membership-matches.md` for
the ordered match steps and scoring note. Keep the steps as an ordered list, and
start each step with its name in bold; the page shows that name on its own line.
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

## Events and calendars

Events come from the club's six public Google Calendars. Keep adding and editing
events in Google Calendar, as before. The website checks the calendars every 15
minutes, so a change shows on the Events page within about 15 minutes. The page
shows every occurrence of a repeating event separately, from the start of the
current month to 12 months ahead. Deleting an event, or one occurrence of a
repeating event, removes it from the page. Descriptions show as plain text and
links: bold, colors and other formatting are dropped.

`content/calendars.json` lists the calendars, in the order the Events page shows
them. Each entry needs:

- `id`: the calendar's full ID, from **Settings → Integrate calendar → Calendar
  ID** in Google Calendar, ending in `@group.calendar.google.com`. The calendar
  must be public (**Access permissions for events → Make available to public**,
  with **See all event details**).
- `name`: the name the Events page shows.
- `slug`: a short name in lowercase letters, digits and hyphens, such as
  `ladies-tags`. It appears in shared links that filter the page, such as
  `/events?cal=tags,tournaments`, so changing it breaks those links.
- `icon`: the icon's name, such as `trophy`.
- `color`: the calendar's color token, such as `event-tournaments`.

IDs and slugs must be unique. For example:

```json
[
  {
    "id": "<calendar ID>@group.calendar.google.com",
    "name": "<calendar name>",
    "slug": "<slug>",
    "icon": "<icon>",
    "color": "event-<slug>"
  }
]
```

To add a calendar, make it public first, then add an entry and ask a developer
which icon and color to use. To stop showing a calendar, remove its entry. The
list is checked on every build. For now, the checks only cover the shape of
`icon` and `color` (lowercase words joined by hyphens, and a name starting
`event-`). Once the Events page adds the icons and colors (#19), only the ones
that exist pass.

## Add a photo

1. Open `content/images/` on GitHub (or a folder in it, such as `board/` for
   board photos) and choose **Add file → Upload files**.
2. Upload a JPEG, PNG, WebP or AVIF original. Name it in lowercase with hyphens
   instead of spaces, such as `jane-doe.jpg`: the path you write elsewhere must
   match it exactly, capitals included.
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

Import `readPage`, `readBoard`, `readCalendars` and `readImage` from `~/.server` in a route loader.
Pass the result to a page as props. Use `Prose` for the HTML and `ResponsiveImage`
from `~/components` for images, passing `image`, `alt` and layout-specific `sizes`.
`readBoard()` resolves photo paths to image build output. Page metadata includes
`title`, `description`, optional `ogImage`, and `html`. The image's `src` is a local
fallback URL; its `sources` hold AVIF/WebP srcsets. Routes must remain prerendered.
Content edits trigger a full reload during `bun run dev`.
The Worker reads `calendars.json` through the same compiled content
(`worker/calendars.ts`), so the cron refresh and `/api/events` use the validated
list. Events themselves aren't content: the Worker fetches them from Google
Calendar at run time (see the README).

These tools were chosen because Marked produces plain HTML without a client
runtime, Zod catches malformed JSON/YAML and misspelled fields before deployment,
and Sharp supports explicit image dimensions, orientation and both modern formats
without a third-party service. Validate changes with the checks in `AGENTS.md`.

## Video thumbnails

The committed `content/images/videos/bypfs7tfhni.jpg` and
`content/images/videos/f2dkiwxatsy.jpg` thumbnails were downloaded once from YouTube's
`maxresdefault.jpg` endpoint for `BYpfS7tfhNI` and `F2DkIwXATsY` respectively
(issue #10). Builds process them locally; visitors make no YouTube request until play.
For the home page, pass `readImage('videos/bypfs7tfhni.jpg')` or
`readImage('videos/f2dkiwxatsy.jpg')` from the loader to `YouTubeEmbed` as `thumbnail`,
with the original case-sensitive video ID, title and caption from #10.

## Home course photo

`content/images/home/course.jpg` was exported from the current Google Site
(`https://www.mhdgc.org/home`) for issue #11. It shows a basket among evergreens,
with gondolas and mountains beyond. Builds process this local original with the
same responsive image pipeline as other content images.

## Membership tag photo

`content/images/membership/bag-tags.jpg` was exported from the current Google Site
(`https://www.mhdgc.org/membership`) for issue #12. Builds process this local
original through the responsive image pipeline.

### Board photos (#13)

Copied at full resolution from https://www.mhdgc.org/about on 2026-11-15. Jason Haas has no photo, as directed in #13.
Google Sites rotates its image URLs, so the URLs below may no longer resolve. They record the source on that date.

- `joel-chirhart.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQeZRwJFaqg5GsRBmYNHBfiWQFFZ9uVl0rW4QcnhkPH87xrbJf2tobhYeFb5TQMOBC-Y_mb5VUihFg_HmBSCk7EPNS7Wx2qCC5j-orLrS19HW8CCneFdC3zfGigHsJj2O6WDLt7VON5r0MIzV79Dpv4nm_Ccd1HGauUznGTNY1BV-jgZNcULayGyLSfcVuBoyNJbIkif38gV7gKqLhdAYBcE-DdiIH7fqkK_8iooR_M=s0
- `josh-kreutzer.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQf_4BQHWyA0GfigIJO2Q3uyrf4KcJsqxsbjjfhPvJophXTgQY67I6WjrtaOkLO-4i75Xoss7Pk03fegE2MLx4k26FMr8m8HqXHG5Mxb3DR39lc_WxVetRPjavwY_hwYMnMiKzml_lb4Y7e8Kb_pQlJO1DkQ0P6ffDZUYb_v33DRSBOnxqgRX7DgTQP1aD8=s0
- `jamie-simino.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQebUZhZwTZisA4ilYhXWeORQNSEDjWpEIB7AYHwuSM9qyHRRNIV6SItfcyC1ndlPvN4ySUmaYvm918gkxLkqGbaQBcL-M5x-77BNHAsLyaDPVx3oXpXdVBmX8K4bn5BudX4katf9entXHTn3vjpf8UHyhSTlkQ89aw-h3MJdlssrTFS_hADLZGkpAwaLliq9Su3zwEkPsEDnSjpfB_cpT4amZ2JTnDKvYmUsCkgxf4=s0
- `jeremy-nichols.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQdOX4QWvkjEM0b3rT4G8I7Qf4rASS-XeJHwkUZVkJ7KobfSDNJ-46puoNzJXYQMe2KKY2ioqq-ZYl4Ojij_B23ZkXA6V7yBZWTGsLDfob1MhQIUCGuVm4XLuacrE-ST6GDeILx6rUgALApsafP-6zBfXkmPzCLu9qOa6j-qGwM8TghQ3WA4yEq8GgyDVv7NUT0C4C3iINGB3c2XHKT7HzK1ylPkwte7O34RNgoh=s0
- `mike-irwin.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQepTbeCH6G0RUvUOOIH52KKmy0cOf1NCzpC479u7j36VJBqTzP8N_U_3lhbJMzaftPjJ8LSrDMxtB3VrFpFpGlivrdbuJiHfkxFTWcKXsFqYor-QbC_oTlJ7wzu69fI_z2Exr30kC7fKRJX6H7p7uFiuZ-8Ix8AVgYRDvE4ymkotrHFYrrdNl2OQjN5RdutzWEwYNF_b_R4PEZhtxsjOFLPBQM-4Lk_kxS5yu3Nc0U=s0
- `harriette-shakeri.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQcU3AOx0i1vI_gaGDBR240fqjJ0YsV9GI1iYb3cT8Zs7toY-eAayAUzJ9nH1T0O13C2Fk5IVrHqgYhviw52CLyT7wnUb07kcd0DosPJ2v7OCf9NmycutpaJfU4Jl6VD0JDOMF8oxgumI6qd6pY9zFnIA1yIjoIBpfKuTXEQ8gsVNkKgnmM5LQ-zBk_DK5U=s0
- `jim-amidon.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQdDWygNhiYY0V7RYYvErBJ2MzXwY2n9XZloO2aHJnl94tx1D72UK3GI0laR-sokZ9Koqe7zXLtmYskk8jcENYxXwsTEvncL8F7MDZP3E5UIoueIz6bYQwscL53i7XQmbbovBq_M_HDlYSmVsOjKQn9MiuHbmJTA_nQjwge_onmgsTCm6v9hZh9q_ndReo5qc84E96v5OIp4wiTHjDgJVDeHWL6suF9iWff9ZBv8=s0
- `jamie-olkowski.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQcg_ewlxiu-8MsrE-7B0w7a99dqq5YbOX2YLMQgiqRJH1QJn1c3IOj_v7u-IsxUDWCLrH0EBPNpXrEb0jtLNnIUMwuzasCwnUDEAmCsWrNbTyzVP-plUNA2JQDrXjp8QrRmcSWFU1xpKEiY72kNKK2yXPIITYqFBvws0o2xHXxTbD682Vh6-679ZUGiFVEFjit86lSlrDk7WsPSb7bkQypTLfa6cj5E02HISsT7=s0
- `sabina-arroyo.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQcwcG8nLH4cpMj0SiqEK1Q7xdoYppUsN6FJW5Rsnl5-3HiGtwcPR5A3Ohz97uV2RTsRx1uIW4UwrfUgqZ2sDQ6lNev78kYyGqGnsmG8LXvgACx9JwVQZoRcrTeW3FhEQpHe8vB4fUD_hOa_mtxbfLKcIAhe8KwissYffkIjdXjfjzGw5Awi7DYJxlfDO25Ak0u1VXdpzZvRP17MLuUdCLydfEV8ewdVjaB8mcWt-DE=s0
- `kyle-harrigan.jpg`: https://lh7-us.googleusercontent.com/sitesv-images-rt/APXyLQeLEiTXs-zyIoGfx1qM5EF_cRTtcNnaSGudvYSy2OpSUNqqfC_BB8kjB1G2DKWlzEbant6jzXYAFDWJNFh7ZKENLiR1rq7hSxW1RK1wcLNBS4XHiuipHEUj0Oz1ZVkdMWsGwZuhD70ai1eF1LxHxeCigZrnoChT8gzYREigd8g7mdMPptXtKxyj1TS7rgw=s0
