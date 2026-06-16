const { getInventoryByPharmacy, addInventoryItem, updateQuantity, removeInventoryItem, getLowStock, getPharmaciesWithDrug } = require('../models/inventoryModel')
const getInventory = async (req, res) => {
  try {
    const pharmacy_id = req.user.pharmacy_id
    const items = await getInventoryByPharmacy(pharmacy_id)
    res.json({ count: items.length, inventory: items })
  } catch (error) {
    console.error('Get inventory error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const addItem = async (req, res) => {
  try {
    const { drug_id, quantity, price, low_stock_threshold } = req.body
    const pharmacy_id = req.user.pharmacy_id
    const updated_by = req.user.id

    if (!drug_id || quantity === undefined) {
      return res.status(400).json({ error: 'drug_id and quantity are required' })
    }

    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' })
    }

    const item = await addInventoryItem({
      pharmacy_id,
      drug_id,
      quantity,
      price,
      low_stock_threshold,
      updated_by
    })

    res.status(201).json({ message: 'Inventory updated successfully', item })
  } catch (error) {
    console.error('Add inventory error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const updateItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body
    const { id } = req.params
    const pharmacy_id = req.user.pharmacy_id
    const updated_by = req.user.id

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' })
    }

    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' })
    }

    const item = await updateQuantity({ id, pharmacy_id, quantity, updated_by })

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' })
    }

    res.json({ message: 'Quantity updated', item })
  } catch (error) {
    console.error('Update quantity error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const removeItem = async (req, res) => {
  try {
    const { id } = req.params
    const pharmacy_id = req.user.pharmacy_id

    const deleted = await removeInventoryItem(id, pharmacy_id)

    if (!deleted) {
      return res.status(404).json({ error: 'Inventory item not found' })
    }

    res.json({ message: 'Item removed from inventory' })
  } catch (error) {
    console.error('Remove inventory error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}

const getLowStockItems = async (req, res) => {
  try {
    const pharmacy_id = req.user.pharmacy_id
    const items = await getLowStock(pharmacy_id)
    res.json({ count: items.length, items })
  } catch (error) {
    console.error('Low stock error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}
const getAvailability = async (req, res) => {
  try {
    const { drug_id } = req.query

    if (!drug_id) {
      return res.status(400).json({ error: 'drug_id is required' })
    }

    const pharmacies = await getPharmaciesWithDrug(drug_id)

    if (pharmacies.length === 0) {
      return res.status(404).json({ 
        message: 'No pharmacies currently have this drug in stock' 
      })
    }

    res.json({ count: pharmacies.length, pharmacies })
  } catch (error) {
    console.error('Availability error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
}
module.exports = { 
  getInventory, 
  addItem, 
  updateItemQuantity, 
  removeItem, 
  getLowStockItems,
  getAvailability
}