import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { pinIcon } from './LocationPicker'
import 'leaflet/dist/leaflet.css'

export const directionsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

// Petite carte en lecture seule du point de livraison
export default function DeliveryMap({ lat, lng, height = 200 }) {
  if (lat == null || lng == null) return null
  return (
    <div className="delivery-map">
      <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} className="map" style={{ height }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]} icon={pinIcon} />
      </MapContainer>
    </div>
  )
}
