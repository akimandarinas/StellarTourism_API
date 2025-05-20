<?php
// Definir la ruta base si no está definida
if (!defined('BASE_PATH')) {
   define('BASE_PATH', dirname(dirname(__FILE__)));
}

require_once BASE_PATH . '/config/database.php';
require_once __DIR__ . '/../utils/response_utils.php';

// Establecer cabeceras para JSON
header('Content-Type: application/json');

// Inicializar la conexión a la base de datos
try {
   // Usar la clase Database para obtener la conexión
   $db = Database::getInstance()->getConnection();
   
   if (!$db) {
       sendJsonResponse([
           'status' => 'error',
           'message' => 'No se pudo establecer conexión con la base de datos',
           'error' => Database::getInstance()->getLastError()
       ], 500);
       exit;
   }
} catch (Exception $e) {
   sendJsonResponse([
       'status' => 'error',
       'message' => 'Error al conectar con la base de datos',
       'error' => $e->getMessage()
   ], 500);
   exit;
}

// Función para verificar la conexión a la base de datos
function checkDatabaseConnection() {
   global $db;
   
   try {
       if ($db && $db->getAttribute(PDO::ATTR_CONNECTION_STATUS)) {
           return [
               'status' => 'success',
               'message' => 'Conexión a la base de datos establecida correctamente',
               'connection_info' => $db->getAttribute(PDO::ATTR_CONNECTION_STATUS)
           ];
       } else {
           return [
               'status' => 'error',
               'message' => 'No se pudo establecer conexión con la base de datos'
           ];
       }
   } catch (PDOException $e) {
       return [
           'status' => 'error',
           'message' => 'Error al verificar la conexión a la base de datos',
           'error' => $e->getMessage()
       ];
   }
}

// Función para obtener todas las tablas de la base de datos
function getAllTables() {
   global $db;
   
   try {
       $stmt = $db->query("SHOW TABLES");
       $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
       
       return [
           'status' => 'success',
           'count' => count($tables),
           'tables' => $tables
       ];
   } catch (PDOException $e) {
       return [
           'status' => 'error',
           'message' => 'Error al obtener las tablas de la base de datos',
           'error' => $e->getMessage()
       ];
   }
}

// Función para verificar la estructura de una tabla
function checkTableStructure($tableName) {
   global $db;
   
   try {
       // Verificar si la tabla existe
       $stmt = $db->query("SHOW TABLES LIKE '$tableName'");
       if ($stmt->rowCount() === 0) {
           return [
               'status' => 'error',
               'message' => "La tabla '$tableName' no existe"
           ];
       }
       
       // Obtener la estructura de la tabla
       $stmt = $db->query("DESCRIBE $tableName");
       $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
       
       // Obtener índices de la tabla
       $stmt = $db->query("SHOW INDEX FROM $tableName");
       $indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
       
       return [
           'status' => 'success',
           'table' => $tableName,
           'columns' => $columns,
           'indexes' => $indexes
       ];
   } catch (PDOException $e) {
       return [
           'status' => 'error',
           'message' => "Error al verificar la estructura de la tabla '$tableName'",
           'error' => $e->getMessage()
       ];
   }
}

