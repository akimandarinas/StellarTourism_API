<?php
/**
* Clase para gestionar la conexión a la base de datos
* Implementa el patrón Singleton
*/
class Database {
   private static $instance = null;
   private $connection;
   private $lastError = null;
   
   /**
    * Constructor privado para evitar instanciación directa
    */
   private function __construct() {
       $this->connect();
   }
   
   /**
    * Obtener instancia única de la clase
    * 
    * @return Database
    */
   public static function getInstance() {
       if (self::$instance === null) {
           self::$instance = new self();
       }
       
       return self::$instance;
   }

   /**
    * Obtener directamente la conexión a la base de datos
    * 
    * @return PDO
    */
   public static function getDB() {
       return self::getInstance()->getConnection();
   }
   
   /**
    * Establecer conexión con la base de datos
    */
   private function connect() {
       try {
           // Cargar configuración de la base de datos
           $dbHost = $this->getConfigValue('DB_HOST', 'localhost');
           $dbName = $this->getConfigValue('DB_DATABASE', 'stellar_tourism');
           $dbUser = $this->getConfigValue('DB_USERNAME', 'root');
           $dbPass = $this->getConfigValue('DB_PASSWORD', '');
           
           // Registrar valores para diagnóstico (sin contraseñas)
           error_log("Intentando conectar a la base de datos: Host=$dbHost, DB=$dbName, User=$dbUser");
           
           // Usar PDO en lugar de funciones mysql_* obsoletas
           $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
           $options = [
               PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
               PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
               PDO::ATTR_EMULATE_PREPARES => false,
               PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
           ];
           
           // Intentar conectar primero sin la base de datos específica
           try {
               $this->connection = new PDO("mysql:host={$dbHost};charset=utf8mb4", $dbUser, $dbPass, $options);
               
               // Verificar si la base de datos existe
               $stmt = $this->connection->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$dbName}'");
               if ($stmt->rowCount() === 0) {
                   // La base de datos no existe, intentar crearla
                   error_log("La base de datos '{$dbName}' no existe. Intentando crearla...");
                   $this->connection->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                   error_log("Base de datos '{$dbName}' creada exitosamente.");
               }
               
               // Conectar a la base de datos específica
               $this->connection = new PDO($dsn, $dbUser, $dbPass, $options);
               error_log("Conexión a la base de datos establecida exitosamente.");
           } catch (PDOException $e) {
               // Si falla la conexión inicial, lanzar la excepción original
               throw $e;
           }
       } catch (PDOException $e) {
           // Guardar el error para diagnóstico
           $this->lastError = $e->getMessage();
           error_log("Error de conexión a la base de datos: " . $e->getMessage());
           
           // Crear una conexión nula para evitar errores fatales
           $this->connection = null;
           
           // Lanzar una excepción con más información
           throw new Exception("Error de conexión a la base de datos: " . $e->getMessage());
       }
   }
   
   /**
    * Obtener valor de configuración
    * 
    * @param string $key Clave de configuración
    * @param mixed $default Valor por defecto
    * @return mixed
    */
   private function getConfigValue($key, $default = null) {
       // Primero intentar obtener de constantes definidas
       if (defined($key)) {
           return constant($key);
       }
       
       // Luego intentar obtener de variables de entorno
       $value = getenv($key);
       if ($value !== false) {
           return $value;
       }
       
       // Finalmente, intentar cargar desde archivo .env
       $envFile = __DIR__ . '/../../api/.env';
       if (file_exists($envFile)) {
           $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
           foreach ($lines as $line) {
               // Ignorar comentarios
               if (strpos(trim($line), '#') === 0) {
                   continue;
               }
               
               // Parsear línea de configuración
               $parts = explode('=', $line, 2);
               if (count($parts) === 2) {
                   $envKey = trim($parts[0]);
                   $envValue = trim($parts[1]);
                   
                   // Eliminar comillas si existen
                   if (strpos($envValue, '"') === 0 && strrpos($envValue, '"') === strlen($envValue) - 1) {
                       $envValue = substr($envValue, 1, -1);
                   } elseif (strpos($envValue, "'") === 0 && strrpos($envValue, "'") === strlen($envValue) - 1) {
                       $envValue = substr($envValue, 1, -1);
                   }
                   
                   if ($envKey === $key) {
                       return $envValue;
                   }
               }
           }
       }
       
       // Si no se encuentra, devolver valor por defecto
       return $default;
   }
   
   /**
    * Obtener conexión a la base de datos
    * 
    * @return PDO|null
    */
   public function getConnection() {
       return $this->connection;
   }
   
   /**
    * Verificar si la conexión está activa
    * 
    * @return bool
    */
   public function isConnected() {
       return $this->connection !== null;
   }
   
   /**
    * Obtener el último error
    * 
    * @return string|null
    */
   public function getLastError() {
       return $this->lastError;
   }
   
   /**
    * Ejecutar una consulta SQL
    * 
    * @param string $sql Consulta SQL
    * @param array $params Parámetros para la consulta
    * @return PDOStatement
    */
   public function query($sql, $params = []) {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       
       try {
           $stmt = $this->connection->prepare($sql);
           $stmt->execute($params);
           return $stmt;
       } catch (PDOException $e) {
           error_log("Error en consulta SQL: " . $e->getMessage() . " - SQL: " . $sql);
           throw new Exception("Error en consulta SQL: " . $e->getMessage());
       }
   }
   
   /**
    * Obtener un solo registro
    * 
    * @param string $sql Consulta SQL
    * @param array $params Parámetros para la consulta
    * @return array|null
    */
   public function getRow($sql, $params = []) {
       $stmt = $this->query($sql, $params);
       return $stmt->fetch();
   }
   
   /**
    * Obtener múltiples registros
    * 
    * @param string $sql Consulta SQL
    * @param array $params Parámetros para la consulta
    * @return array
    */
   public function getRows($sql, $params = []) {
       $stmt = $this->query($sql, $params);
       return $stmt->fetchAll();
   }
   
   /**
    * Obtener un solo valor
    * 
    * @param string $sql Consulta SQL
    * @param array $params Parámetros para la consulta
    * @return mixed
    */
   public function getValue($sql, $params = []) {
       $stmt = $this->query($sql, $params);
       return $stmt->fetchColumn();
   }
   
   /**
    * Insertar un registro
    * 
    * @param string $table Nombre de la tabla
    * @param array $data Datos a insertar (columna => valor)
    * @return int ID del registro insertado
    */
   public function insert($table, $data) {
       // Construir consulta
       $columns = implode(', ', array_keys($data));
       $placeholders = implode(', ', array_fill(0, count($data), '?'));
       
       $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
       
       // Ejecutar consulta
       $this->query($sql, array_values($data));
       
       // Devolver ID insertado
       return $this->connection->lastInsertId();
   }
   
   /**
    * Actualizar un registro
    * 
    * @param string $table Nombre de la tabla
    * @param array $data Datos a actualizar (columna => valor)
    * @param string $where Condición WHERE
    * @param array $params Parámetros para la condición WHERE
    * @return int Número de filas afectadas
    */
   public function update($table, $data, $where, $params = []) {
       // Construir consulta
       $set = [];
       foreach (array_keys($data) as $column) {
           $set[] = "{$column} = ?";
       }
       
       $sql = "UPDATE {$table} SET " . implode(', ', $set) . " WHERE {$where}";
       
       // Ejecutar consulta
       $stmt = $this->query($sql, array_merge(array_values($data), $params));
       
       // Devolver número de filas afectadas
       return $stmt->rowCount();
   }
   
   /**
    * Eliminar un registro
    * 
    * @param string $table Nombre de la tabla
    * @param string $where Condición WHERE
    * @param array $params Parámetros para la condición WHERE
    * @return int Número de filas afectadas
    */
   public function delete($table, $where, $params = []) {
       // Construir consulta
       $sql = "DELETE FROM {$table} WHERE {$where}";
       
       // Ejecutar consulta
       $stmt = $this->query($sql, $params);
       
       // Devolver número de filas afectadas
       return $stmt->rowCount();
   }
   
   /**
    * Iniciar una transacción
    */
   public function beginTransaction() {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       $this->connection->beginTransaction();
   }
   
   /**
    * Confirmar una transacción
    */
   public function commit() {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       $this->connection->commit();
   }
   
   /**
    * Revertir una transacción
    */
   public function rollback() {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       $this->connection->rollBack();
   }
   
   /**
    * Escapar un valor para usar en una consulta SQL
    * 
    * @param string $value Valor a escapar
    * @return string
    */
   public function escape($value) {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       // Usar PDO::quote en lugar de funciones obsoletas como mysql_real_escape_string
       return substr($this->connection->quote($value), 1, -1);
   }
   
   /**
    * Obtener el último ID insertado
    * 
    * @return string
    */
   public function lastInsertId() {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       return $this->connection->lastInsertId();
   }

   /**
    * Verificar si una tabla existe
    * 
    * @param string $tableName Nombre de la tabla
    * @return bool
    */
   public function tableExists($tableName) {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       
       $sql = "SHOW TABLES LIKE ?";
       $stmt = $this->query($sql, [$tableName]);
       return $stmt->rowCount() > 0;
   }
   
   /**
    * Verificar si una columna existe en una tabla
    * 
    * @param string $tableName Nombre de la tabla
    * @param string $columnName Nombre de la columna
    * @return bool
    */
   public function columnExists($tableName, $columnName) {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       
       $sql = "SHOW COLUMNS FROM {$tableName} LIKE ?";
       $stmt = $this->query($sql, [$columnName]);
       return $stmt->rowCount() > 0;
   }
   
   /**
    * Obtener la estructura de una tabla
    * 
    * @param string $tableName Nombre de la tabla
    * @return array
    */
   public function getTableStructure($tableName) {
       if (!$this->isConnected()) {
           throw new Exception("No hay conexión a la base de datos disponible");
       }
       
       $sql = "DESCRIBE {$tableName}";
       return $this->getRows($sql);
   }
   
   /**
    * Añadir una columna a una tabla si no existe
    * 
    * @param string $tableName Nombre de la tabla
    * @param string $columnName Nombre de la columna
    * @param string $columnDefinition Definición de la columna (tipo, restricciones, etc.)
    * @return bool
    */
   public function addColumnIfNotExists($tableName, $columnName, $columnDefinition) {
       if (!$this->columnExists($tableName, $columnName)) {
           $sql = "ALTER TABLE {$tableName} ADD COLUMN {$columnName} {$columnDefinition}";
           $this->query($sql);
           return true;
       }
       return false;
   }
   
   /**
    * Verificar y actualizar la estructura de la base de datos
    * 
    * @return array Resultado de la verificación y actualización
    */
   public function verifyAndUpdateDatabaseStructure() {
       $result = [
           'status' => 'success',
           'actions' => []
       ];
       
       try {
           // Verificar y actualizar tabla destinos
           if ($this->tableExists('destinos')) {
               $this->addColumnIfNotExists('destinos', 'imagen', 'VARCHAR(255)') && 
                   $result['actions'][] = "Añadida columna 'imagen' a la tabla 'destinos'";
               $this->addColumnIfNotExists('destinos', 'precio', 'DECIMAL(10,2) NOT NULL DEFAULT 0') && 
                   $result['actions'][] = "Añadida columna 'precio' a la tabla 'destinos'";
               $this->addColumnIfNotExists('destinos', 'duracion', 'INT NOT NULL DEFAULT 0') && 
                   $result['actions'][] = "Añadida columna 'duracion' a la tabla 'destinos'";
               $this->addColumnIfNotExists('destinos', 'distancia', 'DECIMAL(20,2) NOT NULL DEFAULT 0') && 
                   $result['actions'][] = "Añadida columna 'distancia' a la tabla 'destinos'";
               $this->addColumnIfNotExists('destinos', 'temperatura', 'DECIMAL(5,2)') && 
                   $result['actions'][] = "Añadida columna 'temperatura' a la tabla 'destinos'";
           }
           
           // Verificar y actualizar tabla naves
           if ($this->tableExists('naves')) {
               $this->addColumnIfNotExists('naves', 'imagen', 'VARCHAR(255)') && 
                   $result['actions'][] = "Añadida columna 'imagen' a la tabla 'naves'";
               $this->addColumnIfNotExists('naves', 'capacidad', 'INT NOT NULL DEFAULT 0') && 
                   $result['actions'][] = "Añadida columna 'capacidad' a la tabla 'naves'";
               $this->addColumnIfNotExists('naves', 'velocidad', 'INT NOT NULL DEFAULT 0') && 
                   $result['actions'][] = "Añadida columna 'velocidad' a la tabla 'naves'";
               $this->addColumnIfNotExists('naves', 'estado', "ENUM('activa','mantenimiento','retirada') NOT NULL DEFAULT 'activa'") && 
                   $result['actions'][] = "Añadida columna 'estado' a la tabla 'naves'";
           }
           
           // Verificar y actualizar tabla rutas
           if ($this->tableExists('rutas')) {
               $this->addColumnIfNotExists('rutas', 'origen_id', 'INT NOT NULL DEFAULT 1') && 
                   $result['actions'][] = "Añadida columna 'origen_id' a la tabla 'rutas'";
           }
           
           // Verificar y actualizar tabla actividades
           if ($this->tableExists('actividades')) {
               $this->addColumnIfNotExists('actividades', 'dificultad', "ENUM('baja','media','alta') NOT NULL DEFAULT 'baja'") && 
                   $result['actions'][] = "Añadida columna 'dificultad' a la tabla 'actividades'";
           }
           
           // Verificar y actualizar tabla reservas
           if ($this->tableExists('reservas')) {
               $this->addColumnIfNotExists('reservas', 'nave_id', 'INT NOT NULL DEFAULT 1') && 
                   $result['actions'][] = "Añadida columna 'nave_id' a la tabla 'reservas'";
               $this->addColumnIfNotExists('reservas', 'fecha_salida', 'DATE') && 
                   $result['actions'][] = "Añadida columna 'fecha_salida' a la tabla 'reservas'";
               $this->addColumnIfNotExists('reservas', 'fecha_regreso', 'DATE') && 
                   $result['actions'][] = "Añadida columna 'fecha_regreso' a la tabla 'reservas'";
           }
           
           // Verificar y actualizar tabla pagos
           if ($this->tableExists('pagos')) {
               $this->addColumnIfNotExists('pagos', 'fecha', 'DATETIME DEFAULT CURRENT_TIMESTAMP') && 
                   $result['actions'][] = "Añadida columna 'fecha' a la tabla 'pagos'";
               $this->addColumnIfNotExists('pagos', 'metodo', "ENUM('tarjeta','paypal','transferencia') NOT NULL DEFAULT 'tarjeta'") && 
                   $result['actions'][] = "Añadida columna 'metodo' a la tabla 'pagos'";
               $this->addColumnIfNotExists('pagos', 'referencia', 'VARCHAR(255)') && 
                   $result['actions'][] = "Añadida columna 'referencia' a la tabla 'pagos'";
           }
           
           // Verificar y actualizar tabla resenas
           if ($this->tableExists('resenas')) {
               $this->addColumnIfNotExists('resenas', 'calificacion', 'INT NOT NULL DEFAULT 5') && 
                   $result['actions'][] = "Añadida columna 'calificacion' a la tabla 'resenas'";
               $this->addColumnIfNotExists('resenas', 'fecha', 'DATETIME DEFAULT CURRENT_TIMESTAMP') && 
                   $result['actions'][] = "Añadida columna 'fecha' a la tabla 'resenas'";
           }
           
           // Verificar y actualizar tabla usuarios
           if ($this->tableExists('usuarios')) {
               $this->addColumnIfNotExists('usuarios', 'password', 'VARCHAR(255)') && 
                   $result['actions'][] = "Añadida columna 'password' a la tabla 'usuarios'";
               $this->addColumnIfNotExists('usuarios', 'estado', "ENUM('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo'") && 
                   $result['actions'][] = "Añadida columna 'estado' a la tabla 'usuarios'";
           }
           
           // Verificar y actualizar tabla actividades_reservadas
           if ($this->tableExists('actividades_reservadas')) {
               $this->addColumnIfNotExists('actividades_reservadas', 'precio', 'DECIMAL(10,2) NOT NULL DEFAULT 0') && 
                   $result['actions'][] = "Añadida columna 'precio' a la tabla 'actividades_reservadas'";
           }
           
           // Si no se realizaron acciones, indicarlo
           if (empty($result['actions'])) {
               $result['message'] = "No se requirieron actualizaciones en la estructura de la base de datos.";
           } else {
               $result['message'] = "Se realizaron " . count($result['actions']) . " actualizaciones en la estructura de la base de datos.";
           }
           
       } catch (Exception $e) {
           $result['status'] = 'error';
           $result['message'] = "Error al verificar y actualizar la estructura de la base de datos: " . $e->getMessage();
       }
       
       return $result;
   }
   
   /**
    * Mapear datos entre columnas antiguas y nuevas
    * 
    * @param string $tableName Nombre de la tabla
    * @param array $mappings Mapeo de columnas (columna_antigua => columna_nueva)
    * @return array Resultado del mapeo
    */
   public function mapColumnData($tableName, $mappings) {
       $result = [
           'status' => 'success',
           'actions' => []
       ];
       
       try {
           foreach ($mappings as $oldColumn => $newColumn) {
               if ($this->columnExists($tableName, $oldColumn) && $this->columnExists($tableName, $newColumn)) {
                   $sql = "UPDATE {$tableName} SET {$newColumn} = {$oldColumn} WHERE {$newColumn} IS NULL OR {$newColumn} = 0";
                   $stmt = $this->query($sql);
                   $affectedRows = $stmt->rowCount();
                   $result['actions'][] = "Mapeados datos de '{$oldColumn}' a '{$newColumn}' en la tabla '{$tableName}' ({$affectedRows} filas afectadas)";
               }
           }
           
           // Si no se realizaron acciones, indicarlo
           if (empty($result['actions'])) {
               $result['message'] = "No se requirieron mapeos de datos.";
           } else {
               $result['message'] = "Se realizaron " . count($result['actions']) . " mapeos de datos.";
           }
           
       } catch (Exception $e) {
           $result['status'] = 'error';
           $result['message'] = "Error al mapear datos entre columnas: " . $e->getMessage();
       }
       
       return $result;
   }
}

