<?php
require_once __DIR__ . '/../models/Destino.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';
require_once __DIR__ . '/../utils/cache_utils.php';

/**
 * Controlador para gestionar destinos turísticos espaciales
 */
class DestinoController {
    private $model;
    private $cache;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->model = new Destino();
        $this->cache = new CacheUtils('destinos', 3600); // Caché de 1 hora para destinos
    }
    
    /**
     * Obtiene todos los destinos con paginación y filtrado optimizado
     */
    public function getAll($request) {
        // Parámetros de paginación y filtrado
        $page = isset($request['page']) ? (int)$request['page'] : 1;
        $limit = isset($request['limit']) ? (int)$request['limit'] : 10;
        $limit = min($limit, 50); // Limitar a máximo 50 registros por página
        $offset = ($page - 1) * $limit;
        
        // Construir clave de caché basada en parámetros
        $cacheKey = "destinos_" . md5(json_encode([
            'page' => $page,
            'limit' => $limit,
            'filters' => $request
        ]));
        
        // Intentar obtener del caché
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
        
        // Búsqueda por término
        $searchTerm = isset($request['q']) ? $request['q'] : null;
        
        // Ordenamiento
        $orderBy = isset($request['order_by']) ? $request['order_by'] : 'id';
        $orderDir = isset($request['order_dir']) && strtolower($request['order_dir']) === 'desc' ? 'DESC' : 'ASC';
        
        // Validar campo de ordenamiento para prevenir SQL injection
        $allowedOrderFields = ['id', 'nombre', 'precio', 'duracion', 'popularidad', 'created_at'];
        if (!in_array($orderBy, $allowedOrderFields)) {
            $orderBy = 'id';
        }
        
        try {
            // Obtener total de registros para metadata
            $total = $this->model->countWithFilters($filters, $searchTerm);
            
            // Obtener destinos con paginación y filtros
            $destinos = $this->model->getAllWithFilters(
                $filters,
                $searchTerm,
                $orderBy,
                $orderDir,
                $limit,
                $offset
            );
            
            // Optimizar datos para respuesta
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                // Optimizar URLs de imágenes
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                // Eliminar campos innecesarios para la lista
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
            
            // Guardar en caché
            $this->cache->set($cacheKey, $response);
            
            return sendJsonResponse($response);
        } catch (Exception $e) {
            error_log("Error en DestinoController->getAll: " . $e->getMessage());
            return sendErrorResponse("Error al obtener destinos: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Obtiene un destino por ID con caché optimizado
     */
    public function getById($id) {
        // Validar ID
        if (!$id || !is_numeric($id)) {
            return sendErrorResponse("ID de destino inválido", 400);
        }
        
        $cacheKey = "destino_" . $id;
        
        // Intentar obtener del caché
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        try {
            $destino = $this->model->getById($id);
            
            if (!$destino) {
                return sendErrorResponse("Destino no encontrado", 404);
            }
            
            // Convertir tipos de datos
            $destino['id'] = (int)$destino['id'];
            $destino['precio'] = (float)$destino['precio'];
            $destino['duracion'] = (int)$destino['duracion'];
            $destino['popularidad'] = (float)$destino['popularidad'];
            
            // Optimizar URLs de imágenes
            if (!empty($destino['imagen_principal'])) {
                $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
            }
            
            // Obtener imágenes adicionales
            $destino['imagenes'] = $this->model->getImagesByDestinoId($id);
            foreach ($destino['imagenes'] as &$imagen) {
                $imagen['url'] = $this->optimizeImageUrl($imagen['url']);
            }
            
            // Guardar en caché
            $this->cache->set($cacheKey, $destino);
            
            return sendJsonResponse($destino);
        } catch (Exception $e) {
            error_log("Error en DestinoController->getById: " . $e->getMessage());
            return sendErrorResponse("Error al obtener destino: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Obtiene destinos populares con caché optimizado
     */
    public function getPopulares($request) {
        $limit = isset($request['limit']) ? (int)$request['limit'] : 5;
        $limit = min($limit, 20); // Limitar a máximo 20 registros
        
        $cacheKey = "destinos_populares_" . $limit;
        
        // Intentar obtener del caché
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        try {
            $destinos = $this->model->getPopulares($limit);
            
            // Optimizar datos para respuesta
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                // Optimizar URLs de imágenes
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                // Eliminar campos innecesarios para la lista
                unset($destino['descripcion_larga']);
                unset($destino['metadata']);
            }
            
            // Guardar en caché con TTL más largo (2 horas)
            $this->cache->set($cacheKey, $destinos, 7200);
            
            return sendJsonResponse($destinos);
        } catch (Exception $e) {
            error_log("Error en DestinoController->getPopulares: " . $e->getMessage());
            return sendErrorResponse("Error al obtener destinos populares: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Busca destinos por término con caché optimizado
     */
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
        
        // Intentar obtener del caché
        $cachedData = $this->cache->get($cacheKey);
        if ($cachedData !== null) {
            return sendJsonResponse($cachedData);
        }
        
        try {
            // Obtener total de resultados
            $total = $this->model->countSearchResults($query);
            
            // Obtener resultados con paginación
            $destinos = $this->model->search($query, $limit, $offset);
            
            // Optimizar datos para respuesta
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                // Optimizar URLs de imágenes
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                // Eliminar campos innecesarios para la lista
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
    
    /**
     * Obtiene destinos relacionados con caché optimizado
     */
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
            
            // Optimizar datos para respuesta
            foreach ($destinos as &$destino) {
                // Convertir tipos de datos
                $destino['id'] = (int)$destino['id'];
                $destino['precio'] = (float)$destino['precio'];
                $destino['duracion'] = (int)$destino['duracion'];
                $destino['popularidad'] = (float)$destino['popularidad'];
                
                // Optimizar URLs de imágenes
                if (!empty($destino['imagen_principal'])) {
                    $destino['imagen_principal'] = $this->optimizeImageUrl($destino['imagen_principal']);
                }
                
                // Eliminar campos innecesarios para la lista
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
    
    /**
     * Optimiza la URL de una imagen para diferentes tamaños
     */
    private function optimizeImageUrl($url) {
        // Si la URL ya contiene parámetros de optimización, devolverla tal cual
        if (strpos($url, '?') !== false && (
            strpos($url, 'w=') !== false || 
            strpos($url, 'h=') !== false || 
            strpos($url, 'q=') !== false
        )) {
            return $url;
        }
        
        // Si es una URL externa, devolverla tal cual
        if (strpos($url, 'http') === 0 && strpos($url, $_SERVER['HTTP_HOST']) === false) {
            return $url;
        }
        
        // Añadir parámetros de optimización
        $separator = strpos($url, '?') !== false ? '&' : '?';
        return $url . $separator . 'q=80'; // Calidad 80% por defecto
    }
    
    /**
     * Invalida el caché de un destino específico
     */
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
        $checkSql = "SELECT id FROM destino WHERE id = ?";
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
        $checkSql = "SELECT id FROM destino WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            sendErrorResponse('Registro no encontrado', 404);
            return;
        }
        
        // Preparar la consulta de eliminación
        $sql = "DELETE FROM destino WHERE id = ?";
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
