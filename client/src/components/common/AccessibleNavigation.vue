<template>
  <nav 
    :class="['accessible-nav', className]" 
    :aria-label="ariaLabel"
  >
    <!-- Enlaces de salto -->
    <div v-if="skipLinks && skipLinks.length > 0" class="skip-links">
      <a 
        v-for="link in skipLinks" 
        :key="link.id"
        :href="link.href"
        class="skip-link"
      >
        {{ link.text }}
      </a>
    </div>
    
    <!-- Navegación principal -->
    <ul 
      :class="['nav-list', { 'nav-horizontal': horizontal }]"
      :role="role"
      :aria-orientation="horizontal ? 'horizontal' : 'vertical'"
    >
      <li 
        v-for="(item, index) in items" 
        :key="item.id || index"
        :class="[
          'nav-item', 
          { 
            'nav-item-active': isItemActive(item),
            'nav-item-has-children': item.children && item.children.length > 0
          }
        ]"
      >
        <!-- Enlace principal -->
        <component 
          :is="item.external ? 'a' : 'router-link'"
          :to="!item.external ? item.href : undefined"
          :href="item.external ? item.href : undefined"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noopener noreferrer' : undefined"
          :aria-current="isItemActive(item) ? 'page' : undefined"
          :aria-expanded="item.children && item.children.length > 0 ? String(expandedItems.includes(item.id)) : undefined"
          :aria-haspopup="item.children && item.children.length > 0 ? 'true' : undefined"
          :class="['nav-link', { 'nav-link-active': isItemActive(item) }]"
          @click="item.children && item.children.length > 0 ? toggleSubmenu(item.id) : null"
        >
          <span v-if="item.icon" class="nav-icon" aria-hidden="true">
            <component :is="item.icon" />
          </span>
          <span class="nav-text">{{ item.text }}</span>
          <span 
            v-if="item.children && item.children.length > 0" 
            class="nav-arrow"
            aria-hidden="true"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              :style="{ transform: expandedItems.includes(item.id) ? 'rotate(180deg)' : 'rotate(0)' }"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </component>
        
        <!-- Submenú -->
        <transition name="submenu">
          <ul 
            v-if="item.children && item.children.length > 0 && expandedItems.includes(item.id)"
            class="submenu"
            role="menu"
            :aria-label="`Submenú de ${item.text}`"
          >
            <li 
              v-for="(child, childIndex) in item.children" 
              :key="child.id || `${item.id}-child-${childIndex}`"
              class="submenu-item"
              role="menuitem"
            >
              <component 
                :is="child.external ? 'a' : 'router-link'"
                :to="!child.external ? child.href : undefined"
                :href="child.external ? child.href : undefined"
                :target="child.external ? '_blank' : undefined"
                :rel="child.external ? 'noopener noreferrer' : undefined"
                :aria-current="isItemActive(child) ? 'page' : undefined"
                class="submenu-link"
              >
                <span v-if="child.icon" class="submenu-icon" aria-hidden="true">
                  <component :is="child.icon" />
                </span>
                <span class="submenu-text">{{ child.text }}</span>
              </component>
            </li>
          </ul>
        </transition>
      </li>
    </ul>
    
    <!-- Botón de menú móvil -->
    <button 
      v-if="responsive"
      type="button"
      class="mobile-menu-button"
      :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
      :aria-label="mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'"
      @click="toggleMobileMenu"
    >
      <span class="sr-only">{{ mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú' }}</span>
      <svg 
        v-if="!mobileMenuOpen"
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <svg 
        v-else
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useKeyboardNavigation } from '../../utils/accessibility-utils';

export default {
  name: 'AccessibleNavigation',
  
  props: {
    items: {
      type: Array,
      required: true
    },
    horizontal: {
      type: Boolean,
      default: false
    },
    ariaLabel: {
      type: String,
      default: 'Navegación principal'
    },
    role: {
      type: String,
      default: 'menubar'
    },
    responsive: {
      type: Boolean,
      default: true
    },
    breakpoint: {
      type: Number,
      default: 768
    },
    skipLinks: {
      type: Array,
      default: () => []
    },
    className: {
      type: String,
      default: ''
    }
  },
  
  setup(props) {
    const route = useRoute();
    const expandedItems = ref([]);
    const mobileMenuOpen = ref(false);
    const isMobile = ref(false);
    
    // Configurar navegación por teclado
    const { containerRef } = useKeyboardNavigation({
      vertical: !props.horizontal,
      horizontal: props.horizontal,
      circular: true
    });
    
    // Verificar si un elemento está activo
    const isItemActive = (item) => {
      if (!item.href) return false;
      
      // Para enlaces externos, verificar si la URL actual termina con la href del elemento
      if (item.external) {
        return window.location.href.endsWith(item.href);
      }
      
      // Para enlaces internos, verificar la ruta actual
      return route.path === item.href || route.path.startsWith(`${item.href}/`);
    };
    
    // Alternar submenú
    const toggleSubmenu = (itemId) => {
      const index = expandedItems.value.indexOf(itemId);
      
      if (index === -1) {
        expandedItems.value.push(itemId);
      } else {
        expandedItems.value.splice(index, 1);
      }
    };
    
    // Alternar menú móvil
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
      
      // Si se cierra el menú, cerrar también los submenús
      if (!mobileMenuOpen.value) {
        expandedItems.value = [];
      }
    };
    
    // Verificar tamaño de pantalla
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth < props.breakpoint;
      
      // Si cambia a escritorio, cerrar menú móvil
      if (!isMobile.value && mobileMenuOpen.value) {
        mobileMenuOpen.value = false;
      }
    };
    
    // Manejar clic fuera del menú
    const handleClickOutside = (event) => {
      if (containerRef.value && !containerRef.value.contains(event.target)) {
        // Cerrar submenús
        expandedItems.value = [];
        
        // Cerrar menú móvil
        if (mobileMenuOpen.value) {
          mobileMenuOpen.value = false;
        }
      }
    };
    
    // Manejar tecla Escape
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Cerrar submenús
        expandedItems.value = [];
        
        // Cerrar menú móvil
        if (mobileMenuOpen.value) {
          mobileMenuOpen.value = false;
        }
      }
    };
    
    // Configurar eventos al montar el componente
    onMounted(() => {
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    });
    
    // Limpiar eventos al desmontar
    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkScreenSize);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    });
    
    // Observar cambios en la ruta
    watch(() => route.path, () => {
      // Cerrar menú móvil al cambiar de ruta
      if (mobileMenuOpen.value) {
        mobileMenuOpen.value = false;
      }
    });
    
    return {
      containerRef,
      expandedItems,
      mobileMenuOpen,
      isMobile,
      isItemActive,
      toggleSubmenu,
      toggleMobileMenu
    };
  }
};
</script>

