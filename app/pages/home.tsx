import { wordmarkUrl } from '~/brand'
import { ButtonLink, ResponsiveImage, YouTubeEmbed } from '~/components'
import type { ContentImage, ContentPage } from '~/content'
import { Prose, Text } from '~/design-system'

export interface HomePageProps {
  welcome: ContentPage
  activities: ContentPage
  involved: ContentPage
  course: ContentImage
  classic: ContentImage
  challenge: ContentImage
}

export function HomePage({
  welcome,
  activities,
  involved,
  course,
  classic,
  challenge,
}: HomePageProps) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-center rounded-xl bg-surface-hover px-6 py-10">
        <img
          src={wordmarkUrl}
          alt="Mile High Disc Golf Club"
          width={513}
          height={162}
          className="h-auto w-full max-w-xl"
        />
      </div>
      <section aria-labelledby="welcome" className="grid items-center gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Text.H1 id="welcome">{welcome.title}</Text.H1>
          <Prose html={welcome.html} />
        </div>
        <ResponsiveImage
          image={course}
          alt="Disc golf basket among evergreen trees, with gondolas and mountains beyond"
          sizes="(min-width: 768px) 480px, 100vw"
          loading="eager"
          className="rounded-xl"
        />
      </section>
      <section aria-labelledby="activities" className="flex flex-col gap-4">
        <Text.H2 id="activities">{activities.title}</Text.H2>
        <div className="[&_li]:rounded-xl [&_li]:border [&_li]:border-line [&_li]:bg-surface-hover [&_li]:p-6 [&_strong]:mb-2 [&_strong]:block [&_ul]:grid [&_ul]:list-none [&_ul]:gap-4 [&_ul]:pl-0 md:[&_ul]:grid-cols-2">
          <Prose html={activities.html} />
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/events">Events</ButtonLink>
          <ButtonLink to="/membership" variant="secondary">
            Membership
          </ButtonLink>
        </div>
      </section>
      <section aria-labelledby="involved" className="flex flex-col gap-4">
        <Text.H2 id="involved">{involved.title}</Text.H2>
        <Prose html={involved.html} />
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        <YouTubeEmbed
          id="BYpfS7tfhNI"
          title="The 2015 Peak One Mile High Classic Round 2 part 1"
          caption="Mile High Classic"
          thumbnail={classic}
          sizes="(min-width: 768px) 480px, 100vw"
        />
        <YouTubeEmbed
          id="F2DkIwXATsY"
          title="2015 High Plains Challenge round 3 part 1"
          caption="High Plains Challenge"
          thumbnail={challenge}
          sizes="(min-width: 768px) 480px, 100vw"
        />
      </div>
    </div>
  )
}
