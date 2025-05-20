<template>
  <header class="main-header" :class="{ 'nav-scrolled': isScrolled }">
    <div class="container">
      <div class="header-content">
        <div class="header-logo">
          <router-link to="/" class="logo-link">
            <img src="/logo.svg" alt="Stellar Tourism" class="logo-image" />
            <span class="logo-text">Stellar Tourism</span>
          </router-link>
        </div>
        
        <nav class="header-nav" :class="{ 'nav-open': isMenuOpen }">
          <ul class="nav-list">
            <li class="nav-item">
              <router-link to="/" class="nav-link" exact-active-class="active">Inicio</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/destinos" class="nav-link" active-class="active">Destinos</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/naves" class="nav-link" active-class="active">Naves</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/sobre-nosotros" class="nav-link" active-class="active">Sobre Nosotros</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/contacto" class="nav-link" active-class="active">Contacto</router-link>
            </li>
          </ul>
        </nav>
        
        <div class="header-actions">
          <ThemeToggle />
          <template v-if="isAuthenticated">
            <div class="user-menu" ref="userMenuRef">
              <button 
                class="user-button" 
                @click="toggleUserMenu"
                aria-haspopup="true"
                :aria-expanded="isUserMenuOpen"
                aria-label="Menú de usuario"
              >
                <div v-if="userPhotoURL" class="user-avatar">
                  <img :src="userPhotoURL" alt="Avatar" />
                </div>
                <div v-else class="user-avatar user-avatar-placeholder">
                  {{ userInitials }}
                </div>
                <span class="user-name">{{ userDisplayName }}</span>
                <ChevronDownIcon class="user-icon" :class="{ 'rotate-180': isUserMenuOpen }" aria-hidden="true" />
              </button>
              
              <div 
                v-if="isUserMenuOpen" 
                class="user-dropdown"
                role="menu"
                aria-orientation="vertical"
              >
                <router-link to="/perfil" class="dropdown-item" role="menuitem">
                  <UserIcon class="dropdown-icon" aria-hidden="true" />
                  <span>Mi Perfil</span>
                </router-link>
                <router-link to="/reservas" class="dropdown-item" role="menuitem">
                  <CalendarIcon class="dropdown-icon" aria-hidden="true" />
                  <span>Mis Reservas</span>
                </router-link>
                <router-link to="/favoritos" class="dropdown-item" role="menuitem">
                  <HeartIcon class="dropdown-icon" aria-hidden="true" />
                  <span>Favoritos</span>
                </router-link>
                <div class="dropdown-divider" role="separator"></div>
                <button @click="handleLogout" class="dropdown-item dropdown-item-danger" role="menuitem">
                  <LogOutIcon class="dropdown-icon" aria-hidden="true" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link to="/login" class="btn-login">Iniciar Sesión</router-link>
            <router-link to="/register" class="btn-register">Registrarse</router-link>
          </template>
          
          <button 
            class="menu-toggle" 
            @click="toggleMenu" 
            aria-label="Menú principal"
            :aria-expanded="isMenuOpen"
          >
            <MenuIcon v-if="!isMenuOpen" aria-hidden="true" />
            <XIcon v-else aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Menu as MenuIcon, X as XIcon, User as UserIcon, Calendar as CalendarIcon, Heart as HeartIcon, LogOut as LogOutIcon, ChevronDown as ChevronDownIcon } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useMobile } from '@/composables/useMobile';
import ThemeToggle from '@/ui/components/ThemeToggle.vue';

const router = useRouter();
const { user, isAuthenticated, logout } = useAuth();
const { isMobile } = useMobile();

// Estado
const isMenuOpen = ref(false);
const isUserMenuOpen = ref(false);
const userMenuRef = ref(null);
const isScrolled = ref(false);

// Computed properties para evitar acceso condicional a propiedades
const userDisplayName = computed(() => user.value?.displayName || 'Usuario');
const userPhotoURL = computed(() => user.value?.photoURL || null);

// Computed
const userInitials = computed(() => {
  if (!userDisplayName.value || userDisplayName.value === 'Usuario') return '?';
  
  return userDisplayName.value
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// Métodos
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleLogout = async () => {
  try {
    await logout();
    isUserMenuOpen.value = false;
    router.push('/');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false;
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Cerrar menú al cambiar de tamaño de ventana
watch(isMobile, (newValue, oldValue) => {
  if (!newValue && oldValue && isMenuOpen.value) {
    isMenuOpen.value = false;
    document.body.style.overflow = '';
  }
});

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll);
  
  // Cerrar menú al cambiar de ruta
  router.afterEach(() => {
    isMenuOpen.value = false;
    document.body.style.overflow = '';
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.main-header {
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.nav-scrolled {
  box-shadow: var(--shadow-md);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.header-logo {
  display: flex;
  align-items: center;
  z-index: 101; /* Asegura que el logo esté por encima del menú móvil */
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
}

.logo-image {
  height: 2rem;
  margin-right: 0.5rem;
}

.logo-text {
  font-weight: 600;
  font-size: 1.25rem;
}

.header-nav {
  display: flex;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 0.75rem;
}

.nav-link {
  display: block;
  padding: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  z-index: 101; /* Asegura que las acciones estén por encima del menú móvil */
}

.btn-login,
.btn-register {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-login {
  color: var(--color-primary);
  margin-right: 0.5rem;
}

.btn-login:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.btn-register {
  background-color: var(--color-primary);
  color: white;
}

.btn-register:hover {
  background-color: var(--color-primary-dark);
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.user-button:hover {
  background-color: var(--color-background-secondary);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.5rem;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  margin-right: 0.25rem;
  font-weight: 500;
}

.user-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: 0.5rem;
  margin-top: 0.5rem;
  z-index: 10;
  animation: dropdown-in 0.2s ease-out;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  color: var(--color-text);
  text-decoration: none;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 1rem;
}

.dropdown-item:hover {
  background-color: var(--color-background-secondary);
}

.dropdown-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.75rem;
  color: var(--color-text-secondary);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 0.5rem 0;
}

.dropdown-item-danger {
  color: var(--color-error);
}

.dropdown-item-danger .dropdown-icon {
  color: var(--color-error);
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--color-text);
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Media queries para diseño responsive */
@media (max-width: 768px) {
  .header-nav {
    position: fixed;
    top: 4rem;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-surface);
    padding: 1rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 90;
    overflow-y: auto;
  }
  
  .nav-open {
    transform: translateX(0);
  }
  
  .nav-list {
    flex-direction: column;
  }
  
  .nav-item {
    margin: 0;
  }
  
  .nav-link {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }
  
  .nav-link.active::after {
    display: none;
  }
  
  .nav-link.active {
    background-color: rgba(var(--color-primary-rgb), 0.1);
  }
  
  .menu-toggle {
    display: block;
    margin-left: 1rem;
  }
  
  .btn-login,
  .btn-register {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .user-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    margin-top: 0;
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    animation: dropdown-up 0.3s ease-out;
  }
  
  @keyframes dropdown-up {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 360px) {
  .logo-text {
    display: none;
  }
  
  .header-content {
    height: 3.5rem;
  }
}

/* Ajustes para pantallas grandes */
@media (min-width: 1200px) {
  .container {
    padding: 0 2rem;
  }
  
  .nav-item {
    margin: 0 1rem;
  }
}
</style>
