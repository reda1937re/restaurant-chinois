import { useCallback, useEffect, useState } from 'react'
import api, { ORDER_STATUS, errorMessage, money } from '../../api'
import { ArrowRight, Map as MapIcon, MapPin, Navigation, Phone, StickyNote } from 'lucide-react'
import DeliveryMap, { directionsUrl } from '../../components/DeliveryMap'

const NEXT = { 'reçue': 'en_préparation', 'en_préparation': 'en_livraison', 'en_livraison': 'livrée' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')
  const [openMaps, setOpenMaps] = useState({}) // id commande -> carte affichée

  const load = useCallback(() => {
    api.get('/admin/orders', { params: status ? { status } : {} }).then((r) => setOrders(r.data))
  }, [status])

  useEffect(() => {
    load()
    const t = setInterval(load, 15000) // nouvelles commandes
    return () => clearInterval(t)
  }, [load])

  const setOrderStatus = async (id, newStatus) => {
    try {
      const { data } = await api.patch(`/admin/orders/${id}`, { status: newStatus })
      setOrders((list) => list.map((o) => (o.id === id ? data : o)))
    } catch (err) {
      alert(errorMessage(err))
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title left">Commandes</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {orders.length === 0 && <p className="muted">Aucune commande.</p>}
      <div className="list">
        {orders.map((o) => (
          <div key={o.id} className="card admin-order">
            <div className="order-head">
              <strong>#{o.id} · {o.name}</strong>
              <span className={`status status-${o.status}`}>{ORDER_STATUS[o.status]}</span>
            </div>
            <div className="muted small">
              {new Date(o.created_at).toLocaleString('fr-FR')} · <Phone size={14} className="inline-icon" /> <a href={`tel:${o.phone}`}>{o.phone}</a>
            </div>
            <div className="small with-icon"><MapPin size={14} /> {o.address}</div>
            {o.latitude != null && (
              <>
                <div className="btn-row">
                  <button className="btn btn-sm btn-outline" onClick={() => setOpenMaps((m) => ({ ...m, [o.id]: !m[o.id] }))}>
                    <MapIcon size={16} /> {openMaps[o.id] ? 'Masquer la carte' : 'Voir sur la carte'}
                  </button>
                  <a className="btn btn-sm btn-outline" href={directionsUrl(o.latitude, o.longitude)} target="_blank" rel="noreferrer">
                    <Navigation size={16} /> Itinéraire
                  </a>
                </div>
                {openMaps[o.id] && <DeliveryMap lat={o.latitude} lng={o.longitude} height={220} />}
              </>
            )}
            {o.note && <div className="small with-icon"><StickyNote size={14} /> {o.note}</div>}
            <ul className="items">
              {o.items.map((i) => <li key={i.dish_id}>{i.quantity} × {i.dish_name}</li>)}
            </ul>
            <div className="order-head">
              <strong>{money(o.total)} <span className="muted small">(à encaisser)</span></strong>
              <div className="btn-row">
                {NEXT[o.status] && (
                  <button className="btn btn-sm" onClick={() => setOrderStatus(o.id, NEXT[o.status])}>
                    <ArrowRight size={16} /> {ORDER_STATUS[NEXT[o.status]]}
                  </button>
                )}
                {!['livrée', 'annulée'].includes(o.status) && (
                  <button className="btn btn-sm btn-outline" onClick={() => confirm('Annuler cette commande ?') && setOrderStatus(o.id, 'annulée')}>
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
