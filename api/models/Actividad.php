<?php
// Incluir archivos necesarios
require_once 'ModelBase.php';
require_once BASE_PATH . '/adapters/ActividadesAdapter.php';

/**
 * Clase para el modelo Actividad
 */
class Actividad extends ModelBase {
    // Propiedades de la tabla
    protected $table_name = 'actividades';
    protected $adapter_class = 'ActividadesAdapter';
    
    /**
     * Obtener actividades por destino
     * 
     * @param int $destino_id ID del destino
     * @return array Actividades encontradas
     */
    public function getByDestino($destino_id) {
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name . " WHERE destino_id = :destino_id";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':destino_id', $destino_id);
            
            // Ejecutar consulta
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
            error_log("Error en " . get_class($this) . "::getByDestino: " . $e->getMessage());
            return array();
        }
    }
}
