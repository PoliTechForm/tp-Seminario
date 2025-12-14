import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import ToastProvider from './components/ToastProvider'

createRoot(document.getElementById('root')).render(
  <>
    <ToastProvider>
      <App />
    </ToastProvider>
  </>
)
