import axios from 'axios'

export const CURRENCY = '€'
export const money = (n) => `${Number(n).toFixed(2).replace('.', ',')} ${CURRENCY}`

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Transforme une erreur axios en message lisible
export function errorMessage(err) {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return 'Veuillez vérifier les champs du formulaire.'
  return 'Une erreur est survenue. Réessayez.'
}

export const ORDER_STATUS = {
  'reçue': 'Reçue',
  'en_préparation': 'En préparation',
  'en_livraison': 'En livraison',
  'livrée': 'Livrée',
  'annulée': 'Annulée',
}

export const RESERVATION_STATUS = {
  en_attente: 'En attente',
  'confirmée': 'Confirmée',
  'annulée': 'Annulée',
}

export const CATEGORY_EMOJI = {
  'Entrées': '🥟',
  'Dim Sum': '🥢',
  'Nouilles': '🍜',
  'Riz': '🍚',
  'Plats': '🦆',
  'Desserts': '🍡',
  'Boissons': '🍵',
}

export default api
