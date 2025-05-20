import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from "firebase/firestore"
import { db } from "../firebase"

/**
 * Servicio para interactuar con Firestore
 */
export const firestoreService = {
  /**
   * Obtiene un documento por ID
   * @param {string} collectionName - Nombre de la colección
   * @param {string} id - ID del documento
   * @returns {Promise<Object|null>} - Documento o null si no existe
   */
  async getDocument(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        return null
      }
    } catch (error) {
      console.error(`Error al obtener documento de ${collectionName}:`, error)
      throw error
    }
  },

  /**
   * Obtiene todos los documentos de una colección
   * @param {string} collectionName - Nombre de la colección
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} - Array de documentos
   */
  async getDocuments(collectionName, options = {}) {
    try {
      let q = collection(db, collectionName)

      // Aplicar filtros
      if (options.filters) {
        options.filters.forEach((filter) => {
          q = query(q, where(filter.field, filter.operator, filter.value))
        })
      }

      // Aplicar ordenamiento
      if (options.orderBy) {
        options.orderBy.forEach((order) => {
          q = query(q, orderBy(order.field, order.direction || "asc"))
        })
      }

      // Aplicar límite
      if (options.limit) {
        q = query(q, limit(options.limit))
      }

      // Aplicar paginación
      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter))
      }

      if (options.endBefore) {
        q = query(q, endBefore(options.endBefore))
      }

      if (options.limitToLast) {
        q = query(q, limitToLast(options.limitToLast))
      }

      const querySnapshot = await getDocs(q)
      const documents = []

      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() })
      })

      return documents
    } catch (error) {
      console.error(`Error al obtener documentos de ${collectionName}:`, error)
      throw error
    }
  },

  /**
   * Crea un nuevo documento
   * @param {string} collectionName - Nombre de la colección
   * @param {Object} data - Datos del documento
   * @param {string} [id] - ID opcional del documento
   * @returns {Promise<Object>} - Documento creado
   */
  async createDocument(collectionName, data, id = null) {
    try {
      const timestamp = serverTimestamp()
      const documentData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      let docRef

      if (id) {
        docRef = doc(db, collectionName, id)
        await setDoc(docRef, documentData)
      } else {
        docRef = await addDoc(collection(db, collectionName), documentData)
      }

      return { id: docRef.id, ...documentData }
    } catch (error) {
      console.error(`Error al crear documento en ${collectionName}:`, error)
      throw error
    }
  },

  /**
   * Actualiza un documento existente
   * @param {string} collectionName - Nombre de la colección
   * @param {string} id - ID del documento
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Documento actualizado
   */
  async updateDocument(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id)
      const timestamp = serverTimestamp()

      const updateData = {
        ...data,
        updatedAt: timestamp,
      }

      await updateDoc(docRef, updateData)

      // Obtener el documento actualizado
      const updatedDoc = await getDoc(docRef)

      return { id: updatedDoc.id, ...updatedDoc.data() }
    } catch (error) {
      console.error(`Error al actualizar documento en ${collectionName}:`, error)
      throw error
    }
  },

  /**
   * Elimina un documento
   * @param {string} collectionName - Nombre de la colección
   * @param {string} id - ID del documento
   * @returns {Promise<void>}
   */
  async deleteDocument(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(`Error al eliminar documento de ${collectionName}:`, error)
      throw error
    }
  },

  /**
   * Escucha cambios en un documento
   * @param {string} collectionName - Nombre de la colección
   * @param {string} id - ID del documento
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  listenToDocument(collectionName, id, callback) {
    const docRef = doc(db, collectionName, id)

    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() })
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error(`Error al escuchar documento de ${collectionName}:`, error)
      },
    )
  },

  /**
   * Escucha cambios en una colección
   * @param {string} collectionName - Nombre de la colección
   * @param {Object} options - Opciones de consulta
   * @param {Function} callback - Función a ejecutar cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  listenToCollection(collectionName, options = {}, callback) {
    let q = collection(db, collectionName)

    // Aplicar filtros
    if (options.filters) {
      options.filters.forEach((filter) => {
        q = query(q, where(filter.field, filter.operator, filter.value))
      })
    }

    // Aplicar ordenamiento
    if (options.orderBy) {
      options.orderBy.forEach((order) => {
        q = query(q, orderBy(order.field, order.direction || "asc"))
      })
    }

    // Aplicar límite
    if (options.limit) {
      q = query(q, limit(options.limit))
    }

    return onSnapshot(
      q,
      (querySnapshot) => {
        const documents = []

        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() })
        })

        callback(documents)
      },
      (error) => {
        console.error(`Error al escuchar colección ${collectionName}:`, error)
      },
    )
  },

  /**
   * Convierte un timestamp de Firestore a Date
   * @param {Timestamp} timestamp - Timestamp de Firestore
   * @returns {Date} - Objeto Date
   */
  timestampToDate(timestamp) {
    if (!timestamp) return null

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate()
    }

    return timestamp
  },

  /**
   * Convierte una fecha a Timestamp de Firestore
   * @param {Date|string} date - Fecha a convertir
   * @returns {Timestamp} - Timestamp de Firestore
   */
  dateToTimestamp(date) {
    if (!date) return null

    if (typeof date === "string") {
      date = new Date(date)
    }

    return Timestamp.fromDate(date)
  },
}

export default firestoreService
