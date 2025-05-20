<?php
/**
 * Funciones de utilidad para respuestas JSON
 */

/**
 * Envía una respuesta JSON de éxito
 * @param string $message Mensaje de éxito
 * @param array $data Datos adicionales
 */
function sendJsonSuccess($message, $data = []) {
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "success",
        "message" => $message,
        "data" => $data
    ], JSON_PRETTY_PRINT);
    exit;
}

/**
 * Envía una respuesta JSON de error
 * @param string $message Mensaje de error
 * @param int $code Código de error HTTP
 */
function sendJsonError($message, $code = 500) {
    header("Content-Type: application/json");
    http_response_code($code);
    echo json_encode([
        "status" => "error",
        "message" => $message
    ], JSON_PRETTY_PRINT);
    exit;
}

/**
 * Envía una respuesta JSON genérica
 * @param array $data Datos a enviar
 * @param int $code Código HTTP (opcional)
 */
function sendJsonResponse($data, $code = 200) {
    header("Content-Type: application/json");
    http_response_code($code);
    echo json_encode($data, JSON_PRETTY_PRINT);
    
    // Marcar que se ha enviado una respuesta
    $GLOBALS['response_sent'] = true;
    exit;
}
