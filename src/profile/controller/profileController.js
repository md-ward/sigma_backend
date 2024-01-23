const { NotificationStatus } = require("../../global/enums");
const {
  createNotification,
} = require("../../notifications/controllers/notificationController");

const Profile = require("../models/profileModel");

async function getProfiles(req, res) {
  const userId = req.userId;
  try {
    const userProfile = await Profile.findOne({ user: userId });

    let userFriendsId = userProfile.friends;
    userFriendsId = [...userFriendsId, userProfile._id];
    // console.log(userFriendsId);
    const profiles = await Profile.find({ _id: { $nin: userFriendsId } })
      .select("profileImage user ")
      .populate("profileImage", "originalUrl -_id")
      .populate("user", "first_name last_name -_id")

      .sort({ createdAt: -1 });
    // console.log(profiles);
    res.status(200).send({ profiles });
  } catch (error) {
    console.log(error);
    res.status(500).send({ errorMessage: error.message });
  }
}

async function getPersonalProfileDetails(req, res) {
  const userId = req.userId;
  try {
    const profile = await Profile.findOne(
      { user: userId },
      "-createdAt -updatedAt -__v",
      {
        populate: [
          { path: "profileImage", select: "originalUrl" },
          { path: "coverImage", select: "originalUrl" },
        ],
      }
    )
      // .populate("profileImage", "originalUrl")
      .populate("user", "-password -_id -__v -createdAt -token -profile")
      .populate({
        path: "friends",
        model: "Profile",
        select: "user profileImage coverImage",
        populate: [
          {
            path: "user",
            select: "first_name last_name -_id",
          },
          {
            path: "profileImage",
            select: "originalUrl",
          },
          {
            path: "coverImage",
            select: "originalUrl",
          },
        ],
      });

    if (!profile) {
      return res.status(404).send({ message: "User not found.. !" });
    }
    res.status(200).send(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send(error);
  }
}

async function completeProfile(req, res) {
  const userId = req.userId;
  let formData = req.body;

  try {
    const existingProfile = await Profile.findOne({
      user_name: formData.user_name,
    });
    if (existingProfile) {
      return res.status(409).send({ errorMessage: "User name already exists" });
    }

    // Add additional validation condition for user_name
    if (!/^[a-zA-Z0-9_]{3,15}$/.test(formData.user_name)) {
      return res.status(400).send({
        errorMessage:
          "Invalid user name. User names can only contain alphanumeric characters and underscores, and must be between 3 and 15 characters long.",
      });
    }
    formData.user = userId;
    console.log(formData);
    const newProfile = new Profile(formData);
    await newProfile.save();

    res.status(200).send({ message: "Profile created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error creating profile" });
  }
}

async function updateProfile(req, res) {
  const userId = req.user.userId;
  const { user_name, bio, website, location } = req.body;

  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).send({ errorMessage: "Profile not found" });
    }

    if (user_name) {
      const existingProfile = await Profile.findOne({ user_name });
      if (
        existingProfile &&
        existingProfile._id.toString() !== profile._id.toString()
      ) {
        return res
          .status(409)
          .send({ errorMessage: "User name already exists" });
      }

      // Add additional validation condition for user_name
      if (!/^[a-zA-Z0-9_]{3,15}$/.test(user_name)) {
        return res.status(400).send({
          errorMessage:
            "Invalid user name. User names can only contain alphanumeric characters and underscores, and must be between 3 and 15 characters long.",
        });
      }

      profile.user_name = user_name;
    }

    profile.bio = bio || profile.bio;
    profile.website = website || profile.website;
    profile.location = location || profile.location;
    await profile.save();

    res.status(200).send({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error updating profile" });
  }
}

async function sendFriendRequest(req, res) {
  try {
    const senderId = req.userId;

    const receiverProfileId = req.body.profileId;

    await createNotification(
      senderId,
      receiverProfileId,
      NotificationStatus.friend
    );
    res.status(200).send({ message: "Friend request sent successfully" });
  } catch (error) {
    // console.error(error);
    res.status(500).send({ errorMessage: error.message });
  }
}

module.exports = {
  getProfiles,
  getPersonalProfileDetails,
  sendFriendRequest,
  completeProfile,
  updateProfile,
};
