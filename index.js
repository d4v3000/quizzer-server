require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const lobbies = require("./lobbies");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.CORSORIGIN || "http://localhost:3000"],
  },
});

const PORT = process.env.PORT || 4000;

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

  socket.on("edit-team-name", ({ lobbyId, teamId, name }) => {
    lobbies.editTeamName(lobbyId, teamId, name);
    io.to(lobbyId).emit("team-name-edited", lobbies.lobbies[lobbyId]);
  });

  socket.on("send-team-message", (message, roomId) => {
    io.to(roomId).emit("team-message-received", message);
  });

  socket.on("send-global-message", (message, lobbyId) => {
    io.to(lobbyId).emit("global-message-received", message);
  });

  socket.on("randomize-teams", (lobbyId) => {
    lobbies.randomizeTeams(lobbyId);
    io.to(lobbyId).emit("teams-randomized", lobbies.lobbies[lobbyId]);
  });

  socket.on("reset-teams", (lobbyId) => {
    lobbies.resetTeams(lobbyId);
    io.to(lobbyId).emit("teams-reset", lobbies.lobbies[lobbyId]);
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms);
    if (rooms[1]) {
      const userName = lobbies.leaveLobby(socket.id, rooms[1]);
      io.to(rooms[1]).emit("player-disconnect", {
        lobby: lobbies.lobbies[rooms[1]],
      });
      io.to(rooms[1]).emit("global-message-received", {
        sender: "system",
        message: `${userName} disconnected`,
      });
    }
  });

  socket.on("kick-player", (socketId, lobbyId) => {
    const userName = lobbies.leaveLobby(socketId, lobbyId);
    io.to(lobbyId).emit("player-disconnect", {
      lobby: lobbies.lobbies[lobbyId],
      socketId: socketId,
    });
    io.to(lobbyId).emit("global-message-received", {
      sender: "system",
      message: `${userName} was kicked`,
    });
    const rooms = Array.from(io.sockets.sockets.get(socketId).rooms);
    for (i = 1; i < rooms.length; i++) {
      io.sockets.sockets.get(socketId).leave(rooms[i]);
    }
  });

  socket.on("leave-lobby", (lobbyId) => {
    const userName = lobbies.leaveLobby(socket.id, lobbyId);
    io.to(lobbyId).emit("player-disconnect", {
      lobby: lobbies.lobbies[lobbyId],
    });
    io.to(lobbyId).emit("global-message-received", {
      sender: "system",
      message: `${userName} left the lobby`,
    });
    const rooms = Array.from(socket.rooms);
    for (i = 1; i < rooms.length; i++) {
      socket.leave(rooms[i]);
    }
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
