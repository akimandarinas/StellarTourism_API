<template>
  <header class="main-header" role="banner">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo y navegación principal -->
        <div class="flex items-center">
          <a href="/" class="logo-container" aria-label="Stellar Tourism - Página de inicio">
            <img src="/logo.svg" alt="Stellar Tourism Logo" class="logo" aria-hidden="true" />
            <span class="logo-text">Stellar Tourism</span>
          </a>
          
          <nav class="main-nav" aria-label="Navegación principal">
            <ul class="nav-list">
              <li class="nav-item">
                <a 
                  href="/reservas" 
                  class="nav-link" 
                  :aria-current="currentPath === '/reservas' ? 'page' : undefined"
                >
                  Reserva
                  <div class="nav-indicator" aria-hidden="true"></div>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  href="/destinos" 
                  class="nav-link" 
                  :aria-current="currentPath.startsWith('/destinos') ? 'page' : undefined"
                >
                  Destinos
                  <div class="nav-indicator" aria-hidden="true"></div>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  href="/naves" 
                  class="nav-link" 
                  :aria-current="currentPath.startsWith('/naves') ? 'page' : undefined"
                >
                  Naves
                  <div class="nav-indicator" aria-hidden="true"></div>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  href="/contacto" 
                  class="nav-link" 
                  :aria-current="currentPath.startsWith('/contacto') ? 'page' : undefined"
                >
                  Contacto
                  <div class="nav-indicator" aria-hidden="true"></div>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        <!-- Acciones de usuario -->
        <div class="user-actions">
          <!-- Avatar de usuario (cuando está autenticado) -->
          <div v-if="authStore.isAuthenticated" class="user-avatar-container">
            <a 
              href="/perfil" 
              class="user-avatar-link"
              aria-label="Perfil de usuario"
            >
              <img 
                v-if="authStore.userProfile?.photoURL" 
                :src="authStore.userProfile.photoURL" 
                alt="User Profile Photo" 
                class="user-avatar" 
                aria-hidden="true"
              />
              <div v-else class="user-avatar user-avatar-fallback">
                {{ authStore.displayName ? authStore.displayName.charAt(0).toUpperCase() : 'U' }}
              </div>
            </a>
          </div>
          
          <!-- Botones de inicio de sesión y registro (cuando no está autenticado) -->
          <div v-else class="auth-buttons">
            <a 
              href="/login"
              class="btn btn-ghost"
            >
              <span>Iniciar Sesión</span>
            </a>
            <a 
              href="/register"
              class="btn btn-primary"
            >
              <span>Registrarse</span>
            </a>
          </div>
          
          <!-- Botón de menú móvil -->
          <button 
            class="mobile-menu-button"
            @click="toggleMobileMenu" 
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            aria-label="Menú móvil"
          >
            <span v-if="!mobileMenuOpen" class="icon">☰</span>
            <span v-else class="icon">✕</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Menú móvil -->
    <div 
      v-if="mobileMenuOpen" 
      class="mobile-menu" 
      id="mobile-menu"
      role="navigation"
      aria-label="Menú móvil"
    >
      <nav class="mobile-nav">
        <ul class="mobile-nav-list">
          <li class="mobile-nav-item">
            <a 
              href="/reservas" 
              class="mobile-nav-link" 
              :class="{ 'mobile-nav-link-active': currentPath === '/reservas' }"
              @click="closeMobileMenu"
              :aria-current="currentPath === '/reservas' ? 'page' : undefined"
              tabindex="0"
            >
              Reserva
            </a>
          </li>
          <li class="mobile-nav-item">
            <a 
              href="/destinos" 
              class="mobile-nav-link" 
              :class="{ 'mobile-nav-link-active': currentPath.startsWith('/destinos') }"
              @click="closeMobileMenu"
              :aria-current="currentPath.startsWith('/destinos') ? 'page' : undefined"
              tabindex="0"
            >
              Destinos
            </a>
          </li>
          <li class="mobile-nav-item">
            <a 
              href="/naves" 
              class="mobile-nav-link" 
              :class="{ 'mobile-nav-link-active': currentPath.startsWith('/naves') }"
              @click="closeMobileMenu"
              :aria-current="currentPath.startsWith('/naves') ? 'page' : undefined"
              tabindex="0"
            >
              Naves
            </a>
          </li>
          <li class="mobile-nav-item">
            <a 
              href="/contacto" 
              class="mobile-nav-link" 
              :class="{ 'mobile-nav-link-active': currentPath.startsWith('/contacto') }"
              @click="closeMobileMenu"
              :aria-current="currentPath.startsWith('/contacto') ? 'page' : undefined"
              tabindex="0"
            >
              Contacto
            </a>
          </li>
          <!-- Mostrar enlace al perfil si está autenticado, o enlaces de login/registro si no -->
          <template v-if="authStore.isAuthenticated">
            <li class="mobile-nav-item">
              <a 
                href="/perfil" 
                class="mobile-nav-link" 
                :class="{ 'mobile-nav-link-active': currentPath.startsWith('/perfil') }"
                @click="closeMobileMenu"
                :aria-current="currentPath.startsWith('/perfil') ? 'page' : undefined"
                tabindex="0"
              >
                Mi Perfil
              </a>
            </li>
          </template>
          <template v-else>
            <li class="mobile-nav-item">
              <a 
                href="/login" 
                class="mobile-nav-link" 
                :class="{ 'mobile-nav-link-active': currentPath.startsWith('/login') }"
                @click="closeMobileMenu"
                :aria-current="currentPath.startsWith('/login') ? 'page' : undefined"
                tabindex="0"
              >
                Iniciar Sesión
              </a>
            </li>
            <li class="mobile-nav-item">
              <a 
                href="/register" 
                class="mobile-nav-link" 
                :class="{ 'mobile-nav-link-active': currentPath.startsWith('/register') }"
                @click="closeMobileMenu"
                :aria-current="currentPath.startsWith('/register') ? 'page' : undefined"
                tabindex="0"
              >
                Registrarse
              </a>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from "../../stores/auth";

