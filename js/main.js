// main.js

// Global variables
let currentGameId = null;
let currentRoundId = null;
let currentTeams = []; // Array of objects: { team_id, name }
let currentRoundNumber = 0;
let teamsFinalized = false; // True when teams have been saved for the current round
let allPlayers = [];      // Global list of players (from API)
let teamAssignments = {}; // Holds assignments per team, e.g. { "1": { playerIds: [...], teamName: "Team 1" }, ... }

document.addEventListener('DOMContentLoaded', () => {
  // Set default game date if element exists
  const gameDateInput = document.getElementById('gameDate');
  if (gameDateInput) {
    gameDateInput.value = new Date().toISOString().split('T')[0];
  }

  // --- Create Game Page ---
  if (document.getElementById('createGameForm')) {
    populateGameTypes();
    document.getElementById('createGameForm').addEventListener('submit', createGame);
  }
  
  // --- Round Management ---
  // The "Start New Round" button is available for subsequent rounds.
  //if (document.getElementById('startRound')) {
  //  document.getElementById('startRound').addEventListener('click', () => startRound(false));
  //}
  if (document.getElementById('generateTeams')) {
    document.getElementById('generateTeams').addEventListener('click', generateTeams);
  }
  if (document.getElementById('savePlayerAssignments')) {
    document.getElementById('savePlayerAssignments').addEventListener('click', savePlayerAssignments);
  }
  if (document.getElementById('saveTeamsBtn')) {
    document.getElementById('saveTeamsBtn').addEventListener('click', saveTeams);
  }
  if (document.getElementById('scoreForm')) {
    document.getElementById('scoreForm').addEventListener('submit', submitScores);
  }
  
  // --- End Game Button ---
  if (document.getElementById('endGame')) {
    document.getElementById('endGame').addEventListener('click', endGame);
  }
  
  // --- Players Management Page ---
  if (document.getElementById('playersTable')) {
    loadPlayers();
    document.getElementById('newPlayerBtn').addEventListener('click', showPlayerForm);
    document.getElementById('playerForm').addEventListener('submit', savePlayer);
  }
  
  // --- Scoreboard Page ---
  if (document.getElementById('topPlayers')) {
    loadTopPlayers();
    populateGameSessions();
    if (document.getElementById('gameSessionSelect')) {
      document.getElementById('gameSessionSelect').addEventListener('change', loadScoreboard);
    }
  }
});

// ---------------------------
// Create Game & Round Functions
// ---------------------------

// Populate the game types dropdown
async function populateGameTypes() {
  const valid = await checkPassword();
  if (!valid) {
    alert("Incorrect password!");
    window.location.href = 'index.html';
  }

  fetch('api/game_types.php')
    .then(response => response.json())
    .then(data => {
      const gameTypeSelect = document.getElementById('gameType');
      data.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        gameTypeSelect.appendChild(option);
      });
    })
    .catch(err => console.error('Error fetching game types:', err));
}

// Create a game session and immediately start the first round (for team setup)
function createGame(event) {
  event.preventDefault();
  const form = event.target;
  const gameTypeId = form.game_type_id.value;
  const name = form.name.value;
  const gameDate = form.game_date.value;
  
  fetch('api/games.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_type_id: gameTypeId, name: name, game_date: gameDate })
  })
    .then(response => response.json())
    .then(data => {
      const msgDiv = document.getElementById('createGameMessage');
      if (data.success) {
        currentGameId = data.game_id;
        msgDiv.textContent = 'Game session created successfully!';
        // Show the round management section
        const roundSection = document.getElementById('roundSection');
        if (roundSection) {
          roundSection.style.display = 'block';
        }
        // Automatically start the first round with updateTeams=true so team setup appears
        startRound(true);
      } else if (data.error) {
        msgDiv.textContent = 'Error: ' + data.error;
      }
    })
    .catch(err => console.error('Error creating game:', err));
}

