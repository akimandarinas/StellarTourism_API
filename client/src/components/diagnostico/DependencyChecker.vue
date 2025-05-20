<template>
  <div class="dependency-checker">
    <h2 class="text-xl font-semibold mb-4">Verificación de Dependencias</h2>
    
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-2">Verificando dependencias...</span>
    </div>
    
    <div v-else>
      <div class="grid gap-4">
        <!-- Vue -->
        <div class="p-4 border rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-lg font-medium">Vue</span>
              <span class="ml-2 px-2 py-1 text-xs rounded-full" 
                :class="dependencies.vue.compatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ dependencies.vue.version }}
              </span>
            </div>
            <span v-if="dependencies.vue.compatible" class="text-green-500">✓</span>
            <span v-else class="text-red-500">✗</span>
          </div>
          <p v-if="!dependencies.vue.compatible" class="mt-2 text-sm text-red-600">
            {{ dependencies.vue.message }}
          </p>
        </div>
        
        <!-- Firebase -->
        <div class="p-4 border rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-lg font-medium">Firebase</span>
              <span class="ml-2 px-2 py-1 text-xs rounded-full" 
                :class="dependencies.firebase.compatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ dependencies.firebase.version }}
              </span>
            </div>
            <span v-if="dependencies.firebase.compatible" class="text-green-500">✓</span>
            <span v-else class="text-red-500">✗</span>
          </div>
          <p v-if="!dependencies.firebase.compatible" class="mt-2 text-sm text-red-600">
            {{ dependencies.firebase.message }}
          </p>
        </div>
        
        <!-- Axios -->
        <div class="p-4 border rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-lg font-medium">Axios</span>
              <span class="ml-2 px-2 py-1 text-xs rounded-full" 
                :class="dependencies.axios.compatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ dependencies.axios.version }}
              </span>
            </div>
            <span v-if="dependencies.axios.compatible" class="text-green-500">✓</span>
            <span v-else class="text-red-500">✗</span>
          </div>
          <p v-if="!dependencies.axios.compatible" class="mt-2 text-sm text-red-600">
            {{ dependencies.axios.message }}
          </p>
        </div>
        
        <!-- Stripe -->
        <div class="p-4 border rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-lg font-medium">Stripe</span>
              <span class="ml-2 px-2 py-1 text-xs rounded-full" 
                :class="dependencies.stripe.compatible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ dependencies.stripe.version }}
              </span>
            </div>
            <span v-if="dependencies.stripe.compatible" class="text-green-500">✓</span>
            <span v-else class="text-red-500">✗</span>
          </div>
          <p v-if="!dependencies.stripe.compatible" class="mt-2 text-sm text-red-600">
            {{ dependencies.stripe.message }}
          </p>
        </div>
      </div>
      
      <div class="mt-6">
        <div v-if="allDependenciesCompatible" class="p-4 bg-green-100 text-green-800 rounded-lg">
          Todas las dependencias son compatibles.
        </div>
        <div v-else class="p-4 bg-red-100 text-red-800 rounded-lg">
          Hay dependencias incompatibles. Por favor, revisa los detalles arriba.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { version as vueVersion } from 'vue';
import { version as firebaseVersion } from 'firebase/app';
import axios from 'axios';
import { version as stripeVersion } from '@stripe/stripe-js';

const loading = ref(true);
const dependencies = ref({
  vue: {
    version: '',
    compatible: false,
    message: ''
  },
  firebase: {
    version: '',
    compatible: false,
    message: ''
  },
  axios: {
    version: '',
    compatible: false,
    message: ''
  },
  stripe: {
    version: '',
    compatible: false,
    message: ''
  }
});

const allDependenciesCompatible = computed(() => {
  return Object.values(dependencies.value).every(dep => dep.compatible);
});

onMounted(async () => {
  try {
    // Verificar Vue
    dependencies.value.vue.version = vueVersion;
    const vueMajorVersion = parseInt(vueVersion.split('.')[0], 10);
    dependencies.value.vue.compatible = vueMajorVersion === 3;
    if (!dependencies.value.vue.compatible) {
      dependencies.value.vue.message = `Se requiere Vue 3.x, pero tienes ${vueVersion}`;
    }
    
    // Verificar Firebase
    dependencies.value.firebase.version = firebaseVersion;
    const firebaseMajorVersion = parseInt(firebaseVersion.split('.')[0], 10);
    dependencies.value.firebase.compatible = firebaseMajorVersion >= 9;
    if (!dependencies.value.firebase.compatible) {
      dependencies.value.firebase.message = `Se requiere Firebase 9.x o superior, pero tienes ${firebaseVersion}`;
    }
    
    // Verificar Axios
    dependencies.value.axios.version = axios.VERSION || 'desconocida';
    dependencies.value.axios.compatible = true; // Asumimos que cualquier versión de Axios es compatible
    
    // Verificar Stripe
    dependencies.value.stripe.version = stripeVersion || 'desconocida';
    dependencies.value.stripe.compatible = true; // Asumimos que cualquier versión de Stripe es compatible
  } catch (error) {
    console.error('Error al verificar dependencias:', error);
  } finally {
    loading.value = false;
  }
});
</script>
