<?php
require_once __DIR__ . '/../utils/response_utils.php';

// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos necesarios
include_once '../config/database.php';
include_once '../utils/auth_utils.php';

// Obtener la acción de la URL
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$action = end($uri_parts);

// Obtener método de solicitud HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Procesar según la acción y el método
if ($method === 'POST') {
    // Obtener datos enviados
    $data = json_decode(file_get_contents("php://input"));
    
    switch ($action) {
        case 'login':
            // Verificar que los datos no estén vacíos
            if (!empty($data->email) && !empty($data->password)) {
                // Aquí iría la lógica de autenticación
                // Por ahora, simulamos una respuesta exitosa
                $token = generateJWT(['user_id' => 1, 'email' => $data->email]);
                
                sendJsonResponse([
                    'status' => 'success',
                    'message' => 'Inicio de sesión exitoso',
                    'token' => $token,
                    'user' => [
                        'id' => 1,
                        'email' => $data->email,
                        'name' => 'Usuario de Prueba'
                    ]
                ]);
            } else {
                sendJsonResponse([
                    'status' => 'error',
                    'message' => 'Email y contraseña son requeridos'
                ], 400);
            }
            break;
            
        case 'register':
            // Verificar que los datos no estén vacíos
            if (!empty($data->email) && !empty($data->password) && !empty($data->name)) {
                // Aquí iría la lógica de registro
                // Por ahora, simulamos una respuesta exitosa
                sendJsonResponse([
                    'status' => 'success',
                    'message' => 'Registro exitoso',
                    'user' => [
                        'id' => 1,
                        'email' => $data->email,
                        'name' => $data->name
                    ]
                ], 201);
            } else {
                sendJsonResponse([
                    'status' => 'error',
                    'message' => 'Todos los campos son requeridos'
                ], 400);
            }
            break;
            
        case 'logout':
            // Aquí iría la lógica de cierre de sesión
            sendJsonResponse([
                'status' => 'success',
                'message' => 'Sesión cerrada exitosamente'
            ]);
            break;
            
        case 'reset-password':
            // Verificar que el email no esté vacío
            if (!empty($data->email)) {
                // Aquí iría la lógica de restablecimiento de contraseña
                sendJsonResponse([
                    'status' => 'success',
                    'message' => 'Se ha enviado un correo con instrucciones para restablecer la contraseña'
                ]);
            } else {
                sendJsonResponse([
                    'status' => 'error',
                    'message' => 'El email es requerido'
                ], 400);
            }
            break;
            
        default:
            // Acción no reconocida
            sendJsonResponse([
                'status' => 'error',
                'message' => 'Acción no reconocida: ' . $action
            ], 404);
            break;
    }
} else if ($method === 'GET') {
    switch ($action) {
        case 'verify':
            // Verificar token de autenticación
            $headers = getallheaders();
            $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
            
            if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                $token = $matches[1];
                
                // Aquí iría la lógica de verificación del token
                // Por ahora, simulamos una respuesta exitosa
                sendJsonResponse([
                    'status' => 'success',
                    'message' => 'Token válido',
                    'user' => [
                        'id' => 1,
                        'email' => 'usuario@ejemplo.com',
                        'name' => 'Usuario de Prueba'
                    ]
                ]);
            } else {
                sendJsonResponse([
                    'status' => 'error',
                    'message' => 'Token no proporcionado'
                ], 401);
            }
            break;
            
        case 'user':
            // Obtener información del usuario autenticado
            $headers = getallheaders();
            $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
            
            if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                $token = $matches[1];
                
                // Aquí iría la lógica para obtener la información del usuario
                // Por ahora, simulamos una respuesta exitosa
                sendJsonResponse([
                    'status' => 'success',
                    'user' => [
                        'id' => 1,
                        'email' => 'usuario@ejemplo.com',
                        'name' => 'Usuario de Prueba',
                        'created_at' => '2023-01-01 00:00:00'
                    ]
                ]);
            } else {
                sendJsonResponse([
                    'status' => 'error',
                    'message' => 'Token no proporcionado'
                ], 401);
            }
            break;
            
        default:
            // Acción no reconocida
            sendJsonResponse([
                'status' => 'error',
                'message' => 'Acción no reconocida: ' . $action
            ], 404);
            break;
    }
} else {
    // Método no permitido
    sendJsonResponse([
        'status' => 'error',
        'message' => 'Método no permitido'
    ], 405);


/**
 * Obtiene todos los registros
 */
function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM auth";
        $result = $conn->query($sql);
        
        $items = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $items[] = $row;
            }
        }
        
        sendJsonResponse([
            'status' => 'success',
            'data' => $items,
            'count' => count($items)
        ]);
    } catch (Exception $e) {
        sendErrorResponse('Error al obtener los registros: ' . $e->getMessage());
    }
}

