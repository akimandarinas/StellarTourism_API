<template>
  <div class="auth-checker">
    <div class="status-container">
      <h2 class="text-xl font-semibold mb-4">Estado de Autenticación</h2>
      
      <div class="status-indicator" :class="{ 'bg-green-500': isAuthenticated, 'bg-red-500': !isAuthenticated }">
        {{ isAuthenticated ? 'Autenticado' : 'No autenticado' }}
      </div>
      
      <div v-if="isAuthenticated" class="user-info mt-4">
        <p><strong>Usuario:</strong> {{ currentUser?.email }}</p>
        <p><strong>ID:</strong> {{ currentUser?.uid }}</p>
        <p><strong>Nombre:</strong> {{ currentUser?.displayName || 'No disponible' }}</p>
        <p><strong>Token válido:</strong> {{ isTokenValid ? 'Sí' : 'No' }}</p>
        <p><strong>Expira en:</strong> {{ tokenExpiryFormatted }}</p>
      </div>
      
      <div v-if="!isAuthenticated" class="login-prompt mt-4">
        <p>No hay sesión activa. Por favor inicia sesión para continuar.</p>
      </div>
      
      <div class="actions mt-6">
        <button 
          v-if="!isAuthenticated" 
          @click="authLogin" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Cargando...' : 'Iniciar sesión de prueba' }}
        </button>
        
        <button 
          v-if="isAuthenticated" 
          @click="authLogout" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Cargando...' : 'Cerrar sesión' }}
        </button>
        
        <button 
          v-if="isAuthenticated" 
          @click="checkToken" 
          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          :disabled="isLoading"
        >
          Verificar token
        </button>
      </div>
    </div>
    
    <div class="api-status mt-8">
      <h2 class="text-xl font-semibold mb-4">Estado de la API</h2>
      
      <div v-if="apiStatus" class="status-indicator" 
           :class="{ 'bg-green-500': apiStatus.success, 'bg-red-500': !apiStatus.success }">
        {{ apiStatus.message }}
      </div>
      
      <button 
        @click="checkApiConnection" 
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        :disabled="isCheckingApi"
      >
        {{ isCheckingApi ? 'Verificando...' : 'Verificar conexión con API' }}
      </button>
      
      <div v-if="apiStatus && apiStatus.details" class="mt-4">
        <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-40">{{ JSON.stringify(apiStatus.details, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="error-container mt-6" v-if="error">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { checkApiConnection } from '../../utils/api-connection-check';
import { tokenStorage } from '../../services/auth/token-storage';

// Estado
const isLoading = ref(false);
const error = ref<string | null>(null);
const apiStatus = ref<{ success: boolean; message: string; details?: any } | null>(null);
const isCheckingApi = ref(false);

// Composables
const { isAuthenticated, currentUser, login: authLogin, logout: authLogout } = useAuth();

// Computed
const isTokenValid = computed(() => {
  return tokenStorage.validateToken();
});

const tokenExpiryFormatted = computed(() => {
  const expiresAt = tokenStorage.getTokenExpiry();
  if (!expiresAt) return 'No disponible';
  
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expirado';
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  
  return `${diffMins} min ${diffSecs} seg`;
});

const checkToken = () => {
  try {
    error.value = null;
    const isValid = tokenStorage.validateToken();
    const token = tokenStorage.getAccessToken();
    const expiresAt = tokenStorage.getTokenExpiry();
    
    console.log('Token válido:', isValid);
    console.log('Expira en:', expiresAt ? new Date(expiresAt).toLocaleString() : 'No disponible');
    console.log('Token (primeros 20 caracteres):', token ? `${token.substring(0, 20)}...` : 'No disponible');
  } catch (err: any) {
    error.value = err.message || 'Error al verificar token';
    console.error('Error al verificar token:', err);
  }
};

const checkApiConnection = async () => {
  try {
    isCheckingApi.value = true;
    error.value = null;
    apiStatus.value = await checkApiConnection();
  } catch (err: any) {
    error.value = err.message || 'Error al verificar conexión con API';
    console.error('Error al verificar conexión con API:', err);
  } finally {
    isCheckingApi.value = false;
  }
};

onMounted(() => {
  checkApiConnection();
});
</script>

<style scoped>
.auth-checker {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.status-container, .api-status {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
}

.user-info p {
  margin-bottom: 8px;
}
</style>
