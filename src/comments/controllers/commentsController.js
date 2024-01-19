const Post = require("../../post/model/postModel");
const Comments = require("../models/commentsModel");

async function addComment(req, res) {
  const { postId, commentText } = req.body;
  const userId = req.userId;

  try {
    const comment = new Comments({
      user: userId,
      post: postId,
      comment: commentText,
    });
    await comment.save();

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    res.status(201).send({ post, comment });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message + "Failed to add comment" });
  }
}

async function getPostComments(req, res) {
  const postId = req.params.postId;
  try {
    const limit = 5;
    const comments = await Comments.find({ post: postId });
    res.status(200).send(comments);
  } catch (error) {
    console.log(error);
    res.status(500).send({ errorMessage: error.message });
  }
}

module.exports = { addComment, getPostComments };
