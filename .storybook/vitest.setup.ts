import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react-vite'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import preview from './preview'

// Stories rendered with composeStories get the same decorators, such as the router.
setProjectAnnotations(preview)

afterEach(cleanup)
