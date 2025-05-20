<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Firebase\JWT\BeforeValidException;
use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

/**
 * Clase para gestionar la autenticación y autorización
 * Versión optimizada y limpia
 */
class AuthService {
    private static $instance = null;
    private $tokenBlacklist = [];
    private $lastBlacklistCleanup = 0;
    
    /**
     * Obtener instancia singleton
     * @return AuthService
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor privado para el patrón Singleton
     */
    private function __construct() {
        // Cargar la lista negra de tokens desde el almacenamiento persistente si existe
        $this->loadTokenBlacklist();
        $this->lastBlacklistCleanup = time();
    }
    
    /**
     * Cargar la lista negra de tokens desde el almacenamiento
     */
    private function loadTokenBlacklist() {
        $blacklistFile = __DIR__ . '/../data/token_blacklist.json';
        if (file_exists($blacklistFile)) {
            $blacklistData = json_decode(file_get_contents($blacklistFile), true);
            if (is_array($blacklistData)) {
                $this->tokenBlacklist = $blacklistData;
            }
        }
    }
    
    /**
     * Guardar la lista negra de tokens en el almacenamiento
     */
    private function saveTokenBlacklist() {
        // Limpiar tokens expirados antes de guardar
        $this->cleanupBlacklist();
        
        $blacklistFile = __DIR__ . '/../data/token_blacklist.json';
        $blacklistDir = dirname($blacklistFile);
        
        // Asegurarse de que el directorio existe
        if (!is_dir($blacklistDir)) {
            mkdir($blacklistDir, 0755, true);
        }
        
        file_put_contents($blacklistFile, json_encode($this->tokenBlacklist));
    }
    
    /**
     * Limpiar tokens expirados de la lista negra
     */
    private function cleanupBlacklist() {
        $now = time();
        
        // Solo limpiar cada 15 minutos para evitar operaciones de I/O frecuentes
        if ($now - $this->lastBlacklistCleanup < 900) {
            return;
        }
        
        foreach ($this->tokenBlacklist as $jti => $expiry) {
            if ($expiry < $now) {
                unset($this->tokenBlacklist[$jti]);
            }
        }
        
        $this->lastBlacklistCleanup = $now;
    }
    
    /**
     * Añadir un token a la lista negra
     * @param string $token Token a invalidar
     * @param int $expiry Tiempo de expiración del token
     */
    public function blacklistToken($token, $expiry = null) {
        try {
            // Decodificar el token sin verificar para obtener el ID y la expiración
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            
            // Usar el jti como identificador único del token
            $jti = $decoded->jti ?? hash('sha256', $token);
            
            // Si no se proporciona expiración, usar la del token o 24 horas
            if ($expiry === null) {
                $expiry = isset($decoded->exp) ? $decoded->exp : (time() + 86400);
            }
            
            $this->tokenBlacklist[$jti] = $expiry;
            $this->saveTokenBlacklist();
            
            return true;
        } catch (\Exception $e) {
            // Si hay un error al decodificar, usar un hash del token como identificador
            $jti = hash('sha256', $token);
            $expiry = time() + 86400; // 24 horas por defecto
            
            $this->tokenBlacklist[$jti] = $expiry;
            $this->saveTokenBlacklist();
            
            return true;
        }
    }
    
    /**
     * Verificar si un token está en la lista negra
     * @param string $token Token a verificar
     * @return bool
     */
    public function isTokenBlacklisted($token) {
        try {
            // Decodificar el token sin verificar para obtener el ID
            $decoded = JWT::decode($token, new Key(JWT_SECRET, 'HS256'));
            
            // Usar el jti como identificador único del token
            $jti = $decoded->jti ?? hash('sha256', $token);
            
            return isset($this->tokenBlacklist[$jti]) && $this->tokenBlacklist[$jti] >= time();
        } catch (\Exception $e) {
            // Si hay un error al decodificar, usar un hash del token
            $jti = hash('sha256', $token);
            return isset($this->tokenBlacklist[$jti]) && $this->tokenBlacklist[$jti] >= time();
        }
    }
    
