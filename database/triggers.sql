DELIMITER //

CREATE TRIGGER after_reserva_cancel
AFTER UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF OLD.estado != 'cancelada' AND NEW.estado = 'cancelada' THEN
        UPDATE rutas 
        SET plazas_disponibles = plazas_disponibles + NEW.numero_pasajeros
        WHERE id = NEW.ruta_id;
    END IF;
END //

CREATE TRIGGER after_reserva_insert
AFTER INSERT ON reservas
FOR EACH ROW
BEGIN
    UPDATE rutas 
    SET plazas_disponibles = plazas_disponibles - NEW.numero_pasajeros
    WHERE id = NEW.ruta_id;
END //

CREATE TRIGGER after_reserva_estado_change
AFTER UPDATE ON reservas
FOR EACH ROW
BEGIN
    DECLARE v_titulo VARCHAR(100);
    DECLARE v_mensaje TEXT;
    
    IF OLD.estado != NEW.estado THEN
        CASE NEW.estado
            WHEN 'confirmada' THEN
                SET v_titulo = 'Reserva confirmada';
                SET v_mensaje = CONCAT('Tu reserva #', NEW.id, ' ha sido confirmada.');
            WHEN 'cancelada' THEN
                SET v_titulo = 'Reserva cancelada';
                SET v_mensaje = CONCAT('Tu reserva #', NEW.id, ' ha sido cancelada.');
            WHEN 'completada' THEN
                SET v_titulo = 'Reserva completada';
                SET v_mensaje = CONCAT('Tu reserva #', NEW.id, ' ha sido completada. ¡Gracias por viajar con nosotros!');
            ELSE
                SET v_titulo = 'Estado de reserva actualizado';
                SET v_mensaje = CONCAT('El estado de tu reserva #', NEW.id, ' ha cambiado a ', NEW.estado);
        END CASE;
        
        INSERT INTO notificaciones_historial (
            usuario_id, 
            titulo, 
            mensaje, 
            tipo, 
            datos_adicionales
        ) VALUES (
            NEW.usuario_id,
            v_titulo,
            v_mensaje,
            'reserva',
            JSON_OBJECT('reserva_id', NEW.id, 'estado', NEW.estado)
        );
    END IF;
END //

CREATE TRIGGER after_pago_insert
AFTER INSERT ON pagos
FOR EACH ROW
BEGIN
    DECLARE v_usuario_id INT;
    DECLARE v_titulo VARCHAR(100);
    DECLARE v_mensaje TEXT;
    
    SELECT usuario_id INTO v_usuario_id
    FROM reservas
    WHERE id = NEW.reserva_id;
    
    SET v_titulo = 'Pago registrado';
    SET v_mensaje = CONCAT('Se ha registrado un pago de ', FORMAT(NEW.monto, 2), ' € para tu reserva #', NEW.reserva_id);
    
    INSERT INTO notificaciones_historial (
        usuario_id, 
        titulo, 
        mensaje, 
        tipo, 
        datos_adicionales
    ) VALUES (
        v_usuario_id,
        v_titulo,
        v_mensaje,
        'pago',
        JSON_OBJECT('reserva_id', NEW.reserva_id, 'pago_id', NEW.id, 'monto', NEW.monto)
    );
END //

-- Trigger para actualizar el estado de la reserva cuando se completa un pago
CREATE TRIGGER after_pago_update
AFTER UPDATE ON pagos
FOR EACH ROW
BEGIN
    IF OLD.estado != 'completado' AND NEW.estado = 'completado' THEN
        UPDATE reservas
        SET estado = 'confirmada'
        WHERE id = NEW.reserva_id AND estado = 'pendiente';
    END IF;
END //

CREATE TRIGGER before_destino_insert
BEFORE INSERT ON destinos
FOR EACH ROW
BEGIN
    IF NEW.temperatura IS NULL AND NEW.temperatura_min IS NOT NULL AND NEW.temperatura_max IS NOT NULL THEN
        SET NEW.temperatura = (NEW.temperatura_min + NEW.temperatura_max) / 2;
    END IF;
END //

CREATE TRIGGER before_destino_update
BEFORE UPDATE ON destinos
FOR EACH ROW
BEGIN
    IF (NEW.temperatura IS NULL OR OLD.temperatura_min != NEW.temperatura_min OR OLD.temperatura_max != NEW.temperatura_max) 
       AND NEW.temperatura_min IS NOT NULL AND NEW.temperatura_max IS NOT NULL THEN
        SET NEW.temperatura = (NEW.temperatura_min + NEW.temperatura_max) / 2;
    END IF;
END //

DELIMITER ;
