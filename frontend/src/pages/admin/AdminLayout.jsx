import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="container page admin">
      <nav className="admin-nav">
        <NavLink end to="/admin">📊 Tableau de bord</NavLink>
        <NavLink to="/admin/commandes">🛵 Commandes</NavLink>
        <NavLink to="/admin/reservations">🏮 Réservations</NavLink>
        <NavLink to="/admin/menu">🥢 Menu</NavLink>
      </nav>
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  )
}
