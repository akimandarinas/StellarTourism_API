<?php
/**
 * Adaptador para el modelo Resena
 * Este adaptador mapea entre la estructura esperada y la estructura real de la base de datos
 */
class ResenasAdapter {
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
        if (isset($data['destino_id'])) {
            $result['destino_id'] = $data['destino_id'];
        }
        if (isset($data['calificacion'])) {
            $result['puntuacion'] = $data['calificacion'];
        }
        if (isset($data['comentario'])) {
            $result['comentario'] = $data['comentario'];
        }
        if (isset($data['fecha'])) {
            $result['fecha_creacion'] = $data['fecha'];
        }
        if (isset($data['titulo'])) {
            $result['titulo'] = $data['titulo'];
        } else {
            // Valor por defecto para título si no se proporciona
            $result['titulo'] = 'Reseña de viaje';
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
        if (isset($data['destino_id'])) {
            $result['destino_id'] = $data['destino_id'];
        }
        if (isset($data['puntuacion'])) {
            $result['calificacion'] = $data['puntuacion'];
        }
        if (isset($data['comentario'])) {
            $result['comentario'] = $data['comentario'];
        }
        if (isset($data['fecha_creacion'])) {
            $result['fecha'] = $data['fecha_creacion'];
        }
        if (isset($data['titulo'])) {
            $result['titulo'] = $data['titulo'];
        }
        
        // Campos adicionales que podrían ser útiles
        if (isset($data['USUARIO_NOMBRE'])) {
            $result['nombre_usuario'] = $data['USUARIO_NOMBRE'];
        }
        if (isset($data['DESTINO_NOMBRE'])) {
            $result['nombre_destino'] = $data['DESTINO_NOMBRE'];
        }

        return $result;
    }
}
