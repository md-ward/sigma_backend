const {
  createNotification,
} = require("../../notifications/controllers/notificationController");
const Notification = require("../../notifications/model/notificationModel");
const Profile = require("../models/profileModel");

async function getProfileDetails(req, res) {
  const profileId = req.params.profileId;
  try {
    const profile = await Profile.findById(profileId).populate(
      "profileImage",
      "originalUrl"
    );

    if (!profile) {
      return res.status(404).send({ message: "User not found.. !" });
    }

    res.status(200).send(profile);
  } catch (error) {
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

async function sendFollowRequest(req, res) {
  try {
    const senderId = req.userId;

    const receiverProfileId = req.body.profileId;

    const senderProfile = await Profile.findOne({ user: senderId });

    const receiverProfile = await Profile.findById(receiverProfileId);
    if (receiverProfile) {
      receiverProfile.pendingFollowRequists.push(senderProfile._id);
      await receiverProfile.save();

      const senderName = await senderProfile.populate(
        "user",
        "first_name last_name"
      );

      await createNotification(
        receiverProfile.user,
        Notification.NotificationStatus.follow,
        senderName.user.first_name + " " + senderName.user.last_name,
        senderProfile._id
      );

      res.status(200).send({ message: "Follow request sent successfully" });
    } else {
      return res.status(404).send({ errorMessage: "Profile not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error sending follow request" });
  }
}

module.exports = {
  sendFollowRequest,
  completeProfile,
  updateProfile,
  getProfileDetails,
};
