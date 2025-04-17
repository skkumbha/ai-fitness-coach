<template>
  <div class="progress-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-period-selector">
        <button 
          v-for="period in periods" 
          :key="period.value" 
          class="period-button"
          :class="{ active: selectedPeriod === period.value }"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
      <div v-if="loading" class="chart-loading">
        <LoadingSpinner size="small" />
      </div>
      <div v-if="error" class="chart-error">
        <ErrorMessage 
          :message="error" 
          showRetry 
          @retry="fetchChartData"
        />
      </div>
      <div v-if="!loading && !error && !hasData" class="chart-empty">
        <i class="fas fa-chart-line"></i>
        <p>No data available for the selected period.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import LoadingSpinner from './LoadingSpinner.vue';
import ErrorMessage from './ErrorMessage.vue';

export default {
  name: 'ProgressChart',
  components: {
    LoadingSpinner,
    ErrorMessage
  },
  props: {
    title: {
      type: String,
      default: 'Progress'
    },
    type: {
      type: String,
      default: 'line',
      validator: (value) => ['line', 'bar'].includes(value)
    },
    endpoint: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      chart: null,
      chartData: null,
      selectedPeriod: 'week',
      periods: [
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
        { label: '3 Months', value: 'quarter' },
        { label: 'Year', value: 'year' }
      ]
    };
  },
  computed: {
    hasData() {
      return !!this.chartData && this.chartData.labels.length > 0;
    }
  },
  watch: {
    selectedPeriod() {
      this.fetchChartData();
    }
  },
  methods: {
    async fetchChartData() {
      this.loading = true;
      this.error = null;
      
      try {
        // For demonstration, we would call an API endpoint here
        // const response = await this.$store.dispatch('fetchChartData', {
        //   endpoint: this.endpoint,
        //   period: this.selectedPeriod
        // });
        // this.chartData = response;
        
        // Simulating API call - this would be replaced with actual API data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This is sample data - would be replaced with actual data from API
        this.chartData = this.generateSampleData();
        
        this.renderChart();
      } catch (error) {
        this.error = error.message || 'Failed to load chart data.';
      } finally {
        this.loading = false;
      }
    },
    
    renderChart() {
      if (!this.chartData) return;
      
      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      // Destroy previous chart instance if it exists
      if (this.chart) {
        this.chart.destroy();
      }
      
      // Create new chart
      this.chart = new Chart(ctx, {
        type: this.type,
        data: {
          labels: this.chartData.labels,
          datasets: [
            {
              label: this.chartData.label,
              data: this.chartData.data,
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              borderColor: 'rgba(76, 175, 80, 1)',
              borderWidth: 2,
              tension: 0.3,
              pointBackgroundColor: 'rgba(76, 175, 80, 1)',
              pointBorderColor: '#fff',
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#212121',
              bodyColor: '#212121',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4
            }
          }
        }
      });
    },
    
    // This method is for demonstration only and would be removed in production
    generateSampleData() {
      const labels = [];
      const data = [];
      let days = 7;
      
      switch (this.selectedPeriod) {
        case 'week':
          days = 7;
          for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(Math.floor(Math.random() * 100));
          }
          break;
        case 'month':
          days = 30;
          for (let i = 0; i < days; i += 3) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(Math.floor(Math.random() * 100));
          }
          break;
        case 'quarter':
          days = 90;
          for (let i = 0; i < days; i += 7) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(Math.floor(Math.random() * 100));
          }
          break;
        case 'year':
          for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
            data.push(Math.floor(Math.random() * 100));
          }
          break;
      }
      
      return {
        labels,
        data,
        label: 'Progress'
      };
    }
  },
  mounted() {
    this.fetchChartData();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
.progress-chart {
  background-color: var(--card-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.chart-title {
  font-size: var(--font-size-md);
  margin: 0;
}

.chart-period-selector {
  display: flex;
}

.period-button {
  background: none;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-left: var(--spacing-xs);
  color: var(--text-secondary);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.period-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.period-button.active {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--primary-color);
  font-weight: 500;
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart-loading,
.chart-error,
.chart-empty {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.chart-empty {
  color: var(--text-tertiary);
  text-align: center;
}

.chart-empty i {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
  opacity: 0.3;
}

@media (max-width: 576px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-period-selector {
    margin-top: var(--spacing-sm);
    width: 100%;
    justify-content: space-between;
  }
  
  .period-button {
    margin-left: 0;
    flex: 1;
    text-align: center;
    font-size: var(--font-size-xs);
  }
}
</style>
