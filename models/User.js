// Dependencies
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const validator = require("validator")

// Schema template
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  pets: [
    {
      type: mongoose.Types.ObjectId,
      ref: "pet"
    }
  ],
  playDates: [
    {
      type: mongoose.Types.ObjectId,
      ref: "playDate"
    }
  ]
})

// Static sign up method
UserSchema.statics.signup = async function (email, password, firstName, lastName, address, phoneNumber, pets, playDates) {
  // Validator
  // Check to see if email and password have values
  if (!email || !password) {
    throw Error("All fields must be filled in")
  }

  // Checks if email is a valid email
  if (!validator.isEmail(email)) {
    throw Error("Invalid email")
  }

  // Checks if password is strong enough
  if (!validator.isStrongPassword(password)) {
    throw Error("Password is too weak")
  }

  // Looks for the document in the database with the email
  const exists = await this.findOne({ email })

  // if the exists has a value, it means that the email already exists
  if (exists) {
    throw Error("Email already in use")
  }

  // Method to secure the password, so actual password is not in the database
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  // Creates the user document, with all the fields
  const user = await this.create({ email, password: hash, firstName, lastName, address, phoneNumber, pets, playDates })

  // Will return the user document when the function is called
  return user
}

// static login method
UserSchema.statics.login = async function (email, password) {
  // Checks to see if email and password have values
  if (!email || !password) {
    throw Error("All fields must be filled in")
  }

  // Looks for the user in the database with email
  const user = await this.findOne({ email })

  // if the user is not found, returns error
  if (!user) {
    throw Error("Incorrect email")
  }

  // Compares the password hash in the database with the password from req.body
  const match = await bcrypt.compare(password, user.password)

  // if the match is false, returns error
  if (!match) {
    throw Error("Incorrect password")
  }

  // Will return the user document when the function is called
  return user
}

const User = mongoose.model("user", UserSchema)
module.exports = User
