@echo off
echo ===================================================
echo Verificando y corrigiendo problemas de exportación
echo ===================================================

echo.
echo Verificando archivos de servicios...

REM Verificar si el directorio existe
if not exist "src\services\notificaciones" (
    echo Creando directorio src\services\notificaciones
    mkdir "src\services\notificaciones"
)

REM Verificar si el archivo existe
if not exist "src\services\notificaciones\index.js" (
    echo Creando archivo src\services\notificaciones\index.js
    echo // Archivo creado por fix-exports.bat > "src\services\notificaciones\index.js"
)

echo.
echo Corrigiendo exportaciones en archivos de servicios...

REM Crear un archivo temporal con el contenido correcto
echo import { apiClient } from "../api/client"; > temp.js
echo. >> temp.js
echo // Callbacks para manejar notificaciones >> temp.js
echo const notificationCallbacks = new Set(); >> temp.js
echo. >> temp.js
echo /** >> temp.js
echo  * Servicio para gestionar las notificaciones >> temp.js
echo  */ >> temp.js
echo export const notificacionesService = { >> temp.js
echo   /** >> temp.js
echo    * Solicita permiso para recibir notificaciones push >> temp.js
echo    * @returns {Promise^<boolean^>} true si se concedió permiso, false en caso contrario >> temp.js
echo    */ >> temp.js
echo   async requestPermission() { >> temp.js
echo     try { >> temp.js
echo       console.log("Solicitando permiso para notificaciones (mock)..."); >> temp.js
echo       return true; >> temp.js
echo     } catch (error) { >> temp.js
echo       console.error("Error al solicitar permiso para notificaciones:", error); >> temp.js
echo       return false; >> temp.js
echo     } >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Registra un token de notificación en la API >> temp.js
echo    * @param {string} token - Token de notificación >> temp.js
echo    * @returns {Promise^<Object^>} Resultado del registro >> temp.js
echo    */ >> temp.js
echo   async registerToken(token) { >> temp.js
echo     try { >> temp.js
echo       console.log("Registrando token de notificación (mock):", token); >> temp.js
echo       return { success: true }; >> temp.js
echo     } catch (error) { >> temp.js
echo       console.error("Error al registrar token de notificación:", error); >> temp.js
echo       throw error; >> temp.js
echo     } >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Obtiene las notificaciones del usuario >> temp.js
echo    * @param {Object} options - Opciones de la petición >> temp.js
echo    * @returns {Promise^<Array^>} Lista de notificaciones >> temp.js
echo    */ >> temp.js
echo   async getNotifications(options = {}) { >> temp.js
echo     const { limit = 20, offset = 0, includeRead = false } = options; >> temp.js
echo. >> temp.js
echo     try { >> temp.js
echo       // Datos mock para desarrollo >> temp.js
echo       const mockNotifications = [ >> temp.js
echo         { >> temp.js
echo           id: "1", >> temp.js
echo           title: "Oferta especial", >> temp.js
echo           message: "¡50%% de descuento en tu próximo viaje a Marte!", >> temp.js
echo           data: {}, >> temp.js
echo           timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás >> temp.js
echo           read: false, >> temp.js
echo         }, >> temp.js
echo         { >> temp.js
echo           id: "2", >> temp.js
echo           title: "Recordatorio de viaje", >> temp.js
echo           message: "Tu viaje a la Luna comienza en 3 días", >> temp.js
echo           data: {}, >> temp.js
echo           timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás >> temp.js
echo           read: includeRead, >> temp.js
echo         }, >> temp.js
echo         { >> temp.js
echo           id: "3", >> temp.js
echo           title: "Actualización de itinerario", >> temp.js
echo           message: "Se ha actualizado el itinerario de tu viaje a Júpiter", >> temp.js
echo           data: {}, >> temp.js
echo           timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás >> temp.js
echo           read: true, >> temp.js
echo         }, >> temp.js
echo       ]; >> temp.js
echo. >> temp.js
echo       // Filtrar notificaciones leídas si es necesario >> temp.js
echo       const filteredNotifications = includeRead >> temp.js
echo         ? mockNotifications >> temp.js
echo         : mockNotifications.filter(n =^> !n.read); >> temp.js
echo. >> temp.js
echo       // Aplicar paginación >> temp.js
echo       const paginatedNotifications = filteredNotifications.slice(offset, offset + limit); >> temp.js
echo. >> temp.js
echo       console.log("Obteniendo notificaciones (mock):", paginatedNotifications); >> temp.js
echo       return paginatedNotifications; >> temp.js
echo     } catch (error) { >> temp.js
echo       console.error("Error al obtener notificaciones:", error); >> temp.js
echo       throw error; >> temp.js
echo     } >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Marca una notificación como leída >> temp.js
echo    * @param {string} notificationId - ID de la notificación >> temp.js
echo    * @returns {Promise^<Object^>} Resultado de la operación >> temp.js
echo    */ >> temp.js
echo   async markAsRead(notificationId) { >> temp.js
echo     try { >> temp.js
echo       console.log(`Marcando notificación ${notificationId} como leída (mock)`); >> temp.js
echo       return { success: true }; >> temp.js
echo     } catch (error) { >> temp.js
echo       console.error(`Error al marcar notificación ${notificationId} como leída:`, error); >> temp.js
echo       throw error; >> temp.js
echo     } >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Marca todas las notificaciones como leídas >> temp.js
echo    * @returns {Promise^<Object^>} Resultado de la operación >> temp.js
echo    */ >> temp.js
echo   async markAllAsRead() { >> temp.js
echo     try { >> temp.js
echo       console.log("Marcando todas las notificaciones como leídas (mock)"); >> temp.js
echo       return { success: true }; >> temp.js
echo     } catch (error) { >> temp.js
echo       console.error("Error al marcar todas las notificaciones como leídas:", error); >> temp.js
echo       throw error; >> temp.js
echo     } >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Elimina una notificación >> temp.js
echo    * @param {string} notificationId - ID de la notificación >> temp.js
echo    * @returns {Promise^<Object^>} Resultado de la operación >> temp.js
echo    */ >> temp.js
echo   async deleteNotification(notificationId) { >> temp.js
echo     try { >> temp.js
echo       console.log(`Eliminando notificación ${notificationId} (mock)`); >> temp.js
echo       return { success: true }; >> temp.js
echo     } catch (error) { >> temp.js
echo       console.error(`Error al eliminar notificación ${notificationId}:`, error); >> temp.js
echo       throw error; >> temp.js
echo     } >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Elimina todas las notificaciones >> temp.js
echo    * @returns {Promise^<Object^>} Resultado de la operación >> temp.js
echo    */ >> temp.js
echo   async deleteAllNotifications() { >> temp.js
echo     try { >> temp.js
echo       console.log("Eliminando todas las notificaciones (mock)"); >> temp.js
echo       return { success: true }; >> temp.js
echo     } catch (error) { >> temp.js
echo       console.error("Error al eliminar todas las notificaciones:", error); >> temp.js
echo       throw error; >> temp.js
echo     } >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Registra un callback para recibir notificaciones en tiempo real >> temp.js
echo    * @param {Function} callback - Función a llamar cuando se recibe una notificación >> temp.js
echo    * @returns {Function} Función para cancelar el registro >> temp.js
echo    */ >> temp.js
echo   onNotification(callback) { >> temp.js
echo     notificationCallbacks.add(callback); >> temp.js
echo. >> temp.js
echo     // Devolver función para cancelar el registro >> temp.js
echo     return () =^> { >> temp.js
echo       notificationCallbacks.delete(callback); >> temp.js
echo     }; >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Verifica si las notificaciones están disponibles >> temp.js
echo    * @returns {boolean} true si las notificaciones están disponibles, false en caso contrario >> temp.js
echo    */ >> temp.js
echo   isAvailable() { >> temp.js
echo     return true; // Siempre disponible en mock >> temp.js
echo   }, >> temp.js
echo. >> temp.js
echo   /** >> temp.js
echo    * Verifica si se ha concedido permiso para notificaciones >> temp.js
echo    * @returns {boolean} true si se ha concedido permiso, false en caso contrario >> temp.js
echo    */ >> temp.js
echo   hasPermission() { >> temp.js
echo     return true; // Siempre con permiso en mock >> temp.js
echo   }, >> temp.js
echo }; >> temp.js
echo. >> temp.js
echo // También exportamos como default para compatibilidad >> temp.js
echo export default notificacionesService; >> temp.js

REM Reemplazar el archivo original con el temporal
copy /y temp.js "src\services\notificaciones\index.js" > nul
del temp.js

echo.
echo Limpiando caché de Vite...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Caché de Vite eliminada.
) else (
    echo No se encontró caché de Vite.
)

echo.
echo ===================================================
echo Corrección completada.
echo ===================================================
echo Ahora puedes ejecutar 'npm run dev' para iniciar el servidor.
echo.
