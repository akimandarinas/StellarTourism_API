<template>
  <div class="endpoint-tester">
    <h2 class="text-xl font-bold mb-4">Probador de Endpoints</h2>
    
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Servicio</label>
      <select v-model="selectedService" class="w-full p-2 border rounded">
        <option value="destinos">Destinos</option>
        <option value="naves">Naves</option>
        <option value="reservas">Reservas</option>
      </select>
    </div>
    
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Método</label>
      <select v-model="selectedMethod" class="w-full p-2 border rounded">
        <option value="getAll">Obtener todos</option>
        <option value="getById">Obtener por ID</option>
        <option value="search">Buscar</option>
      </select>
    </div>
    
    <div v-if="selectedMethod === 'getById'" class="mb-6">
      <label class="block text-sm font-medium mb-2">ID</label>
      <input v-model="id" type="text" class="w-full p-2 border rounded" placeholder="ID del recurso">
    </div>
    
    <div v-if="selectedMethod === 'search'" class="mb-6">
      <label class="block text-sm font-medium mb-2">Término de búsqueda</label>
      <input v-model="searchTerm" type="text" class="w-full p-2 border rounded" placeholder="Término de búsqueda">
    </div>
    
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Parámetros adicionales (JSON)</label>
      <textarea v-model="paramsJson" class="w-full p-2 border rounded h-32" placeholder='{"limit": 10, "page": 1}'></textarea>
    </div>
    
    <button @click="testEndpoint" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Probar Endpoint
    </button>
    
    <div v-if="loading" class="mt-4">
      <p>Cargando...</p>
    </div>
    
    <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-800 rounded">
      <h3 class="font-bold">Error</h3>
      <pre>{{ error }}</pre>
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
import { ref, computed } from 'vue';
import { destinosService } from '../../services/destinos/destinos-service';
import { navesService } from '../../services/naves/naves-service';
import { reservasService } from '../../services/reservas/reservas-service';

const selectedService = ref('destinos');
const selectedMethod = ref('getAll');
const id = ref('1');
const searchTerm = ref('');
const paramsJson = ref('{}');
const loading = ref(false);
const error = ref(null);
const result = ref(null);

const service = computed(() => {
  switch (selectedService.value) {
    case 'destinos': return destinosService;
    case 'naves': return navesService;
    case 'reservas': return reservasService;
    default: return destinosService;
  }
});

async function testEndpoint() {
  loading.value = true;
  error.value = null;
  result.value = null;
  
  try {
    let params = {};
    try {
      params = JSON.parse(paramsJson.value);
    } catch (e) {
      error.value = `Error al parsear parámetros JSON: ${e.message}`;
      loading.value = false;
      return;
    }
    
    switch (selectedMethod.value) {
      case 'getAll':
        result.value = await service.value.getAll({ params });
        break;
      case 'getById':
        if (!id.value) {
          error.value = 'ID es requerido';
          loading.value = false;
          return;
        }
        result.value = await service.value.getById(id.value, { params });
        break;
      case 'search':
        if (!searchTerm.value) {
          error.value = 'Término de búsqueda es requerido';
          loading.value = false;
          return;
        }
        result.value = await service.value.search(searchTerm.value, { params });
        break;
      default:
        error.value = 'Método no soportado';
    }
  } catch (e) {
    error.value = e.message || 'Error desconocido';
    console.error('Error al probar endpoint:', e);
  } finally {
    loading.value = false;
  }
}
</script>
