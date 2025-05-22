<?php
require_once __DIR__ . '/../utils/utilidades_validacion.php';

class InputValidator {
    public static function validate($data, $rules) {
        $errors = [];
        
        // Verificar que $data sea un array
        if (!is_array($data)) {
            return ['general' => 'Los datos de entrada deben ser un array'];
        }
        
        foreach ($rules as $field => $rule) {
            $isRequired = strpos($rule, 'required') !== false;
            
            if ($isRequired && (!isset($data[$field]) || $data[$field] === '')) {
                $errors[$field] = "El campo $field es obligatorio";
                continue;
            }
          
            if (!isset($data[$field]) || $data[$field] === '') {
                continue;
            }
            
            $value = self::sanitizeInput($data[$field]);
            
            $rulesParts = explode('|', $rule);
            
            foreach ($rulesParts as $rulePart) {
                $rulePart = trim($rulePart);
                
                if ($rulePart === 'required') {
                    continue; // Ya validado
                }
                if ($rulePart === 'email' && !validateEmail($value)) {
                    $errors[$field] = "El campo $field debe ser un correo electrónico válido";
                    continue;
                }
                if ($rulePart === 'password' && !validatePassword($value)) {
                    $errors[$field] = "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número";
                    continue;
                }
                if ($rulePart === 'date' && !validateDate($value)) {
                    $errors[$field] = "El campo $field debe ser una fecha válida (YYYY-MM-DD)";
                    continue;
                }
                if ($rulePart === 'phone' && !validatePhone($value)) {
                    $errors[$field] = "El campo $field debe ser un número de teléfono válido";
                    continue;
                }
                if ($rulePart === 'numeric' && !is_numeric($value)) {
                    $errors[$field] = "El campo $field debe ser un número";
                    continue;
                }
                if ($rulePart === 'integer' && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $errors[$field] = "El campo $field debe ser un número entero";
                    continue;
                }
                if ($rulePart === 'id' && !validateId($value)) {
                    $errors[$field] = "El campo $field debe ser un ID válido";
                    continue;
                }
                if ($rulePart === 'price' && !validatePrice($value)) {
                    $errors[$field] = "El campo $field debe ser un precio válido";
                    continue;
                }
                if ($rulePart === 'quantity' && !validateQuantity($value)) {
                    $errors[$field] = "El campo $field debe ser una cantidad válida";
                    continue;
                }
                if ($rulePart === 'booking_status' && !validateBookingStatus($value)) {
                    $errors[$field] = "El estado de reserva no es válido";
                    continue;
                }
                if ($rulePart === 'payment_method' && !validatePaymentMethod($value)) {
                    $errors[$field] = "El método de pago no es válido";
                    continue;
                }
                if ($rulePart === 'payment_status' && !validatePaymentStatus($value)) {
                    $errors[$field] = "El estado de pago no es válido";
                    continue;
                }
                if (strpos($rulePart, 'min:') === 0) {
                    $min = (int) substr($rulePart, 4);
                    if (strlen($value) < $min) {
                        $errors[$field] = "El campo $field debe tener al menos $min caracteres";
                        continue;
                    }
                }
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
                if (strpos($rulePart, 'max_value:') === 0) {
                    $max = (int) substr($rulePart, 10);
                    if ($value > $max) {
                        $errors[$field] = "El campo $field no debe exceder $max";
                        continue;
                    }
                }
                if (strpos($rulePart, 'in:') === 0) {
                    $allowedValues = explode(',', substr($rulePart, 3));
                    if (!in_array($value, $allowedValues)) {
                        $errors[$field] = "El valor del campo $field no es válido";
                        continue;
                    }
                }
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
                if ($rulePart === 'hex_color' && !preg_match('/^#([A-Fa-f0-9]{3}){1,2}$/', $value)) {
                    $errors[$field] = "El campo $field debe ser un color hexadecimal válido";
                    continue;
                }

                if ($rulePart === 'ip' && !filter_var($value, FILTER_VALIDATE_IP)) {
                    $errors[$field] = "El campo $field debe ser una dirección IP válida";
                    continue;
                }
            }
        }
        
        return empty($errors) ? true : $errors;
    }
    
    private static function sanitizeInput($input) {
        if (is_array($input)) {
            foreach ($input as $key => $value) {
                $input[$key] = self::sanitizeInput($value);
            }
        } else if (is_string($input)) {
            // Eliminar caracteres nulos
            $input = str_replace("\0", '', $input);
            
            $input = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $input);
            
            $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
        
        return $input;
    }
}

function validateInput($data, $rules) {
    return InputValidator::validate($data, $rules);
}
