<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response_utils.php';

header('Content-Type: application/json');

try {
    $conn = getConnection();
    
    // Obtener todas las tablas
    $tablesQuery = "SHOW TABLES";
    $tablesResult = $conn->query($tablesQuery);
    
    $tables = [];
    while ($table = $tablesResult->fetch(PDO::FETCH_NUM)) {
        $tableName = $table[0];
        
        // Obtener estructura de la tabla
        $structureQuery = "DESCRIBE $tableName";
        $structureResult = $conn->query($structureQuery);
        
        $columns = [];
        while ($column = $structureResult->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = $column;
        }
        
        // Obtener claves foráneas
        $foreignKeysQuery = "
            SELECT 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME 
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                TABLE_SCHEMA = DATABASE() AND 
                TABLE_NAME = '$tableName' AND 
                REFERENCED_TABLE_NAME IS NOT NULL
        ";
        $foreignKeysResult = $conn->query($foreignKeysQuery);
        
        $foreignKeys = [];
        while ($foreignKey = $foreignKeysResult->fetch(PDO::FETCH_ASSOC)) {
            $foreignKeys[] = $foreignKey;
        }
        
        $adapterCode = generateAdapterCode($tableName, $columns, $foreignKeys);
        
        $tables[$tableName] = [
            'columns' => $columns,
            'foreign_keys' => $foreignKeys,
            'adapter_code' => $adapterCode
        ];
    }
    
    $response = [
        'status' => 'success',
        'message' => 'Adaptadores generados correctamente',
        'tables' => $tables
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    sendErrorResponse('Error al generar adaptadores: ' . $e->getMessage());
}


function generateAdapterCode($tableName, $columns, $foreignKeys) {
    $className = ucfirst($tableName) . 'Adapter';
    $singularName = rtrim($tableName, 's'); // Convertir plural a singular (simple)
    
    $code = "<?php\n";
    $code .= "class $className {\n";
    $code .= "    private \$conn;\n\n";
    $code .= "    public function __construct(\$conn) {\n";
    $code .= "        \$this->conn = \$conn;\n";
    $code .= "    }\n\n";
    
    // Método getAll
    $code .= "    public function getAll() {\n";
    $code .= "        \$sql = \"SELECT * FROM $tableName\";\n";
    $code .= "        \$result = \$this->conn->query(\$sql);\n";
    $code .= "        \$items = [];\n\n";
    $code .= "        if (\$result->num_rows > 0) {\n";
    $code .= "            while (\$row = \$result->fetch_assoc()) {\n";
    $code .= "                \$items[] = \$row;\n";
    $code .= "            }\n";
    $code .= "        }\n\n";
    $code .= "        return \$items;\n";
    $code .= "    }\n\n";
    
    // Método getById
    $code .= "    public function getById(\$id) {\n";
    $code .= "        \$sql = \"SELECT * FROM $tableName WHERE id = ?\";\n";
    $code .= "        \$stmt = \$this->conn->prepare(\$sql);\n";
    $code .= "        \$stmt->bind_param(\"i\", \$id);\n";
    $code .= "        \$stmt->execute();\n";
    $code .= "        \$result = \$stmt->get_result();\n\n";
    $code .= "        if (\$result->num_rows > 0) {\n";
    $code .= "            return \$result->fetch_assoc();\n";
    $code .= "        }\n\n";
    $code .= "        return null;\n";
    $code .= "    }\n\n";
    
    // Método create
    $code .= "    public function create(\$data) {\n";
    $code .= "        \$columns = [];\n";
    $code .= "        \$placeholders = [];\n";
    $code .= "        \$types = '';\n";
    $code .= "        \$values = [];\n\n";
    $code .= "        foreach (\$data as \$key => \$value) {\n";
    $code .= "            if (\$key !== 'id') {\n";
    $code .= "                \$columns[] = \$key;\n";
    $code .= "                \$placeholders[] = '?';\n";
    $code .= "                \$types .= \$this->getParamType(\$key);\n";
    $code .= "                \$values[] = \$value;\n";
    $code .= "            }\n";
    $code .= "        }\n\n";
    $code .= "        \$columnsStr = implode(', ', \$columns);\n";
    $code .= "        \$placeholdersStr = implode(', ', \$placeholders);\n";
    $code .= "        \$sql = \"INSERT INTO $tableName (\$columnsStr) VALUES (\$placeholdersStr)\";\n\n";
    $code .= "        \$stmt = \$this->conn->prepare(\$sql);\n";
    $code .= "        \$stmt->bind_param(\$types, ...\$values);\n";
    $code .= "        \$result = \$stmt->execute();\n\n";
    $code .= "        if (\$result) {\n";
    $code .= "            return [\n";
    $code .= "                'id' => \$stmt->insert_id,\n";
    $code .= "                'success' => true\n";
    $code .= "            ];\n";
    $code .= "        }\n\n";
    $code .= "        return [\n";
    $code .= "            'success' => false,\n";
    $code .= "            'error' => \$stmt->error\n";
    $code .= "        ];\n";
    $code .= "    }\n\n";
    
    // Método update
    $code .= "    public function update(\$id, \$data) {\n";
    $code .= "        \$updates = [];\n";
    $code .= "        \$types = 'i'; // Para el ID\n";
    $code .= "        \$values = [];\n\n";
    $code .= "        foreach (\$data as \$key => \$value) {\n";
    $code .= "            if (\$key !== 'id') {\n";
    $code .= "                \$updates[] = \"\$key = ?\";\n";
    $code .= "                \$types .= \$this->getParamType(\$key);\n";
    $code .= "                \$values[] = \$value;\n";
    $code .= "            }\n";
    $code .= "        }\n\n";
    $code .= "        \$values[] = \$id; // Añadir ID al final\n";
    $code .= "        \$updatesStr = implode(', ', \$updates);\n";
    $code .= "        \$sql = \"UPDATE $tableName SET \$updatesStr WHERE id = ?\";\n\n";
    $code .= "        \$stmt = \$this->conn->prepare(\$sql);\n";
    $code .= "        \$stmt->bind_param(\$types, ...\$values);\n";
    $code .= "        \$result = \$stmt->execute();\n\n";
    $code .= "        return [\n";
    $code .= "            'success' => \$result,\n";
    $code .= "            'affected_rows' => \$stmt->affected_rows,\n";
    $code .= "            'error' => \$result ? null : \$stmt->error\n";
    $code .= "        ];\n";
    $code .= "    }\n\n";
    
    // Método delete
    $code .= "    public function delete(\$id) {\n";
    $code .= "        \$sql = \"DELETE FROM $tableName WHERE id = ?\";\n";
    $code .= "        \$stmt = \$this->conn->prepare(\$sql);\n";
    $code .= "        \$stmt->bind_param(\"i\", \$id);\n";
    $code .= "        \$result = \$stmt->execute();\n\n";
    $code .= "        return [\n";
    $code .= "            'success' => \$result,\n";
    $code .= "            'affected_rows' => \$stmt->affected_rows,\n";
    $code .= "            'error' => \$result ? null : \$stmt->error\n";
    $code .= "        ];\n";
    $code .= "    }\n\n";
    
    // Método auxiliar para determinar el tipo de parámetro
    $code .= "    private function getParamType(\$column) {\n";
    $code .= "        \$intColumns = ['id', 'capacidad', 'plazas_disponibles', 'duracion', 'tiempo_viaje', 'popularidad', 'numero_pasajeros', 'calificacion', 'cantidad'];\n";
    $code .= "        \$doubleColumns = ['precio', 'precio_base', 'precio_total', 'precio_unitario', 'monto', 'gravedad', 'velocidad', 'autonomia', 'distancia_tierra'];\n";
    $code .= "        \$boolColumns = ['incluye_equipo'];\n\n";
    $code .= "        if (in_array(\$column, \$intColumns) || strpos(\$column, '_id') !== false) {\n";
    $code .= "            return 'i'; // Integer\n";
    $code .= "        } else if (in_array(\$column, \$doubleColumns)) {\n";
    $code .= "            return 'd'; // Double\n";
    $code .= "        } else if (in_array(\$column, \$boolColumns)) {\n";
    $code .= "            return 'i'; // Boolean como Integer\n";
    $code .= "        } else {\n";
    $code .= "            return 's'; // String por defecto\n";
    $code .= "        }\n";
    $code .= "    }\n\n";
    
    // Métodos adicionales para relaciones
    if (!empty($foreignKeys)) {
        foreach ($foreignKeys as $foreignKey) {
            $relatedTable = $foreignKey['REFERENCED_TABLE_NAME'];
            $relatedColumn = $foreignKey['REFERENCED_COLUMN_NAME'];
            $localColumn = $foreignKey['COLUMN_NAME'];
            
            $relatedSingular = rtrim($relatedTable, 's'); // Convertir plural a singular (simple)
            $methodName = "getBy" . ucfirst($relatedSingular) . "Id";
            
            $code .= "\n    public function $methodName(\$" . $relatedSingular . "Id) {\n";
            $code .= "        \$sql = \"SELECT * FROM $tableName WHERE $localColumn = ?\";\n";
            $code .= "        \$stmt = \$this->conn->prepare(\$sql);\n";
            $code .= "        \$stmt->bind_param(\"i\", \$" . $relatedSingular . "Id);\n";
            $code .= "        \$stmt->execute();\n";
            $code .= "        \$result = \$stmt->get_result();\n";
            $code .= "        \$items = [];\n\n";
            $code .= "        if (\$result->num_rows > 0) {\n";
            $code .= "            while (\$row = \$result->fetch_assoc()) {\n";
            $code .= "                \$items[] = \$row;\n";
            $code .= "            }\n";
            $code .= "        }\n\n";
            $code .= "        return \$items;\n";
            $code .= "    }\n";
        }
    }
    
    $code .= "}\n";
    
    return $code;
}
?>
