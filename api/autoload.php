<?php
/* Autoloader personalizado para el proyecto Stellar Tourism */

spl_autoload_register(function ($class) {
    // Directorios base donde buscar las clases
    $directories = [
        'models' => __DIR__ . '/models/',
        'controllers' => __DIR__ . '/controllers/',
        'utils' => __DIR__ . '/utils/',
        'middleware' => __DIR__ . '/middleware/',
        'config' => __DIR__ . '/config/'
    ];
    
    // Determinar el tipo de clase basado en su nombre
    $classType = null;
    if (strpos($class, 'Controller') !== false) {
        $classType = 'controllers';
    } elseif (strpos($class, 'Middleware') !== false) {
        $classType = 'middleware';
    } elseif (strpos($class, 'Utils') !== false || strpos($class, 'Utilidades') !== false) {
        $classType = 'utils';
    } elseif (strpos($class, 'Config') !== false) {
        $classType = 'config';
    } else {
        $classType = 'models';
    }
    
    // Construir la ruta del archivo
    $classFile = $directories[$classType] . $class . '.php';
    
    if (file_exists($classFile)) {
        require_once $classFile;
        return;
    }
    
    // Si no se encontró, buscar en todos los archivos del directorio
    if (isset($directories[$classType]) && is_dir($directories[$classType])) {
        $dir = $directories[$classType];
        $files = scandir($dir);
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $filePath = $dir . $file;
            if (is_file($filePath) && pathinfo($filePath, PATHINFO_EXTENSION) === 'php') {
                // Verificar si el contenido del archivo contiene la definición de la clase
                $content = file_get_contents($filePath);
                if (strpos($content, "class $class") !== false || 
                    strpos($content, "class " . basename($file, '.php')) !== false) {
                    require_once $filePath;
                    return;
                }
            }
        }
    }
});
