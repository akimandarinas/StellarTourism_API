<?php
/**
 * Adaptador para el modelo Usuario
 * Este adaptador mapea entre la estructura esperada y la estructura real de la base de datos
 */
class UsuariosAdapter {
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
        if (isset($data['email'])) {
            $result['email'] = $data['email'];
        }
        if (isset($data['password'])) {
            // En este caso, no hay campo password en la base de datos
            // Podríamos usar firebase_uid como sustituto o ignorarlo
        }
        if (isset($data['rol'])) {
            $result['rol'] = $data['rol'];
        }
        if (isset($data['estado'])) {
            $result['activo'] = ($data['estado'] == 'activo') ? 1 : 0;
        }
        if (isset($data['apellidos'])) {
            $result['apellidos'] = $data['apellidos'];
        }
        if (isset($data['telefono'])) {
            $result['telefono'] = $data['telefono'];
        }
        if (isset($data['fecha_nacimiento'])) {
            $result['fecha_nacimiento'] = $data['fecha_nacimiento'];
        }
        if (isset($data['nacionalidad'])) {
            $result['nacionalidad'] = $data['nacionalidad'];
        }
        if (isset($data['direccion'])) {
            $result['direccion'] = $data['direccion'];
        }
        if (isset($data['firebase_uid'])) {
            $result['firebase_uid'] = $data['firebase_uid'];
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
        if (isset($data['email'])) {
            $result['email'] = $data['email'];
        }
        if (isset($data['firebase_uid'])) {
            $result['firebase_uid'] = $data['firebase_uid'];
            // Usamos firebase_uid como sustituto de password
            $result['password'] = '[PROTEGIDO]';
        }
        if (isset($data['rol'])) {
            $result['rol'] = $data['rol'];
        }
        if (isset($data['activo'])) {
            $result['estado'] = ($data['activo'] == 1) ? 'activo' : 'inactivo';
        }
        if (isset($data['apellidos'])) {
            $result['apellidos'] = $data['apellidos'];
        }
        if (isset($data['telefono'])) {
            $result['telefono'] = $data['telefono'];
        }
        if (isset($data['fecha_nacimiento'])) {
            $result['fecha_nacimiento'] = $data['fecha_nacimiento'];
        }
        if (isset($data['nacionalidad'])) {
            $result['nacionalidad'] = $data['nacionalidad'];
        }
        if (isset($data['direccion'])) {
            $result['direccion'] = $data['direccion'];
        }
        if (isset($data['fecha_registro'])) {
            $result['fecha_registro'] = $data['fecha_registro'];
        }

        return $result;
    }
}
