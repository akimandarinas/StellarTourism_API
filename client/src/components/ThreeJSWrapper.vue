<template>
  <ClientOnly>
    <div ref="container" class="three-container"></div>
    <template #placeholder>
      <div class="three-placeholder">
        <div class="loading-indicator">Loading 3D viewer...</div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import ClientOnly from './ClientOnly.vue';
import { useErrorHandler } from '../composables/useErrorHandler';

const { error, handleError } = useErrorHandler();

const props = defineProps({
  modelPath: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  }
});

const container = ref<HTMLElement | null>(null);
let threeInstance: any = null;

// Cargar Three.js solo en el cliente
const loadThree = async () => {
  if (!container.value) return;
  
  try {
    const THREE = await import('three');
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    
    // Crear escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Crear cámara
    const camera = new THREE.PerspectiveCamera(75, props.width / props.height, 0.1, 1000);
    camera.position.z = 5;
    
    // Crear renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(props.width, props.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.value.innerHTML = '';
    container.value.appendChild(renderer.domElement);
    
    // Añadir controles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Cargar modelo
    const loader = new GLTFLoader();
    loader.load(
      props.modelPath,
      (gltf) => {
        scene.add(gltf.scene);
        
        // Centrar modelo
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.x = -center.x;
        gltf.scene.position.y = -center.y;
        gltf.scene.position.z = -center.z;
      },
      undefined,
      (error) => handleError(error, 'GLTFLoader')
    );
    
    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Manejar redimensionamiento
    const handleResize = () => {
      if (!container.value) return;
      
      const width = container.value.clientWidth;
      const height = container.value.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Guardar referencia para limpieza
    threeInstance = {
      scene,
      camera,
      renderer,
      controls,
      cleanup: () => {
        window.removeEventListener('resize', handleResize);
        if (container.value) {
          container.value.innerHTML = '';
        }
        renderer.dispose();
      }
    };
  } catch (err) {
    handleError(err, 'ThreeJS');
  }
};

// Cargar Three.js cuando el componente se monta
onMounted(() => {
  if (typeof window !== 'undefined') {
    loadThree();
  }
});

// Limpiar recursos cuando el componente se desmonta
onBeforeUnmount(() => {
  if (threeInstance) {
    threeInstance.cleanup();
  }
});

// Actualizar cuando cambia el modelo
watch(() => props.modelPath, () => {
  if (threeInstance) {
    threeInstance.cleanup();
  }
  loadThree();
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.three-placeholder {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.loading-indicator {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}
</style>
