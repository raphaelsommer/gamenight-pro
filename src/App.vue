<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script>
import Header from './components/HeaderComp.vue';
export default {
  name: 'App',
  components: { Header }
};
</script>

<style>
/* Global styling as needed */
</style>