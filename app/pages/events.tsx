import { useState } from 'react'
import { useSearchParams } from 'react-router'

import type { EventsResponse } from '~/../shared/api'
import { CalendarLabel, EventList, EventMonth, TextLink } from '~/components'
import { Button, Icon, LoadingRegion, Notice, Prose, Text, ToggleChip } from '~/design-system'
import {
  type Calendar,
  type EventsView,
  googleCalendarUrl,
  listWeeks,
  parseCalendars,
  parseView,
  toggleCalendar,
  upcomingEvents,
  webcalUrl,
} from '~/lib'
import { socialLinks } from '~/site'

// Events load in the browser, so the prerendered page starts out loading.
// `now` is when they loaded, which decides what "today" is.
export type EventsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; response: EventsResponse; now: Date }

export interface EventsPageProps {
  title: string
  html: string
  calendars: Calendar[]
  state: EventsState
}

const facebook = socialLinks.find((link) => link.label === 'Facebook')

export function EventsPage({ title, html, calendars, state }: EventsPageProps) {
  const ready = state.status === 'ready' ? state : null
  // Only calendars with events get a chip and a subscribe link. Until the
  // events load, every calendar's subscribe links show.
  const withEvents = ready
    ? calendars.filter((calendar) =>
        ready.response.events.some((event) => event.calendar === calendar.slug),
      )
    : calendars
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Text.H1>{title}</Text.H1>
        {html && <Prose html={html} />}
      </div>
      <LoadingRegion busy={state.status === 'loading'} label="Loading events…">
        {state.status === 'error' && (
          <Notice tone="danger" title="Events couldn't load" role="alert">
            <Text.Body>
              Try again later, or check the club&apos;s{' '}
              {facebook && (
                <TextLink to={facebook.href} newTab>
                  Facebook group
                </TextLink>
              )}{' '}
              for news.
            </Text.Body>
          </Notice>
        )}
        {ready && <Events ready={ready} calendars={withEvents} />}
      </LoadingRegion>
      <section aria-labelledby="subscribe" className="flex flex-col gap-4">
        <Text.H2 id="subscribe">Subscribe</Text.H2>
        <Text.Body>
          Add a calendar to your own, and its events stay up to date there as the club changes them.
        </Text.Body>
        <ul className="grid gap-4 sm:grid-cols-2">
          {withEvents.map((calendar) => (
            <li
              key={calendar.slug}
              className="flex flex-col gap-1 rounded-lg border border-line bg-surface p-4"
            >
              <CalendarLabel calendar={calendar} />
              <TextLink to={googleCalendarUrl(calendar.id)} standalone newTab>
                Add to Google Calendar<span className="sr-only">: {calendar.name}</span>
              </TextLink>
              <TextLink to={webcalUrl(calendar.id)} standalone>
                Subscribe in Apple Calendar or Outlook
                <span className="sr-only">: {calendar.name}</span>
              </TextLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// The filter, the view toggle and the events, once they've loaded. The chips
// and the view come from the URL, which the prerendered page can't know, so
// they only render here, after hydration.
function Events({
  ready: { response, now },
  calendars,
}: {
  ready: Extract<EventsState, { status: 'ready' }>
  calendars: Calendar[]
}) {
  const [params, setParams] = useSearchParams()
  const [weeks, setWeeks] = useState(listWeeks)
  const available = calendars.map((calendar) => calendar.slug)
  const shown = parseCalendars(params, available)
  const events = response.events.filter((event) => shown.includes(event.calendar))
  const view = parseView(params)
  const { groups, more } = upcomingEvents(events, { now, weeks })

  function update(next: URLSearchParams) {
    // Only the query changes, so the page stays where it is.
    setParams(next, { replace: true, preventScrollReset: true })
  }
  function setView(next: EventsView) {
    const result = new URLSearchParams(params)
    if (next === 'month') result.set('view', 'month')
    else result.delete('view')
    update(result)
  }

  const list =
    groups.length > 0 ? (
      <EventList
        groups={groups}
        calendars={calendars}
        now={now}
        more={more}
        onShowMore={() => {
          setWeeks(weeks + listWeeks)
        }}
      />
    ) : (
      <Text.Body color="muted">
        {response.events.length > 0 && shown.length < available.length
          ? 'No upcoming events on the calendars you chose.'
          : 'No upcoming events, check back soon.'}
      </Text.Body>
    )

  return (
    <>
      {response.partial && (
        <Notice tone="warning" title="Some calendars may be out of date">
          <Text.Body>Some events may be missing. Check back soon.</Text.Body>
        </Notice>
      )}
      {calendars.length > 0 && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div role="group" aria-label="Show calendars" className="flex flex-wrap gap-2">
            {calendars.map((calendar) => (
              <ToggleChip
                key={calendar.slug}
                pressed={shown.includes(calendar.slug)}
                color={calendar.color}
                icon={calendar.icon}
                onClick={() => {
                  update(toggleCalendar(params, available, calendar.slug))
                }}
              >
                {calendar.name}
              </ToggleChip>
            ))}
          </div>
          {/* The month grid needs seven readable columns, so it's offered from `lg` up. */}
          <div role="group" aria-label="View" className="hidden shrink-0 gap-2 lg:flex">
            <Button
              variant={view === 'list' ? 'primary' : 'secondary'}
              aria-pressed={view === 'list'}
              onClick={() => {
                setView('list')
              }}
            >
              <Icon name="list" />
              List
            </Button>
            <Button
              variant={view === 'month' ? 'primary' : 'secondary'}
              aria-pressed={view === 'month'}
              onClick={() => {
                setView('month')
              }}
            >
              <Icon name="month" filled={view === 'month'} />
              Month
            </Button>
          </div>
        </div>
      )}
      {view === 'month' && response.events.length > 0 ? (
        <>
          {/* Narrower than `lg`, `?view=month` shows the list. */}
          <div className="lg:hidden">{list}</div>
          <div className="hidden lg:block">
            <EventMonth events={events} calendars={calendars} now={now} />
          </div>
        </>
      ) : (
        list
      )}
    </>
  )
}
