// main.js

// Global variables
let currentGameId = null;
let currentRoundId = null;
let currentTeams = []; // Array of { team_id, name }
let currentRoundNumber = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Set default game date
  const gameDateInput = document.getElementById('gameDate');
  if (gameDateInput) {
    gameDateInput.value = new Date().toISOString().split('T')[0];
  }

  // --- Create Game Page ---
  if (document.getElementById('createGameForm')) {
    populateGameTypes();
    document.getElementById('createGameForm').addEventListener('submit', createGame);
  }
  
  // --- Round Management (Create Game Page) ---
  if (document.getElementById('startRound')) {
    document.getElementById('startRound').addEventListener('click', () => startRound(false));
  }
  if (document.getElementById('generateTeams')) {
    document.getElementById('generateTeams').addEventListener('click', generateTeams);
  }
  if (document.getElementById('saveTeamsBtn')) {
    document.getElementById('saveTeamsBtn').addEventListener('click', saveTeams);
  }
  if (document.getElementById('savePlayerAssignments')) {
    document.getElementById('savePlayerAssignments').addEventListener('click', savePlayerAssignments);
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

// ==================================================
// Create Game & Round Management Functions
// ==================================================

function populateGameTypes() {
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
      // Reveal round management container
      document.getElementById('roundSection').style.display = 'block';
    } else if (data.error) {
      msgDiv.textContent = 'Error: ' + data.error;
    }
  })
  .catch(err => console.error('Error creating game:', err));
}

// Modified startRound accepts a boolean parameter.
// If updateTeams is true, the UI will reveal team setup and player assignment.
// Otherwise, it will hide those and simply populate the score entry form.
function startRound(updateTeams) {
  if (currentTeams.length === 0) {
    updateTeams = true;
  }
  currentRoundNumber++;
  updateRoundIndicator();
  // Use currentRoundNumber as the round_number
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
        // Show team setup and player assignment sections, clear teams array.
        document.getElementById('teamSetup').style.display = 'block';
        document.getElementById('playerAssignment').style.display = 'block';
        document.getElementById('scoreEntry').style.display = 'none';
        currentTeams = [];
      } else {
        // Keep existing teams; hide team assignment sections and show score entry.
        document.getElementById('teamSetup').style.display = 'none';
        document.getElementById('playerAssignment').style.display = 'none';
        document.getElementById('scoreEntry').style.display = 'block';
        populateScoreInputs();
      }
      document.getElementById('startRound').style.display = 'none';
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

function generateTeams() {
  const teamCount = parseInt(document.getElementById('teamCount').value, 10);
  const generatedTeamsDiv = document.getElementById('generatedTeams');
  generatedTeamsDiv.innerHTML = ''; // Clear any previous entries
  for (let i = 1; i <= teamCount; i++) {
    const teamDiv = document.createElement('div');
    teamDiv.textContent = `Team ${i}`;
    teamDiv.setAttribute('data-team-number', i);
    generatedTeamsDiv.appendChild(teamDiv);
  }
}

function saveTeams() {
  const generatedTeamsDiv = document.getElementById('generatedTeams');
  const teamDivs = generatedTeamsDiv.querySelectorAll('div[data-team-number]');
  const promises = [];
  currentTeams = []; // Reset current teams
  teamDivs.forEach(teamDiv => {
    const teamName = teamDiv.textContent; // e.g., "Team 1"
    promises.push(
      fetch('api/teams.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Teams are now linked to the current round via round_id.
        body: JSON.stringify({ round_id: currentRoundId, name: teamName })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentTeams.push({ team_id: data.team_id, name: data.name });
        }
      })
    );
  });
  Promise.all(promises)
    .then(() => {
      document.getElementById('teamMessage').textContent = 'Teams saved successfully!';
      // Reveal and populate player assignment section.
      document.getElementById('playerAssignment').style.display = 'block';
      showPlayerAssignment();
      populateScoreInputs();
    })
    .catch(err => console.error('Error saving teams:', err));
}

