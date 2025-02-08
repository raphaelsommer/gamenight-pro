document.addEventListener('DOMContentLoaded', () => {
    loadTopPlayers();
    populateGameSessions();
    loadBestTeam();
    
    // When a game session is selected, load its KPIs and detailed scores.
    const gameSessionSelect = document.getElementById('gameSessionSelect');
    if (gameSessionSelect) {
      gameSessionSelect.addEventListener('change', () => {
        const gameId = gameSessionSelect.value;
        loadGameSessionKPIs(gameId);
        loadDetailedScores(gameId);
      });
    }
  });
  
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
                           <th>Rounds Played</th>
                           <th>Average Points</th>
                         </tr>
                       </thead>
                       <tbody>`;
        players.forEach(player => {
          table += `<tr>
                      <td>${player.name}</td>
                      <td>${player.total_points}</td>
                      <td>${player.rounds_played}</td>
                      <td>${player.average_points}</td>
                    </tr>`;
        });
        table += `</tbody></table>`;
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
        if (games.length > 0) {
          // Automatically load KPIs and detailed scores for the first session.
          const firstGameId = games[0].game_id;
          loadGameSessionKPIs(firstGameId);
          loadDetailedScores(firstGameId);
        }
      })
      .catch(err => console.error('Error fetching game sessions:', err));
  }
  
  function loadGameSessionKPIs(gameId) {
    fetch(`api/game_session_kpis.php?game_id=${gameId}`)
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('sessionKPIs');
        let content = `<p><strong>Rounds Played:</strong> ${data.rounds_played}</p>
                       <p><strong>Average Players per Round:</strong> ${data.avg_players}</p>
                       <p><strong>Average Teams per Round:</strong> ${data.avg_teams}</p>`;
        container.innerHTML = content;
      })
      .catch(err => console.error('Error loading game session KPIs:', err));
  }
  
  function loadDetailedScores(gameId) {
    // Fetch detailed scores for the game session.
    fetch(`api/game_session_detailed_scores.php?game_id=${gameId}`)
      .then(response => response.json())
      .then(data => {
        // Pivot the data: determine all unique rounds and players.
        const roundsSet = new Set();
        const playersMap = {}; // key: player_id, value: player_name
        data.forEach(row => {
          roundsSet.add(row.round_number);
          playersMap[row.player_id] = row.player_name;
        });
        const rounds = Array.from(roundsSet).sort((a, b) => a - b);
        
        // Create a pivot: for each player, for each round, store the points.
        const pivot = {}; // key: player_id, value: { round_number: points, ... }
        data.forEach(row => {
          if (!pivot[row.player_id]) {
            pivot[row.player_id] = {};
          }
          pivot[row.player_id][row.round_number] = row.points;
        });
        
        // Build the HTML table.
        let table = `<table>
                       <thead>
                         <tr>
                           <th>Player</th>`;
        rounds.forEach(round => {
          table += `<th>Round ${round}</th>`;
        });
        table += `</tr></thead><tbody>`;
        
        // For each player, create a row.
        for (const playerId in playersMap) {
          table += `<tr><td>${playersMap[playerId]}</td>`;
          rounds.forEach(round => {
            const points = pivot[playerId] && pivot[playerId][round] !== undefined ? pivot[playerId][round] : '';
            table += `<td>${points}</td>`;
          });
          table += `</tr>`;
        }
        table += `</tbody></table>`;
        
        document.getElementById('detailedScores').innerHTML = table;
      })
      .catch(err => console.error('Error loading detailed scores:', err));
  }
  
  function loadBestTeam() {
    fetch('api/best_team.php')
      .then(response => response.json())
      .then(teams => {
        const container = document.getElementById('bestTeam');
        if (!teams.length) {
          container.textContent = 'No team data available.';
          return;
        }
        let table = `<table>
                       <thead>
                         <tr>
                           <th>Team Combination</th>
                           <th>Rounds Played</th>
                           <th>Average Points</th>
                         </tr>
                       </thead>
                       <tbody>`;
        teams.forEach(team => {
          table += `<tr>
                      <td>${team.team_combination}</td>
                      <td>${team.rounds_played}</td>
                      <td>${team.average_points}</td>
                    </tr>`;
        });
        table += `</tbody></table>`;
        container.innerHTML = table;
      })
      .catch(err => console.error('Error loading best teams:', err));
  }