const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const lobbies = require("./lobbies");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3001"],
  },
});

const PORT = 3000 || process.env.PORT;

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("create-lobby", ({ userName, numOfTeams }) => {
    const lobbyId = lobbies.createLobby(userName, numOfTeams);
    socket.join(lobbyId);
    socket.emit("lobby-created", lobbyId);
    console.log(`Player "${userName}" created lobby ${lobbyId}`);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
