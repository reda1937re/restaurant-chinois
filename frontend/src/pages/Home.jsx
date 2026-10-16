import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { CATEGORY_EMOJI } from '../api'
import DishCard from '../components/DishCard'

const SIGNATURES = ['Canard laqué', 'Xiao long bao', 'Poulet Kung Pao']

export default function Home() {
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/dishes').then((r) => setDishes(r.data))
    api.get('/categories').then((r) => setCategories(r.data))
  }, [])

  const catName = (id) => categories.find((c) => c.id === id)?.name
  const signatures = dishes.filter((d) => SIGNATURES.includes(d.name))

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">Cuisine chinoise traditionnelle</p>
          <h1>Le Dragon d'Or</h1>
          <p className="hero-sub">Dim sum faits maison, canard laqué et spécialités du Sichuan. Sur place ou livrés chez vous.</p>
          <div className="hero-actions">
            <Link to="/reservation" className="btn btn-gold">Réserver une table</Link>
            <Link to="/menu" className="btn btn-outline-light">Commander en livraison</Link>
          </div>
        </div>
      </section>

      <section className="container features">
        <div className="feature">
          <span>🥢</span>
          <h3>Fait maison</h3>
          <p className="muted">Nos raviolis et nouilles sont préparés chaque jour.</p>
        </div>
        <div className="feature">
          <span>🛵</span>
          <h3>Livraison rapide</h3>
          <p className="muted">Livraison offerte dès 30 €. Paiement à la livraison.</p>
        </div>
        <div className="feature">
          <span>🏮</span>
          <h3>Réservation en ligne</h3>
          <p className="muted">Votre table confirmée en quelques secondes.</p>
        </div>
      </section>

      {signatures.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Nos spécialités</h2>
          <div className="dish-grid">
            {signatures.map((d) => <DishCard key={d.id} dish={d} emoji={CATEGORY_EMOJI[catName(d.category_id)]} />)}
          </div>
          <div className="center"><Link to="/menu" className="btn">Voir tout le menu</Link></div>
        </section>
      )}
    </>
  )
}
