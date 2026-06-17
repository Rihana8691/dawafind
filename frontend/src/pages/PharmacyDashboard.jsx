import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

export default function PharmacyDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('inventory')

  const [form, setForm] = useState({
    drug_id: '',
    barcode: '',
    quantity: '',
    price: '',
    low_stock_threshold: 10
  })
  const [drugSearch, setDrugSearch] = useState('')
  const [drugResults, setDrugResults] = useState([])
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [barcodeInput, setBarcodeInput] = useState('')
  const barcodeRef = useRef(null)

  

  const fetchInventory = async () => {
    try {
      const res = await API.get('/pharmacy/inventory')
      setInventory(res.data.inventory)
    } catch (err) {
      setError('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStock = async () => {
    try {
      const res = await API.get('/pharmacy/inventory/low-stock')
      setLowStock(res.data.items)
    } catch (err) {
      console.error('Low stock fetch error')
    }
  }
useEffect(() => {
  const loadData = async () => {
    await fetchInventory()
    await fetchLowStock()
    setLoading(false)
  }
  loadData()
}, [])
  const searchDrug = async (q) => {
    setDrugSearch(q)
    if (q.length < 2) { setDrugResults([]); return }
    try {
      const res = await API.get(`/drugs/search?q=${q}`)
      setDrugResults(res.data.drugs)
    } catch {
      setDrugResults([])
    }
  }

  const selectDrug = (drug) => {
    setSelectedDrug(drug)
    setForm({ ...form, drug_id: drug.id })
    setDrugSearch(drug.brand_name)
    setDrugResults([])
  }

  const lookupBarcode = async () => {
    if (!barcodeInput.trim()) return
    try {
      const res = await API.get(`/drugs/barcode/${barcodeInput}`)
      if (res.data.found) {
        selectDrug(res.data.drug)
        setSuccess(`Found: ${res.data.drug.brand_name}`)
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Drug not found for this barcode. Search manually.')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!form.drug_id) { setError('Please select a drug first'); return }
    if (!form.quantity) { setError('Quantity is required'); return }

    try {
      await API.post('/pharmacy/inventory', {
        drug_id: form.drug_id,
        quantity: parseInt(form.quantity),
        price: parseFloat(form.price) || null,
        low_stock_threshold: parseInt(form.low_stock_threshold) || 10
      })
      setSuccess('Inventory updated successfully')
      setForm({ drug_id: '', barcode: '', quantity: '', price: '', low_stock_threshold: 10 })
      setSelectedDrug(null)
      setDrugSearch('')
      setBarcodeInput('')
      fetchInventory()
      fetchLowStock()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update inventory')
      setTimeout(() => setError(''), 3000)
    }
  }

  const updateQuantity = async (id, quantity) => {
    try {
      await API.patch(`/pharmacy/inventory/${id}/quantity`, {
        quantity: parseInt(quantity)
      })
      fetchInventory()
      fetchLowStock()
    } catch {
      setError('Failed to update quantity')
    }
  }

  const removeItem = async (id) => {
    if (!window.confirm('Remove this drug from inventory?')) return
    try {
      await API.delete(`/pharmacy/inventory/${id}`)
      fetchInventory()
      fetchLowStock()
    } catch {
      setError('Failed to remove item')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/pharmacy/login')
  }

  const stockBadge = (status) => {
    if (status === 'in') return 'bg-green-100 text-green-700'
    if (status === 'low') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const stockLabel = (status) => {
    if (status === 'in') return 'In Stock'
    if (status === 'low') return 'Low Stock'
    return 'Out of Stock'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{user?.pharmacy?.name || 'Pharmacy Dashboard'}</h1>
            <p className="text-blue-100 text-sm">{user?.full_name}</p>
          </div>
          <button onClick={handleLogout} className="text-blue-100 text-sm hover:text-white">
            Logout
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-4xl mx-auto text-sm text-yellow-700">
            ⚠️ {lowStock.length} drug{lowStock.length > 1 ? 's' : ''} low or out of stock —{' '}
            {lowStock.map(i => i.brand_name).join(', ')}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
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
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            Inventory ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            + Add Drug
          </button>
        </div>

        {/* Inventory tab */}
        {activeTab === 'inventory' && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-sm">Loading inventory...</div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No drugs in inventory yet.{' '}
                <button onClick={() => setActiveTab('add')} className="text-blue-600 hover:underline">
                  Add your first drug
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.brand_name}</h3>
                        <p className="text-sm text-gray-500">{item.generic_name} · {item.strength}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Last updated: {new Date(item.last_updated).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${stockBadge(item.stock_status)}`}>
                          {stockLabel(item.stock_status)}
                        </span>
                        {item.price && (
                          <p className="text-sm font-medium text-gray-800 mt-1">{item.price} ETB</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <label className="text-xs text-gray-500">Quantity:</label>
                      <input
                        type="number"
                        defaultValue={item.quantity}
                        min="0"
                        onBlur={(e) => {
                          if (parseInt(e.target.value) !== item.quantity) {
                            updateQuantity(item.id, e.target.value)
                          }
                        }}
                        className="border border-gray-200 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add drug tab */}
        {activeTab === 'add' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-medium text-gray-800 mb-4">Add or update drug in inventory</h2>

            {/* Input method 1: Barcode */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Option 1 — Scan barcode (USB scanner or type barcode number)
              </p>
              <div className="flex gap-2">
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()}
                  placeholder="Scan or type barcode..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={lookupBarcode}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                >
                  Lookup
                </button>
              </div>
            </div>

            {/* Input method 2: Search by name */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Option 2 — Search drug by name
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={drugSearch}
                  onChange={(e) => searchDrug(e.target.value)}
                  placeholder="Type drug name e.g. Panadol..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {drugResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10">
                    {drugResults.map((drug) => (
                      <div
                        key={drug.id}
                        onClick={() => selectDrug(drug)}
                        className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium">{drug.brand_name}</span>
                        <span className="text-gray-400 ml-2">{drug.generic_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedDrug && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded">
                  ✓ Selected: {selectedDrug.brand_name} ({selectedDrug.generic_name}) · {selectedDrug.strength}
                </div>
              )}
            </div>

            {/* Quantity and price form */}
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low stock threshold
                  <span className="text-gray-400 font-normal ml-1">(alert when quantity falls below this)</span>
                </label>
                <input
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Save to Inventory
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}