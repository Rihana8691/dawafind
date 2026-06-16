const pool = require('../config/db')

const createUser = async ({ full_name, email, password_hash, role, phone }) => {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, phone, created_at`,
    [full_name, email, password_hash, role || 'patient', phone]
  )
  return result.rows[0]
}

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  )
  return result.rows[0]
}

const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, phone, is_verified, created_at 
     FROM users WHERE id = $1`,
    [id]
  )
  return result.rows[0]
}

module.exports = { createUser, findUserByEmail, findUserById }