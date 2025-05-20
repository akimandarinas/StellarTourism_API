<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <img src="/logo.svg" alt="Stellar Tourism" class="h-12 mx-auto" />
        </router-link>
        <h1 class="mt-6 text-3xl font-extrabold text-gray-900">Iniciar sesión</h1>
        <p class="mt-2 text-sm text-gray-600">
          ¿No tienes una cuenta?
          <router-link to="/register" class="font-medium text-primary hover:text-primary/90">
            Regístrate
          </router-link>
        </p>
      </div>
      
      <div class="bg-white py-8 px-6 shadow rounded-lg">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <Label for="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              v-model="email" 
              required 
              autocomplete="email" 
              :disabled="loading"
            />
          </div>
          
          <div>
            <div class="flex justify-between">
              <Label for="password">Contraseña</Label>
              <a href="#" class="text-sm font-medium text-primary hover:text-primary/90">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Input 
              id="password" 
              type="password" 
              v-model="password" 
              required 
              autocomplete="current-password" 
              :disabled="loading"
            />
          </div>
          
          <div class="flex items-center">
            <Checkbox id="remember" v-model="remember" />
            <Label for="remember" class="ml-2">Recordarme</Label>
          </div>
          
          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>
          
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </Button>
        </form>
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" @click="handleGoogleLogin" :disabled="loading">
              <img src="/google-icon.svg" alt="Google" class="h-5 w-5 mr-2" />
              Google
            </Button>
            <Button variant="outline" type="button" @click="handleFacebookLogin" :disabled="loading">
              <img src="/facebook-icon.svg" alt="Facebook" class="h-5 w-5 mr-2" />
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import Button from '../components/ui/Button.vue';
import Input from '../components/ui/Input.vue';
import Label from '../components/ui/Label.vue';
import Checkbox from '../components/ui/Checkbox.vue';
import { useToast } from '../composables/useToast';

const { toast } = useToast();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const remember = ref(false);
const loading = ref(false);
const error = ref('');

// Obtener la URL de redirección si existe
const redirect = ref(route.query.redirect || '/');

async function handleLogin() {
  error.value = '';
  loading.value = true;
  
  try {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email.value, password.value);
    
    // Configurar persistencia si se seleccionó "recordarme"
    // Nota: Firebase maneja esto automáticamente, pero podríamos
    // usar setPersistence si necesitamos más control
    
    toast({
      title: 'Inicio de sesión exitoso',
      description: '¡Bienvenido de nuevo!',
      variant: 'success'
    });
    
    // Redirigir al usuario
    router.push(redirect.value);
  } catch (err) {
    console.error('Error de inicio de sesión:', err);
    
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      error.value = 'Email o contraseña incorrectos';
    } else if (err.code === 'auth/too-many-requests') {
      error.value = 'Demasiados intentos fallidos. Intenta más tarde';
    } else {
      error.value = 'Error al iniciar sesión. Intenta nuevamente';
    }
  } finally {
    loading.value = false;
  }
}

async function handleGoogleLogin() {
  error.value = '';
  loading.value = true;
  
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    
    toast({
      title: 'Inicio de sesión exitoso',
      description: '¡Bienvenido!',
      variant: 'success'
    });
    
    router.push(redirect.value);
  } catch (err) {
    console.error('Error de inicio de sesión con Google:', err);
    error.value = 'Error al iniciar sesión con Google';
  } finally {
    loading.value = false;
  }
}

async function handleFacebookLogin() {
  error.value = '';
  loading.value = true;
  
  try {
    const auth = getAuth();
    const provider = new FacebookAuthProvider();
    await signInWithPopup(auth, provider);
    
    toast({
      title: 'Inicio de sesión exitoso',
      description: '¡Bienvenido!',
      variant: 'success'
    });
    
    router.push(redirect.value);
  } catch (err) {
    console.error('Error de inicio de sesión con Facebook:', err);
    error.value = 'Error al iniciar sesión con Facebook';
  } finally {
    loading.value = false;
  }
}
</script>
