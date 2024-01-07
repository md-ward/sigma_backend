const { Router } = require("express");

const {
  getNotifications,
  respondToFollowRequestNotification,
} = require("../controllers/notificationController");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");

const notificationRouter = Router();
notificationRouter.get("/", userAuthCheckMiddleware, getNotifications);
notificationRouter.post(
  "/followResponse",
  userAuthCheckMiddleware,
  respondToFollowRequestNotification
);

module.exports = notificationRouter;
