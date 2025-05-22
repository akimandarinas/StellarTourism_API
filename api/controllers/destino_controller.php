<?php
require_once __DIR__ . '/../models/Destino.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';
require_once __DIR__ . '/../utils/cache_utils.php';

/**
 Controlador para gestionar destinos turísticos 
 */
class DestinoController {
    private $model;
    private $cache;
    
    
    public function __construct() {
        $this->model = new Destino();
        $this->cache = new CacheUtils('destinos', 3600); // Caché de 1 hora
    }
    
    public function getAll($request) {
        // Parámetros de paginación y filtrado
        $page = isset($request['page']) ? (int)$request['page'] : 1;
        $limit = isset($request['limit']) ? (int)$request['limit'] : 10;
        $limit = min($limit, 50); // Limitar a máximo 50 registros por página
        $offset = ($page - 1) * $limit;
        
        $cacheKey = "destinos_" . md5(json_encode([
            'page' => $page,
            'limit' => $limit,
            'filters' => $request
        ]));
        
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        // Construir filtros para la consulta
        $filters = [];
        $allowedFilters = ['tipo', 'precio_min', 'precio_max', 'duracion_min', 'duracion_max', 'popularidad'];
        
        foreach ($allowedFilters as $filter) {
            if (isset($request[$filter]) && $request[$filter] !== '') {
                $filters[$filter] = $request[$filter];
            }
        }
        
        $searchTerm = isset($request['q']) ? $request['q'] : null;
        
        $orderBy = isset($request['order_by']) ? $request['order_by'] : 'id';
        $orderDir = isset($request['order_dir']) && strtolower($request['order_dir']) === 'desc' ? 'DESC' : 'ASC';
        
        // Validar campo de ordenamiento para prevenir inyeccion SQL 
        $allowedOrderFields = ['id', 'nombre', 'precio', 'duracion', 'popularidad', 'created_at'];
        if (!in_array($orderBy, $allowedOrderFields)) {
            $orderBy = 'id';
        }
        
        try {
            $total = $this->model->countWithFilters($filters, $searchTerm);
            
            $destinos = $this->model->getAllWithFilters(
                $filters,
                $searchTerm,
                $orderBy,
                $orderDir,
                $limit,
                $offset
            );
            
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                // Eliminar campos innecesarios para la lista
                unset($destino['descripcion_larga']);
                unset($destino['metadata']);
            }
            
            $response = [
                'data' => $destinos,
                'meta' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ];
            
            $this->cache->set($cacheKey, $response);
            
            return sendJsonResponse($response);
        } catch (Exception $e) {
            error_log("Error en DestinoController->getAll: " . $e->getMessage());
            return sendErrorResponse("Error al obtener destinos: " . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        // Validar ID
        if (!$id || !is_numeric($id)) {
            return sendErrorResponse("ID de destino inválido", 400);
        }
        
        $cacheKey = "destino_" . $id;
        
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        try {
            $destino = $this->model->getById($id);
            
            if (!$destino) {
                return sendErrorResponse("Destino no encontrado", 404);
            }
            
            $destino['id'] = (int)$destino['id'];
            $destino['precio'] = (float)$destino['precio'];
            $destino['duracion'] = (int)$destino['duracion'];
            $destino['popularidad'] = (float)$destino['popularidad'];
           
            if (!empty($destino['imagen_principal'])) {
                $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
            }
            
            $destino['imagenes'] = $this->model->getImagesByDestinoId($id);
            foreach ($destino['imagenes'] as &$imagen) {
                $imagen['url'] = $this->optimizeImageUrl($imagen['url']);
            }
            
            $this->cache->set($cacheKey, $destino);
            
            return sendJsonResponse($destino);
        } catch (Exception $e) {
            error_log("Error en DestinoController->getById: " . $e->getMessage());
            return sendErrorResponse("Error al obtener destino: " . $e->getMessage(), 500);
        }
    }
    
  
    public function getPopulares($request) {
        $limit = isset($request['limit']) ? (int)$request['limit'] : 5;
        $limit = min($limit, 20); // Limitar a máximo 20 registros
        
        $cacheKey = "destinos_populares_" . $limit;
        
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        try {
            $destinos = $this->model->getPopulares($limit);
            
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                unset($destino['descripcion_larga']);
                unset($destino['metadata']);
            }
            
            $this->cache->set($cacheKey, $destinos, 7200);
            
            return sendJsonResponse($destinos);
        } catch (Exception $e) {
            error_log("Error en DestinoController->getPopulares: " . $e->getMessage());
            return sendErrorResponse("Error al obtener destinos populares: " . $e->getMessage(), 500);
        }
    }
    
 
    public function search($request) {
        if (!isset($request['q']) || trim($request['q']) === '') {
            return sendErrorResponse("Término de búsqueda requerido", 400);
        }
        
        $query = trim($request['q']);
        $page = isset($request['page']) ? (int)$request['page'] : 1;
        $limit = isset($request['limit']) ? (int)$request['limit'] : 10;
        $limit = min($limit, 50); // Limitar a máximo 50 registros por página
        $offset = ($page - 1) * $limit;
        
        $cacheKey = "destinos_search_" . md5($query . "_" . $page . "_" . $limit);
        
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        try {
            $total = $this->model->countSearchResults($query);
            
            $destinos = $this->model->search($query, $limit, $offset);
            
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                unset($destino['descripcion_larga']);
                unset($destino['metadata']);
            }
            
            // Construir respuesta con metadata
            $response = [
                'data' => $destinos,
                'meta' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ceil($total / $limit)
                ]
            ];
            
