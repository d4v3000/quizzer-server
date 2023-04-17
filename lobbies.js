const { customAlphabet } = require("nanoid");
let _ = require("lodash");
const { shuffleArray } = require("./helper");

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
  if (playerIndex !== -1) {
    name = lobbies[lobbyId].players[playerIndex].name;
    lobbies[lobbyId].players.splice(playerIndex, 1);
  } else {
    name = lobbies[lobbyId].quizMaster.name;
    lobbies[lobbyId].quizMaster = {};
  }

  if (
    lobbies[lobbyId].players.length === 0 &&
    !lobbies[lobbyId].quizMaster.id
  ) {
    delete lobbies[lobbyId];
  }
  return name;
}

function randomizeTeams(lobbyId) {
  let shuffledPlayers = lobbies[lobbyId].players.slice();
  shuffleArray(shuffledPlayers);
  lobbies[lobbyId].teams.map((team) => (team.players = []));
  const numOfTeams = lobbies[lobbyId].teams.length;
  // adding a player to every teams counts as one passthrough
  let numOfPassthroughs = 0;
  for (i = 0; i < shuffledPlayers.length; i++) {
    if (i > numOfTeams * (numOfPassthroughs + 1) - 1) {
      numOfPassthroughs++;
    }
    lobbies[lobbyId].teams[i - numOfTeams * numOfPassthroughs].players.push(
      shuffledPlayers[i]
    );
    const playerIndex = _.findIndex(lobbies[lobbyId].players, {
      id: shuffledPlayers[i].id,
    });
    lobbies[lobbyId].players[playerIndex].team = (
      i -
      numOfTeams * numOfPassthroughs
    ).toString();
  }
}

function resetTeams(lobbyId) {
  lobbies[lobbyId].teams.map((team) => (team.players = []));
  lobbies[lobbyId].players.map((player) => (player.team = null));
}

module.exports = {
  createLobby,
  joinLobby,
  joinTeam,
  editTeamName,
  leaveLobby,
  randomizeTeams,
  resetTeams,
  lobbies,
};
