const { customAlphabet } = require("nanoid");
let _ = require("lodash");

const lobbies = {};
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createLobby(userName, numOfTeams, socketId, quizName, numOfQuestions) {
  const generateId = customAlphabet(alphabet, 5);
  const lobbyId = generateId();

  while (lobbies[lobbyId]) {
    lobbyId = nanoid.customAlphabet(cstmAlphabet, 5);
  }

  lobbies[lobbyId] = {
    id: lobbyId,
    teams: [],
    playersWithoutTeam: [],
    quizMaster: { id: socketId, name: userName },
    quizName: quizName,
    numOfQuestions: numOfQuestions,
  };

  for (i = 0; i < numOfTeams; i++) {
    lobbies[lobbyId].teams.push({
      id: i.toString(),
      players: [],
      name: `Team ${i + 1}`,
    });
  }

  return lobbyId;
}

function joinLobby(userName, lobbyId, socketId) {
  lobbies[lobbyId].playersWithoutTeam.push({
    id: socketId,
    name: userName,
    team: null,
  });
}

function joinTeam(userName, lobbyId, socketId, teamId, oldTeam) {
  // join new team
  lobbies[lobbyId].teams[_.parseInt(teamId)].players.push({
    id: socketId,
    name: userName,
    team: teamId,
  });

  // find old team and remove player
  if (oldTeam) {
    const playerIndexInTeam = lobbies[lobbyId].teams[
      _.parseInt(oldTeam)
    ].players.findIndex((player) => player.id === socketId);
    lobbies[lobbyId].teams[_.parseInt(oldTeam)].players.splice(
      playerIndexInTeam,
      1
    );
  } else {
    const playerIndex = lobbies[lobbyId].playersWithoutTeam.findIndex(
      (player) => player.id === socketId
    );
    lobbies[lobbyId].playersWithoutTeam.splice(playerIndex, 1);
  }
}

module.exports = {
  createLobby,
  joinLobby,
  joinTeam,
  lobbies,
};
