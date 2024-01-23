const Post = require("../../post/model/postModel");
const Comments = require("../models/commentsModel");

async function addComment(req, res) {
  const { postId, commentText } = req.body;
  const userId = req.userId;
  console.log({ userId, postId, commentText });
  try {
    let comment = new Comments({
      user: userId,
      post: postId,
      comment: commentText,
    });
    await comment.save();

    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment._id, $inc: { commentsCount: 1 } } },
      { new: true }
    );
    await comment.populate({
      path: "user",
      select: "first_name last_name  profile -_id ",
      populate: {
        path: "profile",
        select: "profileImage",
        populate: { path: "profileImage", select: "originalUrl -_id" },
      },
    });
    res.status(201).send(comment);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message + "Failed to add comment" });
  }
}

async function getPostComments(req, res) {
  const postId = req.params.postId;
  try {
    const limit = 5;
    const comments = await Comments.find({ post: postId }, "-post").populate({
      path: "user",
      select: "first_name last_name   profile -_id ",
      populate: {
        path: "profile",
        select: "profileImage",
        populate: { path: "profileImage", select: "originalUrl -_id" },
      },
    });
    res.status(200).send(comments);
  } catch (error) {
    console.log(error);
    res.status(500).send({ errorMessage: error.message });
  }
}

module.exports = { addComment, getPostComments };
