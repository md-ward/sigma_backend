const { Router } = require("express");
const { addPhoneNumber, changeAccountStatus } = require("../controllers/accountSettingsController");
const userAuthCheckMiddleware = require("../../global/userAuthCeckMiddlewear");

const accountSettingsRouter = Router();
accountSettingsRouter.post("/phone", userAuthCheckMiddleware, addPhoneNumber);
accountSettingsRouter.put("/status", userAuthCheckMiddleware, changeAccountStatus);

module.exports = accountSettingsRouter;