/**
* Función auxiliar para obtener una conexión a la base de datos
* 
* @return PDO|null
*/
function getConnection() {
   return Database::getDB();
}

// Verificar y actualizar la estructura de la base de datos automáticamente al cargar el archivo
if (defined('AUTO_UPDATE_DB_STRUCTURE') && AUTO_UPDATE_DB_STRUCTURE) {
    try {
        $db = Database::getInstance();
        $result = $db->verifyAndUpdateDatabaseStructure();
        
        // Mapear datos entre columnas antiguas y nuevas
        $mappings = [
            'destinos' => [
                'distancia_tierra' => 'distancia',
                'tiempo_viaje' => 'duracion',
                'imagen_url' => 'imagen',
                'temperatura_min' => 'temperatura'
            ],
            'naves' => [
                'capacidad_pasajeros' => 'capacidad',
                'velocidad_maxima' => 'velocidad',
                'imagen_url' => 'imagen'
            ],
            'actividades' => [
                'nivel_dificultad' => 'dificultad'
            ],
            'pagos' => [
                'metodo_pago' => 'metodo',
                'referencia_pago' => 'referencia',
                'fecha_pago' => 'fecha'
            ],
            'resenas' => [
                'puntuacion' => 'calificacion',
                'fecha_creacion' => 'fecha'
            ],
            'actividades_reservadas' => [
                'precio_total' => 'precio'
            ]
        ];
        
        foreach ($mappings as $table => $columnMappings) {
            $db->mapColumnData($table, $columnMappings);
        }
        
        if ($result['status'] === 'success' && !empty($result['actions'])) {
            error_log("Actualización automática de la estructura de la base de datos completada: " . $result['message']);
        }
    } catch (Exception $e) {
        error_log("Error en la actualización automática de la estructura de la base de datos: " . $e->getMessage());
    }
}
