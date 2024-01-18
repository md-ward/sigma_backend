const { Router } = require("express");

const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");
const {
  addPost,
  updatePost,
  deletePost,

  getVariousPosts,
  getSinglePost,
  getPersonalProfilePosts,
} = require("../controller/postController");
const {
  handleUploadedImages,
} = require("../../media/controller/userImagesController");

const postRouter = Router();

postRouter.get("/", userAuthCheckMiddleware, getVariousPosts);
postRouter.get("/personal", userAuthCheckMiddleware, getPersonalProfilePosts);
postRouter.get("/:postId", userAuthCheckMiddleware, getSinglePost);
postRouter.post("/", handleUploadedImages, userAuthCheckMiddleware, addPost);
postRouter.put("/:postId", userAuthCheckMiddleware, updatePost);
postRouter.delete("/:postId", userAuthCheckMiddleware, deletePost);

module.exports = postRouter;