// Función para verificar la estructura esperada de las tablas principales
function checkExpectedStructure() {
   $expectedTables = [
       'destinos' => [
           'id', 'nombre', 'descripcion', 'tipo', 'distancia_tierra', 'tiempo_viaje', 'gravedad', 
           'temperatura_min', 'temperatura_max', 'imagen_url', 'modelo_3d_url', 'destacado', 'activo',
           'imagen', 'precio', 'duracion', 'distancia', 'temperatura', 'fecha_creacion', 'fecha_actualizacion'
       ],
       'naves' => [
           'id', 'nombre', 'descripcion', 'tipo', 'capacidad_pasajeros', 'velocidad_maxima', 'autonomia',
           'imagen_url', 'modelo_3d_url', 'destacado', 'activo', 'imagen', 'capacidad', 'velocidad', 'estado',
           'fecha_creacion', 'fecha_actualizacion'
       ],
       'rutas' => [
           'id', 'destino_id', 'nave_id', 'nombre', 'descripcion', 'duracion', 'distancia', 'precio',
           'plazas_disponibles', 'fecha_salida', 'fecha_regreso', 'destacado', 'activo', 'origen_id',
           'fecha_creacion', 'fecha_actualizacion'
       ],
       'actividades' => [
           'id', 'destino_id', 'nombre', 'descripcion', 'duracion', 'nivel_dificultad', 'precio',
           'imagen_url', 'activo', 'dificultad', 'fecha_creacion', 'fecha_actualizacion'
       ],
       'reservas' => [
           'id', 'usuario_id', 'ruta_id', 'numero_pasajeros', 'precio_total', 'estado', 'nave_id',
           'fecha_salida', 'fecha_regreso', 'fecha_reserva', 'fecha_actualizacion'
       ],
       'pagos' => [
           'id', 'reserva_id', 'monto', 'metodo_pago', 'referencia_pago', 'estado', 'fecha_pago',
           'fecha', 'metodo', 'referencia', 'fecha_actualizacion'
       ],
       'resenas' => [
           'id', 'usuario_id', 'destino_id', 'titulo', 'comentario', 'puntuacion', 'calificacion',
           'fecha', 'fecha_creacion', 'fecha_actualizacion'
       ],
       'usuarios' => [
           'id', 'firebase_uid', 'nombre', 'apellidos', 'email', 'password', 'telefono', 'fecha_nacimiento',
           'nacionalidad', 'direccion', 'estado', 'rol', 'fecha_registro', 'fecha_actualizacion'
       ],
       'actividades_reservadas' => [
           'id', 'reserva_id', 'actividad_id', 'cantidad', 'precio', 'precio_total', 'fecha_creacion'
       ],
       'notificaciones_suscripciones' => [
           'id', 'usuario_id', 'endpoint', 'auth', 'p256dh', 'fecha_creacion', 'ultima_actualizacion'
       ],
       'notificaciones_historial' => [
           'id', 'usuario_id', 'titulo', 'mensaje', 'tipo', 'leida', 'datos_adicionales', 'fecha_creacion'
       ],
       'webhook_events' => [
           'id', 'tipo_evento', 'payload', 'estado', 'intentos', 'fecha_creacion', 'fecha_procesamiento',
           'error_mensaje', 'destino_url', 'headers', 'respuesta', 'codigo_respuesta'
       ],
       'webhook_configuracion' => [
           'id', 'nombre', 'url', 'eventos', 'secreto', 'activo', 'fecha_creacion', 'ultima_actualizacion'
       ]
   ];
   
   $results = [];
   
   foreach ($expectedTables as $tableName => $expectedColumns) {
       $tableStructure = checkTableStructure($tableName);
       
       if ($tableStructure['status'] === 'success') {
           $existingColumns = array_column($tableStructure['columns'], 'Field');
           $missingColumns = array_diff($expectedColumns, $existingColumns);
           $extraColumns = array_diff($existingColumns, $expectedColumns);
           
           $results[$tableName] = [
               'status' => empty($missingColumns) ? 'success' : 'warning',
               'exists' => true,
               'missing_columns' => $missingColumns,
               'extra_columns' => $extraColumns,
               'structure' => $tableStructure['columns']
           ];
       } else {
           $results[$tableName] = [
               'status' => 'error',
               'exists' => false,
               'message' => $tableStructure['message']
           ];
       }
   }
   
   return $results;
}

// Función para verificar procedimientos almacenados y funciones
function checkStoredProceduresAndFunctions() {
    global $db;
    
    try {
        // Verificar procedimientos almacenados
        $stmt = $db->query("SHOW PROCEDURE STATUS WHERE Db = DATABASE()");
        $procedures = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Verificar funciones
        $stmt = $db->query("SHOW FUNCTION STATUS WHERE Db = DATABASE()");
        $functions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Verificar vistas
        $stmt = $db->query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
        $views = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        
        return [
            'status' => 'success',
            'procedures' => $procedures,
            'functions' => $functions,
            'views' => $views
        ];
    } catch (PDOException $e) {
        return [
            'status' => 'error',
            'message' => 'Error al verificar procedimientos almacenados y funciones',
            'error' => $e->getMessage()
        ];
    }
}

