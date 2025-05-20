<?php
/**
 * Adaptador para el modelo Destinos
 * Este adaptador mapea entre la estructura esperada y la estructura real de la base de datos
 */
class DestinosAdapter {
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
        if (isset($data['nombre'])) {
            $result['nombre'] = $data['nombre'];
        }
        if (isset($data['descripcion'])) {
            $result['descripcion'] = $data['descripcion'];
        }
        if (isset($data['imagen'])) {
            $result['imagen_url'] = $data['imagen'];
        }
        if (isset($data['precio'])) {
            $result['precio_base'] = $data['precio'];
        }
        if (isset($data['duracion'])) {
            $result['tiempo_viaje'] = $data['duracion'];
        }
        if (isset($data['distancia'])) {
            $result['distancia_tierra'] = $data['distancia'];
        }
        if (isset($data['gravedad'])) {
            $result['gravedad'] = $data['gravedad'];
        }
        if (isset($data['temperatura'])) {
            // Dividir la temperatura en min y max
            $result['temperatura_min'] = $data['temperatura'] - 10;
            $result['temperatura_max'] = $data['temperatura'] + 10;
        }
        
        // Valores por defecto para campos obligatorios
        if (!isset($result['tipo']) && !isset($data['tipo'])) {
            $result['tipo'] = 'planeta';
        } else if (isset($data['tipo'])) {
            $result['tipo'] = $data['tipo'];
        }
        
        if (!isset($result['activo'])) {
            $result['activo'] = 1;
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
        if (isset($data['nombre'])) {
            $result['nombre'] = $data['nombre'];
        }
        if (isset($data['descripcion'])) {
            $result['descripcion'] = $data['descripcion'];
        }
        if (isset($data['imagen_url'])) {
            $result['imagen'] = $data['imagen_url'];
        }
        if (isset($data['precio_base'])) {
            $result['precio'] = $data['precio_base'];
        }
        if (isset($data['tiempo_viaje'])) {
            $result['duracion'] = $data['tiempo_viaje'];
        }
        if (isset($data['distancia_tierra'])) {
            $result['distancia'] = $data['distancia_tierra'];
        }
        if (isset($data['gravedad'])) {
            $result['gravedad'] = $data['gravedad'];
        }
        
        // Calcular temperatura_media a partir de expresión: (temperatura_min + temperatura_max) / 2
        if (isset($data['temperatura_min']) && isset($data['temperatura_max'])) {
            $result['temperatura'] = ($data['temperatura_min'] + $data['temperatura_max']) / 2;
        }
        
        // Añadir campos adicionales que podrían ser útiles
        if (isset($data['tipo'])) {
            $result['tipo'] = $data['tipo'];
        }
        if (isset($data['modelo_3d_url'])) {
            $result['modelo_3d'] = $data['modelo_3d_url'];
        }
        if (isset($data['destacado'])) {
            $result['destacado'] = (bool)$data['destacado'];
        }

        return $result;
    }
}