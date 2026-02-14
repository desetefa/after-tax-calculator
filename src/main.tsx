import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App'
import TaxSourcesPage from './pages/TaxSourcesPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sources" element={<TaxSourcesPage />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  </StrictMode>,
)
