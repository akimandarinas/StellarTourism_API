<?php
/**
 * Adaptador para el modelo Reserva
 * Este adaptador mapea entre la estructura esperada y la estructura real de la base de datos
 */
class ReservasAdapter {
    /**
     * Convierte datos del formato esperado al formato de la base de datos
     * 
     * @param array $data Datos en formato esperado
     * @return array Datos en formato de base de datos
     */
    public static function toDatabase($data) {
        $result = [];

        if (isset($data['id'])) {
            $result['id'] = $data['id'];
        }
        if (isset($data['usuario_id'])) {
            $result['usuario_id'] = $data['usuario_id'];
        }
        if (isset($data['ruta_id'])) {
            $result['ruta_id'] = $data['ruta_id'];
        }
        if (isset($data['numero_pasajeros'])) {
            $result['numero_pasajeros'] = $data['numero_pasajeros'];
        }
        if (isset($data['precio_total'])) {
            $result['precio_total'] = $data['precio_total'];
        }
        if (isset($data['estado'])) {
            $result['estado'] = $data['estado'];
        }

        return $result;
    }

    /**
     * Convierte datos del formato de la base de datos al formato esperado
     * 
     * @param array $data Datos en formato de base de datos
     * @return array Datos en formato esperado
     */
    public static function fromDatabase($data) {
        $result = [];

        if (isset($data['id'])) {
            $result['id'] = $data['id'];
        }
        if (isset($data['usuario_id'])) {
            $result['usuario_id'] = $data['usuario_id'];
        }
        if (isset($data['ruta_id'])) {
            $result['ruta_id'] = $data['ruta_id'];
        }
        if (isset($data['numero_pasajeros'])) {
            $result['numero_pasajeros'] = $data['numero_pasajeros'];
        }
        if (isset($data['precio_total'])) {
            $result['precio_total'] = $data['precio_total'];
        }
        if (isset($data['estado'])) {
            $result['estado'] = $data['estado'];
        }
        if (isset($data['fecha_reserva'])) {
            $result['fecha'] = $data['fecha_reserva'];
        }

        return $result;
    }
}