    /**
     * Obtener el encabezado de autorización
     * @return string|null
     */
    public function getAuthorizationHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        return $headers;
    }
    
    /**
     * Obtener el token Bearer del encabezado de autorización
     * @param string|null $authHeader
     * @return string|null
     */
    public function getBearerToken($authHeader = null) {
        if (!$authHeader) {
            $authHeader = $this->getAuthorizationHeader();
        }
        
        if (!$authHeader) {
            return null;
        }
        
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    /**
     * Validar un token de Firebase
     * @param string $token
     * @return object|bool Datos del usuario o false si el token es inválido
     */
    public function validateFirebaseToken($token) {
        try {
            // Verificar si el token está en la lista negra
            if ($this->isTokenBlacklisted($token)) {
                $this->logAuthAttempt('firebase_token_blacklisted', false);
                return false;
            }
            
            // Inicializar Firebase
            $serviceAccount = ServiceAccount::fromArray([
                'type' => 'service_account',
                'project_id' => FIREBASE_PROJECT_ID,
                'client_email' => FIREBASE_CLIENT_EMAIL,
                'private_key' => str_replace('\\n', "\n", FIREBASE_PRIVATE_KEY),
            ]);
            
            $firebase = (new Factory)
                ->withServiceAccount($serviceAccount)
                ->create();
            
            $auth = $firebase->getAuth();
            
            // Verificar el token con Firebase Auth
            $verifiedToken = $auth->verifyIdToken($token, true); // true para verificar si el token ha sido revocado
            
            // Verificar la fecha de expiración
            if ($verifiedToken->getClaim('exp') < time()) {
                $this->logAuthAttempt('firebase_token_expired', false);
                return false;
            }
            
            // Verificar el emisor (debe ser Firebase)
            $iss = $verifiedToken->getClaim('iss');
            if (strpos($iss, 'securetoken.google.com') === false && strpos($iss, 'firebase') === false) {
                $this->logAuthAttempt('firebase_token_invalid_issuer', false);
                return false;
            }
            
            // Verificar la audiencia (debe ser nuestro proyecto)
            $aud = $verifiedToken->getClaim('aud');
            if ($aud !== FIREBASE_PROJECT_ID) {
                $this->logAuthAttempt('firebase_token_invalid_audience', false);
                return false;
            }
            
            // Extraer datos del usuario
            $userData = (object) [
                'sub' => $verifiedToken->getClaim('sub'),
                'email' => $verifiedToken->getClaim('email'),
                'name' => $verifiedToken->getClaim('name'),
                'picture' => $verifiedToken->getClaim('picture'),
                'email_verified' => $verifiedToken->getClaim('email_verified'),
                'auth_time' => $verifiedToken->getClaim('auth_time'),
                'firebase' => true
            ];
            
            $this->logAuthAttempt('firebase_token_valid', true, $userData->email);
            return $userData;
        } catch (\Kreait\Firebase\Exception\Auth\RevokedIdToken $e) {
            // Token ha sido revocado
            $this->logAuthAttempt('firebase_token_revoked', false);
            return false;
        } catch (\Kreait\Firebase\Exception\Auth\ExpiredIdToken $e) {
            // Token ha expirado
            $this->logAuthAttempt('firebase_token_expired', false);
            return false;
        } catch (\Kreait\Firebase\Exception\Auth\InvalidIdToken $e) {
            // Token inválido
            $this->logAuthAttempt('firebase_token_invalid', false);
            return false;
        } catch (Exception $e) {
            // Otro error
            $this->logAuthAttempt('firebase_token_error', false, null, $e->getMessage());
            return false;
        }
    }
    
    /**
     * Generar un token JWT
     * @param array $payload
     * @param int $expiration Tiempo de expiración en segundos (por defecto 1 hora)
     * @return string
     */
    public function generateJWT($payload, $expiration = 3600) {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiration;
        
        $header_encoded = base64_encode(json_encode($header));
        $payload_encoded = base64_encode(json_encode($payload));
        
        $signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", $this->getSecretKey(), true);
        $signature_encoded = base64_encode($signature);
        
        return "$header_encoded.$payload_encoded.$signature_encoded";
    }
    
    /**
     * Verificar un token JWT
     * @param string $token
     * @return object|bool Datos del payload o false si el token es inválido
     */
    public function verifyJWT($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;
        
        $signature = base64_decode($signature_encoded);
        $expected_signature = hash_hmac('sha256', "$header_encoded.$payload_encoded", $this->getSecretKey(), true);
        
        if (!hash_equals($expected_signature, $signature)) {
            return false;
        }
        
        $payload = json_decode(base64_decode($payload_encoded), true);
        
        if ($payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Obtener la clave secreta para firmar tokens
     * @return string
     */
    private function getSecretKey() {
        // Obtener de variable de entorno o usar una clave por defecto
        return getenv('JWT_SECRET') ?: 'stellar_tourism_secret_key';
    }
    
    /**
     * Verificar si el usuario está autenticado
     * @return bool
     */
    public function isAuthenticated() {
        $headers = getallheaders();
        $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
            return $this->verifyJWT($token);
        }
        
        return false;
    }
    
    /**
     * Obtener el ID del usuario actual
     * @return string|null
     */
    public function getCurrentUserId() {
        $payload = $this->isAuthenticated();
        
        if ($payload && isset($payload['user_id'])) {
            return $payload['user_id'];
        }
        
        return null;
    }
    
    /**
     * Verificar si el usuario tiene un rol específico
     * @param string $role
     * @return bool
     */
    public function hasRole($role) {
        $payload = $this->isAuthenticated();
        
        if ($payload && isset($payload['roles'])) {
            return in_array($role, $payload['roles']);
        }
        
        return false;
    }
    
    /**
     * Verificar si el usuario tiene permiso para acceder a un recurso
     * @param string $resource
     * @param string $action
     * @return bool
     */
    public function hasPermission($resource, $action) {
        $payload = $this->isAuthenticated();
        
        if ($payload && isset($payload['permissions'])) {
            $permission = "$resource:$action";
            return in_array($permission, $payload['permissions']);
        }
        
        return false;
    }
    
    /**
     * Generar un hash seguro para contraseñas
     * @param string $password
     * @return string
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }
    
    /**
     * Verificar una contraseña contra su hash
     * @param string $password
     * @param string $hash
     * @return bool
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Generar un token aleatorio para restablecimiento de contraseña
     * @param int $length Longitud del token
     * @return string
     */
    public function generateRandomToken($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }
    
    /**
     * Registrar intento de autenticación
     * @param string $type Tipo de intento
     * @param bool $success Si fue exitoso
     * @param string|null $user Usuario que intentó autenticarse
     * @param string|null $message Mensaje adicional
     */
    private function logAuthAttempt($type, $success, $user = null, $message = null) {
        if (!defined('LOG_ENABLED') || !LOG_ENABLED) {
            return;
        }
        
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'type' => $type,
            'success' => $success,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'user' => $user,
            'message' => $message
        ];
        
        $logFile = defined('AUTH_LOG_FILE') ? AUTH_LOG_FILE : __DIR__ . '/../logs/auth.log';
        $logDir = dirname($logFile);
        
        // Asegurarse de que el directorio existe
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        file_put_contents(
            $logFile,
            json_encode($logData) . PHP_EOL,
            FILE_APPEND
        );
    }
    
    /**
     * Verificar si un usuario tiene un rol específico
     * @param object $userData
     * @param string $role
     * @return bool
     */
    public function hasRoleOld($userData, $role) {
        if (!$userData || !isset($userData->email)) {
            return false;
        }
        
        // Obtener roles del usuario desde la base de datos
        // Esta es una implementación simplificada, en producción debería consultar la BD
        switch ($role) {
            case 'admin':
                return strpos($userData->email, 'admin@') !== false;
                
            case 'staff':
                return strpos($userData->email, 'staff@') !== false || strpos($userData->email, 'admin@') !== false;
                
            case 'user':
                return true;
                
            default:
                return false;
        }
    }
    
    /**
     * Verificar si un usuario tiene permiso para acceder a un recurso
     * @param object $userData
     * @param string $resource
     * @param string $action
     * @param string|null $resourceId
     * @return bool
     */
    public function hasPermissionOld($userData, $resource, $action, $resourceId = null) {
        if (!$userData) {
            return false;
        }
        
        // Los administradores tienen acceso a todo
        if ($this->hasRoleOld($userData, 'admin')) {
            return true;
        }
        
        // El personal tiene acceso a ciertos recursos
        if ($this->hasRoleOld($userData, 'staff')) {
            switch ($resource) {
                case 'destinos':
                case 'naves':
                case 'rutas':
                case 'actividades':
                    return in_array($action, ['read', 'list']);
                    
                case 'reservas':
                case 'usuarios':
                case 'resenas':
                    return true;
                    
                default:
                    return false;
            }
        }
        
        // Los usuarios normales tienen acceso limitado
        switch ($resource) {
            case 'destinos':
            case 'naves':
            case 'rutas':
            case 'actividades':
                return in_array($action, ['read', 'list']);
                
            case 'reservas':
                // Solo pueden acceder a sus propias reservas
                if ($action === 'create') {
                    return true;
                }
                
                if (in_array($action, ['read', 'update', 'delete']) && $resourceId) {
                    // En un entorno real, aquí se verificaría si la reserva pertenece al usuario
                    return $this->verifyResourceOwnership($userData->sub, 'reservas', $resourceId);
                }
                
                return false;
                
            case 'usuarios':
                // Solo pueden acceder a su propio perfil
                if (in_array($action, ['read', 'update']) && $resourceId) {
                    return $userData->sub === $resourceId;
                }
                
                return false;
                
            case 'resenas':
                // Pueden crear reseñas y ver reseñas de otros
                if ($action === 'create' || $action === 'list' || $action === 'read') {
                    return true;
                }
                
                // Solo pueden actualizar o eliminar sus propias reseñas
                if (in_array($action, ['update', 'delete']) && $resourceId) {
                    return $this->verifyResourceOwnership($userData->sub, 'resenas', $resourceId);
                }
                
                return false;
                
            default:
                return false;
        }
    }
    
    /**
     * Verificar si un recurso pertenece al usuario
     * @param string $userId
     * @param string $resourceType
     * @param string $resourceId
     * @return bool
     */
    private function verifyResourceOwnership($userId, $resourceType, $resourceId) {
        // Implementación real requeriría consultar la base de datos
        $db = Database::getInstance();
        $sql = "SELECT COUNT(*) FROM {$resourceType} WHERE id = ? AND user_id = ?";
        $count = $db->getValue($sql, [(int)$resourceId, $userId]);
        return $count > 0;
    }
    
    /**
     * Autenticar al usuario actual
     * @return object|bool Datos del usuario o false si no está autenticado
     */
    public function authenticateCurrentUser() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            return false;
        }
        
        // Intentar validar como token de Firebase primero
        $userData = $this->validateFirebaseToken($token);
        
        // Si no es un token de Firebase válido, intentar como JWT
        if (!$userData) {
            $userData = $this->verifyJWT($token);
        }
        
        return $userData;
    }
    
    /**
     * Requerir autenticación para acceder a un recurso
     * @param string $resource
     * @param string $action
     * @param string|null $resourceId
     * @return object Datos del usuario autenticado
     * @throws Exception Si el usuario no está autenticado o no tiene permisos
     */
    public function requireAuth($resource, $action, $resourceId = null) {
        $userData = $this->authenticateCurrentUser();
        
        if (!$userData) {
            http_response_code(401);
            throw new Exception("No autenticado");
        }
        
        if (!$this->hasPermission($resource, $action)) {
            http_response_code(403);
            throw new Exception("No autorizado");
        }
        
        return $userData;
    }
    
    /**
     * Verificar la fortaleza de una contraseña
     * @param string $password
     * @return array Resultado de la verificación
     */
    public function checkPasswordStrength($password) {
        $result = [
            'strong' => false,
            'score' => 0,
            'errors' => []
        ];
        
        // Verificar longitud mínima
        if (strlen($password) < 8) {
            $result['errors'][] = 'La contraseña debe tener al menos 8 caracteres';
        } else {
            $result['score']++;
        }
        
        // Verificar si contiene al menos una letra mayúscula
        if (!preg_match('/[A-Z]/', $password)) {
            $result['errors'][] = 'La contraseña debe contener al menos una letra mayúscula';
        } else {
            $result['score']++;
        }
        
        // Verificar si contiene al menos una letra minúscula
        if (!preg_match('/[a-z]/', $password)) {
            $result['errors'][] = 'La contraseña debe contener al menos una letra minúscula';
        } else {
            $result['score']++;
        }
        
        // Verificar si contiene al menos un número
        if (!preg_match('/[0-9]/', $password)) {
            $result['errors'][] = 'La contraseña debe contener al menos un número';
        } else {
            $result['score']++;
        }
        
        // Verificar si contiene al menos un carácter especial
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $result['errors'][] = 'La contraseña debe contener al menos un carácter especial';
        } else {
            $result['score']++;
        }
        
        // Verificar si la contraseña es fuerte (cumple con todos los requisitos)
        $result['strong'] = empty($result['errors']);
        
        return $result;
    }
}

