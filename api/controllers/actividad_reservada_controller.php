<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ActividadReservada.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';
require_once __DIR__ . '/../utils/validation_utils.php';

$database = new Database();
$db = $database->getConnection();

// Crear instancia del objeto ActividadReservada
$actividad_reservada = new ActividadReservada($db);

// Obtener método de solicitud HTTP
$method = $_SERVER['REQUEST_METHOD'];

$auth_header = getAuthorizationHeader();
$token = getBearerToken($auth_header);

if (!$token || !validateFirebaseToken($token)) {
    sendJsonResponse(array("message" => "No autorizado."), 401);
    exit();
}

switch($method) {
    case 'GET':
        if(isset($_GET['reserva_id'])) {
            $reserva_id = $_GET['reserva_id'];
            
            if (!validateId($reserva_id)) {
                sendJsonResponse(array("message" => "ID de reserva inválido."), 400);
                exit();
            }
            
            $actividades_data = $actividad_reservada->getByReserva($reserva_id);
            
            sendJsonResponse(array("records" => $actividades_data));
        } else {
            sendJsonResponse(array("message" => "Se requiere un ID de reserva."), 400);
        }
        break;
        
    case 'POST':
        // Crear actividades reservadas
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['reserva_id']) || !validateId($data['reserva_id'])) {
            sendJsonResponse(array("message" => "ID de reserva inválido o no proporcionado."), 400);
            exit();
        }
        
        if (!isset($data['actividades']) || !is_array($data['actividades']) || empty($data['actividades'])) {
            sendJsonResponse(array("message" => "Se requiere al menos una actividad."), 400);
            exit();
        }
        
        $errors = [];
        foreach ($data['actividades'] as $index => $actividad) {
            $actividadErrors = validateActividadReservadaData($actividad);
            if (!empty($actividadErrors)) {
                $errors["actividad_{$index}"] = $actividadErrors;
            }
        }
        
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        $result = $actividad_reservada->createMultiple($data['actividades'], $data['reserva_id']);
        
        if($result) {
            sendJsonResponse(array("message" => "Actividades reservadas creadas."), 201);
        } else {
            sendJsonResponse(array("message" => "No se pudieron crear las actividades reservadas."), 503);
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if(!isset($data['reserva_id']) || !validateId($data['reserva_id'])) {
            sendJsonResponse(array("message" => "ID de reserva inválido o no proporcionado."), 400);
            exit();
        }
        
        if($actividad_reservada->deleteByReserva($data['reserva_id'])) {
            // Enviar respuesta
            sendJsonResponse(array("message" => "Actividades reservadas eliminadas."));
        } else {
            sendJsonResponse(array("message" => "No se pudieron eliminar las actividades reservadas."), 503);
        }
        break;
        
    default:
        sendJsonResponse(array("message" => "Método no permitido."), 405);
        break;
}

function validateActividadReservadaData($data) {
    $errors = [];
    
    if (!isset($data['actividad_id']) || !validateId($data['actividad_id'])) {
        $errors[] = "Actividad ID es requerido y debe ser un número entero positivo.";
    }
    
    if (!isset($data['cantidad']) || !is_numeric($data['cantidad']) || $data['cantidad'] <= 0) {
        $errors[] = "Cantidad es requerida y debe ser un número positivo.";
    }
    
    if (!isset($data['precio_unitario']) || !is_numeric($data['precio_unitario']) || $data['precio_unitario'] <= 0) {
        $errors[] = "Precio unitario es requerido y debe ser un número positivo.";
    }
    
    if (isset($data['precio_total'])) {
        if (!is_numeric($data['precio_total']) || $data['precio_total'] <= 0) {
            $errors[] = "Precio total debe ser un número positivo.";
        }
        
        if (isset($data['cantidad']) && isset($data['precio_unitario']) && 
            is_numeric($data['cantidad']) && is_numeric($data['precio_unitario'])) {
            $calculatedTotal = $data['cantidad'] * $data['precio_unitario'];
            if (abs($calculatedTotal - $data['precio_total']) > 0.01) {
                $errors[] = "Precio total debe ser igual a cantidad * precio unitario.";
            }
        }
    }
    
    return $errors;



function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM actividad_reservada";
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
        $sql = "SELECT * FROM actividad_reservada WHERE id = ?";
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
        
        $sql = "INSERT INTO actividad_reservada ($columnsStr) VALUES ($placeholdersStr)";
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


function update($id, $data) {
    global $conn;
    
    try {
        // Validar datos
        if (empty($data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        // Verificar si el registro existe
        $checkSql = "SELECT id FROM actividad_reservada WHERE id = ?";
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
        $sql = "UPDATE actividad_reservada SET $updatesStr WHERE id = ?";
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
        $checkSql = "SELECT id FROM actividad_reservada WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        $sql = "DELETE FROM actividad_reservada WHERE id = ?";
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
