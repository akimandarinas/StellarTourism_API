<?php
/**
 * Middleware para limitar la tasa de solicitudes
 * Implementa un limitador de tasa basado en IP para prevenir ataques de fuerza bruta
 */
class RateLimiter {
    private $redis;
    private $maxRequests;
    private $period;
    
    /**
     * Constructor
     * @param int $maxRequests Número máximo de solicitudes permitidas en el período
     * @param int $period Período en segundos
     */
    public function __construct($maxRequests = 100, $period = 60) {
        $this->maxRequests = $maxRequests;
        $this->period = $period;
        
        // Intentar conectar a Redis si está disponible
        if (class_exists('Redis')) {
            try {
                $this->redis = new Redis();
                $this->redis->connect('127.0.0.1', 6379);
            } catch (Exception $e) {
                $this->redis = null;
                logError("Error al conectar con Redis: " . $e->getMessage());
            }
        }
    }
    
    /**
     * Verificar si una IP ha excedido el límite de solicitudes
     * @param string $ip Dirección IP
     * @param string $endpoint Endpoint solicitado (opcional)
     * @return bool True si ha excedido el límite, false en caso contrario
     */
    public function hasExceededLimit($ip, $endpoint = null) {
        $key = $this->getKey($ip, $endpoint);
        
        if ($this->redis) {
            // Usar Redis para el seguimiento de solicitudes
            $count = $this->redis->get($key);
            
            if ($count === false) {
                // Primera solicitud
                $this->redis->setex($key, $this->period, 1);
                return false;
            }
            
            if ($count >= $this->maxRequests) {
                return true;
            }
            
            $this->redis->incr($key);
            return false;
        } else {
            // Usar archivo para el seguimiento de solicitudes
            $file = $this->getStorageFile();
            $data = $this->loadData($file);
            
            // Limpiar datos antiguos
            $this->cleanupData($data);
            
            // Verificar límite
            if (!isset($data[$key])) {
                $data[$key] = ['count' => 1, 'timestamp' => time()];
                $this->saveData($file, $data);
                return false;
            }
            
            if ($data[$key]['count'] >= $this->maxRequests) {
                return true;
            }
            
            $data[$key]['count']++;
            $this->saveData($file, $data);
            return false;
        }
    }
    
    /**
     * Obtener la clave para el seguimiento de solicitudes
     * @param string $ip Dirección IP
     * @param string $endpoint Endpoint solicitado (opcional)
     * @return string
     */
    private function getKey($ip, $endpoint = null) {
        $key = 'rate_limit:' . $ip;
        
        if ($endpoint) {
            $key .= ':' . $endpoint;
        }
        
        return $key;
    }
    
    /**
     * Obtener la ruta del archivo de almacenamiento
     * @return string
     */
    private function getStorageFile() {
        $dir = __DIR__ . '/../data/rate_limit';
        
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        return $dir . '/rate_limit.json';
    }
    
    /**
     * Cargar datos del archivo
     * @param string $file Ruta del archivo
     * @return array
     */
    private function loadData($file) {
        if (file_exists($file)) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            
            if (is_array($data)) {
                return $data;
            }
        }
        
        return [];
    }
    
    /**
     * Guardar datos en el archivo
     * @param string $file Ruta del archivo
     * @param array $data Datos a guardar
     */
    private function saveData($file, $data) {
        file_put_contents($file, json_encode($data));
    }
    
    /**
     * Limpiar datos antiguos
     * @param array &$data Datos a limpiar
     */
    private function cleanupData(&$data) {
        $now = time();
        
        foreach ($data as $key => $info) {
            if ($now - $info['timestamp'] > $this->period) {
                unset($data[$key]);
            }
        }
    }
    
    /**
     * Aplicar el limitador de tasa a una solicitud
     * @param string $ip Dirección IP
     * @param string $endpoint Endpoint solicitado (opcional)
     * @return bool True si la solicitud es permitida, false en caso contrario
     */
    public function apply($ip, $endpoint = null) {
        if (!RATE_LIMIT_ENABLED) {
            return true;
        }
        
        if ($this->hasExceededLimit($ip, $endpoint)) {
            header('Content-Type: application/json');
            header('Retry-After: ' . $this->period);
            http_response_code(429);
            echo json_encode([
                'status' => 'error',
                'message' => 'Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde.',
                'code' => 'rate_limit_exceeded'
            ]);
            return false;
        }
        
        return true;
    }
}

// Función para aplicar el limitador de tasa
function applyRateLimit($endpoint = null) {
    $limiter = new RateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_PERIOD);
    return $limiter->apply($_SERVER['REMOTE_ADDR'], $endpoint);
}
