import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../firebase"

const USERS_COLLECTION = "usuarios"

/**
 * Crea un perfil de usuario en Firestore
 * @param {string} uid - ID del usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<void>}
 */
export async function createUserProfile(uid, userData) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid)
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error al crear perfil de usuario:", error)
    throw error
  }
}

/**
 * Obtiene el perfil de un usuario de Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<Object|null>} - Datos del usuario o null si no existe
 */
export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error)
    throw error
  }
}

/**
 * Actualiza el perfil de un usuario en Firestore
 * @param {string} uid - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, userData) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid)
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error)
    throw error
  }
}

/**
 * Elimina el perfil de un usuario de Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<void>}
 */
export async function deleteUserProfile(uid) {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid)
    await deleteDoc(userRef)
  } catch (error) {
    console.error("Error al eliminar perfil de usuario:", error)
    throw error
  }
}
