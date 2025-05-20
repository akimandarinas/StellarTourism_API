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
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
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
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
