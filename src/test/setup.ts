import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// The test files import from 'vitest' explicitly rather than relying on globals, so React Testing
// Library's automatic cleanup does not run and has to be registered here.
afterEach(cleanup)
