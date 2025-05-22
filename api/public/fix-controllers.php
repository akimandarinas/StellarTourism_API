<?php
define('BASE_PATH', dirname(__DIR__));

require_once BASE_PATH . '/utils/controller_helper.php';
require_once BASE_PATH . '/utils/response_utils.php';

header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Función para corregir todos los controladores
function fixAllControllersEnhanced($controllersDir) {
    $results = [];
    
    if (!is_dir($controllersDir)) {
        return [
            'status' => 'error',
            'message' => 'El directorio de controladores no existe'
        ];
    }
    
    $controllerFiles = scandir($controllersDir);
    
    foreach ($controllerFiles as $file) {
        if ($file === '.' || $file === '..' || !is_file($controllersDir . '/' . $file)) {
            continue;
        }
        
        $controllerName = pathinfo($file, PATHINFO_FILENAME);
        $filePath = $controllersDir . '/' . $file;
        
        $content = file_get_contents($filePath);
        
        // Verificar si el controlador necesita correcciones
        $needsFix = false;
        
        if (strpos($content, 'response_utils.php') === false) {
            $needsFix = true;
            $content = "<?php\nrequire_once __DIR__ . '/../utils/response_utils.php';\n\n" . substr($content, 6);
        }
        
        $hasFunctionGetAll = preg_match('/function\s+getAll\s*\(/i', $content);
        $hasFunctionGetById = preg_match('/function\s+getById\s*\(/i', $content);
        $hasFunctionCreate = preg_match('/function\s+create\s*\(/i', $content);
        $hasFunctionUpdate = preg_match('/function\s+update\s*\(/i', $content);
        $hasFunctionDelete = preg_match('/function\s+delete\s*\(/i', $content);
        
        // Determinar el nombre de la tabla basado en el nombre del controlador
        $tableName = strtolower(preg_replace('/Controller$|_controller$/', '', $controllerName));
        
        // Añadir funciones faltantes
        $functionsToAdd = [];
        
        if (!$hasFunctionGetAll) {
            $needsFix = true;
            $functionsToAdd[] = generateGetAllFunction($tableName);
        }
        
        if (!$hasFunctionGetById) {
            $needsFix = true;
            $functionsToAdd[] = generateGetByIdFunction($tableName);
        }
        
        if (!$hasFunctionCreate) {
            $needsFix = true;
            $functionsToAdd[] = generateCreateFunction($tableName);
        }
        
        if (!$hasFunctionUpdate) {
            $needsFix = true;
            $functionsToAdd[] = generateUpdateFunction($tableName);
        }
        
        if (!$hasFunctionDelete) {
            $needsFix = true;
            $functionsToAdd[] = generateDeleteFunction($tableName);
        }
        
        if (!empty($functionsToAdd)) {
            // Encontrar la última llave de cierre
            $lastBracePos = strrpos($content, '}');
            
            if ($lastBracePos !== false) {
                $content = substr($content, 0, $lastBracePos) . "\n\n" . implode("\n\n", $functionsToAdd) . "\n" . substr($content, $lastBracePos);
            } else {
                $content .= "\n\n" . implode("\n\n", $functionsToAdd) . "\n";
            }
        }
        
        // Guardar los cambios si se necesitan correcciones
        if ($needsFix) {
            if (file_put_contents($filePath, $content)) {
                $results[$controllerName] = [
                    'status' => 'success',
                    'message' => 'Controlador corregido correctamente',
                    'functions_added' => count($functionsToAdd)
                ];
            } else {
                $results[$controllerName] = [
                    'status' => 'error',
                    'message' => 'Error al guardar las correcciones del controlador'
                ];
            }
        } else {
            $results[$controllerName] = [
                'status' => 'info',
                'message' => 'El controlador no necesita correcciones'
            ];
        }
    }
    
    return $results;
}

function generateGetAllFunction($tableName) {
    return "/**
  Obtiene todos los registros
 */
function getAll() {
    global \$conn;
    
    try {
        \$sql = \"SELECT * FROM $tableName\";
        \$result = \$conn->query(\$sql);
        
        \$items = [];
        if (\$result->num_rows > 0) {
            while (\$row = \$result->fetch_assoc()) {
                \$items[] = \$row;
            }
        }
        
        sendJsonResponse([
            'status' => 'success',
            'data' => \$items,
            'count' => count(\$items)
        ]);
    } catch (Exception \$e) {
        sendErrorResponse('Error al obtener los registros: ' . \$e->getMessage());
    }
}";
}

