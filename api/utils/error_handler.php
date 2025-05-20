<?php
/**
 * Manejador de errores personalizado para la API
 */

// Definir clases de excepción personalizadas
class ValidationException extends Exception {
    protected $errors;
    
    public function __construct($message, $errors = [], $code = 0, Exception $previous = null) {
        parent::__construct($message, $code, $previous);
        $this->errors = $errors;
    }
    
    public function getErrors() {
        return $this->errors;
    }
}

class AuthenticationException extends Exception {}
class AuthorizationException extends Exception {}
class ResourceNotFoundException extends Exception {}
class RateLimitException extends Exception {}
class DatabaseException extends Exception {}
class PaymentException extends Exception {}
class ApiException extends Exception {}

/**
 * Registra un error en el archivo de log
 * 
 * @param string $message Mensaje de error
 * @param array $context Contexto adicional del error
 * @return void
 */
// Verificar si la función ya existe antes de declararla
if (!function_exists('logError')) {
    function logError($message, $context = []) {
        if (defined('LOG_ENABLED') && LOG_ENABLED) {
            $logFile = defined('LOG_FILE') ? LOG_FILE : __DIR__ . '/../logs/error.log';
            $timestamp = date('Y-m-d H:i:s');
            $requestId = isset($_SERVER['HTTP_X_REQUEST_ID']) ? $_SERVER['HTTP_X_REQUEST_ID'] : uniqid('req_');
            
            // Asegurar que el directorio de logs existe
            $logDir = dirname($logFile);
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
            
            // Añadir información de la solicitud al contexto
            $requestInfo = [
                'request_id' => $requestId,
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
                'uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
                'query' => $_SERVER['QUERY_STRING'] ?? '',
                'referer' => $_SERVER['HTTP_REFERER'] ?? 'unknown',
                'protocol' => $_SERVER['SERVER_PROTOCOL'] ?? 'unknown',
            ];
            
            // Añadir información de rendimiento
            $performanceInfo = [
                'memory_usage' => memory_get_usage(true),
                'peak_memory_usage' => memory_get_peak_usage(true),
                'execution_time' => microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'],
            ];
            
            // Añadir información del usuario si está disponible
            $userInfo = [];
            if (function_exists('getCurrentUserId')) {
                $userInfo['user_id'] = getCurrentUserId();
            }
            
            // Combinar toda la información de contexto
            $fullContext = array_merge(
                $context,
                ['request' => $requestInfo],
                ['performance' => $performanceInfo],
                !empty($userInfo) ? ['user' => $userInfo] : []
            );
            
            // Manejar excepciones en el contexto
            if (isset($fullContext['exception']) && $fullContext['exception'] instanceof Exception) {
                $exception = $fullContext['exception'];
                $fullContext['exception'] = [
                    'class' => get_class($exception),
                    'message' => $exception->getMessage(),
                    'code' => $exception->getCode(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                    'trace' => explode("\n", $exception->getTraceAsString())
                ];
            }
            
            // Determinar nivel de severidad
            $severity = isset($context['severity']) ? strtoupper($context['severity']) : 'ERROR';
            
            // Formatear mensaje de log en formato JSON para facilitar el análisis
            $logData = [
                'timestamp' => $timestamp,
                'request_id' => $requestId,
                'level' => $severity,
                'message' => $message,
                'context' => $fullContext
            ];
            
            $logMessage = json_encode($logData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
            
            // Escribir en el archivo de log
            file_put_contents($logFile, $logMessage, FILE_APPEND);
            
            // Registrar errores críticos en un archivo separado
            if ($severity === 'CRITICAL' || $severity === 'EMERGENCY' || $severity === 'ALERT') {
                $criticalLogFile = dirname($logFile) . '/critical.log';
                file_put_contents($criticalLogFile, $logMessage, FILE_APPEND);
            }
        }
        
        // Si está habilitado el monitoreo, enviar el error
        if (defined('MONITORING_ENABLED') && MONITORING_ENABLED) {
            sendErrorToMonitoring($message, $fullContext ?? $context);
        }
    }
}

/**
 * Envía un error al servicio de monitoreo
 * 
 * @param string $message Mensaje de error
 * @param array $context Contexto adicional del error
 * @return void
 */
function sendErrorToMonitoring($message, $context = []) {
    // Implementación del envío de errores a un servicio de monitoreo
    if (defined('SENTRY_DSN') && SENTRY_DSN) {
        // Código para enviar a Sentry si está configurado
    }
}

/**
 * Manejador de errores personalizado
 * 
 * @param int $errno Número de error
 * @param string $errstr Mensaje de error
 * @param string $errfile Archivo donde ocurrió el error
 * @param int $errline Línea donde ocurrió el error
 * @return bool
 */
function errorHandler($errno, $errstr, $errfile, $errline) {
    $errorTypes = [
        E_ERROR => 'Error',
        E_WARNING => 'Warning',
        E_PARSE => 'Parse Error',
        E_NOTICE => 'Notice',
        E_CORE_ERROR => 'Core Error',
        E_CORE_WARNING => 'Core Warning',
        E_COMPILE_ERROR => 'Compile Error',
        E_COMPILE_WARNING => 'Compile Warning',
        E_USER_ERROR => 'User Error',
        E_USER_WARNING => 'User Warning',
        E_USER_NOTICE => 'User Notice',
        E_STRICT => 'Strict',
        E_RECOVERABLE_ERROR => 'Recoverable Error',
        E_DEPRECATED => 'Deprecated',
        E_USER_DEPRECATED => 'User Deprecated',
    ];
    
    $errorType = isset($errorTypes[$errno]) ? $errorTypes[$errno] : 'Unknown Error';
    $message = "$errorType: $errstr in $errfile on line $errline";
    
    // Determinar la severidad del error
    $severity = 'ERROR';
    if (in_array($errno, [E_NOTICE, E_USER_NOTICE, E_DEPRECATED, E_USER_DEPRECATED, E_STRICT])) {
        $severity = 'NOTICE';
    } else if (in_array($errno, [E_WARNING, E_USER_WARNING, E_CORE_WARNING, E_COMPILE_WARNING])) {
        $severity = 'WARNING';
    } else if (in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR, E_PARSE])) {
        $severity = 'CRITICAL';
    }
    
    // Generar un ID único para este error
    $errorId = uniqid('php_err_');
    
    // Registrar el error con contexto detallado
    logError($message, [
        'error_id' => $errorId,
        'type' => $errorType,
        'errno' => $errno,
        'file' => $errfile,
        'line' => $errline,
        'severity' => $severity,
        'backtrace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS),
        'memory_usage' => memory_get_usage(true),
    ]);
    
    // Determinar si debemos mostrar el error
    $isProduction = defined('APP_ENV') && APP_ENV === 'production';
    $isFatalError = in_array($errno, [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR, E_PARSE]);
    
    // En producción, no mostrar errores no fatales
    if ($isProduction && !$isFatalError) {
        return true; // Suprimir el error
    }
    
    // Para errores fatales, lanzar una excepción que será capturada por el manejador de excepciones
    if ($isFatalError) {
        throw new Exception($message, $errno);
    }
    
    return false; // Permitir que PHP maneje el error para errores no fatales en desarrollo
}

