<?php
/**
 * Adaptador para el modelo Actividad
 * Este adaptador mapea entre la estructura esperada y la estructura real de la base de datos
 */
class ActividadesAdapter {
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
        if (isset($data['destino_id'])) {
            $result['destino_id'] = $data['destino_id'];
        }
        if (isset($data['nombre'])) {
            $result['nombre'] = $data['nombre'];
        }
        if (isset($data['descripcion'])) {
            $result['descripcion'] = $data['descripcion'];
        }
        if (isset($data['duracion'])) {
            $result['duracion'] = $data['duracion'];
        }
        if (isset($data['precio'])) {
            $result['precio'] = $data['precio'];
        }
        if (isset($data['dificultad'])) {
            $result['nivel_dificultad'] = $data['dificultad'];
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
        if (isset($data['destino_id'])) {
            $result['destino_id'] = $data['destino_id'];
        }
        if (isset($data['nombre'])) {
            $result['nombre'] = $data['nombre'];
        }
        if (isset($data['descripcion'])) {
            $result['descripcion'] = $data['descripcion'];
        }
        if (isset($data['duracion'])) {
            $result['duracion'] = $data['duracion'];
        }
        if (isset($data['precio'])) {
            $result['precio'] = $data['precio'];
        }
        if (isset($data['nivel_dificultad'])) {
            $result['dificultad'] = $data['nivel_dificultad'];
        }
        if (isset($data['imagen_url'])) {
            $result['imagen'] = $data['imagen_url'];
        }

        return $result;
    }
}
