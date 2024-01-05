const { Router } = require("express");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");
const {
  addComment,
  getProductComments,
} = require("../controllers/commentsController");

const commenstRoutes = Router();
commenstRoutes.post("/:productId", userAuthCheckMiddleware, addComment);
commenstRoutes.get("/:productId",  getProductComments);
module.exports = commenstRoutes;
