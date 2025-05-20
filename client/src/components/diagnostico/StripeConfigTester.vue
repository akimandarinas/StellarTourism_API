<template>
  <div class="stripe-config-tester">
    <h3 class="text-lg font-semibold mb-4">Configuración de Stripe</h3>
    
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <div class="mb-4 p-4 rounded" :class="statusClass">
        <p class="font-medium">{{ status.message }}</p>
        
        <div v-if="status.details" class="mt-2 text-sm">
          <p><strong>Modo:</strong> {{ status.details.mode }}</p>
          <p><strong>Clave pública:</strong> {{ status.details.publishableKey }}</p>
        </div>
      </div>
      
      <div class="mb-4">
        <h4 class="font-medium mb-2">Configuración actual:</h4>
        <div class="bg-gray-100 p-3 rounded text-sm">
          <p><strong>Modo:</strong> {{ stripeConfig.mode || 'No especificado' }}</p>
          <p><strong>Moneda:</strong> {{ paymentConfig.currency }}</p>
          <p><strong>Métodos de pago:</strong> {{ paymentConfig.supportedMethods.join(', ') }}</p>
          <p><strong>Planes en cuotas:</strong> {{ paymentConfig.installmentPlans.enabled ? 'Habilitado' : 'Deshabilitado' }}</p>
          <p><strong>Guardar método de pago:</strong> {{ paymentConfig.savePaymentMethod.enabled ? 'Habilitado' : 'Deshabilitado' }}</p>
        </div>
      </div>
      
      <div class="mt-4">
        <button 
          @click="checkStripeConfig" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          :disabled="loading"
        >
          Verificar configuración
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import stripeService from '../../services/stripe/stripe-service';
import { getStripeConfig, getPaymentConfig, isDevMode } from '../../config/stripe';

// Estado
const loading = ref(false);
const status = ref<{ success: boolean; message: string; details?: any }>({
  success: false,
  message: 'No verificado',
});

// Datos de configuración
const stripeConfig = computed(() => getStripeConfig());
const paymentConfig = computed(() => getPaymentConfig());

// Clases CSS para el estado
const statusClass = computed(() => {
  return status.value.success 
    ? 'bg-green-100 text-green-800 border border-green-200' 
    : 'bg-red-100 text-red-800 border border-red-200';
});

// Métodos
const checkStripeConfig = async () => {
  loading.value = true;
  try {
    status.value = await stripeService.checkStatus();
  } catch (error: any) {
    status.value = {
      success: false,
      message: `Error al verificar Stripe: ${error.message || 'Error desconocido'}`,
    };
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  await checkStripeConfig();
});
</script>
