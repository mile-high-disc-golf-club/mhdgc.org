import '@testing-library/jest-dom/vitest'

import { setProjectAnnotations } from '@storybook/react-vite'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import preview from './preview'

// Stories rendered with composeStories get the same decorators, such as the router.
setProjectAnnotations(preview)

afterEach(cleanup)

// jsdom has no <dialog> methods yet: just enough for a component that opens one
// and listens for it closing. Real browsers ignore this file.
const dialog: Partial<HTMLDialogElement> = HTMLDialogElement.prototype
if (!('showModal' in dialog))
  dialog.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
if (!('close' in dialog))
  dialog.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
