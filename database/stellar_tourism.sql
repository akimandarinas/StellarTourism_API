-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS stellar_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stellar_tourism;

CREATE TABLE IF NOT EXISTS usuarios (
   id INT AUTO_INCREMENT PRIMARY KEY,
   firebase_uid VARCHAR(128) UNIQUE,
   nombre VARCHAR(100) NOT NULL,
   apellidos VARCHAR(100) NOT NULL,
   email VARCHAR(100) UNIQUE NOT NULL,
   password VARCHAR(255),
   telefono VARCHAR(20),
   fecha_nacimiento DATE,
   nacionalidad VARCHAR(50),
   direccion TEXT,
   estado VARCHAR(50) DEFAULT 'activo',
   rol ENUM('usuario', 'admin') DEFAULT 'usuario',
   fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de destinos
CREATE TABLE IF NOT EXISTS destinos (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nombre VARCHAR(100) NOT NULL,
   descripcion TEXT NOT NULL,
   tipo ENUM('planeta', 'luna', 'estacion', 'asteroide') NOT NULL,
   distancia_tierra BIGINT NOT NULL COMMENT 'Distancia en kilómetros',
   tiempo_viaje INT NOT NULL COMMENT 'Tiempo en días',
   gravedad DECIMAL(5,2) COMMENT 'Relativa a la Tierra (1.0)',
   temperatura_min INT COMMENT 'En grados Celsius',
   temperatura_max INT COMMENT 'En grados Celsius',
   imagen_url VARCHAR(255),
   modelo_3d_url VARCHAR(255),
   destacado BOOLEAN DEFAULT FALSE,
   activo BOOLEAN DEFAULT TRUE,
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   imagen VARCHAR(255),
   precio DECIMAL(10,2) NOT NULL DEFAULT 0,
   duracion INT NOT NULL DEFAULT 0 COMMENT 'Duración en días',
   distancia DECIMAL(20,2) NOT NULL DEFAULT 0 COMMENT 'Distancia en kilómetros',
   temperatura DECIMAL(5,2) COMMENT 'Temperatura promedio en grados Celsius'
);

-- Tabla de naves
CREATE TABLE IF NOT EXISTS naves (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nombre VARCHAR(100) NOT NULL,
   descripcion TEXT NOT NULL,
   tipo ENUM('transporte', 'exploración', 'carga', 'lujo') NOT NULL,
   capacidad_pasajeros INT NOT NULL,
   velocidad_maxima INT NOT NULL COMMENT 'En km/h',
   autonomia INT NOT NULL COMMENT 'En días',
   imagen_url VARCHAR(255),
   modelo_3d_url VARCHAR(255),
   destacado BOOLEAN DEFAULT FALSE,
   activo BOOLEAN DEFAULT TRUE,
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   imagen VARCHAR(255),
   capacidad VARCHAR(255),
   velocidad VARCHAR(255),
   estado VARCHAR(255) DEFAULT 'disponible'
);

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS rutas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   destino_id INT NOT NULL,
   nave_id INT NOT NULL,
   nombre VARCHAR(100) NOT NULL,
   descripcion TEXT NOT NULL,
   duracion INT NOT NULL COMMENT 'Duración en días',
   distancia BIGINT NOT NULL COMMENT 'Distancia en kilómetros',
   precio DECIMAL(10,2) NOT NULL,
   plazas_disponibles INT NOT NULL,
   fecha_salida DATE NOT NULL,
   fecha_regreso DATE NOT NULL,
   destacado BOOLEAN DEFAULT FALSE,
   activo BOOLEAN DEFAULT TRUE,
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   origen_id VARCHAR(255),
   FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
   FOREIGN KEY (nave_id) REFERENCES naves(id) ON DELETE CASCADE
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS actividades (
   id INT AUTO_INCREMENT PRIMARY KEY,
   destino_id INT NOT NULL,
   nombre VARCHAR(100) NOT NULL,
   descripcion TEXT NOT NULL,
   duracion INT NOT NULL COMMENT 'Duración en horas',
   nivel_dificultad ENUM('baja', 'media', 'alta') NOT NULL,
   precio DECIMAL(10,2) NOT NULL,
   imagen_url VARCHAR(255),
   activo BOOLEAN DEFAULT TRUE,
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   dificultad VARCHAR(255),
   FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   usuario_id INT NOT NULL,
   ruta_id INT NOT NULL,
   numero_pasajeros INT NOT NULL,
   precio_total DECIMAL(10,2) NOT NULL,
   estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
   fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   nave_id VARCHAR(255),
   fecha_salida VARCHAR(255),
   fecha_regreso VARCHAR(255),
   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
   FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE CASCADE
);

-- Tabla de actividades reservadas
CREATE TABLE IF NOT EXISTS actividades_reservadas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   reserva_id INT NOT NULL,
   actividad_id INT NOT NULL,
   cantidad INT NOT NULL,
   precio_total DECIMAL(10,2) NOT NULL,
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   precio VARCHAR(255),
   FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
   FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
   id INT AUTO_INCREMENT PRIMARY KEY,
   reserva_id INT NOT NULL,
   monto DECIMAL(10,2) NOT NULL,
   metodo_pago ENUM('tarjeta', 'paypal', 'transferencia') NOT NULL,
   referencia_pago VARCHAR(255) NOT NULL,
   estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
   fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   fecha VARCHAR(255),
   metodo VARCHAR(255),
   referencia VARCHAR(255),
   FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS resenas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   usuario_id INT NOT NULL,
   destino_id INT NOT NULL,
   titulo VARCHAR(100) NOT NULL,
   comentario TEXT NOT NULL,
   puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
   fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   calificacion VARCHAR(255),
   fecha VARCHAR(255),
   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
   FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE
);

