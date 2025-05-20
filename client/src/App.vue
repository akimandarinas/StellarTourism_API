<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <div class="logo">
          <a href="/">Stellar Tourism</a>
        </div>
        <nav class="nav">
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/destinos">Destinos</a></li>
            <li><a href="/naves">Naves</a></li>
            <li><a href="/reservas">Reservas</a></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="main">
      <router-view />
    </main>
    
    <footer class="footer">
      <div class="container">
        <p>&copy; 2025 Stellar Tourism. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUIStore } from './stores/ui';

// Obtener el store UI
const uiStore = useUIStore();

// Inicializar el tema al montar la aplicación
onMounted(() => {
  uiStore.initTheme();
});
</script>

<style>
:root {
  --color-primary: #3490dc;
  --color-primary-dark: #2779bd;
  --color-text: #2d3748;
  --color-text-secondary: #4a5568;
  --color-background: #f7fafc;
  --color-surface: #ffffff;
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 1rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-background);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header {
  background-color: #1a1a2e;
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.nav ul {
  display: flex;
  list-style: none;
}

.nav li {
  margin-left: 1.5rem;
}

.nav a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.nav a:hover {
  color: #3490dc;
}

.main {
  min-height: calc(100vh - 120px);
  padding: 2rem 0;
}

.footer {
  background-color: #1a1a2e;
  color: white;
  padding: 1.5rem 0;
  text-align: center;
}

.error {
  color: #e53e3e;
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
  }
  
  .logo {
    margin-bottom: 1rem;
  }
  
  .nav ul {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav li {
    margin: 0.5rem;
  }
}
</style>
