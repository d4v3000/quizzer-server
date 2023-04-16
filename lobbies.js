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
    players: [],
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
  lobbies[lobbyId].players.push({
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

  _.find(lobbies[lobbyId].players, { id: socketId }).team = teamId;

  // find old team and remove player
  if (oldTeam) {
    const playerIndexInTeam = lobbies[lobbyId].teams[
      _.parseInt(oldTeam)
    ].players.findIndex((player) => player.id === socketId);
    lobbies[lobbyId].teams[_.parseInt(oldTeam)].players.splice(
      playerIndexInTeam,
      1
    );
  }
}

function editTeamName(lobbyId, teamId, name) {
  lobbies[lobbyId].teams[_.parseInt(teamId)].name = name;
}

function leaveLobby(socketId, lobbyId) {
  let name = "";
  for (i = 0; i < lobbies[lobbyId].teams.length; i++) {
    const playerIndexInTeam = lobbies[lobbyId].teams[i].players.findIndex(
      (player) => player.id === socketId
    );
    if (playerIndexInTeam !== -1) {
      lobbies[lobbyId].teams[i].players.splice(playerIndexInTeam, 1);
    }
  }

  const playerIndex = _.findIndex(lobbies[lobbyId].players, { id: socketId });
  name = lobbies[lobbyId].players[playerIndex].name;
  lobbies[lobbyId].players.splice(playerIndex, 1);

  return name;
}

module.exports = {
  createLobby,
  joinLobby,
  joinTeam,
  editTeamName,
  leaveLobby,
  lobbies,
};