// Función para generar SQL para crear tablas faltantes
function generateCreateTableSQL($tableName) {
   switch ($tableName) {
       case 'destinos':
           return "CREATE TABLE destinos (
               id INT AUTO_INCREMENT PRIMARY KEY,
               nombre VARCHAR(100) NOT NULL,
               descripcion TEXT NOT NULL,
               tipo ENUM('planeta', 'luna', 'estacion', 'asteroide') NOT NULL,
               distancia_tierra BIGINT NOT NULL COMMENT 'Distancia en kilómetros',
               tiempo_viaje INT NOT NULL COMMENT 'Tiempo en días',
               gravedad DECIMAL(5,2) COMMENT 'Relativa a la Tierra (1.0)',
               temperatura_min INT COMMENT 'En grados Celsius',
               temperatura_max INT COMMENT 'En grados Celsius',
               imagen_url VARCHAR(255),
               modelo_3d_url VARCHAR(255),
               destacado BOOLEAN DEFAULT FALSE,
               activo BOOLEAN DEFAULT TRUE,
               imagen VARCHAR(255) DEFAULT NULL,
               precio DECIMAL(10,2) NOT NULL DEFAULT 0,
               duracion INT NOT NULL DEFAULT 0 COMMENT 'Duración en días',
               distancia DECIMAL(20,2) NOT NULL DEFAULT 0 COMMENT 'Distancia en kilómetros',
               temperatura DECIMAL(5,2) COMMENT 'Temperatura promedio en grados Celsius',
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
           )";
           
       case 'naves':
           return "CREATE TABLE naves (
               id INT AUTO_INCREMENT PRIMARY KEY,
               nombre VARCHAR(100) NOT NULL,
               descripcion TEXT NOT NULL,
               tipo ENUM('transporte', 'exploración', 'carga', 'lujo') NOT NULL,
               capacidad_pasajeros INT NOT NULL,
               velocidad_maxima INT NOT NULL COMMENT 'En km/h',
               autonomia INT NOT NULL COMMENT 'En días',
               imagen_url VARCHAR(255),
               modelo_3d_url VARCHAR(255),
               destacado BOOLEAN DEFAULT FALSE,
               activo BOOLEAN DEFAULT TRUE,
               imagen VARCHAR(255) DEFAULT NULL,
               capacidad INT NOT NULL DEFAULT 0,
               velocidad INT NOT NULL DEFAULT 0,
               estado ENUM('activa', 'mantenimiento', 'retirada') DEFAULT 'activa',
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
           )";
           
       case 'rutas':
           return "CREATE TABLE rutas (
               id INT AUTO_INCREMENT PRIMARY KEY,
               destino_id INT NOT NULL,
               nave_id INT NOT NULL,
               nombre VARCHAR(100) NOT NULL,
               descripcion TEXT NOT NULL,
               duracion INT NOT NULL COMMENT 'Duración en días',
               distancia BIGINT NOT NULL COMMENT 'Distancia en kilómetros',
               precio DECIMAL(10,2) NOT NULL,
               plazas_disponibles INT NOT NULL,
               fecha_salida DATE NOT NULL,
               fecha_regreso DATE NOT NULL,
               destacado BOOLEAN DEFAULT FALSE,
               activo BOOLEAN DEFAULT TRUE,
               origen_id INT NOT NULL DEFAULT 1,
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
               FOREIGN KEY (nave_id) REFERENCES naves(id) ON DELETE CASCADE
           )";
           
       case 'actividades':
           return "CREATE TABLE actividades (
               id INT AUTO_INCREMENT PRIMARY KEY,
               destino_id INT NOT NULL,
               nombre VARCHAR(100) NOT NULL,
               descripcion TEXT NOT NULL,
               duracion INT NOT NULL COMMENT 'Duración en horas',
               nivel_dificultad ENUM('baja', 'media', 'alta') NOT NULL,
               precio DECIMAL(10,2) NOT NULL,
               imagen_url VARCHAR(255),
               activo BOOLEAN DEFAULT TRUE,
               dificultad ENUM('baja', 'media', 'alta') DEFAULT 'baja',
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE
           )";
           
       case 'reservas':
           return "CREATE TABLE reservas (
               id INT AUTO_INCREMENT PRIMARY KEY,
               usuario_id INT NOT NULL,
               ruta_id INT NOT NULL,
               numero_pasajeros INT NOT NULL,
               precio_total DECIMAL(10,2) NOT NULL,
               estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
               nave_id INT NOT NULL DEFAULT 1,
               fecha_salida DATE,
               fecha_regreso DATE,
               fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
               FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE,
               FOREIGN KEY (nave_id) REFERENCES naves(id) ON DELETE CASCADE
           )";
           
       case 'pagos':
           return "CREATE TABLE pagos (
               id INT AUTO_INCREMENT PRIMARY KEY,
               reserva_id INT NOT NULL,
               monto DECIMAL(10,2) NOT NULL,
               metodo_pago ENUM('tarjeta', 'paypal', 'transferencia') NOT NULL,
               referencia_pago VARCHAR(255) NOT NULL,
               estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
               fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
               metodo ENUM('tarjeta', 'paypal', 'transferencia') DEFAULT 'tarjeta',
               referencia VARCHAR(255),
               fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE
           )";
           
       case 'resenas':
           return "CREATE TABLE resenas (
               id INT AUTO_INCREMENT PRIMARY KEY,
               usuario_id INT NOT NULL,
               destino_id INT NOT NULL,
               titulo VARCHAR(100) NOT NULL,
               comentario TEXT NOT NULL,
               puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
               calificacion INT NOT NULL DEFAULT 5,
               fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
               FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE
           )";
           
       case 'usuarios':
           return "CREATE TABLE usuarios (
               id INT AUTO_INCREMENT PRIMARY KEY,
               firebase_uid VARCHAR(128) UNIQUE,
               nombre VARCHAR(100) NOT NULL,
               apellidos VARCHAR(100) NOT NULL,
               email VARCHAR(100) NOT NULL UNIQUE,
               password VARCHAR(255),
               telefono VARCHAR(20),
               fecha_nacimiento DATE,
               nacionalidad VARCHAR(50),
               direccion TEXT,
               estado VARCHAR(50) DEFAULT 'activo',
               rol ENUM('usuario', 'admin') DEFAULT 'usuario',
               fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
           )";
           
       case 'actividades_reservadas':
           return "CREATE TABLE actividades_reservadas (
               id INT AUTO_INCREMENT PRIMARY KEY,
               reserva_id INT NOT NULL,
               actividad_id INT NOT NULL,
               cantidad INT NOT NULL DEFAULT 1,
               precio DECIMAL(10,2) NOT NULL DEFAULT 0,
               precio_total DECIMAL(10,2) NOT NULL,
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
               FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
           )";
           
       case 'notificaciones_suscripciones':
           return "CREATE TABLE notificaciones_suscripciones (
               id INT AUTO_INCREMENT PRIMARY KEY,
               usuario_id INT NOT NULL,
               endpoint VARCHAR(500) NOT NULL,
               auth VARCHAR(100) NOT NULL,
               p256dh VARCHAR(255) NOT NULL,
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
               FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
           )";
           
       case 'notificaciones_historial':
           return "CREATE TABLE notificaciones_historial (
               id INT AUTO_INCREMENT PRIMARY KEY,
               usuario_id INT NOT NULL,
               titulo VARCHAR(100) NOT NULL,
               mensaje TEXT NOT NULL,
               tipo VARCHAR(50) NOT NULL,
               leida BOOLEAN DEFAULT FALSE,
               datos_adicionales TEXT COMMENT 'JSON con datos adicionales',
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
           )";
           
       case 'webhook_events':
           return "CREATE TABLE webhook_events (
               id INT AUTO_INCREMENT PRIMARY KEY,
               tipo_evento VARCHAR(50) NOT NULL,
               payload TEXT NOT NULL,
               estado ENUM('pendiente', 'procesado', 'fallido') DEFAULT 'pendiente',
               intentos INT DEFAULT 0,
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               fecha_procesamiento TIMESTAMP NULL,
               error_mensaje TEXT,
               destino_url VARCHAR(255) NOT NULL,
               headers TEXT,
               respuesta TEXT,
               codigo_respuesta INT
           )";
           
       case 'webhook_configuracion':
           return "CREATE TABLE webhook_configuracion (
               id INT AUTO_INCREMENT PRIMARY KEY,
               nombre VARCHAR(100) NOT NULL,
               url VARCHAR(255) NOT NULL,
               eventos TEXT NOT NULL COMMENT 'JSON con los eventos a los que está suscrito',
               secreto VARCHAR(255),
               activo BOOLEAN DEFAULT TRUE,
               fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
               ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
           )";
           
       default:
           return null;
   }
}

