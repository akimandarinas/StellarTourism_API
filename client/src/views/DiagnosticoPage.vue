<template>
  <div class="diagnostico-page p-6">
    <h1 class="text-2xl font-bold mb-6">Diagnóstico del Sistema</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-bold mb-4">Estado de la Conexión</h2>
        <AuthChecker />
      </div>
      
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-bold mb-4">Información del Sistema</h2>
        <SystemInfo />
      </div>
    </div>
    
    <div class="mt-6 bg-white p-6 rounded shadow">
      <h2 class="text-xl font-bold mb-4">Verificación de Rutas</h2>
      <RouteChecker />
    </div>
    
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-bold mb-4">Configuración de Firebase</h2>
        <FirebaseChecker />
      </div>
      
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-bold mb-4">Autenticación de Firebase</h2>
        <FirebaseAuthTester />
      </div>
    </div>
    
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-bold mb-4">Configuración de Stripe</h2>
        <StripeConfigTester />
      </div>
      
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-bold mb-4">Prueba de Pagos con Stripe</h2>
        <StripePaymentTester />
      </div>
    </div>
    
    <div class="mt-6 bg-white p-6 rounded shadow">
      <EndpointTester />
    </div>
    
    <div class="mt-6 bg-white p-6 rounded shadow">
      <ErrorTester />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { config } from '../config';
import firebaseConfig from '../config/firebase';
import AuthChecker from '../components/auth/AuthChecker.vue';
import SystemInfo from '../components/diagnostico/SystemInfo.vue';
import EndpointTester from '../components/diagnostico/EndpointTester.vue';
import ErrorTester from '../components/diagnostico/ErrorTester.vue';
import RouteChecker from '../components/diagnostico/RouteChecker.vue';
import FirebaseChecker from '../components/diagnostico/FirebaseChecker.vue';
import FirebaseAuthTester from '../components/diagnostico/FirebaseAuthTester.vue';
import StripeConfigTester from '../components/diagnostico/StripeConfigTester.vue';
import StripePaymentTester from '../components/diagnostico/StripePaymentTester.vue';
import { checkMainEndpoints } from '../utils/api-connection-check';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Estado
const error = ref<string | null>(null);
const apiConfig = ref(config.api);
const isCheckingEndpoints = ref(false);
const endpointsStatus = ref<{ 
  success: boolean; 
  results: Record<string, { success: boolean; status?: number; message: string }> 
} | null>(null);
const isCheckingFirebase = ref(false);
const firebaseStatus = ref<{ success: boolean; message: string } | null>(null);

// Métodos
const checkEndpoints = async () => {
  try {
    isCheckingEndpoints.value = true;
    error.value = null;
    endpointsStatus.value = await checkMainEndpoints();
  } catch (err: any) {
    error.value = err.message || 'Error al verificar endpoints';
    console.error('Error al verificar endpoints:', err);
  } finally {
    isCheckingEndpoints.value = false;
  }
};

const checkFirebase = async () => {
  try {
    isCheckingFirebase.value = true;
    error.value = null;
    
    // Intentar iniciar sesión anónima para verificar la conexión con Firebase
    const auth = getAuth();
    await signInAnonymously(auth);
    
    firebaseStatus.value = {
      success: true,
      message: 'Conexión con Firebase establecida correctamente'
    };
  } catch (err: any) {
    firebaseStatus.value = {
      success: false,
      message: `Error al conectar con Firebase: ${err.message || 'Error desconocido'}`
    };
    console.error('Error al verificar Firebase:', err);
  } finally {
    isCheckingFirebase.value = false;
  }
};

// Utilidades
const maskString = (str: string | undefined): string => {
  if (!str) return 'No disponible';
  if (str.length <= 8) return '********';
  return str.substring(0, 4) + '****' + str.substring(str.length - 4);
};

// Lifecycle hooks
onMounted(() => {
  // Verificar endpoints al montar el componente
  checkEndpoints();
});
</script>

<style scoped>
.diagnostico-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
