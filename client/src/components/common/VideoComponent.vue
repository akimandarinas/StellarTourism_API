<template>
  <div 
    :class="[containerClass, 'video-component-container']" 
    :style="containerStyle"
    ref="container"
  >
    <!-- Video con controles accesibles -->
    <video
      ref="videoElement"
      :src="src"
      :poster="poster"
      :controls="controls && !customControls"
      :width="width"
      :height="height"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :playsinline="playsinline"
      :preload="preload"
      :class="[
        'video-component',
        videoClass
      ]"
      :style="videoStyle"
      @loadedmetadata="onLoadedMetadata"
      @error="onError"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @volumechange="onVolumeChange"
      :aria-label="title || 'Video'"
      :aria-describedby="descriptionId"
      crossorigin="anonymous"
    >
      <!-- Pistas de texto (subtítulos, descripciones, etc.) -->
      <track 
        v-for="(track, index) in tracks" 
        :key="index"
        :kind="track.kind"
        :src="track.src"
        :srclang="track.srclang"
        :label="track.label"
        :default="track.default"
      />
      
      <!-- Mensaje de fallback para navegadores que no soportan video -->
      <p>Tu navegador no soporta la reproducción de videos HTML5. Puedes <a :href="src" download>descargar el video</a> para verlo en tu reproductor local.</p>
    </video>
    
    <!-- Controles personalizados accesibles -->
    <div v-if="customControls" class="video-component-controls" aria-hidden="true">
      <div class="video-component-progress">
        <div 
          class="video-component-progress-bar"
          @click="seekToPosition"
          ref="progressBar"
        >
          <div 
            class="video-component-progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="video-component-time">
          <span>{{ formatTime(currentTime) }}</span>
          <span>/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
      
      <div class="video-component-buttons">
        <button 
          @click="togglePlay"
          class="video-component-button"
          :aria-label="isPlaying ? 'Pausar' : 'Reproducir'"
          :title="isPlaying ? 'Pausar' : 'Reproducir'"
        >
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        
        <button 
          @click="toggleMute"
          class="video-component-button"
          :aria-label="isMuted ? 'Activar sonido' : 'Silenciar'"
          :title="isMuted ? 'Activar sonido' : 'Silenciar'"
        >
          <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>
        
        <div class="video-component-volume">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            :value="volume"
            @input="setVolume($event.target.value)"
            class="video-component-volume-slider"
            aria-label="Volumen"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="Math.round(volume * 100)"
            :aria-valuetext="`Volumen ${Math.round(volume * 100)}%`"
          />
        </div>
        
        <button 
          v-if="hasSubtitles"
          @click="toggleSubtitles"
          class="video-component-button"
          :class="{ 'video-component-button-active': subtitlesEnabled }"
          aria-label="Subtítulos"
          :aria-pressed="subtitlesEnabled ? 'true' : 'false'"
          title="Subtítulos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
            <path d="M7 10h2"></path>
            <path d="M11 10h6"></path>
            <path d="M7 14h6"></path>
            <path d="M15 14h2"></path>
          </svg>
        </button>
        
        <button 
          @click="toggleFullscreen"
          class="video-component-button"
          aria-label="Pantalla completa"
          title="Pantalla completa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
            <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
            <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
            <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Título y descripción del video -->
    <div v-if="title || description" class="video-component-info">
      <h3 v-if="title" class="video-component-title">{{ title }}</h3>
      <p 
        v-if="description" 
        class="video-component-description"
        :id="descriptionId"
      >
        {{ description }}
      </p>
    </div>
    
    <!-- Transcripción del video (opcional) -->
    <div v-if="transcript" class="video-component-transcript">
      <button 
        @click="toggleTranscript"
        class="video-component-transcript-toggle"
        :aria-expanded="showTranscript ? 'true' : 'false'"
        :aria-controls="transcriptId"
      >
        {{ showTranscript ? 'Ocultar transcripción' : 'Mostrar transcripción' }}
      </button>
      
      <div 
        v-show="showTranscript" 
        class="video-component-transcript-content"
        :id="transcriptId"
      >
        <h4 class="video-component-transcript-title">Transcripción</h4>
        <div v-html="formattedTranscript"></div>
      </div>
    </div>
    
    <!-- Indicador de error -->
    <div 
      v-if="error" 
      class="video-component-error"
      role="alert"
    >
      <slot name="error">
        <div class="video-component-error-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="video-component-error-icon" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Error al cargar el video</span>
        </div>
      </slot>
    </div>
    
    <!-- Anunciador para lectores de pantalla -->
    <div 
      aria-live="polite" 
      class="sr-only" 
      ref="announcer"
    >
      {{ announcement }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  width: {
    type: [Number, String],
    default: null
  },
  height: {
    type: [Number, String],
    default: null
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: false
  },
  playsinline: {
    type: Boolean,
    default: true
  },
  preload: {
    type: String,
    default: 'metadata',
    validator: (value) => ['none', 'metadata', 'auto'].includes(value)
  },
  customControls: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  transcript: {
    type: String,
    default: ''
  },
  tracks: {
    type: Array,
    default: () => []
  },
  videoClass: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: ''
  },
  videoStyle: {
    type: Object,
    default: () => ({})
  },
  containerStyle: {
    type: Object,
    default: () => ({})
  },
  controls: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'error', 'loadedmetadata']);

