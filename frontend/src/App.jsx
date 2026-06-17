import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Search from './pages/Search'
import PharmacyLogin from './pages/PharmacyLogin'
import PharmacyDashboard from './pages/PharmacyDashboard'
import AdminDashboard from './pages/AdminDashboard'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/pharmacy/login" element={<PharmacyLogin />} />
      <Route path="/pharmacy/dashboard" element={
        <ProtectedRoute role="pharmacy">
          <PharmacyDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}