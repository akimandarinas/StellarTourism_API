<template>
  <div class="saved-payment-methods">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Cargando métodos de pago..." />
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <AlertCircle class="error-icon" />
        <p>{{ error }}</p>
      </div>
      <button @click="loadPaymentMethods" class="btn btn-primary">
        Reintentar
      </button>
    </div>
    
    <div v-else>
      <div class="section-header">
        <h3>Métodos de pago guardados</h3>
        <button 
          v-if="!showAddCard" 
          @click="showAddCard = true" 
          class="btn btn-outline btn-sm"
        >
          <PlusIcon size="16" />
          Añadir tarjeta
        </button>
      </div>
      
      <div v-if="showAddCard" class="add-card-section">
        <h4>Añadir nueva tarjeta</h4>
        <AddPaymentMethodForm 
          @success="handleAddCardSuccess" 
          @cancel="showAddCard = false"
        />
      </div>
      
      <div v-if="paymentMethods.length === 0 && !showAddCard" class="empty-state">
        <CreditCard size="48" class="empty-icon" />
        <p>No tienes métodos de pago guardados</p>
        <button @click="showAddCard = true" class="btn btn-primary">
          Añadir tarjeta
        </button>
      </div>
      
      <div v-else-if="paymentMethods.length > 0" class="payment-methods-list">
        <div 
          v-for="method in paymentMethods" 
          :key="method.id" 
          class="payment-method-card"
          :class="{ 'selected': selectedMethod === method.id }"
          @click="selectPaymentMethod(method.id)"
        >
          <div class="card-icon">
            <component :is="getCardIcon(method.card.brand)" size="20" />
          </div>
          
          <div class="card-details">
            <div class="card-name">{{ method.billing_details.name }}</div>
            <div class="card-number">•••• {{ method.card.last4 }}</div>
            <div class="card-expiry">Expira: {{ method.card.exp_month }}/{{ method.card.exp_year.toString().slice(-2) }}</div>
          </div>
          
          <div class="card-actions">
            <button 
              v-if="selectedMethod === method.id" 
              class="card-selected"
              @click.stop
            >
              <CheckIcon size="16" />
            </button>
            
            <button 
              v-else 
              @click.stop="deletePaymentMethod(method.id)" 
              class="card-delete"
              :disabled="deleting === method.id"
            >
              <Loader2 v-if="deleting === method.id" class="spinner" size="16" />
              <TrashIcon v-else size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { stripeService } from '../../services/stripe';
import { useAuth } from '../../composables/useAuth';
import { useToast } from '../../composables/useToast';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import AddPaymentMethodForm from './AddPaymentMethodForm.vue';
import { 
  AlertCircle, 
  CreditCard, 
  PlusIcon, 
  CheckIcon, 
  TrashIcon, 
  Loader2 
} from 'lucide-vue-next';

const props = defineProps({
  initialSelected: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select', 'add', 'delete']);

// Estado
const { user, isAuthenticated } = useAuth();
const { showToast } = useToast();

const loading = ref(false);
const error = ref(null);
const paymentMethods = ref([]);
const selectedMethod = ref(props.initialSelected);
const showAddCard = ref(false);
const deleting = ref(null);

// Cargar métodos de pago
const loadPaymentMethods = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    if (!isAuthenticated.value) {
      error.value = 'Debes iniciar sesión para ver tus métodos de pago';
      loading.value = false;
      return;
    }
    
    if (!user.value?.uid) {
      error.value = 'No se pudo identificar al usuario';
      loading.value = false;
      return;
    }
    
    const methods = await stripeService.getPaymentMethods(user.value.uid);
    paymentMethods.value = methods || [];
    
    // Si hay métodos y no hay uno seleccionado, seleccionar el primero
    if (methods && methods.length > 0 && !selectedMethod.value) {
      selectedMethod.value = methods[0].id;
      emit('select', methods[0]);
    }
  } catch (err) {
    console.error('Error al cargar métodos de pago:', err);
    error.value = 'No se pudieron cargar tus métodos de pago. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Seleccionar método de pago
const selectPaymentMethod = (methodId) => {
  selectedMethod.value = methodId;
  const method = paymentMethods.value.find(m => m.id === methodId);
  if (method) {
    emit('select', method);
  }
};

// Eliminar método de pago
const deletePaymentMethod = async (methodId) => {
  if (deleting.value) return;
  
  deleting.value = methodId;
  
  try {
    await stripeService.deletePaymentMethod(methodId);
    
    // Actualizar lista
    paymentMethods.value = paymentMethods.value.filter(m => m.id !== methodId);
    
    // Si el método eliminado era el seleccionado, seleccionar otro
    if (selectedMethod.value === methodId) {
      selectedMethod.value = paymentMethods.value.length > 0 ? paymentMethods.value[0].id : null;
      emit('select', paymentMethods.value.length > 0 ? paymentMethods.value[0] : null);
    }
    
    emit('delete', methodId);
    
    showToast({
      title: 'Método de pago eliminado',
      description: 'Tu método de pago ha sido eliminado correctamente',
      type: 'success',
    });
  } catch (err) {
    console.error('Error al eliminar método de pago:', err);
    
    showToast({
      title: 'Error',
      description: 'No se pudo eliminar el método de pago. Por favor, inténtalo de nuevo.',
      type: 'error',
    });
  } finally {
    deleting.value = null;
  }
};

// Manejar éxito al añadir tarjeta
const handleAddCardSuccess = (newMethod) => {
  if (!newMethod) return;
  
  // Añadir a la lista
  paymentMethods.value.push(newMethod);
  
  // Seleccionar la nueva tarjeta
  selectedMethod.value = newMethod.id;
  emit('select', newMethod);
  
  // Ocultar formulario
  showAddCard.value = false;
  
  // Emitir evento
  emit('add', newMethod);
};

// Obtener icono de tarjeta
const getCardIcon = (brand) => {
  // En un caso real, se usarían iconos específicos para cada marca
  return CreditCard;
};

// Ciclo de vida
onMounted(() => {
  if (isAuthenticated.value && user.value?.uid) {
    loadPaymentMethods();
  }
});
</script>

<style scoped>
.saved-payment-methods {
  width: 100%;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-message {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--color-error);
}

.error-icon {
  margin-right: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.4rem;
  color: var(--color-primary);
  margin: 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: rgba(0, 180, 216, 0.1);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
}

.empty-icon {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.add-card-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
}

.add-card-section h4 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.payment-methods-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.payment-method-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method-card:hover {
  background-color: rgba(26, 26, 46, 0.8);
}

.payment-method-card.selected {
  background-color: rgba(0, 180, 216, 0.1);
  border-color: var(--color-primary);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(26, 26, 46, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: var(--color-primary);
}

.card-details {
  flex-grow: 1;
}

.card-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-number {
  font-family: monospace;
  margin-bottom: 0.25rem;
}

.card-expiry {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.card-actions {
  display: flex;
  align-items: center;
}

.card-selected {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: default;
}

.card-delete {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  color: var(--color-error);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-delete:hover:not(:disabled) {
  background-color: rgba(223, 27, 65, 0.1);
}

.card-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .payment-methods-list {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-header h3 {
    margin-bottom: 1rem;
  }
}
</style>
