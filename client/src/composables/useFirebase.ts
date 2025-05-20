import { ref, onMounted, onUnmounted } from "vue"
import { isClient } from "../utils/ssr-safe"
import { useAuthStore } from "../stores"

// Tipos para Firebase
interface FirebaseUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

interface FirebaseAuth {
  currentUser: FirebaseUser | null
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => () => void
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

interface FirebaseApp {
  name: string
}

// Estado compartido para evitar múltiples inicializaciones
const firebaseInitialized = ref(false)
const firebaseApp = ref<any>(null)
const firebaseAuth = ref<FirebaseAuth | null>(null)
const firebaseFirestore = ref<any>(null)
const currentUser = ref<FirebaseUser | null>(null)
const authLoading = ref(true)
const authError = ref<Error | null>(null)

// Composable para usar Firebase
export function useFirebase() {
  const authStore = useAuthStore()

  // Inicializar Firebase solo en el cliente
  async function initializeFirebase() {
    if (!isClient() || firebaseInitialized.value) return

    try {
      // Importar Firebase de manera dinámica
      const { initializeApp } = await import("firebase/app")
      const { getAuth, onAuthStateChanged } = await import("firebase/auth")
      const { getFirestore } = await import("firebase/firestore")

      // Configuración de Firebase
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      }

      // Inicializar Firebase
      firebaseApp.value = initializeApp(firebaseConfig)
      firebaseAuth.value = getAuth(firebaseApp.value)
      firebaseFirestore.value = getFirestore(firebaseApp.value)

      // Configurar listener de autenticación
      const unsubscribe = onAuthStateChanged(firebaseAuth.value, (user) => {
        currentUser.value = user
        authLoading.value = false

        // Actualizar el store de autenticación
        if (user) {
          // Convertir el usuario de Firebase a un objeto plano
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          }

          // Guardar en localStorage para persistencia
          localStorage.setItem("user", JSON.stringify(userData))

          // Actualizar el store
          authStore.setUser(userData)

          // Obtener token para API
          user.getIdToken().then((token) => {
            authStore.setToken(token)
          })
        } else {
          // Limpiar datos de usuario
          authStore.clearAuth()
        }
      })

      // Marcar como inicializado
      firebaseInitialized.value = true

      // Devolver función para limpiar
      return unsubscribe
    } catch (error) {
      console.error("Error inicializando Firebase:", error)
      authError.value = error instanceof Error ? error : new Error("Error inicializando Firebase")
      authLoading.value = false
      return () => {}
    }
  }

  // Inicializar Firebase al montar el componente
  let unsubscribe: (() => void) | undefined

  onMounted(async () => {
    if (isClient() && !firebaseInitialized.value) {
      unsubscribe = await initializeFirebase()
    }
  })

  // Limpiar al desmontar
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  // Funciones de autenticación
  async function signIn(email: string, password: string) {
    if (!firebaseAuth.value) {
      throw new Error("Firebase no inicializado")
    }

    try {
      authLoading.value = true
      authError.value = null
      const result = await firebaseAuth.value.signInWithEmailAndPassword(email, password)
      return result.user
    } catch (error) {
      console.error("Error en inicio de sesión:", error)
      authError.value = error instanceof Error ? error : new Error("Error en inicio de sesión")
      throw error
    } finally {
      authLoading.value = false
    }
  }

  async function signUp(email: string, password: string, displayName?: string) {
    if (!firebaseAuth.value) {
      throw new Error("Firebase no inicializado")
    }

    try {
      authLoading.value = true
      authError.value = null
      const result = await firebaseAuth.value.createUserWithEmailAndPassword(email, password)

      // Actualizar perfil si se proporciona displayName
      if (displayName && result.user) {
        await import("firebase/auth").then(({ updateProfile }) => {
          return updateProfile(result.user, { displayName })
        })
      }

      return result.user
    } catch (error) {
      console.error("Error en registro:", error)
      authError.value = error instanceof Error ? error : new Error("Error en registro")
      throw error
    } finally {
      authLoading.value = false
    }
  }

  async function signOut() {
    if (!firebaseAuth.value) {
      throw new Error("Firebase no inicializado")
    }

    try {
      await firebaseAuth.value.signOut()
    } catch (error) {
      console.error("Error en cierre de sesión:", error)
      throw error
    }
  }

  // Devolver funciones y estado
  return {
    // Estado
    currentUser,
    loading: authLoading,
    error: authError,
    isInitialized: firebaseInitialized,

    // Servicios
    auth: firebaseAuth,
    firestore: firebaseFirestore,
    app: firebaseApp,

    // Funciones
    initializeFirebase,
    signIn,
    signUp,
    signOut,
  }
}
