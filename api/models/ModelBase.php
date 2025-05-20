<?php
/**
 * Clase base para todos los modelos
 * Proporciona funcionalidad común para todos los modelos
 */
class ModelBase {
    // Propiedades de la base de datos
    protected $conn;
    protected $table_name = ''; // Debe ser sobrescrito por las clases hijas
    protected $primary_key = 'id';
    protected $adapter_class = null;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Definir la ruta base si no está definida
        if (!defined('BASE_PATH')) {
            define('BASE_PATH', dirname(dirname(__FILE__)));
        }
        
        // Obtener conexión a la base de datos
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
        
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
        }
    }
    
    /**
     * Obtener todos los registros
     * 
     * @param array $options Opciones para la consulta (orderBy, limit, offset)
     * @return array Registros encontrados
     */
    public function getAll($options = array()) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return array();
        }
        
        $orderBy = isset($options['orderBy']) ? $options['orderBy'] : $this->primary_key . " ASC";
        $limit = isset($options['limit']) ? (int)$options['limit'] : 0;
        $offset = isset($options['offset']) ? (int)$options['offset'] : 0;
        
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name;
            
            // Añadir ORDER BY
            $query .= " ORDER BY " . $orderBy;
            
            // Añadir LIMIT y OFFSET si se especifican
            if ($limit > 0) {
                $query .= " LIMIT " . $limit;
                if ($offset > 0) {
                    $query .= " OFFSET " . $offset;
                }
            }
            
            // Preparar y ejecutar consulta
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            // Obtener resultados
            $results = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Convertir datos si hay un adaptador
                if ($this->adapter_class && class_exists($this->adapter_class)) {
                    $adapter = $this->adapter_class;
                    $row = $adapter::fromDatabase($row);
                }
                $results[] = $row;
            }
            
            return $results;
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::getAll: " . $e->getMessage());
            return array();
        }
    }
    
    /**
     * Obtener un registro por su ID
     * 
     * @param int $id ID del registro
     * @return array|false Registro encontrado o false si no se encuentra
     */
    public function getById($id) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return false;
        }
        
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name . " WHERE " . $this->primary_key . " = :id";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':id', $id);
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultado
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convertir datos si hay un adaptador
            if ($row && $this->adapter_class && class_exists($this->adapter_class)) {
                $adapter = $this->adapter_class;
                $row = $adapter::fromDatabase($row);
            }
            
            return $row;
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::getById: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Crear un nuevo registro
     * 
     * @param array $data Datos del registro
     * @return int|false ID del registro creado o false si falla
     */
    public function create($data) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return false;
        }
        
        try {
            // Convertir datos si hay un adaptador
            if ($this->adapter_class && class_exists($this->adapter_class)) {
                $adapter = $this->adapter_class;
                $data = $adapter::toDatabase($data);
            }
            
            // Crear consulta
            $fields = array_keys($data);
            $placeholders = array_map(function($field) {
                return ':' . $field;
            }, $fields);
            
            $query = "INSERT INTO " . $this->table_name . " (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            foreach ($data as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }
            
            // Ejecutar consulta
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::create: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Actualizar un registro
     * 
     * @param int $id ID del registro
     * @param array $data Datos a actualizar
     * @return bool Éxito o fracaso
     */
    public function update($id, $data) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return false;
        }
        
        try {
            // Convertir datos si hay un adaptador
            if ($this->adapter_class && class_exists($this->adapter_class)) {
                $adapter = $this->adapter_class;
                $data = $adapter::toDatabase($data);
            }
            
            // Crear consulta
            $fields = array_map(function($field) {
                return $field . ' = :' . $field;
            }, array_keys($data));
            
            $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE " . $this->primary_key . " = :id";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':id', $id);
            foreach ($data as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }
            
            // Ejecutar consulta
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::update: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Eliminar un registro
     * 
     * @param int $id ID del registro
     * @return bool Éxito o fracaso
     */
    public function delete($id) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return false;
        }
        
        try {
            // Crear consulta
            $query = "DELETE FROM " . $this->table_name . " WHERE " . $this->primary_key . " = :id";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':id', $id);
            
            // Ejecutar consulta
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::delete: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Contar registros
     * 
     * @param array $conditions Condiciones para la consulta
     * @return int Número de registros
     */
    public function count($conditions = array()) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return 0;
        }
        
        try {
            // Crear consulta
            $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
            
            // Añadir condiciones si se especifican
            if (!empty($conditions)) {
                $query .= " WHERE ";
                $clauses = array();
                foreach ($conditions as $field => $value) {
                    $clauses[] = $field . " = :" . $field;
                }
                $query .= implode(' AND ', $clauses);
            }
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros si hay condiciones
            if (!empty($conditions)) {
                foreach ($conditions as $field => $value) {
                    $stmt->bindValue(':' . $field, $value);
                }
            }
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultado
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return (int)$row['total'];
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::count: " . $e->getMessage());
            return 0;
        }
    }
}
