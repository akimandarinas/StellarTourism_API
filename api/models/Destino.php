<?php
require_once __DIR__ . '/ModelBase.php';
require_once __DIR__ . '/../adapters/DestinosAdapter.php';

/**Modelo para la tabla destinos*/
class Destino extends ModelBase {
    protected $table = 'destinos';
    protected $adapter = DestinosAdapter::class;
    
    public function getDestacados($limit = 5) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE destacado = 1 ORDER BY nombre LIMIT :limit";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convertir resultados al formato esperado
            $adaptedResults = [];
            foreach ($results as $result) {
                $adaptedResults[] = $this->adapter::fromDatabase($result);
            }
            
            return $adaptedResults;
        } catch (PDOException $e) {
            error_log("Error en Destino::getDestacados: " . $e->getMessage());
            return [];
        }
    }
    
    /* Obtener destinos por tipo */
    public function getByTipo($tipo) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE tipo = :tipo ORDER BY nombre";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':tipo', $tipo, PDO::PARAM_STR);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $adaptedResults = [];
            foreach ($results as $result) {
                $adaptedResults[] = $this->adapter::fromDatabase($result);
            }
            
            return $adaptedResults;
        } catch (PDOException $e) {
            error_log("Error en Destino::getByTipo: " . $e->getMessage());
            return [];
        }
    }
    
    /*Obtener destinos por rango de distancia*/
    public function getByDistancia($min, $max) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE distancia_tierra BETWEEN :min AND :max ORDER BY distancia_tierra";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':min', $min, PDO::PARAM_INT);
            $stmt->bindParam(':max', $max, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $adaptedResults = [];
            foreach ($results as $result) {
                $adaptedResults[] = $this->adapter::fromDatabase($result);
            }
            
            return $adaptedResults;
        } catch (PDOException $e) {
            error_log("Error en Destino::getByDistancia: " . $e->getMessage());
            return [];
        }
    }
    
    /*Por rango de temperatura*/
    public function getByTemperatura($min, $max) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE temperatura_min >= :min AND temperatura_max <= :max ORDER BY temperatura_min";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':min', $min, PDO::PARAM_INT);
            $stmt->bindParam(':max', $max, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $adaptedResults = [];
            foreach ($results as $result) {
                $adaptedResults[] = $this->adapter::fromDatabase($result);
            }
            
            return $adaptedResults;
        } catch (PDOException $e) {
            error_log("Error en Destino::getByTemperatura: " . $e->getMessage());
            return [];
        }
    }
}
