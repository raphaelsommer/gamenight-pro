<template>
    <div>
      <canvas v-if="chartData" ref="chartCanvas"></canvas>
      <div v-else>Loading...</div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import Chart from 'chart.js/auto';
  import axios from 'axios';
  export default {
    name: 'ScoreboardChartComp',
    props: {
      gameTypeId: {
        type: [String, Number],
        default: ''
      }
    },
    setup(props) {
      const chartData = ref(null);
      const chartInstance = ref(null);
      const chartCanvas = ref(null);
  
      const fetchData = () => {
        let url = '${API_BASE_URL}scoreboard';
        if (props.gameTypeId) {
          url += '?game_type_id=' + props.gameTypeId;
        }
        axios.get(url)
          .then(response => {
            const data = response.data;
            if (Array.isArray(data)) {
              // Single game type scoreboard view
              const labels = data.map(item => item.player_name);
              const points = data.map(item => item.total_points);
              chartData.value = {
                labels,
                datasets: [{
                  label: 'Points',
                  data: points,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }]
              };
            } else {
              // Overall view: for simplicity, display the first game type's results.
              const types = Object.keys(data);
              if (types.length > 0) {
                const scores = data[types[0]].scores;
                const labels = scores.map(item => item.player_name);
                const points = scores.map(item => item.total_points);
                chartData.value = {
                  labels,
                  datasets: [{
                    label: types[0] + ' Points',
                    data: points,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                  }]
                };
              }
            }
            renderChart();
          })
          .catch(error => console.error('Error fetching scoreboard data:', error));
      };
  
      const renderChart = () => {
        if (chartInstance.value) chartInstance.value.destroy();
        if (chartData.value && chartCanvas.value) {
          chartInstance.value = new Chart(chartCanvas.value, {
            type: 'bar',
            data: chartData.value,
            options: { responsive: true, plugins: { legend: { position: 'top' } } }
          });
        }
      };
  
      onMounted(fetchData);
      watch(() => props.gameTypeId, fetchData);
  
      return { chartData, chartCanvas };
    }
  };
  </script>
  
  <style scoped>
  /* Optional chart container styling */
  </style>