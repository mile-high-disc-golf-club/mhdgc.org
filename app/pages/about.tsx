import { ResponsiveImage, TextLink } from '~/components'
import type { BoardMember, ContentImage } from '~/content'
import { Prose, Text } from '~/design-system'

export interface AboutPageProps {
  title: string
  html: string
  board: (Omit<BoardMember, 'photo'> & { photo?: ContentImage })[]
}

const contactForm =
  'https://docs.google.com/forms/d/e/1FAIpQLSc0KoS-zrkc6I30_LKWGoo2UfleaFUKlvqCKgLZQz80FcKHuA/viewform'

export function AboutPage({ title, html, board }: AboutPageProps) {
  return (
    <div className="flex flex-col gap-10">
      <Text.H1>{title}</Text.H1>
      {html && <Prose html={html} />}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {board.map((member, index) => (
          <li
            key={member.name}
            className="overflow-hidden rounded-lg border border-line bg-surface"
          >
            {member.photo ? (
              <ResponsiveImage
                image={member.photo}
                alt={member.name}
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                // The first row, up to three across, is on screen as the page opens.
                loading={index < 3 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div
                className="flex aspect-square items-center justify-center bg-primary-soft"
                aria-hidden="true"
              >
                <Text.H1 as="span" color="primary">
                  {member.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </Text.H1>
              </div>
            )}
            <div className="flex flex-col gap-2 p-5">
              {/* An h2 under the page's h1, sized down so Contact Us stays the larger heading. */}
              <Text.H3 as="h2">{member.name}</Text.H3>
              {member.roles.map((role) => (
                <Text.Body key={role} color="muted">
                  {role}
                </Text.Body>
              ))}
              {member.tenure.map((line) => (
                <Text.Small key={line} color="muted">
                  {line}
                </Text.Small>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <section aria-labelledby="contact-us" className="flex flex-col gap-4">
        <Text.H2 id="contact-us">Contact Us</Text.H2>
        {/* The form can't report its height across origins. It's about 770–800px tall, depending
            on width, so this leaves room for its "required question" errors without a blank gap. */}
        <iframe
          src={`${contactForm}?embedded=true`}
          title="Contact Us: Name, Email and Comment"
          loading="lazy"
          className="h-[860px] w-full border-0"
        />
        {/* A fallback for visitors whose browser doesn't load the embedded form. */}
        <TextLink to={contactForm} standalone newTab>
          Open the contact form
        </TextLink>
      </section>
    </div>
  )
}
