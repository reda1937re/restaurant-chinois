import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(location.state?.from || (user.is_admin ? '/admin' : '/compte'), { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="container page auth-page">
      <form className="card form" onSubmit={submit}>
        <h1>Connexion</h1>
        <label>Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus />
        </label>
        <label>Mot de passe
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        {error && <p className="alert">{error}</p>}
        <button className="btn btn-block">Se connecter</button>
        <p className="muted small center">Pas encore de compte ? <Link to="/inscription">Créer un compte</Link></p>
      </form>
    </div>
  )
}
