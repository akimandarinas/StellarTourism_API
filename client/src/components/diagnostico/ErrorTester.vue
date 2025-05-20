<template>
  <div class="error-tester">
    <h2 class="text-xl font-bold mb-4">Probador de Errores</h2>
    
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Tipo de Error</label>
      <select v-model="selectedErrorType" class="w-full p-2 border rounded">
        <option value="network">Error de Red</option>
        <option value="timeout">Timeout</option>
        <option value="not_found">Recurso no encontrado (404)</option>
        <option value="unauthorized">No autorizado (401)</option>
        <option value="forbidden">Prohibido (403)</option>
        <option value="validation">Error de validación (422)</option>
        <option value="server">Error del servidor (500)</option>
      </select>
    </div>
    
    <button @click="testError" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Probar Error
    </button>
    
    <div v-if="loading" class="mt-4">
      <p>Cargando...</p>
    </div>
    
    <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-800 rounded">
      <h3 class="font-bold">Error Capturado</h3>
      <div class="mt-2">
        <p><strong>Código:</strong> {{ error.code }}</p>
        <p><strong>Mensaje:</strong> {{ error.message }}</p>
        <p><strong>Estado:</strong> {{ error.status }}</p>
      </div>
      <div class="mt-2">
        <h4 class="font-bold">Detalles:</h4>
        <pre class="mt-1 text-xs overflow-auto max-h-40">{{ JSON.stringify(error.details, null, 2) }}</pre>
      </div>
    </div>
    
    <div v-if="result" class="mt-4">
      <h3 class="font-bold mb-2">Resultado</h3>
      <div class="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { apiClient } from '../../services/api/client';

const selectedErrorType = ref('network');
const loading = ref(false);
const error = ref(null);
const result = ref(null);

async function testError() {
  loading.value = true;
  error.value = null;
  result.value = null;
  
  try {
    switch (selectedErrorType.value) {
      case 'network':
        // Simular error de red cambiando la URL base
        const originalBaseURL = apiClient.getInstance().defaults.baseURL;
        apiClient.getInstance().defaults.baseURL = 'http://invalid-domain-that-does-not-exist.com';
        
        try {
          await apiClient.get('/test');
        } catch (e) {
          error.value = e;
        } finally {
          // Restaurar URL base
          apiClient.getInstance().defaults.baseURL = originalBaseURL;
        }
        break;
        
      case 'timeout':
        // Simular timeout reduciendo el timeout a 1ms
        const originalTimeout = apiClient.getInstance().defaults.timeout;
        apiClient.getInstance().defaults.timeout = 1;
        
        try {
          await apiClient.get('/test');
        } catch (e) {
          error.value = e;
        } finally {
          // Restaurar timeout
          apiClient.getInstance().defaults.timeout = originalTimeout;
        }
        break;
        
      case 'not_found':
        // Intentar acceder a un recurso que no existe
        try {
          await apiClient.get('/recurso-que-no-existe');
        } catch (e) {
          error.value = e;
        }
        break;
        
      case 'unauthorized':
        // Intentar acceder a un recurso protegido sin autenticación
        try {
          await apiClient.get('/auth/perfil');
        } catch (e) {
          error.value = e;
        }
        break;
        
      case 'forbidden':
        // Intentar acceder a un recurso prohibido
        try {
          await apiClient.get('/admin/usuarios');
        } catch (e) {
          error.value = e;
        }
        break;
        
      case 'validation':
        // Enviar datos inválidos
        try {
          await apiClient.post('/reservas', {});
        } catch (e) {
          error.value = e;
        }
        break;
        
      case 'server':
        // Intentar provocar un error del servidor
        try {
          await apiClient.get('/test-error-500');
        } catch (e) {
          error.value = e;
        }
        break;
        
      default:
        error.value = { message: 'Tipo de error no soportado' };
    }
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
}
</script>
