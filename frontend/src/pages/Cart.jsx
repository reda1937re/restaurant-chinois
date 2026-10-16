import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { money } from '../api'
import { useCart } from '../context/CartContext'
import { ShoppingBag } from 'lucide-react'

export function useDeliveryFee(subtotal) {
  const [info, setInfo] = useState({ fee: 3, free_threshold: 30 })
  useEffect(() => {
    api.get('/delivery-info').then((r) => setInfo(r.data))
  }, [])
  const fee = subtotal >= info.free_threshold ? 0 : info.fee
  return { fee, threshold: info.free_threshold }
}

export default function Cart() {
  const { items, setQuantity, subtotal, clear } = useCart()
  const { fee, threshold } = useDeliveryFee(subtotal)

  if (items.length === 0) {
    return (
      <div className="container page narrow center">
        <div className="big-icon"><ShoppingBag size={56} strokeWidth={1.5} /></div>
        <h1>Votre panier est vide</h1>
        <Link to="/menu" className="btn">Découvrir le menu</Link>
      </div>
    )
  }

  return (
    <div className="container page narrow">
      <h1 className="page-title">Votre panier</h1>
      <div className="card">
        {items.map((item) => (
          <div key={item.id} className="cart-row">
            <div>
              <strong>{item.name}</strong>
              <div className="muted small">{money(item.price)}</div>
            </div>
            <div className="qty">
              <button onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Retirer">−</button>
              <span>{item.quantity}</span>
              <button onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label="Ajouter">+</button>
            </div>
            <strong className="line-total">{money(item.price * item.quantity)}</strong>
          </div>
        ))}
        <div className="totals">
          <div><span>Sous-total</span><span>{money(subtotal)}</span></div>
          <div><span>Livraison</span><span>{fee === 0 ? 'Offerte' : money(fee)}</span></div>
          {fee > 0 && <p className="muted small">Plus que {money(threshold - subtotal)} pour la livraison offerte.</p>}
          <div className="grand"><span>Total</span><span>{money(subtotal + fee)}</span></div>
        </div>
        <div className="cart-actions">
          <button className="btn btn-outline" onClick={clear}>Vider</button>
          <Link to="/commande" className="btn">Commander</Link>
        </div>
      </div>
    </div>
  )
}
