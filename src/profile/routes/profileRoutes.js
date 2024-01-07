const { Router } = require("express");
const multer = require("multer");
const {
  completeProfile,
  getProfileDetails,
  sendFollowRequest,
} = require("../controller/profileController");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");

const upload = multer();
const profileRouter = Router();

profileRouter.post("/follow", userAuthCheckMiddleware, sendFollowRequest);

profileRouter.post(
  "/",
  upload.none(),
  userAuthCheckMiddleware,
  completeProfile
);
profileRouter.get("/:profileId", getProfileDetails);
module.exports = profileRouter;
