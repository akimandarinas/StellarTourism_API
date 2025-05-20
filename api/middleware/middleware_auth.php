<?php
require_once __DIR__ . '/../utils/auth_utils.php';

/**
 * Middleware de autenticación
 * Verifica que el usuario esté autenticado y tenga permisos para acceder al recurso
 * 
 * @param string $method Método HTTP
 * @param string $path Ruta solicitada
 * @return object|bool Datos del usuario o false si no está autenticado
 */
function authenticateRequest($method, $path) {
    // Obtener el servicio de autenticación
    $authService = AuthService::getInstance();
    
    // Extraer el recurso y la acción de la ruta
    $segments = explode('/', trim($path, '/'));
    $resource = $segments[0] ?? '';
    $resourceId = $segments[1] ?? null;
    $action = $segments[2] ?? null;
    
    // Determinar la acción basada en el método HTTP si no está especificada
    if (!$action) {
        switch ($method) {
            case 'GET':
                $action = $resourceId ? 'read' : 'list';
                break;
            case 'POST':
                $action = 'create';
                break;
            case 'PUT':
                $action = 'update';
                break;
            case 'DELETE':
                $action = 'delete';
                break;
            default:
                $action = 'read';
        }
    }
    
    try {
        // Requerir autenticación para el recurso
        $userData = $authService->requireAuth($resource, $action, $resourceId);
        return $userData;
    } catch (Exception $e) {
        // Manejar error de autenticación
        header('Content-Type: application/json');
        
        if ($e->getMessage() === "No autenticado") {
            http_response_code(401);
            echo json_encode([
                'status' => 'error',
                'message' => 'Se requiere autenticación para acceder a este recurso',
                'code' => 'authentication_required'
            ]);
        } else {
            http_response_code(403);
            echo json_encode([
                'status' => 'error',
                'message' => 'No tiene permisos para acceder a este recurso',
                'code' => 'permission_denied'
            ]);
        }
        
        return false;
    }
}
