DELIMITER //

DROP PROCEDURE IF EXISTS crear_reserva_completa //

CREATE PROCEDURE crear_reserva_completa(
    IN p_usuario_id INT,
    IN p_ruta_id INT,
    IN p_numero_pasajeros INT,
    IN p_actividades_json JSON,
    OUT p_reserva_id INT,
    OUT p_precio_total DECIMAL(10,2)
)
BEGIN
    DECLARE v_precio_ruta DECIMAL(10,2);
    DECLARE v_nave_id INT;
    DECLARE v_fecha_salida DATE;
    DECLARE v_fecha_regreso DATE;
    DECLARE v_actividad_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_precio_actividad DECIMAL(10,2);
    DECLARE v_precio_actividades DECIMAL(10,2) DEFAULT 0;
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_actividades_count INT;
    
    -- Obtener información de la ruta
    SELECT precio, nave_id, fecha_salida, fecha_regreso 
    INTO v_precio_ruta, v_nave_id, v_fecha_salida, v_fecha_regreso
    FROM rutas WHERE id = p_ruta_id;
    
    -- Calcular precio base de la ruta
    SET p_precio_total = v_precio_ruta * p_numero_pasajeros;
    
    -- Iniciar transacción
    START TRANSACTION;
    
    -- Crear la reserva
    INSERT INTO reservas (
        usuario_id, 
        ruta_id, 
        numero_pasajeros, 
        precio_total, 
        estado,
        nave_id,
        fecha_salida,
        fecha_regreso
    ) VALUES (
        p_usuario_id, 
        p_ruta_id, 
        p_numero_pasajeros, 
        p_precio_total, 
        'pendiente',
        v_nave_id,
        v_fecha_salida,
        v_fecha_regreso
    );
    
    SET p_reserva_id = LAST_INSERT_ID();
    
    -- Procesar actividades si existen
    SET v_actividades_count = JSON_LENGTH(p_actividades_json);
    
    WHILE v_index < v_actividades_count DO
        -- Extraer datos de cada actividad
        SET v_actividad_id = JSON_EXTRACT(p_actividades_json, CONCAT('$[', v_index, '].id'));
        SET v_cantidad = JSON_EXTRACT(p_actividades_json, CONCAT('$[', v_index, '].cantidad'));
        
        -- Obtener precio de la actividad
        SELECT precio INTO v_precio_actividad FROM actividades WHERE id = v_actividad_id;
        
        -- Calcular precio total de esta actividad
        SET v_precio_actividades = v_precio_actividades + (v_precio_actividad * v_cantidad);
        
        -- Insertar actividad reservada
        INSERT INTO actividades_reservadas (
            reserva_id, 
            actividad_id, 
            cantidad, 
            precio_total,
            precio
        ) VALUES (
            p_reserva_id, 
            v_actividad_id, 
            v_cantidad, 
            v_precio_actividad * v_cantidad,
            v_precio_actividad
        );
        
        SET v_index = v_index + 1;
    END WHILE;
    
    -- Actualizar precio total de la reserva incluyendo actividades
    SET p_precio_total = p_precio_total + v_precio_actividades;
    
    UPDATE reservas 
    SET precio_total = p_precio_total
    WHERE id = p_reserva_id;
    
    -- Actualizar plazas disponibles en la ruta
    UPDATE rutas 
    SET plazas_disponibles = plazas_disponibles - p_numero_pasajeros
    WHERE id = p_ruta_id;
    
    COMMIT;
END //

DELIMITER ;