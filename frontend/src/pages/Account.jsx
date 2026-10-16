import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { ORDER_STATUS, RESERVATION_STATUS, errorMessage, money } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    api.get('/reservations/mine').then((r) => setReservations(r.data))
    api.get('/orders/mine').then((r) => setOrders(r.data))
  }, [])

  const cancel = async (id) => {
    if (!confirm('Annuler cette réservation ?')) return
    try {
      const { data } = await api.post(`/reservations/${id}/cancel`)
      setReservations((list) => list.map((r) => (r.id === id ? data : r)))
    } catch (err) {
      alert(errorMessage(err))
    }
  }

  const upcoming = (r) => new Date(`${r.date}T${r.time}`) > new Date() && r.status !== 'annulée'

  return (
    <div className="container page">
      <h1 className="page-title">Bonjour {user.name}</h1>
      <div className="chips">
        <button className={tab === 'orders' ? 'chip active' : 'chip'} onClick={() => setTab('orders')}>Mes commandes ({orders.length})</button>
        <button className={tab === 'res' ? 'chip active' : 'chip'} onClick={() => setTab('res')}>Mes réservations ({reservations.length})</button>
      </div>

      {tab === 'orders' && (
        orders.length === 0 ? <p className="muted">Aucune commande. <Link to="/menu">Commander</Link></p> : (
          <div className="list">
            {orders.map((o) => (
              <div key={o.id} className="card list-item">
                <div>
                  <strong>Commande #{o.id}</strong>
                  <div className="muted small">{new Date(o.created_at).toLocaleString('fr-FR')} · {o.items.map((i) => `${i.quantity}× ${i.dish_name}`).join(', ')}</div>
                </div>
                <div className="list-right">
                  <span className={`status status-${o.status}`}>{ORDER_STATUS[o.status]}</span>
                  <strong>{money(o.total)}</strong>
                  <Link className="small" to={`/suivi?id=${o.id}&phone=${encodeURIComponent(o.phone)}`}>Suivre</Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'res' && (
        reservations.length === 0 ? <p className="muted">Aucune réservation. <Link to="/reservation">Réserver</Link></p> : (
          <div className="list">
            {reservations.map((r) => (
              <div key={r.id} className="card list-item">
                <div>
                  <strong>{new Date(r.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à {r.time.slice(0, 5)}</strong>
                  <div className="muted small">{r.guests} pers. · Table {r.table_number}</div>
                </div>
                <div className="list-right">
                  <span className={`status status-${r.status}`}>{RESERVATION_STATUS[r.status]}</span>
                  {upcoming(r) && <button className="btn btn-sm btn-outline" onClick={() => cancel(r.id)}>Annuler</button>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
