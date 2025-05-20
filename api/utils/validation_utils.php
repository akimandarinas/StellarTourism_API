<?php
/**
 * Utilidades para validación de datos
 */

/**
 * Validar un ID
 * 
 * @param mixed $id ID a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateId($id) {
    return is_numeric($id) && (int)$id > 0;
}

/**
 * Validar un email
 * 
 * @param string $email Email a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validar una fecha
 * 
 * @param string $date Fecha a validar (formato YYYY-MM-DD)
 * @return bool True si es válida, False en caso contrario
 */
function validateDate($date) {
    if (!$date) return false;
    
    $format = 'Y-m-d';
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

/**
 * Validar un número de teléfono
 * 
 * @param string $phone Número de teléfono a validar
 * @return bool True si es válido, False en caso contrario
 */
function validatePhone($phone) {
    // Eliminar espacios, guiones y paréntesis
    $phone = preg_replace('/\s+|-|$$|$$/', '', $phone);
    
    // Verificar que solo contiene dígitos y tiene entre 8 y 15 caracteres
    return preg_match('/^\d{8,15}$/', $phone) === 1;
}

/**
 * Validar una URL
 * 
 * @param string $url URL a validar
 * @return bool True si es válida, False en caso contrario
 */
function validateUrl($url) {
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Validar un precio
 * 
 * @param mixed $price Precio a validar
 * @return bool True si es válido, False en caso contrario
 */
function validatePrice($price) {
    return is_numeric($price) && $price >= 0;
}

/**
 * Validar un nombre
 * 
 * @param string $name Nombre a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateName($name) {
    return is_string($name) && strlen(trim($name)) > 0 && strlen($name) <= 100;
}

/**
 * Validar una descripción
 * 
 * @param string $description Descripción a validar
 * @return bool True si es válida, False en caso contrario
 */
function validateDescription($description) {
    return is_string($description) && strlen($description) <= 1000;
}

/**
 * Validar una contraseña
 * 
 * @param string $password Contraseña a validar
 * @return bool True si es válida, False en caso contrario
 */
function validatePassword($password) {
    // Al menos 8 caracteres, al menos una letra y un número
    return strlen($password) >= 8 && 
           preg_match('/[A-Za-z]/', $password) && 
           preg_match('/\d/', $password);
}

/**
 * Validar un rol de usuario
 * 
 * @param string $role Rol a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateRole($role) {
    return in_array($role, ['usuario', 'admin']);
}

/**
 * Validar un estado de reserva
 * 
 * @param string $status Estado a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateReservationStatus($status) {
    return in_array($status, ['pendiente', 'confirmada', 'cancelada', 'completada']);
}

/**
 * Validar un método de pago
 * 
 * @param string $method Método a validar
 * @return bool True si es válido, False en caso contrario
 */
function validatePaymentMethod($method) {
    return in_array($method, ['tarjeta', 'paypal', 'transferencia']);
}

/**
 * Validar un estado de pago
 * 
 * @param string $status Estado a validar
 * @return bool True si es válido, False en caso contrario
 */
function validatePaymentStatus($status) {
    return in_array($status, ['pendiente', 'completado', 'fallido', 'reembolsado']);
}

/**
 * Validar un nivel de dificultad
 * 
 * @param string $level Nivel a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateDifficultyLevel($level) {
    return in_array($level, ['baja', 'media', 'alta']);
}

/**
 * Validar un tipo de destino
 * 
 * @param string $type Tipo a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateDestinationType($type) {
    return in_array($type, ['planeta', 'luna', 'estacion', 'asteroide']);
}

/**
 * Validar un tipo de nave
 * 
 * @param string $type Tipo a validar
 * @return bool True si es válido, False en caso contrario
 */
function validateShipType($type) {
    return in_array($type, ['transporte', 'exploración', 'carga', 'lujo']);
}

/**
 * Sanitizar una cadena
 * 
 * @param string $string Cadena a sanitizar
 * @return string Cadena sanitizada
 */
function sanitizeString($string) {
    return htmlspecialchars(strip_tags(trim($string)));
}

/**
 * Sanitizar un email
 * 
 * @param string $email Email a sanitizar
 * @return string Email sanitizado
 */
function sanitizeEmail($email) {
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
}

/**
 * Sanitizar una URL
 * 
 * @param string $url URL a sanitizar
 * @return string URL sanitizada
 */
function sanitizeUrl($url) {
    return filter_var(trim($url), FILTER_SANITIZE_URL);
}
