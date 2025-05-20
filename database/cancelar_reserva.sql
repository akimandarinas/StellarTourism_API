DELIMITER //

DROP PROCEDURE IF EXISTS cancelar_reserva //

CREATE PROCEDURE cancelar_reserva(
    IN p_reserva_id INT,
    IN p_usuario_id INT,
    OUT p_resultado BOOLEAN,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_estado VARCHAR(20);
    DECLARE v_ruta_id INT;
    DECLARE v_numero_pasajeros INT;
    DECLARE v_reserva_usuario_id INT;
    
    -- Verificar si la reserva existe y pertenece al usuario
    SELECT estado, ruta_id, numero_pasajeros, usuario_id 
    INTO v_estado, v_ruta_id, v_numero_pasajeros, v_reserva_usuario_id
    FROM reservas 
    WHERE id = p_reserva_id;
    
    -- Verificar si la reserva pertenece al usuario
    IF v_reserva_usuario_id <> p_usuario_id THEN
        SET p_resultado = FALSE;
        SET p_mensaje = 'La reserva no pertenece a este usuario';
    ELSEIF v_estado = 'completada' THEN
        SET p_resultado = FALSE;
        SET p_mensaje = 'No se puede cancelar una reserva completada';
    ELSEIF v_estado = 'cancelada' THEN
        SET p_resultado = FALSE;
        SET p_mensaje = 'La reserva ya está cancelada';
    ELSE
        -- Iniciar transacción
        START TRANSACTION;
        
        -- Actualizar estado de la reserva
        UPDATE reservas 
        SET estado = 'cancelada' 
        WHERE id = p_reserva_id;
        
        -- Devolver plazas a la ruta
        UPDATE rutas 
        SET plazas_disponibles = plazas_disponibles + v_numero_pasajeros
        WHERE id = v_ruta_id;
        
        -- Registrar reembolso si hay pagos
        UPDATE pagos
        SET estado = 'reembolsado'
        WHERE reserva_id = p_reserva_id AND estado = 'completado';
        
        COMMIT;
        
        SET p_resultado = TRUE;
        SET p_mensaje = 'Reserva cancelada correctamente';
    END IF;
END //

DELIMITER ;