-- Insertar datos de ejemplo para destinos
INSERT INTO destinos (nombre, descripcion, tipo, distancia_tierra, tiempo_viaje, gravedad, temperatura_min, temperatura_max, imagen_url, modelo_3d_url, destacado, activo, imagen, precio, duracion, distancia, temperatura) VALUES
('Marte', 'El cuarto planeta del Sistema Solar, conocido como el planeta rojo.', 'planeta', 225000000, 180, 0.38, -125, 20, '/images/destinos/marte.jpg', '/models/destinos/marte.glb', TRUE, TRUE, '/images/destinos/marte-alt.jpg', 12000000.00, 180, 225000000.00, -55.00),
('Luna', 'El único satélite natural de la Tierra.', 'luna', 384400, 3, 0.17, -173, 127, '/images/destinos/luna.jpg', '/models/destinos/luna.glb', TRUE, TRUE, '/images/destinos/luna-alt.jpg', 1500000.00, 7, 384400.00, -20.00),
('Estación Espacial Internacional', 'Laboratorio espacial en órbita terrestre.', 'estacion', 400, 0.1, 0, -157, 121, '/images/destinos/iss.jpg', '/models/destinos/iss.glb', FALSE, TRUE, '/images/destinos/iss-alt.jpg', 800000.00, 10, 400.00, -18.00),
('Europa', 'Luna de Júpiter con un océano bajo su superficie helada.', 'luna', 628300000, 365, 0.13, -220, -160, '/images/destinos/europa.jpg', '/models/destinos/europa.glb', TRUE, TRUE, '/images/destinos/europa-alt.jpg', 25000000.00, 400, 628300000.00, -190.00),
('Titán', 'La luna más grande de Saturno con atmósfera densa.', 'luna', 1200000000, 420, 0.14, -180, -178, '/images/destinos/titan.jpg', '/models/destinos/titan.glb', FALSE, TRUE, '/images/destinos/titan-alt.jpg', 30000000.00, 450, 1200000000.00, -179.00);

-- Insertar datos de ejemplo para naves
INSERT INTO naves (nombre, descripcion, tipo, capacidad_pasajeros, velocidad_maxima, autonomia, imagen_url, modelo_3d_url, destacado, activo, imagen, capacidad, velocidad, estado) VALUES
('Orion Explorer', 'Nave de exploración espacial de última generación.', 'exploración', 6, 28000, 100, '/images/naves/orion.jpg', '/models/naves/orion.glb', TRUE, TRUE, '/images/naves/orion-alt.jpg', '6 pasajeros', '28,000 km/h', 'operativa'),
('Stellar Cruiser', 'Crucero espacial de lujo para viajes interplanetarios.', 'lujo', 120, 18000, 200, '/images/naves/cruiser.jpg', '/models/naves/cruiser.glb', TRUE, TRUE, '/images/naves/cruiser-alt.jpg', '120 pasajeros', '18,000 km/h', 'operativa'),
('Cargo Hauler', 'Nave de carga pesada para misiones de abastecimiento.', 'carga', 8, 15000, 150, '/images/naves/cargo.jpg', '/models/naves/cargo.glb', FALSE, TRUE, '/images/naves/cargo-alt.jpg', '8 pasajeros + 500 ton carga', '15,000 km/h', 'mantenimiento'),
('Mars Shuttle', 'Transporte rápido especializado en viajes a Marte.', 'transporte', 50, 25000, 120, '/images/naves/shuttle.jpg', '/models/naves/shuttle.glb', TRUE, TRUE, '/images/naves/shuttle-alt.jpg', '50 pasajeros', '25,000 km/h', 'operativa'),
('Space Bus', 'Transporte económico para viajes cortos.', 'transporte', 80, 12000, 30, '/images/naves/bus.jpg', '/models/naves/bus.glb', FALSE, TRUE, '/images/naves/bus-alt.jpg', '80 pasajeros', '12,000 km/h', 'operativa');

