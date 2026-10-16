import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { ORDER_STATUS, errorMessage, money } from '../api'
import { Bike, Check } from 'lucide-react'
import DeliveryMap from '../components/DeliveryMap'

const STEPS = ['reçue', 'en_préparation', 'en_livraison', 'livrée']

export function OrderProgress({ status }) {
  if (status === 'annulée') return <p className="alert">Cette commande a été annulée.</p>
  const current = STEPS.indexOf(status)
  return (
    <ol className="progress">
      {STEPS.map((s, i) => (
        <li key={s} className={i <= current ? 'done' : ''}>
          <span className="dot">{i < current ? <Check size={18} /> : i + 1}</span>
          {ORDER_STATUS[s]}
        </li>
      ))}
    </ol>
  )
}

export default function OrderTracking() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({ id: params.get('id') || '', phone: params.get('phone') || '' })
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const isNew = params.get('new') === '1'

  const fetchOrder = useCallback(async (id, phone) => {
    try {
      const { data } = await api.get('/orders/track', { params: { id, phone } })
      setOrder(data)
      setError('')
    } catch (err) {
      setOrder(null)
      setError(errorMessage(err))
    }
  }, [])

  useEffect(() => {
    if (params.get('id') && params.get('phone')) fetchOrder(params.get('id'), params.get('phone'))
  }, [params, fetchOrder])

  // Actualisation automatique du statut toutes les 20 secondes
  useEffect(() => {
    if (!order || ['livrée', 'annulée'].includes(order.status)) return
    const t = setInterval(() => fetchOrder(order.id, order.phone), 20000)
    return () => clearInterval(t)
  }, [order, fetchOrder])

  const submit = (e) => {
    e.preventDefault()
    fetchOrder(form.id, form.phone)
  }

  return (
    <div className="container page narrow">
      {order && isNew && (
        <div className="card success-card">
          <div className="big-icon"><Bike size={56} strokeWidth={1.5} /></div>
          <h1>Merci pour votre commande !</h1>
          <p>Votre numéro de commande est <strong>#{order.id}</strong>. Gardez-le pour suivre la livraison.</p>
        </div>
      )}
      {!isNew && <h1 className="page-title">Suivre ma commande</h1>}

      {!order && (
        <form className="card form" onSubmit={submit}>
          <div className="grid-2">
            <label>Numéro de commande
              <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} required inputMode="numeric" />
            </label>
            <label>Téléphone utilisé
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </label>
          </div>
          {error && <p className="alert">{error}</p>}
          <button className="btn btn-block">Rechercher</button>
        </form>
      )}

      {order && (
        <div className="card">
          <div className="order-head">
            <h2>Commande #{order.id}</h2>
            <span className="muted small">{new Date(order.created_at).toLocaleString('fr-FR')}</span>
          </div>
          <OrderProgress status={order.status} />
          {order.items.map((i) => (
            <div key={i.dish_id} className="summary-row">
              <span>{i.quantity} × {i.dish_name}</span>
              <span>{money(i.unit_price * i.quantity)}</span>
            </div>
          ))}
          <div className="totals">
            <div><span>Livraison</span><span>{order.delivery_fee === 0 ? 'Offerte' : money(order.delivery_fee)}</span></div>
            <div className="grand"><span>Total à payer à la livraison</span><span>{money(order.total)}</span></div>
          </div>
          <p className="muted small">Adresse : {order.address}</p>
          <DeliveryMap lat={order.latitude} lng={order.longitude} height={180} />
        </div>
      )}
    </div>
  )
}
