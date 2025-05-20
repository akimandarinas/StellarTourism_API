<template>
  <div class="main-layout">
    <header class="main-header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a href="/">
              <span class="logo-text">StellarTourism</span>
            </a>
          </div>
          
          <nav class="main-nav">
            <a href="/" class="nav-link">Inicio</a>
            <a href="/destinos" class="nav-link">Destinos</a>
            <a href="/naves" class="nav-link">Naves</a>
            <a href="/reservas" class="nav-link">Reservas</a>
          </nav>
          
          <div class="header-actions">
            <button class="theme-toggle" @click="toggleTheme" aria-label="Cambiar tema">
              <SunIcon v-if="isDarkTheme" class="icon" />
              <MoonIcon v-else class="icon" />
            </button>
            
            <a href="/login" class="login-button" v-if="!isLoggedIn">
              Iniciar Sesión
            </a>
            
            <div class="user-menu" v-else>
              <button class="user-button" @click="toggleUserMenu">
                <UserIcon class="icon" />
                <span class="user-name">{{ userName }}</span>
              </button>
              
              <div class="dropdown-menu" v-if="isUserMenuOpen">
                <a href="/perfil" class="dropdown-item">Mi Perfil</a>
                <a href="/reservas" class="dropdown-item">Mis Reservas</a>
                <button class="dropdown-item logout" @click="logout">Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <slot></slot>
    </main>
    
    <footer class="main-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <span class="logo-text">StellarTourism</span>
            <p class="tagline">Explorando el universo, un viaje a la vez</p>
          </div>
          
          <div class="footer-links">
            <div class="footer-section">
              <h3>Destinos</h3>
              <ul>
                <li><a href="/destinos?tipo=planeta">Planetas</a></li>
                <li><a href="/destinos?tipo=luna">Lunas</a></li>
                <li><a href="/destinos?tipo=estacion">Estaciones</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Empresa</h3>
              <ul>
                <li><a href="/sobre-nosotros">Sobre Nosotros</a></li>
                <li><a href="/contacto">Contacto</a></li>
                <li><a href="/preguntas-frecuentes">FAQ</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Legal</h3>
              <ul>
                <li><a href="/terminos">Términos y Condiciones</a></li>
                <li><a href="/privacidad">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} StellarTourism. Todos los derechos reservados.</p>
          
          <div class="social-links">
            <a href="#" aria-label="Facebook"><FacebookIcon class="icon" /></a>
            <a href="#" aria-label="Twitter"><TwitterIcon class="icon" /></a>
            <a href="#" aria-label="Instagram"><InstagramIcon class="icon" /></a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { SunIcon, MoonIcon, UserIcon, FacebookIcon, TwitterIcon, InstagramIcon } from 'lucide-vue-next';

// Estado
const isDarkTheme = ref(true); // Cambiado a true por defecto para coincidir con el tema oscuro
const isUserMenuOpen = ref(false);
const isLoggedIn = ref(false);
const userName = ref('Usuario');

// Año actual para el copyright
const currentYear = computed(() => new Date().getFullYear());

// Métodos
function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value;
  document.documentElement.classList.toggle('dark-theme', isDarkTheme.value);
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value;
}

function logout() {
  isUserMenuOpen.value = false;
  // Lógica de cierre de sesión
  console.log('Cerrando sesión...');
}

// Inicializar tema oscuro por defecto
onMounted(() => {
  document.documentElement.classList.add('dark-theme');
});
</script>

<style>
:root {
  --color-primary: #7209b7;
  --color-primary-dark: #5c0799;
  --color-primary-light: #8a2be2;
  --color-secondary: #4cc9f0;
  --color-accent: #f72585;
  
  --color-background: #0f0f1a;
  --color-background-secondary: #1a1a2e;
  --color-surface: #1a1a2e;
  
  --color-text: #f5f5f7;
  --color-text-secondary: #a0a0a7;
  
  --color-border: #2a2a4a;
  
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  --content-max-width: 1200px;
  --header-height: 70px;
  --footer-height: 300px;
  
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}

.container {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 1rem;
}

.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
}

.main-header {
  background-color: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--header-height);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, var(--color-primary-light), var(--color-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(114, 9, 183, 0.3);
}

.main-nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--color-primary-light);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.theme-toggle:hover {
  color: var(--color-primary-light);
}

.login-button {
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(114, 9, 183, 0.4);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 9, 183, 0.6);
}

.user-menu {
  position: relative;
}

.user-button {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  min-width: 200px;
  margin-top: 0.5rem;
  z-index: 10;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-primary-light);
}

.dropdown-item.logout {
  color: var(--color-accent);
  border-top: 1px solid var(--color-border);
  text-align: left;
  width: 100%;
  background: none;
  cursor: pointer;
}

.main-content {
  flex: 1;
}

.main-footer {
  background-color: var(--color-background-secondary);
  border-top: 1px solid var(--color-border);
  padding: 3rem 0 1.5rem;
  margin-top: 3rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.tagline {
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--color-primary-light);
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: var(--color-primary-light);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: var(--color-primary-light);
}

.icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 1rem 0;
  }
  
  .main-header {
    height: auto;
    position: static;
  }
  
  .main-nav {
    margin: 1rem 0;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
