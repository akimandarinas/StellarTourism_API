<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if (!defined('BASE_PATH')) {
    define('BASE_PATH', dirname(dirname(__FILE__)));
}

// Incluir archivos de configuración y modelo
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/models/Actividad.php';
require_once BASE_PATH . '/utils/response_utils.php';

$actividad = new Actividad();

// Obtener método de solicitud HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Verificar si se proporciona un ID
        if(isset($_GET['id'])) {
            // Leer una sola actividad
            $id = $_GET['id'];
            $actividad_data = $actividad->getById($id);
            
            if($actividad_data) {
                // Enviar respuesta
                sendJsonResponse($actividad_data);
            } else {
                // No se encontró la actividad
                sendJsonResponse(array("message" => "Actividad no encontrada."), 404);
            }
        } 
        else if(isset($_GET['destination_id'])) {
            // Leer actividades por destino
            $destino_id = $_GET['destination_id'];
            $actividades_data = $actividad->getByDestino($destino_id);
            
            if(count($actividades_data) > 0) {
                // Enviar respuesta
                sendJsonResponse(array("records" => $actividades_data));
            } else {
                // No se encontraron actividades
                sendJsonResponse(array(
                    "status" => "info",
                    "message" => "No se encontraron actividades para este destino."
                ), 404);
            }
        } else {
            $actividades_data = $actividad->getAll(array("orderBy" => "nombre ASC"));
            if(count($actividades_data) > 0) {
                sendJsonResponse(array("records" => $actividades_data));
            } else {
                sendJsonResponse(array(
                    "status" => "info",
                    "message" => "No se encontraron actividades."
                ), 404);
            }
        }
        break;
        
    case 'POST':
        // Crear una actividad
        $data = json_decode(file_get_contents("php://input"), true);
        if(
            !empty($data['nombre']) &&
            !empty($data['duracion']) &&
            !empty($data['precio'])
        ) {
            // Crear la actividad
            $result = $actividad->create($data);
            
            if($result) {
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Actividad creada.",
                    "id" => $result
                ), 201);
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo crear la actividad."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede crear la actividad. Datos incompletos."
            ), 400);
        }
        break;
        
    case 'PUT':
        // Actualizar una actividad
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['id'])) {
            // Obtener ID a actualizar
            $id = $data['id'];
            unset($data['id']); // Eliminar el ID de los datos a actualizar
            if($actividad->update($id, $data)) {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Actividad actualizada."
                ));
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo actualizar la actividad."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede actualizar la actividad. ID no proporcionado."
            ), 400);
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Verificar que el ID no esté vacío
        if(!empty($data['id'])) {
            // Eliminar la actividad
            if($actividad->delete($data['id'])) {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Actividad eliminada."
                ));
            } else {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo eliminar la actividad."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede eliminar la actividad. ID no proporcionado."
            ), 400);
        }
        break;
    default:
        sendJsonResponse(array(
            "status" => "error",
            "message" => "Método no permitido."
        ), 405);
        break;


/**
Obtiene todos los registros
 */
function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM actividad";
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
        $sql = "SELECT * FROM actividad WHERE id = ?";
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
        
        $columns = array_keys($data);
        $values = array_values($data);
        
        $placeholders = array_fill(0, count($columns), '?');
        
        $columnsStr = implode(', ', $columns);
        $placeholdersStr = implode(', ', $placeholders);
        
        $sql = "INSERT INTO actividad ($columnsStr) VALUES ($placeholdersStr)";
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
        // Validar datos
        if (empty($data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        $checkSql = "SELECT id FROM actividad WHERE id = ?";
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
        $sql = "UPDATE actividad SET $updatesStr WHERE id = ?";
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


function delete($id) {
    global $conn;
    
    try {
        // Verificar si el registro existe
        $checkSql = "SELECT id FROM actividad WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        $sql = "DELETE FROM actividad WHERE id = ?";
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

exit();
