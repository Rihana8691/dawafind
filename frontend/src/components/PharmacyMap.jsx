import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon broken in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function PharmacyMap({ pharmacies }) {
  const center = [
    parseFloat(pharmacies[0].latitude),
    parseFloat(pharmacies[0].longitude)
  ]

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '320px' }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {pharmacies.map((p) => (
          <Marker
            key={p.pharmacy_id}
            position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{p.pharmacy_name}</p>
                <p className="text-gray-500">{p.address}</p>
                {p.price && <p className="text-gray-800 mt-1">{p.price} ETB</p>}
                <span className={p.stock_status === 'in' ? 'text-green-600' : 'text-yellow-600'}>
                  {p.stock_status === 'in' ? 'In Stock' : 'Low Stock'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}