<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Explora el Universo con Stellar Tourism</h1>
        <p class="hero-subtitle">Descubre destinos increíbles más allá de nuestro planeta</p>
        <div class="hero-cta">
          <a href="/destinos" class="cta-button primary">Explorar Destinos</a>
          <a href="/naves" class="cta-button secondary">Ver Naves</a>
        </div>
      </div>
    </section>
    
    <section class="features-section">
      <div class="section-header">
        <h2>Nuestros Servicios</h2>
        <p>Ofrecemos experiencias únicas para los viajeros espaciales</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <Globe class="icon" />
          </div>
          <h3>Destinos Únicos</h3>
          <p>Visita los lugares más impresionantes del sistema solar y más allá, desde la Luna hasta las lunas de Júpiter.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <Rocket class="icon" />
          </div>
          <h3>Naves de Última Generación</h3>
          <p>Viaja con comodidad y seguridad en nuestras modernas naves espaciales equipadas con la mejor tecnología.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <Star class="icon" />
          </div>
          <h3>Experiencias Inolvidables</h3>
          <p>Crea recuerdos que durarán toda la vida con nuestras actividades espaciales y tours guiados.</p>
        </div>
      </div>
    </section>
    
    <section class="destinations-preview">
      <div class="section-header">
        <h2>Destinos Populares</h2>
        <p>Los destinos más solicitados por nuestros viajeros</p>
      </div>
      
      <div class="destinations-grid">
        <div class="destination-card">
          <div class="destination-image" style="background-image: url('/images/luna-base.png')">
            <div class="destination-overlay">
              <span class="destination-category">Satélite</span>
            </div>
          </div>
          <div class="destination-content">
            <h3>Luna</h3>
            <p>Nuestro satélite natural, perfecto para una primera experiencia espacial.</p>
            <div class="destination-meta">
              <span class="destination-distance">
                <Rocket class="icon-small" /> 384,400 km
              </span>
              <span class="destination-duration">
                <Clock class="icon-small" /> 3 días
              </span>
            </div>
            <a href="/destinos/1" class="view-more">Ver más</a>
          </div>
        </div>
        
        <div class="destination-card">
          <div class="destination-image" style="background-image: url('/images/marte.png')">
            <div class="destination-overlay">
              <span class="destination-category">Planeta</span>
            </div>
          </div>
          <div class="destination-content">
            <h3>Marte</h3>
            <p>El planeta rojo, hogar de los paisajes más impresionantes del sistema solar.</p>
            <div class="destination-meta">
              <span class="destination-distance">
                <Rocket class="icon-small" /> 54.6 millones km
              </span>
              <span class="destination-duration">
                <Clock class="icon-small" /> 7 días
              </span>
            </div>
            <a href="/destinos/2" class="view-more">Ver más</a>
          </div>
        </div>
        
        <div class="destination-card">
          <div class="destination-image" style="background-image: url('/images/estacion-orbital.png')">
            <div class="destination-overlay">
              <span class="destination-category">Estación</span>
            </div>
          </div>
          <div class="destination-content">
            <h3>Estación Espacial</h3>
            <p>Experimenta la vida en órbita en nuestra estación espacial de última generación.</p>
            <div class="destination-meta">
              <span class="destination-distance">
                <Rocket class="icon-small" /> 400 km
              </span>
              <span class="destination-duration">
                <Clock class="icon-small" /> 5 días
              </span>
            </div>
            <a href="/destinos/3" class="view-more">Ver más</a>
          </div>
        </div>
      </div>
      
      <div class="view-all-container">
        <a href="/destinos" class="view-all-button">Ver todos los destinos</a>
      </div>
    </section>
    
    <section class="testimonials-section">
      <div class="section-header">
        <h2>Lo que dicen nuestros viajeros</h2>
        <p>Experiencias de quienes ya han viajado con nosotros</p>
      </div>
      
      <div class="testimonials-slider">
        <div class="testimonial-card">
          <div class="testimonial-content">
            <div class="testimonial-rating">
              <div v-for="i in 5" :key="i" class="star-icon-container">
                <Star v-if="i <= 5" class="star-icon filled" />
                <Star v-else class="star-icon" />
              </div>
            </div>
            <p class="testimonial-text">Una experiencia increíble. Ver la Tierra desde la Luna es algo que nunca olvidaré. El servicio fue excelente y los guías muy profesionales.</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar" style="background-image: url('/images/avatar-woman-1.jpg')"></div>
            <div class="author-info">
              <h4>Ana García</h4>
              <p>Viaje a la Luna</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <div class="testimonial-content">
            <div class="testimonial-rating">
              <div v-for="i in 5" :key="i" class="star-icon-container">
                <Star v-if="i <= 4" class="star-icon filled" />
                <Star v-else class="star-icon" />
              </div>
            </div>
            <p class="testimonial-text">Pasar unos días en la estación espacial fue fascinante. La ingravidez es una sensación única que todos deberían experimentar al menos una vez.</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar" style="background-image: url('/images/avatar-man-1.jpg')"></div>
            <div class="author-info">
              <h4>Carlos Rodríguez</h4>
              <p>Estación Espacial</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <div class="testimonial-content">
            <div class="testimonial-rating">
              <div v-for="i in 5" :key="i" class="star-icon-container">
                <Star v-if="i <= 5" class="star-icon filled" />
                <Star v-else class="star-icon" />
              </div>
            </div>
            <p class="testimonial-text">Los paisajes marcianos son impresionantes. La nave era muy cómoda y el equipo de Stellar Tourism hizo que todo fuera perfecto.</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar" style="background-image: url('/images/avatar-woman-2.jpg')"></div>
            <div class="author-info">
              <h4>Laura Martínez</h4>
              <p>Viaje a Marte</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="cta-section">
      <div class="cta-content">
        <h2>¿Listo para tu aventura espacial?</h2>
        <p>Reserva ahora y prepárate para una experiencia fuera de este mundo</p>
        <a href="/destinos" class="cta-button primary">Comenzar Aventura</a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Globe, Rocket, Star, Clock } from 'lucide-vue-next';
