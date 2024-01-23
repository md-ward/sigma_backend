const { Router } = require("express");

const {
  getNotifications,
  respondToFriendRequestNotification,
  markNotificationAsRead,
  unReadNotificationsCount,
} = require("../controllers/notificationController");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");

const notificationRouter = Router();
notificationRouter.get("/", userAuthCheckMiddleware, getNotifications);
notificationRouter.get(
  "/count",
  userAuthCheckMiddleware,
  unReadNotificationsCount
);
notificationRouter.post(
  "/friendResponse",
  userAuthCheckMiddleware,
  respondToFriendRequestNotification
);

notificationRouter.put("/", userAuthCheckMiddleware, markNotificationAsRead);
module.exports = notificationRouter;
