const mongoose = require("mongoose");

const NotificationStatus = {
  follow: "Follow Requist",
  newPost: "New Post",
};

const NotificationSchema = new mongoose.Schema(
  {
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Follow Requist", "New Post"],
      required: false,
    },
    senderProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },

    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification, NotificationStatus };
