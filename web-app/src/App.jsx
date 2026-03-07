import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'
import ForgotPassword from './components/ForgotPassword'
import MyAccount from './components/MyAccount'
import ProductPage from './components/ProductPage'
import LoadingScreen from './components/LoadingScreen'
import Checkout from './components/Checkout'
import Orders from './components/Orders'
import OrderTracking from './components/OrderTracking' // New Component!
import AdminDashboard from './components/AdminDashboard'

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id/track" element={<OrderTracking />} /> {/* New Route */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  )
}

export default App