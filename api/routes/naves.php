<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

// Incluir archivos necesarios
require_once __DIR__ . '/../models/Nave.php';
require_once __DIR__ . '/../utils/auth_utils.php';
require_once __DIR__ . '/../utils/response_utils.php';

$app->group('/api/ships', function (RouteCollectorProxy $group) {
    // Obtener todas las naves
    $group->get('', function (Request $request, Response $response) {
        $db = $this->get('db');
        $stmt = $db->query('SELECT * FROM NAVES');
        $ships = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($ships));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener una nave por ID
    $group->get('/{id}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        $stmt = $db->prepare('SELECT * FROM NAVES WHERE ID = ?');
        $stmt->execute([$args['id']]);
        $ship = $stmt->fetch();
        
        if (!$ship) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Nave no encontrada'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Obtener imágenes de la nave
        $stmtImages = $db->prepare('SELECT * FROM IMAGENES_NAVES WHERE ID_NAVES = ?');
        $stmtImages->execute([$args['id']]);
        $images = $stmtImages->fetchAll();
        
        $ship['imagenes'] = $images;
        
        // Obtener comodidades de la nave
        $stmtAmenities = $db->prepare('SELECT * FROM COMODIDADES_NAVE WHERE ID_NAVE = ?');
        $stmtAmenities->execute([$args['id']]);
        $amenities = $stmtAmenities->fetchAll();
        
        $ship['comodidades'] = $amenities;
        
        $response->getBody()->write(json_encode($ship));
        return $response->withHeader('Content-Type', 'application/json');
    });
});
