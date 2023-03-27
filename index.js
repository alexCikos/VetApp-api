// Dependencies
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")

// Imported Routes
const userRoutes = require("./routes/userRoutes")
const petRoutes = require("./routes/petRoutes")
const playDateRoutes = require("./routes/playDateRoutes")

// Middleware
app.use(express.json())
app.use(express.static("public"))
app.use(cors())

// Database connection
mongoose.connect("mongodb+srv://cikos:cikos@vetplaydates.ee8yujh.mongodb.net/?retryWrites=true&w=majority")

// ROUTES
app.use(userRoutes)
app.use(petRoutes)
app.use(playDateRoutes)

// Start the Server
app.listen(process.env.PORT, () => {
  console.log("Server is running on 3001")
})
