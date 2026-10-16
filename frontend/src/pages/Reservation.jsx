import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../api'
import { useAuth } from '../context/AuthContext'
import { CalendarCheck } from 'lucide-react'

// Créneaux de 11h30 à 22h00, toutes les 30 minutes
const SLOTS = []
for (let m = 11 * 60 + 30; m <= 22 * 60; m += 30) {
  SLOTS.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
}

// Date locale au format AAAA-MM-JJ
const today = () => new Date().toLocaleDateString('sv-SE')

export default function Reservation() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    date: today(),
    time: '20:00',
    guests: 2,
    note: '',
  })
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [sending, setSending] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const { data } = await api.post('/reservations', { ...form, guests: Number(form.guests) })
      setDone(data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="container page narrow">
        <div className="card success-card">
          <div className="big-icon"><CalendarCheck size={56} strokeWidth={1.5} /></div>
          <h1>Demande de réservation envoyée !</h1>
          <p>
            Merci {done.name}. Table n°{done.table_number} pour <strong>{done.guests} personne{done.guests > 1 ? 's' : ''}</strong>,
            le <strong>{new Date(done.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> à <strong>{done.time.slice(0, 5)}</strong>.
          </p>
          <p className="muted">Référence : #{done.id}. Le restaurant confirmera votre réservation rapidement.</p>
          <div className="hero-actions center">
            <Link to="/menu" className="btn">Voir le menu</Link>
            <button className="btn btn-outline" onClick={() => setDone(null)}>Nouvelle réservation</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container page narrow">
      <h1 className="page-title">Réserver une table</h1>
      <form className="card form" onSubmit={submit}>
        <div className="grid-3">
          <label>Date
            <input type="date" name="date" min={today()} value={form.date} onChange={update} required />
          </label>
          <label>Heure
            <select name="time" value={form.time} onChange={update}>
              {SLOTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Personnes
            <select name="guests" value={form.guests} onChange={update}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <div className="grid-2">
          <label>Nom complet
            <input name="name" value={form.name} onChange={update} required minLength={2} />
          </label>
          <label>Téléphone
            <input name="phone" type="tel" value={form.phone} onChange={update} required minLength={6} />
          </label>
        </div>
        <label>Email (facultatif)
          <input name="email" type="email" value={form.email} onChange={update} />
        </label>
        <label>Demande particulière
          <textarea name="note" rows={3} value={form.note} onChange={update} placeholder="Anniversaire, chaise bébé, allergies…" />
        </label>
        {error && <p className="alert">{error}</p>}
        <button className="btn btn-block" disabled={sending}>{sending ? 'Envoi…' : 'Réserver'}</button>
        {!user && <p className="muted small center"><Link to="/connexion">Connectez-vous</Link> pour retrouver vos réservations dans votre compte.</p>}
      </form>
    </div>
  )
}
