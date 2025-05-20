<?php
// Archivo para el endpoint raíz de la API
header('Content-Type: application/json');

// Obtener la URL base
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$baseUrl = $protocol . '://' . $host;

// Construir respuesta
$response = [
    'api' => 'Stellar Tourism API',
    'version' => '1.0.0',
    'status' => 'online',
    'documentation' => $baseUrl . '/api/docs',
    'endpoints' => [
        'destinos' => [
            'list' => $baseUrl . '/api/destinations',
            'detail' => $baseUrl . '/api/destinations/{id}'
        ],
        'naves' => [
            'list' => $baseUrl . '/api/ships',
            'detail' => $baseUrl . '/api/ships/{id}'
        ],
        'rutas' => [
            'list' => $baseUrl . '/api/routes',
            'detail' => $baseUrl . '/api/routes/{id}'
        ],
        'reservas' => [
            'list' => $baseUrl . '/api/bookings',
            'detail' => $baseUrl . '/api/bookings/{id}',
            'user' => $baseUrl . '/api/bookings/user/{userId}'
        ],
        'usuarios' => [
            'detail' => $baseUrl . '/api/users/{id}',
            'firebase' => $baseUrl . '/api/users/firebase/{firebaseUid}'
        ],
        'actividades' => [
            'list' => $baseUrl . '/api/activities',
            'detail' => $baseUrl . '/api/activities/{id}',
            'destination' => $baseUrl . '/api/activities/destination/{destinationId}'
        ],
        'pagos' => [
            'stripe' => $baseUrl . '/api/payments/stripe',
            'checkout' => $baseUrl . '/api/payments/create-checkout-session',
            'status' => $baseUrl . '/api/payments/check-status/{reservaId}'
        ],
        'reseñas' => [
            'destination' => $baseUrl . '/api/reviews/destination/{destinationId}',
            'user' => $baseUrl . '/api/reviews/user/{userId}'
        ]
    ],
    'health' => $baseUrl . '/api/health',
    'test' => $baseUrl . '/api/test',
    'timestamp' => date('Y-m-d H:i:s')
];

// Enviar respuesta
echo json_encode($response, JSON_PRETTY_PRINT);
