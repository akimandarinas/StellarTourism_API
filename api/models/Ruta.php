<?php
require_once __DIR__ . '/ModelBase.php';
require_once __DIR__ . '/../adapters/RutasAdapter.php';

/* Modelo para la tabla rutas*/

class Ruta extends ModelBase {
    protected $table = 'rutas';
    protected $adapter = RutasAdapter::class;
    
    public function getRutasPopulares($limit = 5) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE destacado = 1 ORDER BY precio ASC LIMIT :limit";
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $adaptedResults = [];
            foreach ($results as $result) {
                $adaptedResults[] = $this->adapter::fromDatabase($result);
            }
            
            return $adaptedResults;
        } catch (PDOException $e) {
            error_log("Error en Ruta::getRutasPopulares: " . $e->getMessage());
            return [];
        }
    }

    public function getRutasByDestino($destino_id) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE destino_id = :destino_id ORDER BY fecha_salida";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':destino_id', $destino_id, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convertir resultados al formato esperado
            $adaptedResults = [];
            foreach ($results as $result) {
                $adaptedResults[] = $this->adapter::fromDatabase($result);
            }
            
            return $adaptedResults;
        } catch (PDOException $e) {
            error_log("Error en Ruta::getRutasByDestino: " . $e->getMessage());
            return [];
        }
    }

    public function getRutasByNave($nave_id) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE nave_id = :nave_id ORDER BY fecha_salida";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':nave_id', $nave_id, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $adaptedResults = [];
            foreach ($results as $result) {
                $adaptedResults[] = $this->adapter::fromDatabase($result);
            }
            
            return $adaptedResults;
        } catch (PDOException $e) {
            error_log("Error en Ruta::getRutasByNave: " . $e->getMessage());
            return [];
        }
    }
    
   
    public function verificarDisponibilidad($ruta_id, $plazas) {
        try {
            $query = "SELECT plazas_disponibles FROM {$this->table} WHERE id = :ruta_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':ruta_id', $ruta_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                return false;
            }
            
            return $result['plazas_disponibles'] >= $plazas;
        } catch (PDOException $e) {
            error_log("Error en Ruta::verificarDisponibilidad: " . $e->getMessage());
            return false;
        }
    }
  
    public function actualizarPlazasDisponibles($ruta_id, $plazas) {
        try {
            $query = "UPDATE {$this->table} SET plazas_disponibles = plazas_disponibles - :plazas 
                      WHERE id = :ruta_id AND plazas_disponibles >= :plazas";
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':plazas', $plazas, PDO::PARAM_INT);
            $stmt->bindParam(':ruta_id', $ruta_id, PDO::PARAM_INT);
            
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error en Ruta::actualizarPlazasDisponibles: " . $e->getMessage());
            return false;
        }
    }
}
