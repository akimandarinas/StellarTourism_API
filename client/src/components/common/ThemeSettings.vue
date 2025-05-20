<template>
  <div class="theme-settings">
    <h3 class="theme-settings-title">Configuración de tema</h3>
    
    <div class="theme-options">
      <button 
        class="theme-option" 
        :class="{ 'active': currentTheme === THEMES.LIGHT }"
        @click="changeTheme(THEMES.LIGHT)"
        aria-label="Seleccionar tema claro"
      >
        <div class="theme-preview light-preview">
          <div class="preview-header"></div>
          <div class="preview-content">
            <div class="preview-line"></div>
            <div class="preview-line short"></div>
          </div>
        </div>
        <span class="theme-label">Claro</span>
      </button>
      
      <button 
        class="theme-option" 
        :class="{ 'active': currentTheme === THEMES.DARK }"
        @click="changeTheme(THEMES.DARK)"
        aria-label="Seleccionar tema oscuro"
      >
        <div class="theme-preview dark-preview">
          <div class="preview-header"></div>
          <div class="preview-content">
            <div class="preview-line"></div>
            <div class="preview-line short"></div>
          </div>
        </div>
        <span class="theme-label">Oscuro</span>
      </button>
      
      <button 
        class="theme-option" 
        :class="{ 'active': currentTheme === THEMES.SYSTEM }"
        @click="changeTheme(THEMES.SYSTEM)"
        aria-label="Usar preferencia del sistema"
      >
        <div class="theme-preview system-preview">
          <div class="preview-half light-preview">
            <div class="preview-header"></div>
            <div class="preview-content">
              <div class="preview-line"></div>
            </div>
          </div>
          <div class="preview-half dark-preview">
            <div class="preview-header"></div>
            <div class="preview-content">
              <div class="preview-line"></div>
            </div>
          </div>
        </div>
        <span class="theme-label">Sistema</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { THEMES, getTheme, setTheme } from '../../ui/theme';

// Obtener el tema del provider
const theme = inject('theme');
const currentTheme = computed(() => theme?.current?.value || getTheme());

// Cambiar tema
function changeTheme(newTheme) {
  if (theme?.change) {
    theme.change(newTheme);
  } else {
    setTheme(newTheme);
  }
}
</script>

<style scoped>
.theme-settings {
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-background-secondary);
  box-shadow: var(--shadow-md);
}

.theme-settings-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.theme-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  border: 2px solid transparent;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background-color: var(--color-background-hover);
}

.theme-option.active {
  border-color: var(--color-primary);
}

.theme-preview {
  width: 100px;
  height: 70px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.light-preview {
  background-color: #ffffff;
  color: #000000;
}

.dark-preview {
  background-color: #121212;
  color: #ffffff;
}

.system-preview {
  display: flex;
  overflow: hidden;
}

.preview-half {
  width: 50%;
  height: 100%;
}

.preview-header {
  height: 20%;
  background-color: currentColor;
  opacity: 0.1;
}

.preview-content {
  height: 80%;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-line {
  height: 0.5rem;
  background-color: currentColor;
  opacity: 0.2;
  border-radius: 999px;
}

.preview-line.short {
  width: 70%;
}

.theme-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
}
</style>
