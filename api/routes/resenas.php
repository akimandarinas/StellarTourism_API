<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

// Actualizar las importaciones para usar el nuevo servicio de autenticación
require_once __DIR__ . '/../utils/auth_utils.php';

$app->group('/api/reviews', function (RouteCollectorProxy $group) {
    // Obtener reseñas por destino
    $group->get('/destination/{destinationId}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('
            SELECT r.*, u.NOMBRE as USUARIO_NOMBRE
            FROM RESEÑAS r
            JOIN USUARIOS u ON r.ID_USUARIO = u.ID
            WHERE r.ID_DESTINO = ?
            ORDER BY r.CREATED_AT DESC
        ');
        $stmt->execute([$args['destinationId']]);
        $reviews = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($reviews));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener reseñas por usuario
    $group->get('/user/{userId}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('
            SELECT r.*, d.NOMBRE as DESTINO_NOMBRE
            FROM RESEÑAS r
            JOIN DESTINOS d ON r.ID_DESTINO = d.ID
            WHERE r.ID_USUARIO = ?
            ORDER BY r.CREATED_AT DESC
        ');
        $stmt->execute([$args['userId']]);
        $reviews = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($reviews));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Crear una nueva reseña
    $group->post('', function (Request $request, Response $response) {
        $data = $request->getParsedBody();
        
        // Validar datos
        $requiredFields = ['ID_USUARIO', 'ID_DESTINO', 'RATING'];
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
        
        // Verificar si el usuario ya ha dejado una reseña para este destino
        $stmt = $db->prepare('SELECT ID FROM RESEÑAS WHERE ID_USUARIO = ? AND ID_DESTINO = ?');
        $stmt->execute([$data['ID_USUARIO'], $data['ID_DESTINO']]);
        $existingReview = $stmt->fetch();
        
        if ($existingReview) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Ya has dejado una reseña para este destino'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Crear reseña
        $stmt = $db->prepare('
            INSERT INTO RESEÑAS (ID_USUARIO, ID_DESTINO, RATING, COMENTARIO, VERIFICADO, CREATED_AT)
            VALUES (?, ?, ?, ?, ?, NOW())
        ');
        
        $stmt->execute([
            $data['ID_USUARIO'],
            $data['ID_DESTINO'],
            $data['RATING'],
            $data['COMENTARIO'] ?? null,
            'PENDIENTE'
        ]);
        
        $reviewId = $db->lastInsertId();
        
        $response->getBody()->write(json_encode([
            'status' => 'success',
            'message' => 'Reseña creada correctamente',
            'reviewId' => $reviewId
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
});
