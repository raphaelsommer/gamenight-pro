<template>
  <div>
    <div class="drag-container">
      <div class="list">
        <h2>Available Players</h2>
        <draggable v-model="availablePlayers" group="players" class="list-content">
          <div v-for="player in availablePlayers" :key="player.player_id" class="list-item">
            {{ player.name }}
          </div>
        </draggable>
      </div>
      <div class="list" v-for="(team, teamKey) in teams" :key="teamKey">
        <h2>{{ teamKey.toUpperCase() }}</h2>
        <draggable v-model="teams[teamKey]" group="players" class="list-content">
          <div v-for="player in teams[teamKey]" :key="`${teamKey}-${player.player_id}`" class="list-item">
            {{ player.name }}
          </div>
        </draggable>
      </div>
    </div>
    <button @click="handleSaveTeams">Save Teams</button>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import axios from 'axios';
export default {
  name: 'TeamFormationComp',
  components: { draggable },
  data() {
    return {
      availablePlayers: [],
      teams: {
        teamA: [],
        teamB: []
      }
    };
  },
  mounted() {
    axios.get('${API_BASE_URL}players')
      .then(response => { this.availablePlayers = response.data; })
      .catch(error => { console.error('Error fetching players:', error); });
  },
  methods: {
    handleSaveTeams() {
      axios.post('${API_BASE_URL}games/1/teams', this.teams)
        .then(() => { alert('Teams saved successfully'); })
        .catch(error => {
          console.error('Error saving teams:', error);
          alert('Failed to save teams');
        });
    }
  }
};
</script>

<style scoped>
.drag-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1em;
}
.list {
  width: 30%;
  background: #f5f5f5;
  padding: 1em;
  border-radius: 8px;
}
.list-content {
  min-height: 300px;
  padding: 1em;
  border: 1px dashed #ccc;
  border-radius: 4px;
}
.list-item {
  padding: 0.5em;
  margin-bottom: 0.5em;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  display: block;
  margin: 0 auto;
  padding: 0.5em 1em;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>