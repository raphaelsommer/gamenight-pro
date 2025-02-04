<template>
    <div class="scoreboard">
      <h1>Scoreboard</h1>
      <div>
        <label for="filter">Filter by Game Type:</label>
        <select id="filter" v-model="selectedGameType">
          <option value="">Overall</option>
          <option v-for="type in gameTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>
      <ScoreboardChart :gameTypeId="selectedGameType" />
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import ScoreboardChart from '../components/ScoreboardChartComp.vue';
  export default {
    name: 'ScoreboardView',
    components: { ScoreboardChart },
    data() {
      return {
        gameTypes: [],
        selectedGameType: ''
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
      }
    }
  };
  </script>
  
  <style scoped>
  .scoreboard {
    padding: 2em;
  }
  </style>