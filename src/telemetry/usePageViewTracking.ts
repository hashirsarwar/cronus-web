import { useEffect } from 'react'
import { trackPageView } from './telemetry'

/**
 * Track journey views explicitly because they do not change the URL.
 * React StrictMode can report the initial view twice in development; production mounts once.
 */
export function usePageViewTracking(view: string): void {
  useEffect(() => {
    trackPageView(view)
  }, [view])
}
