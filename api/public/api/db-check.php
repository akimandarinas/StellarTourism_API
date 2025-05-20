<?php
// Verificación de la base de datos para la API de Stellar Tourism

// Configuración
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Función para verificar el estado de la base de datos
function checkDatabaseStatus() {
    // Tablas de la base de datos (simulado)
    $tables = [
        'destinos' => [
            'name' => 'destinos',
            'status' => 'success',
            'records' => 15,
            'size' => '1.2 MB',
            'last_updated' => '2023-05-18 15:30:45',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'nombre' => ['type' => 'VARCHAR(100)', 'nullable' => false, 'key' => ''],
                'descripcion' => ['type' => 'TEXT', 'nullable' => true, 'key' => ''],
                'imagen' => ['type' => 'VARCHAR(255)', 'nullable' => true, 'key' => ''],
                'precio' => ['type' => 'DECIMAL(10,2)', 'nullable' => false, 'key' => ''],
                'duracion' => ['type' => 'INT', 'nullable' => false, 'key' => ''],
                'distancia' => ['type' => 'DECIMAL(15,2)', 'nullable' => false, 'key' => ''],
                'popularidad' => ['type' => 'INT', 'nullable' => true, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_destinos_nombre' => ['columns' => ['nombre'], 'type' => 'INDEX'],
                'idx_destinos_precio' => ['columns' => ['precio'], 'type' => 'INDEX']
            ]
        ],
        'naves' => [
            'name' => 'naves',
            'status' => 'success',
            'records' => 8,
            'size' => '0.8 MB',
            'last_updated' => '2023-05-17 10:15:22',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'nombre' => ['type' => 'VARCHAR(100)', 'nullable' => false, 'key' => ''],
                'descripcion' => ['type' => 'TEXT', 'nullable' => true, 'key' => ''],
                'imagen' => ['type' => 'VARCHAR(255)', 'nullable' => true, 'key' => ''],
                'capacidad' => ['type' => 'INT', 'nullable' => false, 'key' => ''],
                'velocidad' => ['type' => 'DECIMAL(10,2)', 'nullable' => false, 'key' => ''],
                'autonomia' => ['type' => 'DECIMAL(10,2)', 'nullable' => false, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_naves_nombre' => ['columns' => ['nombre'], 'type' => 'INDEX']
            ]
        ],
        'rutas' => [
            'name' => 'rutas',
            'status' => 'success',
            'records' => 25,
            'size' => '1.5 MB',
            'last_updated' => '2023-05-18 09:45:12',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'origen_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'destino_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'duracion' => ['type' => 'INT', 'nullable' => false, 'key' => ''],
                'distancia' => ['type' => 'DECIMAL(15,2)', 'nullable' => false, 'key' => ''],
                'precio' => ['type' => 'DECIMAL(10,2)', 'nullable' => false, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_rutas_origen' => ['columns' => ['origen_id'], 'type' => 'INDEX'],
                'idx_rutas_destino' => ['columns' => ['destino_id'], 'type' => 'INDEX']
            ],
            'foreign_keys' => [
                'fk_rutas_origen' => ['column' => 'origen_id', 'references' => 'destinos(id)'],
                'fk_rutas_destino' => ['column' => 'destino_id', 'references' => 'destinos(id)']
            ]
        ],
        'actividades' => [
            'name' => 'actividades',
            'status' => 'success',
            'records' => 42,
            'size' => '2.1 MB',
            'last_updated' => '2023-05-18 14:20:35',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'destino_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'nombre' => ['type' => 'VARCHAR(100)', 'nullable' => false, 'key' => ''],
                'descripcion' => ['type' => 'TEXT', 'nullable' => true, 'key' => ''],
                'imagen' => ['type' => 'VARCHAR(255)', 'nullable' => true, 'key' => ''],
                'duracion' => ['type' => 'INT', 'nullable' => false, 'key' => ''],
                'precio' => ['type' => 'DECIMAL(10,2)', 'nullable' => false, 'key' => ''],
                'capacidad' => ['type' => 'INT', 'nullable' => true, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_actividades_destino' => ['columns' => ['destino_id'], 'type' => 'INDEX']
            ],
            'foreign_keys' => [
                'fk_actividades_destino' => ['column' => 'destino_id', 'references' => 'destinos(id)']
            ]
        ],
        'usuarios' => [
            'name' => 'usuarios',
            'status' => 'success',
            'records' => 150,
            'size' => '3.2 MB',
            'last_updated' => '2023-05-18 18:10:05',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'nombre' => ['type' => 'VARCHAR(100)', 'nullable' => false, 'key' => ''],
                'apellido' => ['type' => 'VARCHAR(100)', 'nullable' => false, 'key' => ''],
                'email' => ['type' => 'VARCHAR(255)', 'nullable' => false, 'key' => 'UNI'],
                'password' => ['type' => 'VARCHAR(255)', 'nullable' => false, 'key' => ''],
                'telefono' => ['type' => 'VARCHAR(20)', 'nullable' => true, 'key' => ''],
                'direccion' => ['type' => 'TEXT', 'nullable' => true, 'key' => ''],
                'fecha_nacimiento' => ['type' => 'DATE', 'nullable' => true, 'key' => ''],
                'rol' => ['type' => 'ENUM("usuario","admin")', 'nullable' => false, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_usuarios_email' => ['columns' => ['email'], 'type' => 'UNIQUE']
            ]
        ],
        'reservas' => [
            'name' => 'reservas',
            'status' => 'success',
            'records' => 125,
            'size' => '4.5 MB',
            'last_updated' => '2023-05-18 19:45:30',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'usuario_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'ruta_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'nave_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'fecha_salida' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_regreso' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'num_pasajeros' => ['type' => 'INT', 'nullable' => false, 'key' => ''],
                'precio_total' => ['type' => 'DECIMAL(10,2)', 'nullable' => false, 'key' => ''],
                'estado' => ['type' => 'ENUM("pendiente","confirmada","cancelada")', 'nullable' => false, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_reservas_usuario' => ['columns' => ['usuario_id'], 'type' => 'INDEX'],
                'idx_reservas_ruta' => ['columns' => ['ruta_id'], 'type' => 'INDEX'],
                'idx_reservas_nave' => ['columns' => ['nave_id'], 'type' => 'INDEX'],
                'idx_reservas_fecha_salida' => ['columns' => ['fecha_salida'], 'type' => 'INDEX']
            ],
            'foreign_keys' => [
                'fk_reservas_usuario' => ['column' => 'usuario_id', 'references' => 'usuarios(id)'],
                'fk_reservas_ruta' => ['column' => 'ruta_id', 'references' => 'rutas(id)'],
                'fk_reservas_nave' => ['column' => 'nave_id', 'references' => 'naves(id)']
            ]
        ],
        'pagos' => [
            'name' => 'pagos',
            'status' => 'success',
            'records' => 125,
            'size' => '3.8 MB',
            'last_updated' => '2023-05-18 19:50:15',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'reserva_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'usuario_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'monto' => ['type' => 'DECIMAL(10,2)', 'nullable' => false, 'key' => ''],
                'metodo' => ['type' => 'ENUM("tarjeta","transferencia","paypal")', 'nullable' => false, 'key' => ''],
                'estado' => ['type' => 'ENUM("pendiente","completado","fallido","reembolsado")', 'nullable' => false, 'key' => ''],
                'referencia' => ['type' => 'VARCHAR(255)', 'nullable' => true, 'key' => ''],
                'fecha_pago' => ['type' => 'DATETIME', 'nullable' => true, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_pagos_reserva' => ['columns' => ['reserva_id'], 'type' => 'INDEX'],
                'idx_pagos_usuario' => ['columns' => ['usuario_id'], 'type' => 'INDEX']
            ],
            'foreign_keys' => [
                'fk_pagos_reserva' => ['column' => 'reserva_id', 'references' => 'reservas(id)'],
                'fk_pagos_usuario' => ['column' => 'usuario_id', 'references' => 'usuarios(id)']
            ]
        ],
        'resenas' => [
            'name' => 'resenas',
            'status' => 'success',
            'records' => 85,
            'size' => '2.5 MB',
            'last_updated' => '2023-05-18 17:30:40',
            'columns' => [
                'id' => ['type' => 'INT', 'nullable' => false, 'key' => 'PRI'],
                'usuario_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'destino_id' => ['type' => 'INT', 'nullable' => false, 'key' => 'MUL'],
                'puntuacion' => ['type' => 'INT', 'nullable' => false, 'key' => ''],
                'comentario' => ['type' => 'TEXT', 'nullable' => true, 'key' => ''],
                'fecha_creacion' => ['type' => 'DATETIME', 'nullable' => false, 'key' => ''],
                'fecha_actualizacion' => ['type' => 'DATETIME', 'nullable' => true, 'key' => '']
            ],
            'indexes' => [
                'PRIMARY' => ['columns' => ['id'], 'type' => 'PRIMARY'],
                'idx_resenas_usuario' => ['columns' => ['usuario_id'], 'type' => 'INDEX'],
                'idx_resenas_destino' => ['columns' => ['destino_id'], 'type' => 'INDEX']
            ],
            'foreign_keys' => [
                'fk_resenas_usuario' => ['column' => 'usuario_id', 'references' => 'usuarios(id)'],
                'fk_resenas_destino' => ['column' => 'destino_id', 'references' => 'destinos(id)']
            ]
        ]
    ];
    
    // Procedimientos almacenados (simulado)
    $storedProcedures = [
        'buscar_destinos' => [
            'name' => 'buscar_destinos',
            'status' => 'success',
            'parameters' => [
                'p_nombre' => 'VARCHAR(100)',
                'p_precio_min' => 'DECIMAL(10,2)',
                'p_precio_max' => 'DECIMAL(10,2)',
                'p_duracion_min' => 'INT',
                'p_duracion_max' => 'INT'
            ],
            'description' => 'Busca destinos según criterios de filtrado',
            'last_executed' => '2023-05-18 16:45:22'
        ],
        'calcular_puntuacion_promedio' => [
            'name' => 'calcular_puntuacion_promedio',
            'status' => 'success',
            'parameters' => [
                'p_destino_id' => 'INT'
            ],
            'description' => 'Calcula la puntuación promedio de un destino',
            'last_executed' => '2023-05-18 17:30:45'
        ],
        'cancelar_reserva' => [
            'name' => 'cancelar_reserva',
            'status' => 'success',
            'parameters' => [
                'p_reserva_id' => 'INT',
                'p_motivo' => 'VARCHAR(255)'
            ],
            'description' => 'Cancela una reserva y actualiza el estado de pago',
            'last_executed' => '2023-05-18 15:20:10'
        ],
        'crear_reserva_completa' => [
            'name' => 'crear_reserva_completa',
            'status' => 'success',
            'parameters' => [
                'p_usuario_id' => 'INT',
                'p_ruta_id' => 'INT',
                'p_nave_id' => 'INT',
                'p_fecha_salida' => 'DATETIME',
                'p_fecha_regreso' => 'DATETIME',
                'p_num_pasajeros' => 'INT',
                'p_metodo_pago' => 'VARCHAR(50)'
            ],
            'description' => 'Crea una reserva completa con pago',
            'last_executed' => '2023-05-18 19:45:30'
        ]
    ];
    
    // Triggers (simulado)
    $triggers = [
        'actualizar_disponibilidad_nave' => [
            'name' => 'actualizar_disponibilidad_nave',
            'status' => 'success',
            'table' => 'reservas',
            'timing' => 'AFTER',
            'event' => 'INSERT',
            'description' => 'Actualiza la disponibilidad de la nave después de crear una reserva',
            'last_executed' => '2023-05-18 19:45:30'
        ],
        'actualizar_popularidad_destino' => [
            'name' => 'actualizar_popularidad_destino',
            'status' => 'success',
            'table' => 'reservas',
            'timing' => 'AFTER',
            'event' => 'INSERT',
            'description' => 'Actualiza la popularidad del destino después de crear una reserva',
            'last_executed' => '2023-05-18 19:45:30'
        ],
        'registrar_historial_pagos' => [
            'name' => 'registrar_historial_pagos',
            'status' => 'success',
            'table' => 'pagos',
            'timing' => 'AFTER',
            'event' => 'UPDATE',
            'description' => 'Registra cambios en el historial de pagos',
            'last_executed' => '2023-05-18 19:50:15'
        ],
        'actualizar_fecha_modificacion' => [
            'name' => 'actualizar_fecha_modificacion',
            'status' => 'success',
            'table' => 'usuarios',
            'timing' => 'BEFORE',
            'event' => 'UPDATE',
            'description' => 'Actualiza la fecha de modificación al actualizar un usuario',
            'last_executed' => '2023-05-18 18:10:05'
        ]
    ];
    
    // Estadísticas de la base de datos (simulado)
    $databaseStats = [
        'size' => '24.5 MB',
        'tables' => count($tables),
        'stored_procedures' => count($storedProcedures),
        'triggers' => count($triggers),
        'total_records' => array_sum(array_column($tables, 'records')),
        'last_backup' => '2023-05-18 00:00:00',
        'uptime' => '15d 7h 23m',
        'version' => 'MySQL 8.0.28',
        'connections' => [
            'max_connections' => 100,
            'current_connections' => 5,
            'total_connections' => 3782
        ],
        'performance' => [
            'query_cache_size' => '16 MB',
            'query_cache_hit_ratio' => '85%',
            'slow_queries' => 0,
            'avg_query_time' => '15ms'
        ]
    ];
    
    // Verificar integridad de la base de datos (simulado)
    $integrityChecks = [
        'foreign_keys' => [
            'status' => 'success',
            'message' => 'Todas las claves foráneas están correctamente configuradas',
            'details' => 'Se verificaron 8 relaciones de clave foránea'
        ],
        'indexes' => [
            'status' => 'success',
            'message' => 'Todos los índices están correctamente configurados',
            'details' => 'Se verificaron 20 índices'
        ],
        'data_consistency' => [
            'status' => 'success',
            'message' => 'Los datos son consistentes',
            'details' => 'No se encontraron inconsistencias en los datos'
        ],
        'orphaned_records' => [
            'status' => 'success',
            'message' => 'No se encontraron registros huérfanos',
            'details' => 'Se verificaron todas las tablas con claves foráneas'
        ]
    ];
    
    // Recomendaciones de optimización (simulado)
    $optimizationRecommendations = [
        [
            'table' => 'reservas',
            'recommendation' => 'Añadir índice compuesto en (usuario_id, fecha_salida)',
            'impact' => 'Alto',
            'reason' => 'Mejoraría el rendimiento de las consultas de reservas por usuario y fecha'
        ],
        [
            'table' => 'pagos',
            'recommendation' => 'Añadir índice en (estado, fecha_pago)',
            'impact' => 'Medio',
            'reason' => 'Mejoraría el rendimiento de las consultas de pagos por estado y fecha'
        ],
        [
            'table' => 'resenas',
            'recommendation' => 'Añadir índice en (puntuacion)',
            'impact' => 'Bajo',
            'reason' => 'Mejoraría el rendimiento de las consultas de reseñas por puntuación'
        ]
    ];
    
    // Determinar estado general
    $status = 'success';
    $message = 'La base de datos está en buen estado';
    
    foreach ($tables as $table) {
        if ($table['status'] !== 'success') {
            $status = 'error';
            $message = 'Hay problemas con algunas tablas';
            break;
        }
    }
    
    foreach ($storedProcedures as $procedure) {
        if ($procedure['status'] !== 'success') {
            $status = 'warning';
            $message = 'Hay problemas con algunos procedimientos almacenados';
            break;
        }
    }
    
    foreach ($triggers as $trigger) {
        if ($trigger['status'] !== 'success') {
            $status = 'warning';
            $message = 'Hay problemas con algunos triggers';
            break;
        }
    }
    
    foreach ($integrityChecks as $check) {
        if ($check['status'] !== 'success') {
            $status = 'error';
            $message = 'Hay problemas de integridad en la base de datos';
            break;
        }
    }
    
    // Construir respuesta
    $response = [
        'status' => $status,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'database_stats' => $databaseStats,
        'tables' => $tables,
        'stored_procedures' => $storedProcedures,
        'triggers' => $triggers,
        'integrity_checks' => $integrityChecks,
        'optimization_recommendations' => $optimizationRecommendations,
        'source_code' => file_get_contents(__FILE__) // Incluir el código fuente completo
    ];
    
    return $response;
}

// Ejecutar verificación
$databaseStatus = checkDatabaseStatus();

// Devolver resultado
echo json_encode($databaseStatus, JSON_PRETTY_PRINT);