function generateGetByIdFunction($tableName) {
    return "/**
 * Obtiene un registro por su ID
 * 
 * @param int \$id ID del registro
 */
function getById(\$id) {
    global \$conn;
    
    try {
        \$sql = \"SELECT * FROM $tableName WHERE id = ?\";
        \$stmt = \$conn->prepare(\$sql);
        \$stmt->bind_param(\"i\", \$id);
        \$stmt->execute();
        \$result = \$stmt->get_result();
        
        if (\$result->num_rows > 0) {
            \$item = \$result->fetch_assoc();
            sendJsonResponse([
                'status' => 'success',
                'data' => \$item
            ]);
        } else {
            sendErrorResponse('Registro no encontrado', 404);
        }
    } catch (Exception \$e) {
        sendErrorResponse('Error al obtener el registro: ' . \$e->getMessage());
    }
}";
}

// Función para generar la función create
function generateCreateFunction($tableName) {
    return "/*
  Crea un nuevo registro
 */
function create(\$data) {
    global \$conn;
    
    try {
        if (empty(\$data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        \$columns = array_keys(\$data);
        \$values = array_values(\$data);
        
        \$placeholders = array_fill(0, count(\$columns), '?');
        
        \$columnsStr = implode(', ', \$columns);
        \$placeholdersStr = implode(', ', \$placeholders);
        
        \$sql = \"INSERT INTO $tableName (\$columnsStr) VALUES (\$placeholdersStr)\";
        \$stmt = \$conn->prepare(\$sql);
        
        \$types = '';
        foreach (\$values as \$value) {
            if (is_int(\$value)) {
                \$types .= 'i';
            } elseif (is_float(\$value)) {
                \$types .= 'd';
            } elseif (is_string(\$value)) {
                \$types .= 's';
            } else {
                \$types .= 's';
            }
        }
        
        // Bind parameters
        \$stmt->bind_param(\$types, ...\$values);
        
        if (\$stmt->execute()) {
            \$newId = \$stmt->insert_id;
            sendJsonResponse([
                'status' => 'success',
                'message' => 'Registro creado correctamente',
                'id' => \$newId
            ], 201);
        } else {
            sendErrorResponse('Error al crear el registro: ' . \$stmt->error);
        }
    } catch (Exception \$e) {
        sendErrorResponse('Error al crear el registro: ' . \$e->getMessage());
    }
}";
}

function generateUpdateFunction($tableName) {
    return "/**
 * Actualiza un registro existente
 */
function update(\$id, \$data) {
    global \$conn;
    
    try {
        // Validar datos
        if (empty(\$data)) {
            sendErrorResponse('No se proporcionaron datos', 400);
            return;
        }
        
        // Verificar si el registro existe
        \$checkSql = \"SELECT id FROM $tableName WHERE id = ?\";
        \$checkStmt = \$conn->prepare(\$checkSql);
        \$checkStmt->bind_param(\"i\", \$id);
        \$checkStmt->execute();
        \$checkResult = \$checkStmt->get_result();
        
        if (\$checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de actualización
        \$updates = [];
        \$values = [];
        
        foreach (\$data as \$column => \$value) {
            \$updates[] = \"\$column = ?\";
            \$values[] = \$value;
        }
        
        \$values[] = \$id; // Añadir el ID al final
        
        \$updatesStr = implode(', ', \$updates);
        \$sql = \"UPDATE $tableName SET \$updatesStr WHERE id = ?\";
        \$stmt = \$conn->prepare(\$sql);
        
        // Determinar los tipos de datos
        \$types = '';
        foreach (\$values as \$value) {
            if (is_int(\$value)) {
                \$types .= 'i';
            } elseif (is_float(\$value)) {
                \$types .= 'd';
            } elseif (is_string(\$value)) {
                \$types .= 's';
            } else {
                \$types .= 's';
            }
        }
        
        // Bind parameters
        \$stmt->bind_param(\$types, ...\$values);
        
        if (\$stmt->execute()) {
            sendJsonResponse([
                'status' => 'success',
                'message' => 'Registro actualizado correctamente',
                'affected_rows' => \$stmt->affected_rows
            ]);
        } else {
            sendErrorResponse('Error al actualizar el registro: ' . \$stmt->error);
        }
    } catch (Exception \$e) {
        sendErrorResponse('Error al actualizar el registro: ' . \$e->getMessage());
    }
}";
}

function generateDeleteFunction($tableName) {
    return "/*
 Elimina un registro
 */
function delete(\$id) {
    global \$conn;
    
    try {
        \$checkSql = \"SELECT id FROM $tableName WHERE id = ?\";
        \$checkStmt = \$conn->prepare(\$checkSql);
        \$checkStmt->bind_param(\"i\", \$id);
        \$checkStmt->execute();
        \$checkResult = \$checkStmt->get_result();
        
        if (\$checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        \$sql = \"DELETE FROM $tableName WHERE id = ?\";
        \$stmt = \$conn->prepare(\$sql);
        \$stmt->bind_param(\"i\", \$id);
        
        if (\$stmt->execute()) {
            sendJsonResponse([
                'status' => 'success',
                'message' => 'Registro eliminado correctamente',
                'affected_rows' => \$stmt->affected_rows
            ]);
        } else {
            sendErrorResponse('Error al eliminar el registro: ' . \$stmt->error);
        }
    } catch (Exception \$e) {
        sendErrorResponse('Error al eliminar el registro: ' . \$e->getMessage());
    }
}";
}

// Corregir todos los controladores
$controllersDir = BASE_PATH . '/controllers';
$results = fixAllControllersEnhanced($controllersDir);

echo json_encode([
    'status' => 'success',
    'message' => 'Proceso de corrección de controladores completado',
    'results' => $results
], JSON_PRETTY_PRINT);
