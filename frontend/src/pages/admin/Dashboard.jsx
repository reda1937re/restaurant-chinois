import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { money } from '../../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data))
  }, [])

  if (!stats) return <p>Chargement…</p>

  const tiles = [
    { label: 'Commandes en cours', value: stats.orders_active, to: '/admin/commandes' },
    { label: 'Réservations à confirmer', value: stats.reservations_pending, to: '/admin/reservations' },
    { label: "Réservations aujourd'hui", value: stats.reservations_today, to: '/admin/reservations' },
    { label: "Chiffre d'affaires du jour (livré)", value: money(stats.revenue_today) },
    { label: 'Plats au menu', value: stats.dishes_count, to: '/admin/menu' },
  ]

  return (
    <>
      <h1 className="page-title left">Tableau de bord</h1>
      <div className="stats">
        {tiles.map((t) => {
          const body = (<><span className="stat-value">{t.value}</span><span className="muted small">{t.label}</span></>)
          return t.to
            ? <Link key={t.label} to={t.to} className="card stat">{body}</Link>
            : <div key={t.label} className="card stat">{body}</div>
        })}
      </div>
    </>
  )
}
