const { Router } = require("express");
const multer = require("multer");
const {
  completeProfile,
  getProfiles,
  sendFriendRequest,
  getPersonalProfileDetails,
} = require("../controller/profileController");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");

const upload = multer();
const profileRouter = Router();

profileRouter.post("/friend", userAuthCheckMiddleware, sendFriendRequest);

profileRouter.get("/", userAuthCheckMiddleware, getProfiles);
profileRouter.get(
  "/personal",
  userAuthCheckMiddleware,
  getPersonalProfileDetails
);
profileRouter.post(
  "/",
  upload.none(),
  userAuthCheckMiddleware,
  completeProfile
);
// profileRouter.get("/:profileId", getProfileDetails);
module.exports = profileRouter;
