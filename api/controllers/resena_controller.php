<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Incluir archivos de configuración y modelo
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Resena.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';
require_once __DIR__ . '/../utils/validation_utils.php';

// Crear instancia de la base de datos
$database = new Database();
$db = $database->getConnection();

// Crear instancia del objeto Resena
$resena = new Resena($db);

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
            // Leer una sola reseña
            $id = $_GET['id'];
            
            // Validar ID
            if (!validateId($id)) {
                sendJsonResponse(array("message" => "ID de reseña inválido."), 400);
                exit();
            }
            
            $resena->ID = $id;
            
            if($resena->readOne()) {
                // Crear array con los datos de la reseña
                $resena_arr = array(
                    "id" => $resena->ID,
                    "usuario_id" => $resena->ID_USUARIO,
                    "destino_id" => $resena->ID_DESTINO,
                    "calificacion" => $resena->RATING,
                    "comentario" => $resena->COMENTARIO,
                    "fecha" => $resena->CREATED_AT,
                    "usuario_nombre" => $resena->USUARIO_NOMBRE,
                    "destino_nombre" => $resena->DESTINO_NOMBRE
                );
                
                // Establecer código de respuesta - 200 OK
                http_response_code(200);
                
                // Mostrar en formato JSON
                echo json_encode($resena_arr);
            } else {
                // No se encontró la reseña
                sendJsonResponse(array("message" => "Reseña no encontrada."), 404);
            }
        } 
        // Verificar si se proporciona un ID de destino
        else if(isset($_GET['destination_id'])) {
            // Leer reseñas por destino
            $destino_id = $_GET['destination_id'];
            
            // Validar destino_id
            if (!validateId($destino_id)) {
                sendJsonResponse(array("message" => "ID de destino inválido."), 400);
                exit();
            }
            
            $resena->ID_DESTINO = $destino_id;
            $stmt = $resena->readByDestination();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                // Array de reseñas
                $resenas_arr = array();
                $resenas_arr["records"] = array();
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    // Usar el adaptador para convertir los datos
                    $resena_item = ResenasAdapter::fromDatabase($row);
                    
                    array_push($resenas_arr["records"], $resena_item);
                }
                
                // Establecer código de respuesta - 200 OK
                http_response_code(200);
                
                // Mostrar en formato JSON
                echo json_encode($resenas_arr);
            } else {
                // No se encontraron reseñas
                sendJsonResponse(array("message" => "No se encontraron reseñas para este destino."), 404);
            }
        }
        // Verificar si se proporciona un ID de usuario
        else if(isset($_GET['user_id'])) {
            // Leer reseñas por usuario
            $usuario_id = $_GET['user_id'];
            
            // Validar usuario_id
            if (!validateId($usuario_id)) {
                sendJsonResponse(array("message" => "ID de usuario inválido."), 400);
                exit();
            }
            
            $resena->ID_USUARIO = $usuario_id;
            $stmt = $resena->readByUser();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                // Array de reseñas
                $resenas_arr = array();
                $resenas_arr["records"] = array();
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    // Usar el adaptador para convertir los datos
                    $resena_item = ResenasAdapter::fromDatabase($row);
                    
                    array_push($resenas_arr["records"], $resena_item);
                }
                
                // Establecer código de respuesta - 200 OK
                http_response_code(200);
                
                // Mostrar en formato JSON
                echo json_encode($resenas_arr);
            } else {
                // No se encontraron reseñas
                sendJsonResponse(array("message" => "No se encontraron reseñas para este usuario."), 404);
            }
        } else {
            // Leer todas las reseñas
            $stmt = $resena->read();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                // Array de reseñas
                $resenas_arr = array();
                $resenas_arr["records"] = array();
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    // Usar el adaptador para convertir los datos
                    $resena_item = ResenasAdapter::fromDatabase($row);
                    
                    array_push($resenas_arr["records"], $resena_item);
                }
                
                // Establecer código de respuesta - 200 OK
                http_response_code(200);
                
                // Mostrar en formato JSON
                echo json_encode($resenas_arr);
            } else {
                // No se encontraron reseñas
                sendJsonResponse(array("message" => "No se encontraron reseñas."), 404);
            }
        }
        break;
        
    case 'POST':
        // Crear una reseña
        // Obtener los datos enviados
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar datos
        $errors = validateResenaData($data);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        // Verificar si el usuario ya ha dejado una reseña para este destino
        $resena->ID_USUARIO = $data['ID_USUARIO'];
        $resena->ID_DESTINO = $data['ID_DESTINO'];
        
        if($resena->checkExisting()) {
            // Ya existe una reseña de este usuario para este destino
            sendJsonResponse(array("message" => "Ya has dejado una reseña para este destino."), 400);
            exit();
        }
        
        // Asignar valores a las propiedades de la reseña
        $resena->RATING = $data['RATING'];
        $resena->COMENTARIO = $data['COMENTARIO'] ?? '';
        $resena->VERIFICADO = $data['VERIFICADO'] ?? 'PENDIENTE';
        
        // Crear la reseña
        if($resena->create()) {
            // Establecer código de respuesta - 201 created
            sendJsonResponse(array("message" => "Reseña creada."), 201);
        } else {
            // Establecer código de respuesta - 503 service unavailable
            sendJsonResponse(array("message" => "No se pudo crear la reseña."), 503);
        }
        break;
        
    case 'PUT':
        // Actualizar una reseña
        // Obtener el ID de la reseña a actualizar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar ID
        if(!isset($data['ID']) || !validateId($data['ID'])) {
            sendJsonResponse(array("message" => "ID de reseña inválido o no proporcionado."), 400);
            exit();
        }
        
        // Validar datos
        $errors = validateResenaData($data, false);
        if (!empty($errors)) {
            sendJsonResponse(array("message" => "Errores de validación", "errors" => $errors), 400);
            exit();
        }
        
        // Asignar ID a actualizar
        $resena->ID = $data['ID'];
        
        // Asignar valores a las propiedades de la reseña
        if (isset($data['RATING'])) $resena->RATING = $data['RATING'];
        if (isset($data['COMENTARIO'])) $resena->COMENTARIO = $data['COMENTARIO'];
        if (isset($data['VERIFICADO'])) $resena->VERIFICADO = $data['VERIFICADO'];
        
        // Actualizar la reseña
        if($resena->update()) {
            // Establecer código de respuesta - 200 ok
            sendJsonResponse(array("message" => "Reseña actualizada."));
        } else {
            // Establecer código de respuesta - 503 service unavailable
            sendJsonResponse(array("message" => "No se pudo actualizar la reseña."), 503);
        }
        break;
        
    case 'DELETE':
        // Eliminar una reseña
        // Obtener el ID de la reseña a eliminar
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validar ID
        if(!isset($data['ID']) || !validateId($data['ID'])) {
            sendJsonResponse(array("message" => "ID de reseña inválido o no proporcionado."), 400);
            exit();
        }
        
        // Asignar ID a eliminar
        $resena->ID = $data['ID'];
        
        // Eliminar la reseña
        if($resena->delete()) {
            // Establecer código de respuesta - 200 ok
            sendJsonResponse(array("message" => "Reseña eliminada."));
        } else {
            // Establecer código de respuesta - 503 service unavailable
            sendJsonResponse(array("message" => "No se pudo eliminar la reseña."), 503);
        }
        break;
        
    default:
        // Método no permitido
        sendJsonResponse(array("message" => "Método no permitido."), 405);
        break;
}

