<?php
require_once __DIR__ . '/../utils/response_utils.php';

// Verificar si el archivo existe
if (!function_exists('sendJsonResponse')) {
    function sendJsonResponse($data, $code = 200) {
        header("Content-Type: application/json");
        http_response_code($code);
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }
}

// Enviar respuesta de prueba
sendJsonResponse([
    'status' => 'success',
    'message' => 'API funcionando correctamente',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP Development Server'
]);
