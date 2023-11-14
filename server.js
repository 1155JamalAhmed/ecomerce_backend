const app = require("./app");
const connectDatabase = require("./db/database");
const { cronSchedular } = require("./scripts/cronjobSchedular");

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const MessageModel = require("./models/messageModel");
const ChatModel = require("./models/chatModel");

// ** Handling uncaught exception occured because of sync errors
process.on("uncaughtException", (err) => {
  console.log("Error", err.message);
  console.log("Shutting down because of uncaught exception 😫😪");
  // exit with 1 because of abnormal termination
  process.exit(1);
});

// ** connecting to the database
connectDatabase();

// ** create server
const portedServer = server.listen(process.env.PORT, () => {
  console.log("Server is running on port: ", process.env.PORT);
  cronSchedular();
});

const notification = io.of("/notification");

notification.on("connection", (socket) => {
  // from here notification will be used as io
  notification.emit(
    "orderDelivered",
    "Your order has been placed successfull!"
  );
});

//Add this before the app.get() block
io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} just connected!`);

  socket.on("setup user", (user) => {
    socket.join(user._id);
    console.log("user joined", user);
    socket.emit("Connected");
  });

  socket.on("setup shop", (shop) => {
    socket.join(shop._id);
    console.log("shop joined", shop);
    socket.emit("Connected");
  });

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log("user joined", chatId);
  });

  socket.on("new message", async (message, cb) => {
    const savedMessage = await MessageModel.create(message);
    await ChatModel.findByIdAndUpdate(savedMessage.chat, {
      $set: { latestMessage: savedMessage._id },
    });
    socket
      .to(savedMessage.chat)
      .except(savedMessage.sender)
      .emit("new message", savedMessage);
    cb(savedMessage);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

// ** unhandled promise rejection occured because of async errors
process.on("unhandledRejection", (err) => {
  console.log("Error: ", err.message);
  console.log("Shutting down because of unhandled rejection 🤦‍♀️🤢");
  // exit gracefully by first closing the server
  portedServer.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully 👌");
  portedServer.close(() => {
    console.log("✨ Process terminated!");
  });
});
