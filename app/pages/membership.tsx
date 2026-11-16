import { ButtonLink, ResponsiveImage } from '~/components'
import type { ContentImage, ContentPage } from '~/content'
import { Card, Prose, Text } from '~/design-system'

export interface MembershipPageProps {
  membership: ContentPage
  join: ContentPage
  matches: ContentPage
  tags: ContentImage
}

export function MembershipPage({ membership, join, matches, tags }: MembershipPageProps) {
  return (
    <div className="flex flex-col gap-10">
      <Text.H1>{membership.title}</Text.H1>
      <section aria-labelledby="how-to-join">
        <Card>
          <Text.H2 id="how-to-join">{join.title}</Text.H2>
          <Prose html={join.html} />
          <div>
            <ButtonLink to="/events">Find a Tag Match</ButtonLink>
          </div>
        </Card>
      </section>
      <div className="grid items-start gap-6 md:grid-cols-2">
        <ResponsiveImage
          image={tags}
          alt="Numbered Mile High Disc Golf Club bag tags: purple Ladies tags and green tags"
          sizes="(min-width: 768px) 480px, 100vw"
          loading="eager"
          fetchPriority="high"
          className="rounded-lg"
        />
        <Prose html={membership.html} />
      </div>
      <section aria-labelledby="how-tag-matches-work" className="flex flex-col gap-4">
        <Text.H2 id="how-tag-matches-work">{matches.title}</Text.H2>
        {/* Puts each step's bold title on its own line, above its description. */}
        <div className="[&_ol>li>strong:first-child]:block">
          <Prose html={matches.html} />
        </div>
      </section>
    </div>
  )
}
