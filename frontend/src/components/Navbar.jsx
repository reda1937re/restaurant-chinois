import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">龍</span> Le Dragon d'Or
        </Link>
        <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={open ? 'nav-links open' : 'nav-links'} onClick={close}>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/reservation">Réserver</NavLink>
          <NavLink to="/suivi">Suivi commande</NavLink>
          {user?.is_admin && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/compte">Mon compte</NavLink>
              <button className="link-btn" onClick={() => { logout(); navigate('/') }}>Déconnexion</button>
            </>
          ) : (
            <NavLink to="/connexion">Connexion</NavLink>
          )}
          <NavLink to="/panier" className="cart-link">
            <ShoppingBag size={18} /> Panier {count > 0 && <span className="badge">{count}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