/**
 * Manejador de excepciones personalizado
 * 
 * @param Exception $exception Excepción capturada
 * @return void
 */
function exceptionHandler($exception) {
    $message = "Exception: " . $exception->getMessage();
    $exceptionClass = get_class($exception);
    
    // Generar un ID único para este error
    $errorId = uniqid('err_');
    
    // Registrar la excepción con información detallada
    logError($message, [
        'error_id' => $errorId,
        'exception' => $exception,
        'severity' => getSeverityFromException($exception),
        'exception_class' => $exceptionClass,
        'exception_code' => $exception->getCode(),
    ]);
    
    // Determinar el código de estado HTTP y el tipo de error
    $statusCode = 500;
    $errorCode = 'server_error';
    $errorType = 'ServerError';
    
    if ($exception instanceof ValidationException) {
        $statusCode = 400;
        $errorCode = 'validation_error';
        $errorType = 'ValidationError';
    } else if ($exception instanceof AuthenticationException) {
        $statusCode = 401;
        $errorCode = 'authentication_error';
        $errorType = 'AuthenticationError';
    } else if ($exception instanceof AuthorizationException) {
        $statusCode = 403;
        $errorCode = 'authorization_error';
        $errorType = 'AuthorizationError';
    } else if ($exception instanceof ResourceNotFoundException) {
        $statusCode = 404;
        $errorCode = 'not_found';
        $errorType = 'NotFoundError';
    } else if ($exception instanceof RateLimitException) {
        $statusCode = 429;
        $errorCode = 'rate_limit_exceeded';
        $errorType = 'RateLimitError';
    } else if ($exception instanceof DatabaseException) {
        $statusCode = 500;
        $errorCode = 'database_error';
        $errorType = 'DatabaseError';
    } else if ($exception instanceof PaymentException) {
        $statusCode = 400;
        $errorCode = 'payment_error';
        $errorType = 'PaymentError';
    }
    
    // Preparar la respuesta
    $response = [
        'status' => 'error',
        'error' => [
            'id' => $errorId,
            'code' => $errorCode,
            'type' => $errorType,
            'message' => $exception->getMessage()
        ]
    ];
    
    // Añadir detalles de validación si están disponibles
    if ($exception instanceof ValidationException) {
        $response['error']['details'] = $exception->getErrors();
    }
    
    // En producción, no mostrar detalles técnicos para errores del servidor
    $isProduction = defined('APP_ENV') && APP_ENV === 'production';
    if ($isProduction && $statusCode >= 500) {
        $response['error']['message'] = 'Se ha producido un error en el servidor. Por favor, inténtelo de nuevo más tarde.';
        $response['error']['reference'] = $errorId; // Incluir ID de referencia para buscar en logs
        unset($response['error']['details']);
    } else if (!$isProduction) {
        // En desarrollo, añadir información de depuración
        $response['error']['debug'] = [
            'exception_class' => $exceptionClass,
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => explode("\n", $exception->getTraceAsString())
        ];
    }
    
    // Enviar la respuesta
    header('Content-Type: application/json');
    http_response_code($statusCode);
    echo json_encode($response);
}

