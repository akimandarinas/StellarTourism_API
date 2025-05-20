<?php
// Incluir archivos necesarios
require_once 'ModelBase.php';
require_once BASE_PATH . '/adapters/ReservasAdapter.php';

/**
 * Clase para el modelo Reserva
 */
class Reserva extends ModelBase {
    // Propiedades de la tabla
    protected $table_name = 'reservas';
    protected $adapter_class = 'ReservasAdapter';
    
    /**
     * Obtener reservas por usuario
     * 
     * @param int $usuario_id ID del usuario
     * @return array Reservas encontradas
     */
    public function getByUsuario($usuario_id) {
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name . " WHERE usuario_id = :usuario_id";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':usuario_id', $usuario_id);
            
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
            error_log("Error en " . get_class($this) . "::getByUsuario: " . $e->getMessage());
            return array();
        }
    }
    
    /**
     * Obtener reservas por ruta
     * 
     * @param int $ruta_id ID de la ruta
     * @return array Reservas encontradas
     */
    public function getByRuta($ruta_id) {
        try {
            // Crear consulta
            $query = "SELECT * FROM " . $this->table_name . " WHERE ruta_id = :ruta_id";
            
            // Preparar consulta
            $stmt = $this->conn->prepare($query);
            
            // Vincular parámetros
            $stmt->bindParam(':ruta_id', $ruta_id);
            
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
            error_log("Error en " . get_class($this) . "::getByRuta: " . $e->getMessage());
            return array();
        }
    }

// Añadir nuevos métodos para obtener datos más detallados

/**
 * Obtener reservas por usuario con datos relacionados
 * 
 * @param int $usuario_id ID del usuario
 * @return array Reservas encontradas con datos relacionados
 */
public function getByUsuarioDetallado($usuario_id) {
    try {
        // Crear consulta con JOIN para obtener datos relacionados
        $query = "SELECT r.*, 
                d.nombre AS destino_nombre, 
                n.nombre AS nave_nombre,
                ru.nombre AS ruta_nombre,
                ru.origen AS ruta_origen,
                ru.destino AS ruta_destino,
                ru.duracion AS ruta_duracion
            FROM " . $this->table_name . " r
            LEFT JOIN destinos d ON r.destino_id = d.id
            LEFT JOIN naves n ON r.nave_id = n.id
            LEFT JOIN rutas ru ON r.ruta_id = ru.id
            WHERE r.usuario_id = :usuario_id
            ORDER BY r.fecha_reserva DESC";
        
        // Preparar consulta
        $stmt = $this->conn->prepare($query);
        
        // Vincular parámetros
        $stmt->bindParam(':usuario_id', $usuario_id);
        
        // Ejecutar consulta
        $stmt->execute();
        
        // Obtener resultados
        $results = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Obtener pasajeros de la reserva
            $row['pasajeros_detalle'] = $this->getPasajerosByReserva($row['id']);
            
            // Obtener actividades de la reserva
            $row['actividades'] = $this->getActividadesByReserva($row['id']);
            
            // Obtener pagos de la reserva
            $row['pagos'] = $this->getPagosByReserva($row['id']);
            
            // Convertir datos si hay un adaptador
            if ($this->adapter_class && class_exists($this->adapter_class)) {
                $adapter = $this->adapter_class;
                $row = $adapter::fromDatabase($row);
            }
            $results[] = $row;
        }
        
        return $results;
    } catch (PDOException $e) {
        error_log("Error en " . get_class($this) . "::getByUsuarioDetallado: " . $e->getMessage());
        return array();
    }
}

/**
 * Obtener pasajeros de una reserva
 * 
 * @param int $reserva_id ID de la reserva
 * @return array Pasajeros de la reserva
 */