// Referencias
const videoElement = ref(null);
const container = ref(null);
const progressBar = ref(null);
const announcer = ref(null);

// Estado
const error = ref(false);
const isPlaying = ref(false);
const isMuted = ref(props.muted);
const duration = ref(0);
const currentTime = ref(0);
const volume = ref(1);
const progress = ref(0);
const subtitlesEnabled = ref(false);
const showTranscript = ref(false);
const announcement = ref('');

// Generar IDs únicos para accesibilidad
const uniqueId = `video-${Math.random().toString(36).substring(2, 11)}`;
const descriptionId = `${uniqueId}-desc`;
const transcriptId = `${uniqueId}-transcript`;

// Comprobar si hay subtítulos disponibles
const hasSubtitles = computed(() => {
  return props.tracks.some(track => track.kind === 'subtitles' || track.kind === 'captions');
});

// Formatear transcripción con saltos de línea
const formattedTranscript = computed(() => {
  if (!props.transcript) return '';
  return props.transcript.replace(/\n/g, '<br>');
});

// Formatear tiempo (segundos a MM:SS)
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Anunciar para lectores de pantalla
const announce = (message) => {
  announcement.value = message;
  
  // Limpiar después de un tiempo para asegurar que se anuncie nuevamente
  setTimeout(() => {
    announcement.value = '';
  }, 3000);
};

// Alternar reproducción/pausa
const togglePlay = () => {
  if (!videoElement.value) return;
  
  if (videoElement.value.paused) {
    videoElement.value.play().catch(err => {
      console.error('Error al reproducir video:', err);
      error.value = true;
      announce('Error al reproducir el video');
    });
  } else {
    videoElement.value.pause();
  }
};

// Alternar silencio
const toggleMute = () => {
  if (!videoElement.value) return;
  
  videoElement.value.muted = !videoElement.value.muted;
  isMuted.value = videoElement.value.muted;
  
  announce(isMuted.value ? 'Video silenciado' : 'Sonido activado');
};

// Establecer volumen
const setVolume = (value) => {
  if (!videoElement.value) return;
  
  const newVolume = parseFloat(value);
  videoElement.value.volume = newVolume;
  volume.value = newVolume;
  
  // Si el volumen es 0, silenciar; si no, quitar silencio
  if (newVolume === 0 && !isMuted.value) {
    videoElement.value.muted = true;
    isMuted.value = true;
  } else if (newVolume > 0 && isMuted.value) {
    videoElement.value.muted = false;
    isMuted.value = false;
  }
  
  announce(`Volumen: ${Math.round(newVolume * 100)}%`);
};

