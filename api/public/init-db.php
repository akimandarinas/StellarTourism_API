<?php
require_once __DIR__ . '/../config/env_loader.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!defined('BASE_PATH')) {
    define('BASE_PATH', dirname(__DIR__));
}

// Cargar la clase Database
require_once BASE_PATH . '/config/database.php';
$responseUtilsPath = __DIR__ . '/../utils/response_utils.php';
if (!file_exists($responseUtilsPath)) {
    function sendJsonSuccess($message, $data = []) {
        header("Content-Type: application/json");
        echo json_encode([
            "status" => "success",
            "message" => $message,
            "data" => $data
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    function sendJsonError($message, $code = 500) {
        header("Content-Type: application/json");
        http_response_code($code);
        echo json_encode([
            "status" => "error",
            "message" => $message
        ], JSON_PRETTY_PRINT);
        exit;
    }
} else {
    require_once $responseUtilsPath;
}

header('Content-Type: application/json');
function executeSQLFile($db, $file) {
    if (!file_exists($file)) {
        return [
            'success' => false,
            'message' => "El archivo $file no existe."
        ];
    }
    
    $sql = file_get_contents($file);
    $statements = explode(';', $sql);
    $errors = [];
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            try {
                $db->exec($statement);
            } catch (PDOException $e) {
                $errors[] = $e->getMessage();
            }
        }
    }
    
    if (empty($errors)) {
        return [
            'success' => true,
            'message' => "Archivo SQL ejecutado correctamente."
        ];
    } else {
        return [
            'success' => false,
            'message' => "Errores al ejecutar el archivo SQL.",
            'errors' => $errors
        ];
    }
}

function initializeDatabase($db) {
    $sql = "CREATE TABLE IF NOT EXISTS USUARIOS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        NOMBRE VARCHAR(100) NOT NULL,
        APELLIDOS VARCHAR(100),
        EMAIL VARCHAR(100) NOT NULL UNIQUE,
        PASSWORD VARCHAR(255) NOT NULL,
        TELEFONO VARCHAR(20),
        DIRECCION TEXT,
        FECHA_NACIMIENTO DATE,
        ROL ENUM('cliente', 'admin', 'operador') DEFAULT 'cliente',
        ESTADO ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla USUARIOS: " . $e->getMessage()
        ];
    }
    
    // Crear tabla DESTINOS
    $sql = "CREATE TABLE IF NOT EXISTS DESTINOS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        NOMBRE VARCHAR(100) NOT NULL,
        DESCRIPCION TEXT NOT NULL,
        TIPO ENUM('planeta', 'luna', 'estacion', 'asteroide') NOT NULL,
        DISTANCIA_TIERRA BIGINT NOT NULL COMMENT 'Distancia en kilómetros',
        TIEMPO_VIAJE INT(11) NOT NULL COMMENT 'Tiempo en días',
        GRAVEDAD DECIMAL(5,2) COMMENT 'Relativa a la Tierra (1.0)',
        TEMPERATURA_MIN INT COMMENT 'En grados Celsius',
        TEMPERATURA_MAX INT COMMENT 'En grados Celsius',
        IMAGEN_URL VARCHAR(255),
        MODELO_3D_URL VARCHAR(255),
        DESTACADO BOOLEAN DEFAULT FALSE,
        ACTIVO BOOLEAN DEFAULT TRUE,
        IMAGEN VARCHAR(255) DEFAULT NULL,
        PRECIO DECIMAL(10,2) NOT NULL DEFAULT 0,
        DURACION INT NOT NULL DEFAULT 0 COMMENT 'Duración en días',
        DISTANCIA DECIMAL(20,2) NOT NULL DEFAULT 0 COMMENT 'Distancia en kilómetros',
        TEMPERATURA DECIMAL(5,2) COMMENT 'Temperatura promedio en grados Celsius',
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla DESTINOS: " . $e->getMessage()
        ];
    }
    
    // Crear tabla NAVES
    $sql = "CREATE TABLE IF NOT EXISTS NAVES (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        NOMBRE VARCHAR(100) NOT NULL,
        DESCRIPCION TEXT NOT NULL,
        TIPO ENUM('transporte', 'exploración', 'carga', 'lujo') NOT NULL,
        CAPACIDAD_PASAJEROS INT NOT NULL,
        VELOCIDAD_MAXIMA INT NOT NULL COMMENT 'En km/h',
        AUTONOMIA INT NOT NULL COMMENT 'En días',
        IMAGEN_URL VARCHAR(255),
        MODELO_3D_URL VARCHAR(255),
        DESTACADO BOOLEAN DEFAULT FALSE,
        ACTIVO BOOLEAN DEFAULT TRUE,
        IMAGEN VARCHAR(255) DEFAULT NULL,
        CAPACIDAD INT NOT NULL DEFAULT 0,
        VELOCIDAD INT NOT NULL DEFAULT 0,
        ESTADO ENUM('activa', 'mantenimiento', 'retirada') DEFAULT 'activa',
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla NAVES: " . $e->getMessage()
        ];
    }
    
    // Crear tabla RUTAS
    $sql = "CREATE TABLE IF NOT EXISTS RUTAS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        DESTINO_ID INT(11) NOT NULL,
        NAVE_ID INT(11) NOT NULL,
        NOMBRE VARCHAR(100) NOT NULL,
        DESCRIPCION TEXT NOT NULL,
        DURACION INT NOT NULL COMMENT 'Duración en días',
        DISTANCIA BIGINT NOT NULL COMMENT 'Distancia en kilómetros',
        PRECIO DECIMAL(10,2) NOT NULL,
        PLAZAS_DISPONIBLES INT(11) NOT NULL,
        FECHA_SALIDA DATE NOT NULL,
        FECHA_REGRESO DATE NOT NULL,
        DESTACADO BOOLEAN DEFAULT FALSE,
        ACTIVO BOOLEAN DEFAULT TRUE,
        ORIGEN_ID INT NOT NULL DEFAULT 1,
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (DESTINO_ID) REFERENCES DESTINOS(ID) ON DELETE CASCADE,
        FOREIGN KEY (NAVE_ID) REFERENCES NAVES(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla RUTAS: " . $e->getMessage()
        ];
    }
    
    // Crear tabla ACTIVIDADES
    $sql = "CREATE TABLE IF NOT EXISTS ACTIVIDADES (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        DESTINO_ID INT(11) NOT NULL,
        NOMBRE VARCHAR(100) NOT NULL,
        DESCRIPCION TEXT NOT NULL,
        DURACION INT NOT NULL COMMENT 'Duración en horas',
        NIVEL_DIFICULTAD ENUM('baja', 'media', 'alta') NOT NULL,
        PRECIO DECIMAL(10,2) NOT NULL,
        IMAGEN_URL VARCHAR(255),
        ACTIVO BOOLEAN DEFAULT TRUE,
        DIFICULTAD ENUM('baja', 'media', 'alta') DEFAULT 'baja',
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (DESTINO_ID) REFERENCES DESTINOS(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla ACTIVIDADES: " . $e->getMessage()
        ];
    }
    
    // Crear tabla RESERVAS
    $sql = "CREATE TABLE IF NOT EXISTS RESERVAS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        USUARIO_ID INT(11) NOT NULL,
        RUTA_ID INT(11) NOT NULL,
        NUMERO_PASAJEROS INT(11) NOT NULL,
        PRECIO_TOTAL DECIMAL(10,2) NOT NULL,
        ESTADO ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
        NAVE_ID INT NOT NULL DEFAULT 1,
        FECHA_SALIDA DATE,
        FECHA_REGRESO DATE,
        FECHA_RESERVA TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (USUARIO_ID) REFERENCES USUARIOS(ID) ON DELETE CASCADE,
        FOREIGN KEY (RUTA_ID) REFERENCES RUTAS(ID) ON DELETE CASCADE,
        FOREIGN KEY (NAVE_ID) REFERENCES NAVES(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla RESERVAS: " . $e->getMessage()
        ];
    }
    
    // Crear tabla PAGOS
    $sql = "CREATE TABLE IF NOT EXISTS PAGOS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        RESERVA_ID INT(11) NOT NULL,
        MONTO DECIMAL(10,2) NOT NULL,
        METODO_PAGO ENUM('tarjeta', 'paypal', 'transferencia') NOT NULL,
        REFERENCIA_PAGO VARCHAR(255) NOT NULL,
        ESTADO ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
        FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
        METODO ENUM('tarjeta', 'paypal', 'transferencia') DEFAULT 'tarjeta',
        REFERENCIA VARCHAR(255),
        FECHA_PAGO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (RESERVA_ID) REFERENCES RESERVAS(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla PAGOS: " . $e->getMessage()
        ];
    }
    
    $sql = "CREATE TABLE IF NOT EXISTS RESENAS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        USUARIO_ID INT(11) NOT NULL,
        DESTINO_ID INT(11) NOT NULL,
        TITULO VARCHAR(100) NOT NULL,
        COMENTARIO TEXT NOT NULL,
        PUNTUACION INT NOT NULL CHECK (PUNTUACION BETWEEN 1 AND 5),
        CALIFICACION INT NOT NULL DEFAULT 5,
        FECHA DATETIME DEFAULT CURRENT_TIMESTAMP,
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (USUARIO_ID) REFERENCES USUARIOS(ID) ON DELETE CASCADE,
        FOREIGN KEY (DESTINO_ID) REFERENCES DESTINOS(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla RESENAS: " . $e->getMessage()
        ];
    }
    
    $sql = "CREATE TABLE IF NOT EXISTS ACTIVIDADES_RESERVADAS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        RESERVA_ID INT(11) NOT NULL,
        ACTIVIDAD_ID INT(11) NOT NULL,
        CANTIDAD INT(11) NOT NULL DEFAULT 1,
        PRECIO DECIMAL(10,2) NOT NULL DEFAULT 0,
        PRECIO_TOTAL DECIMAL(10,2) NOT NULL,
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (RESERVA_ID) REFERENCES RESERVAS(ID) ON DELETE CASCADE,
        FOREIGN KEY (ACTIVIDAD_ID) REFERENCES ACTIVIDADES(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla ACTIVIDADES_RESERVADAS: " . $e->getMessage()
        ];
    }
    
    $sql = "CREATE TABLE IF NOT EXISTS NOTIFICACIONES_SUSCRIPCIONES (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        USUARIO_ID INT(11) NOT NULL,
        ENDPOINT VARCHAR(500) NOT NULL,
        AUTH VARCHAR(100) NOT NULL,
        P256DH VARCHAR(255) NOT NULL,
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ULTIMA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (USUARIO_ID) REFERENCES USUARIOS(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla NOTIFICACIONES_SUSCRIPCIONES: " . $e->getMessage()
        ];
    }
    
    // Crear tabla NOTIFICACIONES_HISTORIAL
    $sql = "CREATE TABLE IF NOT EXISTS NOTIFICACIONES_HISTORIAL (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        USUARIO_ID INT(11) NOT NULL,
        TITULO VARCHAR(100) NOT NULL,
        MENSAJE TEXT NOT NULL,
        TIPO VARCHAR(50) NOT NULL,
        LEIDA BOOLEAN DEFAULT FALSE,
        DATOS_ADICIONALES TEXT COMMENT 'JSON con datos adicionales',
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (ID),
        FOREIGN KEY (USUARIO_ID) REFERENCES USUARIOS(ID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla NOTIFICACIONES_HISTORIAL: " . $e->getMessage()
        ];
    }
    
    // Crear tabla WEBHOOK_EVENTS
    $sql = "CREATE TABLE IF NOT EXISTS WEBHOOK_EVENTS (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        TIPO_EVENTO VARCHAR(50) NOT NULL,
        PAYLOAD TEXT NOT NULL,
        ESTADO ENUM('pendiente', 'procesado', 'fallido') DEFAULT 'pendiente',
        INTENTOS INT DEFAULT 0,
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FECHA_PROCESAMIENTO TIMESTAMP NULL,
        ERROR_MENSAJE TEXT,
        DESTINO_URL VARCHAR(255) NOT NULL,
        HEADERS TEXT,
        RESPUESTA TEXT,
        CODIGO_RESPUESTA INT,
        PRIMARY KEY (ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla WEBHOOK_EVENTS: " . $e->getMessage()
        ];
    }
    
    // Crear tabla WEBHOOK_CONFIGURACION
    $sql = "CREATE TABLE IF NOT EXISTS WEBHOOK_CONFIGURACION (
        ID INT(11) NOT NULL AUTO_INCREMENT,
        NOMBRE VARCHAR(100) NOT NULL,
        URL VARCHAR(255) NOT NULL,
        EVENTOS TEXT NOT NULL COMMENT 'JSON con los eventos a los que está suscrito',
        SECRETO VARCHAR(255),
        ACTIVO BOOLEAN DEFAULT TRUE,
        FECHA_CREACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ULTIMA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => "Error al crear la tabla WEBHOOK_CONFIGURACION: " . $e->getMessage()
        ];
    }
    
    // Crear vistas para consultas frecuentes
    $sql = "CREATE OR REPLACE VIEW VISTA_DESTINOS_ACTIVOS AS
    SELECT ID, NOMBRE, DESCRIPCION, TIPO, IMAGEN_URL, PRECIO, DURACION, DISTANCIA, TEMPERATURA
    FROM DESTINOS
    WHERE ACTIVO = TRUE";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        // Ignorar errores en vistas
    }
    
    $sql = "CREATE OR REPLACE VIEW VISTA_RUTAS_DISPONIBLES AS
    SELECT R.ID, R.NOMBRE, R.DESCRIPCION, R.PRECIO, R.FECHA_SALIDA, R.FECHA_REGRESO, 
           R.PLAZAS_DISPONIBLES, D.NOMBRE AS DESTINO, N.NOMBRE AS NAVE
    FROM RUTAS R
    JOIN DESTINOS D ON R.DESTINO_ID = D.ID
    JOIN NAVES N ON R.NAVE_ID = N.ID
    WHERE R.ACTIVO = TRUE AND R.PLAZAS_DISPONIBLES > 0 AND R.FECHA_SALIDA > CURDATE()";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        // Ignorar errores en vistas
    }
    
    $sql = "CREATE OR REPLACE VIEW VISTA_ACTIVIDADES_POR_DESTINO AS
    SELECT A.ID, A.NOMBRE, A.DESCRIPCION, A.PRECIO, A.DURACION, A.NIVEL_DIFICULTAD,
           A.IMAGEN_URL, D.NOMBRE AS DESTINO
    FROM ACTIVIDADES A
    JOIN DESTINOS D ON A.DESTINO_ID = D.ID
    WHERE A.ACTIVO = TRUE";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        // Ignorar errores en vistas
    }
    
    $sql = "CREATE OR REPLACE VIEW VISTA_RESERVAS_COMPLETAS AS
    SELECT R.ID, R.FECHA_RESERVA, R.ESTADO, R.PRECIO_TOTAL, R.NUMERO_PASAJEROS,
           U.NOMBRE AS USUARIO, U.EMAIL, RT.NOMBRE AS RUTA, D.NOMBRE AS DESTINO,
           N.NOMBRE AS NAVE, R.FECHA_SALIDA, R.FECHA_REGRESO
    FROM RESERVAS R
    JOIN USUARIOS U ON R.USUARIO_ID = U.ID
    JOIN RUTAS RT ON R.RUTA_ID = RT.ID
    JOIN DESTINOS D ON RT.DESTINO_ID = D.ID
    JOIN NAVES N ON RT.NAVE_ID = N.ID";
    
    try {
        $db->exec($sql);
    } catch (PDOException $e) {
        // Ignorar errores en vistas
    }
    
    // Crear índices para optimizar consultas
    $indices = [
        "CREATE INDEX IF NOT EXISTS idx_destinos_nombre ON DESTINOS(NOMBRE)",
        "CREATE INDEX IF NOT EXISTS idx_destinos_tipo ON DESTINOS(TIPO)",
        "CREATE INDEX IF NOT EXISTS idx_destinos_destacado ON DESTINOS(DESTACADO, ACTIVO)",
        "CREATE INDEX IF NOT EXISTS idx_destinos_precio ON DESTINOS(PRECIO)",
        "CREATE INDEX IF NOT EXISTS idx_destinos_duracion ON DESTINOS(DURACION)",
        "CREATE INDEX IF NOT EXISTS idx_destinos_temperatura ON DESTINOS(TEMPERATURA)",
        "CREATE INDEX IF NOT EXISTS idx_naves_nombre ON NAVES(NOMBRE)",
        "CREATE INDEX IF NOT EXISTS idx_naves_tipo ON NAVES(TIPO)",
        "CREATE INDEX IF NOT EXISTS idx_naves_destacado ON NAVES(DESTACADO, ACTIVO)",
        "CREATE INDEX IF NOT EXISTS idx_naves_capacidad_pasajeros ON NAVES(CAPACIDAD_PASAJEROS)",
        "CREATE INDEX IF NOT EXISTS idx_naves_velocidad_maxima ON NAVES(VELOCIDAD_MAXIMA)",
        "CREATE INDEX IF NOT EXISTS idx_naves_estado ON NAVES(ESTADO)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_nombre ON RUTAS(NOMBRE)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_destino_nave ON RUTAS(DESTINO_ID, NAVE_ID)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_fecha_salida ON RUTAS(FECHA_SALIDA)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_fecha_regreso ON RUTAS(FECHA_REGRESO)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_precio ON RUTAS(PRECIO)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_plazas ON RUTAS(PLAZAS_DISPONIBLES)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_destacado ON RUTAS(DESTACADO, ACTIVO)",
        "CREATE INDEX IF NOT EXISTS idx_rutas_origen ON RUTAS(ORIGEN_ID)",
        "CREATE INDEX IF NOT EXISTS idx_actividades_nombre ON ACTIVIDADES(NOMBRE)",
        "CREATE INDEX IF NOT EXISTS idx_actividades_destino ON ACTIVIDADES(DESTINO_ID)",
        "CREATE INDEX IF NOT EXISTS idx_actividades_nivel ON ACTIVIDADES(NIVEL_DIFICULTAD)",
        "CREATE INDEX IF NOT EXISTS idx_actividades_precio ON ACTIVIDADES(PRECIO)",
        "CREATE INDEX IF NOT EXISTS idx_actividades_duracion ON ACTIVIDADES(DURACION)",
        "CREATE INDEX IF NOT EXISTS idx_actividades_dificultad ON ACTIVIDADES(DIFICULTAD)",
        "CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON RESERVAS(USUARIO_ID)",
        "CREATE INDEX IF NOT EXISTS idx_reservas_ruta ON RESERVAS(RUTA_ID)",
        "CREATE INDEX IF NOT EXISTS idx_reservas_estado ON RESERVAS(ESTADO)",
        "CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON RESERVAS(FECHA_RESERVA)",
        "CREATE INDEX IF NOT EXISTS idx_reservas_nave ON RESERVAS(NAVE_ID)",
        "CREATE INDEX IF NOT EXISTS idx_reservas_fecha_salida ON RESERVAS(FECHA_SALIDA)",
        "CREATE INDEX IF NOT EXISTS idx_reservas_fecha_regreso ON RESERVAS(FECHA_REGRESO)",
        "CREATE INDEX IF NOT EXISTS idx_act_res_reserva ON ACTIVIDADES_RESERVADAS(RESERVA_ID)",
        "CREATE INDEX IF NOT EXISTS idx_act_res_actividad ON ACTIVIDADES_RESERVADAS(ACTIVIDAD_ID)",
        "CREATE INDEX IF NOT EXISTS idx_act_res_cantidad ON ACTIVIDADES_RESERVADAS(CANTIDAD)",
        "CREATE INDEX IF NOT EXISTS idx_act_res_precio ON ACTIVIDADES_RESERVADAS(PRECIO)",
        "CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON PAGOS(RESERVA_ID)",
        "CREATE INDEX IF NOT EXISTS idx_pagos_estado ON PAGOS(ESTADO)",
        "CREATE INDEX IF NOT EXISTS idx_pagos_metodo ON PAGOS(METODO_PAGO)",
        "CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON PAGOS(FECHA_PAGO)",
        "CREATE INDEX IF NOT EXISTS idx_pagos_monto ON PAGOS(MONTO)",
        "CREATE INDEX IF NOT EXISTS idx_pagos_referencia ON PAGOS(REFERENCIA_PAGO)",
        "CREATE INDEX IF NOT EXISTS idx_resenas_usuario ON RESENAS(USUARIO_ID)",
        "CREATE INDEX IF NOT EXISTS idx_resenas_destino ON RESENAS(DESTINO_ID)",
        "CREATE INDEX IF NOT EXISTS idx_resenas_puntuacion ON RESENAS(PUNTUACION)",
        "CREATE INDEX IF NOT EXISTS idx_resenas_fecha ON RESENAS(FECHA_CREACION)",
        "CREATE INDEX IF NOT EXISTS idx_resenas_calificacion ON RESENAS(CALIFICACION)",
        "CREATE INDEX IF NOT EXISTS idx_usuarios_email ON USUARIOS(EMAIL)",
        "CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON USUARIOS(ROL)",
        "CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON USUARIOS(ESTADO)",
        "CREATE INDEX IF NOT EXISTS idx_webhook_events_tipo ON WEBHOOK_EVENTS(TIPO_EVENTO)",
        "CREATE INDEX IF NOT EXISTS idx_webhook_events_estado ON WEBHOOK_EVENTS(ESTADO)",
        "CREATE INDEX IF NOT EXISTS idx_webhook_configuracion_activo ON WEBHOOK_CONFIGURACION(ACTIVO)",
        "CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON NOTIFICACIONES_HISTORIAL(USUARIO_ID)",
        "CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON NOTIFICACIONES_HISTORIAL(LEIDA)",
        "CREATE INDEX IF NOT EXISTS idx_notificaciones_suscripciones_usuario ON NOTIFICACIONES_SUSCRIPCIONES(USUARIO_ID)"
    ];
    
    foreach ($indices as $indice) {
        try {
            $db->exec($indice);
        } catch (PDOException $e) {
            // Ignorar errores en índices
        }
    }
    
    return [
        'success' => true,
        'message' => "Base de datos inicializada correctamente."
    ];
}