private function getPasajerosByReserva($reserva_id) {
    try {
        // Crear consulta
        $query = "SELECT * FROM pasajeros WHERE reserva_id = :reserva_id";
        
        // Preparar consulta
        $stmt = $this->conn->prepare($query);
        
        // Vincular parámetros
        $stmt->bindParam(':reserva_id', $reserva_id);
        
        // Ejecutar consulta
        $stmt->execute();
        
        // Obtener resultados
        $results = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = $row;
        }
        
        return $results;
    } catch (PDOException $e) {
        error_log("Error en " . get_class($this) . "::getPasajerosByReserva: " . $e->getMessage());
        return array();
    }
}

/**
 * Obtener actividades de una reserva
 * 
 * @param int $reserva_id ID de la reserva
 * @return array Actividades de la reserva
 */
private function getActividadesByReserva($reserva_id) {
    try {
        // Crear consulta
        $query = "SELECT ar.*, a.nombre, a.descripcion, a.precio 
                FROM actividades_reservadas ar
                JOIN actividades a ON ar.actividad_id = a.id
                WHERE ar.reserva_id = :reserva_id";
        
        // Preparar consulta
        $stmt = $this->conn->prepare($query);
        
        // Vincular parámetros
        $stmt->bindParam(':reserva_id', $reserva_id);
        
        // Ejecutar consulta
        $stmt->execute();
        
        // Obtener resultados
        $results = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = $row;
        }
        
        return $results;
    } catch (PDOException $e) {
        error_log("Error en " . get_class($this) . "::getActividadesByReserva: " . $e->getMessage());
        return array();
    }
}

/**
 * Obtener pagos de una reserva
 * 
 * @param int $reserva_id ID de la reserva
 * @return array Pagos de la reserva
 */
private function getPagosByReserva($reserva_id) {
    try {
        // Crear consulta
        $query = "SELECT * FROM pagos WHERE reserva_id = :reserva_id";
        
        // Preparar consulta
        $stmt = $this->conn->prepare($query);
        
        // Vincular parámetros
        $stmt->bindParam(':reserva_id', $reserva_id);
        
        // Ejecutar consulta
        $stmt->execute();
        
        // Obtener resultados
        $results = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = $row;
        }
        
        return $results;
    } catch (PDOException $e) {
        error_log("Error en " . get_class($this) . "::getPagosByReserva: " . $e->getMessage());
        return array();
    }
}

/**
 * Obtener estadísticas de reservas
 * 
 * @return array Estadísticas de reservas
 */
public function getEstadisticas() {
    try {
        $stats = array();
        
        // Total de reservas
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_reservas'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Reservas por estado
        $query = "SELECT estado, COUNT(*) as cantidad FROM " . $this->table_name . " GROUP BY estado";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['reservas_por_estado'] = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $stats['reservas_por_estado'][$row['estado']] = $row['cantidad'];
        }
        
        // Reservas por destino
        $query = "SELECT d.nombre, COUNT(*) as cantidad 
                FROM " . $this->table_name . " r
                JOIN destinos d ON r.destino_id = d.id
                GROUP BY d.nombre
                ORDER BY cantidad DESC
                LIMIT 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['reservas_por_destino'] = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $stats['reservas_por_destino'][$row['nombre']] = $row['cantidad'];
        }
        
        // Reservas por mes
        $query = "SELECT DATE_FORMAT(fecha_reserva, '%Y-%m') as mes, COUNT(*) as cantidad 
                FROM " . $this->table_name . "
                GROUP BY mes
                ORDER BY mes DESC
                LIMIT 12";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['reservas_por_mes'] = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $stats['reservas_por_mes'][$row['mes']] = $row['cantidad'];
        }
        
        return $stats;
    } catch (PDOException $e) {
        error_log("Error en " . get_class($this) . "::getEstadisticas: " . $e->getMessage());
        return array();
    }
}

/**
 * Verificar disponibilidad detallada
 * 
 * @param int $ruta_id ID de la ruta
 * @param string $fecha Fecha del viaje
 * @param int $pasajeros Número de pasajeros
 * @return array Información detallada de disponibilidad
 */
