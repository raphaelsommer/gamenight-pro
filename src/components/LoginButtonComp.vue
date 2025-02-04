<template>
    <button @click="handleLogin">Login with Google</button>
  </template>
  
  <script>
  import { API_BASE_URL } from '../config';

  export default {
    name: 'LoginButtonComp',
    methods: {
      handleLogin() {
        // Redirect to backend OAuth endpoint
        window.location.href = `${API_BASE_URL}oauth/redirect`;
      }
    }
  };
  </script>
  
  <style scoped>
  button {
    background-color: #dc004e;
    color: white;
    border: none;
    padding: 0.5em 1em;
    cursor: pointer;
    border-radius: 4px;
  }
  </style>