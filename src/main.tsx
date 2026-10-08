import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startTelemetry } from './telemetry/telemetry.ts'

// Start before rendering so the opening view is tracked. Runtime config keeps the image portable.
startTelemetry(window.cronusRuntimeConfig?.applicationInsightsConnectionString)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
