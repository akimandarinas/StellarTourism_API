<template>
  <div class="env-checker">
    <h2 class="text-xl font-semibold mb-4">Verificación de Variables de Entorno</h2>
    
    <div class="grid gap-4">
      <div v-for="(env, index) in envVars" :key="index" class="p-4 border rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-lg font-medium">{{ env.name }}</span>
            <span class="ml-2 px-2 py-1 text-xs rounded-full" 
              :class="env.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ env.status }}
            </span>
          </div>
          <span v-if="env.valid" class="text-green-500">✓</span>
          <span v-else class="text-red-500">✗</span>
        </div>
        <p class="mt-1 text-sm text-gray-600">{{ env.description }}</p>
        <p v-if="!env.valid" class="mt-2 text-sm text-red-600">
          {{ env.message }}
        </p>
      </div>
    </div>
    
    <div class="mt-6">
      <div v-if="allEnvVarsValid" class="p-4 bg-green-100 text-green-800 rounded-lg">
        Todas las variables de entorno están configuradas correctamente.
      </div>
      <div v-else class="p-4 bg-red-100 text-red-800 rounded-lg">
        Hay variables de entorno mal configuradas. Por favor, revisa los detalles arriba.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const envVars = ref([
  {
    name: 'PUBLIC_API_URL',
    description: 'URL base de la API',
    value: import.meta.env.PUBLIC_API_URL,
    valid: !!import.meta.env.PUBLIC_API_URL && import.meta.env.PUBLIC_API_URL.startsWith('http'),
    status: !!import.meta.env.PUBLIC_API_URL ? 'Configurada' : 'No configurada',
    message: !import.meta.env.PUBLIC_API_URL ? 
      'Esta variable es necesaria para conectarse a la API.' : 
      (!import.meta.env.PUBLIC_API_URL.startsWith('http') ? 
        'La URL debe comenzar con http:// o https://' : '')
  },
  {
    name: 'VITE_FIREBASE_API_KEY',
    description: 'Clave de API de Firebase',
    value: import.meta.env.VITE_FIREBASE_API_KEY,
    valid: !!import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY.length > 10,
    status: !!import.meta.env.VITE_FIREBASE_API_KEY ? 'Configurada' : 'No configurada',
    message: !import.meta.env.VITE_FIREBASE_API_KEY ? 
      'Esta variable es necesaria para la autenticación con Firebase.' : 
      (import.meta.env.VITE_FIREBASE_API_KEY.length <= 10 ? 
        'La clave de API parece ser demasiado corta.' : '')
  },
  {
    name: 'VITE_FIREBASE_AUTH_DOMAIN',
    description: 'Dominio de autenticación de Firebase',
    value: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    valid: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN.includes('.'),
    status: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Configurada' : 'No configurada',
    message: !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 
      'Esta variable es necesaria para la autenticación con Firebase.' : 
      (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN.includes('.') ? 
        'El dominio debe incluir un punto (.)' : '')
  },
  {
    name: 'VITE_FIREBASE_PROJECT_ID',
    description: 'ID del proyecto de Firebase',
    value: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    valid: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    status: !!import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Configurada' : 'No configurada',
    message: !import.meta.env.VITE_FIREBASE_PROJECT_ID ? 
      'Esta variable es necesaria para la autenticación con Firebase.' : ''
  },
  {
    name: 'VITE_STRIPE_PUBLISHABLE_KEY',
    description: 'Clave publicable de Stripe',
    value: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    valid: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && 
      (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_') || 
       import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')),
    status: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Configurada' : 'No configurada',
    message: !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 
      'Esta variable es necesaria para procesar pagos con Stripe.' : 
      (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_') && 
       !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_') ? 
        'La clave debe comenzar con pk_test_ o pk_live_' : '')
  }
]);

const allEnvVarsValid = computed(() => {
  return envVars.value.every(env => env.valid);
});
</script>
