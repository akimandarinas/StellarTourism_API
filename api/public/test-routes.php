<?php
// Mostrar errores en desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$phpSelf = $_SERVER['PHP_SELF'];
$scriptFilename = $_SERVER['SCRIPT_FILENAME'];
$documentRoot = $_SERVER['DOCUMENT_ROOT'];
$requestMethod = $_SERVER['REQUEST_METHOD'];
$queryString = $_SERVER['QUERY_STRING'] ?? '';

$basePath = dirname(__DIR__);

// Función para probar rutas de la API
function testApiRoutes() {
    global $basePath;
    
    $routesDir = $basePath . '/routes';
    if (!is_dir($routesDir)) {
        return [
            'status' => 'error',
            'message' => 'El directorio de rutas no existe'
        ];
    }
    
    $routeFiles = scandir($routesDir);
    $routes = [];
    
    foreach ($routeFiles as $file) {
        if ($file === '.' || $file === '..' || !is_file($routesDir . '/' . $file)) {
            continue;
        }
        
        $resourceName = pathinfo($file, PATHINFO_FILENAME);
        $routes[$resourceName] = [
            'file' => $file,
            'endpoints' => [
                'GET' => "/api/$resourceName",
                'GET_ID' => "/api/$resourceName/{id}",
                'POST' => "/api/$resourceName",
                'PUT' => "/api/$resourceName/{id}",
                'DELETE' => "/api/$resourceName/{id}"
            ]
        ];
        
        // Añadir endpoints personalizados para ciertos recursos
        if ($resourceName === 'destinos') {
            $routes[$resourceName]['endpoints']['GET_DESTACADOS'] = "/api/destinos/destacados";
            $routes[$resourceName]['endpoints']['GET_BUSCAR'] = "/api/destinos/buscar";
        } else if ($resourceName === 'naves') {
            $routes[$resourceName]['endpoints']['GET_DISPONIBLES'] = "/api/naves/disponibles";
        } else if ($resourceName === 'reservas') {
            $routes[$resourceName]['endpoints']['GET_USUARIO'] = "/api/reservas/usuario/{id}";
        }
    }
    
    return [
        'status' => 'success',
        'message' => 'Rutas de API detectadas',
        'routes' => $routes
    ];
}

// Función para probar controladores
function testControllers() {
    global $basePath;
    
    $controllersDir = $basePath . '/controllers';
    if (!is_dir($controllersDir)) {
        return [
            'status' => 'error',
            'message' => 'El directorio de controladores no existe'
        ];
    }
    
    $controllerFiles = scandir($controllersDir);
    $controllers = [];
    
    foreach ($controllerFiles as $file) {
        if ($file === '.' || $file === '..' || !is_file($controllersDir . '/' . $file)) {
            continue;
        }
        
        $controllerName = pathinfo($file, PATHINFO_FILENAME);
        
        // Leer el archivo para detectar métodos
        $content = file_get_contents($controllersDir . '/' . $file);
        preg_match_all('/function\s+(\w+)\s*\(/i', $content, $matches);
        
        $controllers[$controllerName] = [
            'file' => $file,
            'methods' => $matches[1] ?? []
        ];
    }
    
    return [
        'status' => 'success',
        'message' => 'Controladores detectados',
        'controllers' => $controllers
    ];
}

// Función para probar modelos
function testModels() {
    global $basePath;
    
    $modelsDir = $basePath . '/models';
    if (!is_dir($modelsDir)) {
        return [
            'status' => 'error',
            'message' => 'El directorio de modelos no existe'
        ];
    }
    
    $modelFiles = scandir($modelsDir);
    $models = [];
    
    foreach ($modelFiles as $file) {
        if ($file === '.' || $file === '..' || !is_file($modelsDir . '/' . $file)) {
            continue;
        }
        
        $modelName = pathinfo($file, PATHINFO_FILENAME);
        
        // Leer el archivo para detectar métodos
        $content = file_get_contents($modelsDir . '/' . $file);
        preg_match_all('/function\s+(\w+)\s*\(/i', $content, $matches);
        
        $models[$modelName] = [
            'file' => $file,
            'methods' => $matches[1] ?? []
        ];
    }
    
    return [
        'status' => 'success',
        'message' => 'Modelos detectados',
        'models' => $models
    ];
}

