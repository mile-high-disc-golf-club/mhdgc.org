import type { Meta, StoryObj } from '@storybook/react-vite'

import { contentPage } from '~/../.storybook/content-page'
import calendarsJson from '~/../content/calendars.json'
import source from '~/../content/pages/events.md?raw'
import {
  emptyResponse,
  eventsResponse,
  exampleResponse,
  fixtureNow,
  partialResponse,
} from '~/events.fixtures'
import type { Calendar } from '~/lib'

import { EventsPage } from './events'

const page = contentPage(source)
// content.config.ts checks the icons and colors when the site builds.
const calendars = calendarsJson as Calendar[]

const meta = {
  title: 'Pages/Events',
  component: EventsPage,
  args: {
    title: page.title,
    html: page.html,
    calendars,
    state: { status: 'ready', response: eventsResponse, now: fixtureNow },
  },
  parameters: { path: '/events' },
} satisfies Meta<typeof EventsPage>

export default meta
type Story = StoryObj<typeof meta>

const phone = { viewport: { value: 'mobile', isRotated: false } }

// The real events on 2026-11-15, as a list.
export const List: Story = {}

export const ListOnPhone: Story = { globals: phone }

// Every calendar has events, one round is cancelled and one description is long.
export const AllCalendars: Story = {
  args: { state: { status: 'ready', response: exampleResponse, now: fixtureNow } },
}

// Shared from a link that shows only tournaments.
export const Filtered: Story = { parameters: { path: '/events?cal=tournaments' } }

// Every calendar turned off.
export const NoneShown: Story = { parameters: { path: '/events?cal=' } }

export const Month: Story = {
  args: AllCalendars.args,
  parameters: { path: '/events?view=month' },
}

// Below `lg`, `?view=month` shows the list, and there's no view toggle.
export const MonthOnPhone: Story = { ...Month, globals: phone }

// What the prerendered page shows until the events arrive.
export const Loading: Story = { args: { state: { status: 'loading' } } }

export const Empty: Story = {
  args: { state: { status: 'ready', response: emptyResponse, now: fixtureNow } },
}

export const FeedError: Story = { args: { state: { status: 'error' } } }

// A calendar has never loaded.
export const Partial: Story = {
  args: { state: { status: 'ready', response: partialResponse, now: fixtureNow } },
}
