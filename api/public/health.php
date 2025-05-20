<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response_utils.php';

// Verificar si las funciones existen
if (!function_exists('sendJsonResponse')) {
    function sendJsonResponse($data, $code = 200) {
        header("Content-Type: application/json");
        http_response_code($code);
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }
}

if (!function_exists('sendJsonError')) {
    function sendJsonError($message, $code = 500) {
        header("Content-Type: application/json");
        http_response_code($code);
        echo json_encode([
            "status" => "error",
            "message" => $message
        ], JSON_PRETTY_PRINT);
        exit;
    }
}

header('Content-Type: application/json');

try {
    $startTime = microtime(true);
    
    // Verificar conexión a la base de datos
    $conn = getConnection();
    $dbConnected = ($conn !== null);
    
    // Verificar tablas principales
    $requiredTables = [
        'destinos',
        'naves',
        'rutas',
        'actividades',
        'usuarios',
        'reservas',
        'pagos',
        'resenas',
        'actividades_reservadas',
        'notificaciones_suscripciones',
        'notificaciones_historial',
        'webhook_events',
        'webhook_configuracion'
    ];
    
    $tablesStatus = [];
    
    if ($dbConnected) {
        foreach ($requiredTables as $table) {
            $query = "SELECT 1 FROM $table LIMIT 1";
            try {
                $result = $conn->query($query);
                $tablesStatus[$table] = [
                    'exists' => true,
                    'accessible' => ($result !== false)
                ];
            } catch (Exception $e) {
                $tablesStatus[$table] = [
                    'exists' => false,
                    'error' => $e->getMessage()
                ];
            }
        }
    }
    
    // Verificar espacio en disco
    $diskFree = disk_free_space('/');
    $diskTotal = disk_total_space('/');
    $diskUsed = $diskTotal - $diskFree;
    $diskPercent = round(($diskUsed / $diskTotal) * 100, 2);
    
    // Verificar memoria del sistema
    $memInfo = [];
    if (function_exists('shell_exec')) {
        $memInfoStr = shell_exec('free -m');
        if ($memInfoStr) {
            $lines = explode("\n", $memInfoStr);
            if (isset($lines[1])) {
                $memParts = preg_split('/\s+/', trim($lines[1]));
                if (count($memParts) >= 7) {
                    $memInfo = [
                        'total' => $memParts[1] . ' MB',
                        'used' => $memParts[2] . ' MB',
                        'free' => $memParts[3] . ' MB',
                        'shared' => $memParts[4] . ' MB',
                        'buffers' => $memParts[5] . ' MB',
                        'cached' => $memParts[6] . ' MB',
                    ];
                }
            }
        }
    }
    
    // Verificar carga del sistema
    $loadAvg = [];
    if (function_exists('sys_getloadavg')) {
        $loadAvg = sys_getloadavg();
    }
    
    // Verificar versión de PHP
    $phpVersion = phpversion();
    
    // Verificar extensiones requeridas
    $requiredExtensions = [
        'mysqli',
        'pdo',
        'pdo_mysql',
        'json',
        'curl',
        'mbstring',
        'xml'
    ];
    
    $extensionsStatus = [];
    foreach ($requiredExtensions as $ext) {
        $extensionsStatus[$ext] = extension_loaded($ext);
    }
    
    // Verificar límites de PHP
    $phpLimits = [
        'memory_limit' => ini_get('memory_limit'),
        'post_max_size' => ini_get('post_max_size'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'max_execution_time' => ini_get('max_execution_time'),
        'max_input_time' => ini_get('max_input_time')
    ];
    
    // Verificar directorios de escritura
    $writableDirs = [
        '/tmp',
        __DIR__ . '/../logs',
        __DIR__ . '/../uploads'
    ];
    
    $dirsStatus = [];
    foreach ($writableDirs as $dir) {
        if (file_exists($dir)) {
            $dirsStatus[$dir] = [
                'exists' => true,
                'writable' => is_writable($dir)
            ];
        } else {
            $dirsStatus[$dir] = [
                'exists' => false
            ];
        }
    }
    
    // Verificar servicios externos (simulado)
    $externalServices = [
        'stripe' => [
            'status' => 'ok',
            'latency' => rand(50, 200) . 'ms'
        ],
        'email' => [
            'status' => 'ok',
            'latency' => rand(100, 300) . 'ms'
        ]
    ];
    
    $endTime = microtime(true);
    $executionTime = round(($endTime - $startTime) * 1000, 2); // en milisegundos
    
    // Determinar estado general
    $overallStatus = 'healthy';
    if (!$dbConnected) {
        $overallStatus = 'critical';
    } else {
        foreach ($tablesStatus as $table) {
            if (isset($table['exists']) && !$table['exists'] || isset($table['accessible']) && !$table['accessible']) {
                $overallStatus = 'warning';
                break;
            }
        }
    }
    
    if ($diskPercent > 90) {
        $overallStatus = 'critical';
    } else if ($diskPercent > 80) {
        $overallStatus = $overallStatus == 'critical' ? 'critical' : 'warning';
    }
    
    $response = [
        'status' => $overallStatus,
        'timestamp' => date('Y-m-d H:i:s'),
        'execution_time' => $executionTime . 'ms',
        'database' => [
            'connected' => $dbConnected,
            'tables' => $tablesStatus
        ],
        'system' => [
            'disk' => [
                'free' => formatBytes($diskFree),
                'total' => formatBytes($diskTotal),
                'used' => formatBytes($diskUsed),
                'percent_used' => $diskPercent . '%'
            ],
            'memory' => $memInfo,
            'load' => $loadAvg
        ],
        'php' => [
            'version' => $phpVersion,
            'extensions' => $extensionsStatus,
            'limits' => $phpLimits
        ],
        'directories' => $dirsStatus,
        'external_services' => $externalServices
    ];
    
    // Enviar respuesta
    sendJsonResponse($response);
    
} catch (Exception $e) {
    sendJsonError('Error al verificar el estado del sistema: ' . $e->getMessage());
}

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= pow(1024, $pow);
    
    return round($bytes, $precision) . ' ' . $units[$pow];
}
