const { Schema, default: mongoose } = require("mongoose");

const ProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_name: {
      type: String,
      required: false,
    },

    profileImage: {
      type: Schema.Types.ObjectId,
      ref: "Images",
    },

    coverImage: {
      type: Schema.Types.ObjectId,
      ref: "Images",
    },

    bio: {
      type: String,
      required: false,
    },

    website: {
      type: String,
      required: false,
    },

    // location: {
    //   type: String,
    //   required: false,
    // },

    pendingFollowRequists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Profile",
      },
    ],

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
