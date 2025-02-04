import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Teams from '../views/TeamsView.vue';
import Scoreboard from '../views/ScoreboardView.vue';
import Players from '../views/PlayersView.vue';
import CreateGame from '../views/CreateGameView.vue';

const routes = [
  { path: '/', name: 'HomeView', component: Home },
  { path: '/teams', name: 'TeamsView', component: Teams },
  { path: '/scoreboard', name: 'ScoreboardView', component: Scoreboard },
  { path: '/players', name: 'PlayersView', component: Players },
  { path: '/create-game', name: 'CreateGameView', component: CreateGame }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;