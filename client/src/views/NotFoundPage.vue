<template>
  <MainLayout>
    <div class="not-found flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
      <router-link to="/" class="btn">Volver al inicio</router-link>
      <div>
        <button @click="goBack" class="back-button">
          Volver atrás
        </button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { useRouter } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<style scoped>
.not-found {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.not-found h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1a1a2e;
}

.not-found p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #333;
}

.btn {
  display: inline-block;
  background-color: #1a1a2e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #16213e;
}

.back-button {
  background: none;
  border: none;
  color: #4c6ef5;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}
</style>
