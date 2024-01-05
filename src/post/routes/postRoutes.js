const { Router } = require("express");

const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");
const {
  addPost,
  updatePost,
  deletePost,
  getPosts,
  getVariousPosts,
} = require("../controller/postController");

const postRouter = Router();
postRouter.get("/", userAuthCheckMiddleware, getVariousPosts);
postRouter.get("/user", userAuthCheckMiddleware, getPosts);
postRouter.post("/", userAuthCheckMiddleware, addPost);
postRouter.put("/:postId", userAuthCheckMiddleware, updatePost);
postRouter.delete("/:postId", userAuthCheckMiddleware, deletePost);

module.exports = postRouter;