</script>

<style scoped>
.home-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
}

/* Hero Section */
.hero-section {
  height: 80vh;
  min-height: 600px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('/images/hero-space.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(114, 9, 183, 0.3), rgba(76, 201, 240, 0.3));
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.2;
  background: linear-gradient(90deg, #9d4edd, #4cc9f0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: linear-gradient(90deg, #7209b7, #9d4edd);
  color: white;
  box-shadow: 0 4px 10px rgba(114, 9, 183, 0.3);
}

.cta-button.primary:hover {
  background: linear-gradient(90deg, #9d4edd, #4cc9f0);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(114, 9, 183, 0.4);
}

.cta-button.secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Section Styles */
section {
  padding: 5rem 0;
}

.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #f5f5f7;
  position: relative;
  display: inline-block;
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #7209b7, #4cc9f0);
  border-radius: 3px;
}

.section-header p {
  font-size: 1.2rem;
  color: #a0a0a7;
}

/* Features Section */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(157, 78, 221, 0.3);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #7209b7, #4cc9f0);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.icon {
  width: 30px;
  height: 30px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #f5f5f7;
}

.feature-card p {
  color: #a0a0a7;
}

/* Destinations Preview */
.destinations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.destination-card {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(157, 78, 221, 0.3);
}

.destination-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: transform 0.5s ease;
}

.destination-card:hover .destination-image {
  transform: scale(1.05);
}

.destination-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.destination-category {
  background: linear-gradient(90deg, #7209b7, #9d4edd);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.destination-content {
  padding: 1.5rem;
}

.destination-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #f5f5f7;
}

.destination-content p {
  color: #a0a0a7;
  margin-bottom: 1rem;
}

.destination-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: #a0a0a7;
  font-size: 0.875rem;
}

.destination-distance, .destination-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.view-more {
  display: inline-block;
  color: #9d4edd;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.view-more::after {
  content: '→';
  margin-left: 0.25rem;
  transition: transform 0.3s ease;
}

.view-more:hover {
  color: #4cc9f0;
}

.view-more:hover::after {
  transform: translateX(3px);
}

.view-all-container {
  text-align: center;
  margin-top: 3rem;
}

.view-all-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #7209b7, #9d4edd);
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(114, 9, 183, 0.3);
}

.view-all-button:hover {
  background: linear-gradient(90deg, #9d4edd, #4cc9f0);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(114, 9, 183, 0.4);
}

/* Testimonials Section */
.testimonials-section {
  background-color: rgba(15, 15, 26, 0.5);
  border-radius: 12px;
  padding: 5rem 2rem;
  margin: 0 -1rem;
}

.testimonials-slider {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background-color: rgba(26, 26, 46, 0.5);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(157, 78, 221, 0.3);
}

.testimonial-rating {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.star-icon-container {
  display: inline-block;
}

.star-icon {
  width: 20px;
  height: 20px;
  color: #d1d5db;
}

.star-icon.filled {
  color: #f59e0b;
}

.testimonial-text {
  font-style: italic;
  margin-bottom: 1.5rem;
  color: #f5f5f7;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.author-info h4 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #f5f5f7;
}

.author-info p {
  font-size: 0.875rem;
  color: #a0a0a7;
}

/* CTA Section */
.cta-section {
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/earth-view.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  padding: 5rem 2rem;
  border-radius: 12px;
  margin: 4rem -1rem 0;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(114, 9, 183, 0.3), rgba(76, 201, 240, 0.3));
  z-index: 1;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 700px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-cta {
    flex-direction: column;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .testimonials-slider {
    grid-template-columns: 1fr;
  }
}
</style>
