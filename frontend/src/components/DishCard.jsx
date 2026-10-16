import { useState } from 'react'
import { money } from '../api'
import { useCart } from '../context/CartContext'

export default function DishCard({ dish, emoji }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    add(dish)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="dish-card">
      <div className="dish-visual">
        {dish.image ? <img src={dish.image} alt={dish.name} /> : <span>{emoji}</span>}
      </div>
      <div className="dish-body">
        <div className="dish-head">
          <h3>{dish.name}</h3>
          <span className="price">{money(dish.price)}</span>
        </div>
        <p className="muted">{dish.description}</p>
        <div className="dish-foot">
          <div className="tags">
            {dish.spicy && <span className="tag tag-spicy">🌶 Épicé</span>}
            {dish.vegetarian && <span className="tag tag-veg">🌿 Végétarien</span>}
          </div>
          <button className="btn btn-sm" onClick={handleAdd}>{added ? '✓ Ajouté' : '+ Ajouter'}</button>
        </div>
      </div>
    </article>
  )
}
