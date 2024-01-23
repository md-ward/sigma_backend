const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/registeringModel");
const Profile = require("../../profile/models/profileModel");
const Images = require("../../media/model/mediaModel");
const path = require("path");
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
    let user = new User(formData);
    await user.save();

    // Generate the username
    const generatedUsername = generateUsername(
      formData.first_name,
      formData.last_name
    );

    const token = jwt.sign({ userId: user._id }, process.env.USER_SECRET_KEY, {
      expiresIn: "30d",
    });

    // Set the initial profile image based on the user's gender
    let imageFileName = "";
    if (user.gender === "male") {
      imageFileName = "male1.png";
    } else {
      imageFileName = "female1.png";
    }

    const imagePath = path.join("../uploads/defaults", imageFileName);
    const coverImagePath = path.join(
      "../uploads/defaults",
      "default_cover.jpg"
    );

    const originalUrl = new URL(
      imagePath,
      `${req.protocol}://${req.get("host")}`
    );
    const coverUrl = new URL(
      coverImagePath,
      `${req.protocol}://${req.get("host")}`
    );
    console.log(coverUrl);
    let newUserDefaultProfileImage;
    let newUserDefaultCoverImage;

    const isProfileImageInit = await Images.findOne({ originalUrl });
    const isCoverImageInit = await Images.findOne({ originalUrl: coverUrl });

    if (isProfileImageInit) {
      newUserDefaultProfileImage = isProfileImageInit._id;
    } else {
      let initNewProfileImage = new Images({
        user: user._id,
        originalUrl: originalUrl,
      });
      await initNewProfileImage.save();
      newUserDefaultProfileImage = initNewProfileImage._id;
    }

    if (isCoverImageInit) {
      newUserDefaultCoverImage = isCoverImageInit._id;
    } else {
      let initNewCoverImage = new Images({
        user: user._id,
        originalUrl: coverUrl,
      });
      await initNewCoverImage.save();
      newUserDefaultCoverImage = initNewCoverImage._id;
    }

    // Wait for saving the initial profile image and saving the profile
    const [profile] = await Promise.all([
      new Profile({
        user: user._id,
        user_name: generatedUsername,
        profileImage: newUserDefaultProfileImage,
        coverImage: newUserDefaultCoverImage,
      }).save(),
    ]);
    user.profile = profile._id;
    user.token = token;
    await user.save();
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
