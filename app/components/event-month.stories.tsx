import type { Meta, StoryObj } from '@storybook/react-vite'

import calendarsJson from '~/../content/calendars.json'
import type { CalendarEvent } from '~/../shared/api'
import { eventsResponse, exampleResponse, fixtureNow } from '~/events.fixtures'
import type { Calendar } from '~/lib'

import { EventMonth } from './event-month'

const calendars = calendarsJson as Calendar[]

function extra(id: string, title: string, start: string, end: string): CalendarEvent {
  return {
    id,
    calendar: 'clinics',
    title,
    start,
    end,
    allDay: false,
    cancelled: false,
    location: null,
    description: [],
    url: null,
  }
}

const meta = {
  title: 'Components/EventMonth',
  component: EventMonth,
  args: { events: eventsResponse.events, calendars, now: fixtureNow },
} satisfies Meta<typeof EventMonth>

export default meta
type Story = StoryObj<typeof meta>

// November 2026's real events. Days before the 15th are muted.
export const Default: Story = {}

// Every calendar's color, and a cancelled round on the 29th.
export const AllCalendars: Story = { args: { events: exampleResponse.events } }

// Saturday the 21st has more events than fit, so it shows "+N more".
export const BusyDay: Story = {
  args: {
    events: [
      ...exampleResponse.events,
      extra(
        'busy-1',
        'Example Driving Clinic',
        '2026-11-21T17:00:00.000Z',
        '2026-11-21T18:00:00.000Z',
      ),
      extra(
        'busy-2',
        'Example Approach Clinic',
        '2026-11-21T22:30:00.000Z',
        '2026-11-21T23:30:00.000Z',
      ),
    ],
  },
}
