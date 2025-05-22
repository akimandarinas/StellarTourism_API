<template>
  <div 
    ref="container" 
    class="model-viewer" 
    :class="{ 'loading': loading }"
    :style="{ height: height, width: width }"
  >
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando modelo...</p>
    </div>
    
    <!-- Controles de cámara -->
    <div v-if="showControls && !loading" class="camera-controls">
      <button 
        @click="resetCamera" 
        class="control-button reset" 
        aria-label="Restablecer vista"
        title="Restablecer vista"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
          <path d="M12 8v4l3 3"></path>
        </svg>
      </button>
      <button 
        @click="zoomIn" 
        class="control-button zoom-in" 
        aria-label="Acercar"
        title="Acercar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
      <button 
        @click="zoomOut" 
        class="control-button zoom-out" 
        aria-label="Alejar"
        title="Alejar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </button>
    </div>
    
    <div v-if="showInfo && !loading && modelInfo" class="model-info">
      <h3>{{ modelInfo.name }}</h3>
      <p v-if="modelInfo.description">{{ modelInfo.description }}</p>
    </div>
    
    <button 
      v-if="enableFullscreen && !loading" 
      @click="toggleFullscreen" 
      class="fullscreen-button" 
      aria-label="Pantalla completa"
      title="Pantalla completa"
    >
      <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
        <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
        <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
        <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
      </svg>
    </button>
    
    <!-- Mensaje de accesibilidad para lectores de pantalla -->
    <div class="sr-only" aria-live="polite">
      {{ accessibilityMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useIntersectionObserver } from '@composables/useIntersectionObserver';
import { usePerformanceMetrics } from '@composables/usePerformanceMetrics';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const props = defineProps({
  modelUrl: {
    type: String,
    required: true
  },
  modelType: {
    type: String,
    default: 'gltf',
    validator: (value) => ['gltf', 'obj', 'fbx'].includes(value)
  },
  modelInfo: {
    type: Object,
    default: null
  },
  
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  },
  
  cameraPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0, z: 5 })
  },
  
  ambientLightIntensity: {
    type: Number,
    default: 0.5
  },
  directionalLightIntensity: {
    type: Number,
    default: 0.8
  },
  
  //Opciones de interacción
  enableRotation: {
    type: Boolean,
    default: true
  },
  enableZoom: {
    type: Boolean,
    default: true
  },
  enablePan: {
    type: Boolean,
    default: false
  },
  autoRotate: {
    type: Boolean,
    default: false
  },
  
  //Opciones de UI
  showControls: {
    type: Boolean,
    default: true
  },
  showInfo: {
    type: Boolean,
    default: true
  },
  enableFullscreen: {
    type: Boolean,
    default: true
  },
  
  //Opciones de rendimiento
  enableShadows: {
    type: Boolean,
    default: false
  },
  antialiasing: {
    type: Boolean,
    default: true
  },
  
  //Opciones de accesibilidad
  ariaLabel: {
    type: String,
    default: 'Visualizador de modelo 3D'
  }
});

const emit = defineEmits(['loaded', 'error', 'click']);

const container = ref(null);
const loading = ref(true);
const isFullscreen = ref(false);
const accessibilityMessage = ref('Cargando modelo 3D...');

let scene, camera, renderer, controls, model;
let animationFrameId = null;

//Inicializar Three.js
const initThree = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  const { clientWidth, clientHeight } = container.value;
  camera = new THREE.PerspectiveCamera(75, clientWidth / clientHeight, 0.1, 1000);
  camera.position.set(
    props.cameraPosition.x,
    props.cameraPosition.y,
    props.cameraPosition.z
  );
  
  renderer = new THREE.WebGLRenderer({ 
    antialias: props.antialiasing,
    alpha: true
  });
  renderer.setSize(clientWidth, clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = props.enableShadows;
  container.value.appendChild(renderer.domElement);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, props.ambientLightIntensity);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, props.directionalLightIntensity);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = props.enableShadows;
  scene.add(directionalLight);
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableRotate = props.enableRotation;
  controls.enableZoom = props.enableZoom;
  controls.enablePan = props.enablePan;
  controls.autoRotate = props.autoRotate;
  
  loadModel();
  
  animate();
  
  window.addEventListener('resize', handleResize);
};

