import { useEffect, useState } from 'react'
import api, { errorMessage, money } from '../../api'
import { Flame, Leaf } from 'lucide-react'

const EMPTY = { category_id: '', name: '', description: '', price: '', image: '', spicy: false, vegetarian: false, available: true }

export default function AdminMenu() {
  const [categories, setCategories] = useState([])
  const [dishes, setDishes] = useState([])
  const [editing, setEditing] = useState(null) // null = fermé, {} = nouveau plat
  const [error, setError] = useState('')

  const load = () => api.get('/admin/dishes').then((r) => setDishes(r.data))

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data))
    load()
  }, [])

  const open = (dish) => {
    setError('')
    setEditing(dish ? { ...dish } : { ...EMPTY, category_id: categories[0]?.id || '' })
  }

  const update = (e) => {
    const { name, type, value, checked } = e.target
    setEditing({ ...editing, [name]: type === 'checkbox' ? checked : value })
  }

  const save = async (e) => {
    e.preventDefault()
    const { id, ...body } = editing
    const payload = { ...body, price: Number(body.price), category_id: Number(body.category_id) }
    try {
      if (id) await api.put(`/admin/dishes/${id}`, payload)
      else await api.post('/admin/dishes', payload)
      setEditing(null)
      load()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const remove = async (dish) => {
    if (!confirm(`Supprimer « ${dish.name} » ?`)) return
    await api.delete(`/admin/dishes/${dish.id}`)
    load()
  }

  const toggle = async (dish) => {
    const { id, ...body } = dish
    await api.put(`/admin/dishes/${id}`, { ...body, available: !dish.available })
    load()
  }

  return (
    <>
      <div className="admin-head">
        <h1 className="page-title left">Menu</h1>
        <button className="btn" onClick={() => open(null)}>+ Nouveau plat</button>
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <form className="card form modal" onSubmit={save} onClick={(e) => e.stopPropagation()}>
            <h2>{editing.id ? 'Modifier le plat' : 'Nouveau plat'}</h2>
            <div className="grid-2">
              <label>Nom
                <input name="name" value={editing.name} onChange={update} required />
              </label>
              <label>Catégorie
                <select name="category_id" value={editing.category_id} onChange={update} required>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <label>Description
              <textarea name="description" rows={2} value={editing.description} onChange={update} />
            </label>
            <div className="grid-2">
              <label>Prix
                <input name="price" type="number" step="0.1" min="0.1" value={editing.price} onChange={update} required />
              </label>
              <label>URL de l'image (facultatif)
                <input name="image" value={editing.image} onChange={update} placeholder="https://… ou /static/images/…" />
              </label>
            </div>
            <div className="checks">
              <label><input type="checkbox" name="spicy" checked={editing.spicy} onChange={update} /> Épicé</label>
              <label><input type="checkbox" name="vegetarian" checked={editing.vegetarian} onChange={update} /> Végétarien</label>
              <label><input type="checkbox" name="available" checked={editing.available} onChange={update} /> Disponible</label>
            </div>
            {error && <p className="alert">{error}</p>}
            <div className="cart-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {categories.map((cat) => {
        const list = dishes.filter((d) => d.category_id === cat.id)
        if (list.length === 0) return null
        return (
          <section key={cat.id} className="section-sm">
            <h2>{cat.name}</h2>
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  {list.map((d) => (
                    <tr key={d.id} className={d.available ? '' : 'disabled'}>
                      <td>
                        <strong>{d.name}</strong>{' '}
                        {d.spicy && <Flame size={14} className="icon-spicy" />}{' '}
                        {d.vegetarian && <Leaf size={14} className="icon-veg" />}
                        <div className="muted small">{d.description}</div>
                      </td>
                      <td className="nowrap">{money(d.price)}</td>
                      <td>
                        <button className={d.available ? 'status status-confirmée as-btn' : 'status status-annulée as-btn'} onClick={() => toggle(d)} title="Changer la disponibilité">
                          {d.available ? 'Disponible' : 'Indisponible'}
                        </button>
                      </td>
                      <td className="btn-row">
                        <button className="btn btn-sm btn-outline" onClick={() => open(d)}>Modifier</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(d)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </>
  )
}
