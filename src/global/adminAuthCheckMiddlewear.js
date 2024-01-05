const jwt = require("jsonwebtoken");
const Admin = require("../admin/models/adminModel");

const adminAuthCheckMiddleware = async (req, res, next) => {
  try {
    // Verify the authentication token from the Authorization header
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token not provided" });
    }

    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.ADMIN_SECRET_KEY);
    const isAdmin = await Admin.findById(decodedToken.adminId);
    if (!isAdmin) {
      return res
        .status(401)
        .send({ message: "Authentication token not valid or expired" });
    }

    // If the token is valid and the user is an admin, proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle token verification errors
    return res.status(401).send({ message: "Invalid authentication token" });
  }
};

module.exports = adminAuthCheckMiddleware;
