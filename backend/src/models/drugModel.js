const pool = require('../config/db')

const searchDrugs = async (query) => {
  const result = await pool.query(
    `SELECT id, brand_name, generic_name, category, 
     dosage_form, strength, manufacturer, description
     FROM drugs
     WHERE 
       LOWER(brand_name) LIKE LOWER($1) OR 
       LOWER(generic_name) LIKE LOWER($1) OR
       barcode = $2
     ORDER BY brand_name ASC
     LIMIT 20`,
    [`%${query}%`, query]
  )
  return result.rows
}

const getDrugById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM drugs WHERE id = $1`,
    [id]
  )
  return result.rows[0]
}

const getDrugByBarcode = async (barcode) => {
  const result = await pool.query(
    `SELECT * FROM drugs WHERE barcode = $1`,
    [barcode]
  )
  return result.rows[0]
}

module.exports = { searchDrugs, getDrugById, getDrugByBarcode }