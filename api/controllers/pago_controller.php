<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Pago.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';
require_once __DIR__ . '/../utils/validation_utils.php';

$database = new Database();
$db = $database->getConnection();

$pago = new Pago($db);

$method = $_SERVER['REQUEST_METHOD'];

// Verificar autenticación para métodos que lo requieren
if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    $auth_header = getAuthorizationHeader();
    $token = getBearerToken($auth_header);
    
    if (!$token || !validateFirebaseToken($token)) {
        // No autorizado
        sendJsonResponse(array("message" => "No autorizado."), 401);
        exit();
    }
}

switch($method) {
    case 'GET':
        // Verificar si se proporciona un ID
        if(isset($_GET['id'])) {
            // Leer un solo pago
            $id = $_GET['id'];
            $pago_data = $pago->getById($id);
            
            if($pago_data) {
                sendJsonResponse($pago_data);
            } else {
                // No se encontró el pago
                sendJsonResponse(array("message" => "Pago no encontrado."), 404);
            }
        } 
        else if(isset($_GET['reserva_id'])) {
            $reserva_id = $_GET['reserva_id'];
            
            if (!validateId($reserva_id)) {
                sendJsonResponse(array("message" => "ID de reserva inválido."), 400);
                exit();
            }
            
            $pagos_data = $pago->getPagosByReserva($reserva_id);
            
            sendJsonResponse(array("records" => $pagos_data));
        }
        else if(isset($_GET['usuario_id'])) {
            $usuario_id = $_GET['usuario_id'];
            
            if (!validateId($usuario_id)) {
                sendJsonResponse(array("message" => "ID de usuario inválido."), 400);
                exit();
            }
            
            $pagos_data = $pago->getPagosByUsuario($usuario_id);
            
            sendJsonResponse(array("records" => $pagos_data));
        } else {
            $auth_header = getAuthorizationHeader();
            $token = getBearerToken($auth_header);
            
            if (!$token || !isAdmin($token)) {
                sendJsonResponse(array("message" => "No autorizado para ver todos los pagos."), 403);
                exit();
            }
            
            $pagos_data = $pago->getAll();
            
            sendJsonResponse(array("records" => $pagos_data));
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $errors = validatePagoData($data);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        $result = $pago->create($data);
        
        if($result) {
            // Enviar respuesta
            sendJsonResponse(array(
                "message" => "Pago creado.",
                "id" => $result
            ), 201);
        } else {
            sendJsonResponse(array("message" => "No se pudo crear el pago."), 503);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!isset($data['id']) || !validateId($data['id'])) {
            sendJsonResponse(array("message" => "ID de pago inválido o no proporcionado."), 400);
            exit();
        }
        
        $errors = validatePagoData($data, false);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        $id = $data['id'];
        unset($data['id']); // Eliminar el ID de los datos a actualizar
        
        if($pago->update($id, $data)) {
            // Enviar respuesta
            sendJsonResponse(array("message" => "Pago actualizado."));
        } else {
            // Enviar respuesta
            sendJsonResponse(array("message" => "No se pudo actualizar el pago."), 503);
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!isset($data['id']) || !validateId($data['id'])) {
            sendJsonResponse(array("message" => "ID de pago inválido o no proporcionado."), 400);
            exit();
        }
        
        if($pago->delete($data['id'])) {
            // Enviar respuesta
            sendJsonResponse(array("message" => "Pago eliminado."));
        } else {
            // Enviar respuesta
            sendJsonResponse(array("message" => "No se pudo eliminar el pago."), 503);
        }
        break;
        
    default:
        sendJsonResponse(array("message" => "Método no permitido."), 405);
        break;
}
function validatePagoData($data, $isCreate = true) {
    $errors = [];
    if ($isCreate) {
        if (!isset($data['reserva_id']) || !validateId($data['reserva_id'])) {
            $errors[] = "Reserva ID es requerido y debe ser un número entero positivo.";
        }
        
        if (!isset($data['monto']) || !is_numeric($data['monto']) || $data['monto'] <= 0) {
            $errors[] = "Monto es requerido y debe ser un número positivo.";
        }
        
        if (!isset($data['metodo']) || !in_array($data['metodo'], ['tarjeta', 'paypal', 'transferencia'])) {
            $errors[] = "Método de pago es requerido y debe ser uno de: tarjeta, paypal, transferencia.";
        }
    }
    
    // Validar campos opcionales
    if (isset($data['estado']) && !in_array($data['estado'], ['pendiente', 'completado', 'fallido', 'reembolsado'])) {
        $errors[] = "Estado debe ser uno de: pendiente, completado, fallido, reembolsado.";
    }
    
    if (isset($data['monto']) && (!is_numeric($data['monto']) || $data['monto'] <= 0)) {
        $errors[] = "Monto debe ser un número positivo.";
    }
    
    return $errors;

function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM pago";
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
        $sql = "SELECT * FROM pago WHERE id = ?";
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
        
        $sql = "INSERT INTO pago ($columnsStr) VALUES ($placeholdersStr)";
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
        // Validar datos
        if (empty($data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        // Verificar si el registro existe
        $checkSql = "SELECT id FROM pago WHERE id = ?";
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
        $sql = "UPDATE pago SET $updatesStr WHERE id = ?";
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
        $checkSql = "SELECT id FROM pago WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }

        $sql = "DELETE FROM pago WHERE id = ?";
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
