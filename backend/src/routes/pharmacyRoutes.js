const express = require('express')
const router = express.Router()
const { registerPharmacy, loginPharmacy } = require('../controllers/pharmacyAuthController')
const { getInventory, addItem, updateItemQuantity, removeItem, getLowStockItems, getAvailability } = require('../controllers/inventoryController')
const { protect, requireRole } = require('../middleware/auth')

router.post('/register', registerPharmacy)
router.post('/login', loginPharmacy)

router.get('/inventory', protect, requireRole('pharmacy'), getInventory)
router.post('/inventory', protect, requireRole('pharmacy'), addItem)
router.patch('/inventory/:id/quantity', protect, requireRole('pharmacy'), updateItemQuantity)
router.delete('/inventory/:id', protect, requireRole('pharmacy'), removeItem)
router.get('/inventory/low-stock', protect, requireRole('pharmacy'), getLowStockItems)

router.get('/availability', getAvailability)

module.exports = router