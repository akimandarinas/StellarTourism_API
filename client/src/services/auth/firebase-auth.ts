import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth"
import { firebaseConfig } from "../../config/firebase"

// Inicializar Firebase
let app
let auth
let initialized = false

/**
 * Inicializa Firebase
 */
export function initializeFirebase() {
  if (!initialized) {
    try {
      app = initializeApp(firebaseConfig)
      auth = getAuth(app)
      initialized = true
      console.log("[Firebase] Firebase inicializado correctamente")
    } catch (error) {
      console.error("[Firebase] Error al inicializar Firebase:", error)
      throw error
    }
  }
  return app
}

/**
 * Verifica si Firebase Auth está listo
 */
async function isAuthReady() {
  if (!initialized) {
    initializeFirebase()
  }
  return Promise.resolve(true)
}

/**
 * Inicia sesión con correo y contraseña
 */
async function login(email, password) {
  await isAuthReady()
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential
  } catch (error) {
    console.error("[Firebase] Error al iniciar sesión:", error)
    throw error
  }
}

/**
 * Inicia sesión con Google
 */
async function loginWithGoogle() {
  await isAuthReady()
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: "select_account",
    })
    const result = await signInWithPopup(auth, provider)

    // Esto da acceso al token de Google
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const token = credential.accessToken

    console.log("[Firebase] Inicio de sesión con Google exitoso")
    return result
  } catch (error) {
    console.error("[Firebase] Error al iniciar sesión con Google:", error)
    throw error
  }
}

/**
 * Registra un nuevo usuario
 */
async function register(email, password, displayName) {
  await isAuthReady()
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Actualizar el perfil con el nombre
    if (displayName) {
      await firebaseUpdateProfile(userCredential.user, {
        displayName: displayName,
      })
    }

    return userCredential
  } catch (error) {
    console.error("[Firebase] Error al registrar usuario:", error)
    throw error
  }
}

/**
 * Cierra la sesión actual
 */
async function logout() {
  await isAuthReady()
  try {
    await signOut(auth)
    console.log("[Firebase] Sesión cerrada correctamente")
  } catch (error) {
    console.error("[Firebase] Error al cerrar sesión:", error)
    throw error
  }
}

/**
 * Envía un correo para restablecer contraseña
 */
async function resetPassword(email) {
  await isAuthReady()
  try {
    await sendPasswordResetEmail(auth, email)
    console.log("[Firebase] Correo de recuperación enviado a:", email)
  } catch (error) {
    console.error("[Firebase] Error al enviar correo de recuperación:", error)
    throw error
  }
}

/**
 * Actualiza el perfil del usuario
 */
async function updateProfile(profileData) {
  await isAuthReady()
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("No hay usuario autenticado")
    }

    await firebaseUpdateProfile(user, profileData)
    console.log("[Firebase] Perfil actualizado correctamente")
  } catch (error) {
    console.error("[Firebase] Error al actualizar perfil:", error)
    throw error
  }
}

/**
 * Configura un observador para cambios en el estado de autenticación
 */
function onAuthStateChanged(callback) {
  isAuthReady()
  return firebaseOnAuthStateChanged(auth, callback)
}

// Exportar servicio
export default {
  isAuthReady,
  login,
  loginWithGoogle,
  register,
  logout,
  resetPassword,
  updateProfile,
  onAuthStateChanged,
  getCurrentUser: () => auth?.currentUser,
}