// Alternar subtítulos
const toggleSubtitles = () => {
  if (!videoElement.value) return;
  
  const textTracks = videoElement.value.textTracks;
  
  if (textTracks.length === 0) return;
  
  subtitlesEnabled.value = !subtitlesEnabled.value;
  
  for (let i = 0; i < textTracks.length; i++) {
    if (textTracks[i].kind === 'subtitles' || textTracks[i].kind === 'captions') {
      // Usar 'showing' y 'disabled' en lugar de 'hidden' para mejor compatibilidad
      textTracks[i].mode = subtitlesEnabled.value ? 'showing' : 'disabled';
    }
  }
  
  announce(subtitlesEnabled.value ? 'Subtítulos activados' : 'Subtítulos desactivados');
};

// Buscar posición en el video
const seekToPosition = (event) => {
  if (!videoElement.value || !progressBar.value) return;
  
  const rect = progressBar.value.getBoundingClientRect();
  const pos = (event.clientX - rect.left) / rect.width;
  
  if (pos >= 0 && pos <= 1) {
    videoElement.value.currentTime = pos * duration.value;
    announce(`Avanzado a ${formatTime(videoElement.value.currentTime)}`);
  }
};

// Alternar pantalla completa
const toggleFullscreen = () => {
  if (!container.value) return;
  
  try {
    if (!document.fullscreenElement) {
      container.value.requestFullscreen().then(() => {
        announce('Pantalla completa activada');
      }).catch(err => {
        console.error('Error al entrar en pantalla completa:', err);
        announce('Error al activar pantalla completa');
      });
    } else {
      document.exitFullscreen().then(() => {
        announce('Pantalla completa desactivada');
      }).catch(err => {
        console.error('Error al salir de pantalla completa:', err);
      });
    }
  } catch (err) {
    // Fallback para navegadores que no soportan la API estándar
    try {
      // Métodos específicos de navegador
      if (container.value.webkitRequestFullscreen) {
        container.value.webkitRequestFullscreen();
      } else if (container.value.mozRequestFullScreen) {
        container.value.mozRequestFullScreen();
      } else if (container.value.msRequestFullscreen) {
        container.value.msRequestFullscreen();
      }
      announce('Pantalla completa activada');
    } catch (fallbackErr) {
      console.error('Error al usar métodos alternativos de pantalla completa:', fallbackErr);
      announce('Tu navegador no soporta pantalla completa');
    }
  }
};

// Alternar transcripción
const toggleTranscript = () => {
  showTranscript.value = !showTranscript.value;
  announce(showTranscript.value ? 'Transcripción mostrada' : 'Transcripción ocultada');
};

// Eventos del video
const onLoadedMetadata = (event) => {
  if (!videoElement.value) return;
  
  duration.value = videoElement.value.duration;
  
  // Inicializar subtítulos si hay pistas disponibles
  if (hasSubtitles.value) {
    const textTracks = videoElement.value.textTracks;
    
    // Asegurarse de que los subtítulos estén desactivados inicialmente
    for (let i = 0; i < textTracks.length; i++) {
      if (textTracks[i].kind === 'subtitles' || textTracks[i].kind === 'captions') {
        textTracks[i].mode = 'disabled';
      }
    }
  }
  
  emit('loadedmetadata', event);
};

const onError = (event) => {
  error.value = true;
  announce('Error al cargar el video');
  emit('error', event);
};

const onPlay = (event) => {
  isPlaying.value = true;
  announce('Reproduciendo video');
  emit('play', event);
};

const onPause = (event) => {
  isPlaying.value = false;
  announce('Video pausado');
  emit('pause', event);
};