            // Guardar en caché con TTL más corto para búsquedas (30 minutos)
            $this->cache->set($cacheKey, $response, 1800);
            
            return sendJsonResponse($response);
        } catch (Exception $e) {
            error_log("Error en DestinoController->search: " . $e->getMessage());
            return sendErrorResponse("Error al buscar destinos: " . $e->getMessage(), 500);
        }
    }
    
    public function getRelacionados($id) {
        if (!$id || !is_numeric($id)) {
            return sendErrorResponse("ID de destino inválido", 400);
        }
        
        $cacheKey = "destinos_relacionados_" . $id;
        
        // Intentar obtener del caché
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        try {
            $destinos = $this->model->getRelacionados($id, 4);
            
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                unset($destino['descripcion_larga']);
                unset($destino['metadata']);
            }
            
            // Guardar en caché
            $this->cache->set($cacheKey, $destinos);
            
            return sendJsonResponse($destinos);
        } catch (Exception $e) {
            error_log("Error en DestinoController->getRelacionados: " . $e->getMessage());
            return sendErrorResponse("Error al obtener destinos relacionados: " . $e->getMessage(), 500);
        }
    }
    
    private function optimizeImageUrl($url) {
        if (strpos($url, '?') !== false && (
            strpos($url, 'w=') !== false || 
            strpos($url, 'h=') !== false || 
            strpos($url, 'q=') !== false
        )) {
            return $url;
        }
        
        if (strpos($url, 'http') === 0 && strpos($url, $_SERVER['HTTP_HOST']) === false) {
            return $url;
        }
        
        $separator = strpos($url, '?') !== false ? '&' : '?';
        return $url . $separator . 'q=80'; // Calidad 80% por defecto
    }
    
    public function invalidateCache($id = null) {
        if ($id) {
            // Invalidar caché de un destino específico
            $this->cache->delete("destino_" . $id);
            $this->cache->delete("destinos_relacionados_" . $id);
            
            // Invalidar listas que podrían contener este destino
            $this->cache->deletePattern("destinos_*");
            $this->cache->deletePattern("destinos_search_*");
        } else {
            // Invalidar todo el caché de destinos
            $this->cache->deletePattern("destino_*");
            $this->cache->deletePattern("destinos_*");
        }
        
        return sendJsonResponse(['success' => true, 'message' => 'Caché invalidado correctamente']);
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
        
        $columns = array_keys($data);
        $values = array_values($data);
        
        $placeholders = array_fill(0, count($columns), '?');
        
        $columnsStr = implode(', ', $columns);
        $placeholdersStr = implode(', ', $placeholders);
        
        $sql = "INSERT INTO destino ($columnsStr) VALUES ($placeholdersStr)";
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
        
        $checkSql = "SELECT id FROM destino WHERE id = ?";
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
        $sql = "UPDATE destino SET $updatesStr WHERE id = ?";
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

/**
 Elimina un registro
 */
function delete($id) {
    global $conn;
    
    try {
        // Verificar si el registro existe
        $checkSql = "SELECT id FROM destino WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        $sql = "DELETE FROM destino WHERE id = ?";
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
