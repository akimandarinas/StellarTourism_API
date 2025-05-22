<?php
/**
 Adaptador para el modelo Reserva
 */
class ReservasAdapter {
    
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