const onEnded = (event) => {
  isPlaying.value = false;
  announce('Video finalizado');
  emit('ended', event);
};

const onTimeUpdate = (event) => {
  if (!videoElement.value) return;
  
  currentTime.value = videoElement.value.currentTime;
  
  // Calcular progreso en porcentaje
  if (duration.value > 0) {
    progress.value = (currentTime.value / duration.value) * 100;
  }
  
  emit('timeupdate', event);
};

const onVolumeChange = (event) => {
  if (!videoElement.value) return;
  
  volume.value = videoElement.value.volume;
  isMuted.value = videoElement.value.muted;
  
  emit('volumechange', event);
};

// Manejar eventos de teclado para accesibilidad
const handleKeyDown = (event) => {
  // Solo procesar eventos si el video está enfocado o si los controles están enfocados
  if (!videoElement.value || !container.value.contains(document.activeElement)) return;
  
  switch (event.key) {
    case ' ':
    case 'k':
      // Espacio o K: Reproducir/Pausar
      event.preventDefault();
      togglePlay();
      break;
    case 'm':
      // M: Silenciar/Activar sonido
      event.preventDefault();
      toggleMute();
      break;
    case 'f':
      // F: Pantalla completa
      event.preventDefault();
      toggleFullscreen();
      break;
    case 'c':
      // C: Subtítulos
      if (hasSubtitles.value) {
        event.preventDefault();
        toggleSubtitles();
      }
      break;
    case 't':
      // T: Transcripción
      if (props.transcript) {
        event.preventDefault();
        toggleTranscript();
      }
      break;
    case 'ArrowRight':
      // Flecha derecha: Avanzar 5 segundos
      event.preventDefault();
      if (videoElement.value) {
        videoElement.value.currentTime = Math.min(videoElement.value.currentTime + 5, duration.value);
        announce(`Avanzado a ${formatTime(videoElement.value.currentTime)}`);
      }
      break;
    case 'ArrowLeft':
      // Flecha izquierda: Retroceder 5 segundos
      event.preventDefault();
      if (videoElement.value) {
        videoElement.value.currentTime = Math.max(videoElement.value.currentTime - 5, 0);
        announce(`Retrocedido a ${formatTime(videoElement.value.currentTime)}`);
      }
      break;
    case 'ArrowUp':
      // Flecha arriba: Subir volumen
      event.preventDefault();
      if (videoElement.value) {
        setVolume(Math.min(videoElement.value.volume + 0.1, 1));
      }
      break;
    case 'ArrowDown':
      // Flecha abajo: Bajar volumen
      event.preventDefault();
      if (videoElement.value) {
        setVolume(Math.max(videoElement.value.volume - 0.1, 0));
      }
      break;
    case '0':
    case 'Home':
      // 0 o Home: Ir al inicio
      event.preventDefault();
      if (videoElement.value) {
        videoElement.value.currentTime = 0;
        announce('Inicio del video');
      }
      break;
    case 'End':
      // End: Ir al final
      event.preventDefault();
      if (videoElement.value) {
        videoElement.value.currentTime = duration.value;
        announce('Final del video');
      }
      break;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      // 1-9: Ir al porcentaje correspondiente del video
      event.preventDefault();
      if (videoElement.value) {
        const percent = parseInt(event.key) * 10;
        videoElement.value.currentTime = (duration.value * percent) / 100;
        announce(`${percent}% del video`);
      }
      break;
  }
};

// Configurar controles nativos si no se usan controles personalizados
onMounted(() => {
  if (!videoElement.value) return;
  
  // Si no se usan controles personalizados, mostrar controles nativos
  if (!props.customControls) {
    videoElement.value.controls = true;
  }
  
  // Inicializar volumen
  volume.value = videoElement.value.volume;
  
  // Inicializar estado de silencio
  isMuted.value = videoElement.value.muted;
  
  // Añadir event listeners para teclas de accesibilidad
  document.addEventListener('keydown', handleKeyDown);
  
  // Verificar si hay subtítulos por defecto
  if (hasSubtitles.value) {
    const defaultTrack = props.tracks.find(track => track.default);
    if (defaultTrack) {
      // Activar subtítulos por defecto después de un breve retraso
      setTimeout(() => {
        subtitlesEnabled.value = true;
        toggleSubtitles();
      }, 100);
    }
  }
});

