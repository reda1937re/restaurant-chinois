import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import api, { categoryIcon, money } from '../api'
import DishCard from '../components/DishCard'
import { useCart } from '../context/CartContext'

export default function Menu() {
  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [active, setActive] = useState('all')
  const [filter, setFilter] = useState({ veg: false, noSpicy: false })
  const { count, subtotal } = useCart()

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data))
    api.get('/dishes').then((r) => setDishes(r.data))
  }, [])

  const visible = dishes.filter(
    (d) => (!filter.veg || d.vegetarian) && (!filter.noSpicy || !d.spicy),
  )
  const shown = categories.filter((c) => active === 'all' || c.id === active)

  return (
    <div className="container page">
      <h1 className="page-title">Notre menu</h1>

      <div className="chips">
        <button className={active === 'all' ? 'chip active' : 'chip'} onClick={() => setActive('all')}>Tout</button>
        {categories.map((c) => {
          const Icon = categoryIcon(c.name)
          return (
            <button key={c.id} className={active === c.id ? 'chip active' : 'chip'} onClick={() => setActive(c.id)}>
              <Icon size={16} /> {c.name}
            </button>
          )
        })}
      </div>
      <div className="filters">
        <label><input type="checkbox" checked={filter.veg} onChange={(e) => setFilter({ ...filter, veg: e.target.checked })} /> Végétarien</label>
        <label><input type="checkbox" checked={filter.noSpicy} onChange={(e) => setFilter({ ...filter, noSpicy: e.target.checked })} /> Non épicé</label>
      </div>

      {shown.map((cat) => {
        const list = visible.filter((d) => d.category_id === cat.id)
        if (list.length === 0) return null
        const Icon = categoryIcon(cat.name)
        return (
          <section key={cat.id} className="section">
            <h2 className="section-title left with-icon"><Icon size={26} /> {cat.name}</h2>
            <div className="dish-grid">
              {list.map((d) => <DishCard key={d.id} dish={d} category={cat.name} />)}
            </div>
          </section>
        )
      })}

      {count > 0 && (
        <Link to="/panier" className="floating-cart">
          <ShoppingBag size={18} /> {count} article{count > 1 ? 's' : ''} · {money(subtotal)} — Voir le panier
        </Link>
      )}
    </div>
  )
}