// Función para generar SQL para añadir columnas faltantes
function generateAddColumnSQL($tableName, $missingColumns) {
   $sql = [];
   
   foreach ($missingColumns as $column) {
       switch ("$tableName.$column") {
           // Destinos
           case "destinos.tipo":
               $sql[] = "ALTER TABLE destinos ADD COLUMN tipo ENUM('planeta', 'luna', 'estacion', 'asteroide') NOT NULL AFTER descripcion";
               break;
           case "destinos.distancia_tierra":
               $sql[] = "ALTER TABLE destinos ADD COLUMN distancia_tierra BIGINT NOT NULL COMMENT 'Distancia en kilómetros' AFTER tipo";
               break;
           case "destinos.tiempo_viaje":
               $sql[] = "ALTER TABLE destinos ADD COLUMN tiempo_viaje INT NOT NULL COMMENT 'Tiempo en días' AFTER distancia_tierra";
               break;
           case "destinos.temperatura_min":
               $sql[] = "ALTER TABLE destinos ADD COLUMN temperatura_min INT COMMENT 'En grados Celsius' AFTER gravedad";
               break;
           case "destinos.temperatura_max":
               $sql[] = "ALTER TABLE destinos ADD COLUMN temperatura_max INT COMMENT 'En grados Celsius' AFTER temperatura_min";
               break;
           case "destinos.imagen_url":
               $sql[] = "ALTER TABLE destinos ADD COLUMN imagen_url VARCHAR(255) AFTER temperatura_max";
               break;
           case "destinos.modelo_3d_url":
               $sql[] = "ALTER TABLE destinos ADD COLUMN modelo_3d_url VARCHAR(255) AFTER imagen_url";
               break;
           case "destinos.destacado":
               $sql[] = "ALTER TABLE destinos ADD COLUMN destacado BOOLEAN DEFAULT FALSE AFTER modelo_3d_url";
               break;
           case "destinos.activo":
               $sql[] = "ALTER TABLE destinos ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER destacado";
               break;
               
           // Naves
           case "naves.tipo":
               $sql[] = "ALTER TABLE naves ADD COLUMN tipo ENUM('transporte', 'exploración', 'carga', 'lujo') NOT NULL AFTER descripcion";
               break;
           case "naves.capacidad_pasajeros":
               $sql[] = "ALTER TABLE naves ADD COLUMN capacidad_pasajeros INT NOT NULL AFTER tipo";
               break;
           case "naves.velocidad_maxima":
               $sql[] = "ALTER TABLE naves ADD COLUMN velocidad_maxima INT NOT NULL COMMENT 'En km/h' AFTER capacidad_pasajeros";
               break;
           case "naves.imagen_url":
               $sql[] = "ALTER TABLE naves ADD COLUMN imagen_url VARCHAR(255) AFTER autonomia";
               break;
           case "naves.modelo_3d_url":
               $sql[] = "ALTER TABLE naves ADD COLUMN modelo_3d_url VARCHAR(255) AFTER imagen_url";
               break;
           case "naves.destacado":
               $sql[] = "ALTER TABLE naves ADD COLUMN destacado BOOLEAN DEFAULT FALSE AFTER modelo_3d_url";
               break;
           case "naves.activo":
               $sql[] = "ALTER TABLE naves ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER destacado";
               break;
               
           // Rutas
           case "rutas.nombre":
               $sql[] = "ALTER TABLE rutas ADD COLUMN nombre VARCHAR(100) NOT NULL AFTER nave_id";
               break;
           case "rutas.descripcion":
               $sql[] = "ALTER TABLE rutas ADD COLUMN descripcion TEXT NOT NULL AFTER nombre";
               break;
           case "rutas.plazas_disponibles":
               $sql[] = "ALTER TABLE rutas ADD COLUMN plazas_disponibles INT NOT NULL AFTER precio";
               break;
           case "rutas.fecha_salida":
               $sql[] = "ALTER TABLE rutas ADD COLUMN fecha_salida DATE NOT NULL AFTER plazas_disponibles";
               break;
           case "rutas.fecha_regreso":
               $sql[] = "ALTER TABLE rutas ADD COLUMN fecha_regreso DATE NOT NULL AFTER fecha_salida";
               break;
           case "rutas.destacado":
               $sql[] = "ALTER TABLE rutas ADD COLUMN destacado BOOLEAN DEFAULT FALSE AFTER fecha_regreso";
               break;
           case "rutas.activo":
               $sql[] = "ALTER TABLE rutas ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER destacado";
               break;
           case "rutas.origen_id":
               $sql[] = "ALTER TABLE rutas ADD COLUMN origen_id INT NOT NULL DEFAULT 1 AFTER activo";
               break;
               
           // Actividades
           case "actividades.nivel_dificultad":
               $sql[] = "ALTER TABLE actividades ADD COLUMN nivel_dificultad ENUM('baja', 'media', 'alta') NOT NULL AFTER duracion";
               break;
           case "actividades.imagen_url":
               $sql[] = "ALTER TABLE actividades ADD COLUMN imagen_url VARCHAR(255) AFTER precio";
               break;
           case "actividades.activo":
               $sql[] = "ALTER TABLE actividades ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER imagen_url";
               break;
               
           // Reservas
           case "reservas.nave_id":
               $sql[] = "ALTER TABLE reservas ADD COLUMN nave_id INT NOT NULL DEFAULT 1 AFTER estado";
               break;
           case "reservas.fecha_salida":
               $sql[] = "ALTER TABLE reservas ADD COLUMN fecha_salida DATE AFTER nave_id";
               break;
           case "reservas.fecha_regreso":
               $sql[] = "ALTER TABLE reservas ADD COLUMN fecha_regreso DATE AFTER fecha_salida";
               break;
               
           // Pagos
           case "pagos.metodo_pago":
               $sql[] = "ALTER TABLE pagos ADD COLUMN metodo_pago ENUM('tarjeta', 'paypal', 'transferencia') NOT NULL AFTER monto";
               break;
           case "pagos.referencia_pago":
               $sql[] = "ALTER TABLE pagos ADD COLUMN referencia_pago VARCHAR(255) NOT NULL AFTER metodo_pago";
               break;
           case "pagos.fecha_pago":
               $sql[] = "ALTER TABLE pagos ADD COLUMN fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER estado";
               break;
               
           // Resenas
           case "resenas.titulo":
               $sql[] = "ALTER TABLE resenas ADD COLUMN titulo VARCHAR(100) NOT NULL AFTER destino_id";
               break;
           case "resenas.puntuacion":
               $sql[] = "ALTER TABLE resenas ADD COLUMN puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5) AFTER comentario";
               break;
               
           // Usuarios
           case "usuarios.firebase_uid":
               $sql[] = "ALTER TABLE usuarios ADD COLUMN firebase_uid VARCHAR(128) UNIQUE AFTER id";
               break;
           case "usuarios.apellidos":
               $sql[] = "ALTER TABLE usuarios ADD COLUMN apellidos VARCHAR(100) NOT NULL AFTER nombre";
               break;
           case "usuarios.fecha_nacimiento":
               $sql[] = "ALTER TABLE usuarios ADD COLUMN fecha_nacimiento DATE AFTER telefono";
               break;
           case "usuarios.nacionalidad":
               $sql[] = "ALTER TABLE usuarios ADD COLUMN nacionalidad VARCHAR(50) AFTER fecha_nacimiento";
               break;
               
           // Actividades Reservadas
           case "actividades_reservadas.precio_total":
               $sql[] = "ALTER TABLE actividades_reservadas ADD COLUMN precio_total DECIMAL(10,2) NOT NULL AFTER cantidad";
               break;
               
           // Notificaciones Suscripciones
           case "notificaciones_suscripciones.endpoint":
               $sql[] = "ALTER TABLE notificaciones_suscripciones ADD COLUMN endpoint VARCHAR(500) NOT NULL AFTER usuario_id";
               break;
           case "notificaciones_suscripciones.auth":
               $sql[] = "ALTER TABLE notificaciones_suscripciones ADD COLUMN auth VARCHAR(100) NOT NULL AFTER endpoint";
               break;
           case "notificaciones_suscripciones.p256dh":
               $sql[] = "ALTER TABLE notificaciones_suscripciones ADD COLUMN p256dh VARCHAR(255) NOT NULL AFTER auth";
               break;
               
           // Notificaciones Historial
           case "notificaciones_historial.titulo":
               $sql[] = "ALTER TABLE notificaciones_historial ADD COLUMN titulo VARCHAR(100) NOT NULL AFTER usuario_id";
               break;
           case "notificaciones_historial.mensaje":
               $sql[] = "ALTER TABLE notificaciones_historial ADD COLUMN mensaje TEXT NOT NULL AFTER titulo";
               break;
           case "notificaciones_historial.tipo":
               $sql[] = "ALTER TABLE notificaciones_historial ADD COLUMN tipo VARCHAR(50) NOT NULL AFTER mensaje";
               break;
           case "notificaciones_historial.leida":
               $sql[] = "ALTER TABLE notificaciones_historial ADD COLUMN leida BOOLEAN DEFAULT FALSE AFTER tipo";
               break;
           case "notificaciones_historial.datos_adicionales":
               $sql[] = "ALTER TABLE notificaciones_historial ADD COLUMN datos_adicionales TEXT COMMENT 'JSON con datos adicionales' AFTER leida";
               break;
               
           // Webhook Events
           case "webhook_events.tipo_evento":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN tipo_evento VARCHAR(50) NOT NULL AFTER id";
               break;
           case "webhook_events.payload":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN payload TEXT NOT NULL AFTER tipo_evento";
               break;
           case "webhook_events.estado":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN estado ENUM('pendiente', 'procesado', 'fallido') DEFAULT 'pendiente' AFTER payload";
               break;
           case "webhook_events.intentos":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN intentos INT DEFAULT 0 AFTER estado";
               break;
           case "webhook_events.fecha_procesamiento":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN fecha_procesamiento TIMESTAMP NULL AFTER fecha_creacion";
               break;
           case "webhook_events.error_mensaje":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN error_mensaje TEXT AFTER fecha_procesamiento";
               break;
           case "webhook_events.destino_url":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN destino_url VARCHAR(255) NOT NULL AFTER error_mensaje";
               break;
           case "webhook_events.headers":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN headers TEXT AFTER destino_url";
               break;
           case "webhook_events.respuesta":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN respuesta TEXT AFTER headers";
               break;
           case "webhook_events.codigo_respuesta":
               $sql[] = "ALTER TABLE webhook_events ADD COLUMN codigo_respuesta INT AFTER respuesta";
               break;
               
           // Webhook Configuracion
           case "webhook_configuracion.nombre":
               $sql[] = "ALTER TABLE webhook_configuracion ADD COLUMN nombre VARCHAR(100) NOT NULL AFTER id";
               break;
           case "webhook_configuracion.url":
               $sql[] = "ALTER TABLE webhook_configuracion ADD COLUMN url VARCHAR(255) NOT NULL AFTER nombre";
               break;
           case "webhook_configuracion.eventos":
               $sql[] = "ALTER TABLE webhook_configuracion ADD COLUMN eventos TEXT NOT NULL COMMENT 'JSON con los eventos a los que está suscrito' AFTER url";
               break;
           case "webhook_configuracion.secreto":
               $sql[] = "ALTER TABLE webhook_configuracion ADD COLUMN secreto VARCHAR(255) AFTER eventos";
               break;
           case "webhook_configuracion.activo":
               $sql[] = "ALTER TABLE webhook_configuracion ADD COLUMN activo BOOLEAN DEFAULT TRUE AFTER secreto";
               break;
               
           default:
               $sql[] = "ALTER TABLE $tableName ADD COLUMN $column VARCHAR(255)";
               break;
       }
   }
   
   return $sql;
}