// Función para verificar si estamos en un navegador
const isBrowser = typeof window !== 'undefined';

// Estado
const mobileMenuOpen = ref(false);
const currentPath = ref('');

// Auth store
const authStore = useAuthStore();

// Métodos
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  
  if (mobileMenuOpen.value && isBrowser) {
    document.body.classList.add('overflow-hidden');
  } else if (isBrowser) {
    document.body.classList.remove('overflow-hidden');
  }
};

const closeMobileMenu = () => {
  if (mobileMenuOpen.value) {
    mobileMenuOpen.value = false;
    
    if (isBrowser) {
      document.body.classList.remove('overflow-hidden');
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  if (isBrowser) {
    // Actualizar la ruta actual
    currentPath.value = window.location.pathname;
    
    // Manejar tecla Escape a nivel de documento
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuOpen.value) {
        closeMobileMenu();
      }
    });
    
    // Manejar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && mobileMenuOpen.value) {
        closeMobileMenu();
      }
    });
  }
});

onUnmounted(() => {
  if (isBrowser) {
    // Limpiar event listeners
    document.removeEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenuOpen.value) {
        closeMobileMenu();
      }
    });
    
    window.removeEventListener('resize', () => {
      if (window.innerWidth >= 768 && mobileMenuOpen.value) {
        closeMobileMenu();
      }
    });
    
    // Asegurarse de que el body no quede con overflow hidden
    document.body.classList.remove('overflow-hidden');
  }
});
</script>

<style>
:root {
  --color-background: #0f0f1a;
  --color-background-hover: rgba(255, 255, 255, 0.05);
  --color-text-primary: #f5f5f7;
  --color-text-secondary: #a0a0a7;
  --color-primary: #7209b7;
  --color-primary-light: #9d4edd;
  --color-secondary: #4cc9f0;
  --color-accent: #f72585;
  --color-destructive: #ff4d4f;
  --color-border: rgba(255, 255, 255, 0.1);
  --border-radius: 8px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4);
}

.main-header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 40;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.h-16 {
  height: 4rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
  text-decoration: none;
  margin-right: 2rem;
}

.logo {
  height: 2rem;
  width: auto;
  margin-right: 0.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  background: linear-gradient(90deg, var(--color-primary-light), var(--color-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-nav {
  display: none;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-right: 1.5rem;
}

.nav-link {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.nav-link:hover,
.nav-link:focus,
.nav-link[aria-current="page"] {
  color: var(--color-primary-light);
  outline: none;
}

.nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: 2px;
}

.nav-indicator {
  height: 2px;
  width: 0;
  background-color: var(--color-primary);
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  transition: width 0.2s ease;
}

.nav-link:hover .nav-indicator,
.nav-link[aria-current="page"] .nav-indicator {
  width: 100%;
}

.user-actions {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: none;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-ghost:hover {
  background-color: var(--color-background-hover);
  border-color: var(--color-primary-light);
}

.btn-primary {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: linear-gradient(90deg, var(--color-primary-light), var(--color-secondary));
}

.mobile-menu-button {
  display: block;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.mobile-menu-button:hover {
  background-color: var(--color-background-hover);
}

.mobile-menu {
  display: block;
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 0;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  margin: 0;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link:focus,
.mobile-nav-link-active {
  background-color: var(--color-background-hover);
  color: var(--color-primary-light);
  outline: none;
}

.mobile-nav-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

@media (min-width: 768px) {
  .main-nav {
    display: block;
  }
  
  .auth-buttons {
    display: flex;
    gap: 0.5rem;
  }
  
  .mobile-menu-button {
    display: none;
  }
  
  .mobile-menu {
    display: none;
  }
}

/* Estilos para el avatar de usuario */
.user-avatar-container {
  display: flex;
  align-items: center;
}

.user-avatar-link {
  display: block;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.user-avatar-link:hover {
  transform: scale(1.05);
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary-light);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
}

.user-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.user-avatar-link:hover .user-avatar {
  box-shadow: var(--shadow-md);
  border-color: var(--color-secondary);
}
</style>
