<?php
/**
 * Adaptador para el modelo Pago
 * Este adaptador mapea entre la estructura esperada y la estructura real de la base de datos
 */
class PagosAdapter {
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
        if (isset($data['reserva_id'])) {
            $result['reserva_id'] = $data['reserva_id'];
        }
        if (isset($data['monto'])) {
            $result['monto'] = $data['monto'];
        }
        if (isset($data['fecha'])) {
            $result['fecha_pago'] = $data['fecha'];
        }
        if (isset($data['metodo'])) {
            $result['metodo_pago'] = $data['metodo'];
        }
        if (isset($data['estado'])) {
            $result['estado'] = $data['estado'];
        }
        if (isset($data['referencia'])) {
            $result['referencia_pago'] = $data['referencia'];
        }
        if (isset($data['usuario_id'])) {
            $result['usuario_id'] = $data['usuario_id'];
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
        if (isset($data['reserva_id'])) {
            $result['reserva_id'] = $data['reserva_id'];
        }
        if (isset($data['monto'])) {
            $result['monto'] = $data['monto'];
        }
        if (isset($data['fecha_pago'])) {
            $result['fecha'] = $data['fecha_pago'];
        }
        if (isset($data['metodo_pago'])) {
            $result['metodo'] = $data['metodo_pago'];
        }
        if (isset($data['estado'])) {
            $result['estado'] = $data['estado'];
        }
        if (isset($data['referencia_pago'])) {
            $result['referencia'] = $data['referencia_pago'];
        }
        if (isset($data['usuario_id'])) {
            $result['usuario_id'] = $data['usuario_id'];
        }

        return $result;
    }
}