// Función para probar adaptadores
function testAdapters() {
    global $basePath;
    
    $adaptersDir = $basePath . '/adapters';
    if (!is_dir($adaptersDir)) {
        return [
            'status' => 'error',
            'message' => 'El directorio de adaptadores no existe'
        ];
    }
    
    $adapterFiles = scandir($adaptersDir);
    $adapters = [];
    
    foreach ($adapterFiles as $file) {
        if ($file === '.' || $file === '..' || !is_file($adaptersDir . '/' . $file)) {
            continue;
        }
        
        $adapterName = pathinfo($file, PATHINFO_FILENAME);
        
        // Leer el archivo para detectar métodos
        $content = file_get_contents($adaptersDir . '/' . $file);
        preg_match_all('/function\s+(\w+)\s*\(/i', $content, $matches);
        
        $adapters[$adapterName] = [
            'file' => $file,
            'methods' => $matches[1] ?? []
        ];
    }
    
    return [
        'status' => 'success',
        'message' => 'Adaptadores detectados',
        'adapters' => $adapters
    ];
}

// Función para probar la conexión a la base de datos
function testDatabaseConnection() {
    global $basePath;
    
    $dbConfigFile = $basePath . '/config/database.php';
    if (!file_exists($dbConfigFile)) {
        return [
            'status' => 'error',
            'message' => 'El archivo de configuración de la base de datos no existe'
        ];
    }
    
    require_once $dbConfigFile;
    
    try {
        $conn = getConnection();
        
        if ($conn) {
            // Probar una consulta simple
            $stmt = $conn->query("SELECT 1");
            
            if ($stmt) {
                // En PDO, usamos getAttribute para obtener información del servidor
                $serverVersion = $conn->getAttribute(PDO::ATTR_SERVER_VERSION);
                $serverInfo = $conn->getAttribute(PDO::ATTR_SERVER_INFO);
                
                return [
                    'status' => 'success',
                    'message' => 'Conexión a la base de datos exitosa',
                    'server_version' => $serverVersion,
                    'server_info' => $serverInfo,
                    'connection_info' => $conn->getAttribute(PDO::ATTR_CONNECTION_STATUS)
                ];
            } else {
                return [
                    'status' => 'error',
                    'message' => 'Error al ejecutar consulta de prueba',
                    'error' => implode(' ', $conn->errorInfo())
                ];
            }
        } else {
            return [
                'status' => 'error',
                'message' => 'No se pudo establecer conexión con la base de datos'
            ];
        }
    } catch (PDOException $e) {
        return [
            'status' => 'error',
            'message' => 'Error al conectar con la base de datos',
            'error' => $e->getMessage()
        ];
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Error general al conectar con la base de datos',
            'error' => $e->getMessage()
        ];
    }
}

// Función para probar procedimientos almacenados
function testStoredProcedures() {
    global $basePath;
    
    require_once $basePath . '/config/database.php';
    
    try {
        $conn = getConnection();
        
        if (!$conn) {
            return [
                'status' => 'error',
                'message' => 'No se pudo establecer conexión con la base de datos'
            ];
        }
        
        $stmt = $conn->query("SHOW PROCEDURE STATUS WHERE Db = DATABASE()");
        $procedures = [];
        
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $procedures[] = $row['Name'];
            }
        }
        
        $stmt = $conn->query("SHOW FUNCTION STATUS WHERE Db = DATABASE()");
        $functions = [];
        
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $functions[] = $row['Name'];
            }
        }
        
        return [
            'status' => 'success',
            'message' => 'Procedimientos y funciones detectados',
            'procedures' => $procedures,
            'functions' => $functions
        ];
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Error al consultar procedimientos almacenados',
            'error' => $e->getMessage()
        ];
    }
}

// Ejecutar pruebas
$apiRoutes = testApiRoutes();
$controllers = testControllers();
$models = testModels();
$adapters = testAdapters();
$dbConnection = testDatabaseConnection();
$storedProcedures = testStoredProcedures();

// Preparar respuesta
$response = [
    'status' => 'success',
    'message' => 'Pruebas de rutas completadas',
    'request_info' => [
        'request_uri' => $requestUri,
        'script_name' => $scriptName,
        'php_self' => $phpSelf,
        'script_filename' => $scriptFilename,
        'document_root' => $documentRoot,
        'request_method' => $requestMethod,
        'query_string' => $queryString
    ],
    'api_routes' => $apiRoutes,
    'controllers' => $controllers,
    'models' => $models,
    'adapters' => $adapters,
    'database_connection' => $dbConnection,
    'stored_procedures' => $storedProcedures,
    'timestamp' => date('Y-m-d H:i:s')
];

echo json_encode($response, JSON_PRETTY_PRINT);
