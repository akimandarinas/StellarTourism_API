<?php
/**
 Adaptador para el modelo Naves
 */
class NavesAdapter {
    
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
        if (isset($data['capacidad'])) {
            $result['capacidad_pasajeros'] = $data['capacidad'];
        }
        if (isset($data['velocidad'])) {
            $result['velocidad_maxima'] = $data['velocidad'];
        }
        if (isset($data['autonomia'])) {
            $result['autonomia'] = $data['autonomia'];
        }
        if (isset($data['estado'])) {
            // Convertir estado a activo (1 o 0)
            $result['activo'] = ($data['estado'] === 'activa') ? 1 : 0;
        }
        
        // Valores por defecto para campos obligatorios
        if (!isset($result['tipo']) && !isset($data['tipo'])) {
            $result['tipo'] = 'transporte';
        } else if (isset($data['tipo'])) {
            $result['tipo'] = $data['tipo'];
        }

        return $result;
    }

    
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
        if (isset($data['capacidad_pasajeros'])) {
            $result['capacidad'] = $data['capacidad_pasajeros'];
        }
        if (isset($data['velocidad_maxima'])) {
            $result['velocidad'] = $data['velocidad_maxima'];
        }
        if (isset($data['autonomia'])) {
            $result['autonomia'] = $data['autonomia'];
        }
        if (isset($data['activo'])) {
            // Convertir activo a estado
            $result['estado'] = (bool)$data['activo'] ? 'activa' : 'inactiva';
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
