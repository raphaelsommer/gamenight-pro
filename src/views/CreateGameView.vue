<template>
    <div class="create-game">
      <h1>Create New Game</h1>
      <form @submit.prevent="handleCreateGame">
        <div>
          <label for="name">Game Name:</label>
          <input type="text" id="name" v-model="game.name" required />
        </div>
        <div>
          <label for="date">Game Date:</label>
          <input type="date" id="date" v-model="game.date" required />
        </div>
        <div>
          <label for="gameType">Select Game Type:</label>
          <select id="gameType" v-model="game.game_type_id" required>
            <option v-for="type in gameTypes" :key="type.id" :value="type.id">
              {{ type.name }} ({{ type.score_direction === 'higher' ? 'Higher is better' : 'Lower is better' }})
            </option>
          </select>
        </div>
        <button type="submit">Create Game</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    name: 'CreateGameView',
    data() {
      return {
        game: {
          name: '',
          date: '',
          game_type_id: null
        },
        gameTypes: []
      };
    },
    mounted() {
      this.fetchGameTypes();
    },
    methods: {
      fetchGameTypes() {
        axios.get('${API_BASE_URL}game_types')
          .then(response => { this.gameTypes = response.data; })
          .catch(error => console.error('Error fetching game types:', error));
      },
      handleCreateGame() {
        axios.post('${API_BASE_URL}games', this.game)
          .then(() => {
            alert('Game created successfully!');
            this.$router.push('/scoreboard');
          })
          .catch(error => {
            console.error('Error creating game:', error);
            alert('Failed to create game');
          });
      }
    }
  };
  </script>
  
  <style scoped>
  .create-game {
    padding: 2em;
  }
  .create-game form > div {
    margin-bottom: 1em;
  }
  button {
    padding: 0.5em 1em;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>