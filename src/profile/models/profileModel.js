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
      ref: "Media",
    },

    coverImage: {
      type: Schema.Types.ObjectId,
      ref: "Media",
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