/**
 * Obtiene un registro por su ID
 * 
 * @param int $id ID del registro
 */
function getById($id) {
    global $conn;
    
    try {
        $sql = "SELECT * FROM auth WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $item = $result->fetch_assoc();
            sendJsonResponse([
                'status' => 'success',
                'data' => $item
            ]);
        } else {
            sendErrorResponse('Registro no encontrado', 404);
        }
    } catch (Exception $e) {
        sendErrorResponse('Error al obtener el registro: ' . $e->getMessage());
    }
}

/**
 * Crea un nuevo registro
 * 
 * @param array $data Datos del registro
 */
function create($data) {
    global $conn;
    
    try {
        // Validar datos
        if (empty($data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        // Preparar la consulta
        $columns = array_keys($data);
        $values = array_values($data);
        
        $placeholders = array_fill(0, count($columns), '?');
        
        $columnsStr = implode(', ', $columns);
        $placeholdersStr = implode(', ', $placeholders);
        
        $sql = "INSERT INTO auth ($columnsStr) VALUES ($placeholdersStr)";
        $stmt = $conn->prepare($sql);
        
        // Determinar los tipos de datos
        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } elseif (is_string($value)) {
                $types .= 's';
            } else {
                $types .= 's';
            }
        }
        
        // Bind parameters
        $stmt->bind_param($types, ...$values);
        
        // Ejecutar la consulta
        if ($stmt->execute()) {
            $newId = $stmt->insert_id;
            sendJsonResponse([
                'status' => 'success',
                'message' => 'Registro creado correctamente',
                'id' => $newId
            ], 201);
        } else {
            sendErrorResponse('Error al crear el registro: ' . $stmt->error);
        }
    } catch (Exception $e) {
        sendErrorResponse('Error al crear el registro: ' . $e->getMessage());
    }
}

/**
 * Actualiza un registro existente
 * 
 * @param int $id ID del registro
 * @param array $data Datos del registro
 */
function update($id, $data) {
    global $conn;
    
    try {
        // Validar datos
        if (empty($data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        // Verificar si el registro existe
        $checkSql = "SELECT id FROM auth WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de actualización
        $updates = [];
        $values = [];
        
        foreach ($data as $column => $value) {
            $updates[] = "$column = ?";
            $values[] = $value;
        }
        
        $values[] = $id; // Añadir el ID al final
        
        $updatesStr = implode(', ', $updates);
        $sql = "UPDATE auth SET $updatesStr WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        // Determinar los tipos de datos
        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } elseif (is_string($value)) {
                $types .= 's';
            } else {
                $types .= 's';
            }
        }
        
        // Bind parameters
        $stmt->bind_param($types, ...$values);
        
        // Ejecutar la consulta
        if ($stmt->execute()) {
            sendJsonResponse([
                'status' => 'success',
                'message' => 'Registro actualizado correctamente',
                'affected_rows' => $stmt->affected_rows
            ]);
        } else {
            sendErrorResponse('Error al actualizar el registro: ' . $stmt->error);
        }
    } catch (Exception $e) {
        sendErrorResponse('Error al actualizar el registro: ' . $e->getMessage());
    }
}

/**
 * Elimina un registro
 * 
 * @param int $id ID del registro
 */
function delete($id) {
    global $conn;
    
    try {
        // Verificar si el registro existe
        $checkSql = "SELECT id FROM auth WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de eliminación
        $sql = "DELETE FROM auth WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        // Ejecutar la consulta
        if ($stmt->execute()) {
            sendJsonResponse([
                'status' => 'success',
                'message' => 'Registro eliminado correctamente',
                'affected_rows' => $stmt->affected_rows
            ]);
        } else {
            sendErrorResponse('Error al eliminar el registro: ' . $stmt->error);
        }
    } catch (Exception $e) {
        sendErrorResponse('Error al eliminar el registro: ' . $e->getMessage());
    }
}
}

// Asegurar que el script termine aquí
exit();
