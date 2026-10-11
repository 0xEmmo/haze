import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppShell } from './components/AppShell'
import { Toaster } from './components/Toaster'
import { HomePage } from './pages/home/HomePage'

const ShopPage = lazy(() => import('./pages/shop/ShopPage'))
const ProductPage = lazy(() => import('./pages/product/ProductPage'))
const WheelPage = lazy(() => import('./pages/wheel/WheelPage'))
const QuizPage = lazy(() => import('./pages/quiz/QuizPage'))
const ComparePage = lazy(() => import('./pages/compare/ComparePage'))
const BoxPage = lazy(() => import('./pages/box/BoxPage'))
const BagPage = lazy(() => import('./pages/bag/BagPage'))
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'))
const OrderPage = lazy(() => import('./pages/order/OrderPage'))
const CreditsPage = lazy(() => import('./pages/CreditsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <ShopPage /> },
      { path: '/shop/:slug', element: <ProductPage /> },
      { path: '/wheel', element: <WheelPage /> },
      { path: '/quiz', element: <QuizPage /> },
      { path: '/compare', element: <ComparePage /> },
      { path: '/box', element: <BoxPage /> },
      { path: '/bag', element: <BagPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/orders/:id', element: <OrderPage /> },
      { path: '/credits', element: <CreditsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return (
    <Toaster>
      <RouterProvider router={router} />
    </Toaster>
  )
}
