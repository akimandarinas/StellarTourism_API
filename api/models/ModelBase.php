<?php
/*Clase base para todos los modelos
Proporciona funcionalidad común para todos los modelos*/

class ModelBase {
    // Propiedades de la base de datos
    protected $conn;
    protected $table_name = ''; // Debe ser sobrescrito por las clases hijas
    protected $primary_key = 'id';
    protected $adapter_class = null;
    public function __construct() {
        // Definir la ruta base si no está definida
        if (!defined('BASE_PATH')) {
            define('BASE_PATH', dirname(dirname(__FILE__)));
        }
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
        
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
        }
    }

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
            $query .= " ORDER BY " . $orderBy;
            if ($limit > 0) {
                $query .= " LIMIT " . $limit;
                if ($offset > 0) {
                    $query .= " OFFSET " . $offset;
                }
            }
            
            // Preparar y ejecutar consulta
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $results = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
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
    
    public function getById($id) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return false;
        }
        
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE " . $this->primary_key . " = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
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
    
    /* Crear un nuevo registro*/

    public function create($data) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return false;
        }
        
        try {
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
            
            $stmt = $this->conn->prepare($query);
            foreach ($data as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::create: " . $e->getMessage());
            return false;
        }
    }
    
    /*Actualizar un registro*/

    public function update($id, $data) {
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
            $fields = array_map(function($field) {
                return $field . ' = :' . $field;
            }, array_keys($data));
            
            $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE " . $this->primary_key . " = :id";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            foreach ($data as $key => $value) {
                $stmt->bindValue(':' . $key, $value);
            }
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::update: " . $e->getMessage());
            return false;
        }
    }
    
    /*Eliminar un registro*/

    public function delete($id) {
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return false;
        }
        
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE " . $this->primary_key . " = :id";
           
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::delete: " . $e->getMessage());
            return false;
        }
    }

    public function count($conditions = array()) {
        // Verificar que la tabla esté definida
        if (empty($this->table_name)) {
            error_log("Error: La propiedad table_name no está definida en la clase " . get_class($this));
            return 0;
        }
        
        try {
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
            $stmt = $this->conn->prepare($query);
            if (!empty($conditions)) {
                foreach ($conditions as $field => $value) {
                    $stmt->bindValue(':' . $field, $value);
                }
            }
            
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return (int)$row['total'];
        } catch (PDOException $e) {
            error_log("Error en " . get_class($this) . "::count: " . $e->getMessage());
            return 0;
        }
    }
}
