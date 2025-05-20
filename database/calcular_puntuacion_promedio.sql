DELIMITER //

DROP FUNCTION IF EXISTS calcular_puntuacion_promedio //

CREATE FUNCTION calcular_puntuacion_promedio(p_destino_id INT) 
RETURNS DECIMAL(3,1)
DETERMINISTIC
BEGIN
    DECLARE v_puntuacion DECIMAL(3,1);
    
    SELECT AVG(puntuacion) INTO v_puntuacion
    FROM resenas
    WHERE destino_id = p_destino_id;
    
    RETURN COALESCE(v_puntuacion, 0);
END //

DELIMITER ;