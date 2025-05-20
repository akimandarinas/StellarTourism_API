<template>
  <div class="system-info">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 class="font-bold mb-2">Cliente</h3>
        <ul class="space-y-1">
          <li><strong>Navegador:</strong> {{ browserInfo }}</li>
          <li><strong>Sistema Operativo:</strong> {{ osInfo }}</li>
          <li><strong>Versión de la App:</strong> {{ appVersion }}</li>
          <li><strong>Modo:</strong> {{ isDevelopment ? 'Desarrollo' : 'Producción' }}</li>
          <li><strong>URL Base API:</strong> {{ apiBaseUrl }}</li>
        </ul>
      </div>
      
      <div>
        <h3 class="font-bold mb-2">Conexión</h3>
        <ul class="space-y-1">
          <li><strong>Online:</strong> <span :class="isOnline ? 'text-green-600' : 'text-red-600'">{{ isOnline ? 'Sí' : 'No' }}</span></li>
          <li><strong>Tipo de Conexión:</strong> {{ connectionType }}</li>
          <li><strong>Velocidad:</strong> {{ connectionSpeed }}</li>
          <li><strong>Latencia API:</strong> {{ apiLatency }}</li>
        </ul>
      </div>
    </div>
    
    <div class="mt-4">
      <h3 class="font-bold mb-2">Entorno</h3>
      <ul class="space-y-1">
        <li v-for="(value, key) in envVars" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </li>
      </ul>
    </div>
    
    <div class="mt-4">
      <button @click="checkApiHealth" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
        Verificar Salud de la API
      </button>
      
      <div v-if="apiHealth" class="mt-2 p-3 rounded" :class="apiHealth.status === 'success' ? 'bg-green-100' : 'bg-red-100'">
        <p><strong>Estado:</strong> {{ apiHealth.status }}</p>
        <p><strong>Mensaje:</strong> {{ apiHealth.message }}</p>
        <p><strong>Tiempo de Respuesta:</strong> {{ apiHealth.responseTime }}ms</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { apiClient } from '../../services/api/client';

const isOnline = ref(navigator.onLine);
const connectionType = ref('Desconocido');
const connectionSpeed = ref('Desconocido');
const apiLatency = ref('Calculando...');
const apiHealth = ref(null);
const envVars = ref({});

// Información del navegador
const browserInfo = computed(() => {
  const ua = navigator.userAgent;
  let browser = 'Desconocido';
  
  if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    browser = 'Internet Explorer';
  }
  
  return browser;
});

// Información del sistema operativo
const osInfo = computed(() => {
  const ua = navigator.userAgent;
  let os = 'Desconocido';
  
  if (ua.includes('Windows NT')) {
    os = 'Windows';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iOS')) {
    os = 'iOS';
  }
  
  return os;
});

// Versión de la aplicación
const appVersion = computed(() => {
  return import.meta.env.VITE_APP_VERSION || 'No disponible';
});

// Modo de desarrollo
const isDevelopment = computed(() => {
  return import.meta.env.DEV === true;
});

// URL base de la API
const apiBaseUrl = computed(() => {
  return apiClient.getInstance().defaults.baseURL || 'No configurada';
});

// Verificar la salud de la API
async function checkApiHealth() {
  try {
    const startTime = performance.now();
    const response = await apiClient.get('/health');
    const endTime = performance.now();
    
    apiHealth.value = {
      status: response.data.status || 'success',
      message: response.data.message || 'API funcionando correctamente',
      responseTime: Math.round(endTime - startTime),
    };
  } catch (error) {
    apiHealth.value = {
      status: 'error',
      message: error.message || 'Error al verificar la salud de la API',
      responseTime: 0,
    };
  }
}

// Calcular la latencia de la API
async function calculateApiLatency() {
  try {
    const times = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = performance.now();
      await apiClient.get('/health');
      const endTime = performance.now();
      times.push(endTime - startTime);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    apiLatency.value = `${Math.round(avgTime)}ms`;
  } catch (error) {
    apiLatency.value = 'Error';
  }
}

// Obtener información de la conexión
function updateConnectionInfo() {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    connectionType.value = conn.effectiveType || 'Desconocido';
    connectionSpeed.value = conn.downlink ? `${conn.downlink} Mbps` : 'Desconocido';
  }
}

// Obtener variables de entorno públicas
function getPublicEnvVars() {
  const vars = {};
  
  Object.keys(import.meta.env).forEach(key => {
    // Solo incluir variables públicas (VITE_PUBLIC_*)
    if (key.startsWith('VITE_PUBLIC_')) {
      vars[key] = import.meta.env[key];
    }
  });
  
  envVars.value = vars;
}

// Eventos de conexión
window.addEventListener('online', () => isOnline.value = true);
window.addEventListener('offline', () => isOnline.value = false);

onMounted(() => {
  updateConnectionInfo();
  calculateApiLatency();
  getPublicEnvVars();
  
  // Actualizar información de conexión cuando cambie
  if ('connection' in navigator && navigator.connection) {
    navigator.connection.addEventListener('change', updateConnectionInfo);
  }
});
</script>