<style scoped>
.accessible-nav {
  position: relative;
  width: 100%;
}

/* Enlaces de salto */
.skip-links {
  position: absolute;
  top: -9999px;
  left: 0;
  z-index: 9999;
}

.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary, #3b82f6);
  color: white;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  clip: rect(0, 0, 0, 0);
  border-radius: 0 0 0.25rem 0.25rem;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 9999px;
  clip: auto;
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: 2px;
}

/* Lista de navegación */
.nav-list {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-horizontal {
  flex-direction: row;
}

/* Elementos de navegación */
.nav-item {
  position: relative;
}

.nav-horizontal .nav-item {
  margin-right: 1rem;
}

.nav-horizontal .nav-item:last-child {
  margin-right: 0;
}

/* Enlaces */
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--color-text, #1f2937);
  text-decoration: none;
  transition: color 0.2s, background-color 0.2s;
}

.nav-link:hover,
.nav-link:focus {
  background-color: var(--color-background-hover, #f3f4f6);
}

.nav-link:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: -2px;
}

.nav-link-active {
  color: var(--color-primary, #3b82f6);
  font-weight: 500;
}

/* Iconos */
.nav-icon {
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
}

/* Flechas de submenú */
.nav-arrow {
  margin-left: auto;
  display: flex;
  align-items: center;
  transition: transform 0.2s;
}

/* Submenús */
.submenu {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  background-color: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 0.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.nav-horizontal .submenu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  z-index: 10;
}

/* Enlaces de submenú */
.submenu-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--color-text, #1f2937);
  text-decoration: none;
  transition: color 0.2s, background-color 0.2s;
}

.submenu-link:hover,
.submenu-link:focus {
  background-color: var(--color-background-hover, #f3f4f6);
}

.submenu-link:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: -2px;
}

/* Iconos de submenú */
.submenu-icon {
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
}

/* Botón de menú móvil */
.mobile-menu-button {
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text, #1f2937);
}

.mobile-menu-button:focus-visible {
  outline: 2px solid var(--color-primary, #3b82f6);
  outline-offset: 2px;
}

/* Clase para elementos solo visibles para lectores de pantalla */
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
.submenu-enter-active,
.submenu-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: flex;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 20;
  }
  
  .nav-list {
    display: none;
  }
  
  .nav-list.nav-mobile-open {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--color-background, #ffffff);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 10;
  }
  
  .nav-horizontal {
    flex-direction: column;
  }
  
  .nav-horizontal .nav-item {
    margin-right: 0;
  }
  
  .nav-horizontal .submenu {
    position: static;
    box-shadow: none;
    border: none;
    border-left: 2px solid var(--color-primary, #3b82f6);
    margin-left: 1rem;
  }
}
</style>
