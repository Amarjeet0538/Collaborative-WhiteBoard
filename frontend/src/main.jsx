import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './Router.jsx'
import { RouterProvider} from "react-router-dom";


createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RouterProvider router={AppRouter} />
  </StrictMode>,
)
