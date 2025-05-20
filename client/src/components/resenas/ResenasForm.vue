<template>
  <div class="resenas-form">
    <h3 id="resena-title" class="text-xl font-bold mb-4">Deja tu Reseña</h3>
    
    <form @submit.prevent="submitResena" class="space-y-4" role="form" aria-labelledby="resena-title">
      <div>
        <label id="puntuacion-label" for="puntuacion" class="block text-sm font-medium text-gray-700 mb-1">
          Puntuación
        </label>
        <div class="flex items-center">
          <div 
            class="flex space-x-1" 
            role="radiogroup" 
            aria-labelledby="puntuacion-label"
            aria-required="true"
            aria-invalid="errors.puntuacion ? 'true' : 'false'"
            aria-describedby="puntuacion-error puntuacion-description"
          >
            <button 
              v-for="star in 5" 
              :key="star"
              type="button"
              @click="setPuntuacion(star)"
              class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :aria-label="`${star} estrellas`"
              :aria-pressed="star <= puntuacion"
              tabindex="0"
            >
              <svg 
                class="w-8 h-8" 
                :class="star <= puntuacion ? 'text-yellow-400' : 'text-gray-300'"
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-.181h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </button>
          </div>
          <span class="ml-2 text-gray-600" aria-live="polite">{{ puntuacion }} de 5</span>
        </div>
        <p v-if="errors.puntuacion" id="puntuacion-error" class="mt-1 text-sm text-red-600" role="alert">{{ errors.puntuacion }}</p>
        <p id="puntuacion-description" class="sr-only">Selecciona una puntuación de 1 a 5 estrellas</p>
      </div>
      
      <div>
        <label for="titulo" class="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input 
          type="text" 
          id="titulo" 
          v-model="titulo" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
          :class="{
            'border-red-500 bg-red-50': errors.titulo,
            'border-green-500 bg-green-50': isFieldValid('titulo')
          }"
          placeholder="Escribe un título para tu reseña"
          required
          aria-required="true"
          aria-invalid="errors.titulo ? 'true' : 'false'"
          aria-describedby="titulo-error titulo-description"
          @blur="validateTitulo"
          @focus="clearFieldError('titulo')"
        />
        <p v-if="errors.titulo" id="titulo-error" class="mt-1 text-sm text-red-600" role="alert">{{ errors.titulo }}</p>
        <p id="titulo-description" class="sr-only">Escribe un título descriptivo para tu reseña</p>
      </div>
      
      <div>
        <label for="comentario" class="block text-sm font-medium text-gray-700 mb-1">
          Comentario
        </label>
        <textarea 
          id="comentario" 
          v-model="comentario" 
          rows="4" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
          :class="{
            'border-red-500 bg-red-50': errors.comentario,
            'border-green-500 bg-green-50': isFieldValid('comentario')
          }"
          placeholder="Comparte tu experiencia detallada"
          required
          aria-required="true"
          aria-invalid="errors.comentario ? 'true' : 'false'"
          aria-describedby="comentario-error comentario-description"
          @blur="validateComentario"
          @focus="clearFieldError('comentario')"
        ></textarea>
        <p v-if="errors.comentario" id="comentario-error" class="mt-1 text-sm text-red-600" role="alert">{{ errors.comentario }}</p>
        <p id="comentario-description" class="sr-only">Comparte tu experiencia detallada</p>
      </div>
      
      <div>
        <label for="fotos" class="block text-sm font-medium text-gray-700 mb-1">
          Fotos (opcional)
        </label>
        <div 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors duration-200"
          :class="{ 'border-red-500 bg-red-50': errors.fotos }"
        >
          <input 
            type="file" 
            id="fotos" 
            @change="handleFileUpload" 
            multiple 
            accept="image/*"
            class="w-full"
            aria-invalid="errors.fotos ? 'true' : 'false'"
            aria-describedby="fotos-error fotos-description"
            @focus="clearFieldError('fotos')"
          />
        </div>
        <p v-if="errors.fotos" id="fotos-error" class="mt-1 text-sm text-red-600" role="alert">{{ errors.fotos }}</p>
        <p id="fotos-description" class="text-xs text-gray-500 mt-1">Puedes subir hasta 4 fotos (máximo 5MB cada una)</p>
      </div>
      
      <div v-if="fotosPreview.length > 0" class="grid grid-cols-4 gap-2">
        <div 
          v-for="(foto, index) in fotosPreview" 
          :key="index"
          class="relative"
        >
          <img :src="foto" alt="Preview" class="w-full h-24 object-cover rounded-md" />
          <button 
            type="button"
            @click="eliminarFoto(index)"
            class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>
      
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>
      
      <div class="flex justify-end">
        <button 
          type="submit"
          :disabled="loading || !formValid"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center transition-colors duration-200"
          aria-live="polite"
          aria-busy="loading"
        >
          <span v-if="loading" class="mr-2" aria-hidden="true">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span>{{ loading ? 'Enviando...' : 'Enviar Reseña' }}</span>
        </button>
      </div>
    </form>

    <div v-if="success" class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="status" aria-live="polite">
      <p class="font-medium">¡Gracias por tu reseña!</p>
      <p>Tu opinión ha sido enviada correctamente.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { isNotEmpty, hasValidLength } from '../../utils/validators';

