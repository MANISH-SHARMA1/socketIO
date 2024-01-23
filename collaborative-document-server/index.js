const { log } = require("console");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  next();
});

// Map to store connected clients
const connectedClients = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("chat message", (message) => {
    io.emit("chat message", message);
  });

  // set connected clients
  connectedClients.set(socket.id, socket);

  socket.on("click", () => {
    const totalClient = getTotalClients();
    io.emit("totalUser", totalClient);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send message", ({ roomId, message }) => {
    io.to(roomId).emit("receive message", `${message}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("User disconnected:", socket.id, "reason", reason);
  });
});

function getTotalClients() {
  const totalClients = Array.from(connectedClients.keys());

  return totalClients;
}

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