-- Insertar datos de ejemplo para rutas
INSERT INTO rutas (destino_id, nave_id, nombre, descripcion, duracion, distancia, precio, plazas_disponibles, fecha_salida, fecha_regreso, destacado, activo, origen_id) VALUES
(1, 4, 'Expedición a Marte', 'Viaje directo al planeta rojo.', 180, 225000000, 12000000.00, 40, '2024-06-15', '2024-12-15', TRUE, TRUE, 'Tierra'),
(2, 5, 'Tour Lunar', 'Visita a la Luna con paseos por la superficie.', 7, 384400, 1500000.00, 60, '2024-05-10', '2024-05-17', TRUE, TRUE, 'Tierra'),
(3, 1, 'Visita a la EEI', 'Estancia en la Estación Espacial Internacional.', 10, 400, 800000.00, 4, '2024-04-20', '2024-04-30', FALSE, TRUE, 'Tierra'),
(4, 2, 'Exploración de Europa', 'Viaje a la misteriosa luna de Júpiter.', 400, 628300000, 25000000.00, 80, '2024-08-01', '2025-09-05', TRUE, TRUE, 'Tierra'),
(5, 3, 'Misión Titán', 'Expedición científica a la luna de Saturno.', 450, 1200000000, 30000000.00, 6, '2024-10-10', '2025-12-25', FALSE, TRUE, 'Tierra');

-- Insertar datos de ejemplo para actividades
INSERT INTO actividades (destino_id, nombre, descripcion, duracion, nivel_dificultad, precio, imagen_url, activo, dificultad) VALUES
(1, 'Exploración de Valles Marcianos', 'Recorrido por los impresionantes valles de Marte.', 8, 'media', 250000.00, '/images/actividades/valles_marte.jpg', TRUE, 'Moderada'),
(1, 'Ascenso al Monte Olimpo', 'Escalada al volcán más alto del Sistema Solar.', 12, 'alta', 500000.00, '/images/actividades/olimpo.jpg', TRUE, 'Difícil'),
(2, 'Paseo por el Mar de la Tranquilidad', 'Visita al histórico sitio de aterrizaje del Apollo 11.', 4, 'baja', 100000.00, '/images/actividades/tranquilidad.jpg', TRUE, 'Fácil'),
(2, 'Conducción de Rover Lunar', 'Experiencia conduciendo un vehículo lunar.', 3, 'media', 150000.00, '/images/actividades/rover.jpg', TRUE, 'Moderada'),
(4, 'Exploración Submarina', 'Inmersión en el océano subterráneo de Europa.', 6, 'alta', 800000.00, '/images/actividades/submarina.jpg', TRUE, 'Difícil');

-- Insertar datos de ejemplo para usuarios
INSERT INTO usuarios (firebase_uid, nombre, apellidos, email, telefono, fecha_nacimiento, nacionalidad, direccion, rol, password, estado) VALUES
('firebase1', 'Admin', 'Sistema', 'admin@stellartourism.com', '+34600000000', '1980-01-01', 'Española', 'Calle Administración 1, Madrid', 'admin', '$2y$10$abcdefghijklmnopqrstuv', 'activo'),
('firebase2', 'Juan', 'Pérez', 'juan@example.com', '+34611111111', '1985-05-15', 'Española', 'Calle Principal 123, Barcelona', 'usuario', '$2y$10$abcdefghijklmnopqrstuv', 'activo'),
('firebase3', 'María', 'González', 'maria@example.com', '+34622222222', '1990-10-20', 'Mexicana', 'Avenida Central 456, Ciudad de México', 'usuario', '$2y$10$abcdefghijklmnopqrstuv', 'activo'),
('firebase4', 'Robert', 'Smith', 'robert@example.com', '+1555123456', '1982-03-25', 'Estadounidense', '123 Main St, New York', 'usuario', '$2y$10$abcdefghijklmnopqrstuv', 'activo'),
('firebase5', 'Sophie', 'Dubois', 'sophie@example.com', '+33123456789', '1995-07-12', 'Francesa', '15 Rue de Paris, París', 'usuario', '$2y$10$abcdefghijklmnopqrstuv', 'activo');

