import { ApplicationInsights } from '@microsoft/applicationinsights-web'

/**
 * Deployment-supplied /config.js keeps telemetry settings out of the shared image.
 */
interface CronusRuntimeConfig {
  applicationInsightsConnectionString?: string
}

declare global {
  interface Window {
    cronusRuntimeConfig?: CronusRuntimeConfig
  }
}

let client: ApplicationInsights | null = null

/**
 * Starts telemetry only for a non-empty connection string, keeping local runs free of Azure traffic.
 */
export function startTelemetry(connectionString: string | undefined): void {
  // One client per document. A second call is ignored rather than replacing the first, so a
  // duplicate start cannot split a session across two instances.
  if (client !== null || connectionString === undefined || connectionString.trim() === '') {
    return
  }

  client = new ApplicationInsights({
    config: {
      connectionString,

      // Views change without URL changes; explicit page views avoid missing or duplicate journey steps.
      enableAutoRouteTracking: false,

      // Capture unhandled promise rejections as well as uncaught synchronous errors.
      enableUnhandledPromiseRejectionTracking: true,
    },
  })

  // Rely on SDK defaults for dependencies and same-origin W3C trace context.
  // Keep request/response header collection disabled. See README.md, Telemetry.
  client.loadAppInsights()
}

/**
 * Accept only a view name so page-view calls carry no user identifiers or custom properties.
 */
export function trackPageView(name: string): void {
  client?.trackPageView({ name })
}