public function verificarDisponibilidadDetallada($ruta_id, $fecha, $pasajeros) {
    try {
        // Obtener capacidad de la nave asignada a la ruta
        $query = "SELECT n.capacidad, n.nombre, n.id, r.nombre as ruta_nombre
                FROM rutas r
                JOIN naves n ON r.nave_id = n.id
                WHERE r.id = :ruta_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ruta_id', $ruta_id);
        $stmt->execute();
        $ruta = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$ruta) {
            return array(
                'disponible' => false,
                'error' => 'Ruta no encontrada'
            );
        }
        
        // Obtener plazas ya reservadas para esa fecha y ruta
        $query = "SELECT SUM(numero_pasajeros) as reservados
                FROM " . $this->table_name . "
                WHERE ruta_id = :ruta_id 
                AND DATE(fecha_viaje) = :fecha
                AND estado != 'cancelada'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':ruta_id', $ruta_id);
        $stmt->bindParam(':fecha', $fecha);
        $stmt->execute();
        $reservados = $stmt->fetch(PDO::FETCH_ASSOC)['reservados'] ?: 0;
        
        // Calcular plazas disponibles
        $disponibles = $ruta['capacidad'] - $reservados;
        $disponible = $disponibles >= $pasajeros;
        
        // Obtener naves alternativas si no hay disponibilidad
        $naves_alternativas = array();
        if (!$disponible) {
            $query = "SELECT n.id, n.nombre, n.capacidad
                    FROM naves n
                    WHERE n.capacidad >= :pasajeros
                    AND n.id != :nave_id
                    AND n.estado = 'activa'
                    ORDER BY n.capacidad ASC
                    LIMIT 3";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':pasajeros', $pasajeros);
            $stmt->bindParam(':nave_id', $ruta['id']);
            $stmt->execute();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $naves_alternativas[] = $row;
            }
        }
        
        // Obtener fechas alternativas
        $fechas_alternativas = array();
        $fecha_obj = new DateTime($fecha);
        for ($i = 1; $i <= 7; $i++) {
            $fecha_alt = clone $fecha_obj;
            $fecha_alt->modify("+$i days");
            $fecha_alt_str = $fecha_alt->format('Y-m-d');
            
            $query = "SELECT SUM(numero_pasajeros) as reservados
                    FROM " . $this->table_name . "
                    WHERE ruta_id = :ruta_id 
                    AND DATE(fecha_viaje) = :fecha
                    AND estado != 'cancelada'";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':ruta_id', $ruta_id);
            $stmt->bindParam(':fecha', $fecha_alt_str);
            $stmt->execute();
            $reservados_alt = $stmt->fetch(PDO::FETCH_ASSOC)['reservados'] ?: 0;
            
            $disponibles_alt = $ruta['capacidad'] - $reservados_alt;
            
            if ($disponibles_alt >= $pasajeros) {
                $fechas_alternativas[] = array(
                    'fecha' => $fecha_alt_str,
                    'disponibles' => $disponibles_alt
                );
            }
        }
        
        return array(
            'disponible' => $disponible,
            'plazas_totales' => $ruta['capacidad'],
            'plazas_reservadas' => $reservados,
            'plazas_disponibles' => $disponibles,
            'pasajeros_solicitados' => $pasajeros,
            'ruta' => array(
                'id' => $ruta_id,
                'nombre' => $ruta['ruta_nombre']
            ),
            'nave' => array(
                'id' => $ruta['id'],
                'nombre' => $ruta['nombre'],
                'capacidad' => $ruta['capacidad']
            ),
            'fecha_solicitada' => $fecha,
            'naves_alternativas' => $naves_alternativas,
            'fechas_alternativas' => $fechas_alternativas
        );
    } catch (PDOException $e) {
        error_log("Error en " . get_class($this) . "::verificarDisponibilidadDetallada: " . $e->getMessage());
        return array(
            'disponible' => false,
            'error' => 'Error al verificar disponibilidad: ' . $e->getMessage()
        );
    }
}
}
