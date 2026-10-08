import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Replace the SDK to avoid its transports, timers and browser side effects in unit tests.
 * Record configuration and calls to verify the application's telemetry contract.
 */
const sdk = vi.hoisted(() => ({
  configs: [] as Array<Record<string, unknown>>,
  loadAppInsights: vi.fn(),
  trackPageView: vi.fn(),
}))

vi.mock('@microsoft/applicationinsights-web', () => ({
  ApplicationInsights: class {
    loadAppInsights = sdk.loadAppInsights
    trackPageView = sdk.trackPageView

    constructor(options: { config: Record<string, unknown> }) {
      sdk.configs.push(options.config)
    }
  },
}))

/**
 * Reload the module so its document-lifetime singleton cannot leak between tests.
 */
async function loadTelemetryModule() {
  vi.resetModules()
  return import('./telemetry')
}

const connectionString =
  'InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://localhost/'

beforeEach(() => {
  sdk.configs.length = 0
  sdk.loadAppInsights.mockClear()
  sdk.trackPageView.mockClear()
})

describe('startTelemetry', () => {
  it('creates no client when there is no connection string', async () => {
    const { startTelemetry } = await loadTelemetryModule()

    startTelemetry(undefined)

    // This is the guarantee that local development and the test suite need nothing from Azure.
    expect(sdk.configs).toHaveLength(0)
    expect(sdk.loadAppInsights).not.toHaveBeenCalled()
  })

  it.each(['', '   '])('creates no client for the blank connection string %o', async (blank) => {
    const { startTelemetry } = await loadTelemetryModule()

    startTelemetry(blank)

    // A ConfigMap rendered before the connection string exists must not be treated as configured,
    // because the SDK throws on a malformed connection string and would take the app down with it.
    expect(sdk.configs).toHaveLength(0)
    expect(sdk.loadAppInsights).not.toHaveBeenCalled()
  })

  it('starts a loaded client pointed at the supplied resource', async () => {
    const { startTelemetry } = await loadTelemetryModule()

    startTelemetry(connectionString)

    expect(sdk.configs).toHaveLength(1)
    expect(sdk.configs[0]).toMatchObject({ connectionString })
    expect(sdk.loadAppInsights).toHaveBeenCalledTimes(1)
  })

  it('asks for the instrumentation this application relies on', async () => {
    const { startTelemetry } = await loadTelemetryModule()

    startTelemetry(connectionString)

    // Both are stated rather than inherited: the first because this app has no router to track and
    // reports views itself, the second because the SDK does not watch unhandled rejections unless
    // asked.
    expect(sdk.configs[0]).toMatchObject({
      enableAutoRouteTracking: false,
      enableUnhandledPromiseRejectionTracking: true,
    })
  })

  it('ignores a second start rather than replacing the client', async () => {
    const { startTelemetry } = await loadTelemetryModule()

    startTelemetry(connectionString)
    startTelemetry('InstrumentationKey=11111111-1111-1111-1111-111111111111;IngestionEndpoint=https://localhost/')

    expect(sdk.configs).toHaveLength(1)
    expect(sdk.configs[0]).toMatchObject({ connectionString })
  })
})

describe('trackPageView', () => {
  it('reports nothing before telemetry has been started', async () => {
    const { trackPageView } = await loadTelemetryModule()

    // Called on every view change whether or not a resource is configured, so it has to be safe.
    expect(() => trackPageView('restaurants')).not.toThrow()
    expect(sdk.trackPageView).not.toHaveBeenCalled()
  })

  it('reports the view as a name and nothing else', async () => {
    const { startTelemetry, trackPageView } = await loadTelemetryModule()
    startTelemetry(connectionString)

    trackPageView('menu')

    expect(sdk.trackPageView).toHaveBeenCalledTimes(1)
    // Exactly one field: a page view says where in the journey the user is, never who they are.
    expect(Object.keys(sdk.trackPageView.mock.calls[0][0] as object)).toEqual(['name'])
    expect(sdk.trackPageView).toHaveBeenCalledWith({ name: 'menu' })
  })
})
