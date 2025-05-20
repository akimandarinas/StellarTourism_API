<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <img src="/logo.svg" alt="Stellar Tourism" class="h-12 mx-auto" />
        </router-link>
        <h1 class="mt-6 text-3xl font-extrabold text-gray-900">Crear cuenta</h1>
        <p class="mt-2 text-sm text-gray-600">
          ¿Ya tienes una cuenta?
          <router-link to="/login" class="font-medium text-primary hover:text-primary/90">
            Inicia sesión
          </router-link>
        </p>
      </div>
      
      <div class="bg-white py-8 px-6 shadow rounded-lg">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="nombre">Nombre</Label>
              <Input 
                id="nombre" 
                v-model="formData.nombre" 
                required 
                :disabled="loading"
              />
            </div>
            
            <div>
              <Label for="apellido">Apellido</Label>
              <Input 
                id="apellido" 
                v-model="formData.apellido" 
                required 
                :disabled="loading"
              />
            </div>
          </div>
          
          <div>
            <Label for="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              v-model="formData.email" 
              required 
              autocomplete="email" 
              :disabled="loading"
            />
          </div>
          
          <div>
            <Label for="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              v-model="formData.password" 
              required 
              autocomplete="new-password" 
              :disabled="loading"
            />
            <p class="mt-1 text-sm text-gray-500">
              Mínimo 8 caracteres, incluyendo una letra mayúscula y un número
            </p>
          </div>
          
          <div>
            <Label for="confirmPassword">Confirmar contraseña</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              v-model="formData.confirmPassword" 
              required 
              autocomplete="new-password" 
              :disabled="loading"
            />
          </div>
          
          <div class="flex items-center">
            <Checkbox id="terms" v-model="formData.terms" required />
            <Label for="terms" class="ml-2">
              Acepto los <a href="#" class="text-primary hover:text-primary/90">términos y condiciones</a>
            </Label>
          </div>
          
          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>
          
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
          </Button>
        </form>
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">O regístrate con</span>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" @click="handleGoogleRegister" :disabled="loading">
              <img src="/google-icon.svg" alt="Google" class="h-5 w-5 mr-2" />
              Google
            </Button>
            <Button variant="outline" type="button" @click="handleFacebookRegister" :disabled="loading">
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
import { useRouter } from 'vue-router';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import Button from '../components/ui/Button.vue';
import Input from '../components/ui/Input.vue';
import Label from '../components/ui/Label.vue';
import Checkbox from '../components/ui/Checkbox.vue';
import { useToast } from '../composables/useToast';
import { crearUsuario } from '../services/api';

const router = useRouter();

const formData = ref({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
});
const loading = ref(false);
const error = ref('');
const { toast } = useToast();

async function handleRegister() {
  error.value = '';
  
  // Validar que las contraseñas coincidan
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  // Validar que la contraseña cumpla con los requisitos
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(formData.value.password)) {
    error.value = 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número';
    return;
  }
  
  // Validar que se acepten los términos
  if (!formData.value.terms) {
    error.value = 'Debes aceptar los términos y condiciones';
    return;
  }
  
  loading.value = true;
  
  try {
    const auth = getAuth();
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.value.email, 
      formData.value.password
    );
    
    // Actualizar perfil con nombre
    await updateProfile(userCredential.user, {
      displayName: `${formData.value.nombre} ${formData.value.apellido}`
    });
    
    // Crear usuario en nuestra base de datos
    await crearUsuario({
      uid: userCredential.user.uid,
      nombre: formData.value.nombre,
      apellido: formData.value.apellido,
      email: formData.value.email
    });
    
    toast({
      title: 'Registro exitoso',
      description: '¡Bienvenido a Stellar Tourism!',
      variant: 'success'
    });
    
    // Redirigir al usuario
    router.push('/');
  } catch (err) {
    console.error('Error de registro:', err);
    
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'Este email ya está registrado';
    } else if (err.code === 'auth/weak-password') {
      error.value = 'La contraseña es demasiado débil';
    } else {
      error.value = 'Error al crear la cuenta. Intenta nuevamente';
    }
  } finally {
    loading.value = false;
  }
}

async function handleGoogleRegister() {
  error.value = '';
  loading.value = true;
  
  try {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Extraer información del usuario
    const user = result.user;
    const displayName = user.displayName || '';
    const nameParts = displayName.split(' ');
    const nombre = nameParts[0] || '';
    const apellido = nameParts.slice(1).join(' ') || '';
    
    // Crear usuario en nuestra base de datos
    await crearUsuario({
      uid: user.uid,
      nombre,
      apellido,
      email: user.email
    });
    
    toast({
      title: 'Registro exitoso',
      description: '¡Bienvenido a Stellar Tourism!',
      variant: 'success'
    });
    
    router.push('/');
  } catch (err) {
    console.error('Error de registro con Google:', err);
    error.value = 'Error al registrarse con Google';
  } finally {
    loading.value = false;
  }
}

async function handleFacebookRegister() {
  error.value = '';
  loading.value = true;
  
  try {
    const auth = getAuth();
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Extraer información del usuario
    const user = result.user;
    const displayName = user.displayName || '';
    const nameParts = displayName.split(' ');
    const nombre = nameParts[0] || '';
    const apellido = nameParts.slice(1).join(' ') || '';
    
    // Crear usuario en nuestra base de datos
    await crearUsuario({
      uid: user.uid,
      nombre,
      apellido,
      email: user.email
    });
    
    toast({
      title: 'Registro exitoso',
      description: '¡Bienvenido a Stellar Tourism!',
      variant: 'success'
    });
    
    router.push('/');
  } catch (err) {
    console.error('Error de registro con Facebook:', err);
    error.value = 'Error al registrarse con Facebook';
  } finally {
    loading.value = false;
  }
}
</script>
