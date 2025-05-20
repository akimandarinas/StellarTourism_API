<?php
require_once __DIR__ . '/ModelBase.php';
require_once __DIR__ . '/../adapters/RutasAdapter.php';

/**
 * Modelo para la tabla rutas
 */
class Ruta extends ModelBase {
    protected $table = 'rutas';
    protected $adapter = RutasAdapter::class;
    
    /**
     * Obtener rutas populares
     * 
     * @param int $limit Límite de resultados
     * @return array Rutas populares
     */
    public function getRutasPopulares($limit = 5) {
        try {
            // Preparar consulta
            $query = "SELECT * FROM {$this->table} WHERE destacado = 1 ORDER BY precio ASC LIMIT :limit";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultados
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convertir resultados al formato esperado
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
    
    /**
     * Obtener rutas por destino
     * 
     * @param int $destino_id ID del destino
     * @return array Rutas del destino
     */
    public function getRutasByDestino($destino_id) {
        try {
            // Preparar consulta
            $query = "SELECT * FROM {$this->table} WHERE destino_id = :destino_id ORDER BY fecha_salida";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':destino_id', $destino_id, PDO::PARAM_INT);
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultados
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
    
    /**
     * Obtener rutas por nave
     * 
     * @param int $nave_id ID de la nave
     * @return array Rutas de la nave
     */
    public function getRutasByNave($nave_id) {
        try {
            // Preparar consulta
            $query = "SELECT * FROM {$this->table} WHERE nave_id = :nave_id ORDER BY fecha_salida";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':nave_id', $nave_id, PDO::PARAM_INT);
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultados
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Convertir resultados al formato esperado
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
    
    /**
     * Verificar disponibilidad de plazas
     * 
     * @param int $ruta_id ID de la ruta
     * @param int $plazas Número de plazas a verificar
     * @return bool True si hay disponibilidad, False en caso contrario
     */
    public function verificarDisponibilidad($ruta_id, $plazas) {
        try {
            // Preparar consulta
            $query = "SELECT plazas_disponibles FROM {$this->table} WHERE id = :ruta_id";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':ruta_id', $ruta_id, PDO::PARAM_INT);
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultado
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
    
    /**
     * Actualizar plazas disponibles
     * 
     * @param int $ruta_id ID de la ruta
     * @param int $plazas Número de plazas a restar
     * @return bool True si se actualizó correctamente, False en caso contrario
     */
    public function actualizarPlazasDisponibles($ruta_id, $plazas) {
        try {
            // Preparar consulta
            $query = "UPDATE {$this->table} SET plazas_disponibles = plazas_disponibles - :plazas 
                      WHERE id = :ruta_id AND plazas_disponibles >= :plazas";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':plazas', $plazas, PDO::PARAM_INT);
            $stmt->bindParam(':ruta_id', $ruta_id, PDO::PARAM_INT);
            
            // Ejecutar consulta
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error en Ruta::actualizarPlazasDisponibles: " . $e->getMessage());
            return false;
        }
    }
}