try {
    $dbInstance = Database::getInstance();
    $db = $dbInstance->getConnection();
    
    $reset = isset($_GET['reset']) && $_GET['reset'] === 'true';
    
    if ($reset) {
       $tables = [
            'VISTA_RESERVAS_COMPLETAS', 'VISTA_ACTIVIDADES_POR_DESTINO', 'VISTA_RUTAS_DISPONIBLES', 'VISTA_DESTINOS_ACTIVOS',
            'WEBHOOK_CONFIGURACION', 'WEBHOOK_EVENTS', 'NOTIFICACIONES_HISTORIAL', 'NOTIFICACIONES_SUSCRIPCIONES',
            'ACTIVIDADES_RESERVADAS', 'RESENAS', 'PAGOS', 'RESERVAS', 'ACTIVIDADES', 'RUTAS', 
            'NAVES', 'DESTINOS', 'USUARIOS'
        ];
        
        foreach ($tables as $table) {
            try {
                $db->exec("SET FOREIGN_KEY_CHECKS = 0");
                $db->exec("DROP TABLE IF EXISTS $table");
                $db->exec("DROP VIEW IF EXISTS $table");
                $db->exec("SET FOREIGN_KEY_CHECKS = 1");
            } catch (PDOException $e) {
                echo json_encode([
                    'status' => 'error',
                    'message' => "Error al eliminar la tabla $table",
                    'error' => $e->getMessage()
                ], JSON_PRETTY_PRINT);
                exit;
            }
        }
    }
    
    $result = initializeDatabase($db);
    
    if ($result['success']) {
        // Verificar si se crearon las tablas correctamente
        $tables = [
            'USUARIOS', 'DESTINOS', 'NAVES', 'RUTAS', 'ACTIVIDADES', 'RESERVAS', 
            'PAGOS', 'RESENAS', 'ACTIVIDADES_RESERVADAS', 'NOTIFICACIONES_SUSCRIPCIONES',
            'NOTIFICACIONES_HISTORIAL', 'WEBHOOK_EVENTS', 'WEBHOOK_CONFIGURACION'
        ];
        $tableStatus = [];
        
        foreach ($tables as $table) {
            $stmt = $db->query("SHOW TABLES LIKE '$table'");
            $tableStatus[$table] = [
                'exists' => $stmt->rowCount() > 0
            ];
            
            if ($tableStatus[$table]['exists']) {
                $stmt = $db->query("SELECT COUNT(*) FROM $table");
                $tableStatus[$table]['count'] = $stmt->fetchColumn();
            }
        }
        
        // Verificar si se necesitan datos de ejemplo
        $insertSampleData = isset($_GET['sample_data']) && $_GET['sample_data'] === 'true';
        
        if ($insertSampleData) {
            // Insertar datos de ejemplo en las tablas
            $sampleData = [
                "INSERT INTO USUARIOS (NOMBRE, APELLIDOS, EMAIL, PASSWORD, TELEFONO, ROL, ESTADO) 
                 VALUES 
                 ('Admin', 'Sistema', 'admin@stellartourism.com', '$2y$10$abcdefghijklmnopqrstuv', '+34600000000', 'admin', 'activo'),
                 ('Juan', 'Pérez', 'juan@example.com', '$2y$10$abcdefghijklmnopqrstuv', '+34611111111', 'cliente', 'activo'),
                 ('María', 'González', 'maria@example.com', '$2y$10$abcdefghijklmnopqrstuv', '+34622222222', 'cliente', 'activo')",
                
                "INSERT INTO DESTINOS (NOMBRE, DESCRIPCION, TIPO, DISTANCIA_TIERRA, TIEMPO_VIAJE, GRAVEDAD, TEMPERATURA_MIN, TEMPERATURA_MAX, IMAGEN_URL, DESTACADO, ACTIVO, PRECIO, DURACION, DISTANCIA, TEMPERATURA) 
                 VALUES 
                 ('Marte', 'El planeta rojo, cuarto planeta del sistema solar.', 'planeta', 225000000, 180, 0.38, -125, 20, '/images/destinos/marte.jpg', TRUE, TRUE, 12000000.00, 180, 225000000.00, -55.00),
                 ('Luna', 'Satélite natural de la Tierra.', 'luna', 384400, 3, 0.17, -173, 127, '/images/destinos/luna.jpg', TRUE, TRUE, 1500000.00, 7, 384400.00, -20.00),
                 ('Europa', 'Luna de Júpiter con océanos bajo su superficie helada.', 'luna', 628300000, 365, 0.13, -220, -160, '/images/destinos/europa.jpg', TRUE, TRUE, 25000000.00, 400, 628300000.00, -190.00)",
                
                "INSERT INTO NAVES (NOMBRE, DESCRIPCION, TIPO, CAPACIDAD_PASAJEROS, VELOCIDAD_MAXIMA, AUTONOMIA, IMAGEN_URL, DESTACADO, ACTIVO, CAPACIDAD, VELOCIDAD, ESTADO) 
                 VALUES 
                 ('Orion Explorer', 'Nave espacial de última generación para viajes interplanetarios.', 'exploración', 6, 28000, 100, '/images/naves/orion.jpg', TRUE, TRUE, 6, 28000, 'activa'),
                 ('Stellar Cruiser', 'Crucero espacial de lujo para viajes interplanetarios.', 'lujo', 120, 18000, 200, '/images/naves/cruiser.jpg', TRUE, TRUE, 120, 18000, 'activa'),
                 ('Mars Shuttle', 'Transporte rápido especializado en viajes a Marte.', 'transporte', 50, 25000, 120, '/images/naves/shuttle.jpg', TRUE, TRUE, 50, 25000, 'activa')",
                
                "INSERT INTO RUTAS (DESTINO_ID, NAVE_ID, NOMBRE, DESCRIPCION, DURACION, DISTANCIA, PRECIO, PLAZAS_DISPONIBLES, FECHA_SALIDA, FECHA_REGRESO, DESTACADO, ACTIVO, ORIGEN_ID) 
                 VALUES 
                 (1, 3, 'Expedición a Marte', 'Viaje directo al planeta rojo.', 180, 225000000, 12000000.00, 40, '2024-06-15', '2024-12-15', TRUE, TRUE, 1),
                 (2, 1, 'Tour Lunar', 'Visita a la Luna con paseos por la superficie.', 7, 384400, 1500000.00, 60, '2024-05-10', '2024-05-17', TRUE, TRUE, 1),
                 (3, 2, 'Exploración de Europa', 'Viaje a la misteriosa luna de Júpiter.', 400, 628300000, 25000000.00, 80, '2024-08-01', '2025-09-05', TRUE, TRUE, 1)",
                
                "INSERT INTO ACTIVIDADES (DESTINO_ID, NOMBRE, DESCRIPCION, DURACION, NIVEL_DIFICULTAD, PRECIO, IMAGEN_URL, ACTIVO, DIFICULTAD) 
                 VALUES 
                 (1, 'Exploración de Valles Marcianos', 'Recorrido por los impresionantes valles de Marte.', 8, 'media', 250000.00, '/images/actividades/valles_marte.jpg', TRUE, 'media'),
                 (1, 'Ascenso al Monte Olimpo', 'Escalada al volcán más alto del Sistema Solar.', 12, 'alta', 500000.00, '/images/actividades/olimpo.jpg', TRUE, 'alta'),
                 (2, 'Paseo por el Mar de la Tranquilidad', 'Visita al histórico sitio de aterrizaje del Apollo 11.', 4, 'baja', 100000.00, '/images/actividades/tranquilidad.jpg', TRUE, 'baja')"
            ];
            
            $sampleResults = [];
            foreach ($sampleData as $sql) {
                try {
                    $db->exec($sql);
                    $sampleResults[] = "Datos de ejemplo insertados correctamente";
                } catch (PDOException $e) {
                    // Ignorar errores de duplicados
                    if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                        $sampleResults[] = "Error al insertar datos de ejemplo: " . $e->getMessage();
                    }
                }
            }
            
            $tableStatus['sample_data'] = $sampleResults;
        }
        
        echo json_encode([
            'status' => 'success',
            'message' => $result['message'],
            'tables' => $tableStatus,
            'reset' => $reset
        ], JSON_PRETTY_PRINT);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => $result['message']
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
