<?php
require_once __DIR__ . '/ModelBase.php';
require_once __DIR__ . '/../adapters/ActividadesReservadasAdapter.php';

/**Modelo para la tabla actividades_reservadas*/

class ActividadReservada extends ModelBase {
    protected $table = 'actividades_reservadas';
    protected $adapter = ActividadesReservadasAdapter::class;
    public function getByReserva($reserva_id) {
        try {
            $query = "SELECT ar.*, a.nombre as actividad_nombre, a.duracion as actividad_duracion 
                      FROM {$this->table} ar
                      JOIN actividades a ON ar.actividad_id = a.id
                      WHERE ar.reserva_id = :reserva_id";
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
            error_log("Error en ActividadReservada::getByReserva: " . $e->getMessage());
            return [];
        }
    }
    public function createMultiple($actividades, $reserva_id) {
        try {
            $this->db->beginTransaction();
            
            foreach ($actividades as $actividad) {
                $actividad['reserva_id'] = $reserva_id;
                
                // Adaptar datos al formato de la base de datos
                $dbData = $this->adapter::toDatabase($actividad);
                $columns = implode(', ', array_keys($dbData));
                $placeholders = ':' . implode(', :', array_keys($dbData));
                
                $query = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
                $stmt = $this->db->prepare($query);
                foreach ($dbData as $key => $value) {
                    $stmt->bindValue(":{$key}", $value);
                }
                
                // Ejecutar consulta
                $stmt->execute();
            }
            
            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Error en ActividadReservada::createMultiple: " . $e->getMessage());
            return false;
        }
    }

    public function deleteByReserva($reserva_id) {
        try {
            $query = "DELETE FROM {$this->table} WHERE reserva_id = :reserva_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            $stmt->execute();
            
            return true;
        } catch (PDOException $e) {
            error_log("Error en ActividadReservada::deleteByReserva: " . $e->getMessage());
            return false;
        }
    }

    public function calcularPrecioTotal($reserva_id) {
        try {
            $query = "SELECT SUM(precio_total) as total FROM {$this->table} WHERE reserva_id = :reserva_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':reserva_id', $reserva_id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['total'] ? (float)$result['total'] : 0;
        } catch (PDOException $e) {
            error_log("Error en ActividadReservada::calcularPrecioTotal: " . $e->getMessage());
            return 0;
        }
    }
}
