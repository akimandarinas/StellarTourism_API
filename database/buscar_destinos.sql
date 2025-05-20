DELIMITER //

DROP PROCEDURE IF EXISTS buscar_destinos //

CREATE PROCEDURE buscar_destinos(
    IN p_tipo VARCHAR(20),
    IN p_min_precio DECIMAL(10,2),
    IN p_max_precio DECIMAL(10,2),
    IN p_max_duracion INT,
    IN p_busqueda VARCHAR(100)
)
BEGIN
    SELECT d.*
    FROM destinos d
    WHERE d.activo = TRUE
      AND (p_tipo IS NULL OR d.tipo = p_tipo)
      AND (p_min_precio IS NULL OR d.precio >= p_min_precio)
      AND (p_max_precio IS NULL OR d.precio <= p_max_precio)
      AND (p_max_duracion IS NULL OR d.duracion <= p_max_duracion)
      AND (p_busqueda IS NULL OR 
           d.nombre LIKE CONCAT('%', p_busqueda, '%') OR 
           d.descripcion LIKE CONCAT('%', p_busqueda, '%'))
    ORDER BY d.destacado DESC, d.nombre;
END //

DELIMITER ;