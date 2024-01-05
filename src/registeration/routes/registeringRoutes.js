const { Router } = require("express");
const { createUser, login } = require("../controllers/registeringController");

const registeringRoutes = Router();
const multer = require("multer");

const upload = multer();
registeringRoutes.post("/signUp", upload.none(), createUser);
registeringRoutes.post("/login", upload.none(), login);
module.exports = registeringRoutes;
