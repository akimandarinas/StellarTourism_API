import { initializeApp } from "firebase/app"
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth"
import { firebaseConfig } from "../../../config/firebase"
import sessionManager from "../../../services/auth/session-manager"

// Inicializar Firebase Admin
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export async function post({ request }) {
  try {
    const { idToken, uid, email, displayName, photoURL } = await request.json()

    // Verificar el token de ID con Firebase
    const credential = GoogleAuthProvider.credential(idToken)
    const userCredential = await signInWithCredential(auth, credential)

    // Verificar que el usuario existe
    if (!userCredential.user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error al verificar credenciales de Google",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Generar tokens de sesión
    const expiresAt = Date.now() + 3600 * 1000 // 1 hora
    const sessionId = `google-${uid}-${Date.now()}`

    // En un entorno real, aquí generarías tokens JWT firmados
    const accessToken = `simulated-access-token-${Date.now()}`
    const refreshToken = `simulated-refresh-token-${Date.now()}`

    // Guardar información de sesión
    await sessionManager.startSession(uid)

    // Devolver respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          accessToken,
          refreshToken,
          expiresAt,
          sessionId,
          user: {
            uid,
            email,
            displayName,
            photoURL,
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error al procesar inicio de sesión con Google:", error)

    return new Response(
      JSON.stringify({
        success: false,
        message: "Error al procesar inicio de sesión con Google",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
