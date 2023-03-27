// Dependencies
const mongoose = require("mongoose")

// Schema template
const PetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: "",
    required: true
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "user"
  }
})

const Pet = mongoose.model("pet", PetSchema)
module.exports = Pet
