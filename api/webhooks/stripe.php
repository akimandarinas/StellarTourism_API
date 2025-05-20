<?php
/**
 * Manejador de webhooks de Stripe
 * 
 * Este script procesa los eventos enviados por Stripe a través de webhooks.
 */

// Cargar dependencias
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/config.php';

// Configurar Stripe
\Stripe\Stripe::setApiKey(getenv('STRIPE_SECRET_KEY'));

// Obtener el payload del webhook
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
$endpoint_secret = getenv('STRIPE_WEBHOOK_SECRET');

// Verificar la firma del webhook
try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sig_header, $endpoint_secret
    );
} catch(\UnexpectedValueException $e) {
    // Payload inválido
    http_response_code(400);
    echo json_encode(['error' => 'Payload inválido']);
    exit();
} catch(\Stripe\Exception\SignatureVerificationException $e) {
    // Firma inválida
    http_response_code(400);
    echo json_encode(['error' => 'Firma inválida']);
    exit();
}

// Procesar el evento según su tipo
try {
    switch ($event->type) {
        case 'payment_intent.succeeded':
            $paymentIntent = $event->data->object;
            handlePaymentIntentSucceeded($paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            $paymentIntent = $event->data->object;
            handlePaymentIntentFailed($paymentIntent);
            break;
        case 'checkout.session.completed':
            $session = $event->data->object;
            handleCheckoutSessionCompleted($session);
            break;
        case 'customer.subscription.created':
            $subscription = $event->data->object;
            handleSubscriptionCreated($subscription);
            break;
        case 'customer.subscription.updated':
            $subscription = $event->data->object;
            handleSubscriptionUpdated($subscription);
            break;
        case 'customer.subscription.deleted':
            $subscription = $event->data->object;
            handleSubscriptionDeleted($subscription);
            break;
        default:
            // Evento no manejado
            http_response_code(200);
            echo json_encode(['status' => 'Evento no manejado: ' . $event->type]);
            break;
    }
} catch (Exception $e) {
    // Error al procesar el evento
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar el evento: ' . $e->getMessage()]);
    exit();
}

// Responder con éxito
http_response_code(200);
echo json_encode(['status' => 'success']);

/**
 * Maneja un evento de pago exitoso
 * 
 * @param \Stripe\PaymentIntent $paymentIntent El objeto PaymentIntent
 */
function handlePaymentIntentSucceeded($paymentIntent) {
    // Obtener el ID de la reserva desde los metadatos
    $reservaId = $paymentIntent->metadata->reserva_id ?? null;
    
    if ($reservaId) {
        // Actualizar el estado de la reserva en la base de datos
        $db = new PDO(
            'mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_NAME'),
            getenv('DB_USER'),
            getenv('DB_PASSWORD')
        );
        
        $stmt = $db->prepare('UPDATE reservas SET estado = "pagada", pago_id = ? WHERE id = ?');
        $stmt->execute([$paymentIntent->id, $reservaId]);
        
        // Registrar el pago
        $stmt = $db->prepare('INSERT INTO pagos (reserva_id, stripe_id, monto, estado, fecha) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([
            $reservaId,
            $paymentIntent->id,
            $paymentIntent->amount / 100, // Convertir de centavos a unidades
            'completado'
        ]);
        
        // Enviar notificación al usuario
        // TODO: Implementar envío de notificación
    }
}

/**
 * Maneja un evento de pago fallido
 * 
 * @param \Stripe\PaymentIntent $paymentIntent El objeto PaymentIntent
 */
function handlePaymentIntentFailed($paymentIntent) {
    // Obtener el ID de la reserva desde los metadatos
    $reservaId = $paymentIntent->metadata->reserva_id ?? null;
    
    if ($reservaId) {
        // Actualizar el estado de la reserva en la base de datos
        $db = new PDO(
            'mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_NAME'),
            getenv('DB_USER'),
            getenv('DB_PASSWORD')
        );
        
        $stmt = $db->prepare('UPDATE reservas SET estado = "pago_fallido" WHERE id = ?');
        $stmt->execute([$reservaId]);
        
        // Registrar el intento de pago fallido
        $stmt = $db->prepare('INSERT INTO pagos (reserva_id, stripe_id, monto, estado, fecha, error) VALUES (?, ?, ?, ?, NOW(), ?)');
        $stmt->execute([
            $reservaId,
            $paymentIntent->id,
            $paymentIntent->amount / 100, // Convertir de centavos a unidades
            'fallido',
            $paymentIntent->last_payment_error->message ?? 'Error desconocido'
        ]);
        
        // Enviar notificación al usuario
        // TODO: Implementar envío de notificación
    }
}

/**
 * Maneja un evento de sesión de checkout completada
 * 
 * @param \Stripe\Checkout\Session $session El objeto Session
 */
function handleCheckoutSessionCompleted($session) {
    // Obtener el ID de la reserva desde los metadatos
    $reservaId = $session->metadata->reserva_id ?? null;
    
    if ($reservaId) {
        // Actualizar el estado de la reserva en la base de datos
        $db = new PDO(
            'mysql:host=' . getenv('DB_HOST') . ';dbname=' . getenv('DB_NAME'),
            getenv('DB_USER'),
            getenv('DB_PASSWORD')
        );
        
        $stmt = $db->prepare('UPDATE reservas SET estado = "pagada", pago_id = ? WHERE id = ?');
        $stmt->execute([$session->payment_intent, $reservaId]);
        
        // Registrar el pago
        $stmt = $db->prepare('INSERT INTO pagos (reserva_id, stripe_id, monto, estado, fecha) VALUES (?, ?, ?, ?, NOW())');
        $stmt->execute([
            $reservaId,
            $session->payment_intent,
            $session->amount_total / 100, // Convertir de centavos a unidades
            'completado'
        ]);
        
        // Enviar notificación al usuario
        // TODO: Implementar envío de notificación
    }
}

/**
 * Maneja un evento de suscripción creada
 * 
 * @param \Stripe\Subscription $subscription El objeto Subscription
 */
function handleSubscriptionCreated($subscription) {
    // Implementar lógica para manejar suscripciones si es necesario
}

/**
 * Maneja un evento de suscripción actualizada
 * 
 * @param \Stripe\Subscription $subscription El objeto Subscription
 */
function handleSubscriptionUpdated($subscription) {
    // Implementar lógica para manejar suscripciones si es necesario
}

/**
 * Maneja un evento de suscripción eliminada
 * 
 * @param \Stripe\Subscription $subscription El objeto Subscription
 */
function handleSubscriptionDeleted($subscription) {
    // Implementar lógica para manejar suscripciones si es necesario
}
