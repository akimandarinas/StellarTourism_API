<?php
// Archivo para el endpoint de prueba
header('Content-Type: application/json');
$testData = [
    'string' => 'Hello, World!',
    'number' => 42,
    'boolean' => true,
    'null' => null,
    'array' => [1, 2, 3, 4, 5],
    'object' => [
        'name' => 'Stellar Tourism',
        'type' => 'API',
        'version' => '1.0.0'
    ],
    'nested' => [
        'level1' => [
            'level2' => [
                'level3' => 'Nested data'
            ]
        ]
    ]
];

// Construir respuesta
$response = [
    'status' => 'success',
    'message' => 'API funcionando correctamente',
    'test_data' => $testData,
    'request' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'path' => $_SERVER['REQUEST_URI'],
        'query' => $_GET,
        'headers' => getRequestHeaders(),
        'ip' => $_SERVER['REMOTE_ADDR']
    ],
    'server' => [
        'software' => $_SERVER['SERVER_SOFTWARE'],
        'protocol' => $_SERVER['SERVER_PROTOCOL'],
        'name' => $_SERVER['SERVER_NAME'],
        'port' => $_SERVER['SERVER_PORT']
    ],
    'php' => [
        'version' => phpversion(),
        'extensions' => get_loaded_extensions(),
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time')
    ],
    'timestamp' => date('Y-m-d H:i:s'),
    'random_id' => uniqid(),
    'random_uuid' => sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0xffff)
    )
];

echo json_encode($response, JSON_PRETTY_PRINT);

// Función para obtener los headers de la petición
function getRequestHeaders() {
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (substr($key, 0, 5) === 'HTTP_') {
            $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
            $headers[$header] = $value;
        }
    }
    return $headers;
}
