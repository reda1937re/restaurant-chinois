import { useState } from 'react'
import { Check, Flame, Leaf, Plus } from 'lucide-react'
import { categoryIcon, money } from '../api'
import { useCart } from '../context/CartContext'

export default function DishCard({ dish, category }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const FallbackIcon = categoryIcon(category)

  const handleAdd = () => {
    add(dish)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="dish-card">
      <div className="dish-visual">
        {dish.image
          ? <img src={dish.image} alt={dish.name} loading="lazy" />
          : <FallbackIcon size={56} strokeWidth={1.4} />}
      </div>
      <div className="dish-body">
        <div className="dish-head">
          <h3>{dish.name}</h3>
          <span className="price">{money(dish.price)}</span>
        </div>
        <p className="muted">{dish.description}</p>
        <div className="dish-foot">
          <div className="tags">
            {dish.spicy && <span className="tag tag-spicy"><Flame size={13} /> Épicé</span>}
            {dish.vegetarian && <span className="tag tag-veg"><Leaf size={13} /> Végétarien</span>}
          </div>
          <button className="btn btn-sm" onClick={handleAdd}>
            {added ? <><Check size={16} /> Ajouté</> : <><Plus size={16} /> Ajouter</>}
          </button>
        </div>
      </div>
    </article>
  )
}
