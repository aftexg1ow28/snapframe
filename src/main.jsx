import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PhotoProvider } from './context/PhotoContext.jsx'
import App from './App.jsx'
import './index.css'
import './theme.css' // [지은] 추가: 2차 디자인 (index.css 뒤에 와야 덮어써요)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PhotoProvider>
        <App />
      </PhotoProvider>
    </BrowserRouter>
  </StrictMode>,
)
