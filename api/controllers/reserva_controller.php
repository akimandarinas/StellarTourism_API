<?php
require_once __DIR__ . '/../utils/response_utils.php';


header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/Reserva.php';

$reserva = new Reserva();

// Obtener método de solicitud HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            $id = $_GET['id'];
            $reserva_data = $reserva->getById($id);
            
            if($reserva_data) {
                sendJsonResponse($reserva_data);
            } else {
                sendJsonResponse(array("message" => "Reserva no encontrada."), 404);
            }
        } 
        else if(isset($_GET['usuario_id'])) {
            $usuario_id = $_GET['usuario_id'];
            $reservas_data = $reserva->getByUsuarioDetallado($usuario_id);
            
            if(count($reservas_data) > 0) {
                sendJsonResponse(array("records" => $reservas_data));
            } else {
                sendJsonResponse(array(
                    "status" => "info",
                    "message" => "No se encontraron reservas para este usuario.",
                    "usuario_id" => $usuario_id
                ), 404);
            }
        }
        else if(isset($_GET['ruta_id'])) {
            // Leer reservas por ruta
            $ruta_id = $_GET['ruta_id'];
            $reservas_data = $reserva->getByRuta($ruta_id);
            
            if(count($reservas_data) > 0) {
                // Enviar respuesta
                sendJsonResponse(array("records" => $reservas_data));
            } else {
                sendJsonResponse(array(
                    "status" => "info",
                    "message" => "No se encontraron reservas para esta ruta."
                ), 404);
            }
        } else {
            $reservas_data = $reserva->getAll(array("orderBy" => "fecha_reserva DESC"));
            
            if(count($reservas_data) > 0) {
                sendJsonResponse(array("records" => $reservas_data));
            } else {
                sendJsonResponse(array(
                    "status" => "info",
                    "message" => "No se encontraron reservas."
                ), 404);
            }
        }
        break;
        
    case 'POST':
        // Crear una reserva
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(
            !empty($data['usuario_id']) &&
            !empty($data['ruta_id']) &&
            !empty($data['numero_pasajeros'])
        ) {
            if($reserva->verificarDisponibilidad($data['ruta_id'], $data['numero_pasajeros'])) {
                $result = $reserva->create($data);
                
                if($result) {
                    sendJsonResponse(array(
                        "status" => "success",
                        "message" => "Reserva creada.",
                        "id" => $result
                    ), 201);
                } else {
                    sendJsonResponse(array(
                        "status" => "error",
                        "message" => "No se pudo crear la reserva."
                    ), 503);
                }
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No hay suficientes plazas disponibles para esta ruta."
                ), 400);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede crear la reserva. Datos incompletos."
            ), 400);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(!empty($data['id'])) {
            // Obtener ID a actualizar
            $id = $data['id'];
            unset($data['id']); // Eliminar el ID de los datos a actualizar
            
            if($reserva->update($id, $data)) {
                // Enviar respuesta
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Reserva actualizada."
                ));
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo actualizar la reserva."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede actualizar la reserva. ID no proporcionado."
            ), 400);
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(!empty($data['id'])) {
            if($reserva->delete($data['id'])) {
                sendJsonResponse(array(
                    "status" => "success",
                    "message" => "Reserva eliminada."
                ));
            } else {
                sendJsonResponse(array(
                    "status" => "error",
                    "message" => "No se pudo eliminar la reserva."
                ), 503);
            }
        } else {
            sendJsonResponse(array(
                "status" => "error",
                "message" => "No se puede eliminar la reserva. ID no proporcionado."
            ), 400);
        }
        break;
        
    default:
        sendJsonResponse(array(
            "status" => "error",
            "message" => "Método no permitido."
        ), 405);
        break;
}

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'stats') {
    // Obtener estadísticas de reservas
    $stats = $reserva->getEstadisticas();
    sendJsonResponse(array(
        "status" => "success",
        "message" => "Estadísticas de reservas obtenidas correctamente",
        "data" => $stats
    ));
    exit();
}

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'disponibilidad') {
    if (!isset($_GET['ruta_id']) || !isset($_GET['fecha']) || !isset($_GET['pasajeros'])) {
        sendJsonResponse(array(
            "status" => "error",
            "message" => "Faltan parámetros para verificar disponibilidad"
        ), 400);
        exit();
    }
    
    $disponibilidad = $reserva->verificarDisponibilidadDetallada(
        $_GET['ruta_id'],
        $_GET['fecha'],
        $_GET['pasajeros']
    );
    
    sendJsonResponse(array(
        "status" => "success",
        "message" => "Disponibilidad verificada correctamente",
        "data" => $disponibilidad
    ));
    exit();


function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM reserva";
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
        $sql = "SELECT * FROM reserva WHERE id = ?";
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
 Crea un nuevo registro
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
        
        $sql = "INSERT INTO reserva ($columnsStr) VALUES ($placeholdersStr)";
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

/**
Actualiza un registro existente
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
        $checkSql = "SELECT id FROM reserva WHERE id = ?";
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
        $sql = "UPDATE reserva SET $updatesStr WHERE id = ?";
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

function delete($id) {
    global $conn;
    
    try {
        $checkSql = "SELECT id FROM reserva WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        $sql = "DELETE FROM reserva WHERE id = ?";
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
