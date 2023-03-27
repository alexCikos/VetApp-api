// Dependencies
const express = require("express")

// Schemas
const UserModel = require(".././models/User")
const PetModel = require(".././models/Pet")
const PlayDateModel = require(".././models/PlayDates")

// Route Function
const router = express.Router()

// Middleware
const requireAuth = require("../middleware/requireAuth")
router.use(requireAuth)

// ROUTES
// Creating a play date to send
router.post("/sendPlayDate/:recipientId", async (req, res) => {
  // Grabbing the sender and recipient IDs from from the url
  const senderId = req.user._id
  const recipientId = req.params.recipientId

  // Querying the database if playdate already exsists
  const existingPlayDate = await PlayDateModel.findOne({
    sender: senderId,
    recipient: recipientId,
    status: "pending"
  })

  // Checking if it exists already, if it exists it returns an error message
  if (existingPlayDate) {
    return res.status(400).json({
      error: "A play date request is already pending between these users."
    })
  }

  // Grabbing information from the client for the play date
  playDate = req.body

  // Using the url parameters to set values for these play date fields
  playDate.sender = senderId
  playDate.recipient = recipientId

  // Saving the play date into the database
  const newPlayDate = new PlayDateModel(playDate)
  await newPlayDate.save()

  // Updating the User documents to push in the play date that was created, into the playDate field
  const upDatedSender = await UserModel.findByIdAndUpdate(senderId, { $push: { playDates: newPlayDate._id } }, { new: true }).populate("playDates")
  const upDatedRecipient = await UserModel.findByIdAndUpdate(recipientId, { $push: { playDates: newPlayDate._id } }, { new: true }).populate("playDates")

  // Sending back to the client the play date that was just created
  res.json(newPlayDate)
})

// Get user play dates
router.get("/getUserPlaydates", async (req, res) => {
  // Grabbing the userId from the url
  const userId = req.user._id

  // Finding the user document, then populating the playDates array, so all the information shows
  // when responding back to the client, otherwise it just shows the object Id
  const user = await UserModel.findById(userId).populate("playDates")

  // Sending back to the client the user playdates object array
  res.json(user.playDates)
})

// Accept the play date
router.patch("/acceptPlayDate/:playDateId", async (req, res) => {
  // Grabbing the play date Object Id from the url
  const playDateId = req.params.playDateId

  // Updating the play date document
  const updatedPlayDate = await PlayDateModel.findByIdAndUpdate(playDateId, { status: "accepted" }, { new: true })

  // Sending back to the client the updated play date
  res.json(updatedPlayDate)
})

// Reject the play date
router.patch("/rejectPlayDate/:playDateId", async (req, res) => {
  // Grabbing the play date Object Id from the url
  const playDateId = req.params.playDateId

  // Updating the play date document
  const updatedPlayDate = await PlayDateModel.findByIdAndUpdate(playDateId, { status: "rejected" }, { new: true })

  // Sending back to the client the updated play date
  res.json(updatedPlayDate)
})

// Delete the play date
router.delete("/deletePlayDate/:playDateId", async (req, res) => {
  // Grabbing the play date Object Id from the url
  const playDateId = req.params.playDateId

  // Finding he play date document
  const playDate = await PlayDateModel.findById(playDateId)

  // Acessing the play dates values
  const senderId = playDate.sender
  const recipientId = playDate.recipient

  // Check if play date ID is present in the sender's playDates array and remove it if it is
  const sender = await UserModel.findById(senderId)
  if (sender.playDates.includes(playDateId)) {
    await UserModel.findByIdAndUpdate(senderId, { $pull: { playDates: playDateId } })
  }

  // Check if play date ID is present in the recipient's playDates array and remove it if it is
  const recipient = await UserModel.findById(recipientId)
  if (recipient.playDates.includes(playDateId)) {
    await UserModel.findByIdAndUpdate(recipientId, { $pull: { playDates: playDateId } })
  }

  // Remove the play date document
  await PlayDateModel.findByIdAndDelete(playDateId)

  // Sending back to the client a success message
  res.json({ message: "Play date deleted successfully" })
})

// Exporting the router
module.exports = router
