<template>
  <div class="checkout-payment">
    <h2 class="section-title">Método de pago</h2>
    
    <!-- Indicador de carga -->
    <div v-if="loading" class="loading-container">
      <LoadingSpinner size="lg" />
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>
    
    <!-- Contenedor de error -->
    <div v-else-if="error" class="error-container">
      <ErrorNotification :message="error" @retry="inicializarPago" />
    </div>
    
    <!-- Contenedor principal -->
    <div v-else class="payment-content">
      <!-- Métodos guardados -->
      <div v-if="metodosPago.length > 0" class="saved-methods">
        <h3>Métodos guardados</h3>
        <div class="methods-list">
          <div 
            v-for="metodo in metodosPago" 
            :key="metodo.id"
            class="payment-method-item"
            :class="{ 'selected': metodoSeleccionado === metodo.id }"
            @click="seleccionarMetodo(metodo.id)"
          >
            <div class="method-info">
              <div class="method-type">
                {{ metodo.tipo === 'card' ? 'Tarjeta' : metodo.tipo }}
              </div>
              <div class="method-details">
                {{ metodo.detalles }}
              </div>
            </div>
            <div class="method-actions">
              <button 
                v-if="metodoSeleccionado === metodo.id"
                class="btn-icon"
                aria-label="Método seleccionado"
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Formulario de pago -->
      <div class="payment-form-container">
        <h2 class="payment-title">Información de pago</h2>
        
        <!-- Selector de método de pago -->
        <div class="payment-methods">
          <button 
            v-for="method in paymentMethods" 
            :key="method.id"
            @click="selectPaymentMethod(method.id)"
            class="payment-method-button"
            :class="{ 'selected': selectedMethod === method.id }"
            type="button"
          >
            <img :src="method.icon" :alt="method.name" class="method-icon" />
            <span>{{ method.name }}</span>
          </button>
        </div>
        
        <!-- Formulario de tarjeta de crédito -->
        <div v-if="selectedMethod === 'card'" class="card-form">
          <div class="form-group">
            <label for="cardNumber">Número de tarjeta</label>
            <div class="card-number-input">
              <input 
                id="cardNumber"
                v-model="cardDetails.number"
                type="text"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                @input="formatCardNumber"
                :class="{ 'input-error': errors.cardNumber }"
              />
              <div class="card-type">
                <img 
                  v-if="cardType" 
                  :src="`/images/card-types/${cardType}.svg`" 
                  :alt="cardType"
                  class="card-type-icon"
                />
              </div>
            </div>
            <p v-if="errors.cardNumber" class="error-text">{{ errors.cardNumber }}</p>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="cardExpiry">Fecha de expiración</label>
              <input 
                id="cardExpiry"
                v-model="cardDetails.expiry"
                type="text"
                placeholder="MM/AA"
                maxlength="5"
                @input="formatCardExpiry"
                :class="{ 'input-error': errors.cardExpiry }"
              />
              <p v-if="errors.cardExpiry" class="error-text">{{ errors.cardExpiry }}</p>
            </div>
            
            <div class="form-group">
              <label for="cardCvc">CVC/CVV</label>
              <div class="cvc-input">
                <input 
                  id="cardCvc"
                  v-model="cardDetails.cvc"
                  type="text"
                  placeholder="123"
                  maxlength="4"
                  @input="formatCardCvc"
                  :class="{ 'input-error': errors.cardCvc }"
                />
                <InfoIcon 
                  size="16" 
                  class="info-icon"
                  @mouseenter="showCvcTooltip = true"
                  @mouseleave="showCvcTooltip = false"
                />
                <div v-if="showCvcTooltip" class="cvc-tooltip">
                  El código de seguridad (CVC) son los 3 o 4 dígitos que aparecen en el reverso de tu tarjeta.
                </div>
              </div>
              <p v-if="errors.cardCvc" class="error-text">{{ errors.cardCvc }}</p>
            </div>
          </div>
          
          <div class="form-group">
            <label for="cardName">Nombre en la tarjeta</label>
            <input 
              id="cardName"
              v-model="cardDetails.name"
              type="text"
              placeholder="NOMBRE APELLIDO"
              :class="{ 'input-error': errors.cardName }"
            />
            <p v-if="errors.cardName" class="error-text">{{ errors.cardName }}</p>
          </div>
          
          <div class="save-card-option">
            <input 
              id="saveCard"
              v-model="saveCard"
              type="checkbox"
            />
            <label for="saveCard">Guardar esta tarjeta para futuras compras</label>
          </div>
        </div>
        
        <!-- Formulario de PayPal -->
        <div v-else-if="selectedMethod === 'paypal'" class="paypal-form">
          <p class="paypal-info">
            Serás redirigido a PayPal para completar el pago de forma segura.
          </p>
          <div class="paypal-logo">
            <img src="/images/payment/paypal-full.svg" alt="PayPal" />
          </div>
        </div>
        
        <!-- Formulario de transferencia bancaria -->
        <div v-else-if="selectedMethod === 'transfer'" class="transfer-form">
          <div class="bank-details">
            <h3>Datos bancarios para la transferencia</h3>
            <div class="detail-item">
              <span class="detail-label">Beneficiario:</span>
              <span class="detail-value">Stellar Tourism S.L.</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">IBAN:</span>
              <span class="detail-value">ES91 2100 0418 4502 0005 1332</span>
              <button @click="copyToClipboard('ES91 2100 0418 4502 0005 1332')" class="copy-button">
                <CopyIcon size="14" />
              </button>
            </div>
            <div class="detail-item">
              <span class="detail-label">BIC/SWIFT:</span>
              <span class="detail-value">CAIXESBBXXX</span>
              <button @click="copyToClipboard('CAIXESBBXXX')" class="copy-button">
                <CopyIcon size="14" />
              </button>
            </div>
            <div class="detail-item">
              <span class="detail-label">Concepto:</span>
              <span class="detail-value">RESERVA-{{ reservaId }}</span>
              <button @click="copyToClipboard(`RESERVA-${reservaId}`)" class="copy-button">
                <CopyIcon size="14" />
              </button>
            </div>
          </div>
          <div class="transfer-note">
            <AlertCircleIcon size="16" class="note-icon" />
            <p>
              Importante: Tu reserva quedará pendiente hasta que confirmemos el pago. 
              Por favor, envía el comprobante de transferencia a 
              <a href="mailto:pagos@stellartourism.com">pagos@stellartourism.com</a>
            </p>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="payment-actions">
          <button 
            @click="goBack" 
            class="back-button"
            type="button"
          >
            <ArrowLeftIcon size="16" class="button-icon" />
            Volver
          </button>
          
          <button 
            class="btn btn-primary"
            :disabled="isProcessingPayment || !isFormValid"
            @click="processPayment"
          >
            <span v-if="isProcessingPayment">
              <LoaderIcon size="16" class="animate-spin button-icon" />
              Procesando...
            </span>
            <span v-else>
              <CreditCardIcon size="16" class="button-icon" />
              Pagar ahora {{ reserva ? formatPrice(reserva.precio_total) : '' }}
            </span>
          </button>
        </div>
        
        <!-- Información de seguridad -->
        <div class="security-info">
          <LockIcon size="14" class="security-icon" />
          <span>Pago 100% seguro. Tus datos están protegidos con encriptación SSL.</span>
        </div>
      </div>
    </div>
    
    <!-- Modal de error -->
    <div v-if="showErrorModal" class="error-modal">
      <div class="error-modal-content">
        <div class="error-modal-header">
          <h3>Error en el pago</h3>
        </div>
        <div class="error-modal-body">
          <p>{{ paymentError }}</p>
          <div v-if="errorSuggestions.length > 0" class="error-suggestions">
            <p><strong>Sugerencias:</strong></p>
            <ul>
              <li v-for="(suggestion, index) in errorSuggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>
        <div class="error-modal-footer">
          <button @click="closeErrorModal" class="error-modal-button">
            Entendido
          </button>
          <button @click="retryPayment" class="error-modal-retry">
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de éxito -->
    <div v-if="showSuccessModal" class="success-modal">
      <div class="success-modal-content">
        <div class="success-modal-header">
          <CheckCircleIcon size="32" class="success-modal-icon" />
          <h3>¡Pago completado!</h3>
        </div>
        <div class="success-modal-body">
          <p>Tu pago ha sido procesado correctamente.</p>
          <p>Hemos enviado un correo electrónico con los detalles de tu reserva a {{ userEmail }}.</p>
          <div class="confirmation-number">
            <span>Número de confirmación:</span>
            <strong>{{ confirmationNumber }}</strong>
          </div>
        </div>
        <div class="success-modal-footer">
          <button @click="goToReservationDetails" class="success-modal-button">
            Ver detalles de la reserva
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  CalendarIcon, CheckIcon, InfoIcon, CopyIcon, AlertCircleIcon,
  ArrowLeftIcon, CreditCardIcon, LockIcon,
  CheckCircleIcon, LoaderIcon, AlertTriangleIcon
} from '@/utils/lucide-adapter';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import ErrorNotification from '../common/ErrorNotification.vue';
import { useToast } from '../../composables/useToast';
import { formatPrice, formatDate } from '../../utils/format';
import { validateCardNumber, validateCardExpiry, validateCardCvc } from '../../utils/validation';
import { useAuth } from '../../composables/useAuth';
import reservasService from '../../services/reservas/reservas-service';
import pagosService from '../../services/pagos';

