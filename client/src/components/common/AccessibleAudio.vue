<template>
  <div 
    :class="[containerClass, 'accessible-audio-container']" 
    :style="containerStyle"
    ref="container"
  >
    <!-- Audio con controles accesibles -->
    <audio
      ref="audioElement"
      :src="src"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :preload="preload"
      class="accessible-audio"
      @loadedmetadata="onLoadedMetadata"
      @error="onError"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @volumechange="onVolumeChange"
      :aria-label="title || 'Audio'"
      :aria-describedby="descriptionId"
    >
      <!-- Mensaje de fallback para navegadores que no soportan audio -->
      <p>Tu navegador no soporta la reproducción de audio HTML5. Puedes <a :href="src" download>descargar el audio</a> para escucharlo en tu reproductor local.</p>
    </audio>
    
    <!-- Controles personalizados accesibles -->
    <div v-if="customControls" class="accessible-audio-controls">
      <div class="accessible-audio-progress">
        <button 
          @click="togglePlay"
          class="accessible-audio-button accessible-audio-play-button"
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
        
        <div class="accessible-audio-progress-bar-container">
          <div 
            class="accessible-audio-progress-bar"
            ref="progressBar"
            @click="seekAudio"
            role="slider"
            :aria-label="'Progreso del audio'"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="Math.round(progress)"
            :aria-valuetext="`${Math.round(progress)}%`"
            tabindex="0"
            @keydown.left="seekBackward"
            @keydown.right="seekForward"
            @keydown.home="seekToStart"
            @keydown.end="seekToEnd"
          >
            <div 
              class="accessible-audio-progress-fill" 
              :style="{ width: `${progress}%` }"
            ></div>
            <div 
              class="accessible-audio-progress-handle"
              :style="{ left: `${progress}%` }"
            ></div>
          </div>
          
          <div class="accessible-audio-time">
            <span>{{ formatTime(currentTime) }}</span>
            <span>/</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
        
        <div class="accessible-audio-volume-container">
          <button 
            @click="toggleMute"
            class="accessible-audio-button"
            :aria-label="isMuted ? 'Activar sonido' : 'Silenciar'"
            :title="isMuted ? 'Activar sonido' : 'Silenciar'"
          >
            <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
          
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            :value="volume"
            @input="setVolume($event.target.value)"
            class="accessible-audio-volume-slider"
            aria-label="Volumen"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="Math.round(volume * 100)"
            :aria-valuetext="`Volumen ${Math.round(volume * 100)}%`"
          />
        </div>
        
        <div class="accessible-audio-speed-container">
          <button 
            @click="toggleSpeedMenu"
            class="accessible-audio-button accessible-audio-speed-button"
            :aria-expanded="showSpeedMenu ? 'true' : 'false'"
            :aria-controls="speedMenuId"
            aria-label="Velocidad de reproducción"
            :title="`Velocidad: ${playbackRate}x`"
          >
            {{ playbackRate }}x
          </button>
          
          <div 
            v-if="showSpeedMenu" 
            class="accessible-audio-speed-menu"
            :id="speedMenuId"
            role="menu"
          >
            <button 
              v-for="rate in playbackRates" 
              :key="rate"
              @click="setPlaybackRate(rate)"
              class="accessible-audio-speed-item"
              :class="{ 'accessible-audio-speed-item-active': playbackRate === rate }"
              role="menuitem"
              :aria-checked="playbackRate === rate ? 'true' : 'false'"
            >
              {{ rate }}x
            </button>
          </div>
        </div>
        
        <button 
          v-if="downloadable"
          @click="downloadAudio"
          class="accessible-audio-button accessible-audio-download-button"
          aria-label="Descargar audio"
          title="Descargar audio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Título y descripción del audio -->
    <div v-if="title || description" class="accessible-audio-info">
      <h3 v-if="title" class="accessible-audio-title">{{ title }}</h3>
      <p 
        v-if="description" 
        class="accessible-audio-description"
        :id="descriptionId"
      >
        {{ description }}
      </p>
    </div>
    
    <!-- Transcripción del audio (opcional) -->
    <div v-if="transcript" class="accessible-audio-transcript">
      <button 
        v-if="!showTranscript" 
        @click="toggleTranscript"
        class="accessible-audio-transcript-toggle"
        :aria-expanded="showTranscript ? 'true' : 'false'"
        :aria-controls="transcriptId"
      >
        Mostrar transcripción
      </button>
      <div 
        v-show="showTranscript" 
        class="accessible-audio-transcript-content"
        :id="transcriptId"
      >
        <h4 class="accessible-audio-transcript-title">Transcripción</h4>
        <div v-html="formattedTranscript"></div>
        <button 
          v-if="showTranscript" 
          @click="toggleTranscript"
          class="accessible-audio-transcript-toggle"
          aria-expanded="true"
          :aria-controls="transcriptId"
        >
          Ocultar transcripción
        </button>
      </div>
    </div>
    
    <!-- Indicador de error -->
    <div 
      v-if="error" 
      class="accessible-audio-error"
      role="alert"
    >
      <slot name="error">
        <div class="accessible-audio-error-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="accessible-audio-error-icon" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Error al cargar el audio</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { generateId } from '../../utils/id';

