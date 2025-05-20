<?php
// Incluir archivos necesarios
require_once 'ModelBase.php';
require_once BASE_PATH . '/adapters/UsuariosAdapter.php';

/**
 * Clase para el modelo Usuario
 */
class Usuario extends ModelBase {
    // Propiedades de la tabla
    protected $table_name = 'usuarios';
    protected $adapter_class = 'UsuariosAdapter';
    
    /**
     * Obtener usuario por email
     * 
     * @param string $email Email del usuario
     * @return array|false Usuario encontrado o false si no se encuentra
     */
    public function getByEmail($email) {
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':email', $email);
            
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
            error_log("Error en " . get_class($this) . "::getByEmail: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener usuario por Firebase UID
     * 
     * @param string $firebase_uid Firebase UID del usuario
     * @return array|false Usuario encontrado o false si no se encuentra
     */
    public function getByFirebaseUid($firebase_uid) {
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name . " WHERE firebase_uid = :firebase_uid";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':firebase_uid', $firebase_uid);
            
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
            error_log("Error en " . get_class($this) . "::getByFirebaseUid: " . $e->getMessage());
            return false;
        }
    }
}
