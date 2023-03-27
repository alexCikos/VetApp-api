// Dependencies
const express = require("express")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const path = require("path")

// Schemas
const UserModel = require(".././models/User")
const PetModel = require(".././models/Pet")
const PlayDateModel = require(".././models/PlayDates")
const User = require(".././models/User")

// Route Function
const router = express.Router()

// Create web token function
const createToken = _id => {
  return jwt.sign({ _id }, "secret", { expiresIn: "3d" })
}

// ROUTES/CONTROLLER
// Creating a user
router.post("/signup", async (req, res) => {
  // Getting all the information from the client
  const { email, password, firstName, lastName, address, phoneNumber, pets, playDates } = req.body

  // Calling the sign up method, with the information from the client
  try {
    const user = await UserModel.signup(email, password, firstName, lastName, address, phoneNumber, pets, playDates)

    // Creating a token, with for the user, using the user id from the database
    const token = createToken(user._id)

    // Returning to the client, the email and token created
    res.status(200).json({ email, token })
  } catch (error) {
    // Returns an error if something goes wrong
    res.status(400).json({ error: error.message })
  }
})

// Login route
router.post("/login", async (req, res) => {
  // Getting the email and password from the client
  const { email, password } = req.body

  // Calling the login method with the email and password
  try {
    const user = await UserModel.login(email, password)
    // Creating a token with for the user, using the user id from the database
    const token = createToken(user._id)

    // Returning to the client, the email and token created
    res.status(200).json({ email, token })
  } catch (error) {
    // Returns an error if something goes wrong
    res.status(400).json({ error: error.message })
  }
})

// get a single owner
router.get("/getUser/:id", async (req, res) => {
  // The pet ID is found in the url parameter
  const { id } = req.params

  // A check to see if the ID is valid and exists
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No owner exists" })
  }

  // Looking for an existing pet document with the pet ID
  const user = await UserModel.findById(id)

  // If pet is false, it returns an error
  if (!user) {
    return res.status(404).json({ error: "No such pet exist" })
  }

  // Returns to the client the pet document
  res.status(200).json(user)
})

router.get("/public/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "..", "public", "uploads", req.params.filename)
  const contentType = "image/jpeg" // Set the correct MIME type for the file

  res.setHeader("Content-Type", contentType)
  res.sendFile(filePath)
})

module.exports = router
