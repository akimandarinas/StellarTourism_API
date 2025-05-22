<?php
// Incluir archivos necesarios
require_once 'ModelBase.php';
require_once BASE_PATH . '/adapters/UsuariosAdapter.php';

/* Clase para el modelo Usuario*/

class Usuario extends ModelBase {
    protected $table_name = 'usuarios';
    protected $adapter_class = 'UsuariosAdapter';
    public function getByEmail($email) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
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
    public function getByFirebaseUid($firebase_uid) {
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name . " WHERE firebase_uid = :firebase_uid";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':firebase_uid', $firebase_uid);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
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