// Funciones de ayuda para mantener compatibilidad con el código existente

/**
 * Obtener el encabezado de autorización
 * @return string|null
 */
function getAuthorizationHeader() {
    return AuthService::getInstance()->getAuthorizationHeader();
}

/**
 * Obtener el token Bearer del encabezado de autorización
 * @param string|null $authHeader
 * @return string|null
 */
function getBearerToken($authHeader = null) {
    return AuthService::getInstance()->getBearerToken($authHeader);
}

/**
 * Validar un token de Firebase
 * @param string $token
 * @return object|bool Datos del usuario o false si el token es inválido
 */
function validateFirebaseToken($token) {
    return AuthService::getInstance()->validateFirebaseToken($token);
}

/**
 * Generar un token JWT
 * @param array $payload
 * @param int $expiration Tiempo de expiración en segundos (por defecto 1 hora)
 * @return string
 */
function generateJWT($payload, $expiration = 3600) {
    return AuthService::getInstance()->generateJWT($payload, $expiration);
}

/**
 * Verificar un token JWT
 * @param string $token
 * @return object|bool Datos del payload o false si el token es inválido
 */
function verifyJWT($token) {
    return AuthService::getInstance()->verifyJWT($token);
}

/**
 * Verificar si el usuario está autenticado
 * @return bool
 */
