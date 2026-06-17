const { getPendingPharmacies, approvePharmacy, getAllPharmacies } = require('../models/pharmacyModel')
const pool = require('../config/db')

const getPending = async (req, res) => {
  try {
    const pharmacies = await getPendingPharmacies()
    res.json({ count: pharmacies.length, pharmacies })
  } catch (error) {
    console.error('Get pending error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const approve = async (req, res) => {
  try {
    const { id } = req.params
    const pharmacy = await approvePharmacy(id)
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' })
    }
    res.json({ message: 'Pharmacy approved successfully', pharmacy })
  } catch (error) {
    console.error('Approve error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const getAll = async (req, res) => {
  try {
    const pharmacies = await getAllPharmacies()
    res.json({ count: pharmacies.length, pharmacies })
  } catch (error) {
    console.error('Get all error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const getAllDrugs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, brand_name, generic_name, category, 
              dosage_form, strength, manufacturer, source, created_at 
       FROM drugs ORDER BY brand_name ASC`
    )
    res.json({ count: result.rows.length, drugs: result.rows })
  } catch (error) {
    console.error('Get drugs error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { getPending, approve, getAll, getAllDrugs }