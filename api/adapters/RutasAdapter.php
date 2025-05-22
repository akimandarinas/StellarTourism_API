<?php
/**
 Adaptador para el modelo Ruta
 */
class RutasAdapter {
    public static function toDatabase($data) {
        $result = [];

        if (isset($data['id'])) {
            $result['id'] = $data['id'];
        }
        if (isset($data['destino_id'])) {
            $result['destino_id'] = $data['destino_id'];
        }
        if (isset($data['origen_id'])) {
            // Manejar el caso de origen_id que no existe en la base de datos
            // Podríamos almacenarlo en un campo de metadatos o ignorarlo
        }
        if (isset($data['nave_id'])) {
            $result['nave_id'] = $data['nave_id'];
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
        if (isset($data['distancia'])) {
            $result['distancia'] = $data['distancia'];
        }
        if (isset($data['precio'])) {
            $result['precio'] = $data['precio'];
        }
        if (isset($data['plazas_disponibles'])) {
            $result['plazas_disponibles'] = $data['plazas_disponibles'];
        }
        if (isset($data['fecha_salida'])) {
            $result['fecha_salida'] = $data['fecha_salida'];
        }
        if (isset($data['fecha_regreso'])) {
            $result['fecha_regreso'] = $data['fecha_regreso'];
        }
        if (isset($data['destacado'])) {
            $result['destacado'] = $data['destacado'];
        }
        if (isset($data['activo'])) {
            $result['activo'] = $data['activo'];
        }

        return $result;
    }

    public static function fromDatabase($data) {
        $result = [];

        if (isset($data['id'])) {
            $result['id'] = $data['id'];
        }
        if (isset($data['destino_id'])) {
            $result['destino_id'] = $data['destino_id'];
        }
        // Origen_id no existe en la base de datos, pero podríamos simularlo
        $result['origen_id'] = 1; // Valor por defecto: Tierra
        if (isset($data['nave_id'])) {
            $result['nave_id'] = $data['nave_id'];
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
        if (isset($data['distancia'])) {
            $result['distancia'] = $data['distancia'];
        }
        if (isset($data['precio'])) {
            $result['precio'] = $data['precio'];
        }
        if (isset($data['plazas_disponibles'])) {
            $result['plazas_disponibles'] = $data['plazas_disponibles'];
        }
        if (isset($data['fecha_salida'])) {
            $result['fecha_salida'] = $data['fecha_salida'];
        }
        if (isset($data['fecha_regreso'])) {
            $result['fecha_regreso'] = $data['fecha_regreso'];
        }
        if (isset($data['destacado'])) {
            $result['destacado'] = (bool)$data['destacado'];
        }
        if (isset($data['activo'])) {
            $result['activo'] = (bool)$data['activo'];
        }

        return $result;
    }
}
