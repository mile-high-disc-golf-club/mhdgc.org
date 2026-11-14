import type { Decorator } from '@storybook/react-vite'
import { createContext, type ReactNode, useContext } from 'react'
import { createRoutesStub } from 'react-router'

// Context, so a change in the Controls panel reaches the story without a new router.
const StoryContext = createContext<ReactNode>(null)

function StoryRoute() {
  return useContext(StoryContext)
}

const RouterStub = createRoutesStub([{ path: '*', Component: StoryRoute }])

/**
 * Lets Link and NavLink render in any story, so stories only pass props.
 * Set `parameters.path` to choose the current URL, such as for a nav link's `aria-current`.
 */
export const withRouter: Decorator = (Story, { parameters }) => {
  const path = (parameters as { path?: string }).path ?? '/'
  return (
    <StoryContext.Provider value={<Story />}>
      <RouterStub key={path} initialEntries={[path]} />
    </StoryContext.Provider>
  )
}