const loadModel = () => {
  loading.value = true;
  accessibilityMessage.value = 'Cargando modelo 3D...';
  
  if (props.modelType === 'gltf') {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    
    gltfLoader.load(
      props.modelUrl,
      (gltf) => {
        model = gltf.scene;
        
        //Centrar el modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        //Escalar el modelo para que se ajuste a la vista
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.set(scale, scale, scale);
        
        scene.add(model);
        
        loading.value = false;
        accessibilityMessage.value = props.modelInfo?.name 
          ? `Modelo 3D de ${props.modelInfo.name} cargado correctamente.` 
          : 'Modelo 3D cargado correctamente.';
        
        emit('loaded', { model: gltf });
      },
      (progress) => {
        const percentComplete = Math.round((progress.loaded / progress.total) * 100);
        accessibilityMessage.value = `Cargando modelo 3D... ${percentComplete}% completado.`;
      },
      (error) => {
        console.error('Error al cargar el modelo:', error);
        loading.value = false;
        accessibilityMessage.value = 'Error al cargar el modelo 3D.';
        emit('error', error);
      }
    );
  }
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  
  if (controls) {
    controls.update();
  }
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

const handleResize = () => {
  if (!container.value || !camera || !renderer) return;
  
  const { clientWidth, clientHeight } = container.value;
  
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(clientWidth, clientHeight);
};

const resetCamera = () => {
  if (!controls) return;
  
  controls.reset();
  accessibilityMessage.value = 'Vista restablecida.';
};

const zoomIn = () => {
  if (!controls) return;
  
  camera.position.z -= 0.5;
  accessibilityMessage.value = 'Acercando.';
};

const zoomOut = () => {
  if (!controls) return;
  
  camera.position.z += 0.5;
  accessibilityMessage.value = 'Alejando.';
};

const toggleFullscreen = () => {
  if (!container.value) return;
  
  if (!isFullscreen.value) {
    if (container.value.requestFullscreen) {
      container.value.requestFullscreen();
    } else if (container.value.mozRequestFullScreen) {
      container.value.mozRequestFullScreen();
    } else if (container.value.webkitRequestFullscreen) {
      container.value.webkitRequestFullscreen();
    } else if (container.value.msRequestFullscreen) {
      container.value.msRequestFullscreen();
    }
    
    isFullscreen.value = true;
    accessibilityMessage.value = 'Modo pantalla completa activado.';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    isFullscreen.value = false;
    accessibilityMessage.value = 'Modo pantalla completa desactivado.';
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
};

//Ciclo de vida del componente
onMounted(() => {
  if (container.value) {
    initThree();
  }
  
  // Escuchar eventos de pantalla completa
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
});

onBeforeUnmount(() => {
  // Limpiar recursos
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  if (controls) {
    controls.dispose();
  }
  
  if (renderer) {
    renderer.dispose();
    
    if (container.value && renderer.domElement) {
      container.value.removeChild(renderer.domElement);
    }
  }
  
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
});

watch(() => props.modelUrl, () => {
  //Limpiar modelo anterior
  if (model) {
    scene.remove(model);
    model = null;
  }
  
  loadModel();
});
</script>

<style scoped>
.model-viewer {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  background-color: #f0f0f0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(240, 240, 240, 0.8);
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.camera-controls {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 5;
}

.control-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #4b5563;
  transition: background-color 0.2s, transform 0.2s;
}

.control-button:hover {
  background-color: #f9fafb;
  transform: translateY(-2px);
}

.control-button:active {
  transform: translateY(0);
}

.model-info {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem;
  border-radius: 0.5rem;
  max-width: 50%;
  z-index: 5;
}

.model-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.model-info p {
  margin: 0;
  font-size: 0.875rem;
}

.fullscreen-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #4b5563;
  z-index: 5;
  transition: background-color 0.2s, transform 0.2s;
}

.fullscreen-button:hover {
  background-color: #f9fafb;
  transform: translateY(-2px);
}

.fullscreen-button:active {
  transform: translateY(0);
}

:fullscreen .model-viewer {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

:-webkit-full-screen .model-viewer {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

:-moz-full-screen .model-viewer {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

:-ms-fullscreen .model-viewer {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}
</style>