// Limpiar event listeners
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// Observar cambios en src para resetear estados
watch(() => props.src, () => {
  error.value = false;
  currentTime.value = 0;
  duration.value = 0;
  progress.value = 0;
  isPlaying.value = false;
  
  // Reiniciar video cuando cambia la fuente
  nextTick(() => {
    if (videoElement.value) {
      videoElement.value.load();
    }
  });
});

// Observar cambios en tracks para actualizar estado de subtítulos
watch(() => props.tracks, () => {
  nextTick(() => {
    if (videoElement.value && hasSubtitles.value) {
      const textTracks = videoElement.value.textTracks;
      
      // Actualizar estado de subtítulos
      for (let i = 0; i < textTracks.length; i++) {
        if (textTracks[i].kind === 'subtitles' || textTracks[i].kind === 'captions') {
          textTracks[i].mode = subtitlesEnabled.value ? 'showing' : 'disabled';
        }
      }
    }
  });
}, { deep: true });
</script>

<style scoped>
.video-component-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  border-radius: var(--border-radius-md, 0.375rem);
  background-color: #000;
}

.video-component {
  display: block;
  width: 100%;
  height: auto;
}

/* Controles personalizados */
.video-component-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-component-container:hover .video-component-controls,
.video-component-container:focus-within .video-component-controls {
  opacity: 1;
}

.video-component-progress {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.video-component-progress-bar {
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-right: 1rem;
  cursor: pointer;
  position: relative;
}

.video-component-progress-fill {
  height: 100%;
  background-color: var(--color-primary, #4f46e5);
  border-radius: 2px;
}

.video-component-time {
  color: white;
  font-size: 0.75rem;
  min-width: 80px;
  text-align: right;
}

.video-component-buttons {
  display: flex;
  align-items: center;
}

.video-component-button {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.video-component-button:hover,
.video-component-button:focus {
  background-color: rgba(255, 255, 255, 0.2);
}

.video-component-button:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.video-component-button-active {
  color: var(--color-primary, #4f46e5);
}

.video-component-volume {
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
}

.video-component-volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
}

.video-component-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
}

.video-component-volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  cursor: pointer;
  border: none;
}

/* Información del video */
.video-component-info {
  margin-top: 1rem;
}

.video-component-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.video-component-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
}

/* Transcripción */
.video-component-transcript {
  margin-top: 1rem;
}

.video-component-transcript-toggle {
  background: none;
  border: none;
  color: var(--color-primary, #4f46e5);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  text-decoration: underline;
  border-radius: 0.25rem;
}

.video-component-transcript-toggle:hover,
.video-component-transcript-toggle:focus {
  color: var(--color-primary-dark, #4338ca);
  background-color: var(--color-background-hover, #f3f4f6);
}

.video-component-transcript-toggle:focus-visible {
  outline: 2px solid var(--color-primary, #4f46e5);
  outline-offset: 2px;
}

.video-component-transcript-content {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: var(--color-background-alt, #f9fafb);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.video-component-transcript-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

/* Error */
.video-component-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
}

.video-component-error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.video-component-error-icon {
  margin-bottom: 0.5rem;
}

/* Accesibilidad */
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

/* Responsive */
@media (max-width: 640px) {
  .video-component-volume {
    display: none;
  }
  
  .video-component-time {
    font-size: 0.7rem;
    min-width: 70px;
  }
  
  .video-component-button {
    padding: 0.25rem;
  }
}
</style>