// Start a new round. If updateTeams==true, show team setup for the round.
function startRound(updateTeams) {
  // For subsequent rounds (when updateTeams is false) teams must have been finalized.
  if (!updateTeams && !teamsFinalized) {
    alert("Please complete team setup (save teams) before starting a new round.");
    return;
  }
  currentRoundNumber++;
  updateRoundIndicator();
  fetch('api/rounds.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_id: currentGameId, round_number: currentRoundNumber })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        currentRoundId = data.round_id;
        if (updateTeams) {
          // For a new round with team update, show team setup and assignment areas
          teamsFinalized = false;
          const teamSetupDiv = document.getElementById('teamSetup');
          const playerAssignDiv = document.getElementById('playerAssignment');
          if (teamSetupDiv) teamSetupDiv.style.display = 'block';
          if (playerAssignDiv) playerAssignDiv.style.display = 'block';
          // Hide score entry since teams are being updated
          const scoreEntryDiv = document.getElementById('scoreEntry');
          if (scoreEntryDiv) scoreEntryDiv.style.display = 'none';
        } else {
          // Otherwise, continue with the existing teams: hide team setup and show score entry.
          const teamSetupDiv = document.getElementById('teamSetup');
          const playerAssignDiv = document.getElementById('playerAssignment');
          const scoreEntryDiv = document.getElementById('scoreEntry');
          if (teamSetupDiv) teamSetupDiv.style.display = 'none';
          if (playerAssignDiv) playerAssignDiv.style.display = 'none';
          if (scoreEntryDiv) {
            scoreEntryDiv.style.display = 'block';
            populateScoreInputs();
          }
        }
      } else {
        console.error('Error starting round:', data.error);
      }
    })
    .catch(err => console.error('Error starting round:', err));
}

function updateRoundIndicator() {
  const indicator = document.getElementById('roundIndicator');
  if (indicator) {
    indicator.textContent = "Current Round: " + currentRoundNumber;
  }
}

// ---------------------------
// Team Setup & Player Assignment Functions
// ---------------------------

// Generate teams with integrated player assignment (using checkboxes)
function generateTeams() {
  fetch('api/players.php')
    .then(response => response.json())
    .then(players => {
      allPlayers = players; // Save players globally
      const teamCount = parseInt(document.getElementById('teamCount').value, 10);
      const container = document.getElementById('teamsAssignmentContainer');
      if (!container) {
        console.error("Element with id 'teamsAssignmentContainer' not found.");
        return;
      }
      container.innerHTML = ''; // Clear any previous entries
      teamAssignments = {}; // Reset assignments
      for (let i = 1; i <= teamCount; i++) {
        // Initialize assignment for team i.
        teamAssignments[i] = { playerIds: [], teamName: `Team ${i}` };
        const teamRow = document.createElement('div');
        teamRow.className = 'team-assignment-row';
        teamRow.setAttribute('data-team-index', i);
        const label = document.createElement('span');
        label.className = 'team-label';
        label.textContent = `Team ${i}`;
        teamRow.appendChild(label);
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-container';
        players.forEach(player => {
          const wrapper = document.createElement('div');
          wrapper.className = 'checkbox-wrapper';
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = player.player_id;
          checkbox.setAttribute('data-player-id', player.player_id);
          checkbox.setAttribute('data-team-index', i);
          checkbox.addEventListener('change', updateTeamCheckboxes);
          const cbLabel = document.createElement('label');
          cbLabel.textContent = player.name;
          wrapper.appendChild(checkbox);
          wrapper.appendChild(cbLabel);
          checkboxContainer.appendChild(wrapper);
        });
        teamRow.appendChild(checkboxContainer);
        container.appendChild(teamRow);
      }
    })
    .catch(err => console.error('Error fetching players for team assignment:', err));
}

