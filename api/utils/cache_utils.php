<?php
/**
 * Utilidad para gestión de caché con soporte para múltiples backends
 * Implementa patrón de diseño Strategy para diferentes mecanismos de almacenamiento
 * Versión optimizada y limpia
 */
class CacheUtils {
    private $prefix;
    private $defaultTtl;
    private $driver;
    
    /**
     * Constructor
     * 
     * @param string $prefix Prefijo para las claves de caché
     * @param int $defaultTtl Tiempo de vida por defecto en segundos
     * @param string $driver Driver de caché a utilizar ('redis', 'apcu', 'file')
     */
    public function __construct($prefix = 'app', $defaultTtl = 3600, $driver = null) {
        $this->prefix = $prefix;
        $this->defaultTtl = $defaultTtl;
        
        // Determinar el mejor driver disponible si no se especifica
        if ($driver === null) {
            if (extension_loaded('redis') && class_exists('Redis')) {
                $driver = 'redis';
            } elseif (extension_loaded('apcu') && function_exists('apcu_fetch')) {
                $driver = 'apcu';
            } else {
                $driver = 'file';
            }
        }
        
        // Inicializar el driver seleccionado
        switch ($driver) {
            case 'redis':
                $this->driver = new RedisCacheDriver();
                break;
            case 'apcu':
                $this->driver = new ApcuCacheDriver();
                break;
            case 'file':
            default:
                $this->driver = new FileCacheDriver();
                break;
        }
    }
    
    /**
     * Obtiene un valor del caché
     * 
     * @param string $key Clave
     * @return mixed Valor almacenado o null si no existe o expiró
     */
    public function get($key) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->get($fullKey);
    }
    
    /**
     * Almacena un valor en el caché
     * 
     * @param string $key Clave
     * @param mixed $value Valor a almacenar
     * @param int|null $ttl Tiempo de vida en segundos (null para usar el valor por defecto)
     * @return bool Éxito de la operación
     */
    public function set($key, $value, $ttl = null) {
        $fullKey = $this->getFullKey($key);
        $ttl = $ttl === null ? $this->defaultTtl : $ttl;
        return $this->driver->set($fullKey, $value, $ttl);
    }
    
    /**
     * Elimina un valor del caché
     * 
     * @param string $key Clave
     * @return bool Éxito de la operación
     */
    public function delete($key) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->delete($fullKey);
    }
    
    /**
     * Elimina valores que coinciden con un patrón
     * 
     * @param string $pattern Patrón (con comodines *)
     * @return bool Éxito de la operación
     */
    public function deletePattern($pattern) {
        $fullPattern = $this->getFullKey($pattern);
        return $this->driver->deletePattern($fullPattern);
    }
    
    /**
     * Verifica si una clave existe en el caché
     * 
     * @param string $key Clave
     * @return bool True si existe y no ha expirado
     */
    public function has($key) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->has($fullKey);
    }
    
    /**
     * Incrementa un valor numérico en el caché
     * 
     * @param string $key Clave
     * @param int $value Valor a incrementar
     * @return int|bool Nuevo valor o false en caso de error
     */
    public function increment($key, $value = 1) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->increment($fullKey, $value);
    }
    
    /**
     * Decrementa un valor numérico en el caché
     * 
     * @param string $key Clave
     * @param int $value Valor a decrementar
     * @return int|bool Nuevo valor o false en caso de error
     */
    public function decrement($key, $value = 1) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->decrement($fullKey, $value);
    }
    
    /**
     * Limpia todo el caché
     * 
     * @return bool Éxito de la operación
     */
    public function clear() {
        return $this->driver->clear($this->prefix);
    }
    
    /**
     * Obtiene o establece un valor en el caché
     * Si no existe, ejecuta la función callback y almacena su resultado
     * 
     * @param string $key Clave
     * @param callable $callback Función a ejecutar si la clave no existe
     * @param int|null $ttl Tiempo de vida en segundos
     * @return mixed Valor del caché o resultado del callback
     */
    public function remember($key, $callback, $ttl = null) {
        $value = $this->get($key);
        
        if ($value !== null) {
            return $value;
        }
        
        $value = $callback();
        $this->set($key, $value, $ttl);
        
        return $value;
    }
    
    /**
     * Genera la clave completa con prefijo
     * 
     * @param string $key Clave
     * @return string Clave completa
     */
    private function getFullKey($key) {
        return $this->prefix . ':' . $key;
    }
}

/**
 * Interfaz para drivers de caché
 */
interface CacheDriver {
    public function get($key);
    public function set($key, $value, $ttl);
    public function delete($key);
    public function deletePattern($pattern);
    public function has($key);
    public function increment($key, $value);
    public function decrement($key, $value);
    public function clear($prefix);
}

/**
 * Driver de caché para Redis
 */
class RedisCacheDriver implements CacheDriver {
    private $redis;
    