export default {
  name: 'AccessibleAudio',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      required: true
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
    downloadable: {
      type: Boolean,
      default: true
    },
    containerClass: {
      type: String,
      default: ''
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['play', 'pause', 'ended', 'timeupdate', 'volumechange', 'error', 'loadedmetadata'],
  
  setup(props, { emit }) {
    const audioElement = ref(null);
    const container = ref(null);
    const progressBar = ref(null);
    const error = ref(false);
    const isPlaying = ref(false);
    const isMuted = ref(props.muted);
    const duration = ref(0);
    const currentTime = ref(0);
    const volume = ref(1);
    const progress = ref(0);
    const playbackRate = ref(1);
    const showSpeedMenu = ref(false);
    const showTranscript = ref(false);
    
    // Opciones de velocidad de reproducción
    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    
    // Generar IDs únicos para accesibilidad
    const descriptionId = ref(`audio-desc-${generateId()}`);
    const transcriptId = ref(`audio-transcript-${generateId()}`);
    const speedMenuId = ref(`audio-speed-${generateId()}`);
    
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
    
    // Alternar reproducción/pausa
    const togglePlay = () => {
      if (!audioElement.value) return;
      
      if (audioElement.value.paused) {
        audioElement.value.play().catch(err => {
          console.error('Error al reproducir audio:', err);
          error.value = true;
        });
      } else {
        audioElement.value.pause();
      }
    };
    
    // Alternar silencio
    const toggleMute = () => {
      if (!audioElement.value) return;
      
      audioElement.value.muted = !audioElement.value.muted;
      isMuted.value = audioElement.value.muted;
    };
    
    // Establecer volumen
    const setVolume = (value) => {
      if (!audioElement.value) return;
      
      const newVolume = parseFloat(value);
      audioElement.value.volume = newVolume;
      volume.value = newVolume;
      
      // Si el volumen es 0, silenciar; si no, quitar silencio
      if (newVolume === 0 && !isMuted.value) {
        audioElement.value.muted = true;
        isMuted.value = true;
      } else if (newVolume > 0 && isMuted.value) {
        audioElement.value.muted = false;
        isMuted.value = false;
      }
    };
    
    // Establecer velocidad de reproducción
    const setPlaybackRate = (rate) => {
      if (!audioElement.value) return;
      
      audioElement.value.playbackRate = rate;
      playbackRate.value = rate;
      showSpeedMenu.value = false;
    };
    
    // Alternar menú de velocidad
    const toggleSpeedMenu = () => {
      showSpeedMenu.value = !showSpeedMenu.value;
    };
    
    // Buscar en el audio (al hacer clic en la barra de progreso)
    const seekAudio = (event) => {
      if (!audioElement.value || !progressBar.value) return;
      
      const rect = progressBar.value.getBoundingClientRect();
      const clickPosition = (event.clientX - rect.left) / rect.width;
      const newTime = clickPosition * duration.value;
      
      audioElement.value.currentTime = newTime;
    };
    
    // Buscar hacia atrás (5 segundos)
    const seekBackward = () => {
      if (!audioElement.value) return;
      
      audioElement.value.currentTime = Math.max(audioElement.value.currentTime - 5, 0);
    };
    
    // Buscar hacia adelante (5 segundos)
    const seekForward = () => {
      if (!audioElement.value) return;
      
      audioElement.value.currentTime = Math.min(audioElement.value.currentTime + 5, duration.value);
    };
    
    // Ir al inicio
    const seekToStart = () => {
      if (!audioElement.value) return;
      
      audioElement.value.currentTime = 0;
    };
    
    // Ir al final
    const seekToEnd = () => {
      if (!audioElement.value) return;
      
      audioElement.value.currentTime = duration.value;
    };
    
    // Alternar transcripción
    const toggleTranscript = () => {
      showTranscript.value = !showTranscript.value;
    };
    
    // Descargar audio
    const downloadAudio = () => {
      if (!props.src) return;
      
      const link = document.createElement('a');
      link.href = props.src;
      link.download = props.title || 'audio';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    // Eventos del audio
    const onLoadedMetadata = (event) => {
      if (!audioElement.value) return;
      
      duration.value = audioElement.value.duration;
      emit('loadedmetadata', event);
    };
    
    const onError = (event) => {
      error.value = true;
      emit('error', event);
    };
    
    const onPlay = (event) => {
      isPlaying.value = true;
      emit('play', event);
    };
    
    const onPause = (event) => {
      isPlaying.value = false;
      emit('pause', event);
    };
    
    const onEnded = (event) => {
      isPlaying.value = false;
      emit('ended', event);
    };
    
    const onTimeUpdate = (event) => {
      if (!audioElement.value) return;
      
      currentTime.value = audioElement.value.currentTime;
      
      // Calcular progreso en porcentaje
      if (duration.value > 0) {
        progress.value = (currentTime.value / duration.value) * 100;
      }
      
      emit('timeupdate', event);
    };
    
    const onVolumeChange = (event) => {
      if (!audioElement.value) return;
      
      volume.value = audioElement.value.volume;
      isMuted.value = audioElement.value.muted;
      
      emit('volumechange', event);
    };
    
    // Cerrar menú de velocidad al hacer clic fuera
    const handleClickOutside = (event) => {
      if (showSpeedMenu.value) {
        const speedButton = container.value?.querySelector('.accessible-audio-speed-button');
        const speedMenu = container.value?.querySelector('.accessible-audio-speed-menu');
        
        if (speedButton && 
            !speedButton.contains(event.target) && 
            speedMenu && 
            !speedMenu.contains(event.target)) {
          showSpeedMenu.value = false;
        }
      }
    };
    
    // Configurar controles nativos si no se usan controles personalizados
    onMounted(() => {
      if (!audioElement.value) return;
      
      // Si no se usan controles personalizados, mostrar controles nativos
      if (!props.customControls) {
        audioElement.value.controls = true;
      }
      
      // Inicializar volumen
      volume.value = audioElement.value.volume;
      
      // Inicializar estado de silencio
      isMuted.value = audioElement.value.muted;
      
      // Añadir event listeners
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    });
    
    // Manejar eventos de teclado para accesibilidad
    const handleKeyDown = (event) => {
      // Solo procesar eventos si el audio está enfocado o si los controles están enfocados
      if (!audioElement.value || !container.value.contains(document.activeElement)) return;
      
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
        case 'ArrowRight':
          // Flecha derecha: Avanzar 5 segundos
          event.preventDefault();
          seekForward();
          break;
        case 'ArrowLeft':
          // Flecha izquierda: Retroceder 5 segundos
          event.preventDefault();
          seekBackward();
          break;
        case 'ArrowUp':
          // Flecha arriba: Subir volumen
          event.preventDefault();
          if (audioElement.value) {
            setVolume(Math.min(audioElement.value.volume + 0.1, 1));
          }
          break;
        case 'ArrowDown':
          // Flecha abajo: Bajar volumen
          event.preventDefault();
          if (audioElement.value) {
            setVolume(Math.max(audioElement.value.volume - 0.1, 0));
          }
          break;
        case '0':
        case 'Home':
          // 0 o Home: Ir al inicio
          event.preventDefault();
          seekToStart();
          break;
        case 'End':
          // End: Ir al final
          event.preventDefault();
          seekToEnd();
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
          // 1-9: Ir al porcentaje correspondiente del audio
          event.preventDefault();
          if (audioElement.value) {
            const percent = parseInt(event.key) * 10;
            audioElement.value.currentTime = (duration.value * percent) / 100;
          }
          break;
      }
    };
    
    // Limpiar event listeners
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    });
    
    // Observar cambios en src para resetear estados
    watch(() => props.src, () => {
      error.value = false;
      currentTime.value = 0;
      duration.value = 0;
      progress.value = 0;
      isPlaying.value = false;
    });
    
    return {
      audioElement,
      container,
      progressBar,
      error,
      isPlaying,
      isMuted,
      duration,
      currentTime,
      volume,
      progress,
      playbackRate,
      playbackRates,
      showSpeedMenu,
      showTranscript,
      descriptionId,
      transcriptId,
      speedMenuId,
      formattedTranscript,
      formatTime,
      togglePlay,
      toggleMute,
      setVolume,
      setPlaybackRate,
      toggleSpeedMenu,
      seekAudio,
      seekBackward,
      seekForward,
      seekToStart,
      seekToEnd,
      toggleTranscript,
      downloadAudio,
      onLoadedMetadata,
      onError,
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onVolumeChange
    };
  }
};
</script>

