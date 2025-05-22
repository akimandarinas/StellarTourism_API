<?php
/* Archivo de dependencias para el proyecto Stellar Tourism
   Este archivo gestiona la carga de todas las dependencias necesarias */

function safe_require_once($file) {
    if (file_exists($file)) {
        require_once $file;
        return true;
    } else {
        error_log("Advertencia: No se pudo cargar el archivo $file");
        return false;
    }
}

// Cargar configuraciones
safe_require_once(__DIR__ . '/config/config.php');
safe_require_once(__DIR__ . '/config/database.php');

// Cargar utilidades
safe_require_once(__DIR__ . '/utils/response_utils.php');
safe_require_once(__DIR__ . '/utils/error_handler.php');
safe_require_once(__DIR__ . '/utils/auth_utils.php');
safe_require_once(__DIR__ . '/utils/utilidades_validacion.php');
safe_require_once(__DIR__ . '/utils/utilidades_notificacion.php');
safe_require_once(__DIR__ . '/utils/utilidades_stripe.php');
safe_require_once(__DIR__ . '/utils/cache_utils.php');

// Cargar middleware
safe_require_once(__DIR__ . '/middleware/middleware_auth.php');
safe_require_once(__DIR__ . '/middleware/rate_limiter.php');
safe_require_once(__DIR__ . '/middleware/input_validator.php');

// Cargar modelos
safe_require_once(__DIR__ . '/models/Actividad.php');
safe_require_once(__DIR__ . '/models/Destino.php');
safe_require_once(__DIR__ . '/models/Nave.php');
safe_require_once(__DIR__ . '/models/Pago.php');
safe_require_once(__DIR__ . '/models/Reserva.php');
safe_require_once(__DIR__ . '/models/Resena.php');
safe_require_once(__DIR__ . '/models/Ruta.php');
safe_require_once(__DIR__ . '/models/Usuario.php');

// Cargar controladores
safe_require_once(__DIR__ . '/controllers/actividad_controller.php');
safe_require_once(__DIR__ . '/controllers/auth_controller.php');
safe_require_once(__DIR__ . '/controllers/destino_controller.php');
safe_require_once(__DIR__ . '/controllers/nave_controller.php');
safe_require_once(__DIR__ . '/controllers/pago_controller.php');
safe_require_once(__DIR__ . '/controllers/reserva_controller.php');
safe_require_once(__DIR__ . '/controllers/resena_controller.php');
safe_require_once(__DIR__ . '/controllers/ruta_controller.php');

// Configurar manejador de errores
if (function_exists('handleError')) {
    set_error_handler('handleError');
}

if (function_exists('handleException')) {
    set_exception_handler('handleException');
}
