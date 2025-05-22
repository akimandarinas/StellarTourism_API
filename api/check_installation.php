<?php
// Mostrar todos los errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Verificación de la instalación de StellarTourism API</h1>";

// Verificar versión de PHP
echo "<h2>Versión de PHP</h2>";
echo "Versión actual: " . phpversion();
echo "<br>Requerida: 8.0 o superior";
echo "<br>Estado: " . (version_compare(phpversion(), '8.0.0', '>=') ? '<span style="color:green">OK</span>' : '<span style="color:red">ERROR</span>');

// Verificar extensiones requeridas
echo "<h2>Extensiones  : '<span style="color:red">ERROR</span>');
echo "<h2>Extensiones PHP requeridas</h2>";
$required_extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'curl', 'fileinfo'];
$missing_extensions = [];

echo "<ul>";
foreach ($required_extensions as $ext) {
    $loaded = extension_loaded($ext);
    echo "<li>$ext: " . ($loaded ? '<span style="color:green">Cargada</span>' : '<span style="color:red">No cargada</span>') . "</li>";
    if (!$loaded) {
        $missing_extensions[] = $ext;
    }
}
echo "</ul>";

if (!empty($missing_extensions)) {
    echo '<div style="color:red">Faltan extensiones requeridas. Por favor, habilítalas en tu php.ini.</div>';
}

// Verificar conexión a la base de datos
echo "<h2>Conexión a la base de datos</h2>";
try {
    require_once 'config/config.php';
    require_once 'config/database.php';
    
    $database = new Database();
    $conn = $database->getConnection();
    
    echo '<div style="color:green">Conexión a la base de datos establecida correctamente.</div>';
    
    // Verificar tablas
    echo "<h3>Tablas en la base de datos</h3>";
    $tables = ['usuarios', 'destinos', 'naves', 'rutas', 'actividades', 'reservas', 'actividades_reservadas', 'pagos', 'resenas'];
    $missing_tables = [];
    
    echo "<ul>";
    foreach ($tables as $table) {
        $stmt = $conn->prepare("SHOW TABLES LIKE :table");
        $stmt->bindParam(':table', $table);
        $stmt->execute();
        $exists = $stmt->rowCount() > 0;
        
        echo "<li>$table: " . ($exists ? '<span style="color:green">Existe</span>' : '<span style="color:red">No existe</span>') . "</li>";
        if (!$exists) {
            $missing_tables[] = $table;
        }
    }
    echo "</ul>";
    
    if (!empty($missing_tables)) {
        echo '<div style="color:red">Faltan tablas en la base de datos. Por favor, importa el archivo SQL.</div>';
    }
    
} catch (Exception $e) {
    echo '<div style="color:red">Error al conectar con la base de datos: ' . $e->getMessage() . '</div>';
}

// Verificar directorios y permisos
echo "<h2>Directorios y permisos</h2>";
$directories = [
    'logs' => __DIR__ . '/logs',
    'uploads' => __DIR__ . '/uploads',
    'uploads/destinos' => __DIR__ . '/uploads/destinos',
    'uploads/naves' => __DIR__ . '/uploads/naves',
    'uploads/usuarios' => __DIR__ . '/uploads/usuarios'
];

echo "<ul>";
foreach ($directories as $name => $dir) {
    $exists = file_exists($dir);
    $writable = is_writable($dir);
    
    echo "<li>$name: " . 
         ($exists ? '<span style="color:green">Existe</span>' : '<span style="color:red">No existe</span>') . 
         " - " . 
         ($writable ? '<span style="color:green">Escribible</span>' : '<span style="color:red">No escribible</span>') . 
         "</li>";
}
echo "</ul>";

// Verificar configuración de Apache
echo "<h2>Configuración de Apache</h2>";
$mod_rewrite = in_array('mod_rewrite', apache_get_modules());
echo "mod_rewrite: " . ($mod_rewrite ? '<span style="color:green">Habilitado</span>' : '<span style="color:red">No habilitado</span>');

// Resumen
echo "<h2>Resumen</h2>";
$all_ok = 
    version_compare(phpversion(), '8.0.0', '>=') && 
    empty($missing_extensions) && 
    empty($missing_tables) && 
    $mod_rewrite;

if ($all_ok) {
    echo '<div style="color:green; font-size: 18px;">¡Todo está correctamente configurado! La aplicación debería funcionar sin problemas.</div>';
} else {
    echo '<div style="color:orange; font-size: 18px;">Hay algunos problemas que necesitan ser resueltos antes de que la aplicación funcione correctamente.</div>';
}

// Información adicional
echo "<h2>Información del sistema</h2>";
echo "<ul>";
echo "<li>Sistema operativo: " . PHP_OS . "</li>";
echo "<li>Servidor web: " . $_SERVER['SERVER_SOFTWARE'] . "</li>";
echo "<li>Directorio raíz: " . $_SERVER['DOCUMENT_ROOT'] . "</li>";
echo "<li>URI de la solicitud: " . $_SERVER['REQUEST_URI'] . "</li>";
echo "</ul>";

// Verificar dependencias
include_once __DIR__ . '/check_dependencies.php';
