<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos de configuración y modelo
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Ruta.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';
require_once __DIR__ . '/../utils/validation_utils.php';

// Crear instancia de la base de datos
$database = new Database();
$db = $database->getConnection();

// Crear instancia del objeto Ruta
$ruta = new Ruta($db);

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
    
    // Verificar si es administrador para operaciones de escritura
    if (!isAdmin($token)) {
        sendJsonResponse(array("message" => "No autorizado. Se requiere rol de administrador."), 403);
        exit();
    }
}

// Procesar según el método
switch($method) {
    case 'GET':
        // Verificar si se solicitan rutas populares
        if(isset($_GET['popular']) && $_GET['popular'] == 'true') {
            // Leer rutas populares
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
            
            // Validar limit
            if ($limit <= 0 || $limit > 20) {
                $limit = 5; // Valor por defecto si es inválido
            }
            
            $rutas_data = $ruta->getRutasPopulares($limit);
            
            // Enviar respuesta
            sendJsonResponse(array("records" => $rutas_data));
        }
        // Verificar si se proporciona un ID
        else if(isset($_GET['id'])) {
            // Leer una sola ruta
            $id = $_GET['id'];
            
            // Validar ID
            if (!validateId($id)) {
                sendJsonResponse(array("message" => "ID de ruta inválido."), 400);
                exit();
            }
            
            $ruta_data = $ruta->getById($id);
            
            if($ruta_data) {
                // Enviar respuesta
                sendJsonResponse($ruta_data);
            } else {
                // No se encontró la ruta
                sendJsonResponse(array("message" => "Ruta no encontrada."), 404);
            }
        }
        // Verificar si se proporciona un ID de destino
        else if(isset($_GET['destino_id'])) {
            // Leer rutas por destino
            $destino_id = $_GET['destino_id'];
            
            // Validar destino_id
            if (!validateId($destino_id)) {
                sendJsonResponse(array("message" => "ID de destino inválido."), 400);
                exit();
            }
            
            $rutas_data = $ruta->getRutasByDestino($destino_id);
            
            // Enviar respuesta
            sendJsonResponse(array("records" => $rutas_data));
        }
        // Verificar si se proporciona un ID de nave
        else if(isset($_GET['nave_id'])) {
            // Leer rutas por nave
            $nave_id = $_GET['nave_id'];
            
            // Validar nave_id
            if (!validateId($nave_id)) {
                sendJsonResponse(array("message" => "ID de nave inválido."), 400);
                exit();
            }
            
            $rutas_data = $ruta->getRutasByNave($nave_id);
            
            // Enviar respuesta
            sendJsonResponse(array("records" => $rutas_data));
        } else {
            // Leer todas las rutas
            $rutas_data = $ruta->getAll();
            
            // Enviar respuesta
            sendJsonResponse(array("records" => $rutas_data));
        }
        break;
        
    case 'POST':
        // Crear una ruta
        // Obtener los datos enviados
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar datos
        $errors = validateRutaData($data);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        // Crear la ruta
        $result = $ruta->create($data);
        
        if($result) {
            // Enviar respuesta
            sendJsonResponse(array(
                "message" => "Ruta creada.",
                "id" => $result
            ), 201);
        } else {
            // Enviar respuesta
            sendJsonResponse(array("message" => "No se pudo crear la ruta."), 503);
        }
        break;
        
    case 'PUT':
        // Actualizar una ruta
        // Obtener el ID de la ruta a actualizar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar ID
        if(!isset($data['id']) || !validateId($data['id'])) {
            sendJsonResponse(array("message" => "ID de ruta inválido o no proporcionado."), 400);
            exit();
        }
        
        // Validar datos
        $errors = validateRutaData($data, false);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        // Actualizar la ruta
        $id = $data['id'];
        unset($data['id']); // Eliminar el ID de los datos a actualizar
        
        if($ruta->update($id, $data)) {
            // Enviar respuesta
            sendJsonResponse(array("message" => "Ruta actualizada."));
        } else {
            // Enviar respuesta
            sendJsonResponse(array("message" => "No se pudo actualizar la ruta."), 503);
        }
        break;
        
    case 'DELETE':
        // Eliminar una ruta
        // Obtener el ID de la ruta a eliminar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar ID
        if(!isset($data['id']) || !validateId($data['id'])) {
            sendJsonResponse(array("message" => "ID de ruta inválido o no proporcionado."), 400);
            exit();
        }
        
        // Eliminar la ruta
        if($ruta->delete($data['id'])) {
            // Enviar respuesta
            sendJsonResponse(array("message" => "Ruta eliminada."));
        } else {
            // Enviar respuesta
            sendJsonResponse(array("message" => "No se pudo eliminar la ruta."), 503);
        }
        break;
        
    default:
        // Método no permitido
        sendJsonResponse(array("message" => "Método no permitido."), 405);
        break;
}

