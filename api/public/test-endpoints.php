<?php
// Establecer encabezados para JSON y CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Función para generar datos de ejemplo para destinos
function generateDestinosData() {
    $destinos = [];
    
    $nombres = [
        'Luna', 'Marte', 'Europa', 'Titán', 'Encélado', 
        'Estación Orbital Alpha', 'Colonia Lunar Armstrong', 
        'Base Marciana Olympus', 'Anillos de Saturno',
        'Io', 'Calisto', 'Ganímedes', 'Plutón', 'Ceres'
    ];
    
    $tipos = ['planeta', 'luna', 'estación', 'colonia', 'asteroide'];
    $atmosferas = ['ninguna', 'tenue', 'densa', 'tóxica', 'respirable'];
    $niveles_peligro = ['bajo', 'medio', 'alto', 'extremo'];
    
    for ($i = 1; $i <= 10; $i++) {
        $nombre = $nombres[array_rand($nombres)];
        $tipo = $tipos[array_rand($tipos)];
        
        $destino = [
            'id' => $i,
            'nombre' => "$nombre " . ($i > 1 ? $i : ''),
            'descripcion' => "Destino turístico espacial en $nombre. Experimenta la aventura de visitar uno de los lugares más impresionantes del sistema solar.",
            'tipo' => $tipo,
            'precio' => rand(1000, 10000) * 100,
            'duracion' => rand(3, 30),
            'distancia' => rand(100, 10000) * 1000000,
            'temperatura' => rand(-200, 100),
            'gravedad' => rand(1, 30) / 10,
            'atmosfera' => $atmosferas[array_rand($atmosferas)],
            'nivel_radiacion' => rand(1, 100) / 10,
            'nivel_peligro' => $niveles_peligro[array_rand($niveles_peligro)],
            'imagen_principal' => "https://stellar-tourism.example.com/images/destinos/$i.jpg",
            'popularidad' => rand(1, 50) / 10,
            'created_at' => date('Y-m-d H:i:s', time() - rand(0, 365 * 24 * 60 * 60))
        ];
        
        $destinos[] = $destino;
    }
    
    return [
        'data' => $destinos,
        'meta' => [
            'total' => count($destinos),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Función para generar datos de ejemplo para naves
function generateNavesData() {
    $naves = [];
    
    $nombres = [
        'Voyager', 'Pathfinder', 'Discovery', 'Enterprise', 'Atlantis', 
        'Orion', 'Phoenix', 'Odyssey', 'Challenger', 'Intrepid'
    ];
    
    $tipos = ['turismo', 'carga', 'exploración', 'militar'];
    $estados = ['activa', 'mantenimiento', 'retirada'];
    
    for ($i = 1; $i <= 10; $i++) {
        $nombre = $nombres[array_rand($nombres)];
        $tipo = $tipos[array_rand($tipos)];
        
        $nave = [
            'id' => $i,
            'nombre' => "$nombre " . ($i > 1 ? "X-$i" : 'I'),
            'descripcion' => "Nave espacial de última generación diseñada para viajes interplanetarios seguros y cómodos.",
            'tipo' => $tipo,
            'capacidad' => rand(10, 500),
            'velocidad' => rand(10000, 100000),
            'estado' => $estados[array_rand($estados)],
            'autonomia' => rand(10, 100),
            'imagen' => "https://stellar-tourism.example.com/images/naves/$i.jpg",
            'created_at' => date('Y-m-d H:i:s', time() - rand(0, 365 * 24 * 60 * 60)),
            'disponible' => (rand(0, 1) == 1)
        ];
        
        $naves[] = $nave;
    }
    
    return [
        'data' => $naves,
        'meta' => [
            'total' => count($naves),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Función para generar datos de ejemplo para rutas
function generateRutasData() {
    $rutas = [];
    
    $dificultades = ['baja', 'media', 'alta'];
    
    for ($i = 1; $i <= 10; $i++) {
        $origen_id = rand(1, 5);
        $destino_id = rand(6, 10);
        
        $ruta = [
            'id' => $i,
            'origen_id' => $origen_id,
            'destino_id' => $destino_id,
            'duracion_estimada' => rand(24, 720),
            'distancia_total' => rand(100, 10000) * 1000000,
            'dificultad' => $dificultades[array_rand($dificultades)],
            'created_at' => date('Y-m-d H:i:s', time() - rand(0, 365 * 24 * 60 * 60)),
            'origen' => [
                'id' => $origen_id,
                'nombre' => "Origen $origen_id",
                'tipo' => 'planeta'
            ],
            'destino' => [
                'id' => $destino_id,
                'nombre' => "Destino $destino_id",
                'tipo' => 'luna'
            ]
        ];
        
        $rutas[] = $ruta;
    }
    
    return [
        'data' => $rutas,
        'meta' => [
            'total' => count($rutas),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Función para generar datos de ejemplo para actividades
function generateActividadesData() {
    $actividades = [];
    
    $nombres = [
        'Paseo Lunar', 'Exploración Marciana', 'Observación de Anillos', 
        'Salto en Gravedad Cero', 'Buceo en Europa', 'Escalada en Olympus Mons',
        'Tour Fotográfico Espacial', 'Expedición Geológica', 'Paracaidismo Orbital'
    ];
    
    $dificultades = ['baja', 'media', 'alta'];
    $estados = ['activa', 'inactiva', 'completa'];
    
    for ($i = 1; $i <= 10; $i++) {
        $nombre = $nombres[array_rand($nombres)];
        $destino_id = rand(1, 10);
        
        $actividad = [
            'id' => $i,
            'nombre' => "$nombre " . ($i > 1 ? $i : ''),
            'descripcion' => "Una experiencia única que te permitirá disfrutar de las maravillas del espacio de forma segura y emocionante.",
            'destino_id' => $destino_id,
            'precio' => rand(100, 1000) * 10,
            'duracion' => rand(1, 12),
            'dificultad' => $dificultades[array_rand($dificultades)],
            'capacidad_maxima' => rand(5, 50),
            'estado' => $estados[array_rand($estados)],
            'imagen' => "https://stellar-tourism.example.com/images/actividades/$i.jpg",
            'created_at' => date('Y-m-d H:i:s', time() - rand(0, 365 * 24 * 60 * 60)),
            'destino' => [
                'id' => $destino_id,
                'nombre' => "Destino $destino_id",
                'tipo' => 'luna'
            ]
        ];
        
        $actividades[] = $actividad;
    }
    
    return [
        'data' => $actividades,
        'meta' => [
            'total' => count($actividades),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Función para generar datos de ejemplo para reservas
function generateReservasData() {
    $reservas = [];
    
    $estados = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    
    for ($i = 1; $i <= 10; $i++) {
        $usuario_id = rand(1, 5);
        $destino_id = rand(1, 10);
        $nave_id = rand(1, 10);
        
        $fecha_salida = date('Y-m-d', time() + rand(1, 365) * 24 * 60 * 60);
        $duracion = rand(3, 30);
        $fecha_regreso = date('Y-m-d', strtotime($fecha_salida) + $duracion * 24 * 60 * 60);
        
        $reserva = [
            'id' => $i,
            'codigo_reserva' => 'RES' . str_pad($i, 6, '0', STR_PAD_LEFT),
            'usuario_id' => $usuario_id,
            'destino_id' => $destino_id,
            'nave_id' => $nave_id,
            'fecha_salida' => $fecha_salida,
            'fecha_regreso' => $fecha_regreso,
            'num_pasajeros' => rand(1, 5),
            'estado' => $estados[array_rand($estados)],
            'precio_total' => rand(1000, 10000) * 100,
            'created_at' => date('Y-m-d H:i:s', time() - rand(0, 30) * 24 * 60 * 60),
            'destino' => [
                'id' => $destino_id,
                'nombre' => "Destino $destino_id",
                'tipo' => 'luna'
            ],
            'nave' => [
                'id' => $nave_id,
                'nombre' => "Nave $nave_id",
                'tipo' => 'turismo'
            ]
        ];
        
        $reservas[] = $reserva;
    }
    
    return [
        'data' => $reservas,
        'meta' => [
            'total' => count($reservas),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Función para generar datos de ejemplo para pagos
function generatePagosData() {
    $pagos = [];
    
    $metodos = ['tarjeta', 'paypal', 'transferencia', 'criptomoneda'];
    $estados = ['pendiente', 'completado', 'fallido', 'reembolsado'];
    
    for ($i = 1; $i <= 10; $i++) {
        $reserva_id = rand(1, 10);
        
        $pago = [
            'id' => $i,
            'reserva_id' => $reserva_id,
            'monto' => rand(1000, 10000) * 100,
            'fecha' => date('Y-m-d H:i:s', time() - rand(0, 30) * 24 * 60 * 60),
            'metodo' => $metodos[array_rand($metodos)],
            'referencia' => 'REF' . str_pad($i, 8, '0', STR_PAD_LEFT),
            'estado' => $estados[array_rand($estados)],
            'created_at' => date('Y-m-d H:i:s', time() - rand(0, 30) * 24 * 60 * 60),
            'reserva' => [
                'id' => $reserva_id,
                'codigo_reserva' => 'RES' . str_pad($reserva_id, 6, '0', STR_PAD_LEFT),
                'destino_id' => rand(1, 10)
            ]
        ];
        
        $pagos[] = $pago;
    }
    
    return [
        'data' => $pagos,
        'meta' => [
            'total' => count($pagos),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Función para generar datos de ejemplo para reseñas
function generateResenasData() {
    $resenas = [];
    
    $titulos = [
        'Experiencia increíble', 'Viaje inolvidable', 'Decepcionante', 
        'Superó mis expectativas', 'Recomendable', 'No volvería',
        'Aventura espacial única', 'Maravilloso destino', 'Servicio excelente'
    ];
    
    $estados = ['pendiente', 'aprobada', 'rechazada'];
    
    for ($i = 1; $i <= 10; $i++) {
        $usuario_id = rand(1, 5);
        $destino_id = rand(1, 10);
        
        $resena = [
            'id' => $i,
            'usuario_id' => $usuario_id,
            'destino_id' => $destino_id,
            'titulo' => $titulos[array_rand($titulos)],
            'comentario' => "Esta es mi reseña sobre el destino. " . str_repeat("Texto de ejemplo. ", rand(1, 5)),
            'calificacion' => rand(1, 5),
            'fecha' => date('Y-m-d H:i:s', time() - rand(0, 365) * 24 * 60 * 60),
            'estado' => $estados[array_rand($estados)],
            'destino' => [
                'id' => $destino_id,
                'nombre' => "Destino $destino_id",
                'tipo' => 'luna'
            ],
            'usuario' => [
                'id' => $usuario_id,
                'nombre' => "Usuario $usuario_id",
                'avatar' => "https://stellar-tourism.example.com/images/usuarios/$usuario_id.jpg"
            ]
        ];
        
        $resenas[] = $resena;
    }
    
    return [
        'data' => $resenas,
        'meta' => [
            'total' => count($resenas),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Función para generar datos de ejemplo para usuarios
function generateUsuariosData() {
    $usuarios = [];
    
    $estados = ['activo', 'inactivo', 'bloqueado'];
    
    for ($i = 1; $i <= 10; $i++) {
        $usuario = [
            'id' => $i,
            'nombre' => "Usuario $i",
            'email' => "usuario$i@example.com",
            'estado' => $estados[array_rand($estados)],
            'fecha_registro' => date('Y-m-d H:i:s', time() - rand(0, 365) * 24 * 60 * 60),
            'ultimo_acceso' => date('Y-m-d H:i:s', time() - rand(0, 30) * 24 * 60 * 60),
            'avatar' => "https://stellar-tourism.example.com/images/usuarios/$i.jpg",
            'estadisticas' => [
                'total_reservas' => rand(0, 10),
                'total_resenas' => rand(0, 5),
                'ultima_actividad' => date('Y-m-d H:i:s', time() - rand(0, 7) * 24 * 60 * 60)
            ]
        ];
        
        $usuarios[] = $usuario;
    }
    
    return [
        'data' => $usuarios,
        'meta' => [
            'total' => count($usuarios),
            'page' => 1,
            'limit' => 10,
            'pages' => 1
        ]
    ];
}

// Obtener la ruta solicitada
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Eliminar la parte inicial de la ruta si es necesario
$path = preg_replace('/^\/api\/test-endpoints\.php/', '', $path);
$path = preg_replace('/^\/api/', '', $path);

// Determinar qué datos devolver según la ruta
switch ($path) {
    case '/destinos':
        $response = generateDestinosData();
        break;
    case '/naves':
        $response = generateNavesData();
        break;
    case '/rutas':
        $response = generateRutasData();
        break;
    case '/actividades':
        $response = generateActividadesData();
        break;
    case '/reservas':
        $response = generateReservasData();
        break;
    case '/pagos':
        $response = generatePagosData();
        break;
    case '/resenas':
        $response = generateResenasData();
        break;
    case '/usuarios':
        $response = generateUsuariosData();
        break;
    default:
        // Si la ruta no coincide con ninguna de las anteriores, devolver un error
        http_response_code(404);
        $response = [
            'status' => 'error',
            'message' => 'Endpoint no encontrado: ' . $path
        ];
}

// Devolver la respuesta como JSON
echo json_encode($response, JSON_PRETTY_PRINT);
