<template>
  <div class="features-section">
    <div class="features-grid">
      <div v-for="(feature, index) in features" :key="index" class="feature-card">
        <div class="feature-icon" :class="`feature-icon-${index + 1}`">
          <component :is="feature.icon" size="32" />
        </div>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-description">{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Rocket, Shield, Users, Star, Clock, Award } from 'lucide-vue-next';

const features = ref([
  {
    icon: Rocket,
    title: 'Tecnología de Vanguardia',
    description: 'Nuestras naves espaciales están equipadas con la tecnología más avanzada para garantizar viajes seguros y cómodos.'
  },
  {
    icon: Shield,
    title: 'Seguridad Garantizada',
    description: 'La seguridad es nuestra prioridad. Todos nuestros viajes cumplen con los más altos estándares de seguridad espacial.'
  },
  {
    icon: Users,
    title: 'Tripulación Experta',
    description: 'Nuestros astronautas y personal de servicio son profesionales altamente capacitados con años de experiencia.'
  },
  {
    icon: Star,
    title: 'Experiencias Únicas',
    description: 'Ofrecemos experiencias que no encontrarás en ningún otro lugar, desde caminatas espaciales hasta vistas increíbles.'
  },
  {
    icon: Clock,
    title: 'Flexibilidad',
    description: 'Adaptamos nuestros viajes a tus necesidades, con diferentes duraciones y opciones de personalización.'
  },
  {
    icon: Award,
    title: 'Reconocimiento Internacional',
    description: 'Somos líderes en turismo espacial, reconocidos por organizaciones espaciales de todo el mundo.'
  }
]);
</script>

<style scoped>
.features-section {
  width: 100%;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(15, 15, 26, 0.8));
  border-radius: 16px;
  padding: 2.5rem 2rem;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

.feature-card:hover::before {
  transform: translateX(100%);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.feature-icon::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: scale(1.2);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon::after {
  opacity: 1;
  transform: scale(1);
}

.feature-icon-1 {
  background: linear-gradient(135deg, #00b4d8, #0077b6);
}

.feature-icon-2 {
  background: linear-gradient(135deg, #7209b7, #560bad);
}

.feature-icon-3 {
  background: linear-gradient(135deg, #2a9d8f, #264653);
}

.feature-icon-4 {
  background: linear-gradient(135deg, #e9c46a, #f4a261);
}

.feature-icon-5 {
  background: linear-gradient(135deg, #e63946, #d62828);
}

.feature-icon-6 {
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
}

.feature-title {
  font-size: 1.5rem;
  background: linear-gradient(90deg, #ffffff, #a0a0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.feature-description {
  color: #a0a0a7;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
