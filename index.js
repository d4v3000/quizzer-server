const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const lobbies = require("./lobbies");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const PORT = 4000 || process.env.PORT;

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on(
    "create-lobby",
    ({ quizId, userName, numOfTeams, quizName, numOfQuestions }, callback) => {
      const lobbyId = lobbies.createLobby(
        userName,
        numOfTeams,
        socket.id,
        quizName,
        numOfQuestions
      );
      socket.join(lobbyId);
      socket.emit("lobby-created", lobbyId);
      callback({
        id: lobbyId,
      });
      console.log(`Player "${userName}" created lobby ${lobbyId}`);
    }
  );

  socket.on("join-lobby", ({ userName, lobbyId }) => {
    socket.join(lobbyId);
    lobbies.joinLobby(userName, lobbyId, socket.id);
    io.to(lobbyId).emit("joined-lobby", lobbies.lobbies[lobbyId], {
      message: userName + " joined the lobby",
      sender: "system",
    });
    console.log(`Player "${userName}" joined lobby ${lobbyId}`);
  });

  socket.on("join-team", ({ userName, lobbyId, teamId, oldTeam }) => {
    lobbies.joinTeam(userName, lobbyId, socket.id, teamId, oldTeam);
    socket.join(lobbyId + teamId);
    socket.leave(lobbyId + oldTeam);
    io.to(lobbyId).emit("joined-team", lobbies.lobbies[lobbyId]);
  });

  socket.on("send-team-message", (message, roomId) => {
    io.to(roomId).emit("team-message-received", message);
  });

  socket.on("send-global-message", (message, lobbyId) => {
    io.to(lobbyId).emit("global-message-received", message);
  });
});

app.use(cors());
app.use(express.json());

app.post("/lobby", (req, res) => {
  if (lobbies.lobbies[req.body.id]) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
