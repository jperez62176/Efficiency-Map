import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { TrackingProvider } from './TrackingContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TrackingProvider>
        <App />
      </TrackingProvider>
    </BrowserRouter>
  </StrictMode>,
)
