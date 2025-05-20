<?php
// Cargar variables de entorno
require_once __DIR__ . '/../config/env_loader.php';

// Mostrar errores en desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Definir la ruta base de la aplicación
define('BASE_PATH', dirname(__DIR__));

// Establecer encabezados para JSON
header('Content-Type: application/json');

// Verificar si se ha enviado un archivo SQL
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['sql_file'])) {
    $uploadedFile = $_FILES['sql_file'];
    
    // Verificar errores de carga
    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al cargar el archivo: ' . getUploadErrorMessage($uploadedFile['error'])
        ]);
        exit;
    }
    
    // Verificar tipo de archivo
    $fileType = mime_content_type($uploadedFile['tmp_name']);
    if ($fileType !== 'text/plain' && $fileType !== 'application/sql' && $fileType !== 'application/octet-stream') {
        echo json_encode([
            'status' => 'error',
            'message' => 'Tipo de archivo no válido. Se esperaba un archivo SQL.'
        ]);
        exit;
    }
    
    // Cargar configuración de la base de datos
    $dbHost = getenv('DB_HOST') ?: 'localhost';
    $dbName = getenv('DB_DATABASE') ?: 'stellar_tourism';
    $dbUser = getenv('DB_USERNAME') ?: 'root';
    $dbPass = getenv('DB_PASSWORD') ?: '';
    
    // Intentar importar el archivo SQL
    $output = [];
    $returnVar = 0;
    
    // Crear un archivo temporal con las credenciales
    $tmpCredentialsFile = tempnam(sys_get_temp_dir(), 'mysql_');
    file_put_contents($tmpCredentialsFile, "[client]\nuser={$dbUser}\npassword={$dbPass}\nhost={$dbHost}\n");
    
    // Comando para importar
    $command = "mysql --defaults-file={$tmpCredentialsFile} {$dbName} < " . escapeshellarg($uploadedFile['tmp_name']);
    
    // Ejecutar el comando
    exec($command . " 2>&1", $output, $returnVar);
    
    // Eliminar el archivo temporal de credenciales
    unlink($tmpCredentialsFile);
    
    if ($returnVar !== 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al importar la base de datos',
            'details' => implode("\n", $output)
        ]);
    } else {
        echo json_encode([
            'status' => 'success',
            'message' => 'Base de datos importada correctamente'
        ]);
    }
} else {
    // Mostrar formulario de carga
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Importar Base de Datos</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #333;
            }
            .form-group {
                margin-bottom: 15px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            input[type="file"] {
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                width: 100%;
            }
            button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            button:hover {
                background-color: #45a049;
            }
            .note {
                background-color: #f8f9fa;
                border-left: 4px solid #007bff;
                padding: 15px;
                margin-top: 20px;
            }
            #result {
                margin-top: 20px;
                padding: 15px;
                border-radius: 4px;
                display: none;
            }
            .success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            .error {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
        </style>
    </head>
    <body>
        <h1>Importar Base de Datos</h1>
        
        <form id="importForm" enctype="multipart/form-data">
            <div class="form-group">
                <label for="sql_file">Seleccionar archivo SQL:</label>
                <input type="file" id="sql_file" name="sql_file" accept=".sql" required>
            </div>
            
            <button type="submit">Importar Base de Datos</button>
        </form>
        
        <div id="result"></div>
        
        <div class="note">
            <h3>Nota:</h3>
            <p>Este script importará el archivo SQL seleccionado a la base de datos configurada en el archivo .env.</p>
            <p>Asegúrate de que el archivo SQL sea compatible con la estructura actual de la base de datos.</p>
        </div>
        
        <script>
            document.getElementById('importForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const resultDiv = document.getElementById('result');
                
                resultDiv.innerHTML = 'Importando base de datos...';
                resultDiv.className = '';
                resultDiv.style.display = 'block';
                
                fetch(window.location.href, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    resultDiv.innerHTML = data.message;
                    resultDiv.className = data.status === 'success' ? 'success' : 'error';
                    
                    if (data.details) {
                        const detailsPre = document.createElement('pre');
                        detailsPre.textContent = data.details;
                        resultDiv.appendChild(detailsPre);
                    }
                })
                .catch(error => {
                    resultDiv.innerHTML = 'Error: ' + error.message;
                    resultDiv.className = 'error';
                });
            });
        </script>
    </body>
    </html>
    <?php
    exit;
}

// Función para obtener mensaje de error de carga
function getUploadErrorMessage($errorCode) {
    switch ($errorCode) {
        case UPLOAD_ERR_INI_SIZE:
            return 'El archivo excede el tamaño máximo permitido por PHP.';
        case UPLOAD_ERR_FORM_SIZE:
            return 'El archivo excede el tamaño máximo permitido por el formulario.';
        case UPLOAD_ERR_PARTIAL:
            return 'El archivo se cargó parcialmente.';
        case UPLOAD_ERR_NO_FILE:
            return 'No se seleccionó ningún archivo.';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Falta la carpeta temporal.';
        case UPLOAD_ERR_CANT_WRITE:
            return 'No se pudo escribir el archivo en el disco.';
        case UPLOAD_ERR_EXTENSION:
            return 'Una extensión de PHP detuvo la carga del archivo.';
        default:
            return 'Error desconocido.';
    }
}
