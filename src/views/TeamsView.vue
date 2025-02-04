<template>
    <div class="teams">
      <h1>Team Formation</h1>
      <TeamFormation />
    </div>
  </template>
  
  <script>
  import TeamFormation from '../components/TeamFormationComp.vue';
  export default {
    name: 'TeamsView',
    components: { TeamFormation }
  };
  </script>
  
  <style scoped>
  .teams {
    padding: 2em;
  }
  </style>