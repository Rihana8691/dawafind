import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [allPharmacies, setAllPharmacies] = useState([])
  const [drugs, setDrugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPending()
    fetchAllPharmacies()
    fetchDrugs()
  }, [])

  const fetchPending = async () => {
    try {
      const res = await API.get('/admin/pharmacies/pending')
      setPending(res.data.pharmacies)
    } catch {
      setError('Failed to load pending pharmacies')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPharmacies = async () => {
    try {
      const res = await API.get('/admin/pharmacies')
      setAllPharmacies(res.data.pharmacies)
    } catch {
      console.error('Failed to load pharmacies')
    }
  }

  const fetchDrugs = async () => {
    try {
      const res = await API.get('/admin/drugs')
      setDrugs(res.data.drugs)
    } catch {
      console.error('Failed to load drugs')
    }
  }

  const approvePharmacy = async (id, name) => {
    try {
      await API.patch(`/admin/pharmacies/${id}/approve`)
      setSuccess(`${name} approved successfully`)
      fetchPending()
      fetchAllPharmacies()
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to approve pharmacy')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">DawaFind Admin</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 text-sm hover:text-white">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
            <p className="text-sm text-gray-500 mt-1">Pending approval</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {allPharmacies.filter(p => p.is_approved).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Active pharmacies</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{drugs.length}</p>
            <p className="text-sm text-gray-500 mt-1">Drugs in database</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'pending', label: `Pending (${pending.length})` },
            { key: 'pharmacies', label: `All Pharmacies (${allPharmacies.length})` },
            { key: 'drugs', label: `Drug Database (${drugs.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pending tab */}
        {activeTab === 'pending' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
            ) : pending.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No pending pharmacies. All caught up.
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((p) => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{p.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{p.address}</p>
                        {p.phone && <p className="text-sm text-gray-400">{p.phone}</p>}
                        <p className="text-xs text-gray-400 mt-2">
                          Registered: {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => approvePharmacy(p.id, p.name)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All pharmacies tab */}
        {activeTab === 'pharmacies' && (
          <div className="space-y-3">
            {allPharmacies.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.is_approved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drug database tab */}
        {activeTab === 'drugs' && (
          <div className="space-y-2">
            {drugs.map((drug) => (
              <div key={drug.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{drug.brand_name}</span>
                    <span className="text-gray-400 text-sm ml-2">{drug.generic_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{drug.dosage_form} · {drug.strength}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {drug.source}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}