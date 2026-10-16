import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Reservation from './pages/Reservation'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminMenu from './pages/admin/AdminMenu'
import AdminReservations from './pages/admin/AdminReservations'
import AdminOrders from './pages/admin/AdminOrders'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/commande" element={<Checkout />} />
          <Route path="/suivi" element={<OrderTracking />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/compte" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="commandes" element={<AdminOrders />} />
          </Route>
          <Route path="*" element={<div className="container page"><h1>Page introuvable</h1></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