function isAuthenticated() {
    return AuthService::getInstance()->isAuthenticated();
}

/**
 * Obtener el ID del usuario actual
 * @return string|null
 */
function getCurrentUserId() {
    return AuthService::getInstance()->getCurrentUserId();
}

/**
 * Verificar si el usuario tiene un rol específico
 * @param string $role
 * @return bool
 */
function hasRole($role) {
    return AuthService::getInstance()->hasRole($role);
}

/**
 * Verificar si el usuario tiene permiso para acceder a un recurso
 * @param string $resource
 * @param string $action
 * @return bool
 */
function hasPermission($resource, $action) {
    return AuthService::getInstance()->hasPermission($resource, $action);
}

/**
 * Revocar un token JWT
 * @param string $token
 * @return bool
 */
function revokeToken($token) {
    return AuthService::getInstance()->blacklistToken($token);
}

/**
 * Verificar la fortaleza de una contraseña
 * @param string $password
 * @return array Resultado de la verificación
 */
function checkPasswordStrength($password) {
    return AuthService::getInstance()->checkPasswordStrength($password);
}

/**
 * Generar un hash seguro para contraseñas
 * @param string $password
 * @return string
 */
function hashPassword($password) {
    return AuthService::getInstance()->hashPassword($password);
}

/**
 * Verificar una contraseña contra su hash
 * @param string $password
 * @param string $hash
 * @return bool
 */
function verifyPassword($password, $hash) {
    return AuthService::getInstance()->verifyPassword($password, $hash);
}

/**
 * Generar un token aleatorio para restablecimiento de contraseña
 * @param int $length Longitud del token
 * @return string
 */
function generateRandomToken($length = 32) {
    return AuthService::getInstance()->generateRandomToken($length);
}
