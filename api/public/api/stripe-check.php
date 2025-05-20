<?php
// Script para verificar la configuración de Stripe en la API

// Configuración
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Función para verificar la configuración de Stripe
function checkStripeConfig() {
    // Verificar si las variables de entorno están configuradas
    $requiredEnvVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];
    
    $missingEnvVars = [];
    foreach ($requiredEnvVars as $var) {
        if (!getenv($var)) {
            $missingEnvVars[] = $var;
        }
    }
    
    // Verificar si la extensión cURL está habilitada
    $hasCurl = function_exists('curl_version');
    
    // Verificar si la extensión JSON está habilitada
    $hasJson = function_exists('json_encode') && function_exists('json_decode');
    
    // Verificar si el directorio de webhooks existe y tiene permisos de escritura
    $webhookDir = dirname(dirname(__DIR__)) . '/webhooks';
    $webhookDirExists = file_exists($webhookDir);
    $webhookDirWritable = $webhookDirExists && is_writable($webhookDir);
    
    // Verificar si el archivo de logs de Stripe existe y tiene permisos de escritura
    $stripeLogFile = dirname(dirname(__DIR__)) . '/logs/stripe.log';
    $stripeLogFileExists = file_exists($stripeLogFile);
    $stripeLogFileWritable = $stripeLogFileExists && is_writable($stripeLogFile);
    
    // Crear el directorio de webhooks si no existe
    if (!$webhookDirExists) {
        mkdir($webhookDir, 0755, true);
        $webhookDirExists = file_exists($webhookDir);
        $webhookDirWritable = $webhookDirExists && is_writable($webhookDir);
    }
    
    // Crear el directorio de logs si no existe
    $logsDir = dirname(dirname(__DIR__)) . '/logs';
    if (!file_exists($logsDir)) {
        mkdir($logsDir, 0755, true);
    }
    
    // Crear el archivo de logs de Stripe si no existe
    if (!$stripeLogFileExists) {
        touch($stripeLogFile);
        $stripeLogFileExists = file_exists($stripeLogFile);
        $stripeLogFileWritable = $stripeLogFileExists && is_writable($stripeLogFile);
    }
    
    // Determinar el estado general
    $status = 'success';
    $message = 'La configuración de Stripe está correcta';
    
    if (!empty($missingEnvVars)) {
        $status = 'error';
        $message = 'Faltan variables de entorno requeridas: ' . implode(', ', $missingEnvVars);
    } elseif (!$hasCurl) {
        $status = 'error';
        $message = 'La extensión cURL no está habilitada';
    } elseif (!$hasJson) {
        $status = 'error';
        $message = 'La extensión JSON no está habilitada';
    } elseif (!$webhookDirExists || !$webhookDirWritable) {
        $status = 'warning';
        $message = 'El directorio de webhooks no existe o no tiene permisos de escritura';
    } elseif (!$stripeLogFileExists || !$stripeLogFileWritable) {
        $status = 'warning';
        $message = 'El archivo de logs de Stripe no existe o no tiene permisos de escritura';
    }
    
    // Construir respuesta
    $response = [
        'status' => $status,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'config' => [
            'environment' => getenv('APP_ENV') ?: 'development',
            'stripe_mode' => getenv('STRIPE_MODE') ?: 'test',
            'has_secret_key' => !empty(getenv('STRIPE_SECRET_KEY')),
            'has_publishable_key' => !empty(getenv('STRIPE_PUBLISHABLE_KEY')),
            'has_webhook_secret' => !empty(getenv('STRIPE_WEBHOOK_SECRET')),
        ],
        'requirements' => [
            'curl' => $hasCurl,
            'json' => $hasJson,
        ],
        'directories' => [
            'webhook_dir' => [
                'path' => $webhookDir,
                'exists' => $webhookDirExists,
                'writable' => $webhookDirWritable,
            ],
            'stripe_log_file' => [
                'path' => $stripeLogFile,
                'exists' => $stripeLogFileExists,
                'writable' => $stripeLogFileWritable,
            ],
        ],
        'test_mode' => [
            'enabled' => getenv('STRIPE_MODE') !== 'live',
            'test_cards_available' => true,
            'webhook_simulator_available' => true,
        ],
    ];
    
    return $response;
}

// Ejecutar verificación
$checkResult = checkStripeConfig();

// Devolver resultado
echo json_encode($checkResult, JSON_PRETTY_PRINT);
