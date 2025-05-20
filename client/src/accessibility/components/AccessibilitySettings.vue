<template>
  <div class="accessibility-settings">
    <h2 class="accessibility-settings-title">Configuración de Accesibilidad</h2>
    
    <div class="accessibility-settings-section">
      <h3 class="accessibility-settings-section-title">Contraste</h3>
      <div class="accessibility-settings-option">
        <input 
          type="checkbox" 
          id="high-contrast" 
          v-model="highContrast"
          @change="updateSettings"
        />
        <label for="high-contrast">Alto contraste</label>
      </div>
    </div>
    
    <div class="accessibility-settings-section">
      <h3 class="accessibility-settings-section-title">Movimiento</h3>
      <div class="accessibility-settings-option">
        <input 
          type="checkbox" 
          id="reduce-motion" 
          v-model="reducedMotion"
          @change="updateSettings"
        />
        <label for="reduce-motion">Reducir movimiento</label>
      </div>
    </div>
    
    <div class="accessibility-settings-section">
      <h3 class="accessibility-settings-section-title">Texto</h3>
      <div class="accessibility-settings-option">
        <input 
          type="checkbox" 
          id="dyslexic-font" 
          v-model="dyslexicFont"
          @change="updateSettings"
        />
        <label for="dyslexic-font">Fuente para dislexia</label>
      </div>
      
      <div class="accessibility-settings-option">
        <label for="font-size">Tamaño de texto</label>
        <select 
          id="font-size" 
          v-model="fontSize"
          @change="updateSettings"
        >
          <option value="normal">Normal</option>
          <option value="large">Grande</option>
          <option value="x-large">Extra grande</option>
        </select>
      </div>
    </div>
    
    <div class="accessibility-settings-section">
      <h3 class="accessibility-settings-section-title">Navegación</h3>
      <div class="accessibility-settings-option">
        <input 
          type="checkbox" 
          id="focus-indicators" 
          v-model="focusIndicators"
          @change="updateSettings"
        />
        <label for="focus-indicators">Indicadores de foco mejorados</label>
      </div>
    </div>
    
    <div class="accessibility-settings-actions">
      <button 
        class="accessibility-settings-reset"
        @click="resetSettings"
      >
        Restablecer valores predeterminados
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { prefersReducedMotion, isHighContrastMode } from '../utils/preferences';

export default {
  name: 'AccessibilitySettings',
  emits: ['update'],
  setup(props, { emit }) {
    // Estado de las configuraciones
    const highContrast = ref(false);
    const reducedMotion = ref(false);
    const dyslexicFont = ref(false);
    const fontSize = ref('normal');
    const focusIndicators = ref(true);
    
    // Cargar configuraciones guardadas
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('accessibility-settings');
        
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          
          highContrast.value = settings.highContrast ?? isHighContrastMode();
          reducedMotion.value = settings.reducedMotion ?? prefersReducedMotion();
          dyslexicFont.value = settings.dyslexicFont ?? false;
          fontSize.value = settings.fontSize ?? 'normal';
          focusIndicators.value = settings.focusIndicators ?? true;
        } else {
          // Usar preferencias del sistema como valores iniciales
          highContrast.value = isHighContrastMode();
          reducedMotion.value = prefersReducedMotion();
        }
      } catch (error) {
        console.error('Error al cargar configuraciones de accesibilidad:', error);
      }
    };
    
    // Guardar configuraciones
    const saveSettings = () => {
      try {
        const settings = {
          highContrast: highContrast.value,
          reducedMotion: reducedMotion.value,
          dyslexicFont: dyslexicFont.value,
          fontSize: fontSize.value,
          focusIndicators: focusIndicators.value
        };
        
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Error al guardar configuraciones de accesibilidad:', error);
      }
    };
    
    // Actualizar configuraciones
    const updateSettings = () => {
      saveSettings();
      
      // Aplicar configuraciones
      applySettings();
      
      // Emitir evento de actualización
      emit('update', {
        highContrast: highContrast.value,
        reducedMotion: reducedMotion.value,
        dyslexicFont: dyslexicFont.value,
        fontSize: fontSize.value,
        focusIndicators: focusIndicators.value
      });
    };
    
    // Aplicar configuraciones al DOM
    const applySettings = () => {
      const htmlElement = document.documentElement;
      
      // Alto contraste
      if (highContrast.value) {
        htmlElement.classList.add('high-contrast');
      } else {
        htmlElement.classList.remove('high-contrast');
      }
      
      // Reducción de movimiento
      if (reducedMotion.value) {
        htmlElement.classList.add('reduce-motion');
      } else {
        htmlElement.classList.remove('reduce-motion');
      }
      
      // Fuente para dislexia
      if (dyslexicFont.value) {
        htmlElement.classList.add('dyslexic-font');
      } else {
        htmlElement.classList.remove('dyslexic-font');
      }
      
      // Tamaño de texto
      htmlElement.classList.remove('font-size-normal', 'font-size-large', 'font-size-x-large');
      htmlElement.classList.add(`font-size-${fontSize.value}`);
      
      // Indicadores de foco
      if (focusIndicators.value) {
        htmlElement.classList.add('focus-visible-enhanced');
      } else {
        htmlElement.classList.remove('focus-visible-enhanced');
      }
    };
    
    // Restablecer valores predeterminados
    const resetSettings = () => {
      highContrast.value = isHighContrastMode();
      reducedMotion.value = prefersReducedMotion();
      dyslexicFont.value = false;
      fontSize.value = 'normal';
      focusIndicators.value = true;
      
      updateSettings();
    };
    
    // Cargar y aplicar configuraciones al montar el componente
    onMounted(() => {
      loadSettings();
      applySettings();
    });
    
    return {
      highContrast,
      reducedMotion,
      dyslexicFont,
      fontSize,
      focusIndicators,
      updateSettings,
      resetSettings
    };
  }
};
</script>

<style scoped>
.accessibility-settings {
  padding: 1.5rem;
  background-color: var(--color-background, #ffffff);
  border-radius: var(--border-radius-lg, 0.5rem);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
}

.accessibility-settings-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text, #1a202c);
}

.accessibility-settings-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border, #e2e8f0);
}

.accessibility-settings-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.accessibility-settings-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text, #1a202c);
}

.accessibility-settings-option {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.accessibility-settings-option:last-child {
  margin-bottom: 0;
}

.accessibility-settings-option label {
  margin-left: 0.5rem;
  color: var(--color-text, #1a202c);
}

.accessibility-settings-option select {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--border-radius-sm, 0.125rem);
  background-color: var(--color-background, #ffffff);
  color: var(--color-text, #1a202c);
}

.accessibility-settings-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.accessibility-settings-reset {
  padding: 0.5rem 1rem;
  background-color: var(--color-background-alt, #f7fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--border-radius-md, 0.375rem);
  color: var(--color-text, #1a202c);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.accessibility-settings-reset:hover {
  background-color: var(--color-background-hover, #edf2f7);
}

.accessibility-settings-reset:focus-visible {
  outline: 2px solid var(--color-primary, #3182ce);
  outline-offset: 2px;
}
</style>
