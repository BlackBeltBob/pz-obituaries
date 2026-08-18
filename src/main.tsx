import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// All data lives in this browser's IndexedDB now -- ask the browser not to
// evict it under storage pressure. Best-effort: unsupported in some
// browsers (notably Safari private mode), and the browser can still decline.
void navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
