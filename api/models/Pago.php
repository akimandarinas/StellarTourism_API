<?php
require_once __DIR__ . '/ModelBase.php';
require_once __DIR__ . '/../adapters/PagosAdapter.php';

/*Modelo para la tabla pagos*/

class Pago extends ModelBase {
    protected $table = 'pagos';
    protected $adapter = PagosAdapter::class;
    
    public function getPagosByReserva($reserva_id) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE reserva_id = :reserva_id ORDER BY fecha_pago DESC";
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
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

    public function getPagosByUsuario($usuario_id) {
        try {
            $query = "SELECT p.* FROM {$this->table} p 
                      JOIN reservas r ON p.reserva_id = r.id 
                      WHERE r.usuario_id = :usuario_id 
                      ORDER BY p.fecha_pago DESC";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
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

    public function reservaTienePagos($reserva_id) {
        try {
            $query = "SELECT COUNT(*) as count FROM {$this->table} WHERE reserva_id = :reserva_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("Error en Pago::reservaTienePagos: " . $e->getMessage());
            return false;
        }
    }

    public function getTotalPagadoByReserva($reserva_id) {
        try {
            $query = "SELECT SUM(monto) as total FROM {$this->table} 
                      WHERE reserva_id = :reserva_id AND estado = 'completado'";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['total'] ? (float)$result['total'] : 0;
        } catch (PDOException $e) {
            error_log("Error en Pago::getTotalPagadoByReserva: " . $e->getMessage());
            return 0;
        }
    }
}
