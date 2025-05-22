//Importar funciones necesarias de Firebase
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

//Configuración
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNTvXjWLuqRRHKNtRDgXTMaRF7_528WXU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "stellar-tourism-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "stellar-tourism-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "stellar-tourism-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEFGHIJ",
}

//Nota. Los valores proporcionados aquí son solo para desarrollo y demostración

//Verificar que la configuración sea válida
const isConfigValid = () => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "appId"]
  return requiredFields.every((field) => !!firebaseConfig[field])
}

let firebaseApp
let firebaseAuth
let firebaseFirestore

try {
  if (isConfigValid()) {
    // Evitar inicialización múltiple
    if (!firebaseApp) {
      firebaseApp = initializeApp(firebaseConfig)
      console.log("Firebase inicializado correctamente")
    }

    firebaseAuth = getAuth(firebaseApp)
    firebaseFirestore = getFirestore(firebaseApp)
  } else {
    console.error("Configuración de Firebase incompleta. Verifica tus variables de entorno.")
  }
} catch (error) {
  console.error("Error al inicializar Firebase:", error)
}

export { firebaseApp, firebaseAuth, firebaseFirestore }

export default firebaseConfig
