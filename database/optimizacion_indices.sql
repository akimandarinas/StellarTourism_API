-- Índices para la tabla destinos
CREATE INDEX IF NOT EXISTS idx_destinos_nombre ON destinos(nombre);
CREATE INDEX IF NOT EXISTS idx_destinos_tipo ON destinos(tipo);
CREATE INDEX IF NOT EXISTS idx_destinos_destacado ON destinos(destacado, activo);
CREATE INDEX IF NOT EXISTS idx_destinos_precio ON destinos(precio);
CREATE INDEX IF NOT EXISTS idx_destinos_duracion ON destinos(duracion);
CREATE INDEX IF NOT EXISTS idx_destinos_temperatura ON destinos(temperatura);

-- Índices para la tabla naves
CREATE INDEX IF NOT EXISTS idx_naves_nombre ON naves(nombre);
CREATE INDEX IF NOT EXISTS idx_naves_tipo ON naves(tipo);
CREATE INDEX IF NOT EXISTS idx_naves_destacado ON naves(destacado, activo);
CREATE INDEX IF NOT EXISTS idx_naves_capacidad_pasajeros ON naves(capacidad_pasajeros);
CREATE INDEX IF NOT EXISTS idx_naves_velocidad_maxima ON naves(velocidad_maxima);
CREATE INDEX IF NOT EXISTS idx_naves_estado ON naves(estado);

-- Índices para la tabla rutas
CREATE INDEX IF NOT EXISTS idx_rutas_nombre ON rutas(nombre);
CREATE INDEX IF NOT EXISTS idx_rutas_destino_nave ON rutas(destino_id, nave_id);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha_salida ON rutas(fecha_salida);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha_regreso ON rutas(fecha_regreso);
CREATE INDEX IF NOT EXISTS idx_rutas_precio ON rutas(precio);
CREATE INDEX IF NOT EXISTS idx_rutas_plazas ON rutas(plazas_disponibles);
CREATE INDEX IF NOT EXISTS idx_rutas_destacado ON rutas(destacado, activo);
CREATE INDEX IF NOT EXISTS idx_rutas_origen ON rutas(origen_id);

-- Índices para la tabla actividades
CREATE INDEX IF NOT EXISTS idx_actividades_nombre ON actividades(nombre);
CREATE INDEX IF NOT EXISTS idx_actividades_destino ON actividades(destino_id);
CREATE INDEX IF NOT EXISTS idx_actividades_nivel ON actividades(nivel_dificultad);
CREATE INDEX IF NOT EXISTS idx_actividades_precio ON actividades(precio);
CREATE INDEX IF NOT EXISTS idx_actividades_duracion ON actividades(duracion);
CREATE INDEX IF NOT EXISTS idx_actividades_dificultad ON actividades(dificultad);

-- Índices para la tabla reservas
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservas_ruta ON reservas(ruta_id);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_reservas_nave ON reservas(nave_id);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_salida ON reservas(fecha_salida);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_regreso ON reservas(fecha_regreso);

-- Índices para la tabla actividades_reservadas
CREATE INDEX IF NOT EXISTS idx_act_res_reserva ON actividades_reservadas(reserva_id);
CREATE INDEX IF NOT EXISTS idx_act_res_actividad ON actividades_reservadas(actividad_id);
CREATE INDEX IF NOT EXISTS idx_act_res_cantidad ON actividades_reservadas(cantidad);
CREATE INDEX IF NOT EXISTS idx_act_res_precio ON actividades_reservadas(precio);

-- Índices para la tabla pagos
CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON pagos(reserva_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_metodo ON pagos(metodo_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_monto ON pagos(monto);
CREATE INDEX IF NOT EXISTS idx_pagos_referencia ON pagos(referencia_pago);

-- Índices para la tabla reseñas
CREATE INDEX IF NOT EXISTS idx_resenas_usuario ON resenas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resenas_destino ON resenas(destino_id);
CREATE INDEX IF NOT EXISTS idx_resenas_puntuacion ON resenas(puntuacion);
CREATE INDEX IF NOT EXISTS idx_resenas_fecha ON resenas(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_resenas_calificacion ON resenas(calificacion);

-- Índices para la tabla usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_firebase ON usuarios(firebase_uid);

-- Vistas para consultas frecuentes
CREATE OR REPLACE VIEW vista_destinos_activos AS
SELECT id, nombre, descripcion, tipo, imagen_url, precio, duracion, distancia, temperatura
FROM destinos
WHERE activo = TRUE;

CREATE OR REPLACE VIEW vista_rutas_disponibles AS
SELECT r.id, r.nombre, r.descripcion, r.precio, r.fecha_salida, r.fecha_regreso, 
       r.plazas_disponibles, d.nombre AS destino, n.nombre AS nave
FROM rutas r
JOIN destinos d ON r.destino_id = d.id
JOIN naves n ON r.nave_id = n.id
WHERE r.activo = TRUE AND r.plazas_disponibles > 0 AND r.fecha_salida > CURDATE();

CREATE OR REPLACE VIEW vista_actividades_por_destino AS
SELECT a.id, a.nombre, a.descripcion, a.precio, a.duracion, a.nivel_dificultad,
       a.imagen_url, d.nombre AS destino
FROM actividades a
JOIN destinos d ON a.destino_id = d.id
WHERE a.activo = TRUE;

CREATE OR REPLACE VIEW vista_reservas_completas AS
SELECT r.id, r.fecha_reserva, r.estado, r.precio_total, r.numero_pasajeros,
       u.nombre AS usuario, u.email, rt.nombre AS ruta, d.nombre AS destino,
       n.nombre AS nave, r.fecha_salida, r.fecha_regreso
FROM reservas r
JOIN usuarios u ON r.usuario_id = u.id
JOIN rutas rt ON r.ruta_id = rt.id
JOIN destinos d ON rt.destino_id = d.id
JOIN naves n ON rt.nave_id = n.id;

DELIMITER //

CREATE PROCEDURE actualizar_plazas_disponibles(IN ruta_id_param INT, IN cantidad INT)
BEGIN
    UPDATE rutas SET plazas_disponibles = plazas_disponibles - cantidad
    WHERE id = ruta_id_param AND plazas_disponibles >= cantidad;
END //

CREATE PROCEDURE buscar_rutas_disponibles(
    IN destino_nombre VARCHAR(100),
    IN fecha_desde DATE,
    IN fecha_hasta DATE,
    IN pasajeros INT
)
BEGIN
    SELECT r.id, r.nombre, r.descripcion, r.precio, r.fecha_salida, r.fecha_regreso, 
           r.plazas_disponibles, d.nombre AS destino, n.nombre AS nave
    FROM rutas r
    JOIN destinos d ON r.destino_id = d.id
    JOIN naves n ON r.nave_id = n.id
    WHERE r.activo = TRUE 
      AND r.plazas_disponibles >= pasajeros 
      AND r.fecha_salida >= fecha_desde
      AND r.fecha_salida <= fecha_hasta
      AND (destino_nombre IS NULL OR d.nombre LIKE CONCAT('%', destino_nombre, '%'))
    ORDER BY r.fecha_salida;
END //

DELIMITER ;
