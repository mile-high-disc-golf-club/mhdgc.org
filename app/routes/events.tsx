import { useEffect, useState } from 'react'
import type { ShouldRevalidateFunctionArgs } from 'react-router'

import type { EventsResponse } from '~/../shared/api'
import { readCalendars, readPage } from '~/.server'
import { EventsPage, type EventsState } from '~/pages/events'
import { pageMeta } from '~/seo'

import type { Route } from './+types/events'

export function loader() {
  return { ...readPage('events'), calendars: readCalendars() }
}

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return pageMeta('/events', loaderData)
}

// The filter and view live in the query. Changing them needs nothing new from
// the loader, whose data was prerendered.
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate
}

export default function EventsRoute({ loaderData }: Route.ComponentProps) {
  return <EventsPage {...loaderData} state={useEvents()} />
}

// Events are live, so they load in the browser from the Worker, not at build time.
function useEvents(): EventsState {
  const [state, setState] = useState<EventsState>({ status: 'loading' })
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/events', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`/api/events: ${String(response.status)}`)
        const body = (await response.json()) as Partial<EventsResponse> | null
        if (!Array.isArray(body?.events)) throw new Error('/api/events: no events in the response')
        setState({ status: 'ready', response: body as EventsResponse, now: new Date() })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        console.error(error)
        setState({ status: 'error' })
      })
    return () => {
      controller.abort()
    }
  }, [])
  // A tab left open past midnight would keep yesterday as today, so the time is
  // read again whenever the page comes back into view.
  useEffect(() => {
    function refresh() {
      if (document.visibilityState !== 'visible') return
      setState((current) =>
        current.status === 'ready' ? { ...current, now: new Date() } : current,
      )
    }
    document.addEventListener('visibilitychange', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return state
}
