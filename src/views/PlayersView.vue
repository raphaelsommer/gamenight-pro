<template>
    <div class="players">
      <h1>Manage Players</h1>
      <div class="player-form">
        <input v-model="newPlayerName" placeholder="Player Name" />
        <button @click="handleAddPlayer">Add Player</button>
      </div>
      <ul class="player-list">
        <li v-for="player in players" :key="player.player_id">
          {{ player.name }}
          <button @click="handleDeletePlayer(player.player_id)">Delete</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    name: 'PlayersView',
    data() {
      return {
        players: [],
        newPlayerName: ''
      };
    },
    mounted() {
      this.fetchPlayers();
    },
    methods: {
      fetchPlayers() {
        axios.get('${API_BASE_URL}players')
          .then(response => { this.players = response.data; })
          .catch(error => { console.error('Error fetching players:', error); });
      },
      handleAddPlayer() {
        if (!this.newPlayerName) return;
        axios.post('${API_BASE_URL}players', { name: this.newPlayerName })
          .then(() => {
            this.newPlayerName = '';
            this.fetchPlayers();
          })
          .catch(error => { console.error('Error adding player:', error); });
      },
      handleDeletePlayer(playerId) {
        // Implement delete functionality if the API supports DELETE
        alert('Delete functionality not implemented, but would delete player with ID: ' + playerId);
      }
    }
  };
  </script>
  
  <style scoped>
  .players {
    padding: 2em;
  }
  .player-form {
    margin-bottom: 1em;
  }
  .player-list {
    list-style: none;
    padding: 0;
  }
  .player-list li {
    margin-bottom: 0.5em;
    display: flex;
    justify-content: space-between;
  }
  button {
    background: #1976d2;
    color: white;
    border: none;
    padding: 0.3em 0.6em;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>