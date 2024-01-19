const { Router } = require("express");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");
const {
  addComment,
  getPostComments,
} = require("../controllers/commentsController");
const commentsRouter = Router();
commentsRouter.post("/", userAuthCheckMiddleware, addComment);
commentsRouter.get("/:postId", userAuthCheckMiddleware, getPostComments);

module.exports = commentsRouter;