// Función para generar SQL para crear procedimientos almacenados y funciones
function generateStoredProceduresAndFunctionsSQL() {
    $sql = [];
    
    // Procedimiento buscar_destinos
    $sql['buscar_destinos'] = "
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
    END";
    
    // Función calcular_puntuacion_promedio
    $sql['calcular_puntuacion_promedio'] = "
    CREATE FUNCTION calcular_puntuacion_promedio(p_destino_id INT) 
    RETURNS DECIMAL(3,1)
    DETERMINISTIC
    BEGIN
        DECLARE v_puntuacion DECIMAL(3,1);
        
        SELECT AVG(puntuacion) INTO v_puntuacion
        FROM resenas
        WHERE destino_id = p_destino_id;
        
        RETURN COALESCE(v_puntuacion, 0);
    END";
    
    // Procedimiento cancelar_reserva
    $sql['cancelar_reserva'] = "
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
    END";
    
    // Procedimiento crear_reserva_completa
    $sql['crear_reserva_completa'] = "
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
    END";
    
    return $sql;
}

// Ejecutar las verificaciones
$connectionCheck = checkDatabaseConnection();
$tablesInfo = getAllTables();
$structureCheck = checkExpectedStructure();
$proceduresAndFunctions = checkStoredProceduresAndFunctions();

