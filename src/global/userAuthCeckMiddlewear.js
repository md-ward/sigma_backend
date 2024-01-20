const jwt = require("jsonwebtoken");
const User = require("../registeration/models/registeringModel");
const userAuthCheckMiddleware = async (req, res, next) => {
  try {
    // Verify the authentication token from the Authorization header
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token not provided" });
    }
    // console.log(token);
    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.USER_SECRET_KEY);
    const isUser = await User.findById(decodedToken.userId);
    // console.log({ isUser });
    if (!isUser) {
      return res
        .status(401)
        .send({ message: "Authentication token not valid or expired" });
    }

    // res.locals.userId = decodedToken.userId;
    req.userId = decodedToken.userId;

    next();
  } catch (error) {
    // console.log("error");
    // Handle token verification errors
    return res.status(401).send({ message: "Invalid authentication token" });
  }
};

module.exports = userAuthCheckMiddleware;
