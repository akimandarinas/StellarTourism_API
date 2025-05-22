<?php
/** Implementa un limitador de tasa basado en IP para prevenir ataques de fuerza bruta
 */
class RateLimiter {
    private $redis;
    private $maxRequests;
    private $period;
    
    public function __construct($maxRequests = 100, $period = 60) {
        $this->maxRequests = $maxRequests;
        $this->period = $period;
        
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
    
    public function hasExceededLimit($ip, $endpoint = null) {
        $key = $this->getKey($ip, $endpoint);
        
        if ($this->redis) {
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
            $file = $this->getStorageFile();
            $data = $this->loadData($file);
            
            // Limpiar datos antiguos
            $this->cleanupData($data);
            
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
    private function getKey($ip, $endpoint = null) {
        $key = 'rate_limit:' . $ip;
        
        if ($endpoint) {
            $key .= ':' . $endpoint;
        }
        
        return $key;
    }turn string
     */
    private function getStorageFile() {
        $dir = __DIR__ . '/../data/rate_limit';
        
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        return $dir . '/rate_limit.json';
    }
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
    private function saveData($file, $data) {
        file_put_contents($file, json_encode($data));
    }

    private function cleanupData(&$data) {
        $now = time();
        
        foreach ($data as $key => $info) {
            if ($now - $info['timestamp'] > $this->period) {
                unset($data[$key]);
            }
        }
    }

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
function applyRateLimit($endpoint = null) {
    $limiter = new RateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_PERIOD);
    return $limiter->apply($_SERVER['REMOTE_ADDR'], $endpoint);
}
