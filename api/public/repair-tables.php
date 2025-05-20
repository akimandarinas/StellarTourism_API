<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response_utils.php';

header('Content-Type: application/json');

try {
    $conn = getConnection();
    
    // Configurar PDO para que lance excepciones en caso de error
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Definir la estructura esperada de todas las tablas
    $expectedTables = [
        'destinos' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'nombre' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'descripcion' => ['type' => 'TEXT', 'null' => 'NOT NULL'],
            'tipo' => ['type' => "ENUM('planeta','luna','estacion','asteroide')", 'null' => 'NOT NULL'],
            'distancia_tierra' => ['type' => 'BIGINT', 'null' => 'NOT NULL'],
            'tiempo_viaje' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'gravedad' => ['type' => 'DECIMAL(5,2)', 'null' => 'DEFAULT NULL'],
            'temperatura_min' => ['type' => 'INT(11)', 'null' => 'DEFAULT NULL'],
            'temperatura_max' => ['type' => 'INT(11)', 'null' => 'DEFAULT NULL'],
            'imagen_url' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'modelo_3d_url' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'destacado' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT FALSE'],
            'activo' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT TRUE'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'imagen' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'precio' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL DEFAULT 0'],
            'duracion' => ['type' => 'INT(11)', 'null' => 'NOT NULL DEFAULT 0'],
            'distancia' => ['type' => 'DECIMAL(20,2)', 'null' => 'NOT NULL DEFAULT 0'],
            'temperatura' => ['type' => 'DECIMAL(5,2)', 'null' => 'DEFAULT NULL'],
            'clima' => ['type' => 'VARCHAR(50)', 'null' => 'DEFAULT NULL'],
            'precio_base' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL DEFAULT 0'],
            'popularidad' => ['type' => 'INT(11)', 'null' => 'DEFAULT 0']
        ],
        'naves' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'nombre' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'descripcion' => ['type' => 'TEXT', 'null' => 'NOT NULL'],
            'tipo' => ['type' => "ENUM('transporte','exploración','carga','lujo')", 'null' => 'NOT NULL'],
            'capacidad_pasajeros' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'velocidad_maxima' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'autonomia' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'imagen_url' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'modelo_3d_url' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'destacado' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT FALSE'],
            'activo' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT TRUE'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'imagen' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'capacidad' => ['type' => 'INT(11)', 'null' => 'NOT NULL DEFAULT 0'],
            'velocidad' => ['type' => 'INT(11)', 'null' => 'NOT NULL DEFAULT 0'],
            'estado' => ['type' => "ENUM('activa','mantenimiento','retirada')", 'null' => "DEFAULT 'activa'"],
            'comodidades' => ['type' => 'TEXT', 'null' => 'DEFAULT NULL']
        ],
        'rutas' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'destino_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'nave_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'nombre' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'descripcion' => ['type' => 'TEXT', 'null' => 'NOT NULL'],
            'duracion' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'distancia' => ['type' => 'BIGINT', 'null' => 'NOT NULL'],
            'precio' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL'],
            'plazas_disponibles' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'fecha_salida' => ['type' => 'DATE', 'null' => 'NOT NULL'],
            'fecha_regreso' => ['type' => 'DATE', 'null' => 'NOT NULL'],
            'destacado' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT FALSE'],
            'activo' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT TRUE'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'origen_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL DEFAULT 1'],
            'estado' => ['type' => "ENUM('programada','en_curso','completada','cancelada')", 'null' => "DEFAULT 'programada'"],
            'fecha_llegada' => ['type' => 'DATETIME', 'null' => 'NOT NULL']
        ],
        'actividades' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'destino_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'nombre' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'descripcion' => ['type' => 'TEXT', 'null' => 'NOT NULL'],
            'duracion' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'nivel_dificultad' => ['type' => "ENUM('baja','media','alta')", 'null' => 'NOT NULL'],
            'precio' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL'],
            'imagen_url' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'activo' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT TRUE'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'dificultad' => ['type' => "ENUM('baja','media','alta')", 'null' => "DEFAULT 'baja'"],
            'imagen' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'incluye_equipo' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT FALSE'],
            'categoria' => ['type' => 'VARCHAR(50)', 'null' => 'DEFAULT NULL']
        ],
        'usuarios' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'firebase_uid' => ['type' => 'VARCHAR(128)', 'null' => 'DEFAULT NULL', 'key' => 'UNI'],
            'nombre' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'apellidos' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'email' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL', 'key' => 'UNI'],
            'password' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL'],
            'telefono' => ['type' => 'VARCHAR(20)', 'null' => 'DEFAULT NULL'],
            'fecha_nacimiento' => ['type' => 'DATE', 'null' => 'DEFAULT NULL'],
            'nacionalidad' => ['type' => 'VARCHAR(50)', 'null' => 'DEFAULT NULL'],
            'direccion' => ['type' => 'TEXT', 'null' => 'DEFAULT NULL'],
            'estado' => ['type' => "ENUM('activo','inactivo','bloqueado')", 'null' => "DEFAULT 'activo'"],
            'rol' => ['type' => "ENUM('usuario','admin')", 'null' => "DEFAULT 'usuario'"],
            'fecha_registro' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'apellido' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL']
        ],
        'reservas' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'usuario_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'ruta_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'numero_pasajeros' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'precio_total' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL'],
            'estado' => ['type' => "ENUM('pendiente','confirmada','cancelada','completada')", 'null' => "DEFAULT 'pendiente'"],
            'fecha_reserva' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'nave_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL DEFAULT 1'],
            'fecha_salida' => ['type' => 'DATE', 'null' => 'DEFAULT NULL'],
            'fecha_regreso' => ['type' => 'DATE', 'null' => 'DEFAULT NULL'],
            'codigo_reserva' => ['type' => 'VARCHAR(20)', 'null' => 'NOT NULL', 'key' => 'UNI']
        ],
        'pagos' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'reserva_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'monto' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL'],
            'metodo_pago' => ['type' => "ENUM('tarjeta','paypal','transferencia')", 'null' => 'NOT NULL'],
            'referencia_pago' => ['type' => 'VARCHAR(255)', 'null' => 'NOT NULL'],
            'estado' => ['type' => "ENUM('pendiente','completado','fallido','reembolsado')", 'null' => "DEFAULT 'pendiente'"],
            'fecha_pago' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'fecha' => ['type' => 'DATETIME', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'metodo' => ['type' => "ENUM('tarjeta','paypal','transferencia')", 'null' => "DEFAULT 'tarjeta'"],
            'referencia' => ['type' => 'VARCHAR(255)', 'null' => 'DEFAULT NULL']
        ],
        'resenas' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'usuario_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'destino_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'titulo' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'comentario' => ['type' => 'TEXT', 'null' => 'NOT NULL'],
            'puntuacion' => ['type' => 'INT(11)', 'null' => 'NOT NULL'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'calificacion' => ['type' => 'INT(11)', 'null' => 'NOT NULL DEFAULT 5'],
            'fecha' => ['type' => 'DATETIME', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'reserva_id' => ['type' => 'INT(11)', 'null' => 'DEFAULT NULL', 'key' => 'MUL'],
            'fecha_resena' => ['type' => 'DATETIME', 'null' => 'DEFAULT CURRENT_TIMESTAMP']
        ],
        'actividades_reservadas' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'reserva_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'actividad_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'cantidad' => ['type' => 'INT(11)', 'null' => 'NOT NULL DEFAULT 1'],
            'precio_unitario' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL'],
            'precio_total' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'fecha_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            'precio' => ['type' => 'DECIMAL(10,2)', 'null' => 'NOT NULL DEFAULT 0']
        ],
        'notificaciones_suscripciones' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'usuario_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'endpoint' => ['type' => 'VARCHAR(500)', 'null' => 'NOT NULL'],
            'auth' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'p256dh' => ['type' => 'VARCHAR(255)', 'null' => 'NOT NULL'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP']
        ],
        'notificaciones_historial' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'usuario_id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'MUL'],
            'titulo' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'mensaje' => ['type' => 'TEXT', 'null' => 'NOT NULL'],
            'tipo' => ['type' => 'VARCHAR(50)', 'null' => 'NOT NULL'],
            'leida' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT FALSE'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'datos_adicionales' => ['type' => 'TEXT', 'null' => 'DEFAULT NULL']
        ],
        'webhook_events' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'tipo' => ['type' => 'VARCHAR(50)', 'null' => 'NOT NULL'],
            'payload' => ['type' => 'TEXT', 'null' => 'NOT NULL'],
            'estado' => ['type' => "ENUM('pendiente','procesado','fallido')", 'null' => "DEFAULT 'pendiente'"],
            'intentos' => ['type' => 'INT(11)', 'null' => 'DEFAULT 0'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP']
        ],
        'webhook_configuracion' => [
            'id' => ['type' => 'INT(11)', 'null' => 'NOT NULL', 'key' => 'PRI', 'extra' => 'AUTO_INCREMENT'],
            'url' => ['type' => 'VARCHAR(255)', 'null' => 'NOT NULL'],
            'eventos' => ['type' => 'VARCHAR(255)', 'null' => 'NOT NULL'],
            'secreto' => ['type' => 'VARCHAR(100)', 'null' => 'NOT NULL'],
            'activo' => ['type' => 'BOOLEAN', 'null' => 'DEFAULT TRUE'],
            'fecha_creacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP'],
            'ultima_actualizacion' => ['type' => 'TIMESTAMP', 'null' => 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP']
        ]
    ];
    
    // Definir las relaciones entre tablas
    $foreignKeys = [
        'rutas' => [
            ['column' => 'destino_id', 'references' => 'destinos(id)'],
            ['column' => 'nave_id', 'references' => 'naves(id)']
        ],
        'actividades' => [
            ['column' => 'destino_id', 'references' => 'destinos(id)']
        ],
        'reservas' => [
            ['column' => 'usuario_id', 'references' => 'usuarios(id)'],
            ['column' => 'ruta_id', 'references' => 'rutas(id)'],
            ['column' => 'nave_id', 'references' => 'naves(id)']
        ],
        'pagos' => [
            ['column' => 'reserva_id', 'references' => 'reservas(id)']
        ],
        'resenas' => [
            ['column' => 'usuario_id', 'references' => 'usuarios(id)'],
            ['column' => 'destino_id', 'references' => 'destinos(id)'],
            ['column' => 'reserva_id', 'references' => 'reservas(id)']
        ],
        'actividades_reservadas' => [
            ['column' => 'reserva_id', 'references' => 'reservas(id)'],
            ['column' => 'actividad_id', 'references' => 'actividades(id)']
        ],
        'notificaciones_suscripciones' => [
            ['column' => 'usuario_id', 'references' => 'usuarios(id)']
        ],
        'notificaciones_historial' => [
            ['column' => 'usuario_id', 'references' => 'usuarios(id)']
        ]
    ];
    
    // Primero, arreglar el problema de fechas '0000-00-00 00:00:00'
    try {
        // Actualizar fechas inválidas en la tabla rutas
        $conn->exec("SET SQL_MODE = ''");
        
        // Actualizar fechas inválidas en la tabla rutas
        $fixDatesQuery = "UPDATE rutas SET fecha_llegada = '2023-01-01 00:00:00' WHERE fecha_llegada = '0000-00-00 00:00:00' OR fecha_llegada IS NULL";
        $conn->exec($fixDatesQuery);
        
        $fixDatesQuery = "UPDATE rutas SET fecha_salida = '2023-01-01' WHERE fecha_salida = '0000-00-00' OR fecha_salida IS NULL";
        $conn->exec($fixDatesQuery);
        
        $fixDatesQuery = "UPDATE rutas SET fecha_regreso = '2023-01-10' WHERE fecha_regreso = '0000-00-00' OR fecha_regreso IS NULL";
        $conn->exec($fixDatesQuery);
        
        // Actualizar fechas inválidas en la tabla resenas
        $fixDatesQuery = "UPDATE resenas SET fecha_resena = '2023-01-01 00:00:00' WHERE fecha_resena = '0000-00-00 00:00:00' OR fecha_resena IS NULL";
        $conn->exec($fixDatesQuery);
        
        // Actualizar valores NULL en reserva_id en resenas
        $fixNullsQuery = "UPDATE resenas SET reserva_id = (SELECT id FROM reservas LIMIT 1) WHERE reserva_id IS NULL";
        $conn->exec($fixNullsQuery);
    } catch (PDOException $e) {
        // Ignorar errores aquí, continuamos con la verificación de tablas
    }
    
    $results = [];
    
    // Verificar y reparar cada tabla
    foreach ($expectedTables as $tableName => $columns) {
        // Verificar si la tabla existe
        $tableExistsQuery = "SHOW TABLES LIKE '$tableName'";
        $tableExistsResult = $conn->query($tableExistsQuery);
        
        if ($tableExistsResult->rowCount() == 0) {
            // La tabla no existe, crearla
            $createTableSQL = "CREATE TABLE $tableName (";
            $columnDefs = [];
            
            foreach ($columns as $columnName => $columnProps) {
                $columnDef = "$columnName {$columnProps['type']} {$columnProps['null']}";
                if (isset($columnProps['key']) && $columnProps['key'] == 'PRI') {
                    $columnDef .= " PRIMARY KEY";
                }
                if (isset($columnProps['extra'])) {
                    $columnDef .= " {$columnProps['extra']}";
                }
                $columnDefs[] = $columnDef;
            }
            
            $createTableSQL .= implode(', ', $columnDefs) . ")";
            
            try {
                $conn->exec($createTableSQL);
                $results[$tableName] = "Tabla creada correctamente";
            } catch (PDOException $e) {
                $results[$tableName] = "Error al crear la tabla: " . $e->getMessage();
            }
        } else {
            // La tabla existe, verificar columnas
            $columnsQuery = "DESCRIBE $tableName";
            $columnsResult = $conn->query($columnsQuery);
            
            $existingColumns = [];
            while ($column = $columnsResult->fetch(PDO::FETCH_ASSOC)) {
                $existingColumns[$column['Field']] = $column;
            }
            
            $tableResults = [];
            
            // Verificar columnas existentes y modificarlas si es necesario
            foreach ($columns as $columnName => $columnProps) {
                if (isset($existingColumns[$columnName])) {
                    // La columna existe, verificar si necesita ser modificada
                    $existingColumn = $existingColumns[$columnName];
                    $needsModification = false;
                    
                    // Verificar tipo
                    if (strtoupper($existingColumn['Type']) != strtoupper($columnProps['type'])) {
                        $needsModification = true;
                    }
                    
                    // Verificar si permite NULL
                    $isNullable = $existingColumn['Null'] == 'YES';
                    $shouldBeNullable = strpos($columnProps['null'], 'DEFAULT NULL') !== false || strpos($columnProps['null'], 'NULL') !== false;
                    if ($isNullable != $shouldBeNullable) {
                        $needsModification = true;
                    }
                    
                    if ($needsModification) {
                        $alterSQL = "ALTER TABLE $tableName MODIFY COLUMN $columnName {$columnProps['type']} {$columnProps['null']}";
                        try {
                            $conn->exec($alterSQL);
                            $tableResults[] = "Columna '$columnName' modificada correctamente";
                        } catch (PDOException $e) {
                            $tableResults[] = "Error al modificar columna '$columnName': " . $e->getMessage();
                        }
                    }
                } else {
                    // La columna no existe, añadirla
                    $addSQL = "ALTER TABLE $tableName ADD COLUMN $columnName {$columnProps['type']} {$columnProps['null']}";
                    if (isset($columnProps['extra'])) {
                        $addSQL .= " {$columnProps['extra']}";
                    }
                    
                    try {
                        $conn->exec($addSQL);
                        $tableResults[] = "Columna '$columnName' añadida correctamente";
                    } catch (PDOException $e) {
                        $tableResults[] = "Error al añadir columna '$columnName': " . $e->getMessage();
                    }
                }
            }
            
            // Verificar claves foráneas
            if (isset($foreignKeys[$tableName])) {
                // Obtener claves foráneas existentes
                $fkQuery = "
                    SELECT 
                        CONSTRAINT_NAME,
                        COLUMN_NAME,
                        REFERENCED_TABLE_NAME,
                        REFERENCED_COLUMN_NAME
                    FROM 
                        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                    WHERE 
                        TABLE_SCHEMA = DATABASE() AND
                        TABLE_NAME = '$tableName' AND
                        REFERENCED_TABLE_NAME IS NOT NULL
                ";
                $fkResult = $conn->query($fkQuery);
                
                $existingFKs = [];
                while ($fk = $fkResult->fetch(PDO::FETCH_ASSOC)) {
                    $existingFKs[$fk['COLUMN_NAME']] = $fk;
                }
                
                // Verificar cada clave foránea esperada
                foreach ($foreignKeys[$tableName] as $fk) {
                    $column = $fk['column'];
                    $references = $fk['references'];
                    
                    if (!isset($existingFKs[$column])) {
                        // Verificar si la columna tiene valores NULL
                        $nullCheckQuery = "SELECT COUNT(*) as count FROM $tableName WHERE $column IS NULL";
                        $nullCheckResult = $conn->query($nullCheckQuery);
                        $nullCount = $nullCheckResult->fetch(PDO::FETCH_ASSOC)['count'];
                        
                        if ($nullCount > 0) {
                            // Hay valores NULL, intentar arreglarlos
                            list($refTable, $refColumn) = explode('(', str_replace(')', '', $references));
                            $defaultValueQuery = "SELECT $refColumn FROM $refTable LIMIT 1";
                            $defaultValueResult = $conn->query($defaultValueQuery);
                            
                            if ($defaultValueResult->rowCount() > 0) {
                                $defaultValue = $defaultValueResult->fetch(PDO::FETCH_ASSOC)[$refColumn];
                                $updateNullsQuery = "UPDATE $tableName SET $column = $defaultValue WHERE $column IS NULL";
                                try {
                                    $conn->exec($updateNullsQuery);
                                    $tableResults[] = "Valores NULL en '$column' actualizados a $defaultValue";
                                } catch (PDOException $e) {
                                    $tableResults[] = "Error al actualizar valores NULL en '$column': " . $e->getMessage();
                                }
                            }
                        }
                        
                        // La clave foránea no existe, añadirla
                        $constraintName = "fk_{$tableName}_{$column}";
                        $addFKSQL = "ALTER TABLE $tableName ADD CONSTRAINT $constraintName FOREIGN KEY ($column) REFERENCES $references";
                        
                        try {
                            $conn->exec($addFKSQL);
                            $tableResults[] = "Clave foránea para '$column' añadida correctamente";
                        } catch (PDOException $e) {
                            $tableResults[] = "Error al añadir clave foránea para '$column': " . $e->getMessage();
                            
                            // Intentar arreglar problemas de integridad referencial
                            try {
                                list($refTable, $refColumn) = explode('(', str_replace(')', '', $references));
                                
                                // Identificar registros huérfanos
                                $orphansQuery = "
                                    SELECT t.$column 
                                    FROM $tableName t 
                                    LEFT JOIN $refTable r ON t.$column = r.$refColumn 
                                    WHERE r.$refColumn IS NULL AND t.$column IS NOT NULL
                                ";
                                $orphansResult = $conn->query($orphansQuery);
                                
                                if ($orphansResult->rowCount() > 0) {
                                    // Hay registros huérfanos, intentar arreglarlos
                                    $defaultValueQuery = "SELECT $refColumn FROM $refTable LIMIT 1";
                                    $defaultValueResult = $conn->query($defaultValueQuery);
                                    
                                    if ($defaultValueResult->rowCount() > 0) {
                                        $defaultValue = $defaultValueResult->fetch(PDO::FETCH_ASSOC)[$refColumn];
                                        
                                        // Actualizar registros huérfanos
                                        $updateOrphansQuery = "
                                            UPDATE $tableName t 
                                            LEFT JOIN $refTable r ON t.$column = r.$refColumn 
                                            SET t.$column = $defaultValue 
                                            WHERE r.$refColumn IS NULL AND t.$column IS NOT NULL
                                        ";
                                        $conn->exec($updateOrphansQuery);
                                        $tableResults[] = "Registros huérfanos en '$column' actualizados a $defaultValue";
                                        
                                        // Intentar añadir la clave foránea de nuevo
                                        try {
                                            $conn->exec($addFKSQL);
                                            $tableResults[] = "Clave foránea para '$column' añadida correctamente después de arreglar registros huérfanos";
                                        } catch (PDOException $e2) {
                                            $tableResults[] = "Error al añadir clave foránea para '$column' después de arreglar registros huérfanos: " . $e2->getMessage();
                                        }
                                    }
                                }
                            } catch (Exception $e2) {
                                $tableResults[] = "Error al intentar arreglar problemas de integridad referencial: " . $e2->getMessage();
                            }
                        }
                    }
                }
            }
            
            if (empty($tableResults)) {
                $results[$tableName] = "Tabla correcta, no se requieren cambios";
            } else {
                $results[$tableName] = $tableResults;
            }
        }
    }
    
    // Verificar y crear vistas
    $views = [
        'vista_destinos_activos' => "
            CREATE OR REPLACE VIEW vista_destinos_activos AS
            SELECT d.*, 
                   (SELECT AVG(r.puntuacion) FROM resenas r WHERE r.destino_id = d.id) as puntuacion_promedio,
                   (SELECT COUNT(*) FROM resenas r WHERE r.destino_id = d.id) as total_resenas
            FROM destinos d
            WHERE d.activo = TRUE
            ORDER BY d.destacado DESC, d.nombre
        ",
        'vista_rutas_disponibles' => "
            CREATE OR REPLACE VIEW vista_rutas_disponibles AS
            SELECT r.*, 
                   d.nombre as destino_nombre, 
                   d.imagen as destino_imagen,
                   n.nombre as nave_nombre,
                   n.capacidad as nave_capacidad
            FROM rutas r
            JOIN destinos d ON r.destino_id = d.id
            JOIN naves n ON r.nave_id = n.id
            WHERE r.activo = TRUE AND r.plazas_disponibles > 0 AND r.fecha_salida > NOW()
            ORDER BY r.fecha_salida
        ",
        'vista_actividades_por_destino' => "
            CREATE OR REPLACE VIEW vista_actividades_por_destino AS
            SELECT a.*, 
                   d.nombre as destino_nombre
            FROM actividades a
            JOIN destinos d ON a.destino_id = d.id
            WHERE a.activo = TRUE
            ORDER BY a.destino_id, a.nombre
        ",
        'vista_reservas_completas' => "
            CREATE OR REPLACE VIEW vista_reservas_completas AS
            SELECT r.*, 
                   u.nombre as usuario_nombre, 
                   u.email as usuario_email,
                   rt.nombre as ruta_nombre,
                   d.nombre as destino_nombre,
                   n.nombre as nave_nombre,
                   (SELECT COUNT(*) FROM actividades_reservadas ar WHERE ar.reserva_id = r.id) as total_actividades,
                   (SELECT SUM(ar.precio_total) FROM actividades_reservadas ar WHERE ar.reserva_id = r.id) as precio_actividades
            FROM reservas r
            JOIN usuarios u ON r.usuario_id = u.id
            JOIN rutas rt ON r.ruta_id = rt.id
            JOIN destinos d ON rt.destino_id = d.id
            JOIN naves n ON r.nave_id = n.id
            ORDER BY r.fecha_reserva DESC
        "
    ];
    
    foreach ($views as $viewName => $viewSQL) {
        try {
            $conn->exec($viewSQL);
            $results[$viewName] = "Vista creada o actualizada correctamente";
        } catch (PDOException $e) {
            $results[$viewName] = "Error al crear vista: " . $e->getMessage();
        }
    }
    
    // Verificar y crear procedimientos almacenados
    $procedures = [
        'buscar_destinos' => "
            DROP PROCEDURE IF EXISTS buscar_destinos;
            CREATE PROCEDURE buscar_destinos(
                IN p_tipo VARCHAR(20),
                IN p_min_precio DECIMAL(10,2),
                IN p_max_precio DECIMAL(10,2),
                IN p_max_duracion INT,
                IN p_busqueda VARCHAR(100)
            )
            BEGIN
                SELECT d.*
                FROM destinos d
                WHERE d.activo = TRUE
                  AND (p_tipo IS NULL OR d.tipo = p_tipo)
                  AND (p_min_precio IS NULL OR d.precio >= p_min_precio)
                  AND (p_max_precio IS NULL OR d.precio <= p_max_precio)
                  AND (p_max_duracion IS NULL OR d.duracion <= p_max_duracion)
                  AND (p_busqueda IS NULL OR 
                       d.nombre LIKE CONCAT('%', p_busqueda, '%') OR 
                       d.descripcion LIKE CONCAT('%', p_busqueda, '%'))
                ORDER BY d.destacado DESC, d.nombre;
            END
        ",
        'calcular_puntuacion_promedio' => "
            DROP FUNCTION IF EXISTS calcular_puntuacion_promedio;
            CREATE FUNCTION calcular_puntuacion_promedio(p_destino_id INT) 
            RETURNS DECIMAL(3,1)
            DETERMINISTIC
            BEGIN
                DECLARE v_puntuacion DECIMAL(3,1);
                
                SELECT AVG(puntuacion) INTO v_puntuacion
                FROM resenas
                WHERE destino_id = p_destino_id;
                
                RETURN COALESCE(v_puntuacion, 0);
            END
        ",
        'cancelar_reserva' => "
            DROP PROCEDURE IF EXISTS cancelar_reserva;
            CREATE PROCEDURE cancelar_reserva(
                IN p_reserva_id INT,
                IN p_usuario_id INT,
                OUT p_resultado BOOLEAN,
                OUT p_mensaje VARCHAR(255)
            )
            BEGIN
                DECLARE v_estado VARCHAR(20);
                DECLARE v_ruta_id INT;
                DECLARE v_numero_pasajeros INT;
                DECLARE v_reserva_usuario_id INT;
                
                -- Verificar si la reserva existe y pertenece al usuario
                SELECT estado, ruta_id, numero_pasajeros, usuario_id 
                INTO v_estado, v_ruta_id, v_numero_pasajeros, v_reserva_usuario_id
                FROM reservas 
                WHERE id = p_reserva_id;
                
                -- Verificar si la reserva pertenece al usuario
                IF v_reserva_usuario_id <> p_usuario_id THEN
                    SET p_resultado = FALSE;
                    SET p_mensaje = 'La reserva no pertenece a este usuario';
                ELSEIF v_estado = 'completada' THEN
                    SET p_resultado = FALSE;
                    SET p_mensaje = 'No se puede cancelar una reserva completada';
                ELSEIF v_estado = 'cancelada' THEN
                    SET p_resultado = FALSE;
                    SET p_mensaje = 'La reserva ya está cancelada';
                ELSE
                    -- Iniciar transacción
                    START TRANSACTION;
                    
                    -- Actualizar estado de la reserva
                    UPDATE reservas 
                    SET estado = 'cancelada' 
                    WHERE id = p_reserva_id;
                    
                    -- Devolver plazas a la ruta
                    UPDATE rutas 
                    SET plazas_disponibles = plazas_disponibles + v_numero_pasajeros
                    WHERE id = v_ruta_id;
                    
                    -- Registrar reembolso si hay pagos
                    UPDATE pagos
                    SET estado = 'reembolsado'
                    WHERE reserva_id = p_reserva_id AND estado = 'completado';
                    
                    COMMIT;
                    
                    SET p_resultado = TRUE;
                    SET p_mensaje = 'Reserva cancelada correctamente';
                END IF;
            END
        ",
        'crear_reserva_completa' => "
            DROP PROCEDURE IF EXISTS crear_reserva_completa;
            CREATE PROCEDURE crear_reserva_completa(
                IN p_usuario_id INT,
                IN p_ruta_id INT,
                IN p_numero_pasajeros INT,
                IN p_actividades_json JSON,
                OUT p_reserva_id INT,
                OUT p_precio_total DECIMAL(10,2)
            )
            BEGIN
                DECLARE v_precio_ruta DECIMAL(10,2);
                DECLARE v_nave_id INT;
                DECLARE v_fecha_salida DATE;
                DECLARE v_fecha_regreso DATE;
                DECLARE v_actividad_id INT;
                DECLARE v_cantidad INT;
                DECLARE v_precio_actividad DECIMAL(10,2);
                DECLARE v_precio_actividades DECIMAL(10,2) DEFAULT 0;
                DECLARE v_index INT DEFAULT 0;
                DECLARE v_actividades_count INT;
                
                -- Obtener información de la ruta
                SELECT precio, nave_id, fecha_salida, fecha_regreso 
                INTO v_precio_ruta, v_nave_id, v_fecha_salida, v_fecha_regreso
                FROM rutas WHERE id = p_ruta_id;
                
                -- Calcular precio base de la ruta
                SET p_precio_total = v_precio_ruta * p_numero_pasajeros;
                
                -- Iniciar transacción
                START TRANSACTION;
                
                -- Crear la reserva
                INSERT INTO reservas (
                    usuario_id, 
                    ruta_id, 
                    numero_pasajeros, 
                    precio_total, 
                    estado,
                    nave_id,
                    fecha_salida,
                    fecha_regreso
                ) VALUES (
                    p_usuario_id, 
                    p_ruta_id, 
                    p_numero_pasajeros, 
                    p_precio_total, 
                    'pendiente',
                    v_nave_id,
                    v_fecha_salida,
                    v_fecha_regreso
                );
                
                SET p_reserva_id = LAST_INSERT_ID();
                
                -- Procesar actividades si existen
                SET v_actividades_count = JSON_LENGTH(p_actividades_json);
                
                WHILE v_index < v_actividades_count DO
                    -- Extraer datos de cada actividad
                    SET v_actividad_id = JSON_EXTRACT(p_actividades_json, CONCAT('$[', v_index, '].id'));
                    SET v_cantidad = JSON_EXTRACT(p_actividades_json, CONCAT('$[', v_index, '].cantidad'));
                    
                    -- Obtener precio de la actividad
                    SELECT precio INTO v_precio_actividad FROM actividades WHERE id = v_actividad_id;
                    
                    -- Calcular precio total de esta actividad
                    SET v_precio_actividades = v_precio_actividades + (v_precio_actividad * v_cantidad);
                    
                    -- Insertar actividad reservada
                    INSERT INTO actividades_reservadas (
                        reserva_id, 
                        actividad_id, 
                        cantidad, 
                        precio_total,
                        precio
                    ) VALUES (
                        p_reserva_id, 
                        v_actividad_id, 
                        v_cantidad, 
                        v_precio_actividad * v_cantidad,
                        v_precio_actividad
                    );
                    
                    SET v_index = v_index + 1;
                END WHILE;
                
                -- Actualizar precio total de la reserva incluyendo actividades
                SET p_precio_total = p_precio_total + v_precio_actividades;
                
                UPDATE reservas 
                SET precio_total = p_precio_total
                WHERE id = p_reserva_id;
                
                -- Actualizar plazas disponibles en la ruta
                UPDATE rutas 
                SET plazas_disponibles = plazas_disponibles - p_numero_pasajeros
                WHERE id = p_ruta_id;
                
                COMMIT;
            END
        "
    ];
    
    foreach ($procedures as $procName => $procSQL) {
        try {
            $conn->exec($procSQL);
            $results[$procName] = "Procedimiento almacenado creado o actualizado correctamente";
        } catch (PDOException $e) {
            $results[$procName] = "Error al crear procedimiento almacenado: " . $e->getMessage();
        }
    }
    
    $response = [
        'status' => 'success',
        'message' => 'Verificación y reparación de tablas completada',
        'results' => $results
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    sendJsonError('Error al verificar y reparar tablas: ' . $e->getMessage());
}
?>
