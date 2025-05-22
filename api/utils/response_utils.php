<?php
/* Funciones de utilidad para respuestas JSON */

function sendJsonSuccess($message, $data = []) {
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "success",
        "message" => $message,
        "data" => $data
    ], JSON_PRETTY_PRINT);
    exit;
}

/*Envía una respuesta JSON de error*/
function sendJsonError($message, $code = 500) {
    header("Content-Type: application/json");
    http_response_code($code);
    echo json_encode([
        "status" => "error",
        "message" => $message
    ], JSON_PRETTY_PRINT);
    exit;
}

/*Envía una respuesta JSON genérica*/
function sendJsonResponse($data, $code = 200) {
    header("Content-Type: application/json");
    http_response_code($code);
    echo json_encode($data, JSON_PRETTY_PRINT);
    
    $GLOBALS['response_sent'] = true;
    exit;
}