<style scoped>
.accessible-audio-container {
  width: 100%;
  max-width: 100%;
  border-radius: var(--border-radius-md);
  background-color: var(--color-background-alt);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}

.accessible-audio {
  display: none;
}

/* Controles personalizados */
.accessible-audio-controls {
  width: 100%;
}

.accessible-audio-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.accessible-audio-button {
  background: none;
  border: none;
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accessible-audio-button:hover,
.accessible-audio-button:focus {
  background-color: var(--color-background-hover);
}

.accessible-audio-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.accessible-audio-play-button {
  min-width: 40px;
  min-height: 40px;
}

.accessible-audio-progress-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.accessible-audio-progress-bar {
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.accessible-audio-progress-bar:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.accessible-audio-progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 4px;
  position: absolute;
  top: 0;
  left: 0;
}

.accessible-audio-progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background-color: var(--color-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 2px var(--color-background);
  display: none;
}

.accessible-audio-progress-bar:hover .accessible-audio-progress-handle,
.accessible-audio-progress-bar:focus .accessible-audio-progress-handle {
  display: block;
}

.accessible-audio-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.25rem;
  justify-content: flex-end;
}

.accessible-audio-volume-container {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.accessible-audio-volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--color-border);
  border-radius: 2px;
  outline: none;
}

