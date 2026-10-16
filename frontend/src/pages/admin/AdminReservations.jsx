import { useEffect, useState } from 'react'
import api, { RESERVATION_STATUS, errorMessage } from '../../api'
import { StickyNote } from 'lucide-react'

export default function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [day, setDay] = useState('')

  useEffect(() => {
    api.get('/admin/reservations', { params: day ? { day } : {} }).then((r) => setReservations(r.data))
  }, [day])

  const setStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/reservations/${id}`, { status })
      setReservations((list) => list.map((r) => (r.id === id ? data : r)))
    } catch (err) {
      alert(errorMessage(err))
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title left">Réservations</h1>
        <div className="btn-row">
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          {day && <button className="btn btn-sm btn-outline" onClick={() => setDay('')}>Toutes</button>}
        </div>
      </div>
      {reservations.length === 0 && <p className="muted">Aucune réservation.</p>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Heure</th><th>Client</th><th>Pers.</th><th>Table</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.date).toLocaleDateString('fr-FR')}</td>
                <td>{r.time.slice(0, 5)}</td>
                <td>
                  <strong>{r.name}</strong>
                  <div className="muted small">{r.phone}{r.email && ` · ${r.email}`}</div>
                  {r.note && <div className="small with-icon"><StickyNote size={14} /> {r.note}</div>}
                </td>
                <td>{r.guests}</td>
                <td>{r.table_number}</td>
                <td><span className={`status status-${r.status}`}>{RESERVATION_STATUS[r.status]}</span></td>
                <td className="btn-row">
                  {r.status !== 'confirmée' && <button className="btn btn-sm" onClick={() => setStatus(r.id, 'confirmée')}>Confirmer</button>}
                  {r.status !== 'annulée' && <button className="btn btn-sm btn-outline" onClick={() => setStatus(r.id, 'annulée')}>Annuler</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
