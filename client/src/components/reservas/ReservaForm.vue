<template>
  <div class="reserva-form">
    <h2 id="reserva-title" class="form-title">Reserva tu viaje espacial</h2>
    
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="resetForm" class="btn-retry">Intentar nuevamente</button>
    </div>
    
    <form v-else @submit.prevent="handleSubmit" class="form-container" role="form" aria-labelledby="reserva-title">
      <!-- Añadir al principio del formulario -->
      <div aria-live="polite" class="sr-only">
        {{ formStatusMessage }}
      </div>
      <!-- Información del viaje -->
      <div class="form-section">
        <h3>Información del viaje</h3>
        
        <div class="form-group">
          <label for="ruta" id="ruta-label">Ruta:</label>
          <div class="select-wrapper">
            <select 
              id="ruta" 
              v-model="formData.rutaId" 
              @change="loadDisponibilidad"
              @blur="handleBlur('rutaId')"
              :class="{ 
                'input-error': touched.rutaId && errors.rutaId,
                'input-success': touched.rutaId && formData.rutaId && !errors.rutaId 
              }"
              aria-required="true"
              aria-invalid="touched.rutaId && errors.rutaId ? 'true' : 'false'"
              aria-describedby="ruta-error ruta-description"
              required
            >
              <option value="" disabled>Selecciona una ruta</option>
              <option 
                v-for="ruta in rutas" 
                :key="ruta.id" 
                :value="ruta.id"
              >
                {{ ruta.nombre }} ({{ ruta.origen }} → {{ ruta.destino }})
              </option>
            </select>
            <div v-if="touched.rutaId && formData.rutaId && !errors.rutaId" class="success-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <p v-if="touched.rutaId && errors.rutaId" id="ruta-error" class="error-text" role="alert">{{ errors.rutaId }}</p>
          <p id="ruta-description" class="field-description">Selecciona la ruta de tu viaje espacial</p>
        </div>
        
        <div class="form-group">
          <label for="fecha" id="fecha-label">Fecha de salida:</label>
          <div class="input-wrapper">
            <input 
              type="date" 
              id="fecha" 
              v-model="formData.fechaSalida"
              :min="minDate"
              @change="loadDisponibilidad"
              @blur="handleBlur('fechaSalida')"
              :class="{ 
                'input-error': touched.fechaSalida && errors.fechaSalida,
                'input-success': touched.fechaSalida && formData.fechaSalida && !errors.fechaSalida 
              }"
              aria-required="true"
              aria-invalid="touched.fechaSalida && errors.fechaSalida ? 'true' : 'false'"
              aria-describedby="fecha-error fecha-description"
              required
            />
            <div v-if="touched.fechaSalida && formData.fechaSalida && !errors.fechaSalida" class="success-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <p v-if="touched.fechaSalida && errors.fechaSalida" id="fecha-error" class="error-text" role="alert">{{ errors.fechaSalida }}</p>
          <p id="fecha-description" class="field-description">Selecciona la fecha de salida (mínimo 30 días a partir de hoy)</p>
        </div>
        
        <div class="form-group">
          <label for="pasajeros">Número de pasajeros:</label>
          <input 
            type="number" 
            id="pasajeros" 
            v-model.number="formData.numeroPasajeros"
            min="1" 
            max="10"
            @change="handlePasajerosChange"
            @blur="handleBlur('numeroPasajeros')"
            :class="{ 'input-error': touched.numeroPasajeros && errors.numeroPasajeros }"
            required
          />
          <p v-if="touched.numeroPasajeros && errors.numeroPasajeros" class="error-text" role="alert">{{ errors.numeroPasajeros }}</p>
        </div>
      </div>
      
      <!-- Selección de asientos -->
      <div v-if="showSeatSelector" class="form-section">
        <h3 id="asientos-title">Selección de asientos</h3>
        <p id="asientos-description" class="section-description">
          Selecciona {{ formData.numeroPasajeros }} asiento{{ formData.numeroPasajeros !== 1 ? 's' : '' }} para tu viaje
        </p>
        <SeatSelector 
          :disponibles="asientosDisponibles"
          :seleccionados="formData.asientos"
          :maxSeleccionables="formData.numeroPasajeros"
          @update:seleccionados="updateAsientos"
          aria-labelledby="asientos-title"
          aria-describedby="asientos-description"
          :aria-invalid="touched.asientos && errors.asientos ? 'true' : 'false'"
        />
        <p v-if="touched.asientos && errors.asientos" id="asientos-error" class="error-text" role="alert">{{ errors.asientos }}</p>
      </div>
      
      <!-- Actividades opcionales -->
      <div v-if="showActividades" class="form-section">
        <h3>Actividades opcionales</h3>
        <div class="actividades-list">
          <div 
            v-for="actividad in actividades" 
            :key="actividad.id"
            class="actividad-item"
          >
            <input 
              type="checkbox" 
              :id="`actividad-${actividad.id}`" 
              :value="actividad.id"
              v-model="formData.actividades"
              @change="calcularPrecio"
            />
            <label :for="`actividad-${actividad.id}`">
              {{ actividad.nombre }} - {{ formatCurrency(actividad.precio) }}
            </label>
          </div>
        </div>
      </div>
      
      <!-- Resumen de precios -->
      <div v-if="showResumen" class="form-section precio-resumen">
        <h3 id="resumen-title">Resumen de precios</h3>
        <div class="precio-desglose" aria-labelledby="resumen-title" role="region">
          <div class="precio-item">
            <span>Precio base ({{ formData.numeroPasajeros }} pasajero{{ formData.numeroPasajeros !== 1 ? 's' : '' }}):</span>
            <span>{{ formatCurrency(precioBase) }}</span>
          </div>
          <div v-if="precioActividades > 0" class="precio-item">
            <span>Actividades adicionales:</span>
            <span>{{ formatCurrency(precioActividades) }}</span>
          </div>
          <div v-if="descuento > 0" class="precio-item descuento">
            <span>Descuento aplicado:</span>
            <span>-{{ formatCurrency(descuento) }}</span>
          </div>
          <div class="precio-item precio-total">
            <span>Precio total:</span>
            <span aria-live="polite">{{ formatCurrency(precioTotal) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Información de contacto -->
      <div class="form-section">
        <h3>Información de contacto</h3>
        
        <div class="form-group">
          <label for="nombre">Nombre completo:</label>
          <input 
            type="text" 
            id="nombre" 
            v-model="formData.nombreContacto"
            @blur="handleBlur('nombreContacto')"
            :class="{ 'input-error': touched.nombreContacto && errors.nombreContacto }"
            required
          />
          <p v-if="touched.nombreContacto && errors.nombreContacto" class="error-text" role="alert">{{ errors.nombreContacto }}</p>
        </div>
        
        <div class="form-group">
          <label for="email">Correo electrónico:</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.emailContacto"
            @blur="handleBlur('emailContacto')"
            :class="{ 'input-error': touched.emailContacto && errors.emailContacto }"
            required
          />
          <p v-if="touched.emailContacto && errors.emailContacto" class="error-text" role="alert">{{ errors.emailContacto }}</p>
        </div>
        
        <div class="form-group">
          <label for="telefono">Teléfono:</label>
          <input 
            type="tel" 
            id="telefono" 
            v-model="formData.telefonoContacto"
            @blur="handleBlur('telefonoContacto')"
            :class="{ 'input-error': touched.telefonoContacto && errors.telefonoContacto }"
            required
          />
          <p v-if="touched.telefonoContacto && errors.telefonoContacto" class="error-text" role="alert">{{ errors.telefonoContacto }}</p>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="form-actions">
        <button 
          type="button" 
          class="btn-secondary"
          @click="$emit('cancel')"
          aria-label="Cancelar reserva y volver"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          class="btn-primary"
          :disabled="!isValid || submitting"
          aria-live="polite"
          aria-busy="submitting"
        >
          <span v-if="submitting" class="spinner" aria-hidden="true"></span>
          <span>{{ submitting ? 'Procesando...' : 'Continuar al pago' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import SeatSelector from './SeatSelector.vue';
import { getCurrentUser } from '../../utils/firebase';
import { formatPrice, formatDate } from '../../utils/format';
import { rules, validateForm } from '../../utils/form-validation';

export default {
  name: 'ReservaForm',
  components: {
    LoadingSpinner,
    SeatSelector
  },
  props: {
    destinoId: {
      type: [String, Number],
      required: true,
      validator: (value) => {
        if (!value && value !== 0) {
          console.error('La propiedad destinoId es requerida en ReservaForm');
          return false;
        }
        return true;
      }
    },
    naveId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['cancel', 'reserva-creada'],
  setup(props, { emit }) {
    // Declarar todos los refs al inicio
    const form = ref({
      // Datos del formulario
    });
    const loading = ref(false);
    const error = ref('');
    const success = ref(false);
    // Estado
    const submitting = ref(false);
    const rutas = ref([]);
    const actividades = ref([]);
    const asientosDisponibles = ref([]);
    const precioBase = ref(0);
    const precioActividades = ref(0);
    const descuento = ref(0);
    
    // Formulario y validación
    const formData = ref({
      rutaId: '',
      fechaSalida: '',
      numeroPasajeros: 1,
      asientos: [],
      actividades: [],
      nombreContacto: '',
      emailContacto: '',
      telefonoContacto: '',
      userId: null
    });
    
    // Errores y estado de campos tocados
    const errors = ref({});
    const touched = ref({});
    
    // Esquema de validación
    const validationSchema = {
      rutaId: [rules.required],
      fechaSalida: [rules.required, rules.futureDate],
      numeroPasajeros: [rules.required, rules.min(1), rules.max(10)],
      asientos: [(value) => {
        if (!value || !Array.isArray(value)) return 'Selección de asientos inválida';
        if (value.length !== formData.value.numeroPasajeros) {
          return `Debes seleccionar exactamente ${formData.value.numeroPasajeros} asiento(s)`;
        }
        return true;
      }],
      nombreContacto: [rules.required, rules.minLength(3), rules.maxLength(100)],
      emailContacto: [rules.required, rules.email],
      telefonoContacto: [rules.required, rules.phone]
    };
    
    // Fecha mínima (hoy + 30 días)
    const minDate = computed(() => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date.toISOString().split('T')[0];
    });
    
    // Mostrar secciones condicionales
    const showSeatSelector = computed(() => 
      formData.value.rutaId && formData.value.fechaSalida && asientosDisponibles.value.length > 0
    );
    
    const showActividades = computed(() => 
      formData.value.rutaId && actividades.value.length > 0
    );
    
    const showResumen = computed(() => 
      formData.value.rutaId && precioBase.value > 0
    );
    
    // Validación del formulario
    const validateAllFields = () => {
      errors.value = validateForm(formData.value, validationSchema);
      
      // Marcar todos los campos como tocados
      Object.keys(validationSchema).forEach(field => {
        touched.value[field] = true;
      });
      
      return Object.keys(errors.value).length === 0;
    };
    
    const isValid = computed(() => {
      // Validación básica para habilitar/deshabilitar el botón de envío
      return formData.value.rutaId && 
             formData.value.fechaSalida && 
             formData.value.numeroPasajeros > 0 &&
             formData.value.nombreContacto && 
             formData.value.emailContacto && 
             formData.value.telefonoContacto &&
             (!showSeatSelector.value || formData.value.asientos.length === formData.value.numeroPasajeros) &&
             Object.keys(errors.value).length === 0;
    });
    
    // Precio total
    const precioTotal = computed(() => {
      return precioBase.value + precioActividades.value - descuento.value;
    });
    
    // Añadir estas propiedades y métodos
    const formStatusMessage = computed(() => {
      if (loading.value) return 'Cargando formulario de reserva...';
      if (error.value) return `Error: ${error.value}`;
      if (submitting.value) return 'Procesando su reserva...';
      if (success.value) return 'Reserva creada exitosamente. Redirigiendo al pago...';
      return '';
    });

    // Método para anuncios a lectores de pantalla
    const announceToScreenReader = (message) => {
      // Esta función utilizaría un componente o servicio de anuncios para lectores de pantalla
      // Por ahora, simplemente lo logueamos
      console.log('Anuncio para lector de pantalla:', message);
      // En una implementación real, se usaría algo como:
      // useAnnouncer().announce(message);
    };
    
    // Cargar datos iniciales
    onMounted(async () => {
      try {
        await Promise.all([
          cargarRutas(),
          cargarActividades(),
          cargarUsuario()
        ]);
        loading.value = false;
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        error.value = 'No se pudieron cargar los datos necesarios. Por favor, intente nuevamente.';
        loading.value = false;
      }
    });
    
    // Cargar rutas disponibles
    const cargarRutas = async () => {
      try {
        // Simulación de carga de datos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos de ejemplo
        rutas.value = [
          { id: 1, nombre: 'Ruta Lunar', origen: 'Tierra', destino: 'Luna' },
          { id: 2, nombre: 'Ruta Marciana', origen: 'Tierra', destino: 'Marte' },
          { id: 3, nombre: 'Ruta Orbital', origen: 'Tierra', destino: 'Estación Espacial' }
        ];
        
        // Si solo hay una ruta, seleccionarla automáticamente
        if (rutas.value.length === 1) {
          formData.value.rutaId = rutas.value[0].id;
          await loadDisponibilidad();
        }
        
        return rutas.value;
      } catch (err) {
        console.error('Error al cargar rutas:', err);
        throw err;
      }
    };
    
    // Cargar actividades disponibles
    const cargarActividades = async () => {
      try {
        // Simulación de carga de datos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos de ejemplo
        actividades.value = [
          { id: 1, nombre: 'Paseo espacial', precio: 500000 },
          { id: 2, nombre: 'Fotografía profesional', precio: 200000 },
          { id: 3, nombre: 'Experiencia de gravedad cero', precio: 350000 }
        ];
        
        return actividades.value;
      } catch (err) {
        console.error('Error al cargar actividades:', err);
        throw err;
      }
    };
    
    // Cargar información del usuario actual
    const cargarUsuario = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          formData.value.userId = user.uid;
          formData.value.nombreContacto = user.displayName || '';
          formData.value.emailContacto = user.email || '';
        }
      } catch (err) {
        console.error('Error al cargar usuario:', err);
        // No lanzamos error aquí para que el formulario funcione sin usuario
      }
    };
    
    // Cargar disponibilidad de asientos
    const loadDisponibilidad = async () => {
      if (!formData.value.rutaId || !formData.value.fechaSalida) return;
      
      try {
        // Limpiar errores previos
        delete errors.value.rutaId;
        delete errors.value.fechaSalida;
        
        // Simulación de carga de datos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Datos de ejemplo
        asientosDisponibles.value = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          numero: `A${i + 1}`,
          disponible: Math.random() > 0.3, // 70% de asientos disponibles
          clase: Math.random() > 0.7 ? 'premium' : 'standard'
        }));
        
        // Filtrar solo asientos disponibles
        asientosDisponibles.value = asientosDisponibles.value.filter(a => a.disponible);
        
        // Precio base por asiento
        const precioPorAsiento = 1000000; // 1 millón por asiento
        precioBase.value = precioPorAsiento;
        
        // Limpiar asientos seleccionados
        formData.value.asientos = [];
        
        // Calcular precio total
        calcularPrecio();
        
        return asientosDisponibles.value;
      } catch (err) {
        console.error('Error al cargar disponibilidad:', err);
        error.value = 'No se pudo cargar la disponibilidad de asientos. Por favor, intente nuevamente.';
      }
    };
    
    // Actualizar asientos seleccionados
    const updateAsientos = (asientos) => {
      formData.value.asientos = asientos;
      
      // Validar asientos
      const asientosRule = validationSchema.asientos[0];
      const asientosResult = asientosRule(asientos);
      
      if (asientosResult !== true) {
        errors.value.asientos = asientosResult;
      } else {
        delete errors.value.asientos;
      }
      
      touched.value.asientos = true;
      calcularPrecio();
    };
    
    // Manejar cambio en número de pasajeros
    const handlePasajerosChange = () => {
      // Validar número de pasajeros
      if (formData.value.numeroPasajeros < 1) {
        formData.value.numeroPasajeros = 1;
      } else if (formData.value.numeroPasajeros > 10) {
        formData.value.numeroPasajeros = 10;
      }
      
      // Validar campo
      const pasajerosRules = validationSchema.numeroPasajeros;
      let isValid = true;
      
      for (const rule of pasajerosRules) {
        const result = rule(formData.value.numeroPasajeros);
        if (result !== true) {
          errors.value.numeroPasajeros = result;
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        delete errors.value.numeroPasajeros;
      }
      
      touched.value.numeroPasajeros = true;
      
      // Limpiar asientos seleccionados
      formData.value.asientos = [];
      
      // Recalcular precio
      calcularPrecio();
    };
    
    // Manejar blur de campos
    const handleBlur = (field) => {
      touched.value[field] = true;
      
      // Validar campo
      const fieldRules = validationSchema[field];
      if (!fieldRules) return;
      
      let isValid = true;
      
      for (const rule of fieldRules) {
        const result = rule(formData.value[field]);
        if (result !== true) {
          errors.value[field] = result;
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        delete errors.value[field];
      }
    };
    
    // Calcular precio total
    const calcularPrecio = () => {
      // Precio base por pasajero
      precioBase.value = formData.value.numeroPasajeros * 1000000;
      
      // Precio de actividades
      precioActividades.value = formData.value.actividades.reduce((total, actividadId) => {
        const actividad = actividades.value.find(a => a.id === actividadId);
        return total + (actividad ? actividad.precio * formData.value.numeroPasajeros : 0);
      }, 0);
      
      // Aplicar descuentos (ejemplo: 10% para grupos de 5 o más)
      if (formData.value.numeroPasajeros >= 5) {
        descuento.value = (precioBase.value + precioActividades.value) * 0.1;
      } else {
        descuento.value = 0;
      }
    };
    
    // Modificar el método handleSubmit
    const handleSubmit = async () => {
      // Validar todos los campos
      const isFormValid = validateAllFields();
      
      if (!isFormValid || submitting.value) {
        // Mostrar mensaje de error si hay campos inválidos
        if (!isFormValid) {
          // Crear un mensaje de error que liste todos los campos con problemas
          const errorFields = Object.keys(errors.value).map(field => {
            const fieldName = {
              rutaId: 'Ruta',
              fechaSalida: 'Fecha de salida',
              numeroPasajeros: 'Número de pasajeros',
              asientos: 'Asientos',
              nombreContacto: 'Nombre de contacto',
              emailContacto: 'Email de contacto',
              telefonoContacto: 'Teléfono de contacto'
            }[field] || field;
            
            return `${fieldName}: ${errors.value[field]}`;
          });
          
          error.value = `Por favor, corrige los siguientes errores antes de continuar:\n${errorFields.join('\n')}`;
          
          // Anunciar errores para lectores de pantalla
          announceToScreenReader(`Formulario con errores: ${errorFields.join(', ')}`);
        }
        return;
      }
      
      submitting.value = true;
      error.value = null;
      
      try {
        // Validar que todos los campos requeridos estén presentes
        const requiredFields = [
          'rutaId', 'fechaSalida', 'numeroPasajeros', 
          'nombreContacto', 'emailContacto', 'telefonoContacto'
        ];
        
        const missingFields = requiredFields.filter(field => !formData.value[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
        }
        
        // Validar que se hayan seleccionado los asientos correctos
        if (showSeatSelector.value && formData.value.asientos.length !== formData.value.numeroPasajeros) {
          throw new Error(`Debes seleccionar exactamente ${formData.value.numeroPasajeros} asiento(s)`);
        }
        
        // Simulación de envío de datos
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const reservaData = {
          ruta_id: formData.value.rutaId,
          fecha_salida: formData.value.fechaSalida,
          numero_pasajeros: formData.value.numeroPasajeros,
          asientos: formData.value.asientos,
          actividades: formData.value.actividades,
          nombre_contacto: formData.value.nombreContacto,
          email_contacto: formData.value.emailContacto,
          telefono_contacto: formData.value.telefonoContacto,
          user_id: formData.value.userId,
          precio_total: precioTotal.value,
          id: Math.floor(Math.random() * 1000000) // ID aleatorio para simulación
        };
        
        // Anunciar éxito para lectores de pantalla
        announceToScreenReader('Reserva creada exitosamente. Redirigiendo al pago...');
        
        // Mostrar mensaje de éxito
        success.value = true;
        
        // Emitir evento después de un breve retraso
        setTimeout(() => {
          emit('reserva-creada', reservaData);
        }, 1000);
      } catch (err) {
        console.error('Error al enviar reserva:', err);
        error.value = err.message || 'Ocurrió un error al procesar su reserva. Por favor, intente nuevamente.';
        
        // Anunciar error para lectores de pantalla
        announceToScreenReader(`Error: ${error.value}`);
      } finally {
        submitting.value = false;
      }
    };
    
    // Resetear formulario
    const resetForm = () => {
      error.value = null;
      loading.value = true;
      
      // Resetear datos del formulario
      formData.value = {
        rutaId: '',
        fechaSalida: '',
        numeroPasajeros: 1,
        asientos: [],
        actividades: [],
        nombreContacto: '',
        emailContacto: '',
        telefonoContacto: '',
        userId: null
      };
      
      // Resetear errores y estado de campos tocados
      errors.value = {};
      touched.value = {};
      
      Promise.all([
        cargarRutas(),
        cargarActividades(),
        cargarUsuario()
      ]).then(() => {
        loading.value = false;
      }).catch(err => {
        console.error('Error al resetear formulario:', err);
        error.value = 'No se pudieron cargar los datos necesarios. Por favor, intente nuevamente.';
        loading.value = false;
      });
    };
    
    // Formatear moneda
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    };
    
    // Observar cambios en rutaId y fechaSalida
    watch([
      () => formData.value.rutaId,
      () => formData.value.fechaSalida
    ], () => {
      if (formData.value.rutaId && formData.value.fechaSalida) {
        loadDisponibilidad();
      }
    });
    
    return {
      loading,
      error,
      submitting,
      formData,
      errors,
      touched,
      rutas,
      actividades,
      asientosDisponibles,
      precioBase,
      precioActividades,
      descuento,
      precioTotal,
      minDate,
      showSeatSelector,
      showActividades,
      showResumen,
      isValid,
      handleSubmit,
      resetForm,
      loadDisponibilidad,
      updateAsientos,
      handlePasajerosChange,
      handleBlur,
      calcularPrecio,
      formatCurrency,
      form,
      success,
      formStatusMessage,
      announceToScreenReader
    };
  }
};
</script>

<style scoped>
.select-wrapper, .input-wrapper {
  position: relative;
}

.success-icon {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-success, #10b981);
}

.input-success {
  border-color: var(--color-success, #10b981) !important;
  background-color: rgba(var(--color-success-rgb, 16, 185, 129), 0.05);
}

.field-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

.section-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reserva-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--color-background-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 1.8rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 4px solid var(--color-error);
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: var(--color-error);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 6px;
}

.form-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--color-text-light);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
}

.input-error {
  border-color: var(--color-error) !important;
  background-color: rgba(var(--color-error-rgb), 0.05);
}

.error-text {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.actividades-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.actividad-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.precio-resumen {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.precio-desglose {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.precio-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.precio-item.descuento {
  color: var(--color-success);
}

.precio-item.precio-total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid var(--color-border);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-retry {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn-retry {
  background-color: var(--color-background);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  margin-top: 0.5rem;
}

.btn-retry:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

@media (max-width: 768px) {
  .reserva-form {
    padding: 1.5rem;
  }
  
  .form-section {
    padding: 1rem;
  }
  
  .actividades-list {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
