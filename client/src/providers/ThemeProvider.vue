<template>
  <div :class="['theme', `theme-${currentTheme}`]">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, provide } from 'vue';
import configService from '../services/config';

// Props
const props = defineProps({
  defaultTheme: {
    type: String,
    default: 'system' // 'light', 'dark', 'system'
  },
  storageKey: {
    type: String,
    default: 'stellar-theme'
  }
});

// Estado
const theme = ref(props.defaultTheme);
const systemTheme = ref('light');

// Tema actual basado en preferencias
const currentTheme = computed(() => {
  return theme.value === 'system' ? systemTheme.value : theme.value;
});

// Detectar tema del sistema
const detectSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    systemTheme.value = 'dark';
  } else {
    systemTheme.value = 'light';
  }
};

// Cambiar tema
const setTheme = (newTheme) => {
  theme.value = newTheme;
  localStorage.setItem(props.storageKey, newTheme);
  
  // Actualizar atributo en el documento
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    
    const themeToApply = newTheme === 'system' ? systemTheme.value : newTheme;
    document.documentElement.classList.add(themeToApply);
    
    // Actualizar meta tag para el tema del navegador
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColors = {
        light: configService.get('APP.THEME.LIGHT_COLOR', '#ffffff'),
        dark: configService.get('APP.THEME.DARK_COLOR', '#1a1a1a')
      };
      metaThemeColor.setAttribute('content', themeColors[themeToApply]);
    }
  }
};

// Inicializar tema
onMounted(() => {
  // Detectar tema del sistema
  detectSystemTheme();
  
  // Escuchar cambios en el tema del sistema
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Usar addEventListener si está disponible (más moderno)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        systemTheme.value = e.matches ? 'dark' : 'light';
      });
    } else if (mediaQuery.addListener) {
      // Fallback para navegadores más antiguos
      mediaQuery.addListener((e) => {
        systemTheme.value = e.matches ? 'dark' : 'light';
      });
    }
  }
  
  // Cargar tema guardado
  const savedTheme = localStorage.getItem(props.storageKey);
  if (savedTheme) {
    theme.value = savedTheme;
  }
  
  // Aplicar tema inicial
  setTheme(theme.value);
});

// Observar cambios en el tema
watch([theme, systemTheme], () => {
  setTheme(theme.value);
});

// Proporcionar contexto de tema a componentes hijos
provide('theme', {
  current: computed(() => currentTheme.value),
  isDark: computed(() => currentTheme.value === 'dark'),
  isLight: computed(() => currentTheme.value === 'light'),
  set: setTheme,
  toggle: () => {
    if (theme.value === 'system') {
      setTheme(systemTheme.value === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme.value === 'dark' ? 'light' : 'dark');
    }
  }
});
</script>

<style scoped>
.theme {
  height: 100%;
  min-height: 100%;
}
</style>
