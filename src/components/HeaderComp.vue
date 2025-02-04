<template>
    <header>
      <nav>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/teams">Teams</router-link></li>
          <li><router-link to="/scoreboard">Scoreboard</router-link></li>
          <li><router-link to="/players">Players</router-link></li>
        </ul>
        <LoginButton />
      </nav>
    </header>
  </template>
  
  <script>
  import LoginButton from './LoginButtonComp.vue';
  export default {
    name: 'HeaderComp',
    components: { LoginButton }
  };
  </script>
  
  <style scoped>
  header {
    background-color: #1976d2;
    color: white;
    padding: 1em;
  }
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  ul {
    list-style: none;
    display: flex;
    gap: 1em;
    margin: 0;
    padding: 0;
  }
  a {
    color: white;
    text-decoration: none;
  }
  </style>