const Profile = require("../../profile/models/profileModel");
const {
  Notification,
  NotificationStatus,
} = require("../model/notificationModel");

// ! create notification........type : New post / new friend requist ..
async function createNotification(
  senderUserId,
  receiverProfileId,
  type,
  postId
) {
  try {
    // console.log(type);

    const senderProfile = await Profile.findOne({
      user: senderUserId,
    }).populate("user", "first_name last_name -_id");
    const receiverProfile = await Profile.findById(receiverProfileId);

    if (!receiverProfile) {
      throw new Error("Profile not found");
    }

    const senderName = `${senderProfile.user.first_name} ${senderProfile.user.last_name}`;

    switch (type) {
      case "New Post":
        const isPostNotificationAlreadyExist = await Notification.exists({
          toUser: receiverProfile.user,
          senderProfileId: senderProfile._id,
          type,
          postId,
        });

        if (isPostNotificationAlreadyExist) {
          throw new Error("already  sent for this post");
        }

        await Notification.create({
          toUser: receiverProfile.user,
          type: type,
          senderProfileId: senderProfile._id,
          message: `your friend ${senderName} added new post`,
          postId,
        }).then((notification) => notification.save());
        return;

      case "Friend Request":
        const isfriendNotificationAlreadyExist = await Notification.exists({
          toUser: receiverProfile.user,
          senderProfileId: senderProfile._id,
          type,
        });

        if (isfriendNotificationAlreadyExist) {
          throw new Error("Friend request already sent");
        }

        receiverProfile.pendingFrindshipRequists.push(senderProfile._id);
        await receiverProfile.save();

        await Notification.create({
          toUser: receiverProfile.user,
          type: type,
          senderProfileId: senderProfile._id,
          message: `${senderName} sent you a friend request`,
        }).then((notification) => notification.save());
        return;

      default:
        throw new Error("Invalid notification type");
    }
  } catch (error) {
    // console.error(error);
    throw error;
  }
}

//! Get all notifications for a user
async function getNotifications(req, res) {
  try {
    const userId = req.userId;

    // Find all notifications for the user
    const notifications = await Notification.find(
      {
        toUser: userId,
      },
      "-toUser"
    )
      .populate({
        path: "senderProfileId",
        select: "profileImage pendingFrindshipRequists ",
        populate: {
          path: "profileImage",
          model: "Images",
          select: "originalUrl -_id",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Failed to retrieve notifications" });
  }
}

//! Mark a notification as read
async function markNotificationAsRead(req, res) {
  try {
    const notificationId = req.body.notificationId;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
      },
      { new: true }
    ).populate({
      path: "senderProfileId",
      select: "profileImage pendingFrindshipRequists",
      populate: {
        path: "profileImage",
        model: "Images",
        select: "originalUrl -_id",
      },
    });
    if (!notification) {
      return res.status(404).json({ errorMessage: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ errorMessage: "Failed to mark notification as read" });
  }
}

async function respondToFriendRequestNotification(req, res) {
  try {
    const notificationId = req.body.notificationId;
    const friendResponse = req.body.friendResponse;
    const userId = req.userId;

    const notification = await Notification.findById(notificationId);
    const receiverProfile = await Profile.findOne({
      user: userId,
    });
    console.log({ notificationId, friendResponse, receiverProfile });

    if (notification.toUser != userId) {
      return res.status(404).json({ errorMessage: "unauthorized user " });
    }
    if (!notification) {
      return res.status(404).json({ errorMessage: "Notification not found" });
    }

    if (notification.isRead && notification.type == NotificationStatus.friend) {
      return res
        .status(500)
        .send({ errorMessage: "Already responded to this friend request" });
    }

    if (notification.type === NotificationStatus.friend) {
      const senderProfileId = notification.senderProfileId;

      switch (friendResponse) {
        case "accept":
          // Remove the pending request from receiver's profile
          receiverProfile.pendingFrindshipRequists =
            receiverProfile.pendingFrindshipRequists.filter(
              (id) => id.toString() !== senderProfileId.toString()
            );

          // Update frienders and friending for sender and receiver
          receiverProfile.friends.push(senderProfileId);
          const senderProfile = await Profile.findById(senderProfileId);
          senderProfile.friends.push(receiverProfile._id);

          notification.isRead = true;

          await receiverProfile.save();
          await senderProfile.save();
          await notification.save();

          break;
        case "decline":
          // Remove the pending request from receiver's profile
          receiverProfile.pendingFrindshipRequists =
            receiverProfile.pendingFrindshipRequists.filter(
              (id) => id.toString() !== senderProfileId.toString()
            );

          notification.isRead = true;

          await receiverProfile.save();
          await notification.save();

          break;
        default:
          return res
            .status(400)
            .json({ errorMessage: "Invalid friend response" });
      }
    }

    return res
      .status(200)
      .json({ message: "friend response processed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: "Something went wrong" });
  }
}
module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  respondToFriendRequestNotification,
};
