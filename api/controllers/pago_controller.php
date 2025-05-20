<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos de configuración y modelo
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Pago.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';
require_once __DIR__ . '/../utils/validation_utils.php';

// Crear instancia de la base de datos
$database = new Database();
$db = $database->getConnection();

// Crear instancia del objeto Pago
$pago = new Pago($db);

// Obtener método de solicitud HTTP
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

// Procesar según el método
switch($method) {
    case 'GET':
        // Verificar si se proporciona un ID
        if(isset($_GET['id'])) {
            // Leer un solo pago
            $id = $_GET['id'];
            $pago_data = $pago->getById($id);
            
            if($pago_data) {
                // Enviar respuesta
                sendJsonResponse($pago_data);
            } else {
                // No se encontró el pago
                sendJsonResponse(array("message" => "Pago no encontrado."), 404);
            }
        } 
        // Verificar si se proporciona un ID de reserva
        else if(isset($_GET['reserva_id'])) {
            // Leer pagos por reserva
            $reserva_id = $_GET['reserva_id'];
            
            // Validar reserva_id
            if (!validateId($reserva_id)) {
                sendJsonResponse(array("message" => "ID de reserva inválido."), 400);
                exit();
            }
            
            $pagos_data = $pago->getPagosByReserva($reserva_id);
            
            // Enviar respuesta
            sendJsonResponse(array("records" => $pagos_data));
        }
        // Verificar si se proporciona un ID de usuario
        else if(isset($_GET['usuario_id'])) {
            // Leer pagos por usuario
            $usuario_id = $_GET['usuario_id'];
            
            // Validar usuario_id
            if (!validateId($usuario_id)) {
                sendJsonResponse(array("message" => "ID de usuario inválido."), 400);
                exit();
            }
            
            $pagos_data = $pago->getPagosByUsuario($usuario_id);
            
            // Enviar respuesta
            sendJsonResponse(array("records" => $pagos_data));
        } else {
            // Leer todos los pagos (solo para administradores)
            // Verificar si el usuario es administrador
            $auth_header = getAuthorizationHeader();
            $token = getBearerToken($auth_header);
            
            if (!$token || !isAdmin($token)) {
                sendJsonResponse(array("message" => "No autorizado para ver todos los pagos."), 403);
                exit();
            }
            
            $pagos_data = $pago->getAll();
            
            // Enviar respuesta
            sendJsonResponse(array("records" => $pagos_data));
        }
        break;
        
    case 'POST':
        // Crear un pago
        // Obtener los datos enviados
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar datos
        $errors = validatePagoData($data);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        // Crear el pago
        $result = $pago->create($data);
        
        if($result) {
            // Enviar respuesta
            sendJsonResponse(array(
                "message" => "Pago creado.",
                "id" => $result
            ), 201);
        } else {
            // Enviar respuesta
            sendJsonResponse(array("message" => "No se pudo crear el pago."), 503);
        }
        break;
        
    case 'PUT':
        // Actualizar un pago
        // Obtener el ID del pago a actualizar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar ID
        if(!isset($data['id']) || !validateId($data['id'])) {
            sendJsonResponse(array("message" => "ID de pago inválido o no proporcionado."), 400);
            exit();
        }
        
        // Validar datos
        $errors = validatePagoData($data, false);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        // Actualizar el pago
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
        // Eliminar un pago
        // Obtener el ID del pago a eliminar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar ID
        if(!isset($data['id']) || !validateId($data['id'])) {
            sendJsonResponse(array("message" => "ID de pago inválido o no proporcionado."), 400);
            exit();
        }
        
        // Eliminar el pago
        if($pago->delete($data['id'])) {
            // Enviar respuesta
            sendJsonResponse(array("message" => "Pago eliminado."));
        } else {
            // Enviar respuesta
            sendJsonResponse(array("message" => "No se pudo eliminar el pago."), 503);
        }
        break;
        
    default:
        // Método no permitido
        sendJsonResponse(array("message" => "Método no permitido."), 405);
        break;
}

// Función para validar datos de pago
function validatePagoData($data, $isCreate = true) {
    $errors = [];
    
    // Validar campos requeridos para creación
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


/**
 * Obtiene todos los registros
 */
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

/**
 * Obtiene un registro por su ID
 * 
 * @param int $id ID del registro
 */
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
        $checkSql = "SELECT id FROM pago WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de eliminación
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