    public function __construct() {
        $this->redis = new Redis();
        
        // Intentar conectar a Redis
        try {
            $host = defined('REDIS_HOST') ? REDIS_HOST : '127.0.0.1';
            $port = defined('REDIS_PORT') ? REDIS_PORT : 6379;
            $timeout = defined('REDIS_TIMEOUT') ? REDIS_TIMEOUT : 2.0;
            $password = defined('REDIS_PASSWORD') ? REDIS_PASSWORD : null;
            
            $this->redis->connect($host, $port, $timeout);
            
            if ($password) {
                $this->redis->auth($password);
            }
        } catch (Exception $e) {
            error_log("Error conectando a Redis: " . $e->getMessage());
            throw new Exception("No se pudo conectar a Redis");
        }
    }
    
    public function get($key) {
        $value = $this->redis->get($key);
        
        if ($value === false) {
            return null;
        }
        
        return unserialize($value);
    }
    
    public function set($key, $value, $ttl) {
        return $this->redis->setex($key, $ttl, serialize($value));
    }
    
    public function delete($key) {
        return $this->redis->del($key) > 0;
    }
    
    public function deletePattern($pattern) {
        $keys = $this->redis->keys($pattern);
        
        if (empty($keys)) {
            return true;
        }
        
        return $this->redis->del($keys) > 0;
    }
    
    public function has($key) {
        return $this->redis->exists($key);
    }
    
    public function increment($key, $value) {
        return $this->redis->incrBy($key, $value);
    }
    
    public function decrement($key, $value) {
        return $this->redis->decrBy($key, $value);
    }
    
    public function clear($prefix) {
        return $this->deletePattern($prefix . ':*');
    }
}

/**
 * Driver de caché para APCu
 */
class ApcuCacheDriver implements CacheDriver {
    public function get($key) {
        $success = false;
        $value = apcu_fetch($key, $success);
        
        return $success ? $value : null;
    }
    
    public function set($key, $value, $ttl) {
        return apcu_store($key, $value, $ttl);
    }
    
    public function delete($key) {
        return apcu_delete($key);
    }
    
    public function deletePattern($pattern) {
        $pattern = str_replace('*', '', $pattern);
        $iterator = new APCUIterator('/^' . preg_quote($pattern, '/') . '/');
        return apcu_delete($iterator);
    }
    
    public function has($key) {
        return apcu_exists($key);
    }
    
    public function increment($key, $value) {
        return apcu_inc($key, $value);
    }
    
    public function decrement($key, $value) {
        return apcu_dec($key, $value);
    }
    
    public function clear($prefix) {
        return $this->deletePattern($prefix . ':');
    }
}

/**
 * Driver de caché para sistema de archivos
 */
class FileCacheDriver implements CacheDriver {
    private $cachePath;
    
    public function __construct() {
        // Determinar ruta de caché
        $this->cachePath = defined('CACHE_PATH') ? CACHE_PATH : sys_get_temp_dir() . '/app_cache';
        
        // Crear directorio si no existe
        if (!is_dir($this->cachePath)) {
            mkdir($this->cachePath, 0755, true);
        }
    }
    
    public function get($key) {
        $path = $this->getFilePath($key);
        
        if (!file_exists($path)) {
            return null;
        }
        
        $data = unserialize(file_get_contents($path));
        
        // Verificar expiración
        if ($data['expiration'] !== 0 && $data['expiration'] < time()) {
            $this->delete($key);
            return null;
        }
        
        return $data['value'];
    }
    
    public function set($key, $value, $ttl) {
        $path = $this->getFilePath($key);
        $expiration = $ttl > 0 ? time() + $ttl : 0;
        
        $data = [
            'expiration' => $expiration,
            'value' => $value
        ];
        
        return file_put_contents($path, serialize($data)) !== false;
    }
    
    public function delete($key) {
        $path = $this->getFilePath($key);
        
        if (file_exists($path)) {
            return unlink($path);
        }
        
        return true;
    }
    
    public function deletePattern($pattern) {
        $pattern = str_replace(':', '_', $pattern);
        $pattern = str_replace('*', '', $pattern);
        
        $files = glob($this->cachePath . '/' . $pattern . '*');
        
        if (empty($files)) {
            return true;
        }
        
        $success = true;
        
        foreach ($files as $file) {
            if (is_file($file)) {
                $success = $success && unlink($file);
            }
        }
        
        return $success;
    }
    
    public function has($key) {
        $path = $this->getFilePath($key);
        
        if (!file_exists($path)) {
            return false;
        }
        
        $data = unserialize(file_get_contents($path));
        
        // Verificar expiración
        if ($data['expiration'] !== 0 && $data['expiration'] < time()) {
            $this->delete($key);
            return false;
        }
        
        return true;
    }
    
    public function increment($key, $value) {
        $currentValue = $this->get($key);
        
        if ($currentValue === null) {
            return false;
        }
        
        if (!is_numeric($currentValue)) {
            return false;
        }
        
        $newValue = $currentValue + $value;
        $this->set($key, $newValue, 0);
        
        return $newValue;
    }
    
    public function decrement($key, $value) {
        return $this->increment($key, -$value);
    }
    
    public function clear($prefix) {
        return $this->deletePattern(str_replace(':', '_', $prefix) . '_');
    }
    
    private function getFilePath($key) {
        // Reemplazar caracteres no válidos para nombres de archivo
        $filename = str_replace([':', '/', '\\', '?', '*', '"', '<', '>', '|'], '_', $key);
        return $this->cachePath . '/' . $filename;
    }
}
