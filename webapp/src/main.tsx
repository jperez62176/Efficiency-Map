import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TrackingProvider } from './TrackingContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TrackingProvider>
      <App />
    </TrackingProvider>
  </StrictMode>,
)
