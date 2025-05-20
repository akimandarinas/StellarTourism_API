<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

// Actualizar las importaciones para usar el nuevo servicio de autenticación
require_once __DIR__ . '/../utils/auth_utils.php';

$app->group('/api/bookings', function (RouteCollectorProxy $group) {
    // Obtener reservas de un usuario
    $group->get('/user/{userId}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('
            SELECT r.*, d.NOMBRE as DESTINO_NOMBRE, n.NOMBRE as NAVE_NOMBRE, ru.NOMBRE as RUTA_NOMBRE
            FROM RESERVAS r
            JOIN DESTINOS d ON r.ID_DESTINO = d.ID
            JOIN NAVES n ON r.ID_NAVE = n.ID
            JOIN RUTAS ru ON r.ID_RUTA = ru.ID
            WHERE r.ID_USUARIO = ?
        ');
        $stmt->execute([$args['userId']]);
        $bookings = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($bookings));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener una reserva por ID
    $group->get('/{id}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('
            SELECT r.*, d.NOMBRE as DESTINO_NOMBRE, n.NOMBRE as NAVE_NOMBRE, ru.NOMBRE as RUTA_NOMBRE
            FROM RESERVAS r
            JOIN DESTINOS d ON r.ID_DESTINO = d.ID
            JOIN NAVES n ON r.ID_NAVE = n.ID
            JOIN RUTAS ru ON r.ID_RUTA = ru.ID
            WHERE r.ID = ?
        ');
        $stmt->execute([$args['id']]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Reserva no encontrada'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Obtener pasajeros de la reserva
        $stmtPassengers = $db->prepare('SELECT * FROM PASAJEROS WHERE ID_RESERVA = ?');
        $stmtPassengers->execute([$args['id']]);
        $passengers = $stmtPassengers->fetchAll();
        
        $booking['pasajeros'] = $passengers;
        
        // Obtener actividades reservadas
        $stmtActivities = $db->prepare('
            SELECT ar.*, a.NOMBRE, a.DESCRIPCION
            FROM ACTIVIDADES_RESERVADAS ar
            JOIN ACTIVIDADES a ON ar.ID_ACTIVIDAD = a.ID
            WHERE ar.ID_RESERVA = ?
        ');
        $stmtActivities->execute([$args['id']]);
        $activities = $stmtActivities->fetchAll();
        
        $booking['actividades'] = $activities;
        
        // Obtener pagos
        $stmtPayments = $db->prepare('SELECT * FROM PAGOS WHERE ID_RESERVA = ?');
        $stmtPayments->execute([$args['id']]);
        $payments = $stmtPayments->fetchAll();
        
        $booking['pagos'] = $payments;
        
        $response->getBody()->write(json_encode($booking));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Crear una nueva reserva
    $group->post('', function (Request $request, Response $response) {
        $data = $request->getParsedBody();
        
        // Validar datos
        $requiredFields = ['ID_USUARIO', 'ID_DESTINO', 'ID_NAVE', 'ID_RUTA', 'FECHA_DESPEGUE', 'FECHA_RETORNO', 'PASAJEROS', 'PRECIO', 'TIPO_SEGURO'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                $response->getBody()->write(json_encode([
                    'status' => 'error',
                    'message' => "Campo requerido: $field"
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        }
        
        $db = $this->get('db');
        
        try {
            $db->beginTransaction();
            
            // Insertar reserva
            $stmt = $db->prepare('
                INSERT INTO RESERVAS (ID_USUARIO, ID_DESTINO, ID_NAVE, ID_RUTA, FECHA_DESPEGUE, FECHA_RETORNO, PASAJEROS, ESTADO, PRECIO, TIPO_SEGURO, CREATED_AT)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ');
            $stmt->execute([
                $data['ID_USUARIO'],
                $data['ID_DESTINO'],
                $data['ID_NAVE'],
                $data['ID_RUTA'],
                $data['FECHA_DESPEGUE'],
                $data['FECHA_RETORNO'],
                $data['PASAJEROS'],
                'PENDIENTE',
                $data['PRECIO'],
                $data['TIPO_SEGURO']
            ]);
            
            $bookingId = $db->lastInsertId();
            
            // Insertar pasajeros
            if (isset($data['pasajeros']) && is_array($data['pasajeros'])) {
                $stmtPassenger = $db->prepare('
                    INSERT INTO PASAJEROS (ID_RESERVA, NOMBRE, DOCUMENTO, NUMERO_DOCUMENTO, NACIMIENTO, PAS_ASIENTO, PAS_CLASE, PAS_PRECIO, CREATED_AT)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ');
                
                foreach ($data['pasajeros'] as $passenger) {
                    $stmtPassenger->execute([
                        $bookingId,
                        $passenger['NOMBRE'],
                        $passenger['DOCUMENTO'],
                        $passenger['NUMERO_DOCUMENTO'],
                        $passenger['NACIMIENTO'],
                        $passenger['PAS_ASIENTO'],
                        $passenger['PAS_CLASE'],
                        $passenger['PAS_PRECIO']
                    ]);
                }
            }
            
            // Insertar actividades reservadas
            if (isset($data['actividades']) && is_array($data['actividades'])) {
                $stmtActivity = $db->prepare('
                    INSERT INTO ACTIVIDADES_RESERVADAS (ID_RESERVA, ID_ACTIVIDAD, CANTIDAD, PRECIO, CREATED_AT)
                    VALUES (?, ?, ?, ?, NOW())
                ');
                
                foreach ($data['actividades'] as $activity) {
                    $stmtActivity->execute([
                        $bookingId,
                        $activity['ID_ACTIVIDAD'],
                        $activity['CANTIDAD'],
                        $activity['PRECIO']
                    ]);
                }
            }
            
            $db->commit();
            
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'message' => 'Reserva creada correctamente',
                'bookingId' => $bookingId
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (Exception $e) {
            $db->rollBack();
            
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Error al crear la reserva: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
});
