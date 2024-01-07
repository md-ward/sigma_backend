const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: false,
  },
  accountStatus: {
    type: String,
    required: false,
    enum: ["Public", "Privet"],
    default: "Public",
  },

  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },

  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: false,
  },
});
const User = mongoose.model("User", UserSchema);
module.exports = User;
