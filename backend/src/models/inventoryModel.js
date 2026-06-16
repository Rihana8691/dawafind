const pool = require('../config/db')

const getInventoryByPharmacy = async (pharmacy_id) => {
  const result = await pool.query(
    `SELECT i.id, i.quantity, i.price, i.stock_status, i.low_stock_threshold, i.last_updated,
            d.brand_name, d.generic_name, d.category, d.dosage_form, d.strength, d.barcode
     FROM inventory i
     JOIN drugs d ON i.drug_id = d.id
     WHERE i.pharmacy_id = $1
     ORDER BY d.brand_name ASC`,
    [pharmacy_id]
  )
  return result.rows
}

const addInventoryItem = async ({ pharmacy_id, drug_id, quantity, price, low_stock_threshold, updated_by }) => {
  const stock_status = quantity === 0 ? 'out' : quantity <= low_stock_threshold ? 'low' : 'in'

  const result = await pool.query(
    `INSERT INTO inventory (pharmacy_id, drug_id, quantity, price, stock_status, low_stock_threshold, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (pharmacy_id, drug_id)
     DO UPDATE SET quantity = $3, price = $4, stock_status = $5, 
                   low_stock_threshold = $6, last_updated = NOW(), updated_by = $7
     RETURNING *`,
    [pharmacy_id, drug_id, quantity, price, stock_status, low_stock_threshold || 10, updated_by]
  )
  return result.rows[0]
}

const updateQuantity = async ({ id, pharmacy_id, quantity, updated_by }) => {
  const item = await pool.query(
    `SELECT low_stock_threshold FROM inventory WHERE id = $1 AND pharmacy_id = $2`,
    [id, pharmacy_id]
  )

  if (item.rows.length === 0) return null

  const threshold = item.rows[0].low_stock_threshold
  const stock_status = quantity === 0 ? 'out' : quantity <= threshold ? 'low' : 'in'

  const result = await pool.query(
    `UPDATE inventory 
     SET quantity = $1, stock_status = $2, last_updated = NOW(), updated_by = $3
     WHERE id = $4 AND pharmacy_id = $5
     RETURNING *`,
    [quantity, stock_status, updated_by, id, pharmacy_id]
  )
  return result.rows[0]
}

const removeInventoryItem = async (id, pharmacy_id) => {
  const result = await pool.query(
    `DELETE FROM inventory WHERE id = $1 AND pharmacy_id = $2 RETURNING id`,
    [id, pharmacy_id]
  )
  return result.rows[0]
}

const getLowStock = async (pharmacy_id) => {
  const result = await pool.query(
    `SELECT i.id, i.quantity, i.low_stock_threshold, i.stock_status, i.last_updated,
            d.brand_name, d.generic_name, d.category
     FROM inventory i
     JOIN drugs d ON i.drug_id = d.id
     WHERE i.pharmacy_id = $1 AND i.stock_status IN ('low', 'out')
     ORDER BY i.stock_status DESC, d.brand_name ASC`,
    [pharmacy_id]
  )
  return result.rows
}
const getPharmaciesWithDrug = async (drug_id) => {
  const result = await pool.query(
    `SELECT 
      p.id as pharmacy_id,
      p.name as pharmacy_name,
      p.address,
      p.latitude,
      p.longitude,
      p.phone,
      p.opening_hours,
      i.quantity,
      i.price,
      i.stock_status,
      i.last_updated
     FROM inventory i
     JOIN pharmacies p ON i.pharmacy_id = p.id
     WHERE i.drug_id = $1
       AND p.is_approved = true
       AND i.stock_status != 'out'
     ORDER BY i.stock_status ASC, p.name ASC`,
    [drug_id]
  )
  return result.rows
}
module.exports = { 
  getInventoryByPharmacy, 
  addInventoryItem, 
  updateQuantity, 
  removeInventoryItem, 
  getLowStock,
  getPharmaciesWithDrug
}