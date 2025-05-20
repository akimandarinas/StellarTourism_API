<?php
// Asegurarse de que las dependencias estén cargadas
require_once __DIR__ . '/../dependencies.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

$app->group('/api/payments', function (RouteCollectorProxy $group) {
    // Crear un nuevo pago (integración con Stripe)
    $group->post('/stripe', function (Request $request, Response $response) {
        $data = $request->getParsedBody();
        
        // Validar datos
        $requiredFields = ['ID_RESERVA', 'CANTIDAD', 'METODO_PAGO', 'token'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                $response->getBody()->write(json_encode([
                    'status' => 'error',
                    'message' => "Campo requerido: $field"
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        }
        
        // Simulación de integración con Stripe
        // En un entorno real, aquí se realizaría la llamada a la API de Stripe
        
        $stripePaymentId = 'stripe_' . uniqid();
        $transactionId = 'txn_' . uniqid();
        
        $db = $this->get('db');
        
        try {
            $db->beginTransaction();
            
            // Registrar el pago
            $stmt = $db->prepare('
                INSERT INTO PAGOS (ID_RESERVA, CANTIDAD, METODO_PAGO, ESTADO, ID_TRANSACION, ID_STRIPE_PAGO, FECHA, CREATED_AT)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');
            
            $stmt->execute([
                $data['ID_RESERVA'],
                $data['CANTIDAD'],
                $data['METODO_PAGO'],
                'COMPLETADO',
                $transactionId,
                $stripePaymentId
            ]);
            
            $paymentId = $db->lastInsertId();
            
            // Actualizar el estado de la reserva
            $stmt = $db->prepare('UPDATE RESERVAS SET ESTADO = "CONFIRMADA", UPDATED_AT = NOW() WHERE ID = ?');
            $stmt->execute([$data['ID_RESERVA']]);
            
            $db->commit();
            
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'message' => 'Pago procesado correctamente',
                'paymentId' => $paymentId,
                'transactionId' => $transactionId,
                'stripePaymentId' => $stripePaymentId
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (Exception $e) {
            $db->rollBack();
            
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Error al procesar el pago: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Endpoint para crear una sesión de checkout de Stripe
    $group->post('/create-checkout-session', function (Request $request, Response $response) {
        $data = $request->getParsedBody();
        
        // Validar datos
        if (!isset($data['reservaId']) || !isset($data['amount'])) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Se requieren los campos reservaId y amount'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        try {
            // Configurar Stripe
            \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
            
            // Crear la sesión de checkout
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => 'Reserva StellarTourism',
                            'description' => 'Reserva #' . $data['reservaId'],
                        ],
                        'unit_amount' => $data['amount'] * 100, // Convertir a centavos
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => CLIENT_URL . '/pago-completado?session_id={CHECKOUT_SESSION_ID}&reserva_id=' . $data['reservaId'],
                'cancel_url' => CLIENT_URL . '/pago-cancelado?reserva_id=' . $data['reservaId'],
                'metadata' => [
                    'reserva_id' => $data['reservaId']
                ]
            ]);
            
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'sessionId' => $session->id
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (Exception $e) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Error al crear la sesión de checkout: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Endpoint para verificar el estado de un pago
    $group->get('/check-status/{reservaId}', function (Request $request, Response $response, $args) {
        $reservaId = $args['reservaId'];
        
        $db = $this->get('db');
        
        try {
            // Obtener el último pago para esta reserva
            $stmt = $db->prepare('
                SELECT * FROM PAGOS 
                WHERE ID_RESERVA = ? 
                ORDER BY CREATED_AT DESC 
                LIMIT 1
            ');
            $stmt->execute([$reservaId]);
            $pago = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$pago) {
                $response->getBody()->write(json_encode([
                    'status' => 'not_found',
                    'message' => 'No se encontraron pagos para esta reserva'
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            }
            
            // Obtener el estado de la reserva
            $stmt = $db->prepare('SELECT ESTADO FROM RESERVAS WHERE ID = ?');
            $stmt->execute([$reservaId]);
            $reserva = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $response->getBody()->write(json_encode([
                'status' => 'success',
                'payment' => [
                    'id' => $pago['ID'],
                    'amount' => $pago['CANTIDAD'],
                    'method' => $pago['METODO_PAGO'],
                    'status' => $pago['ESTADO'],
                    'transactionId' => $pago['ID_TRANSACION'],
                    'stripePaymentId' => $pago['ID_STRIPE_PAGO'],
                    'date' => $pago['FECHA']
                ],
                'reservation' => [
                    'id' => $reservaId,
                    'status' => $reserva ? $reserva['ESTADO'] : 'DESCONOCIDO'
                ]
            ]));
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (Exception $e) {
            $response->getBody()->write(json_encode([
                'status' => 'error',
                'message' => 'Error al verificar el estado del pago: ' . $e->getMessage()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    });
    
    // Obtener planes de seguro
    $group->get('/insurance-plans', function (Request $request, Response $response) {
        $db = $this->get('db');
        $stmt = $db->query('SELECT * FROM PLANES_SEGURO');
        $plans = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($plans));
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Obtener opciones de catering
    $group->get('/catering-options', function (Request $request, Response $response) {
        $db = $this->get('db');
        $stmt = $db->query('SELECT * FROM CATERING_OPTIONS');
        $options = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($options));
        return $response->withHeader('Content-Type', 'application/json');
    });
});

// Endpoint de webhook para Stripe (fuera del grupo /api/payments para evitar middleware de autenticación)
$app->post('/webhook/stripe', function (Request $request, Response $response) {
    // Redirigir al controlador de webhook
    require_once __DIR__ . '/../controllers/webhook_controller.php';
    
    // El controlador de webhook se encarga de enviar la respuesta
    return $response;
});