function showPlayerAssignment() {
  // Fetch all players and populate the assignment table with a dropdown for each.
  fetch('api/players.php')
    .then(response => response.json())
    .then(players => {
      const tbody = document.getElementById('playerAssignmentBody');
      tbody.innerHTML = ''; // Clear existing rows
      players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${player.name}</td>
          <td>
            <select data-player-id="${player.player_id}">
              <option value="">-- Unassigned --</option>
              ${currentTeams.map(team => `<option value="${team.team_id}">${team.name}</option>`).join('')}
            </select>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => console.error('Error loading players for assignment:', err));
}

function savePlayerAssignments() {
  // Iterate over each select element and assign players accordingly.
  const selects = document.querySelectorAll('#playerAssignmentBody select');
  const promises = [];
  selects.forEach(select => {
    const playerId = select.getAttribute('data-player-id');
    const teamId = select.value; // If blank, player is unassigned.
    promises.push(
      fetch('api/team_players.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send round_id so that assignments link to the current round.
        body: JSON.stringify({
          round_id: currentRoundId,
          player_id: playerId,
          team_id: teamId
        })
      }).then(res => res.json())
    );
  });
  Promise.all(promises)
    .then(() => {
      document.getElementById('playerAssignmentMessage').textContent = 'Player assignments saved successfully!';
      // Reveal the score entry section.
      document.getElementById('scoreEntry').style.display = 'block';
      // Optionally, repopulate score inputs.
      populateScoreInputs();
    })
    .catch(err => console.error('Error saving player assignments:', err));
}

function populateScoreInputs() {
  // Generate score entry fields based on the current teams.
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
      document.getElementById('scoreMessage').textContent = 'Scores submitted successfully!';
      // Present two options to the user:
      if (confirm("Do you want to update teams for the next round? Click OK to update teams, Cancel to keep the same teams.")) {
         // Option: update teams.
         startRound(true);
      } else {
         // Option: keep teams.
         startRound(false);
      }
    })
    .catch(err => console.error('Error submitting scores:', err));
}

// ==================================================
// Players Management Functions
// ==================================================

function loadPlayers() {
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

// ==================================================
// Scoreboard Functions
// ==================================================

function loadTopPlayers() {
  fetch('api/player_scores.php')
    .then(response => response.json())
    .then(players => {
      const container = document.getElementById('topPlayers');
      if (!players.length) {
        container.textContent = 'No player scores available.';
        return;
      }
      let table = `<table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Total Score</th>
          </tr>
        </thead>
        <tbody>`;
      players.forEach(player => {
        table += `<tr>
          <td>${player.name}</td>
          <td>${player.total_score}</td>
        </tr>`;
      });
      table += '</tbody></table>';
      container.innerHTML = table;
    })
    .catch(err => console.error('Error loading top players:', err));
}

function populateGameSessions() {
  fetch('api/games.php')
    .then(response => response.json())
    .then(games => {
      const select = document.getElementById('gameSessionSelect');
      select.innerHTML = '';
      games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.game_id;
        option.textContent = `${game.name} (${game.game_date})`;
        select.appendChild(option);
      });
      if (games.length > 0) loadScoreboard();
    })
    .catch(err => console.error('Error fetching game sessions:', err));
}

function loadScoreboard() {
  const gameId = document.getElementById('gameSessionSelect').value;
  if (!gameId) return;
  fetch(`api/game_player_scores.php?game_id=${gameId}`)
    .then(response => response.json())
    .then(players => {
      const container = document.getElementById('scoreboardDisplay');
      if (!players.length) {
        container.textContent = 'No scores for this game session.';
        return;
      }
      let table = `<table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>`;
      players.forEach(player => {
        table += `<tr>
          <td>${player.name}</td>
          <td>${player.total_score}</td>
        </tr>`;
      });
      table += '</tbody></table>';
      container.innerHTML = table;
    })
    .catch(err => console.error('Error loading game scoreboard:', err));
}

function displayScoreboard(scores) {
  const container = document.getElementById('scoreboardDisplay');
  container.innerHTML = '';
  let table = `<table>
    <thead>
      <tr>
        <th>Team</th>
        <th>Score</th>
      </tr>
    </thead>
    <tbody>`;
  const sortedTeams = Object.values(scores).sort((a, b) => b.score - a.score);
  sortedTeams.forEach(team => {
    table += `<tr>
      <td>${team.name}</td>
      <td>${team.score}</td>
    </tr>`;
  });
  table += '</tbody></table>';
  container.innerHTML = table;
}

// ==================================================
// End Game Function
// ==================================================

function endGame() {
  if (confirm("Are you sure you want to end the game?")) {
    // Optionally, send an API call here to finalize the game.
    currentGameId = null;
    currentRoundId = null;
    currentRoundNumber = 0;
    // Hide round management sections.
    document.getElementById('roundSection').style.display = 'none';
    alert("Game ended.");
    // Optionally, reload the page:
    location.reload();
  }
}