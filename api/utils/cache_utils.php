<?php
/*
Utilidad para gestión de caché 
Implementa patrón de diseño Strategy 
Versión optimizada y limpia
 */

class CacheUtils {
    private $prefix;
    private $defaultTtl;
    private $driver;
    
    public function __construct($prefix = 'app', $defaultTtl = 3600, $driver = null) {
        $this->prefix = $prefix;
        $this->defaultTtl = $defaultTtl;
        
        if ($driver === null) {
            if (extension_loaded('redis') && class_exists('Redis')) {
                $driver = 'redis';
            } elseif (extension_loaded('apcu') && function_exists('apcu_fetch')) {
                $driver = 'apcu';
            } else {
                $driver = 'file';
            }
        }

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
    
    /*Obtiene un valor del caché*/
    public function get($key) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->get($fullKey);
    }
    
    /*Almacena un valor en el caché*/
    public function set($key, $value, $ttl = null) {
        $fullKey = $this->getFullKey($key);
        $ttl = $ttl === null ? $this->defaultTtl : $ttl;
        return $this->driver->set($fullKey, $value, $ttl);
    }
    
    /*Elimina un valor del caché*/
    public function delete($key) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->delete($fullKey);
    }
    
    /*Elimina valores que coinciden con un patrón*/
    public function deletePattern($pattern) {
        $fullPattern = $this->getFullKey($pattern);
        return $this->driver->deletePattern($fullPattern);
    }
    
    /*Verifica si una clave existe en el caché*/
    public function has($key) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->has($fullKey);
    }
    
    /*Incrementa un valor numérico en el caché*/
    public function increment($key, $value = 1) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->increment($fullKey, $value);
    }
    
    /*Decrementa un valor numérico en el caché*/
    public function decrement($key, $value = 1) {
        $fullKey = $this->getFullKey($key);
        return $this->driver->decrement($fullKey, $value);
    }
    
    /*Limpia todo el caché*/
    public function clear() {
        return $this->driver->clear($this->prefix);
    }
    
    /*Obtiene o establece un valor en el caché*/
    public function remember($key, $callback, $ttl = null) {
        $value = $this->get($key);
        
        if ($value !== null) {
            return $value;
        }
        
        $value = $callback();
        $this->set($key, $value, $ttl);
        
        return $value;
    }
    
    private function getFullKey($key) {
        return $this->prefix . ':' . $key;
    }
}

/*Interfaz para drivers de caché*/
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

class FileCacheDriver implements CacheDriver {
    private $cachePath;
    
    public function __construct() {
        $this->cachePath = defined('CACHE_PATH') ? CACHE_PATH : sys_get_temp_dir() . '/app_cache';
        
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
