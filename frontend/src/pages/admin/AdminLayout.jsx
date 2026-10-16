import { NavLink, Outlet } from 'react-router-dom'
import { Bike, CalendarDays, LayoutDashboard, UtensilsCrossed } from 'lucide-react'

export default function AdminLayout() {
  return (
    <div className="container page admin">
      <nav className="admin-nav">
        <NavLink end to="/admin"><LayoutDashboard size={18} /> Tableau de bord</NavLink>
        <NavLink to="/admin/commandes"><Bike size={18} /> Commandes</NavLink>
        <NavLink to="/admin/reservations"><CalendarDays size={18} /> Réservations</NavLink>
        <NavLink to="/admin/menu"><UtensilsCrossed size={18} /> Menu</NavLink>
      </nav>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  )
}
