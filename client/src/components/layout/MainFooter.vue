<template>
  <footer class="main-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="/logo.svg" alt="Stellar Tourism" class="logo-image" />
          <h2 class="logo-text">Stellar Tourism</h2>
          <p class="logo-tagline">Explorando el universo, un viaje a la vez</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-section">
            <h3 class="section-title">Navegación</h3>
            <ul class="section-links">
              <li><router-link to="/">Inicio</router-link></li>
              <li><router-link to="/destinos">Destinos</router-link></li>
              <li><router-link to="/naves">Naves</router-link></li>
              <li><router-link to="/sobre-nosotros">Sobre Nosotros</router-link></li>
              <li><router-link to="/contacto">Contacto</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h3 class="section-title">Destinos Populares</h3>
            <ul class="section-links">
              <li><router-link to="/destinos/luna">Luna</router-link></li>
              <li><router-link to="/destinos/marte">Marte</router-link></li>
              <li><router-link to="/destinos/estacion-espacial">Estación Espacial</router-link></li>
              <li><router-link to="/destinos/europa">Europa</router-link></li>
              <li><router-link to="/destinos/titan">Titán</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h3 class="section-title">Soporte</h3>
            <ul class="section-links">
              <li><router-link to="/faq">Preguntas Frecuentes</router-link></li>
              <li><router-link to="/terminos">Términos y Condiciones</router-link></li>
              <li><router-link to="/privacidad">Política de Privacidad</router-link></li>
              <li><router-link to="/reembolsos">Política de Reembolsos</router-link></li>
              <li><router-link to="/ayuda">Centro de Ayuda</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section contact-section">
            <h3 class="section-title">Contacto</h3>
            <ul class="section-links contact-links">
              <li>
                <MapPinIcon class="contact-icon" aria-hidden="true" />
                <span>Calle Espacial 123, Madrid, España</span>
              </li>
              <li>
                <PhoneIcon class="contact-icon" aria-hidden="true" />
                <a href="tel:+34912345678" class="contact-link">+34 912 345 678</a>
              </li>
              <li>
                <MailIcon class="contact-icon" aria-hidden="true" />
                <a href="mailto:info@stellartourism.com" class="contact-link">info@stellartourism.com</a>
              </li>
            </ul>
            
            <div class="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon aria-hidden="true" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <TwitterIcon aria-hidden="true" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon aria-hidden="true" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YoutubeIcon aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} Stellar Tourism. Todos los derechos reservados.
        </p>
        <p class="credits">
          Diseñado con <HeartIcon class="heart-icon" aria-hidden="true" /> por el equipo de Stellar Tourism
        </p>
      </div>
      
      <!-- Botón para volver arriba -->
      <button 
        v-if="showScrollTop"
        @click="scrollToTop"
        class="scroll-top-btn"
        aria-label="Volver arriba"
      >
        <ArrowUpIcon aria-hidden="true" />
      </button>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  MapPin as MapPinIcon, 
  Phone as PhoneIcon, 
  Mail as MailIcon, 
  Facebook as FacebookIcon, 
  Twitter as TwitterIcon, 
  Instagram as InstagramIcon, 
  Youtube as YoutubeIcon, 
  Heart as HeartIcon,
  ArrowUp as ArrowUpIcon
} from '@/utils/lucide-adapter';

const currentYear = computed(() => new Date().getFullYear());

// Control del botón para volver arriba
const showScrollTop = ref(false);

const checkScroll = () => {
  showScrollTop.value = window.scrollY > 500;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<style scoped>
.main-footer {
  background-color: var(--color-background-secondary);
  color: var(--color-text);
  padding: 4rem 0 2rem;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.footer-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-image {
  height: 3rem;
  margin-bottom: 1rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.logo-tagline {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--color-text);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 2rem;
  height: 2px;
  background-color: var(--color-primary);
}

.section-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-links li {
  margin-bottom: 0.75rem;
}

.section-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-block;
  position: relative;
}

.section-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.section-links a:hover {
  color: var(--color-primary);
}

.section-links a:hover::after {
  width: 100%;
}

.contact-links li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.contact-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.75rem;
  margin-top: 0.25rem;
  color: var(--color-primary);
}

.contact-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: var(--color-primary);
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.social-links a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  transition: all 0.2s ease;
}

.social-links a:hover {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-3px);
}

.footer-bottom {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.copyright,
.credits {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0.5rem 0;
}

.heart-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-error);
  display: inline-block;
  vertical-align: middle;
  margin: 0 0.25rem;
}

.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
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
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  z-index: 50;
}

.scroll-top-btn:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-3px);
}

/* Media queries para diseño responsive */
@media (min-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr 3fr;
    align-items: start;
  }
  
  .footer-logo {
    text-align: left;
    margin-bottom: 0;
  }
  
  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}

@media (max-width: 767px) {
  .main-footer {
    padding: 3rem 0 2rem;
  }
  
  .footer-links {
    grid-template-columns: 1fr 1fr;
  }
  
  .contact-section {
    grid-column: span 2;
  }
  
  .scroll-top-btn {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}

@media (max-width: 480px) {
  .main-footer {
    padding: 2rem 0 1.5rem;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .contact-section {
    grid-column: span 1;
  }
  
  .section-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .section-links li {
    margin-bottom: 0.5rem;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .scroll-top-btn {
    bottom: 1rem;
    right: 1rem;
    width: 2.25rem;
    height: 2.25rem;
  }
}

/* Ajustes para pantallas táctiles */
@media (hover: none) {
  .section-links a,
  .social-links a,
  .scroll-top-btn {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
  }
  
  .section-links a::after {
    display: none;
  }
}
</style>
