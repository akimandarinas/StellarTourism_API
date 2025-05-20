<template>
  <div class="service-status">
    <h3 class="status-title">Service Status</h3>
    
    <div v-if="isLoading" class="status-loading">
      Checking services...
    </div>
    
    <div v-else-if="error" class="status-error">
      Error checking services: {{ error.message }}
      <button @click="checkServices" class="retry-button">
        Retry
      </button>
    </div>
    
    <ul v-else class="status-list">
      <li 
        v-for="(isHealthy, service) in servicesStatus" 
        :key="service"
        class="status-item"
        :class="{ 'status-healthy': isHealthy, 'status-unhealthy': !isHealthy }"
      >
        <span class="service-name">{{ service }}</span>
        <span class="status-indicator">
          {{ isHealthy ? 'Healthy' : 'Unhealthy' }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useServiceDiscovery } from '../composables/useServiceDiscovery';

const { servicesStatus, isLoading, error, checkServices } = useServiceDiscovery();
</script>

<style scoped>
.service-status {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #f8fafc;
}

.status-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.status-loading {
  color: #64748b;
  font-style: italic;
}

.status-error {
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.retry-button {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #dc2626;
}

.status-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.status-item:last-child {
  border-bottom: none;
}

.service-name {
  font-weight: 500;
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.status-healthy .status-indicator {
  background-color: #10b981;
  color: white;
}

.status-unhealthy .status-indicator {
  background-color: #ef4444;
  color: white;
}
</style>