// Preparar recomendaciones y scripts SQL
$recommendations = [];
$sqlScripts = [];

foreach ($structureCheck as $tableName => $info) {
   if ($info['status'] === 'error' && !$info['exists']) {
       $recommendations[] = "Crear la tabla '$tableName'";
       $sqlScripts[$tableName]['create'] = generateCreateTableSQL($tableName);
   } elseif ($info['status'] === 'warning' && !empty($info['missing_columns'])) {
       $recommendations[] = "Añadir columnas faltantes a la tabla '$tableName': " . implode(', ', $info['missing_columns']);
       $sqlScripts[$tableName]['add_columns'] = generateAddColumnSQL($tableName, $info['missing_columns']);
   }
}

// Verificar procedimientos almacenados y funciones
$expectedProcedures = ['buscar_destinos', 'cancelar_reserva', 'crear_reserva_completa'];
$expectedFunctions = ['calcular_puntuacion_promedio'];

$existingProcedures = [];
$existingFunctions = [];

if ($proceduresAndFunctions['status'] === 'success') {
    foreach ($proceduresAndFunctions['procedures'] as $procedure) {
        $existingProcedures[] = $procedure['Name'];
    }
    
    foreach ($proceduresAndFunctions['functions'] as $function) {
        $existingFunctions[] = $function['Name'];
    }
    
    $missingProcedures = array_diff($expectedProcedures, $existingProcedures);
    $missingFunctions = array_diff($expectedFunctions, $existingFunctions);
    
    if (!empty($missingProcedures)) {
        $recommendations[] = "Crear procedimientos almacenados faltantes: " . implode(', ', $missingProcedures);
        foreach ($missingProcedures as $procedure) {
            $sqlScripts['procedures'][$procedure] = generateStoredProceduresAndFunctionsSQL()[$procedure];
        }
    }
    
    if (!empty($missingFunctions)) {
        $recommendations[] = "Crear funciones faltantes: " . implode(', ', $missingFunctions);
        foreach ($missingFunctions as $function) {
            $sqlScripts['functions'][$function] = generateStoredProceduresAndFunctionsSQL()[$function];
        }
    }
}

// Preparar la respuesta
$response = [
   'connection' => $connectionCheck,
   'tables' => $tablesInfo,
   'structure_check' => $structureCheck,
   'procedures_and_functions' => $proceduresAndFunctions,
   'recommendations' => $recommendations,
   'sql_scripts' => $sqlScripts
];

// Enviar la respuesta
echo json_encode($response, JSON_PRETTY_PRINT);
?>