export default {
  name: 'CheckoutPaymentEnhanced',
  components: {
    LoadingSpinner,
    ErrorNotification,
    CalendarIcon,
    CheckIcon,
    InfoIcon,
    CopyIcon,
    AlertCircleIcon,
    ArrowLeftIcon,
    CreditCardIcon,
    LockIcon,
    CheckCircleIcon,
    LoaderIcon,
    AlertTriangleIcon
  },
  props: {
    reservaId: {
      type: [String, Number],
      required: true,
      validator: (value) => {
        if (!value && value !== 0) {
          console.error('La propiedad reservaId es requerida en CheckoutPaymentEnhanced');
          return false;
        }
        return true;
      }
    },
    total: {
      type: Number,
      required: true,
      validator: (value) => {
        if (value === undefined || value === null) {
          console.error('La propiedad total es requerida en CheckoutPaymentEnhanced');
          return false;
        }
        return true;
      }
    }
  },
  setup(props) {
    const router = useRouter();
    const toast = useToast();
    const { user } = useAuth();
    
    // Todos los refs deben declararse al inicio, no dentro de funciones o condicionales
    const loading = ref(true);
    const loadingMessage = ref('Cargando información de pago...');
    const error = ref(null);
    const reserva = ref(null);
    const selectedMethod = ref('card');
    const isProcessingPayment = ref(false);
    const showCvcTooltip = ref(false);
    const saveCard = ref(false);
    const showErrorModal = ref(false);
    const showSuccessModal = ref(false);
    const paymentError = ref('');
    const errorSuggestions = ref([]);
    const confirmationNumber = ref('');
    const paymentAttempts = ref(0);
    const metodosPago = ref([]);
    const metodoSeleccionado = ref(null);
    
    // Estado
    
    
    // Datos de tarjeta
    const cardDetails = ref({
      number: '',
      expiry: '',
      cvc: '',
      name: ''
    });
    
    // Datos de pago
    const formPago = ref({
      numeroTarjeta: '',
      fechaExpiracion: '',
      cvv: '',
      nombreTarjeta: '',
      guardarTarjeta: false
    });
    
    // Errores de validación
    const errors = ref({
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      cardName: ''
    });
    
    // Métodos de pago disponibles
    const paymentMethods = [
      {
        id: 'card',
        name: 'Tarjeta de crédito/débito',
        icon: '/images/payment/card.svg'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '/images/payment/paypal.svg'
      },
      {
        id: 'transfer',
        name: 'Transferencia bancaria',
        icon: '/images/payment/transfer.svg'
      }
    ];
    
    // Computed
    const cardType = computed(() => {
      const number = cardDetails.value.number.replace(/\s/g, '');
      
      if (number.startsWith('4')) {
        return 'visa';
      } else if (/^5[1-5]/.test(number)) {
        return 'mastercard';
      } else if (/^3[47]/.test(number)) {
        return 'amex';
      } else if (/^6(?:011|5)/.test(number)) {
        return 'discover';
      }
      
      return '';
    });
    
    const isFormValid = computed(() => {
      if (selectedMethod.value === 'card') {
        return (
          !errors.value.cardNumber &&
          !errors.value.cardExpiry &&
          !errors.value.cardCvc &&
          !errors.value.cardName &&
          cardDetails.value.number &&
          cardDetails.value.expiry &&
          cardDetails.value.cvc &&
          cardDetails.value.name
        );
      }
      
      return true;
    });
    
    const userEmail = computed(() => {
      return user.value?.email || '';
    });
    
    // Métodos
    const loadReserva = async () => {
      try {
        loading.value = true;
        loadingMessage.value = 'Cargando información de la reserva...';
        
        const response = await reservasService.getById(props.reservaId);
        
        if (response.success && response.data) {
          reserva.value = response.data;
          
          // Prellenar nombre si el usuario está autenticado
          if (user.value && user.value.displayName) {
            cardDetails.value.name = user.value.displayName.toUpperCase();
          }
        } else {
          throw new Error('No se pudo cargar la información de la reserva');
        }
      } catch (error) {
        console.error('Error al cargar la reserva:', error);
        toast.error('Error', 'No se pudo cargar la información de la reserva');
      } finally {
        loading.value = false;
      }
    };
    
    const inicializarPago = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // Simulamos la carga de métodos de pago guardados
        await new Promise(resolve => setTimeout(resolve, 800));
        
        metodosPago.value = [
          { 
            id: 'card_1', 
            tipo: 'card', 
            detalles: 'Visa •••• 4242 (Expira: 12/25)' 
          },
          { 
            id: 'card_2', 
            tipo: 'card', 
            detalles: 'Mastercard •••• 5555 (Expira: 10/24)' 
          }
        ];
        
      } catch (err) {
        error.value = 'Error al cargar los métodos de pago. Por favor, intente nuevamente.';
        console.error('Error al cargar métodos de pago:', err);
      } finally {
        loading.value = false;
      }
    };
    
    const selectPaymentMethod = (methodId) => {
      selectedMethod.value = methodId;
      
      // Limpiar errores al cambiar de método
      errors.value = {
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        cardName: ''
      };
    };
    
    const seleccionarMetodo = (id) => {
      metodoSeleccionado.value = id;
    };
    
    const formatCardNumber = () => {
      // Eliminar espacios y caracteres no numéricos
      let value = cardDetails.value.number.replace(/\D/g, '');
      
      // Formatear con espacios cada 4 dígitos
      let formatted = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
        formatted += value[i];
      }
      
      cardDetails.value.number = formatted;
      
      // Validar
      const result = validateCardNumber(value);
      errors.value.cardNumber = result === true ? '' : result;
    };
    
    const formatearNumeroTarjeta = () => {
      // Eliminar espacios y caracteres no numéricos
      let valor = formPago.value.numeroTarjeta.replace(/\D/g, '');
      
      // Agregar un espacio cada 4 dígitos
      let valorFormateado = '';
      for (let i = 0; i < valor.length; i++) {
        if (i > 0 && i % 4 === 0) {
          valorFormateado += ' ';
        }
        valorFormateado += valor[i];
      }
      
      formPago.value.numeroTarjeta = valorFormateado;
    };
    
    const formatCardExpiry = () => {
      // Eliminar caracteres no numéricos
      let value = cardDetails.value.expiry.replace(/\D/g, '');
      
      // Formatear como MM/YY
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      
      cardDetails.value.expiry = value;
      
      // Validar
      const result = validateCardExpiry(value);
      errors.value.cardExpiry = result === true ? '' : result;
    };
    
    const formatearFechaExpiracion = () => {
      // Eliminar caracteres no numéricos
      let valor = formPago.value.fechaExpiracion.replace(/\D/g, '');
      
      // Formatear como MM/AA
      if (valor.length > 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
      }
      
      formPago.value.fechaExpiracion = valor;
    };
    
    const formatCardCvc = () => {
      // Eliminar caracteres no numéricos
      let value = cardDetails.value.cvc.replace(/\D/g, '');
      cardDetails.value.cvc = value;
      
      // Validar
      const result = validateCardCvc(value, cardType.value === 'amex');
      errors.value.cardCvc = result === true ? '' : result;
    };
    
    const validateCardName = () => {
      if (!cardDetails.value.name) {
        errors.value.cardName = 'El nombre en la tarjeta es obligatorio';
        return false;
      }
      
      errors.value.cardName = '';
      return true;
    };
    
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success('Copiado', 'Texto copiado al portapapeles');
        })
        .catch(err => {
          console.error('Error al copiar al portapapeles:', err);
        });
    };
    
    const goBack = () => {
      router.push(`/reservas/${props.reservaId}`);
    };
    
    const processPayment = async () => {
      // Validar formulario según el método seleccionado
      if (selectedMethod.value === 'card') {
        formatCardNumber();
        formatCardExpiry();
        formatCardCvc();
        validateCardName();
        
        if (!isFormValid.value) {
          toast.error('Error de validación', 'Por favor, completa correctamente todos los campos');
          return;
        }
      }
      
      try {
        isProcessingPayment.value = true;
        paymentAttempts.value++;
        
        // Procesar según el método seleccionado
        switch (selectedMethod.value) {
          case 'card':
            await processCardPayment();
            break;
          case 'paypal':
            await processPaypalPayment();
            break;
          case 'transfer':
            await processTransferPayment();
            break;
          default:
            throw new Error('Método de pago no válido');
        }
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        
        // Mostrar modal de error con sugerencias
        paymentError.value = error.message || 'Ha ocurrido un error al procesar el pago';
        errorSuggestions.value = getErrorSuggestions(error);
        showErrorModal.value = true;
      } finally {
        isProcessingPayment.value = false;
      }
    };
    
    const processCardPayment = async () => {
      // Simular procesamiento de pago con tarjeta
      loadingMessage.value = 'Procesando pago con tarjeta...';
      
      // Preparar datos para el pago
      const paymentData = {
        reservaId: props.reservaId,
        method: 'card',
        amount: props.total,
        card: {
          number: cardDetails.value.number.replace(/\s/g, ''),
          expiry: cardDetails.value.expiry,
          cvc: cardDetails.value.cvc,
          name: cardDetails.value.name
        },
        saveCard: saveCard.value
      };
      
      // Simular error aleatorio para demostración (solo en desarrollo)
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.3 && paymentAttempts.value === 1) {
        throw new Error('Tarjeta rechazada: fondos insuficientes');
      }
      
      // Procesar pago
      const response = await pagosService.processPayment(paymentData);
      
      if (response.success) {
        // Guardar número de confirmación
        confirmationNumber.value = response.data.confirmationNumber;
        
        // Mostrar modal de éxito
        showSuccessModal.value = true;
      } else {
        throw new Error(response.error || 'Error al procesar el pago');
      }
    };
    
    const processPaypalPayment = async () => {
      // Redirigir a PayPal
      const response = await pagosService.createPaypalSession({
        reservaId: props.reservaId,
        amount: props.total,
        returnUrl: `${window.location.origin}/pago/exito?reserva=${props.reservaId}`,
        cancelUrl: `${window.location.origin}/pago/cancelado?reserva=${props.reservaId}`
      });
      
      if (response.success && response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error(response.error || 'Error al iniciar sesión de PayPal');
      }
    };
    
    const processTransferPayment = async () => {
      // Actualizar estado de la reserva a pendiente de transferencia
      const response = await reservasService.updateStatus(
        props.reservaId,
        'PENDIENTE_TRANSFERENCIA',
        {
          metodo_pago: 'transfer'
        }
      );
      
      if (response.success) {
        // Redirigir a página de éxito con instrucciones
        router.push(`/pago/pendiente?reserva=${props.reservaId}&metodo=transfer`);
      } else {
        throw new Error(response.error || 'Error al registrar la transferencia');
      }
    };
    
    const getErrorSuggestions = (error) => {
      const suggestions = [
        'Verifica que los datos de tu tarjeta sean correctos'
      ];
      
      // Sugerencias específicas según el tipo de error
      if (error.message?.includes('fondos insuficientes')) {
        suggestions.push('Comprueba que tienes fondos suficientes en tu cuenta');
        suggestions.push('Intenta con otra tarjeta');
      } else if (error.message?.includes('rechazada')) {
        suggestions.push('Contacta con tu banco para verificar el estado de tu tarjeta');
        suggestions.push('Intenta con otro método de pago');
      } else if (error.message?.includes('conexión')) {
        suggestions.push('Verifica tu conexión a internet');
        suggestions.push('Intenta nuevamente en unos minutos');
      }
      
      return suggestions;
    };
    
    const closeErrorModal = () => {
      showErrorModal.value = false;
      paymentError.value = '';
      errorSuggestions.value = [];
    };
    
    const retryPayment = () => {
      closeErrorModal();
      processPayment();
    };
    
    const goToReservationDetails = () => {
      router.push(`/reservas/${props.reservaId}`);
    };
    
    // Observar cambios en cardDetails para validación en tiempo real
    watch(() => cardDetails.value.name, validateCardName);
    
    // Cargar datos al montar el componente
    onMounted(() => {
      loadReserva();
      inicializarPago();
    });
    
    return {
      loading,
      loadingMessage,
      reserva,
      reservaId: props.reservaId,
      selectedMethod,
      paymentMethods,
      cardDetails,
      errors,
      cardType,
      isProcessingPayment,
      showCvcTooltip,
      saveCard,
      showErrorModal,
      showSuccessModal,
      paymentError,
      errorSuggestions,
      confirmationNumber,
      userEmail,
      isFormValid,
      selectPaymentMethod,
      formatCardNumber,
      formatCardExpiry,
      formatCardCvc,
      copyToClipboard,
      goBack,
      processPayment,
      closeErrorModal,
      retryPayment,
      goToReservationDetails,
      formatPrice,
      formatDate,
      metodosPago,
      metodoSeleccionado,
      formPago,
      formatearNumeroTarjeta,
      formatearFechaExpiracion,
      error
    };
  }
};
</script>

