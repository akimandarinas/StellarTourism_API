<?php
/* Utilidades para validación de datos */

function validateId($id) {
    return is_numeric($id) && (int)$id > 0;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateDate($date) {
    if (!$date) return false;
    
    $format = 'Y-m-d';
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

function validatePhone($phone) {
    $phone = preg_replace('/\s+|-|$$|$$/', '', $phone);
    
    // Verificar que solo contiene dígitos y tiene entre 8 y 15 caracteres
    return preg_match('/^\d{8,15}$/', $phone) === 1;
}

function validateUrl($url) {
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

function validatePrice($price) {
    return is_numeric($price) && $price >= 0;
}

function validateName($name) {
    return is_string($name) && strlen(trim($name)) > 0 && strlen($name) <= 100;
}

function validateDescription($description) {
    return is_string($description) && strlen($description) <= 1000;
}

function validatePassword($password) {
    // Al menos 8 caracteres, al menos una letra y un número
    return strlen($password) >= 8 && 
           preg_match('/[A-Za-z]/', $password) && 
           preg_match('/\d/', $password);
}

function validateRole($role) {
    return in_array($role, ['usuario', 'admin']);
}

function validateReservationStatus($status) {
    return in_array($status, ['pendiente', 'confirmada', 'cancelada', 'completada']);
}

function validatePaymentMethod($method) {
    return in_array($method, ['tarjeta', 'paypal', 'transferencia']);
}

function validatePaymentStatus($status) {
    return in_array($status, ['pendiente', 'completado', 'fallido', 'reembolsado']);
}

function validateDifficultyLevel($level) {
    return in_array($level, ['baja', 'media', 'alta']);
}

function validateDestinationType($type) {
    return in_array($type, ['planeta', 'luna', 'estacion', 'asteroide']);
}

function validateShipType($type) {
    return in_array($type, ['transporte', 'exploración', 'carga', 'lujo']);
}

function sanitizeString($string) {
    return htmlspecialchars(strip_tags(trim($string)));
}

function sanitizeEmail($email) {
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
}

function sanitizeUrl($url) {
    return filter_var(trim($url), FILTER_SANITIZE_URL);
}
