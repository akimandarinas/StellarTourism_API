<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :aria-label="ariaLabel"
    type="button"
  >
    <div class="theme-toggle-icon-wrapper">
      <SunIcon v-if="isDark" class="theme-icon sun" size="18" />
      <MoonIcon v-else class="theme-icon moon" size="18" />
    </div>
    <span v-if="showLabel" class="theme-toggle-label">
      {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { SunIcon, MoonIcon } from '@/utils/lucide-adapter';
import { isDarkTheme, toggleTheme } from '../theme';

const props = defineProps({
  showLabel: {
    type: Boolean,
    default: false
  }
});

const isDark = computed(() => isDarkTheme());

const ariaLabel = computed(() => {
  return isDark.value
    ? 'Cambiar a tema claro'
    : 'Cambiar a tema oscuro';
});
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--border-radius-full);
  background-color: var(--color-background-secondary);
  color: var(--color-text);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, transform 0.2s;
}

.theme-toggle:hover {
  background-color: var(--color-background-hover);
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-toggle-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.theme-icon {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.theme-toggle:hover .theme-icon {
  transform: rotate(15deg);
}

.theme-toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Animaciones específicas para cada icono */
.sun {
  color: var(--color-warning);
}

.moon {
  color: var(--color-primary);
}
</style>