/**
 * Determina la severidad basada en el tipo de excepción
 * 
 * @param Exception $exception La excepción
 * @return string Nivel de severidad
 */
function getSeverityFromException($exception) {
    $exceptionClass = get_class($exception);
    $code = $exception->getCode();
    
    // Excepciones críticas
    if (
        $exceptionClass === 'PDOException' || 
        $exceptionClass === 'DatabaseException' ||
        strpos($exceptionClass, 'Fatal') !== false
    ) {
        return 'CRITICAL';
    }
    
    // Excepciones de seguridad
    if (
        $exceptionClass === 'AuthenticationException' ||
        $exceptionClass === 'AuthorizationException' ||
        strpos($exceptionClass, 'Security') !== false
    ) {
        return 'WARNING';
    }
    
    // Excepciones de validación o cliente
    if (
        $exceptionClass === 'ValidationException' ||
        $exceptionClass === 'ResourceNotFoundException' ||
        $code >= 400 && $code < 500
    ) {
        return 'NOTICE';
    }
    
    return 'ERROR';
}

/**
 * Registra un error de aplicación con contexto detallado
 * 
 * @param string $message Mensaje de error
 * @param string $errorCode Código de error específico de la aplicación
 * @param array $context Contexto adicional
 * @param string $severity Nivel de severidad (ERROR, WARNING, NOTICE, INFO)
 * @return string ID del error registrado
 */
function logApplicationError($message, $errorCode = null, $context = [], $severity = 'ERROR') {
    $errorId = uniqid('app_err_');
    
    $fullContext = array_merge(
        $context,
        [
            'error_id' => $errorId,
            'error_code' => $errorCode,
            'severity' => $severity,
            'timestamp' => date('Y-m-d H:i:s'),
        ]
    );
    
    logError($message, $fullContext);
    
    return $errorId;
}

/**
 * Registra un evento de seguridad
 * 
 * @param string $message Mensaje del evento
 * @param string $eventType Tipo de evento (login_attempt, password_reset, etc.)
 * @param array $context Contexto adicional
 * @param bool $isSuccess Indica si el evento fue exitoso
 * @return string ID del evento registrado
 */
function logSecurityEvent($message, $eventType, $context = [], $isSuccess = true) {
    $eventId = uniqid('sec_');
    $securityLogFile = defined('AUTH_LOG_FILE') ? AUTH_LOG_FILE : __DIR__ . '/../logs/security.log';
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    $fullContext = array_merge(
        $context,
        [
            'event_id' => $eventId,
            'event_type' => $eventType,
            'success' => $isSuccess,
            'ip' => $ip,
            'user_agent' => $userAgent,
            'timestamp' => $timestamp,
        ]
    );
    
    // Formatear mensaje de log en formato JSON
    $logData = [
        'timestamp' => $timestamp,
        'event_id' => $eventId,
        'level' => $isSuccess ? 'INFO' : 'WARNING',
        'message' => $message,
        'context' => $fullContext
    ];
    
    $logMessage = json_encode($logData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    
    // Asegurar que el directorio de logs existe
    $logDir = dirname($securityLogFile);
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    // Escribir en el archivo de log de seguridad
    file_put_contents($securityLogFile, $logMessage, FILE_APPEND);
    
    return $eventId;
}

// Registrar manejadores de errores y excepciones
set_error_handler('errorHandler');
set_exception_handler('exceptionHandler');

// Registrar manejador para errores fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        $message = "Fatal Error: {$error['message']} in {$error['file']} on line {$error['line']}";
        logError($message, $error);
        
        // Enviar respuesta de error si no se ha enviado ya
        if (!headers_sent()) {
            header('Content-Type: application/json');
            http_response_code(500);
            
            $response = [
                'status' => 'error',
                'error' => [
                    'code' => 'server_error',
                    'message' => defined('APP_ENV') && APP_ENV === 'production'
                        ? 'Se ha producido un error fatal en el servidor. Por favor, inténtelo de nuevo más tarde.'
                        : $message
                ]
            ];
            
            echo json_encode($response);
        }
    }
});
