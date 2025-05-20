<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

// Incluir archivos necesarios
require_once __DIR__ . '/../models/Ruta.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';

$app->group('/api/routes', function (RouteCollectorProxy $group) {
    // Obtener todas las rutas
    $group->get('', function (Request $request, Response $response) {
        $db = $this->get('db');
        $stmt = $db->query('SELECT * FROM RUTAS');
        $routes = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($routes));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener una ruta por ID
    $group->get('/{id}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('SELECT * FROM RUTAS WHERE ID = ?');
        $stmt->execute([$args['id']]);
        $route = $stmt->fetch();
        
        if (!$route) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Ruta no encontrada'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Obtener segmentos de la ruta
        $stmtSegments = $db->prepare('
            SELECT sr.*, d1.NOMBRE as ORIGEN_NOMBRE, d2.NOMBRE as DESTINO_NOMBRE, n.NOMBRE as NAVE_NOMBRE
            FROM SEGMENTOS_RUTA sr
            JOIN DESTINOS d1 ON sr.ID_ORIGEN = d1.ID
            JOIN DESTINOS d2 ON sr.ID_DESTINO = d2.ID
            JOIN NAVES n ON sr.ID_NAVE = n.ID
            WHERE sr.ID_RUTA = ?
            ORDER BY sr.SEGMENTO
        ');
        $stmtSegments->execute([$args['id']]);
        $segments = $stmtSegments->fetchAll();
        
        $route['segmentos'] = $segments;
        
        $response->getBody()->write(json_encode($route));
        return $response->withHeader('Content-Type', 'application/json');
    });
});
