import { useState } from 'react'
import API from '../services/api'
import DrugCard from '../components/DrugCard'
import PharmacyMap from '../components/PharmacyMap'

export default function Search() {
  const [query, setQuery] = useState('')
  const [drugs, setDrugs] = useState([])
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)
  const [error, setError] = useState('')

  const searchDrugs = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setDrugs([])
    setSelectedDrug(null)
    setPharmacies([])

    try {
      const res = await API.get(`/drugs/search?q=${query}`)
      setDrugs(res.data.drugs)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No drugs found. Try a different name.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const findPharmacies = async (drug) => {
    setSelectedDrug(drug)
    setMapLoading(true)
    setPharmacies([])

    try {
      const res = await API.get(`/pharmacy/availability?drug_id=${drug.id}`)
      setPharmacies(res.data.pharmacies)
    } catch (err) {
      if (err.response?.status === 404) {
        setPharmacies([])
      }
    } finally {
      setMapLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">DawaFind</h1>
          <p className="text-blue-100 text-sm">Search for a drug to find it near you</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={searchDrugs} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by drug name e.g. Panadol, Amoxicillin..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Drug results */}
        {drugs.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              {drugs.length} result{drugs.length > 1 ? 's' : ''} found — click a drug to find pharmacies
            </h2>
            <div className="space-y-2">
              {drugs.map((drug) => (
                <DrugCard
                  key={drug.id}
                  drug={drug}
                  selected={selectedDrug?.id === drug.id}
                  onClick={() => findPharmacies(drug)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Map + pharmacy list */}
        {selectedDrug && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              Pharmacies with <span className="font-semibold text-gray-800">{selectedDrug.brand_name}</span> in stock
            </h2>

            {mapLoading && (
              <div className="text-center py-8 text-gray-400 text-sm">Loading map...</div>
            )}

            {!mapLoading && pharmacies.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-3 text-sm">
                No pharmacies currently have this drug in stock in your area.
              </div>
            )}

            {!mapLoading && pharmacies.length > 0 && (
              <>
                <PharmacyMap pharmacies={pharmacies} />
                <div className="mt-4 space-y-2">
                  {pharmacies.map((p) => (
                    <div key={p.pharmacy_id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{p.pharmacy_name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{p.address}</p>
                          {p.phone && (
                            <p className="text-sm text-blue-600 mt-1">{p.phone}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {p.price && (
                            <p className="font-semibold text-gray-800">{p.price} ETB</p>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                            p.stock_status === 'in'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.stock_status === 'in' ? 'In Stock' : 'Low Stock'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Last updated: {new Date(p.last_updated).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}