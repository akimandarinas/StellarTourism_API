<?php
require_once __DIR__ . '/../utils/utilidades_validacion.php';

class InputValidator {
    /**
     * Validar datos de entrada
     * @param array $data Datos a validar
     * @param array $rules Reglas de validación
     * @return array|bool Array de errores o true si es válido
     */
    public static function validate($data, $rules) {
        $errors = [];
        
        // Verificar que $data sea un array
        if (!is_array($data)) {
            return ['general' => 'Los datos de entrada deben ser un array'];
        }
        
        foreach ($rules as $field => $rule) {
            // Verificar si el campo es requerido
            $isRequired = strpos($rule, 'required') !== false;
            
            if ($isRequired && (!isset($data[$field]) || $data[$field] === '')) {
                $errors[$field] = "El campo $field es obligatorio";
                continue;
            }
            
            // Si el campo no está presente y no es requerido, continuar
            if (!isset($data[$field]) || $data[$field] === '') {
                continue;
            }
            
            // Sanitizar entrada antes de validar
            $value = self::sanitizeInput($data[$field]);
            
            // Validar según las reglas
            $rulesParts = explode('|', $rule);
            
            foreach ($rulesParts as $rulePart) {
                $rulePart = trim($rulePart);
                
                if ($rulePart === 'required') {
                    continue; // Ya validado
                }
                
                // Validar email
                if ($rulePart === 'email' && !validateEmail($value)) {
                    $errors[$field] = "El campo $field debe ser un correo electrónico válido";
                    continue;
                }
                
                // Validar contraseña
                if ($rulePart === 'password' && !validatePassword($value)) {
                    $errors[$field] = "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número";
                    continue;
                }
                
                // Validar fecha
                if ($rulePart === 'date' && !validateDate($value)) {
                    $errors[$field] = "El campo $field debe ser una fecha válida (YYYY-MM-DD)";
                    continue;
                }
                
                // Validar teléfono
                if ($rulePart === 'phone' && !validatePhone($value)) {
                    $errors[$field] = "El campo $field debe ser un número de teléfono válido";
                    continue;
                }
                
                // Validar número
                if ($rulePart === 'numeric' && !is_numeric($value)) {
                    $errors[$field] = "El campo $field debe ser un número";
                    continue;
                }
                
                // Validar entero
                if ($rulePart === 'integer' && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $errors[$field] = "El campo $field debe ser un número entero";
                    continue;
                }
                
                // Validar ID
                if ($rulePart === 'id' && !validateId($value)) {
                    $errors[$field] = "El campo $field debe ser un ID válido";
                    continue;
                }
                
                // Validar precio
                if ($rulePart === 'price' && !validatePrice($value)) {
                    $errors[$field] = "El campo $field debe ser un precio válido";
                    continue;
                }
                
                // Validar cantidad
                if ($rulePart === 'quantity' && !validateQuantity($value)) {
                    $errors[$field] = "El campo $field debe ser una cantidad válida";
                    continue;
                }
                
                // Validar estado de reserva
                if ($rulePart === 'booking_status' && !validateBookingStatus($value)) {
                    $errors[$field] = "El estado de reserva no es válido";
                    continue;
                }
                
                // Validar método de pago
                if ($rulePart === 'payment_method' && !validatePaymentMethod($value)) {
                    $errors[$field] = "El método de pago no es válido";
                    continue;
                }
                
                // Validar estado de pago
                if ($rulePart === 'payment_status' && !validatePaymentStatus($value)) {
                    $errors[$field] = "El estado de pago no es válido";
                    continue;
                }
                
                // Validar longitud mínima
                if (strpos($rulePart, 'min:') === 0) {
                    $min = (int) substr($rulePart, 4);
                    if (strlen($value) < $min) {
                        $errors[$field] = "El campo $field debe tener al menos $min caracteres";
                        continue;
                    }
                }
                
                // Validar longitud máxima
                if (strpos($rulePart, 'max:') === 0) {
                    $max = (int) substr($rulePart, 4);
                    if (strlen($value) > $max) {
                        $errors[$field] = "El campo $field no debe exceder $max caracteres";
                        continue;
                    }
                }
                
                // Validar valor mínimo
                if (strpos($rulePart, 'min_value:') === 0) {
                    $min = (int) substr($rulePart, 10);
                    if ($value < $min) {
                        $errors[$field] = "El campo $field debe ser al menos $min";
                        continue;
                    }
                }
                
                // Validar valor máximo
                if (strpos($rulePart, 'max_value:') === 0) {
                    $max = (int) substr($rulePart, 10);
                    if ($value > $max) {
                        $errors[$field] = "El campo $field no debe exceder $max";
                        continue;
                    }
                }
                
                // Validar que sea uno de los valores permitidos
                if (strpos($rulePart, 'in:') === 0) {
                    $allowedValues = explode(',', substr($rulePart, 3));
                    if (!in_array($value, $allowedValues)) {
                        $errors[$field] = "El valor del campo $field no es válido";
                        continue;
                    }
                }
                
                // Validar formato de URL
                if ($rulePart === 'url' && !filter_var($value, FILTER_VALIDATE_URL)) {
                    $errors[$field] = "El campo $field debe ser una URL válida";
                    continue;
                }
                
                // Validar formato JSON
                if ($rulePart === 'json') {
                    json_decode($value);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $errors[$field] = "El campo $field debe ser un JSON válido";
                        continue;
                    }
                }
                
                // Validar formato de color hexadecimal
                if ($rulePart === 'hex_color' && !preg_match('/^#([A-Fa-f0-9]{3}){1,2}$/', $value)) {
                    $errors[$field] = "El campo $field debe ser un color hexadecimal válido";
                    continue;
                }
                
                // Validar formato de dirección IP
                if ($rulePart === 'ip' && !filter_var($value, FILTER_VALIDATE_IP)) {
                    $errors[$field] = "El campo $field debe ser una dirección IP válida";
                    continue;
                }
            }
        }
        
        return empty($errors) ? true : $errors;
    }
    
    /**
     * Sanitizar entrada de texto
     * @param mixed $input Entrada a sanitizar
     * @return mixed Entrada sanitizada
     */
    private static function sanitizeInput($input) {
        if (is_array($input)) {
            foreach ($input as $key => $value) {
                $input[$key] = self::sanitizeInput($value);
            }
        } else if (is_string($input)) {
            // Eliminar caracteres nulos
            $input = str_replace("\0", '', $input);
            
            // Eliminar caracteres de control excepto saltos de línea y tabulaciones
            $input = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);
            
            // Escapar HTML
            $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
        
        return $input;
    }
}

/**
 * Función para validar datos de entrada
 * @param array $data Datos a validar
 * @param array $rules Reglas de validación
 * @return array|bool Array de errores o true si es válido
 */
function validateInput($data, $rules) {
    return InputValidator::validate($data, $rules);
}
