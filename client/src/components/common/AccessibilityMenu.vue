<template>
  <div class="accessibility-menu">
    <button 
      @click="toggleMenu"
      class="accessibility-toggle"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-controls="accessibility-panel"
      aria-label="Opciones de accesibilidad"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v8"></path>
        <path d="M8 12h8"></path>
      </svg>
      <span class="sr-only">Accesibilidad</span>
    </button>
    
    <transition name="slide">
      <div 
        v-if="isOpen" 
        id="accessibility-panel"
        class="accessibility-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
      >
        <div class="accessibility-header">
          <h2 id="accessibility-title" class="accessibility-title">Opciones de accesibilidad</h2>
          <button 
            @click="closeMenu"
            class="accessibility-close"
            aria-label="Cerrar panel de accesibilidad"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="accessibility-content">
          <AccessibilitySettings />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import AccessibilitySettings from './AccessibilitySettings.vue';

export default {
  name: 'AccessibilityMenu',
  components: {
    AccessibilitySettings
  },
  data() {
    return {
      isOpen: false,
      previousActiveElement: null
    };
  },
  methods: {
    toggleMenu() {
      if (this.isOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    },
    openMenu() {
      this.previousActiveElement = document.activeElement;
      this.isOpen = true;
      
      // Enfocar el panel después de abrirlo
      this.$nextTick(() => {
        const panel = document.getElementById('accessibility-panel');
        if (panel) {
          const firstFocusable = panel.querySelector('button, [tabindex="0"]');
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            panel.focus();
          }
        }
      });
      
      // Añadir event listener para cerrar con Escape
      document.addEventListener('keydown', this.handleKeyDown);
    },
    closeMenu() {
      this.isOpen = false;
      
      // Devolver el foco al elemento anterior
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
      }
      
      // Eliminar event listener
      document.removeEventListener('keydown', this.handleKeyDown);
    },
    handleKeyDown(event) {
      if (event.key === 'Escape') {
        this.closeMenu();
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
};
</script>

<style scoped>
.accessibility-menu {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
}

.accessibility-toggle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s;
}

.accessibility-toggle:hover {
  background-color: var(--color-primary-dark);
}

.accessibility-toggle:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.accessibility-panel {
  position: fixed;
  bottom: 5rem;
  right: 1.5rem;
  width: 350px;
  max-width: calc(100vw - 2rem);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 51;
}

.accessibility-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.accessibility-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.accessibility-close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.accessibility-close:hover {
  background-color: var(--color-background-hover);
}

.accessibility-close:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.accessibility-content {
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
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

/* Animaciones */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
