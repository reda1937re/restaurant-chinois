import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Crosshair, Loader2, Search } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Centre par défaut de la carte (position du restaurant)
export const RESTAURANT_POSITION = [48.8566, 2.3522]

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

// Repère en SVG : évite le problème des images de marqueur Leaflet avec Vite
export const pinIcon = L.divIcon({
  className: 'map-pin',
  html: `<svg viewBox="0 0 24 24" width="40" height="40"><path fill="#b71c1c" stroke="#fff" stroke-width="1.5"
    d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
})

async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM}/reverse?format=jsonv2&accept-language=fr&lat=${lat}&lon=${lng}`
  const res = await fetch(url)
  if (!res.ok) return ''
  const data = await res.json()
  const a = data.address || {}
  const street = [a.house_number, a.road || a.pedestrian || a.neighbourhood].filter(Boolean).join(' ')
  const city = [a.postcode, a.city || a.town || a.village || a.suburb].filter(Boolean).join(' ')
  return [street, city].filter(Boolean).join(', ') || data.display_name || ''
}

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

function FlyTo({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 16), { duration: 0.8 })
  }, [position, map])
  return null
}

/**
 * Carte pour choisir le point de livraison.
 * value : { lat, lng } ou null ; onChange({ lat, lng, address })
 */
export default function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [flyTarget, setFlyTarget] = useState(null)
  const markerRef = useRef(null)
  const lastPick = useRef(0)
  const position = value ? [value.lat, value.lng] : null

  const pick = async (lat, lng, { fly = false } = {}) => {
    setError('')
    if (fly) setFlyTarget([lat, lng])
    onChange({ lat, lng, address: null })
    const pickId = ++lastPick.current
    try {
      const found = await reverseGeocode(lat, lng)
      // ignore la réponse si le point a été déplacé entre-temps
      if (found && pickId === lastPick.current) onChange({ lat, lng, address: found })
    } catch {
      // l'adresse reste à saisir à la main
    }
  }

  const locateMe = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur ce navigateur.")
      return
    }
    setBusy('locate')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy('')
        pick(pos.coords.latitude, pos.coords.longitude, { fly: true })
      },
      () => {
        setBusy('')
        setError('Impossible de vous localiser. Autorisez la localisation ou cliquez sur la carte.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const search = async (e) => {
    e.preventDefault()
    if (query.trim().length < 3) return
    setBusy('search')
    setError('')
    try {
      const res = await fetch(`${NOMINATIM}/search?format=jsonv2&accept-language=fr&limit=5&q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      if (data.length === 0) setError('Aucune adresse trouvée.')
    } catch {
      setError('La recherche a échoué. Cliquez directement sur la carte.')
    } finally {
      setBusy('')
    }
  }

  const choose = (r) => {
    setResults([])
    setQuery('')
    pick(Number(r.lat), Number(r.lon), { fly: true })
  }

  return (
    <div className="location-picker">
      <div className="map-toolbar">
        {/* div et non form : ce composant est déjà dans le formulaire de commande */}
        <div className="map-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search(e)}
            placeholder="Rechercher une adresse…"
          />
          <button type="button" className="btn btn-sm btn-outline" onClick={search} disabled={busy === 'search'} aria-label="Rechercher">
            {busy === 'search' ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
          </button>
        </div>
        <button type="button" className="btn btn-sm" onClick={locateMe} disabled={busy === 'locate'}>
          {busy === 'locate' ? <Loader2 size={16} className="spin" /> : <Crosshair size={16} />} Ma position
        </button>
      </div>

      {results.length > 0 && (
        <ul className="map-results">
          {results.map((r) => (
            <li key={r.place_id}><button type="button" onClick={() => choose(r)}>{r.display_name}</button></li>
          ))}
        </ul>
      )}

      <div className="map-frame">
        <MapContainer center={position || RESTAURANT_POSITION} zoom={position ? 16 : 13} scrollWheelZoom className="map">
          <TileLayer url={TILES} attribution={ATTRIBUTION} />
          <ClickHandler onPick={(lat, lng) => pick(lat, lng)} />
          <FlyTo position={flyTarget} />
          {position && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable
              ref={markerRef}
              eventHandlers={{
                dragend: () => {
                  const { lat, lng } = markerRef.current.getLatLng()
                  pick(lat, lng)
                },
              }}
            />
          )}
        </MapContainer>
        {!position && <div className="map-hint">Cliquez sur la carte pour placer le point de livraison</div>}
      </div>
      {error && <p className="alert small">{error}</p>}
    </div>
  )
}