// Función para validar datos de reseña
function validateResenaData($data, $isCreate = true) {
    $errors = [];
    
    // Validar campos requeridos para creación
    if ($isCreate) {
        if (!isset($data['ID_USUARIO']) || !validateId($data['ID_USUARIO'])) {
            $errors[] = "Usuario ID es requerido y debe ser un número entero positivo.";
        }
        
        if (!isset($data['ID_DESTINO']) || !validateId($data['ID_DESTINO'])) {
            $errors[] = "Destino ID es requerido y debe ser un número entero positivo.";
        }
        
        if (!isset($data['RATING']) || !is_numeric($data['RATING']) || $data['RATING'] < 1 || $data['RATING'] > 5) {
            $errors[] = "Rating es requerido y debe ser un número entre 1 y 5.";
        }
    }
    
    // Validar campos opcionales
    if (isset($data['RATING']) && (!is_numeric($data['RATING']) || $data['RATING'] < 1 || $data['RATING'] > 5)) {
        $errors[] = "Rating debe ser un número entre 1 y 5.";
    }
    
    if (isset($data['COMENTARIO']) && strlen($data['COMENTARIO']) > 1000) {
        $errors[] = "Comentario no debe exceder los 1000 caracteres.";
    }
    
    if (isset($data['VERIFICADO']) && !in_array($data['VERIFICADO'], ['PENDIENTE', 'VERIFICADO', 'RECHAZADO'])) {
        $errors[] = "Estado de verificación debe ser uno de: PENDIENTE, VERIFICADO, RECHAZADO.";
    }
    
    return $errors;


/**
 * Obtiene todos los registros
 */
function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM resena";
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
        $sql = "SELECT * FROM resena WHERE id = ?";
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
        
        $sql = "INSERT INTO resena ($columnsStr) VALUES ($placeholdersStr)";
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
        $checkSql = "SELECT id FROM resena WHERE id = ?";
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
        $sql = "UPDATE resena SET $updatesStr WHERE id = ?";
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
        $checkSql = "SELECT id FROM resena WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de eliminación
        $sql = "DELETE FROM resena WHERE id = ?";
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
