const Profile = require("../../profile/models/profileModel");
const User = require("../../registeration/models/registeringModel");
const Notification = require("../model/notificationModel");

// Create a notification
async function createNotification(userId, type, name, senderProfileId) {
  try {
    switch (type) {
      case "New Post":
        break;

      case "Follow Requist":
        const notification = new Notification.Notification({
          toUser: userId,
          type: type,
          senderProfileId: senderProfileId,

          message: `${name} sent you a follow requist`,
        });
        await notification.save();
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create notification");
  }
}

// Get all notifications for a user
async function getNotifications(req, res) {
  try {
    const userId = req.userId;

    console.log(userId);
    // Find all notifications for the user
    const notifications = await Notification.Notification.find({
      toUser: userId,
    }).populate({
      path: "senderProfileId",
      select: "profileImage pendingFollowRequists ",
      populate: {
        path: "profileImage",
        model: "Images",
        select: "originalUrl -_id",
      },
    });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Failed to retrieve notifications" });
  }
}

// Mark a notification as read
async function markNotificationAsRead(req, res) {
  try {
    const notificationId = req.params.notificationId;

    // Find the notification by ID
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ errorMessage: "Notification not found" });
    }

    // Update the notification as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errorMessage: "Failed to mark notification as read" });
  }
}

async function respondToFollowRequestNotification(req, res) {
  try {
    const notificationId = req.body.notificationId;
    const followResponse = req.body.followResponse;
    console.log({ notificationId, followResponse });

    const notification =
      await Notification.Notification.findById(notificationId);
    const receiverProfile = await Profile.findOne({
      user: notification.toUser,
    });

    if (!notification) {
      return res.status(404).json({ errorMessage: "Notification not found" });
    }

    if (notification.type === "Follow Requist") {
      const senderProfileId = notification.senderProfileId;

      switch (followResponse) {
        case "accept":
          // Remove the pending request from receiver's profile
          receiverProfile.pendingFollowRequists =
            receiverProfile.pendingFollowRequists.filter(
              (id) => id.toString() !== senderProfileId.toString()
            );

          // Update followers and following for sender and receiver
          receiverProfile.followers.push(senderProfileId);
          const senderProfile = await Profile.findById(senderProfileId);
          senderProfile.following.push(receiverProfile._id);

          notification.isRead = true;

          await receiverProfile.save();
          await senderProfile.save();
          await notification.save();

          break;
        case "decline":
          // Remove the pending request from receiver's profile
          receiverProfile.pendingFollowRequists =
            receiverProfile.pendingFollowRequists.filter(
              (id) => id.toString() !== senderProfileId.toString()
            );

          notification.isRead = true;

          await receiverProfile.save();
          await notification.save();

          break;
        default:
          return res
            .status(400)
            .json({ errorMessage: "Invalid follow response" });
      }
    }

    return res
      .status(200)
      .json({ message: "Follow response processed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: "Something went wrong" });
  }
}
module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  respondToFollowRequestNotification,
};