// Función para validar datos de ruta
function validateRutaData($data, $isCreate = true) {
    $errors = [];
    
    // Validar campos requeridos para creación
    if ($isCreate) {
        if (!isset($data['destino_id']) || !validateId($data['destino_id'])) {
            $errors[] = "Destino ID es requerido y debe ser un número entero positivo.";
        }
        
        if (!isset($data['nave_id']) || !validateId($data['nave_id'])) {
            $errors[] = "Nave ID es requerido y debe ser un número entero positivo.";
        }
        
        if (!isset($data['nombre']) || empty(trim($data['nombre']))) {
            $errors[] = "Nombre es requerido.";
        }
        
        if (!isset($data['duracion']) || !is_numeric($data['duracion']) || $data['duracion'] <= 0) {
            $errors[] = "Duración es requerida y debe ser un número positivo.";
        }
        
        if (!isset($data['distancia']) || !is_numeric($data['distancia']) || $data['distancia'] <= 0) {
            $errors[] = "Distancia es requerida y debe ser un número positivo.";
        }
        
        if (!isset($data['precio']) || !is_numeric($data['precio']) || $data['precio'] <= 0) {
            $errors[] = "Precio es requerido y debe ser un número positivo.";
        }
        
        if (!isset($data['plazas_disponibles']) || !is_numeric($data['plazas_disponibles']) || $data['plazas_disponibles'] <= 0) {
            $errors[] = "Plazas disponibles es requerido y debe ser un número positivo.";
        }
        
        if (!isset($data['fecha_salida']) || !validateDate($data['fecha_salida'])) {
            $errors[] = "Fecha de salida es requerida y debe tener un formato válido (YYYY-MM-DD).";
        }
        
        if (!isset($data['fecha_regreso']) || !validateDate($data['fecha_regreso'])) {
            $errors[] = "Fecha de regreso es requerida y debe tener un formato válido (YYYY-MM-DD).";
        }
    }
    
    // Validar campos opcionales
    if (isset($data['nombre']) && (empty(trim($data['nombre'])) || strlen($data['nombre']) > 100)) {
        $errors[] = "Nombre no debe estar vacío y no debe exceder los 100 caracteres.";
    }
    
    if (isset($data['descripcion']) && strlen($data['descripcion']) > 1000) {
        $errors[] = "Descripción no debe exceder los 1000 caracteres.";
    }
    
    if (isset($data['duracion']) && (!is_numeric($data['duracion']) || $data['duracion'] <= 0)) {
        $errors[] = "Duración debe ser un número positivo.";
    }
    
    if (isset($data['distancia']) && (!is_numeric($data['distancia']) || $data['distancia'] <= 0)) {
        $errors[] = "Distancia debe ser un número positivo.";
    }
    
    if (isset($data['precio']) && (!is_numeric($data['precio']) || $data['precio'] <= 0)) {
        $errors[] = "Precio debe ser un número positivo.";
    }
    
    if (isset($data['plazas_disponibles']) && (!is_numeric($data['plazas_disponibles']) || $data['plazas_disponibles'] < 0)) {
        $errors[] = "Plazas disponibles debe ser un número no negativo.";
    }
    
    if (isset($data['fecha_salida']) && !validateDate($data['fecha_salida'])) {
        $errors[] = "Fecha de salida debe tener un formato válido (YYYY-MM-DD).";
    }
    
    if (isset($data['fecha_regreso']) && !validateDate($data['fecha_regreso'])) {
        $errors[] = "Fecha de regreso debe tener un formato válido (YYYY-MM-DD).";
    }
    
    // Validar que la fecha de regreso sea posterior a la fecha de salida
    if (isset($data['fecha_salida']) && isset($data['fecha_regreso']) && 
        validateDate($data['fecha_salida']) && validateDate($data['fecha_regreso'])) {
        $salida = new DateTime($data['fecha_salida']);
        $regreso = new DateTime($data['fecha_regreso']);
        
        if ($regreso <= $salida) {
            $errors[] = "La fecha de regreso debe ser posterior a la fecha de salida.";
        }
    }
    
    return $errors;


/**
 * Obtiene todos los registros
 */
function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM ruta";
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
        $sql = "SELECT * FROM ruta WHERE id = ?";
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
        
        $sql = "INSERT INTO ruta ($columnsStr) VALUES ($placeholdersStr)";
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
        $checkSql = "SELECT id FROM ruta WHERE id = ?";
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
        $sql = "UPDATE ruta SET $updatesStr WHERE id = ?";
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
        $checkSql = "SELECT id FROM ruta WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de eliminación
        $sql = "DELETE FROM ruta WHERE id = ?";
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
