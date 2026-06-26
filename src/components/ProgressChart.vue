<template>
  <div class="progress-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div v-if="!useExternalData" class="chart-period-selector">
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
        <p>{{ emptyMessage }}</p>
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
      default: ''
    },
    chartData: {
      type: Object,
      default: null
    },
    emptyMessage: {
      type: String,
      default: 'No data available for the selected period.'
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      chart: null,
      resolvedChartData: null,
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
    useExternalData() {
      return !!this.chartData;
    },
    hasData() {
      if (!this.resolvedChartData) return false;
      return this.resolvedChartData.labels.length > 0
        && (this.resolvedChartData.hasAnyData !== false
          || this.resolvedChartData.data.some((v) => v > 0));
    }
  },
  watch: {
    selectedPeriod() {
      if (!this.useExternalData) {
        this.fetchChartData();
      }
    },
    chartData: {
      deep: true,
      handler() {
        if (this.useExternalData) {
          this.applyExternalChartData();
        }
      }
    }
  },
  methods: {
    async fetchChartData() {
      if (this.useExternalData) {
        this.applyExternalChartData();
        return;
      }

      this.loading = true;
      this.error = null;
      this.resolvedChartData = null;
      this.loading = false;
    },

    applyExternalChartData() {
      this.error = null;
      this.resolvedChartData = this.chartData;
      this.$nextTick(() => this.renderChart());
    },
    
    renderChart() {
      if (!this.resolvedChartData || !this.hasData) {
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        return;
      }
      
      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      if (this.chart) {
        this.chart.destroy();
      }
      
      this.chart = new Chart(ctx, {
        type: this.type,
        data: {
          labels: this.resolvedChartData.labels,
          datasets: [
            {
              label: this.resolvedChartData.label || 'Progress',
              data: this.resolvedChartData.data,
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
