<?php
require_once __DIR__ . '/../utils/response_utils.php';

header('Content-Type: application/json');

try {
    // Definir la estructura esperada de la API
    $expectedStructure = [
        'controllers' => [
            'destino_controller.php',
            'nave_controller.php',
            'ruta_controller.php',
            'actividad_controller.php',
            'usuario_controller.php',
            'reserva_controller.php',
            'pago_controller.php',
            'resena_controller.php',
            'actividad_reservada_controller.php',
            'auth_controller.php'
        ],
        'models' => [
            'ModelBase.php',
            'Destino.php',
            'Nave.php',
            'Ruta.php',
            'Actividad.php',
            'Usuario.php',
            'Reserva.php',
            'Pago.php',
            'Resena.php',
            'ActividadReservada.php'
        ],
        'adapters' => [
            'DestinosAdapter.php',
            'NavesAdapter.php',
            'RutasAdapter.php',
            'ActividadesAdapter.php',
            'UsuariosAdapter.php',
            'ReservasAdapter.php',
            'PagosAdapter.php',
            'ResenasAdapter.php',
            'ActividadesReservadasAdapter.php'
        ],
        'routes' => [
            'destinos.php',
            'naves.php',
            'rutas.php',
            'actividades.php',
            'usuarios.php',
            'reservas.php',
            'pagos.php',
            'resenas.php'
        ],
        'utils' => [
            'response_utils.php',
            'validation_utils.php',
            'auth_utils.php',
            'utilidades_stripe.php',
            'utilidades_notificacion.php',
            'cache_utils.php',
            'controller_helper.php',
            'error_handler.php'
        ],
        'middleware' => [
            'middleware_auth.php',
            'rate_limiter.php',
            'input_validator.php',
            'cors.php'
        ],
        'config' => [
            'config.php',
            'database.php',
            'env_loader.php'
        ],
        'public' => [
            'index.php',
            'health.php',
            'test.php',
            'phpinfo.php',
            'init-db.php',
            'check-db-structure.php',
            'repair-tables.php',
            'db-adapter.php',
            'test-routes.php',
            'fix-controllers.php',
            'check-api-structure.php',
            'diagnostico.php'
        ]
    ];
    
    // Verificar la estructura actual
    $basePath = dirname(__DIR__);
    $actualStructure = [];
    
    // Verificar directorios y archivos
    foreach ($expectedStructure as $directory => $files) {
        $dirPath = $basePath . '/' . $directory;
        
        if (!is_dir($dirPath)) {
            $actualStructure[$directory] = [
                'exists' => false,
                'files' => []
            ];
            continue;
        }
        
        $actualStructure[$directory] = [
            'exists' => true,
            'files' => []
        ];
        
        // Verificar archivos en el directorio
        $dirFiles = scandir($dirPath);
        foreach ($files as $file) {
            $filePath = $dirPath . '/' . $file;
            $actualStructure[$directory]['files'][$file] = [
                'exists' => file_exists($filePath),
                'size' => file_exists($filePath) ? filesize($filePath) : 0,
                'modified' => file_exists($filePath) ? date('Y-m-d H:i:s', filemtime($filePath)) : null
            ];
        }
        
        // Verificar archivos adicionales no esperados
        foreach ($dirFiles as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            if (!in_array($file, $files) && is_file($dirPath . '/' . $file)) {
                $actualStructure[$directory]['additional_files'][] = $file;
            }
        }
    }
    
    // Verificar endpoints de la API
    $apiEndpoints = [
        'destinos' => [
            'GET /api/destinos' => 'Obtener todos los destinos',
            'GET /api/destinos/{id}' => 'Obtener un destino específico',
            'POST /api/destinos' => 'Crear un nuevo destino',
            'PUT /api/destinos/{id}' => 'Actualizar un destino existente',
            'DELETE /api/destinos/{id}' => 'Eliminar un destino'
        ],
        'naves' => [
            'GET /api/naves' => 'Obtener todas las naves',
            'GET /api/naves/{id}' => 'Obtener una nave específica',
            'POST /api/naves' => 'Crear una nueva nave',
            'PUT /api/naves/{id}' => 'Actualizar una nave existente',
            'DELETE /api/naves/{id}' => 'Eliminar una nave'
        ],
        'rutas' => [
            'GET /api/rutas' => 'Obtener todas las rutas',
            'GET /api/rutas/{id}' => 'Obtener una ruta específica',
            'POST /api/rutas' => 'Crear una nueva ruta',
            'PUT /api/rutas/{id}' => 'Actualizar una ruta existente',
            'DELETE /api/rutas/{id}' => 'Eliminar una ruta'
        ],
        'actividades' => [
            'GET /api/actividades' => 'Obtener todas las actividades',
            'GET /api/actividades/{id}' => 'Obtener una actividad específica',
            'GET /api/actividades/destino/{destino_id}' => 'Obtener actividades por destino',
            'POST /api/actividades' => 'Crear una nueva actividad',
            'PUT /api/actividades/{id}' => 'Actualizar una actividad existente',
            'DELETE /api/actividades/{id}' => 'Eliminar una actividad'
        ],
        'usuarios' => [
            'GET /api/usuarios' => 'Obtener todos los usuarios',
            'GET /api/usuarios/{id}' => 'Obtener un usuario específico',
            'POST /api/usuarios' => 'Crear un nuevo usuario',
            'PUT /api/usuarios/{id}' => 'Actualizar un usuario existente',
            'DELETE /api/usuarios/{id}' => 'Eliminar un usuario'
        ],
        'reservas' => [
            'GET /api/reservas' => 'Obtener todas las reservas',
            'GET /api/reservas/{id}' => 'Obtener una reserva específica',
            'GET /api/reservas/usuario/{usuario_id}' => 'Obtener reservas por usuario',
            'POST /api/reservas' => 'Crear una nueva reserva',
            'PUT /api/reservas/{id}' => 'Actualizar una reserva existente',
            'DELETE /api/reservas/{id}' => 'Eliminar una reserva'
        ],
        'pagos' => [
            'GET /api/pagos' => 'Obtener todos los pagos',
            'GET /api/pagos/{id}' => 'Obtener un pago específico',
            'GET /api/pagos/reserva/{reserva_id}' => 'Obtener pagos por reserva',
            'POST /api/pagos' => 'Crear un nuevo pago',
            'PUT /api/pagos/{id}' => 'Actualizar un pago existente',
            'DELETE /api/pagos/{id}' => 'Eliminar un pago'
        ],
        'resenas' => [
            'GET /api/resenas' => 'Obtener todas las reseñas',
            'GET /api/resenas/{id}' => 'Obtener una reseña específica',
            'GET /api/resenas/destino/{destino_id}' => 'Obtener reseñas por destino',
            'GET /api/resenas/usuario/{usuario_id}' => 'Obtener reseñas por usuario',
            'POST /api/resenas' => 'Crear una nueva reseña',
            'PUT /api/resenas/{id}' => 'Actualizar una reseña existente',
            'DELETE /api/resenas/{id}' => 'Eliminar una reseña'
        ],
        'auth' => [
            'POST /api/auth/login' => 'Iniciar sesión',
            'POST /api/auth/register' => 'Registrar un nuevo usuario',
            'POST /api/auth/logout' => 'Cerrar sesión',
            'GET /api/auth/profile' => 'Obtener perfil del usuario autenticado',
            'PUT /api/auth/profile' => 'Actualizar perfil del usuario autenticado',
            'POST /api/auth/password/reset' => 'Solicitar restablecimiento de contraseña',
            'POST /api/auth/password/change' => 'Cambiar contraseña'
        ]
    ];
    
    $recommendations = [];
    
    // Verificar directorios faltantes
    foreach ($actualStructure as $directory => $info) {
        if (!$info['exists']) {
            $recommendations[] = "Crear el directorio '$directory'";
        }
    }
    
    // Verificar archivos faltantes
    foreach ($actualStructure as $directory => $info) {
        if (!$info['exists']) {
            continue;
        }
        
        foreach ($info['files'] as $file => $fileInfo) {
            if (!$fileInfo['exists']) {
                $recommendations[] = "Crear el archivo '$directory/$file'";
            }
        }
    }
    
    
    function verificarEndpointsReservas() {
        $resultados = [];
        $baseUrl = getBaseUrl();
        
        $url = $baseUrl . '/api/controllers/reserva_controller.php';
        $response = realizarPeticion($url);
        $resultados['listado'] = [
            'url' => $url,
            'status' => $response ? 'success' : 'error',
            'data' => $response
        ];
        
        // Verificar endpoint de estadísticas
        $url = $baseUrl . '/api/controllers/reserva_controller.php?action=stats';
        $response = realizarPeticion($url);
        $resultados['estadisticas'] = [
            'url' => $url,
            'status' => $response ? 'success' : 'error',
            'data' => $response
        ];
        
        $url = $baseUrl . '/api/controllers/reserva_controller.php?action=disponibilidad&ruta_id=1&fecha=2025-07-15&pasajeros=2';
        $response = realizarPeticion($url);
        $resultados['disponibilidad'] = [
            'url' => $url,
            'status' => $response ? 'success' : 'error',
            'data' => $response
        ];
        
        // Verificar endpoint de reservas por usuario
        $url = $baseUrl . '/api/controllers/reserva_controller.php?usuario_id=1';
        $response = realizarPeticion($url);
        $resultados['por_usuario'] = [
            'url' => $url,
            'status' => $response ? 'success' : 'error',
            'data' => $response
        ];
        
        return $resultados;
    }

    function realizarPeticion($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        }
        
        return false;
    }

    function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $script = dirname($_SERVER['SCRIPT_NAME']);
        
        return $protocol . '://' . $host . $script;
    }

    $verificaciones = [];
    $verificaciones['endpoints_reservas'] = verificarEndpointsReservas();
    
    $response = [
        'status' => 'success',
        'message' => 'Estructura de la API verificada',
        'structure' => $actualStructure,
        'api_endpoints' => $apiEndpoints,
        'recommendations' => $recommendations,
        'verificaciones' => $verificaciones
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    sendErrorResponse('Error al verificar la estructura de la API: ' . $e->getMessage());
}
?>
