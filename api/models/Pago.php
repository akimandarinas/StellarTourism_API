<?php
require_once __DIR__ . '/ModelBase.php';
require_once __DIR__ . '/../adapters/PagosAdapter.php';

/**
 * Modelo para la tabla pagos
 */
class Pago extends ModelBase {
    protected $table = 'pagos';
    protected $adapter = PagosAdapter::class;
    
    /**
     * Obtener pagos por reserva
     * 
     * @param int $reserva_id ID de la reserva
     * @return array Pagos de la reserva
     */
    public function getPagosByReserva($reserva_id) {
        try {
            // Preparar consulta
            $query = "SELECT * FROM {$this->table} WHERE reserva_id = :reserva_id ORDER BY fecha_pago DESC";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            
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
            error_log("Error en Pago::getPagosByReserva: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener pagos por usuario
     * 
     * @param int $usuario_id ID del usuario
     * @return array Pagos del usuario
     */
    public function getPagosByUsuario($usuario_id) {
        try {
            // Preparar consulta
            $query = "SELECT p.* FROM {$this->table} p 
                      JOIN reservas r ON p.reserva_id = r.id 
                      WHERE r.usuario_id = :usuario_id 
                      ORDER BY p.fecha_pago DESC";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            
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
            error_log("Error en Pago::getPagosByUsuario: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Verificar si una reserva tiene pagos
     * 
     * @param int $reserva_id ID de la reserva
     * @return bool True si la reserva tiene pagos, False en caso contrario
     */
    public function reservaTienePagos($reserva_id) {
        try {
            // Preparar consulta
            $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE reserva_id = :reserva_id";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultado
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("Error en Pago::reservaTienePagos: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener total pagado por reserva
     * 
     * @param int $reserva_id ID de la reserva
     * @return float Total pagado
     */
    public function getTotalPagadoByReserva($reserva_id) {
        try {
            // Preparar consulta
            $query = "SELECT SUM(monto) as total FROM {$this->table} 
                      WHERE reserva_id = :reserva_id AND estado = 'completado'";
            $stmt = $this->db->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            
            // Ejecutar consulta
            $stmt->execute();
            
            // Obtener resultado
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['total'] ? (float)$result['total'] : 0;
        } catch (PDOException $e) {
            error_log("Error en Pago::getTotalPagadoByReserva: " . $e->getMessage());
            return 0;
        }
    }
}
