import { ButtonLink } from '~/components'
import type { ContentPage } from '~/content'
import { Card, Prose, Text } from '~/design-system'

export interface DonatePageProps {
  donate: ContentPage
  club: ContentPage
}

// The club's page for its Winter Warriors / Ice Bowl fundraiser (#26).
export const fundraiserUrl = 'https://fundraise.foodbankrockies.org/p2p/site/87SP5/page/5bSMNz#/'

export function DonatePage({ donate, club }: DonatePageProps) {
  return (
    <div className="flex flex-col gap-10">
      <Text.H1>{donate.title}</Text.H1>
      <Card>
        <Prose html={donate.html} />
        <div>
          <ButtonLink to={fundraiserUrl} newTab>
            Donate Now
          </ButtonLink>
        </div>
      </Card>
      <section aria-labelledby="donating-to-the-club" className="flex flex-col gap-4">
        <Text.H2 id="donating-to-the-club">{club.title}</Text.H2>
        <Prose html={club.html} />
      </section>
    </div>
  )
}
