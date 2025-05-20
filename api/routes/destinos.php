<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

// Incluir archivos necesarios
require_once __DIR__ . '/../models/Destino.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';

$app->group('/api/destinations', function (RouteCollectorProxy $group) {
    // Obtener todos los destinos
    $group->get('', function (Request $request, Response $response) {
        $db = $this->get('db');
        $stmt = $db->query('SELECT * FROM DESTINOS');
        $destinations = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($destinations));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener un destino por ID
    $group->get('/{id}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('SELECT * FROM DESTINOS WHERE ID = ?');
        $stmt->execute([$args['id']]);
        $destination = $stmt->fetch();
        
        if (!$destination) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Destino no encontrado'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Obtener imágenes del destino
        $stmtImages = $db->prepare('SELECT * FROM IMAGENES_DESTINO WHERE ID_DESTINO = ?');
        $stmtImages->execute([$args['id']]);
        $images = $stmtImages->fetchAll();
        
        $destination['imagenes'] = $images;
        
        // Obtener actividades del destino
        $stmtActivities = $db->prepare('SELECT * FROM ACTIVIDADES WHERE ID_DESTINO = ?');
        $stmtActivities->execute([$args['id']]);
        $activities = $stmtActivities->fetchAll();
        
        $destination['actividades'] = $activities;
        
        $response->getBody()->write(json_encode($destination));
        return $response->withHeader('Content-Type', 'application/json');
    });
});
