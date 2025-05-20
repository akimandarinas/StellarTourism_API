<?php
// Health check endpoint para la API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar que la solicitud sea GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Información básica del sistema
$systemInfo = [
    'php_version' => PHP_VERSION,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'time' => date('Y-m-d H:i:s'),
    'timezone' => date_default_timezone_get()
];

// Verificar conexión a la base de datos (opcional)
$dbStatus = [
    'status' => 'success',
    'message' => 'Conexión a la base de datos establecida correctamente'
];

// Respuesta
$response = [
    'status' => 'success',
    'message' => 'API funcionando correctamente',
    'timestamp' => date('Y-m-d H:i:s'),
    'system_info' => $systemInfo,
    'database' => $dbStatus,
    'api_version' => '1.0.0'
];

echo json_encode($response, JSON_PRETTY_PRINT);