// Disable checkboxes in other teams if a player is already selected in any team.
function updateTeamCheckboxes() {
  const checkboxes = document.querySelectorAll('#teamsAssignmentContainer input[type="checkbox"]');
  const selectedPlayers = new Set();
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedPlayers.add(checkbox.value);
    }
  });
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      checkbox.disabled = false;
    } else {
      checkbox.disabled = selectedPlayers.has(checkbox.value);
    }
  });
}

// Save player assignments: update the teamAssignments object and update UI labels.
function savePlayerAssignments() {
  const rows = document.querySelectorAll('#teamsAssignmentContainer .team-assignment-row');
  rows.forEach(row => {
    const teamIndex = row.getAttribute('data-team-index');
    const checkboxes = row.querySelectorAll('input[type="checkbox"]');
    const playerIds = [];
    const playerNames = [];
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        playerIds.push(checkbox.value);
        const player = allPlayers.find(p => p.player_id == checkbox.value);
        if (player) {
          playerNames.push(player.name);
        }
      }
    });
    const teamName = playerNames.join(', ') || `Team ${teamIndex}`;
    const label = row.querySelector('.team-label');
    if (label) {
      label.textContent = teamName;
    }
    teamAssignments[teamIndex] = { playerIds, teamName };
  });
  const msgDiv = document.getElementById('playerAssignmentMessage');
  if (msgDiv) {
    msgDiv.textContent = 'Player assignments saved. Team names updated.';
  }
}

// Save teams: create teams on the backend and assign players to them.
// Requires that a round has already been started (so currentRoundId is set).
function saveTeams() {
  if (!currentRoundId) {
    alert("No round started. Please start a round first.");
    return;
  }
  const promises = [];
  currentTeams = []; // Reset current teams
  for (const teamIndex in teamAssignments) {
    const assignment = teamAssignments[teamIndex];
    const createTeamPromise = fetch('api/teams.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: currentRoundId, name: assignment.teamName })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const team_id = data.team_id;
          currentTeams.push({ team_id, name: assignment.teamName });
          const assignPromises = assignment.playerIds.map(playerId => {
            return fetch('api/team_players.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ round_id: currentRoundId, player_id: playerId, team_id: team_id })
            }).then(res => res.json());
          });
          return Promise.all(assignPromises);
        } else {
          throw new Error('Error creating team');
        }
      });
    promises.push(createTeamPromise);
  }
  Promise.all(promises)
    .then(() => {
      teamsFinalized = true;
      const teamMsg = document.getElementById('teamMessage');
      if (teamMsg) {
        teamMsg.textContent = 'Teams saved successfully!';
      }
      // Hide team setup and player assignment sections now that teams are finalized.
      const teamSetupDiv = document.getElementById('teamSetup');
      const playerAssignDiv = document.getElementById('playerAssignment');
      if (teamSetupDiv) teamSetupDiv.style.display = 'none';
      if (playerAssignDiv) playerAssignDiv.style.display = 'none';
      // Show the score entry section for this round.
      const scoreEntryDiv = document.getElementById('scoreEntry');
      if (scoreEntryDiv) {
        scoreEntryDiv.style.display = 'block';
        populateScoreInputs();
      }
    })
    .catch(err => console.error('Error saving teams:', err));
}

// ---------------------------
// Score Entry Functions
// ---------------------------

function populateScoreInputs() {
  const scoreInputs = document.getElementById('scoreInputs');
  if (!scoreInputs) return;
  scoreInputs.innerHTML = '';
  currentTeams.forEach(team => {
    const div = document.createElement('div');
    div.classList.add('score-entry');
    div.innerHTML = `
      <label>${team.name}:</label>
      <input type="number" step="0.1" name="score_${team.team_id}" required>
    `;
    scoreInputs.appendChild(div);
  });
}

