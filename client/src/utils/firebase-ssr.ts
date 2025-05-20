import { isClient, createClientProxy } from "./ssr-safe"
import { ref, shallowRef } from "vue"

// Estado global para Firebase
const firebaseApp = shallowRef(null)
const firebaseAuth = shallowRef(null)
const firebaseFirestore = shallowRef(null)
const isInitialized = ref(false)
const isLoading = ref(false)
const error = ref(null)

// Función para inicializar Firebase de manera segura en SSR
export async function initializeFirebase() {
  // Si ya está inicializado o está cargando, no hacer nada
  if (isInitialized.value || isLoading.value) {
    return {
      app: firebaseApp.value,
      auth: firebaseAuth.value,
      firestore: firebaseFirestore.value,
      isInitialized: isInitialized.value,
      isLoading: isLoading.value,
      error: error.value
    }
  }

  // Si estamos en el servidor, devolver objetos simulados
  if (!isClient()) {
    return {
      app: null,
      auth: createMockAuth(),
      firestore: createMockFirestore(),
      isInitialized: false,
      isLoading: false,
      error: null
    }
  }

  // Marcar como cargando
  isLoading.value = true
  error.value = null

  try {
    // Cargar Firebase de manera dinámica
    const firebaseAppModule = await import("firebase/app")
    const { getAuth } = await import("firebase/auth")
    const { getFirestore } = await import("firebase/firestore")

    // Obtener funciones de Firebase
    const { initializeApp, getApps, getApp } = firebaseAppModule.default || firebaseAppModule

    // Configuración de Firebase
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }

    // Inicializar Firebase (o usar la instancia existente)
    let app
    if (getApps && getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }

    // Inicializar servicios
    const auth = getAuth(app)
    const firestore = getFirestore(app)

    // Guardar referencias
    firebaseApp.value = app
    firebaseAuth.value = auth
    firebaseFirestore.value = firestore
    isInitialized.value = true

    return {
      app,
      auth,
      firestore,
      isInitialized: true,
      isLoading: false,
      error: null
    }
  } catch (err) {
    // Manejar errores
    console.error("Error initializing Firebase:", err)
    error.value = err

    return {
      app: null,
      auth: createMockAuth(),
      firestore: createMockFirestore(),
      isInitialized: false,
      isLoading: false,
      error: err
    }
  } finally {
    // Marcar como no cargando
    isLoading.value = false
  }
}

// Función para crear un objeto simulado de Auth para SSR
function createMockAuth() {
  return createClientProxy(() => ({
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null)
      return () => {}
    },
    signInWithEmailAndPassword: async () => ({ user: null }),
    createUserWithEmailAndPassword: async () => ({ user: null }),
    signOut: async () => {}
  }))
}

// Función para crear un objeto simulado de Firestore para SSR
function createMockFirestore() {
  return createClientProxy(() => ({
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: false,
          data: () => null
        }),
        set: async () => {},
        update: async () => {},
        delete: async () => {}
      }),
      where: () => ({
        get: async () => ({
          empty: true,
          docs: []
        })
      }),
      add: async () => ({
        id: "mock-id"
      })
    }),
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => null
      }),
      set: async () => {},
      update: async () => {},
      delete: async () => {}
    })
  }))
}

// Composable para usar Firebase
export function useFirebase() {
  // Inicializar Firebase si no está inicializado
  if (isClient() && !isInitialized.value && !isLoading.value) {
    initializeFirebase()
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    firestore: firebaseFirestore,
    isInitialized,
    isLoading,
    error,
    initializeFirebase
  }
}
