import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/compte', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="container page auth-page">
      <form className="card form" onSubmit={submit}>
        <h1>Créer un compte</h1>
        <label>Nom complet
          <input name="name" value={form.name} onChange={update} required minLength={2} autoFocus />
        </label>
        <label>Email
          <input name="email" type="email" value={form.email} onChange={update} required />
        </label>
        <label>Téléphone
          <input name="phone" type="tel" value={form.phone} onChange={update} />
        </label>
        <label>Mot de passe (6 caractères min.)
          <input name="password" type="password" value={form.password} onChange={update} required minLength={6} />
        </label>
        {error && <p className="alert">{error}</p>}
        <button className="btn btn-block">Créer mon compte</button>
        <p className="muted small center">Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
      </form>
    </div>
  )
}
