const { Router } = require("express");
const multer = require("multer");
const { completeProfile, getProfileDetails } = require("../controller/profileController");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");

const upload = multer();
const profileRouter = Router();
profileRouter.get("/userId", getProfileDetails);
profileRouter.post(
  "/",
  upload.none(),
  userAuthCheckMiddleware,
  completeProfile
);
module.exports = profileRouter;
