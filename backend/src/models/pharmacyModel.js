const pool = require('../config/db')

const createPharmacy = async ({ name, address, latitude, longitude, phone, opening_hours }) => {
  const result = await pool.query(
    `INSERT INTO pharmacies (name, address, latitude, longitude, phone, opening_hours)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, address, latitude, longitude, phone, is_approved, created_at`,
    [name, address, latitude, longitude, phone, opening_hours]
  )
  return result.rows[0]
}

const createPharmacyUser = async ({ pharmacy_id, full_name, email, password_hash, role }) => {
  const result = await pool.query(
    `INSERT INTO pharmacy_users (pharmacy_id, full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, pharmacy_id, full_name, email, role, created_at`,
    [pharmacy_id, full_name, email, password_hash, role || 'owner']
  )
  return result.rows[0]
}

const findPharmacyUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT pu.*, p.name as pharmacy_name, p.is_approved 
     FROM pharmacy_users pu
     JOIN pharmacies p ON pu.pharmacy_id = p.id
     WHERE pu.email = $1`,
    [email]
  )
  return result.rows[0]
}

const getPharmacyById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, address, latitude, longitude, phone, opening_hours, is_approved, is_verified, created_at
     FROM pharmacies WHERE id = $1`,
    [id]
  )
  return result.rows[0]
}
const getPendingPharmacies = async () => {
  const result = await pool.query(
    `SELECT id, name, address, phone, created_at 
     FROM pharmacies 
     WHERE is_approved = false 
     ORDER BY created_at DESC`
  )
  return result.rows
}

const approvePharmacy = async (id) => {
  const result = await pool.query(
    `UPDATE pharmacies SET is_approved = true 
     WHERE id = $1 
     RETURNING id, name, is_approved`,
    [id]
  )
  return result.rows[0]
}

const getAllPharmacies = async () => {
  const result = await pool.query(
    `SELECT id, name, address, phone, is_approved, is_verified, created_at 
     FROM pharmacies 
     ORDER BY created_at DESC`
  )
  return result.rows
}

module.exports = { 
  createPharmacy, 
  createPharmacyUser, 
  findPharmacyUserByEmail, 
  getPharmacyById,
  getPendingPharmacies,
  approvePharmacy,
  getAllPharmacies
}