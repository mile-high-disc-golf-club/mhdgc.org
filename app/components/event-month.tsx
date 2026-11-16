import { type Ref, useId, useRef, useState } from 'react'

import type { CalendarEvent } from '~/../shared/api'
import { Badge, Icon, IconButton, Text } from '~/design-system'
import {
  type Calendar,
  dayHeading,
  denverDay,
  eventDays,
  eventTime,
  gridMonthList,
  monthEvents,
  monthLabel,
  monthWeeks,
  startTime,
} from '~/lib'

import { calendarColors, CalendarLabel } from './calendar-label'
import { EventDetails } from './event-details'

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// A day shows this many events. A day with more shows one fewer and a
// "+N more" button that opens all of them.
const perDay = 3

/**
 * A month of events as a calendar grid, from the current month through the 12 months
 * `/api/events` returns, with previous and next buttons. Days earlier this month
 * show their events muted. Clicking an event opens a dialog with its details. Wide
 * screens only: seven columns are too narrow on a phone.
 */
export function EventMonth({
  events,
  calendars,
  now,
}: {
  events: CalendarEvent[]
  calendars: Calendar[]
  now: Date
}) {
  const months = gridMonthList(now)
  const [index, setIndex] = useState(0)
  const month = months[index]
  const today = denverDay(now)
  const days = monthEvents(events, month)
  const bySlug = new Map(calendars.map((calendar) => [calendar.slug, calendar]))
  const headingId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const [selected, setSelected] = useState<DayEvent | null>(null)

  // `from` gets focus back when the dialog closes. An event in a day's "+N more"
  // popover passes that day's button, since the popover closes first.
  function select(item: DayEvent, from: HTMLElement | null) {
    returnTo.current = from
    setSelected(item)
    dialog.current?.showModal()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        {/* Announced when the buttons change the month. */}
        <div aria-live="polite">
          <Text.H3 as="h2" id={headingId}>
            {monthLabel(month)}
          </Text.H3>
        </div>
        <div className="flex gap-2">
          <IconButton
            icon="previous"
            label="Previous month"
            variant="secondary"
            disabled={index === 0}
            onClick={() => {
              setIndex(index - 1)
            }}
          />
          <IconButton
            icon="next"
            label="Next month"
            variant="secondary"
            disabled={index === months.length - 1}
            onClick={() => {
              setIndex(index + 1)
            }}
          />
        </div>
      </div>
      <table aria-labelledby={headingId} className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {weekdays.map((weekday) => (
              <th key={weekday} scope="col" className="pb-2 text-left">
                <abbr title={weekday} className="no-underline">
                  <Text.Label color="muted">{weekday.slice(0, 3)}</Text.Label>
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthWeeks(month).map((week) => (
            <tr key={week.find(Boolean)}>
              {week.map((day, column) =>
                day ? (
                  <Day
                    key={day}
                    day={day}
                    today={today}
                    now={now}
                    onSelect={select}
                    events={(days.get(day) ?? []).flatMap((event) => {
                      const calendar = bySlug.get(event.calendar)
                      return calendar ? [{ event, calendar }] : []
                    })}
                  />
                ) : (
                  // Days from the months on either side are left blank.
                  <td key={`blank-${String(column)}`} className="border border-line bg-canvas" />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <EventDialog
        ref={dialog}
        item={selected}
        now={now}
        onClose={() => {
          returnTo.current?.focus()
        }}
      />
    </div>
  )
}

type DayEvent = { event: CalendarEvent; calendar: Calendar }

type Select = (item: DayEvent, from: HTMLElement | null) => void

function Day({
  day,
  today,
  now,
  events,
  onSelect,
}: {
  day: string
  today: string
  now: Date
  events: DayEvent[]
  onSelect: Select
}) {
  const more = useRef<HTMLButtonElement>(null)
  const past = day < today
  const shown = events.length > perDay ? events.slice(0, perDay - 1) : events
  const { label } = dayHeading(day, now)
  const popoverId = `day-${day}`
  return (
    <td
      data-past={past || undefined}
      data-today={day === today || undefined}
      className="h-32 border border-line bg-surface p-1.5 align-top data-past:bg-canvas"
    >
      <div className="flex flex-col gap-1">
        <time dateTime={day} className="flex">
          <span
            aria-hidden="true"
            data-today={day === today || undefined}
            className="flex size-7 items-center justify-center rounded-full data-today:bg-primary data-today:text-on-primary"
          >
            <Text.Label numeric color={past ? 'muted' : 'current'}>
              {Number(day.slice(8))}
            </Text.Label>
          </span>
          <span className="sr-only">{day === today ? `Today, ${label}` : label}</span>
        </time>
        {shown.length > 0 && (
          <ul className="flex flex-col gap-1">
            {shown.map((item) => (
              <li key={`${item.event.calendar}-${item.event.id}`}>
                <GridEvent
                  {...item}
                  past={past}
                  onClick={(target) => {
                    onSelect(item, target)
                  }}
                />
              </li>
            ))}
          </ul>
        )}
        {shown.length < events.length && (
          <>
            {/* A 44px tap target around a smaller visible button, as IconButton does. */}
            <button
              ref={more}
              type="button"
              popoverTarget={popoverId}
              className="relative self-start rounded px-1 text-link after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 hover:underline"
            >
              <Text.Caption color="current">
                +{events.length - shown.length} more <span className="sr-only">on {label}</span>
              </Text.Caption>
            </button>
            <div
              id={popoverId}
              popover="auto"
              role="dialog"
              aria-label={label}
              className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-4 text-ink shadow-lg backdrop:bg-scrim"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <Text.H3 as="p">{label}</Text.H3>
                  <IconButton
                    icon="close"
                    label="Close"
                    popoverTarget={popoverId}
                    popoverTargetAction="hide"
                  />
                </div>
                <ul className="flex flex-col gap-3">
                  {events.map((item) => {
                    const { event, calendar } = item
                    return (
                      <li key={`${event.calendar}-${event.id}`}>
                        {/* Opening the dialog closes the popover, so focus goes back
                            to the day's "+N more" button. */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(item, more.current)
                          }}
                          className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] flex-col items-start gap-1 rounded-lg px-2 py-1.5 text-left hover:bg-surface-hover"
                        >
                          <Text.Small as="span" numeric color="muted">
                            {event.cancelled ? <s>{eventTime(event)}</s> : eventTime(event)}
                          </Text.Small>
                          <Text as="span" weight="semibold" color="ink">
                            {event.cancelled ? <s>{event.title}</s> : event.title}
                            {event.cancelled && ' (Cancelled)'}
                          </Text>
                          <CalendarLabel calendar={calendar} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </td>
  )
}

// One event in a day, as a button that opens its details: the calendar's icon,
// and the start time and title on one line, tinted in the calendar's color.
// Earlier days are gray instead. The icon is named, since the calendar's name
// doesn't fit. The grid is only offered on wide screens, where a pointer is
// usual, so these are shorter than the 44px a phone needs.
function GridEvent({
  event,
  calendar,
  past,
  onClick,
}: DayEvent & { past: boolean; onClick: (target: HTMLButtonElement) => void }) {
  const colors = calendarColors[calendar.color]
  const time = startTime(event)
  return (
    <button
      type="button"
      onClick={(click) => {
        onClick(click.currentTarget)
      }}
      className={`flex w-full min-w-0 items-center gap-1 rounded border-l-4 px-1.5 py-0.5 text-left hover:underline ${past ? 'border-line-strong bg-surface-hover text-ink-muted' : `${colors.soft} text-ink`}`}
      title={`${eventTime(event)}: ${event.title} (${calendar.name}${event.cancelled ? ', cancelled' : ''})`}
    >
      <span className={`flex ${past ? '' : colors.ink}`}>
        <Icon name={calendar.icon} size="sm" label={calendar.name} />
      </span>
      <span className="min-w-0 truncate">
        <Text.Caption color="current">
          {event.cancelled && <span className="sr-only">Cancelled:</span>}
          {event.cancelled && ' '}
          {time && <span className="tabular-nums">{time} </span>}
          {event.cancelled ? <s>{event.title}</s> : event.title}
        </Text.Caption>
      </span>
    </button>
  )
}

// A modal dialog with one event's time, title, calendar and details. It stays
// mounted, and keeps showing the last event while it fades out. Escape, the
// close button or a click on the backdrop closes it.
function EventDialog({
  ref,
  item,
  now,
  onClose,
}: {
  ref: Ref<HTMLDialogElement>
  item: DayEvent | null
  now: Date
  onClose: () => void
}) {
  const titleId = useId()
  const days = item && eventDays(item.event)
  return (
    // The backdrop is part of the dialog element, outside its padded content, so
    // a click whose target is the dialog itself landed on the backdrop. Keyboard
    // users close it with Escape or the close button.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(click) => {
        if (click.target === click.currentTarget) click.currentTarget.close()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-0 text-ink opacity-0 shadow-lg backdrop:bg-scrim open:opacity-100 motion-safe:transition-[opacity,overlay,display] motion-safe:transition-discrete motion-safe:duration-200 starting:open:opacity-0"
    >
      {item && (
        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <Text weight="semibold" numeric color="muted">
                {item.event.cancelled ? <s>{eventTime(item.event)}</s> : eventTime(item.event)}
              </Text>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Text.H3 as="h2" id={titleId}>
                  {item.event.cancelled ? <s>{item.event.title}</s> : item.event.title}
                </Text.H3>
                {item.event.cancelled && <Badge tone="danger">Cancelled</Badge>}
              </div>
              {/* A multi-day event's time already names its dates. */}
              {days && days.first === days.last && (
                <Text.Small>{dayHeading(days.first, now).label}</Text.Small>
              )}
            </div>
            <IconButton
              icon="close"
              label="Close"
              onClick={(click) => {
                click.currentTarget.closest('dialog')?.close()
              }}
            />
          </div>
          <CalendarLabel calendar={item.calendar} />
          <EventDetails event={item.event} />
        </div>
      )}
    </dialog>
  )
}
