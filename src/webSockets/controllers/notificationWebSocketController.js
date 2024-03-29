const Io = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../../registeration/models/registeringModel");

class NotificationService {
  constructor() {
    this.io = null;
    this.server = null;
    this.port = null;
    this.connectedUsers = new Map();
  }
  setServer(server, port, corsOptions) {
    this.server = server;
    this.port = port;
    this.corsOptions = corsOptions;
  }

  startServer() {
    this.io = new Io.Server(this.port, {
      cors: this.corsOptions,
      path: "/notifications",
    }); // Create a new Socket.IO server instance
    this.io.use(this.authenticateUser);
    // Define event handlers for the socket server
    this.io.on("connection", (socket) => {
      const userId = socket.userId;
      console.log("A client connected with  user id : ", userId);

      // Add the connected user to the connectedUsers Map
      this.connectedUsers.set(userId, socket);

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("A client disconnected");
      });
      socket.on("connect_error", (error) => {
        console.log(error);
      });
    });
  }

  authenticateUser = async (socket, next) => {
    try {
      // Extract the token from the query parameters or headers
      const token =
        socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error("Authentication token not provided"));
      }

      // Verify and decode the token
      const decodedToken = jwt.verify(token, process.env.USER_SECRET_KEY);
      const isUser = await User.findById(decodedToken.userId);

      if (!isUser) {
        return next(new Error("Authentication token not valid or expired"));
      }

      // Attach the user ID to the socket object
      socket.userId = decodedToken.userId;

      next();
    } catch (error) {
      // Handle token verification errors
      next(new Error("Invalid authentication token"));
    }
  };

  sendNotification(userId, notification) {
    // Retrieve the socket object for the specified user ID
    const socket = this.connectedUsers.get(userId);
    // console.log(this.connectedUsers.keys());
    if (socket) {
      // Emit the notification event to the specific user's socket
      socket.emit("notification", notification);
    } else {
      console.log(`User with ID ${userId} is not connected.`);
    }
  }
}
const notificationServiceInstance = new NotificationService();
module.exports = notificationServiceInstance;
