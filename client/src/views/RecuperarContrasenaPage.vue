<template>
  <MainLayout>
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Recuperar Contraseña</h1>
          
          <ForgotPasswordForm 
            @reset-sent="handleResetSent" 
            @cancel="goToLogin"
            :standalone="true"
          />
          
          <div class="auth-links">
            <p>
              ¿Recordaste tu contraseña? 
              <router-link to="/login" class="text-link">Iniciar sesión</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { useRouter } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm.vue';
import { useToast } from '../composables/useToast';
import { ref } from 'vue';

const router = useRouter();
const toast = useToast();

// Use a ref to track if the reset email has been sent
const resetSent = ref(false);

const handleResetSent = (email) => {
  resetSent.value = true; // Set the flag to true

  toast.success(
    'Correo enviado',
    `Hemos enviado un enlace para restablecer tu contraseña a ${email}`
  );
  
  // Redirigir al login después de un breve retraso
  setTimeout(() => {
    router.push('/login');
  }, 3000);
};

const goToLogin = () => {
  router.push('/login');
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

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--color-text);
}

.auth-links {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.text-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>