const props = defineProps({
  destinoId: {
    type: [Number, String],
    required: true
  },
  reservaId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['resena-enviada']);

// Estado
const puntuacion = ref(0);
const titulo = ref('');
const comentario = ref('');
const fotos = ref([]);
const fotosPreview = ref([]);
const loading = ref(false);
const error = ref(null);
const errors = reactive({
  puntuacion: '',
  titulo: '',
  comentario: '',
  fotos: ''
});
const success = ref(false);

// Validación
const setPuntuacion = (value) => {
  puntuacion.value = value;
  validatePuntuacion();
};

const validatePuntuacion = () => {
  errors.puntuacion = '';
  
  if (puntuacion.value === 0) {
    errors.puntuacion = 'Por favor, selecciona una puntuación';
  }
};

const validateTitulo = () => {
  errors.titulo = '';
  
  if (!isNotEmpty(titulo.value)) {
    errors.titulo = 'El título es obligatorio';
  } else if (!hasValidLength(titulo.value, 3, 100)) {
    errors.titulo = 'El título debe tener entre 3 y 100 caracteres';
  }
};

const validateComentario = () => {
  errors.comentario = '';
  
  if (!isNotEmpty(comentario.value)) {
    errors.comentario = 'El comentario es obligatorio';
  } else if (!hasValidLength(comentario.value, 10, 500)) {
    errors.comentario = 'El comentario debe tener entre 10 y 500 caracteres';
  }
};

const validateForm = () => {
  validatePuntuacion();
  validateTitulo();
  validateComentario();
  
  return !errors.puntuacion && !errors.titulo && !errors.comentario && !errors.fotos;
};

// Computed
const formValid = computed(() => {
  return puntuacion.value > 0 && 
         isNotEmpty(titulo.value) && 
         isNotEmpty(comentario.value);
});

// Métodos
const handleFileUpload = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  
  errors.fotos = '';
  
  // Limitar a 4 fotos
  if (fotos.value.length + files.length > 4) {
    errors.fotos = 'Solo puedes subir un máximo de 4 fotos.';
    return;
  }
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      errors.fotos = 'Solo se permiten imágenes.';
      continue;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.fotos = 'Las imágenes no deben superar los 5MB.';
      continue;
    }
    
    fotos.value.push(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      fotosPreview.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const eliminarFoto = (index) => {
  fotos.value.splice(index, 1);
  fotosPreview.value.splice(index, 1);
};

// Método para verificar si un campo es válido
const isFieldValid = (field) => {
  return field === 'titulo' ? 
    titulo.value && !errors.titulo : 
    field === 'comentario' ? 
      comentario.value && !errors.comentario : false;
};

// Método para limpiar errores específicos
const clearFieldError = (field) => {
  if (errors[field]) {
    errors[field] = '';
  }
};

const submitResena = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // En un entorno real, aquí se enviarían los datos a la API
    // Simulamos el envío
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Crear objeto con los datos de la reseña
    const resenaData = {
      ID_DESTINO: props.destinoId,
      ID_RESERVA: props.reservaId,
      PUNTUACION: puntuacion.value,
      TITULO: titulo.value,
      COMENTARIO: comentario.value,
      FOTOS: fotos.value.map(file => file.name) // En un entorno real, aquí se subirían las fotos
    };
    
    console.log('Reseña enviada:', resenaData);
    
    // Mostrar mensaje de éxito
    success.value = true;
    
    // Anunciar para lectores de pantalla
    announceToScreenReader('Reseña enviada correctamente');
    
    // Emitir evento de éxito
    emit('resena-enviada', resenaData);
    
    // Limpiar formulario después de un breve retraso
    setTimeout(() => {
      puntuacion.value = 0;
      titulo.value = '';
      comentario.value = '';
      fotos.value = [];
      fotosPreview.value = [];
      success.value = false;
    }, 3000);
  } catch (error) {
    console.error('Error al enviar reseña:', error);
    error.value = 'No se pudo enviar la reseña. Inténtalo de nuevo.';
    // Anunciar error para lectores de pantalla
    announceToScreenReader(`Error: ${error.value}`);
  } finally {
    loading.value = false;
  }
};

// Método para anuncios a lectores de pantalla
const announceToScreenReader = (message) => {
  // Esta función utilizaría un componente o servicio de anuncios para lectores de pantalla
  // Por ahora, simplemente lo logueamos
  console.log('Anuncio para lector de pantalla:', message);
  // En una implementación real, se usaría algo como:
  // useAnnouncer().announce(message);
};
</script>

<style scoped>
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

/* Transiciones suaves para estados de formulario */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}
</style>
