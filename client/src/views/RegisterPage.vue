<template>
  <MainLayout>
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <RegisterForm 
            @register-success="handleRegisterSuccess" 
            @switch-to-login="goToLogin"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import RegisterForm from '../components/auth/RegisterForm.vue';
import { useToast } from '../composables/useToast';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// Métodos
const handleRegisterSuccess = (result) => {
  toast.success('Registro exitoso', '¡Bienvenido a Stellar Tourism!');
  router.push(route.query.redirect || '/');
};

const goToLogin = () => {
  router.push({ 
    path: '/login', 
    query: route.query.redirect ? { redirect: route.query.redirect } : {} 
  });
};
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 4rem - 6rem); /* Altura total - header - footer */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--color-background);
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 2rem;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>
