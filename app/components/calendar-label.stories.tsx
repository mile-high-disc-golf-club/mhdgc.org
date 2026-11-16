import type { Meta, StoryObj } from '@storybook/react-vite'

import calendarsJson from '~/../content/calendars.json'
import type { Calendar } from '~/lib'

import { CalendarLabel } from './calendar-label'

const calendars = calendarsJson as Calendar[]

const meta = {
  title: 'Components/CalendarLabel',
  component: CalendarLabel,
  args: { calendar: calendars[0] },
} satisfies Meta<typeof CalendarLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

// Every calendar in content/calendars.json, on a surface and on the canvas.
export const AllCalendars: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {['bg-surface', 'bg-canvas'].map((background) => (
        <ul key={background} className={`flex flex-col gap-2 rounded-lg p-4 ${background}`}>
          {calendars.map((calendar) => (
            <li key={calendar.slug}>
              <CalendarLabel calendar={calendar} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  ),
}
