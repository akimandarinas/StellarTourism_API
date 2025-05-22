<?php
require_once __DIR__ . '/../utils/response_utils.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/Usuario.php';

$usuario = new Usuario();
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $id = $_GET['id'];
            $usuario_data = $usuario->getById($id);
            
            if($usuario_data) {
                sendJsonResponse($usuario_data);
            } else {
                sendJsonResponse(array("message" => "Usuario no encontrado."), 404);
            }
        } 
        else if(isset($_GET['email'])) {
            $email = $_GET['email'];
            $usuario_data = $usuario->getByEmail($email);
            
            if($usuario_data) {
                sendJsonResponse($usuario_data);
            } else {
                sendJsonResponse(array("message" => "Usuario no encontrado."), 404);
            }
        }
        // Verificar si se proporciona un Firebase UID
        else if(isset($_GET['firebase_uid'])) {
            $firebase_uid = $_GET['firebase_uid'];
            $usuario_data = $usuario->getByFirebaseUid($firebase_uid);
            
            if($usuario_data) {
                sendJsonResponse($usuario_data);
            } else {
                sendJsonResponse(array("message" => "Usuario no encontrado."), 404);
            }
        } else {
            $usuarios_data = $usuario->getAll(array("orderBy" => "nombre ASC"));
            
            if(count($usuarios_data) > 0) {
                sendJsonResponse(array("records" => $usuarios_data));
            } else {
                sendJsonResponse(array(
                    "status" => "info",
                    "message" => "No se encontraron usuarios."
                ), 404);
            }
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(
            !empty($data['nombre']) &&
            !empty($data['email'])
        ) {
            if($usuario->emailExists($data['email'])) {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "El email ya está registrado."
                ), 400);
                exit();
            }
            
            $result = $usuario->create($data);
            
            if($result) {
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Usuario creado.",
                    "id" => $result
                ), 201);
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo crear el usuario."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede crear el usuario. Datos incompletos."
            ), 400);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(!empty($data['id'])) {
            $id = $data['id'];
            unset($data['id']); 
            
            // Actualizar el usuario
            if($usuario->updatePerfil($id, $data)) {
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Usuario actualizado."
                ));
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo actualizar el usuario."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede actualizar el usuario. ID no proporcionado."
            ), 400);
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(!empty($data['id'])) {
            if($usuario->delete($data['id'])) {
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Usuario eliminado."
                ));
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo eliminar el usuario."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede eliminar el usuario. ID no proporcionado."
            ), 400);
        }
        break;
        
    default:
        sendJsonResponse(array(
            "status" => "error",
            "message" => "Método no permitido."
        ), 405);
        break;


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

function update($id, $data) {
    global $conn;
    
    try {
        if (empty($data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        $checkSql = "SELECT id FROM usuario WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
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
        
        $stmt->bind_param($types, ...$values);
        
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
        
        $sql = "DELETE FROM usuario WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
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

exit();