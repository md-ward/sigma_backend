const Io = require("socket.io");

class NotificationService {
  constructor(server) {
    this.io = null;
    this.server = server;
  }

  startServer() {
    this.io = new Io.Server(this.server); // Create a new Socket.IO server instance

    // Define event handlers for the socket server
    this.io.on("connection", (socket) => {
      console.log("A client connected");

      // Handle the "notification" event from the client
      socket.on("notification", (notification) => {
        // Process the notification and send it to the desired recipient(s)
        // this.sendNotification(notification);
        console.log('notification from postman',notification);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("A client disconnected");
      });
      socket.on(this.io._parser.PacketType.CONNECT_ERROR, (error) => {
        console.log(error);
      });
    });

    // this.io.listen(3000, () => {
    //   console.log("Socket server started");
    // });
  }

  sendNotification(notification) {
    // Logic to send the notification to the desired recipient(s)
    // You can access the Socket.IO server instance via `this.io`
    // and emit the "notification" event to the appropriate client(s)
    this.io.emit("notification", notification);
  }
}

module.exports = NotificationService;