function submitScores(event) {
  event.preventDefault();
  const form = event.target;
  const scoreData = {};
  currentTeams.forEach(team => {
    scoreData[team.team_id] = form.elements[`score_${team.team_id}`].value;
  });
  
  const promises = currentTeams.map(team => {
    return fetch('api/transactions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        round_id: currentRoundId,
        team_id: team.team_id,
        points: scoreData[team.team_id]
      })
    }).then(res => res.json());
  });
  
  Promise.all(promises)
    .then(() => {
      const scoreMsg = document.getElementById('scoreMessage');
      if (scoreMsg) {
        scoreMsg.textContent = 'Scores submitted successfully!';
      }
      // After score submission, ask whether to update teams for the next round.
      if (confirm("Do you want to update teams for the next round? Click OK to update teams, Cancel to keep the same teams.")) {
         startRound(true);
      } else {
         startRound(false);
      }
    })
    .catch(err => console.error('Error submitting scores:', err));
}


function endGame() {
  if (confirm("Are you sure you want to end the game?")) {
    currentGameId = null;
    currentRoundId = null;
    currentRoundNumber = 0;
    teamsFinalized = false;
    const roundSection = document.getElementById('roundSection');
    if (roundSection) {
      roundSection.style.display = 'none';
    }
    alert("Game ended.");
    location.reload();
  }
}

// ---------------------------
// Players Management Functions
// ---------------------------

async function loadPlayers() {
  const valid = await checkPassword();
  if (!valid) {
    alert("Incorrect password!");
    window.location.href = 'index.html';
  }
  fetch('api/players.php')
    .then(response => response.json())
    .then(players => {
      const tbody = document.querySelector('#playersTable tbody');
      tbody.innerHTML = '';
      players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${player.name}</td>
          <td>${player.email || ''}</td>
          <td>
            <button onclick="editPlayer(${player.player_id})">Edit</button>
            <button onclick="deletePlayer(${player.player_id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => console.error('Error loading players:', err));
}

function checkPassword() {
  const password = prompt("Please authenticate:");
  return fetch('/api/validate_password.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  })
  .then(response => response.json())
  .then(data => data.valid)
  .catch(err => {
    console.error('Error validating password:', err);
    return false;
  });
}

function showPlayerForm() {
  document.getElementById('playerFormContainer').style.display = 'block';
  document.getElementById('playerFormTitle').textContent = 'New Player';
  document.getElementById('player_id').value = '';
  document.getElementById('playerName').value = '';
  document.getElementById('playerEmail').value = '';
}

function savePlayer(event) {
  event.preventDefault();
  const playerId = document.getElementById('player_id').value;
  const name = document.getElementById('playerName').value;
  const email = document.getElementById('playerEmail').value;
  const method = playerId ? 'PUT' : 'POST';
  const url = 'api/players.php' + (playerId ? `?player_id=${playerId}` : '');
  
  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, name: name, email: email })
  })
    .then(response => response.json())
    .then(data => {
      const msgDiv = document.getElementById('playerFormMessage');
      if (data.success) {
        msgDiv.textContent = 'Player saved successfully!';
        loadPlayers();
        document.getElementById('playerFormContainer').style.display = 'none';
      } else if (data.error) {
        msgDiv.textContent = 'Error: ' + data.error;
      }
    })
    .catch(err => console.error('Error saving player:', err));
}

function editPlayer(playerId) {
  fetch(`api/players.php?player_id=${playerId}`)
    .then(response => response.json())
    .then(player => {
      document.getElementById('playerFormContainer').style.display = 'block';
      document.getElementById('playerFormTitle').textContent = 'Edit Player';
      document.getElementById('player_id').value = player.player_id;
      document.getElementById('playerName').value = player.name;
      document.getElementById('playerEmail').value = player.email || '';
    })
    .catch(err => console.error('Error loading player:', err));
}

function deletePlayer(playerId) {
  if (!confirm('Are you sure you want to delete this player?')) return;
  fetch(`api/players.php?player_id=${playerId}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        loadPlayers();
      } else {
        console.error('Error deleting player:', data.error);
      }
    })
    .catch(err => console.error('Error deleting player:', err));
}