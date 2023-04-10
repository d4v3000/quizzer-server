const { customAlphabet } = require("nanoid");

const lobbies = {};
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createLobby(
  playerName,
  numOfTeams,
  socketId,
  quizName,
  numOfQuestions
) {
  const generateId = customAlphabet(alphabet, 5);
  const lobbyId = generateId();

  while (lobbies[lobbyId]) {
    lobbyId = nanoid.customAlphabet(cstmAlphabet, 5);
  }

  lobbies[lobbyId] = {
    id: lobbyId,
    teams: [],
    playersWithoutTeam: [],
    quizMaster: { id: socketId, name: playerName },
    quizName: quizName,
    numOfQuestions: numOfQuestions,
  };

  for (i = 0; i < numOfTeams; i++) {
    lobbies[lobbyId].teams.push({
      id: i,
      players: [],
      name: `Team ${i + 1}`,
    });
  }

  return lobbyId;
}

function joinLobby(playerName, lobbyId, socketId) {
  lobbies[lobbyId].playersWithoutTeam.push({
    id: socketId,
    name: playerName,
  });
}

module.exports = {
  createLobby,
  joinLobby,
  lobbies,
};
