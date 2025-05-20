<?php
/**
 * Middleware para manejar CORS (Cross-Origin Resource Sharing)
 * 
 * Este middleware configura los encabezados necesarios para permitir
 * solicitudes desde orígenes específicos.
 */

// Cargar configuración
require_once __DIR__ . '/../config/config.php';

// Lista de orígenes permitidos
$allowedOrigins = [];

// Cargar orígenes desde la configuración
$configOrigins = getenv('ALLOWED_ORIGINS');
if ($configOrigins) {
    $allowedOrigins = explode(',', $configOrigins);
} else {
    // Orígenes predeterminados para desarrollo
    $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:5173'
    ];
}

// Añadir el origen de producción si está definido
$prodOrigin = getenv('PRODUCTION_ORIGIN');
if ($prodOrigin) {
    $allowedOrigins[] = $prodOrigin;
}

// Obtener el origen de la solicitud
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Verificar si el origen está permitido
$allowOrigin = '';
if (in_array($origin, $allowedOrigins)) {
    $allowOrigin = $origin;
} else if (getenv('APP_ENV') === 'development' || getenv('APP_ENV') === 'local') {
    // En desarrollo, permitir localhost con cualquier puerto
    if (preg_match('/^https?:\/\/localhost(:\d+)?$/', $origin) ||
        preg_match('/^https?:\/\/127\.0\.0\.1(:\d+)?$/', $origin)) {
        $allowOrigin = $origin;
    }
}

// Configurar encabezados CORS
if ($allowOrigin) {
    header("Access-Control-Allow-Origin: $allowOrigin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Client-Version, X-Client-Platform, X-CSRF-Token");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // 24 horas
} else {
    // Para orígenes no permitidos, solo permitir métodos seguros
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
}

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responder con 200 OK sin contenido
    http_response_code(200);
    exit;
}
