const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createPharmacy, createPharmacyUser, findPharmacyUserByEmail, getPharmacyById } = require('../models/pharmacyModel')

const generatePharmacyToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      role: 'pharmacy', 
      email: user.email,
      pharmacy_id: user.pharmacy_id 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const registerPharmacy = async (req, res) => {
  try {
    const { 
      pharmacy_name, address, latitude, longitude, phone, opening_hours,
      full_name, email, password 
    } = req.body

    if (!pharmacy_name || !address || !latitude || !longitude || !full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existingUser = await findPharmacyUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const pharmacy = await createPharmacy({
      name: pharmacy_name,
      address,
      latitude,
      longitude,
      phone,
      opening_hours: opening_hours ? JSON.stringify(opening_hours) : null
    })

    const password_hash = await bcrypt.hash(password, 12)
    const pharmacyUser = await createPharmacyUser({
      pharmacy_id: pharmacy.id,
      full_name,
      email,
      password_hash,
      role: 'owner'
    })

    const token = generatePharmacyToken({ ...pharmacyUser, pharmacy_id: pharmacy.id })

    res.status(201).json({
      message: 'Pharmacy registered successfully. Awaiting admin approval.',
      token,
      pharmacy,
      user: {
        id: pharmacyUser.id,
        full_name: pharmacyUser.full_name,
        email: pharmacyUser.email,
        role: pharmacyUser.role
      }
    })
  } catch (error) {
    console.error('Pharmacy register error:', error.message)
    res.status(500).json({ error: 'Server error during registration' })
  }
}

const loginPharmacy = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await findPharmacyUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!user.is_approved) {
      return res.status(403).json({ error: 'Your pharmacy is pending admin approval' })
    }

    const token = generatePharmacyToken(user)

    res.json({
      message: 'Login successful',
      token,
      pharmacy: {
        id: user.pharmacy_id,
        name: user.pharmacy_name
      },
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Pharmacy login error:', error.message)
    res.status(500).json({ error: 'Server error during login' })
  }
}

module.exports = { registerPharmacy, loginPharmacy }