// Dependencies
const jwt = require("jsonwebtoken")

// Schemas
const User = require("../models/User")

// Function to verify user is authenticated
const requireAuth = async (req, res, next) => {
  // verify user is authenticated
  const { authorization } = req.headers

  // Checking if authorization has value, if not, it returns an error
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" })
  }

  // Grab the token out of the authorization header
  const token = authorization.split(" ")[1]

  // Try catch to verify the token and grab the user Id from the database
  try {
    const { _id } = jwt.verify(token, "secret")

    req.user = await User.findOne({ _id }).select("_id")
    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({ error: "Request is not authorized" })
  }
}

module.exports = requireAuth
