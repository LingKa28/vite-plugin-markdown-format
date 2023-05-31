import { createBrowserRouter } from 'react-router-dom'
import BlogPage from './BlogPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BlogPage />,
  },
])
