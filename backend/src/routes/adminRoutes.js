const express = require('express')
const router = express.Router()
const { getPending, approve, getAll, getAllDrugs } = require('../controllers/adminController')
const { protect, requireRole } = require('../middleware/auth')

router.use(protect)
router.use(requireRole('admin'))

router.get('/pharmacies/pending', getPending)
router.get('/pharmacies', getAll)
router.patch('/pharmacies/:id/approve', approve)
router.get('/drugs', getAllDrugs)

module.exports = router