.accessible-audio-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-primary);
  cursor: pointer;
}

.accessible-audio-volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-primary);
  cursor: pointer;
  border: none;
}

.accessible-audio-speed-container {
  position: relative;
}

.accessible-audio-speed-button {
  min-width: 40px;
  font-weight: 500;
}

.accessible-audio-speed-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
  margin-top: 0.25rem;
  min-width: 80px;
}

.accessible-audio-speed-item {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.accessible-audio-speed-item:hover,
.accessible-audio-speed-item:focus {
  background-color: var(--color-background-hover);
}

.accessible-audio-speed-item-active {
  color: var(--color-primary);
  font-weight: 500;
}

.accessible-audio-download-button {
  margin-left: auto;
}

/* Información del audio */
.accessible-audio-info {
  margin-top: 1rem;
}

.accessible-audio-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.accessible-audio-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Transcripción */
.accessible-audio-transcript {
  margin-top: 1rem;
}

.accessible-audio-transcript-toggle {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  text-decoration: underline;
  border-radius: var(--border-radius-sm);
}

.accessible-audio-transcript-toggle:hover,
.accessible-audio-transcript-toggle:focus {
  color: var(--color-primary-dark);
  background-color: var(--color-background-hover);
}

.accessible-audio-transcript-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.accessible-audio-transcript-content {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
}

.accessible-audio-transcript-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

/* Error */
.accessible-audio-error {
  padding: 1rem;
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
  border-radius: var(--border-radius-md);
  margin-top: 1rem;
}

.accessible-audio-error-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.accessible-audio-error-icon {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .accessible-audio-progress {
    gap: 0.25rem;
  }
  
  .accessible-audio-volume-container {
    display: none;
  }
  
  .accessible-audio-button {
    padding: 0.25rem;
  }
  
  .accessible-audio-play-button {
    min-width: 32px;
    min-height: 32px;
  }
}
</style>
