const { Router } = require("express");

const {
  getNotifications,
  respondToFriendRequestNotification,
} = require("../controllers/notificationController");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");

const notificationRouter = Router();
notificationRouter.get("/", userAuthCheckMiddleware, getNotifications);
notificationRouter.post(
  "/friendResponse",
  userAuthCheckMiddleware,
  respondToFriendRequestNotification
);

module.exports = notificationRouter;
