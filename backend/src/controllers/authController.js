const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { createUser, findUserByEmail, findUserById } = require('../models/userModel')

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const register = async (req, res) => {
  try {
    const { full_name, email, password, role, phone } = req.body

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const user = await createUser({ full_name, email, password_hash, role, phone })
    const token = generateToken(user)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({ error: 'Server error during registration' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({ error: 'Server error during login' })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Profile error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { register, login, getProfile }