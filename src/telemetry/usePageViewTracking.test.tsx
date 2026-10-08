import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const trackPageView = vi.hoisted(() => vi.fn())

vi.mock('./telemetry', () => ({ trackPageView }))


import { usePageViewTracking } from './usePageViewTracking'

beforeEach(() => {
  trackPageView.mockClear()
})

describe('usePageViewTracking', () => {
  it('reports the view it is given', () => {
    renderHook(({ view }: { view: string }) => usePageViewTracking(view), {
      initialProps: { view: 'restaurants' },
    })

    expect(trackPageView).toHaveBeenCalledTimes(1)
    expect(trackPageView).toHaveBeenCalledWith('restaurants')
  })

  it('reports again only when the view changes', () => {
    const { rerender } = renderHook(({ view }: { view: string }) => usePageViewTracking(view), {
      initialProps: { view: 'restaurants' },
    })

    // Re-rendering for any other reason must not be reported as another view, or a busy screen would
    // bury the journey in duplicate page views.
    rerender({ view: 'restaurants' })
    expect(trackPageView).toHaveBeenCalledTimes(1)

    rerender({ view: 'menu' })
    expect(trackPageView).toHaveBeenCalledTimes(2)
    expect(trackPageView).toHaveBeenLastCalledWith('menu')

    rerender({ view: 'confirmation' })
    expect(trackPageView).toHaveBeenCalledTimes(3)
    expect(trackPageView).toHaveBeenLastCalledWith('confirmation')
  })
})
