// Dependencies
const express = require("express")
const mongoose = require("mongoose")
const path = require("path")

// Schemas
const UserModel = require(".././models/User")
const PetModel = require(".././models/Pet")
const PlayDateModel = require(".././models/PlayDates")

// Route Function
const router = express.Router()

// Middleware
const requireAuth = require("../middleware/requireAuth")
const multerMiddleware = require("../middleware/multerMiddleware")
router.use(requireAuth)

// ROUTES
// get all pets
router.get("/getPets", async (req, res) => {
  // The owner id is found within the token, here can be accessed
  const owner = req.user._id

  // Here we are looking for documents in the Pet collection, with the owner id
  const pets = await PetModel.find({ owner }).sort({ createdAt: -1 })

  // Here we return to the client the pet documents that are found in the collection
  res.status(200).json(pets)
})

// get a single pet
router.get("/getPet/:id", async (req, res) => {
  // The pet ID is found in the url parameter
  const { id } = req.params

  // A check to see if the ID is valid and exists
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No pet exists" })
  }

  // Looking for an existing pet document with the pet ID
  const pets = await PetModel.findById(id)

  // If pet is false, it returns an error
  if (!pets) {
    return res.status(404).json({ error: "No such pet exist" })
  }

  // Returns to the client the pet document
  res.status(200).json(pets)
})

// create a pet
router.post("/createPet", multerMiddleware.single("photo"), async (req, res) => {
  // Grabbing from the client infomation to put into the pet document
  const { name, breed, age } = req.body
  // get the path of the uploaded photo
  const photo = req.file.path

  // A try/catch method to create a new pet document, with the information provided
  // a then returning to the client the pet document
  try {
    const owner = req.user._id
    const pet = await PetModel.create({ name, breed, age, owner, photo })
    res.status(200).json(pet)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
// delete a pet
router.delete("/deletePet/:id", async (req, res) => {
  // Grabbing the pet document id from the the url parameter
  const { id } = req.params

  // Checking if the ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" })
  }

  // Looking for the pet document with ID and then deleting it
  const pet = await PetModel.findOneAndDelete({ _id: id })

  // Returing an error if pet is false
  if (!pet) {
    return res.status(400).json({ error: "No such pet" })
  }

  // Returning to the client the pet
  res.status(200).json(pet)
})

router.patch("/updatePet/:id", async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such workout" })
  }

  const pet = await PetModel.findOneAndUpdate(
    { _id: id },
    {
      ...req.body
    }
  )

  if (!pet) {
    return res.status(400).json({ error: "No such pet" })
  }

  res.status(200).json(pet)
})

router.get("/", async (req, res) => {
  const { q } = req.query

  const keys = ["name", "breed", "age"]

  const search = async () => {
    const query = q ? { $or: keys.map(key => ({ [key]: new RegExp(q, "i") })) } : {}
    return await PetModel.find(query).limit(10)
  }

  try {
    const data = await search()
    res.json(data)
  } catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error")
  }
})

router.get("/getCurrentUser", async (req, res) => {
  const id = req.user._id

  const currentUser = await UserModel.findById(id)

  res.status(200).json(currentUser)
})

// Creating a pet
// router.post("/createPet", async (req, res) => {
//   const { name, breed, age } = req.body

//   try {
//     const userId = req.user_id
//     const pet = await PetModel.create({ name, breed, age, owner: userId })
//     const updatedUser = await UserModel.findByIdAndUpdate(userId, { $push: { pets: pet._id } }, { new: true }).populate("pets")
//     res.status(200).json(pet)
//   } catch (error) {
//     res.status(400).json({ error: error.message })
//   }
// })

// // Get Pets
// router.get("/getPet", async (req, res) => {
//   const { id } = req.params

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "No such pets" })
//   }

//   const pets = await PetModel.findById(id)

//   if (!pets) {
//     return res.status(404).json({ error: "No such workout" })
//   }

//   res.status(200).json(pets)
// })

// router.post("/createPet/:userId", async (req, res) => {
//   const userId = req.params.userId
//   const pet = req.body
//   pet.owner = userId

//   const newPet = new PetModel(pet)
//   await newPet.save()

//   const updatedUser = await UserModel.findByIdAndUpdate(userId, { $push: { pets: newPet._id } }, { new: true }).populate("pets")

//   res.json(updatedUser)
// })

// Get user pets
// Search for pets

module.exports = router
