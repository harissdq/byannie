import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { isLoggedIn, loadAllData, isCartOpen, closeCart, on } from './lib/store'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StoreContent from './components/StoreContent'
import ProductDetail from './components/ProductDetail'
import CartDrawer from './components/CartDrawer'
import Checkout from './components/Checkout'
import Tracking from './components/Tracking'
import Footer from './components/Footer'
import Catalog from './components/Catalog'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'

function StorefrontLayout() {
  const [drawerOpen, setDrawerOpen] = useState(isCartOpen())
  const location = useLocation()

  useEffect(() => {
    setDrawerOpen(isCartOpen())
    const unsub = on('cart-open', (open) => setDrawerOpen(open))
    return unsub
  }, [])

  return (
    <div className="min-h-screen bg-blush text-charcoal font-manrope antialiased overflow-x-hidden">
      <Navbar />
      <main className="relative z-[1]">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
      <AnimatePresence>
        {drawerOpen && <CartDrawer onClose={closeCart} />}
      </AnimatePresence>
    </div>
  )
}

function AdminLayout({ onLogout }) {
  return <AdminDashboard onLogout={onLogout} />
}

export default function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(isLoggedIn())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData().finally(() => {
      setTimeout(() => setLoading(false), 800)
    })
    const handler = () => setAdminLoggedIn(isLoggedIn())
    window.addEventListener('annie:auth-changed', handler)
    return () => window.removeEventListener('annie:auth-changed', handler)
  }, [])

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen visible={loading} />}
      </AnimatePresence>

      <Routes>
        <Route path="/admin" element={adminLoggedIn ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={() => setAdminLoggedIn(true)} />} />
        <Route path="/admin/dashboard" element={adminLoggedIn ? <AdminLayout onLogout={() => setAdminLoggedIn(false)} /> : <Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={adminLoggedIn ? <AdminLayout onLogout={() => setAdminLoggedIn(false)} /> : <Navigate to="/admin" replace />} />
        <Route element={<StorefrontLayout />}>
          <Route index element={<><Hero /><StoreContent /></>} />
          <Route path="/shop" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<Tracking />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
