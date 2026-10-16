import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api, { errorMessage, money } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useDeliveryFee } from './Cart'

export default function Checkout() {
  const { user } = useAuth()
  const { items, subtotal, clear } = useCart()
  const { fee } = useDeliveryFee(subtotal)
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', note: '' })
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (items.length === 0) return <Navigate to="/panier" replace />

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const { data } = await api.post('/orders', {
        ...form,
        items: items.map((i) => ({ dish_id: i.id, quantity: i.quantity })),
      })
      clear()
      navigate(`/suivi?id=${data.id}&phone=${encodeURIComponent(data.phone)}&new=1`)
    } catch (err) {
      setError(errorMessage(err))
      setSending(false)
    }
  }

  return (
    <div className="container page">
      <h1 className="page-title">Finaliser la commande</h1>
      <div className="checkout">
        <form className="card form" onSubmit={submit}>
          <h2>Livraison</h2>
          <div className="grid-2">
            <label>Nom complet
              <input name="name" value={form.name} onChange={update} required minLength={2} />
            </label>
            <label>Téléphone
              <input name="phone" type="tel" value={form.phone} onChange={update} required minLength={6} />
            </label>
          </div>
          <label>Adresse de livraison
            <textarea name="address" rows={2} value={form.address} onChange={update} required minLength={5} placeholder="N°, rue, code postal, ville, étage, digicode…" />
          </label>
          <label>Instructions (facultatif)
            <textarea name="note" rows={2} value={form.note} onChange={update} placeholder="Sans coriandre, sonner deux fois…" />
          </label>
          <div className="payment-box">
            <strong>💵 Paiement à la livraison</strong>
            <p className="muted small">En espèces ou par carte auprès du livreur.</p>
          </div>
          {error && <p className="alert">{error}</p>}
          <button className="btn btn-block" disabled={sending}>{sending ? 'Envoi…' : `Confirmer la commande · ${money(subtotal + fee)}`}</button>
          {!user && <p className="muted small center"><Link to="/connexion">Connectez-vous</Link> pour retrouver vos commandes dans votre compte.</p>}
        </form>

        <aside className="card summary">
          <h2>Récapitulatif</h2>
          {items.map((i) => (
            <div key={i.id} className="summary-row">
              <span>{i.quantity} × {i.name}</span>
              <span>{money(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="totals">
            <div><span>Sous-total</span><span>{money(subtotal)}</span></div>
            <div><span>Livraison</span><span>{fee === 0 ? 'Offerte' : money(fee)}</span></div>
            <div className="grand"><span>Total</span><span>{money(subtotal + fee)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
