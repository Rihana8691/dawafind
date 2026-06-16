const express = require('express')
const router = express.Router()
const { search, getById, getByBarcode } = require('../controllers/drugController')

router.get('/search', search)
router.get('/barcode/:code', getByBarcode)
router.get('/:id', getById)

module.exports = router