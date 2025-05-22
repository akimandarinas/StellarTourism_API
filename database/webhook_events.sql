CREATE TABLE IF NOT EXISTS webhook_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_evento VARCHAR(50) NOT NULL,
    payload TEXT NOT NULL,
    estado ENUM('pendiente', 'procesado', 'fallido') DEFAULT 'pendiente',
    intentos INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_procesamiento TIMESTAMP NULL,
    error_mensaje TEXT,
    destino_url VARCHAR(255) NOT NULL,
    headers TEXT,
    respuesta TEXT,
    codigo_respuesta INT
);

CREATE TABLE IF NOT EXISTS webhook_configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    eventos TEXT NOT NULL COMMENT 'JSON con los eventos a los que está suscrito',
    secreto VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- para suscripciones de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones_suscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    auth VARCHAR(100) NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- para historial de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones_historial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_adicionales TEXT COMMENT 'JSON con datos adicionales',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- para optimizar consultas
CREATE INDEX idx_webhook_events_tipo ON webhook_events(tipo_evento);
CREATE INDEX idx_webhook_events_estado ON webhook_events(estado);
CREATE INDEX idx_webhook_configuracion_activo ON webhook_configuracion(activo);
CREATE INDEX idx_notificaciones_usuario ON notificaciones_historial(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones_historial(leida);
CREATE INDEX idx_notificaciones_suscripciones_usuario ON notificaciones_suscripciones(usuario_id);