<style scoped>
.checkout-payment {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-text {
  margin-top: 1rem;
  color: var(--color-text-secondary);
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.payment-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Métodos guardados */
.saved-methods {
  margin-bottom: 2rem;
}

.saved-methods h3,
.new-method h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: var(--border-radius);
  background-color: rgba(26, 26, 46, 0.7);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.payment-method-item:hover {
  background-color: rgba(26, 26, 46, 0.9);
}

.payment-method-item.selected {
  border: 2px solid var(--color-primary);
}

.method-type {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.method-details {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.btn-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-background);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

/* Contenedor principal */
.payment-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Resumen de la reserva */
.reservation-summary {
  background-color: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  height: fit-content;
}

.summary-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.summary-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.destination-image {
  width: 100px;
  height: 100px;
  border-radius: var(--border-radius);
  overflow: hidden;
  flex-shrink: 0;
}

.destination-info {
  flex: 1;
}

.destination-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.destination-route {
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

.reservation-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.icon {
  color: var(--color-primary);
}

.summary-body {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

.activity-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.check-icon {
  color: var(--color-success);
}

.price-breakdown {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.price-row.discount {
  color: var(--color-success);
}

.price-row.total {
  font-weight: 600;
  font-size: 1.125rem;
  border-top: 1px solid var(--color-border);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  color: var(--color-error);
}

.error-icon {
  color: var(--color-error);
}

/* Formulario de pago */
.payment-form-container {
  background-color: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
}

.payment-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.payment-methods {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.payment-method-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.payment-method-button:hover {
  background-color: rgba(26, 26, 46, 0.5);
}

.payment-method-button.selected {
  border-color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.method-icon {
  height: 30px;
  width: auto;
}

.card-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
}

input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-error {
  border-color: var(--color-error);
}

.error-text {
  color: var(--color-error);
  font-size: 0.75rem;
}

.card-number-input {
  position: relative;
}

.card-type {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
}

.card-type-icon {
  height: 100%;
  width: auto;
}

.cvc-input {
  position: relative;
}

.info-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  cursor: help;
}

.cvc-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  width: 200px;
  padding: 0.75rem;
  background-color: var(--color-surface);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  font-size: 0.75rem;
  z-index: 10;
}

.cvc-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 10px;
  border-width: 8px;
  border-style: solid;
  border-color: var(--color-surface) transparent transparent transparent;
}

.save-card-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.paypal-form, .transfer-form {
  margin-bottom: 2rem;
}

.paypal-info {
  margin-bottom: 1rem;
  text-align: center;
}

.paypal-logo {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.paypal-logo img {
  height: 40px;
}

.bank-details {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.bank-details h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  width: 120px;
  flex-shrink: 0;
}

.detail-value {
  font-family: monospace;
  letter-spacing: 0.5px;
}

.copy-button {
  margin-left: 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.copy-button:hover {
  color: var(--color-primary);
}

.transfer-note {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(var(--color-warning-rgb), 0.1);
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

.note-icon {
  color: var(--color-warning);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.transfer-note a {
  color: var(--color-primary);
  text-decoration: underline;
}

.payment-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.back-button, .pay-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.back-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.back-button:hover {
  background-color: rgba(26, 26, 46, 0.5);
}

.pay-button {
  background-color: var(--color-primary);
  border: none;
  color: white;
}

.pay-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.pay-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-icon {
  flex-shrink: 0;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  justify-content: center;
}

.security-icon {
  color: var(--color-success);
}

/* Modales */
.error-modal, .success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.error-modal-content, .success-modal-content {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.error-modal-header, .success-modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-background-secondary);
  text-align: center;
}

.error-modal-icon {
  color: var(--color-error);
  margin-bottom: 1rem;
}

.success-modal-icon {
  color: var(--color-success);
  margin-bottom: 1rem;
}

.error-modal-body, .success-modal-body {
  padding: 1.5rem;
}

.error-suggestions {
  margin-top: 1rem;
}

.error-suggestions ul {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.error-suggestions li {
  margin-bottom: 0.5rem;
}

.confirmation-number {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(var(--color-success-rgb), 0.1);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-modal-footer, .success-modal-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.error-modal-button, .error-modal-retry, .success-modal-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-modal-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.error-modal-retry {
  background-color: var(--color-primary);
  border: none;
  color: white;
}

.success-modal-button {
  background-color: var(--color-success);
  border: none;
  color: white;
}

/* Responsive */
@media (max-width: 992px) {
  .payment-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .payment-methods {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .summary-header {
    flex-direction: column;
  }
  
  .destination-image {
    width: 100%;
    height: 150px;
  }
  
  .payment-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .back-button, .pay-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
