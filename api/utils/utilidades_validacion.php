<?php
/**
 * Funciones de validación para la API
 * Versión optimizada y limpia
 */

/**
 * Valida un correo electrónico
 * 
 * @param string $email Correo electrónico a validar
 * @return bool
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Valida una contraseña
 * 
 * @param string $password Contraseña a validar
 * @return bool
 */
function validatePassword($password) {
    // Verificar longitud mínima
    if (strlen($password) < 8) {
        return false;
    }
    
    // Verificar que contenga al menos una letra mayúscula
    if (!preg_match('/[A-Z]/', $password)) {
        return false;
    }
    
    // Verificar que contenga al menos una letra minúscula
    if (!preg_match('/[a-z]/', $password)) {
        return false;
    }
    
    // Verificar que contenga al menos un número
    if (!preg_match('/[0-9]/', $password)) {
        return false;
    }
    
    return true;
}

/**
 * Valida una fecha en formato YYYY-MM-DD
 * 
 * @param string $date Fecha a validar
 * @return bool
 */
function validateDate($date) {
    if (empty($date)) {
        return false;
    }
    
    $format = 'Y-m-d';
    $dateTime = DateTime::createFromFormat($format, $date);
    return $dateTime && $dateTime->format($format) === $date;
}

/**
 * Valida un número de teléfono
 * 
 * @param string $phone Número de teléfono a validar
 * @return bool
 */
function validatePhone($phone) {
    // Eliminar caracteres no numéricos
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    
    // Verificar longitud mínima y máxima
    $length = strlen($phone);
    if ($length < 8 || $length > 15) {
        return false;
    }
    
    // Verificar formato básico (puede personalizarse según el país)
    return preg_match('/^(\+[0-9]{1,3})?[0-9]{8,14}$/', $phone) === 1;
}

/**
 * Valida un ID
 * 
 * @param mixed $id ID a validar
 * @return bool
 */
function validateId($id) {
    // Verificar que sea un número entero positivo
    return filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
}

/**
 * Valida un precio
 * 
 * @param mixed $price Precio a validar
 * @return bool
 */
function validatePrice($price) {
    // Verificar que sea un número positivo
    return is_numeric($price) && $price >= 0;
}

/**
 * Valida una cantidad
 * 
 * @param mixed $quantity Cantidad a validar
 * @return bool
 */
function validateQuantity($quantity) {
    // Verificar que sea un número entero positivo
    return filter_var($quantity, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
}

/**
 * Valida un estado de reserva
 * 
 * @param string $status Estado a validar
 * @return bool
 */
function validateBookingStatus($status) {
    $validStatuses = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    return in_array(strtolower($status), $validStatuses);
}

/**
 * Valida un método de pago
 * 
 * @param string $method Método a validar
 * @return bool
 */
function validatePaymentMethod($method) {
    $validMethods = ['tarjeta', 'paypal', 'transferencia', 'efectivo'];
    return in_array(strtolower($method), $validMethods);
}

/**
 * Valida un estado de pago
 * 
 * @param string $status Estado a validar
 * @return bool
 */
function validatePaymentStatus($status) {
    $validStatuses = ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'];
    return in_array(strtolower($status), $validStatuses);
}

/**
 * Sanitiza una entrada para prevenir XSS
 * 
 * @param mixed $input Entrada a sanitizar
 * @return mixed
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitizeInput($value);
        }
    } else if (is_string($input)) {
        // Usar htmlspecialchars en lugar de funciones obsoletas como strip_tags
        $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    return $input;
}

/**
 * Sanitiza una salida para mostrar en HTML
 * 
 * @param string $output Salida a sanitizar
 * @return string
 */
function sanitizeOutput($output) {
    if (is_string($output)) {
        return htmlspecialchars($output, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    return $output;
}

/**
 * Valida y sanitiza un parámetro GET
 * 
 * @param string $name Nombre del parámetro
 * @param mixed $default Valor por defecto
 * @param int $filter Filtro a aplicar (constantes FILTER_*)
 * @param mixed $options Opciones para el filtro
 * @return mixed
 */
function getParam($name, $default = null, $filter = FILTER_SANITIZE_SPECIAL_CHARS, $options = null) {
    // Usar filter_input en lugar de acceder directamente a $_GET
    $value = filter_input(INPUT_GET, $name, $filter, $options);
    return $value !== null && $value !== false ? $value : $default;
}

/**
 * Valida y sanitiza un parámetro POST
 * 
 * @param string $name Nombre del parámetro
 * @param mixed $default Valor por defecto
 * @param int $filter Filtro a aplicar (constantes FILTER_*)
 * @param mixed $options Opciones para el filtro
 * @return mixed
 */
function postParam($name, $default = null, $filter = FILTER_SANITIZE_SPECIAL_CHARS, $options = null) {
    // Usar filter_input en lugar de acceder directamente a $_POST
    $value = filter_input(INPUT_POST, $name, $filter, $options);
    return $value !== null && $value !== false ? $value : $default;
}

/**
 * Genera un token CSRF
 * 
 * @return string
 */
function generateCsrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        // Usar random_bytes en lugar de funciones obsoletas como rand
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Verifica un token CSRF
 * 
 * @param string $token Token a verificar
 * @return bool
 */
function verifyCsrfToken($token) {
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    
    // Usar hash_equals para comparación segura contra ataques de timing
    return hash_equals($_SESSION['csrf_token'], $token);
}