-- Insertar datos de ejemplo para reservas
INSERT INTO reservas (usuario_id, ruta_id, numero_pasajeros, precio_total, estado, nave_id, fecha_salida, fecha_regreso) VALUES
(2, 2, 2, 3000000.00, 'confirmada', '5', '2024-05-10', '2024-05-17'),
(3, 1, 1, 12000000.00, 'pendiente', '4', '2024-06-15', '2024-12-15'),
(4, 3, 2, 1600000.00, 'completada', '1', '2024-04-20', '2024-04-30'),
(5, 4, 3, 75000000.00, 'confirmada', '2', '2024-08-01', '2025-09-05'),
(2, 5, 1, 30000000.00, 'cancelada', '3', '2024-10-10', '2025-12-25');

-- Insertar datos de ejemplo para actividades reservadas
INSERT INTO actividades_reservadas (reserva_id, actividad_id, cantidad, precio_total, precio) VALUES
(1, 3, 2, 200000.00, '100000.00'),
(1, 4, 2, 300000.00, '150000.00'),
(2, 1, 1, 250000.00, '250000.00'),
(3, 3, 2, 200000.00, '100000.00'),
(4, 5, 3, 2400000.00, '800000.00');

-- Insertar datos de ejemplo para pagos
INSERT INTO pagos (reserva_id, monto, metodo_pago, referencia_pago, estado, fecha, metodo, referencia) VALUES
(1, 3500000.00, 'tarjeta', 'PAY-1234567890', 'completado', '2024-05-01', 'Tarjeta de crédito', 'PAY-1234567890'),
(2, 12250000.00, 'transferencia', 'TRF-0987654321', 'pendiente', '2024-06-01', 'Transferencia bancaria', 'TRF-0987654321'),
(3, 1800000.00, 'paypal', 'PP-1122334455', 'completado', '2024-04-15', 'PayPal', 'PP-1122334455'),
(4, 77400000.00, 'tarjeta', 'PAY-5566778899', 'completado', '2024-07-25', 'Tarjeta de crédito', 'PAY-5566778899'),
(5, 30000000.00, 'tarjeta', 'PAY-9988776655', 'reembolsado', '2024-10-01', 'Tarjeta de crédito', 'PAY-9988776655');

-- Insertar datos de ejemplo para reseñas
INSERT INTO resenas (usuario_id, destino_id, titulo, comentario, puntuacion, calificacion, fecha) VALUES
(2, 2, 'Experiencia inolvidable', 'El paisaje lunar es impresionante, totalmente recomendable.', 5, '5 estrellas', '2024-05-20'),
(3, 1, 'Aventura marciana', 'Marte es fascinante pero el viaje es muy largo.', 4, '4 estrellas', '2024-12-20'),
(4, 3, 'Visita a la EEI', 'Increíble ver la Tierra desde el espacio.', 5, '5 estrellas', '2024-05-05'),
(5, 4, 'Europa es mágica', 'El hielo y los géiseres son espectaculares.', 4, '4 estrellas', '2025-09-10'),
(2, 5, 'Titán sorprendente', 'La atmósfera naranja es impresionante, pero hace mucho frío.', 3, '3 estrellas', '2025-12-30');

CREATE INDEX idx_destinos_tipo ON destinos(tipo);
CREATE INDEX idx_destinos_destacado ON destinos(destacado);
CREATE INDEX idx_naves_tipo ON naves(tipo);
CREATE INDEX idx_naves_destacado ON naves(destacado);
CREATE INDEX idx_rutas_destino ON rutas(destino_id);
CREATE INDEX idx_rutas_nave ON rutas(nave_id);
CREATE INDEX idx_rutas_fecha_salida ON rutas(fecha_salida);
CREATE INDEX idx_actividades_destino ON actividades(destino_id);
CREATE INDEX idx_actividades_nivel ON actividades(nivel_dificultad);
CREATE INDEX idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX idx_reservas_ruta ON reservas(ruta_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_pagos_reserva ON pagos(reserva_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_resenas_usuario ON resenas(usuario_id);
CREATE INDEX idx_resenas_destino ON resenas(destino_id);
CREATE INDEX idx_resenas_puntuacion ON resenas(puntuacion);
CREATE INDEX idx_actividades_reservadas_reserva ON actividades_reservadas(reserva_id);
CREATE INDEX idx_actividades_reservadas_actividad ON actividades_reservadas(actividad_id);
