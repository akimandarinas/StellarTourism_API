<?php
require_once __DIR__ . '/../utils/response_utils.php';


// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos de configuración y modelo
include_once '../config/database.php';
include_once '../models/Usuario.php';

// Crear instancia del objeto Usuario
$usuario = new Usuario();

// Obtener método de solicitud HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Procesar según el método
switch($method) {
    case 'GET':
        // Verificar si se proporciona un ID
        if(isset($_GET['id'])) {
            // Leer un solo usuario
            $id = $_GET['id'];
            $usuario_data = $usuario->getById($id);
            
            if($usuario_data) {
                // Enviar respuesta
                sendJsonResponse($usuario_data);
            } else {
                // No se encontró el usuario
                sendJsonResponse(array("message" => "Usuario no encontrado."), 404);
            }
        } 
        // Verificar si se proporciona un email
        else if(isset($_GET['email'])) {
            // Leer usuario por email
            $email = $_GET['email'];
            $usuario_data = $usuario->getByEmail($email);
            
            if($usuario_data) {
                // Enviar respuesta
                sendJsonResponse($usuario_data);
            } else {
                // No se encontró el usuario
                sendJsonResponse(array("message" => "Usuario no encontrado."), 404);
            }
        }
        // Verificar si se proporciona un Firebase UID
        else if(isset($_GET['firebase_uid'])) {
            // Leer usuario por Firebase UID
            $firebase_uid = $_GET['firebase_uid'];
            $usuario_data = $usuario->getByFirebaseUid($firebase_uid);
            
            if($usuario_data) {
                // Enviar respuesta
                sendJsonResponse($usuario_data);
            } else {
                // No se encontró el usuario
                sendJsonResponse(array("message" => "Usuario no encontrado."), 404);
            }
        } else {
            // Leer todos los usuarios
            $usuarios_data = $usuario->getAll(array("orderBy" => "nombre ASC"));
            
            if(count($usuarios_data) > 0) {
                // Enviar respuesta
                sendJsonResponse(array("records" => $usuarios_data));
            } else {
                // No se encontraron usuarios
                sendJsonResponse(array(
                    "status" => "info",
                    "message" => "No se encontraron usuarios."
                ), 404);
            }
        }
        break;
        
    case 'POST':
        // Crear un usuario
        // Obtener los datos enviados
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Verificar que los datos no estén vacíos
        if(
            !empty($data['nombre']) &&
            !empty($data['email'])
        ) {
            // Verificar si el email ya existe
            if($usuario->emailExists($data['email'])) {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "El email ya está registrado."
                ), 400);
                exit();
            }
            
            // Crear el usuario
            $result = $usuario->create($data);
            
            if($result) {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Usuario creado.",
                    "id" => $result
                ), 201);
            } else {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo crear el usuario."
                ), 503);
            }
        } else {
            // Enviar respuesta
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede crear el usuario. Datos incompletos."
            ), 400);
        }
        break;
        
    case 'PUT':
        // Actualizar un usuario
        // Obtener el ID del usuario a actualizar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Verificar que el ID no esté vacío
        if(!empty($data['id'])) {
            // Obtener ID a actualizar
            $id = $data['id'];
            unset($data['id']); // Eliminar el ID de los datos a actualizar
            
            // Actualizar el usuario
            if($usuario->updatePerfil($id, $data)) {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Usuario actualizado."
                ));
            } else {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo actualizar el usuario."
                ), 503);
            }
        } else {
            // Enviar respuesta
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede actualizar el usuario. ID no proporcionado."
            ), 400);
        }
        break;
        
    case 'DELETE':
        // Eliminar un usuario
        // Obtener el ID del usuario a eliminar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Verificar que el ID no esté vacío
        if(!empty($data['id'])) {
            // Eliminar el usuario
            if($usuario->delete($data['id'])) {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Usuario eliminado."
                ));
            } else {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo eliminar el usuario."
                ), 503);
            }
        } else {
            // Enviar respuesta
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede eliminar el usuario. ID no proporcionado."
            ), 400);
        }
        break;
        
    default:
        // Método no permitido
        sendJsonResponse(array(
            "status" => "error",
            "message" => "Método no permitido."
        ), 405);
        break;


/**
 * Obtiene todos los registros
 */
function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM usuario";
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
        $sql = "SELECT * FROM usuario WHERE id = ?";
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
        
        $sql = "INSERT INTO usuario ($columnsStr) VALUES ($placeholdersStr)";
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
        $checkSql = "SELECT id FROM usuario WHERE id = ?";
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
        $sql = "UPDATE usuario SET $updatesStr WHERE id = ?";
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
        $checkSql = "SELECT id FROM usuario WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de eliminación
        $sql = "DELETE FROM usuario WHERE id = ?";
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