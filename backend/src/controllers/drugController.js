const { searchDrugs, getDrugById, getDrugByBarcode } = require('../models/drugModel')

const search = async (req, res) => {
  try {
    const { q } = req.query

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const drugs = await searchDrugs(q.trim())

    if (drugs.length === 0) {
      return res.status(404).json({ message: 'No drugs found matching your search' })
    }

    res.json({ count: drugs.length, drugs })
  } catch (error) {
    console.error('Search error:', error.message)
    res.status(500).json({ error: 'Server error during search' })
  }
}

const getById = async (req, res) => {
  try {
    const drug = await getDrugById(req.params.id)

    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' })
    }

    res.json(drug)
  } catch (error) {
    console.error('Get drug error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const getByBarcode = async (req, res) => {
  try {
    const drug = await getDrugByBarcode(req.params.code)

    if (!drug) {
      return res.status(404).json({ 
        found: false,
        message: 'Drug not found in database. Please enter details manually.' 
      })
    }

    res.json({ found: true, drug })
  } catch (error) {
    console.error('Barcode error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { search, getById, getByBarcode }