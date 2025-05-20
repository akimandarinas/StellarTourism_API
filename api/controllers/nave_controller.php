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
include_once '../models/Nave.php';

// Crear instancia de la base de datos
$database = new Database();
$db = $database->getConnection();

// Crear instancia del objeto Nave
$nave = new Nave($db);

// Obtener método de solicitud HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Procesar según el método
switch($method) {
    case 'GET':
        // Verificar si se proporciona un ID
        if(isset($_GET['id'])) {
            // Leer una sola nave
            $nave->ID = $_GET['id'];
            
            if($nave->readOne()) {
                // Crear array con los datos de la nave
                $nave_arr = array(
                    "ID" => $nave->ID,
                    "NOMBRE" => $nave->NOMBRE,
                    "CAPACIDAD" => $nave->CAPACIDAD,
                    "URL" => $nave->URL,
                    "ESPECIFICACIONES" => json_decode($nave->ESPECIFICACIONES),
                    "CARACTERISTICAS" => json_decode($nave->CARACTERISTICAS),
                    "VELOCIDAD" => $nave->VELOCIDAD,
                    "TAMAÑO" => $nave->TAMAÑO,
                    "PROPULSION" => $nave->PROPULSION,
                    "RANGO" => $nave->RANGO,
                    "IS_ACTIVE" => $nave->IS_ACTIVE,
                    "CREATED_AT" => $nave->CREATED_AT,
                    "UPDATED_AT" => $nave->UPDATED_AT
                );
                
                // Obtener imágenes de la nave
                $stmt_images = $nave->getImages();
                $images_arr = array();
                
                while($row = $stmt_images->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $image_item = array(
                        "ID" => $ID,
                        "URL_IMAGEN" => $URL_IMAGEN,
                        "ALT_TEXT" => $ALT_TEXT
                    );
                    
                    array_push($images_arr, $image_item);
                }
                
                $nave_arr["imagenes"] = $images_arr;
                
                // Obtener comodidades de la nave
                $stmt_amenities = $nave->getAmenities();
                $amenities_arr = array();
                
                while($row = $stmt_amenities->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $amenity_item = array(
                        "ID" => $ID,
                        "URL_IMAGEN" => $URL_IMAGEN,
                        "ALT_TEXT" => $ALT_TEXT
                    );
                    
                    array_push($amenities_arr, $amenity_item);
                }
                
                $nave_arr["comodidades"] = $amenities_arr;
                
                http_response_code(200);
                
                echo json_encode($nave_arr);
            } else {
                http_response_code(404);
                
                echo json_encode(array("message" => "Nave no encontrada."));
            }
        } else {
            // Leer todas las naves
            $stmt = $nave->read();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                // Array de naves
                $naves_arr = array();
                $naves_arr["records"] = array();
                
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $nave_item = array(
                        "ID" => $ID,
                        "NOMBRE" => $NOMBRE,
                        "CAPACIDAD" => $CAPACIDAD,
                        "VELOCIDAD" => $VELOCIDAD,
                        "TAMAÑO" => $TAMAÑO,
                        "PROPULSION" => $PROPULSION,
                        "RANGO" => $RANGO
                    );
                    
                    array_push($naves_arr["records"], $nave_item);
                }
                
                http_response_code(200);
                
                echo json_encode($naves_arr);
            } else {
                http_response_code(404);
                
                echo json_encode(array("message" => "No se encontraron naves."));
            }
        }
        break;
        
    case 'POST':
        // Crear una nave
        $data = json_decode(file_get_contents("php://input"));
        
        if(
            !empty($data->NOMBRE) &&
            !empty($data->CAPACIDAD) &&
            !empty($data->VELOCIDAD) &&
            !empty($data->TAMAÑO) &&
            !empty($data->PROPULSION)
        ) {
            $nave->NOMBRE = $data->NOMBRE;
            $nave->CAPACIDAD = $data->CAPACIDAD;
            $nave->URL = $data->URL;
            $nave->ESPECIFICACIONES = json_encode($data->ESPECIFICACIONES);
            $nave->CARACTERISTICAS = json_encode($data->CARACTERISTICAS);
            $nave->VELOCIDAD = $data->VELOCIDAD;
            $nave->TAMAÑO = $data->TAMAÑO;
            $nave->PROPULSION = $data->PROPULSION;
            $nave->RANGO = $data->RANGO;
            $nave->IS_ACTIVE = $data->IS_ACTIVE ?? 'SI';
            
            if($nave->create()) {
                http_response_code(201);
                
                echo json_encode(array("message" => "Nave creada."));
            } else {
                http_response_code(503);
                
                echo json_encode(array("message" => "No se pudo crear la nave."));
            }
        } else {
            http_response_code(400);
            
            echo json_encode(array("message" => "No se puede crear la nave. Datos incompletos."));
        }
        break;
        
    case 'PUT':
        // Actualizar una nave
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->ID)) {
            $nave->ID = $data->ID;
            
            $nave->NOMBRE = $data->NOMBRE;
            $nave->CAPACIDAD = $data->CAPACIDAD;
            $nave->URL = $data->URL;
            $nave->ESPECIFICACIONES = json_encode($data->ESPECIFICACIONES);
            $nave->CARACTERISTICAS = json_encode($data->CARACTERISTICAS);
            $nave->VELOCIDAD = $data->VELOCIDAD;
            $nave->TAMAÑO = $data->TAMAÑO;
            $nave->PROPULSION = $data->PROPULSION;
            $nave->RANGO = $data->RANGO;
            $nave->IS_ACTIVE = $data->IS_ACTIVE;
            
            if($nave->update()) {
                http_response_code(200);
                
                echo json_encode(array("message" => "Nave actualizada."));
            } else {
                http_response_code(503);
                
                echo json_encode(array("message" => "No se pudo actualizar la nave."));
            }
        } else {
            http_response_code(400);
            
            echo json_encode(array("message" => "No se puede actualizar la nave. ID no proporcionado."));
        }
        break;
        
    case 'DELETE':
        // Eliminar una nave
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->ID)) {
            $nave->ID = $data->ID;
            
            if($nave->delete()) {
                http_response_code(200);
                
                echo json_encode(array("message" => "Nave eliminada."));
            } else {
                http_response_code(503);
                
                echo json_encode(array("message" => "No se pudo eliminar la nave."));
            }
        } else {
            http_response_code(400);
            
            echo json_encode(array("message" => "No se puede eliminar la nave. ID no proporcionado."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Método no permitido."));
        break;


/**
 * Obtiene todos los registros
 */
function getAll() {
    global $conn;
    
    try {
        $sql = "SELECT * FROM nave";
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
        $sql = "SELECT * FROM nave WHERE id = ?";
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
        
        $sql = "INSERT INTO nave ($columnsStr) VALUES ($placeholdersStr)";
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
        $checkSql = "SELECT id FROM nave WHERE id = ?";
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
        $sql = "UPDATE nave SET $updatesStr WHERE id = ?";
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
        $checkSql = "SELECT id FROM nave WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de eliminación
        $sql = "DELETE FROM nave WHERE id = ?";
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
