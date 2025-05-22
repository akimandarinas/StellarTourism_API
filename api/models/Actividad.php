<?php
require_once 'ModelBase.php';
require_once BASE_PATH . '/adapters/ActividadesAdapter.php';

/** Clase para el modelo Actividad*/

class Actividad extends ModelBase {
    protected $table_name = 'actividades';
    protected $adapter_class = 'ActividadesAdapter';
    
    
    public function getByDestino($destino_id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE destino_id = :destino_id";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':destino_id', $destino_id);
            
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
            error_log("Error en " . get_class($this) . "::getByDestino: " . $e->getMessage());
            return array();
        }
    }
}
