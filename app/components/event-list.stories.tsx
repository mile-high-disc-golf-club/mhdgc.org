import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import calendarsJson from '~/../content/calendars.json'
import { eventsResponse, exampleResponse, fixtureNow } from '~/events.fixtures'
import { type Calendar, upcomingEvents } from '~/lib'

import { EventList } from './event-list'

const calendars = calendarsJson as Calendar[]
const twoWeeks = upcomingEvents(eventsResponse.events, { now: fixtureNow, weeks: 2 })
const examples = upcomingEvents(exampleResponse.events, { now: fixtureNow, weeks: 4 })

const meta = {
  title: 'Components/EventList',
  component: EventList,
  args: { ...twoWeeks, calendars, now: fixtureNow, onShowMore: fn() },
} satisfies Meta<typeof EventList>

export default meta
type Story = StoryObj<typeof meta>

// Two weeks of real events, with more after them.
export const Default: Story = {}

// Every calendar, a cancelled round and a long description.
export const Examples: Story = { args: { ...examples } }

// The end of the 12 months, with no Show more.
export const NoMore: Story = { args: { more: false } }
