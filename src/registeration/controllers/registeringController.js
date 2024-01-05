const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/registeringModel");
const Profile = require("../../profile/models/profileModel");

//! generate initial username ...........

function generateUsername(firstName, lastName) {
  // Remove any spaces and convert names to lowercase
  const sanitizedFirstName = firstName.trim().toLowerCase();
  const sanitizedLastName = lastName.trim().toLowerCase();

  // Generate a random number between 100 and 999
  const randomNumbers = Math.floor(Math.random() * 900) + 100;

  // Combine the first name, last name, and random numbers
  const username = sanitizedFirstName + sanitizedLastName + randomNumbers;

  return username;
}

// !create new account and init user profile ............
async function createUser(req, res) {
  let formData = req.body;
  console.log(req.body);
  try {
    const existingUser = await User.findOne({ email: formData.email });
    if (existingUser) {
      return res.status(409).send({ errorMessage: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formData.password, salt);
    formData.password = hashedPassword;
    formData.dateOfBirth = new Date(formData.dateOfBirth);
    const user = new User(formData);
    await user.save();
    var x = String();

    // Generate the username
    const generatedUsername = generateUsername(
      formData.first_name,
      formData.last_name
    );

    const token = jwt.sign({ userId: user._id }, process.env.USER_SECRET_KEY, {
      expiresIn: "30d",
    });

    const profile = new Profile({
      user: user._id,
      user_name: generatedUsername,
      followers: [],
      following: [],
    });

    await profile.save();
    res.status(201).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error registering user" });
  }
}

async function login(req, res) {
  const formData = req.body;
  try {
    console.log(formData);
    const user = await User.findOne({
      $or: [{ email: formData.email }],
    });
    if (!user) {
      return res
        .status(401)
        .send({ errorMessage: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(formData.password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .send({ errorMessage: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.USER_SECRET_KEY, {
      expiresIn: "30d",
    });
    user.token = token;
    await user.save();
    // sendCookie(res, "jwt_user", token);
    res.status(200).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error logging in" });
  }
}

module.exports = { createUser, login };
