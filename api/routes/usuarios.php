<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

// Actualizar las importaciones para usar el nuevo servicio de autenticación
require_once __DIR__ . '/../utils/auth_utils.php';

$app->group('/api/users', function (RouteCollectorProxy $group) {
    // Obtener un usuario por Firebase UID
    $group->get('/firebase/{firebaseUid}', function (Request $request, Response $response, $args) {
        $db = $this->get('db');
        
        // Usar consulta preparada para prevenir inyección SQL
        $stmt = $db->prepare('SELECT * FROM USUARIOS WHERE FIREBASE_UID = ?');
        $stmt->execute([$args['firebaseUid']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Usuario no encontrado'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // No devolver la contraseña hash
        unset($user['PASSWORD_HASH']);
        
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Crear un nuevo usuario
    $group->post('', function (Request $request, Response $response) {
        $data = $request->getParsedBody();
        
        // Validar datos
        $requiredFields = ['FIREBASE_UID', 'EMAIL', 'NOMBRE'];
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
        
        // Verificar si el usuario ya existe usando consulta preparada
        $stmt = $db->prepare('SELECT ID FROM USUARIOS WHERE FIREBASE_UID = ? OR EMAIL = ?');
        $stmt->execute([$data['FIREBASE_UID'], $data['EMAIL']]);
        $existingUser = $stmt->fetch();
        
        if ($existingUser) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'El usuario ya existe'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Crear usuario con consulta preparada
        $stmt = $db->prepare('
            INSERT INTO USUARIOS (FIREBASE_UID, EMAIL, NOMBRE, PASSWORD_HASH, PREFERENCIAS, TELEFONO, CREATED_AT)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ');
        
        $passwordHash = password_hash($data['PASSWORD'] ?? uniqid(), PASSWORD_DEFAULT);
        $preferencias = isset($data['PREFERENCIAS']) ? json_encode($data['PREFERENCIAS']) : null;
        
        $stmt->execute([
            $data['FIREBASE_UID'],
            $data['EMAIL'],
            $data['NOMBRE'],
            $passwordHash,
            $preferencias,
            $data['TELEFONO'] ?? null
        ]);
        
        $userId = $db->lastInsertId();
        
        $response->getBody()->write(json_encode([
            'status' => 'success',
            'message' => 'Usuario creado correctamente',
            'userId' => $userId
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Actualizar un usuario
    $group->put('/{id}', function (Request $request, Response $response, $args) {
        $data = $request->getParsedBody();
        $userId = $args['id'];
        
        $db = $this->get('db');
        
        // Verificar si el usuario existe usando consulta preparada
        $stmt = $db->prepare('SELECT ID FROM USUARIOS WHERE ID = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Usuario no encontrado'
            ]));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Construir la consulta de actualización de forma segura
        $updateFields = [];
        $params = [];
        
        if (isset($data['NOMBRE'])) {
            $updateFields[] = 'NOMBRE = ?';
            $params[] = $data['NOMBRE'];
        }
        
        if (isset($data['TELEFONO'])) {
            $updateFields[] = 'TELEFONO = ?';
            $params[] = $data['TELEFONO'];
        }
        
        if (isset($data['PREFERENCIAS'])) {
            $updateFields[] = 'PREFERENCIAS = ?';
            $params[] = json_encode($data['PREFERENCIAS']);
        }
        
        if (isset($data['PASSWORD'])) {
            $updateFields[] = 'PASSWORD_HASH = ?';
            $params[] = password_hash($data['PASSWORD'], PASSWORD_DEFAULT);
        }
        
        if (empty($updateFields)) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'No hay campos para actualizar'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        $updateFields[] = 'UPDATED_AT = NOW()';
        
        $sql = 'UPDATE USUARIOS SET ' . implode(', ', $updateFields) . ' WHERE ID = ?';
        $params[] = $userId;
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        $response->getBody()->write(json_encode([
            'status' => 'success',
            'message' => 'Usuario actualizado correctamente'
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
});
