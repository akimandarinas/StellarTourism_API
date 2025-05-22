<?php
/*Funciones auxiliares para los controladores*/

function getDatabaseConnection() {
    // Usar el método getInstance en lugar de new Database()
    $database = Database::getInstance();
    return $database->getConnection();
}

function fixControllerDatabaseInstantiation($controllerFile) {
    if (!file_exists($controllerFile)) {
        return false;
    }
    
    $content = file_get_contents($controllerFile);
    
    // Buscar el patrón de creación incorrecta de Database
    $pattern = '/\$database\s*=\s*new\s+Database$$$$;/';
    $replacement = '$database = Database::getInstance();';
    
    // Reemplazar todas las ocurrencias
    $newContent = preg_replace($pattern, $replacement, $content);
    
    // Guardar el archivo modificado si hubo cambios
    if ($newContent !== $content) {
        file_put_contents($controllerFile, $newContent);
        return true;
    }
    
    return false;
}

function fixAllControllers($controllersDir) {
    $results = [];
    
    if (!is_dir($controllersDir)) {
        return ['error' => "El directorio $controllersDir no existe"];
    }
    
    $files = glob($controllersDir . '/*_controller.php');
    
    foreach ($files as $file) {
        $fileName = basename($file);
        $results[$fileName] = fixControllerDatabaseInstantiation($file);
    }
    
    return $results;
}
