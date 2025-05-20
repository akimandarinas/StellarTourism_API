<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

// Incluir archivos necesarios
require_once __DIR__ . '/../models/Actividad.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';

$app->group('/api/activities', function (RouteCollectorProxy $group) {
    // Obtener todas las actividades
    $group->get('', function (Request $request, Response $response) {
        $db = $this->get('db');
        $stmt = $db->query('
            SELECT a.*, d.NOMBRE as DESTINO_NOMBRE
            FROM ACTIVIDADES a
            JOIN DESTINOS d ON a.ID_DESTINO = d.ID
            WHERE a.ACTIVO = "SI"
        ');
        $activities = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($activities));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener actividades por destino
    $group->get('/destination/{destinationId}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('
            SELECT * FROM ACTIVIDADES
            WHERE ID_DESTINO = ? AND ACTIVO = "SI"
        ');
        $stmt->execute([$args['destinationId']]);
        $activities = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($activities));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener una actividad por ID
    $group->get('/{id}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('
            SELECT a.*, d.NOMBRE as DESTINO_NOMBRE
            FROM ACTIVIDADES a
            JOIN DESTINOS d ON a.ID_DESTINO = d.ID
            WHERE a.ID = ?
        ');
        $stmt->execute([$args['id']]);
        $activity = $stmt->fetch();
        
        if (!$activity) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Actividad no encontrada'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        $response->getBody()->write(json_encode($activity));
        return $response->withHeader('Content-Type', 'application/json');
    });
});
