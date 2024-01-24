const { NotificationStatus } = require("../../global/enums");
const {
  createNotification,
} = require("../../notifications/controllers/notificationController");
const Profile = require("../../profile/models/profileModel");
// const User = require("../../registeration/models/registeringModel");
const PostServiceInstance = require("../../webSockets/controllers/postsWebSocketController");
const Post = require("../model/postModel");

//!  get user posts
async function getPersonalProfilePosts(req, res) {
  const user = req.userId;
  try {
    const posts = await Post.find({ user })
      .populate({
        path: "user",
        select: "first_name last_name  profile -_id",
        populate: {
          path: "profile",
          select: "profileImage user_name -_id",
          populate: {
            path: "profileImage",
            select: "thumbnailUrl originalUrl -_id",
          },
        },
      })
      .populate("attachedImages", "-_id -_createdAt -__v -uploadedAt")
      .sort({ createdAt: -1 });
    console.log({ posts });
    res.status(201).send({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error adding post" });
  }
}
//!  get single post details...
async function getSinglePost(req, res) {
  const user = req.userId;
  const postId = req.params.postId;
  console.log("post", postId);
  try {
    const post = await Post.findById(postId)
      .populate({
        path: "user",
        select: "first_name last_name",
        populate: {
          path: "profile",
          select: "profileImage user_name",
          populate: {
            path: "profileImage",
            select: "originalUrl ",
          },
        },
      })
      .populate("attachedImages", "originalUrl -_id");
    res.status(201).send({ post });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error post data ..." });
  }
}

async function addPost(req, res) {
  const user = req.userId;
  const content = req.body.content;
  const attachedImages = req.imageIds;

  try {
    const post = new Post({
      user,
      content,
      attachedImages,
    });

    await post.save();
    const newPost = await post.populate([
      {
        path: "user",
        select: "first_name last_name  profile -_id",
        populate: {
          path: "profile",
          select: "profileImage user_name -_id",
          populate: {
            path: "profileImage",
            select: "thumbnailUrl originalUrl -_id",
          },
        },
      },
      {
        path: "attachedImages",
        select: "-_id -_createdAt -__v -uploadedAt",
      },
    ]);

    const userProfile = await Profile.findOne({ user }).populate({
      path: "friends",
      model: "Profile",
      select: "user",
    });
    // console.log({ userProfile, friends: userProfile.friends });

    const createNotifications = userProfile.friends.map(async (friend) => {
      createNotification(user, friend, NotificationStatus.newPost, post._id);
      PostServiceInstance.sendNewpostUpdate(String(friend.user), newPost);
    });

    await Promise.all(createNotifications);

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
    // Retrieve user's friends
    let user = await Profile.findOne({ user: userId }).populate({
      path: "friends",
      model: "Profile",
      select: "user -_id",
    });
    let friendsUsersId = user.friends.map((friend) => friend.user.toString());
    // Combine friends  arrays
    const connections = [...friendsUsersId, userId];
    // console.log(friendsUsersId);
    const count = await Post.countDocuments({
      _id: { $in: connections },
    }); // Total number of posts for connections with a public accountStatus

    const totalPages = Math.ceil(count / limit); // Total number of pages

    const posts = await Post.find({
      user: { $in: connections },
    })
      .populate({
        path: "user",
        select: "first_name last_name  profile -_id",
        populate: {
          path: "profile",
          select: "profileImage user_name -_id",
          populate: {
            path: "profileImage",
            select: "thumbnailUrl originalUrl -_id",
          },
        },
      })
      .populate("attachedImages", "-_id -_createdAt -__v -uploadedAt")
      .skip((page - 1) * limit) // Skip posts based on the current page and limit
      .limit(limit) // Limit the number of posts per page
      .sort({ createdAt: -1 }); // Sort posts by createdAt field in descending order

    res.status(200).send({ posts, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error retrieving posts" });
  }
}
module.exports = {
  addPost,
  getPersonalProfilePosts,
  getSinglePost,
  updatePost,
  deletePost,
  getVariousPosts,
};
