const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

require('./config/db')

const drugRoutes = require('./routes/drugRoutes')
const authRoutes = require('./routes/authRoutes')
const pharmacyRoutes = require('./routes/pharmacyRoutes')

app.use('/api/drugs', drugRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/pharmacy', pharmacyRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'DawaFind API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})