const {
  createNotification,
} = require("../../notifications/controllers/notificationController");
const Profile = require("../../profile/models/profileModel");
const User = require("../../registeration/models/registeringModel");
const Post = require("../model/postModel");

//!  get user posts
async function getPosts(req, res) {
  const user = req.userId;
  try {
    const posts = await Post.find({ user });

    res.status(201).send({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error adding post" });
  }
}
// Add a new post
async function addPost(req, res) {
  const user = req.userId;
  const userName = User.findById(user);
  const content = req.body.content;
  try {
    const post = new Post({
      user,
      content,
    });

    await post.save();

    await createNotification(user, `your friend ${user}`);

    res.status(201).send({ message: "Post added successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error adding post" });
  }
}

// Update an existing post
async function updatePost(req, res) {
  const postId = req.params.postId;
  const { content } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { content, updatedAt: Date.now() },
      { new: true }
    );

    if (!post) {
      return res.status(404).send({ errorMessage: "Post not found" });
    }

    res.status(200).send({ message: "Post updated successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error updating post" });
  }
}

// Delete a post
async function deletePost(req, res) {
  const postId = req.params.postId;

  try {
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).send({ errorMessage: "Post not found" });
    }

    res.status(200).send({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error deleting post" });
  }
}

// todo: issue in finding posts ,replace following profile ids by user ids .... or find anothe way 
async function getVariousPosts(req, res) {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = parseInt(req.query.limit) || 10; // Number of posts per page

  try {
    // Retrieve user's followers and following
    let user = await Profile.findOne({ user: userId });
    let followers = ["659a81e6dcfe39e44410cfe5"];
    let following = user.following || [];
    console.log({ user, followers, following });
    // Combine followers and following arrays
    const connections = [...followers, ...following, userId];

    const count = await Post.countDocuments({
      _id: { $in: connections },
    }); // Total number of posts for connections with a public accountStatus

    const totalPages = Math.ceil(count / limit); // Total number of pages

    const posts = await Post.find({
      user: { $in: connections },
    })
      .populate("user", "first_name last_name profile")
      .skip((page - 1) * limit) // Skip posts based on the current page and limit
      .limit(limit) // Limit the number of posts per page
      .sort({ createdAt: -1 }); // Sort posts by createdAt field in descending order

    res.status(200).send({ posts, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error retrieving posts" });
  }
}
module.exports = { addPost, getPosts, updatePost, deletePost, getVariousPosts };
