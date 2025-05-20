<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="/logo.svg" alt="Stellar Tourism Logo" class="footer-logo-img" />
          <span class="footer-logo-text">Stellar Tourism</span>
        </div>
        
        <div class="footer-links">
          <div class="footer-links-column">
            <h3>Explorar</h3>
            <ul>
              <li><a href="/destinos">Destinos</a></li>
              <li><a href="/naves">Naves</a></li>
              <li><a href="/actividades">Actividades</a></li>
            </ul>
          </div>
          
          <div class="footer-links-column">
            <h3>Legal</h3>
            <ul>
              <li><a href="/terminos">Términos y Condiciones</a></li>
              <li><a href="/contacto">Contacto</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2025 Stellar Tourism. Todos los derechos reservados.</p>
        <div class="social-links">
          <a href="#" aria-label="Facebook"><span class="sr-only">Facebook</span>📱</a>
          <a href="#" aria-label="Twitter"><span class="sr-only">Twitter</span>🐦</a>
          <a href="#" aria-label="Instagram"><span class="sr-only">Instagram</span>📷</a>
          <a href="#" aria-label="YouTube"><span class="sr-only">YouTube</span>▶️</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No se necesita lógica adicional para este componente
</script>

<style scoped>
.site-footer {
  background-color: #0a0a14;
  color: #f5f5f7;
  padding: 4rem 0 2rem;
  margin-top: 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.footer-logo-img {
  height: 2.5rem;
  width: auto;
  margin-right: 0.75rem;
}

.footer-logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #7209b7, #4cc9f0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

.footer-links-column h3 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
  color: #9d4edd;
}

.footer-links-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links-column li {
  margin-bottom: 0.75rem;
}

.footer-links-column a {
  color: #a0a0a7;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links-column a:hover {
  color: #4cc9f0;
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.footer-bottom p {
  margin-bottom: 1rem;
  color: #a0a0a7;
  font-size: 0.875rem;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-links a {
  color: #a0a0a7;
  font-size: 1.25rem;
  transition: color 0.2s ease;
}

.social-links a:hover {
  color: #4cc9f0;
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

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 4rem;
  }
  
  .footer-bottom {
    flex-direction: row;
    text-align: left;
  }
  
  .footer-bottom p {
    margin-bottom: 0;
  }
}
</style>
