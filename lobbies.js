const { customAlphabet } = require("nanoid");

const lobbies = {};
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function createLobby(playerName, numOfTeams) {
  const generateId = customAlphabet(alphabet, 5);
  const lobbyId = generateId();

  while (lobbies[lobbyId]) {
    lobbyId = nanoid.customAlphabet(cstmAlphabet, 5);
  }

  lobbies[lobbyId] = {
    id: lobbyId,
    teams: [],
    gameMaster: playerName,
  };

  for (i = 0; i < numOfTeams; i++) {
    lobbies[lobbyId].teams.push({
      id: i,
      players: [],
    });
  }

  return lobbyId;
}

module.exports = {
  createLobby,
  lobbies,
};
