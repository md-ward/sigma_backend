const { Schema, default: mongoose } = require("mongoose");

const PostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: false,
    },

    likesCount: {
      type: Schema.Types.Number,
      default: 0,

    },
    commentsCount: {
      type: Schema.Types.Number,
      default: 0,
    },

    attachedImages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Images",
      },
    ],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
