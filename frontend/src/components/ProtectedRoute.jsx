import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock } from 'lucide-react'

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) return <div className="container page">Chargement…</div>
  if (!user) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  if (admin && !user.is_admin) {
    // Connecté avec un compte client : on explique au lieu de rediriger sans rien dire
    return (
      <div className="container page auth-page">
        <div className="card center">
          <div className="big-icon"><Lock size={56} strokeWidth={1.5} /></div>
          <h1>Accès réservé à l'administrateur</h1>
          <p className="muted">Vous êtes connecté avec le compte client <strong>{user.email}</strong>.</p>
          <button
            className="btn btn-block"
            onClick={() => { logout(); navigate('/connexion', { state: { from: location.pathname } }) }}
          >
            Se connecter avec le compte admin
          </button>
        </div>
      </div>
    )
  }
  return children
}
