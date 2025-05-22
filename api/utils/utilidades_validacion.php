<?php
/*Funciones de validación para la API*/

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePassword($password) {
    if (strlen($password) < 8) {
        return false;
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        return false;
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        return false;
    }
    if (!preg_match('/[0-9]/', $password)) {
        return false;
    }
    
    return true;
}

function validateDate($date) {
    if (empty($date)) {
        return false;
    }
    
    $format = 'Y-m-d';
    $dateTime = DateTime::createFromFormat($format, $date);
    return $dateTime && $dateTime->format($format) === $date;
}

function validatePhone($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    
  
    $length = strlen($phone);
    if ($length < 8 || $length > 15) {
        return false;
    }
    
  
    return preg_match('/^(\+[0-9]{1,3})?[0-9]{8,14}$/', $phone) === 1;
}

function validateId($id) {
    return filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
}

function validatePrice($price) {
    return is_numeric($price) && $price >= 0;
}

function validateQuantity($quantity) {
    return filter_var($quantity, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) !== false;
}

function validateBookingStatus($status) {
    $validStatuses = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    return in_array(strtolower($status), $validStatuses);
}

function validatePaymentMethod($method) {
    $validMethods = ['tarjeta', 'paypal', 'transferencia', 'efectivo'];
    return in_array(strtolower($method), $validMethods);
}

function validatePaymentStatus($status) {
    $validStatuses = ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'];
    return in_array(strtolower($status), $validStatuses);
}

function sanitizeInput($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitizeInput($value);
        }
    } else if (is_string($input)) {
        $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    return $input;
}

function sanitizeOutput($output) {
    if (is_string($output)) {
        return htmlspecialchars($output, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    return $output;
}

function getParam($name, $default = null, $filter = FILTER_SANITIZE_SPECIAL_CHARS, $options = null) {
    
    $value = filter_input(INPUT_GET, $name, $filter, $options);
    return $value !== null && $value !== false ? $value : $default;
}


function postParam($name, $default = null, $filter = FILTER_SANITIZE_SPECIAL_CHARS, $options = null) {
   
    $value = filter_input(INPUT_POST, $name, $filter, $options);
    return $value !== null && $value !== false ? $value : $default;
}

/*Genera un token CSRF*/
function generateCsrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

/*Verifica un token CSRF*/
function verifyCsrfToken($token) {
    if (!isset($_SESSION['csrf_token'])) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}
