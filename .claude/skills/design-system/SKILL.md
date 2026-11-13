---
name: design-system
description: Rules for building UI in app/. Use when creating or editing a component in app/design-system or app/components, changing colors or tokens, or changing how a page looks.
---

Follow these when writing UI. The design system is copied from dgtags and adapted (#5, #6). Once they've landed, `app/design-system/components/` and `app/design-system/theme/colors.ts` are the working examples. The site is **light only**.

## Choosing a base

1. **Native element first.** Links, buttons, lists, headings, inputs and `<details>` stay native, styled with Tailwind.
2. **Base UI (`@base-ui/react`) for hard interactions**: dialogs, drawers, menus, popovers. Import from the subpath (`@base-ui/react/dialog`). Its docs ship in `node_modules/@base-ui/react/docs`.
3. **No shadcn CLI.** Code copied from elsewhere gets adapted to these rules first.

Base UI adds real weight to any page that uses it (Menu added about 46 KB gzipped in dgtags). This is a content site where every page is prerendered, so reach for it only when a native element can't do the job. Wrap every part in a function, so reading Base UI at the top level of a module doesn't ship it to every page through the barrel. Once a page uses a Base UI component, import it by its path and leave it out of the barrel. Check `build/client/assets` after adding one.

## Icons

- Use `Icon` and `IconButton`. Never import `@tabler/icons-react` outside `design-system/components/icons.ts`, and never use text characters such as ✓ or → as icons.
- To add an icon, add it to `icons.ts` under a name for what it means on the site (`calendar`, `location`, `facebook`), with its `filled` version if it has one. Every icon there ships with any page that uses `Icon`, so add only what a page uses.
- Pick a color from `Icon`'s `color` prop; the default takes the surrounding text color. Neither component takes a `className`, so lay them out from the parent with `gap`.
- An icon beside text is hidden from screen readers. Give `Icon` a `label` only when it means something on its own. `IconButton` always needs a `label`.

## Text

- All text size and weight comes from `Text`, so styles can't drift. Use a preset (`Text.H1`, `Text.H2`, `Text.Body`, `Text.Small`, `Text.Label`, `Text.Caption`, `Text.Button`); reach for the base `Text` only when none fits. Never write `text-sm`, `font-semibold` and the like, in pages or in design-system components. Lint warns on them in `pages/` and `components/`.
- Pick the element with `as`, so a heading stays a heading and a label stays a `<label>`. Keep one `h1` per page and don't skip heading levels.
- Rendered Markdown goes through `Prose`, which maps elements to the same type scale. Don't add `@tailwindcss/typography` classes.
- A Base UI part that renders its own element (`Dialog.Title`, a trigger or close button) gets `Text` inside it, with `as="span"`.
- One exception: `text-base` on form controls, which stops iOS zooming on focus.

## Colors and styling

- Tailwind classes only. No new CSS: `app.css` holds only what Tailwind needs.
- Use semantic tokens: `bg-surface`, `text-ink-muted`, `border-line-strong`. Lint rejects `dark:` and palette classes like `bg-gray-500`, and palette classes generate nothing anyway.
- A new color is a new token in `colors.ts`, in the `light` theme. Add its pairings to `colors.test.ts`. Event calendar colors are tokens too, never hex values in a page.
- `primary`, `accent`, `success`, `info`, `warning` and `danger` each have the same five roles: the base is a solid fill, `on-*` is text on it, `*-hover` is its hover, `*-soft` is a tint, and `*-ink` is text in that color. For colored text, use `text-danger-ink`, not `text-danger`.
- `accent-soft` isn't for notices. Its tint is close to `warning-soft`, so a gold notice can read as a warning.
- `design-system/theme/plugin.ts` generates the CSS variables and utilities. Don't list tokens anywhere else.

## Images and embeds

- Content images go through `ResponsiveImage` (#9) with `width`, `height` and real `alt` text, or `alt=""` when the image is decorative. Never hotlink Google Sites or other third-party image URLs.
- Board photos and other cropped grids use one aspect ratio, with `object-cover`.
- Third-party embeds (YouTube, the Google Form) load only on demand or lazily, have a `title`, and keep their aspect ratio so the layout doesn't shift. Each embed's origin must be allowed in the CSP (#20).

## Accessibility checklist

Base UI handles ARIA, roles, keyboard use and focus management inside its own components. The rest is ours:

- [ ] **Pattern:** anything custom follows the matching WAI-ARIA pattern, including its keyboard behavior. If that's a lot of work, use a Base UI primitive.
- [ ] **Landmarks:** one `header`, `nav` (labeled), `main` and `footer` from the site layout; the skip link reaches `main`. The current nav link has `aria-current="page"`.
- [ ] **Labels:** icon-only controls have an `aria-label`, and the icon has `aria-hidden`. Links say where they go: no "click here". Links that open a new tab say so.
- [ ] **State:** expose it as data attributes (`data-active`) and style from them (`data-active:bg-primary-soft`), the way Base UI does. Use its attributes on its parts, such as `data-highlighted:`.
- [ ] **Focus:** `design-system/theme/plugin.ts` gives everything a visible `:focus-visible` outline. Never remove it from something focusable. If an outline gets clipped, use a negative `outline-offset`.
- [ ] **Contrast:** `colors.test.ts` passes: 7:1 for `ink`, 5.5:1 for `ink-muted`, 4.5:1 for other text, 3:1 for control borders and the focus outline. Use `line-strong`, not `line`, around a control. Text over a photo needs a scrim token behind it.
- [ ] **Cursor:** `plugin.ts` gives buttons, summaries and Base UI parts with a button or menu item role a pointer, and turns it off when disabled. Don't add `cursor-pointer` to those.
- [ ] **Size and motion:** controls are at least 44px tall (`min-h-11`), since people check event times on their phones at the course. Any animation uses `motion-safe:`.

## Prerendering

Every page is prerendered to static HTML at build time, so:

- Page content comes from loaders that read repo content (#9) or props, never from `useEffect` fetching, so it's in the HTML. The exception is live data such as events from `/api/events`, which loads in the browser with loading, empty and error states.
- Don't read `window`, `document`, `localStorage` or the current date during render. Do it in an effect, or the hydrated page won't match the HTML.
- Check a change with `bun run preview`, which serves the prerendered build in workerd, not only `bun run dev`.

## CSP

Security headers and the Content Security Policy come from `public/_headers` (#20) and apply to `bun run preview` and production, not `bun run dev`.

- **Blocked:** inline `<style>` tags and inline scripts not allowed by hash. If a Base UI component renders a `<style>` tag, give it its styles through classes instead.
- **A new third-party origin** (an embed, an image host, analytics) needs a matching `frame-src`, `img-src`, `script-src` or `connect-src` entry, added in the same PR.

## Repo conventions

**Where code goes:**

```
app/
  design-system/        # imported as ~/design-system
    theme/              # colors.ts, colors.test.ts, plugin.ts
    components/         # button.tsx, plus button.test.tsx and button.stories.tsx beside it
    hooks/              # only hooks with no natural home in a component's file
  components/           # site-specific, built from the design system: SiteLayout, ButtonLink, YouTubeEmbed
  pages/                # one component per page, with its stories and tests. No barrel.
  routes/               # loader, meta and router hooks, then renders its page
```

- **The design system knows nothing about the site.** It can't import `react-router`, `~/components`, `~/routes`, `~/root` or content files, and lint enforces this. Pass what it needs as props. Anything that needs the router goes in `components/` and wraps a design-system piece, the way `ButtonLink` wraps `buttonClasses`.
- **Pages get everything as props.** They can't import `~/root` or `~/routes`, or read `useLoaderData` or `useRouteLoaderData`. Links and UI-only state stay in the page. Import a page by its path (`~/pages/about`), never through a barrel.
- **New UI gets stories.** Add a `*.stories.tsx` beside each component and page, with one story per meaningful state, such as loading, empty and error. A design-system component with several variants, sizes or colors also gets an `Overview` story first, built with `StoryGrid`, which shows every combination. Stories only pass props: a global decorator supplies the router, so don't mock it in a story. Tests for behavior go in `*.test.tsx` and render those stories through `composeStories`.
- **One component per file, kept flat.** Helpers used by one component stay in its file. Give a component a folder only if it grows several private files. Don't add `utils/` or `context/` folders.
- **Named exports only**, listed by name in the `index.ts` of `components/` and `hooks/`, then in `design-system/index.ts`. Inside a folder, import files with `./`, not through the barrel.

## Done means

- [ ] `bun run format:check`, `bun run lint`, `bun run typecheck` and `bun run test` pass.
- [ ] Checked by keyboard and at phone width (375px). Storybook's toolbar has the size selector.
- [ ] Checked on `bun run preview` with the console open: no hydration warnings, and no CSP errors once #20 has landed.
