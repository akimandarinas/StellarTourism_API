<?php
/**
  Este adaptador mapea entre la estructura esperada y la real 
 */
class ActividadesReservadasAdapter {
    
    public static function toDatabase($data) {
        $result = [];

        if (isset($data['id'])) {
            $result['id'] = $data['id'];
        }
        if (isset($data['reserva_id'])) {
            $result['reserva_id'] = $data['reserva_id'];
        }
        if (isset($data['actividad_id'])) {
            $result['actividad_id'] = $data['actividad_id'];
        }
        if (isset($data['cantidad'])) {
            $result['cantidad'] = $data['cantidad'];
        }
        if (isset($data['precio_unitario'])) {
            $result['precio_unitario'] = $data['precio_unitario'];
        }
        if (isset($data['precio_total'])) {
            $result['precio_total'] = $data['precio_total'];
        }

        return $result;
    }

    
    public static function fromDatabase($data) {
        $result = [];

        if (isset($data['id'])) {
            $result['id'] = $data['id'];
        }
        if (isset($data['reserva_id'])) {
            $result['reserva_id'] = $data['reserva_id'];
        }
        if (isset($data['actividad_id'])) {
            $result['actividad_id'] = $data['actividad_id'];
        }
        if (isset($data['cantidad'])) {
            $result['cantidad'] = $data['cantidad'];
        }
        if (isset($data['precio_unitario'])) {
            $result['precio_unitario'] = $data['precio_unitario'];
        }
        if (isset($data['precio_total'])) {
            $result['precio_total'] = $data['precio_total'];
        }
        
        // Campos adicionales que podrían ser útiles
        if (isset($data['actividad_nombre'])) {
            $result['nombre_actividad'] = $data['actividad_nombre'];
        }
        if (isset($data['actividad_duracion'])) {
            $result['duracion_actividad'] = $data['actividad_duracion'];
        }

        return $result;
    }
}
