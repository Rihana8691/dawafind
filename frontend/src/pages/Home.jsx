import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-5xl font-bold mb-3">DawaFind</h1>
      <p className="text-blue-100 text-lg mb-8 text-center">
        Find your medicine at pharmacies near you in Addis Ababa
      </p>
      <button
        onClick={() => navigate('/search')}
        className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full text-lg hover:bg-blue-50 transition"
      >
        Search for a Drug
      </button>
    </div>
  )
}