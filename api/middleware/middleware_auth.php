<?php
require_once __DIR__ . '/../utils/auth_utils.php';

/**
 Middleware de autenticación
 Verifica que el usuario esté autenticado y tenga permisos para acceder al recurso
 */
function authenticateRequest($method, $path) {
    $authService = AuthService::getInstance();
    $segments = explode('/', trim($path, '/'));
    $resource = $segments[0] ?? '';
    $resourceId = $segments[1] ?? null;
    $action = $segments[2] ?? null;
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
        $userData = $authService->requireAuth($resource, $action, $resourceId);
        return $userData;
    } catch (Exception $e) {
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
