<?php
class Resena {
    // Conexión a la base de datos y nombre de la tabla
    private $conn;
    private $table_name = "RESENAS"; // Cambiado de "RESEÑAS" a "RESENAS" para evitar problemas con caracteres especiales

    // Propiedades del objeto
    public $ID;
    public $ID_USUARIO;
    public $ID_DESTINO;
    public $RATING;
    public $COMENTARIO;
    public $VERIFICADO;
    public $CREATED_AT;
    public $UPDATED_AT;

    // Constructor con $db como conexión a base de datos
    public function __construct($db) {
        $this->conn = $db;
    }

    // Leer todas las reseñas
    public function read() {
        // Query para seleccionar todos
        $query = "SELECT r.*, u.NOMBRE as USUARIO_NOMBRE, d.NOMBRE as DESTINO_NOMBRE
                  FROM " . $this->table_name . " r
                  JOIN USUARIOS u ON r.ID_USUARIO = u.ID
                  JOIN DESTINOS d ON r.ID_DESTINO = d.ID
                  ORDER BY r.CREATED_AT DESC";

        // Preparar query statement
        $stmt = $this->conn->prepare($query);

        // Ejecutar query
        $stmt->execute();

        return $stmt;
    }

    // Leer reseñas por destino
    public function readByDestination() {
        // Query para seleccionar reseñas de un destino
        $query = "SELECT r.*, u.NOMBRE as USUARIO_NOMBRE
                  FROM " . $this->table_name . " r
                  JOIN USUARIOS u ON r.ID_USUARIO = u.ID
                  WHERE r.ID_DESTINO = ?
                  ORDER BY r.CREATED_AT DESC";

        // Preparar query statement
        $stmt = $this->conn->prepare($query);

        // Bind ID del destino
        $stmt->bindParam(1, $this->ID_DESTINO);

        // Ejecutar query
        $stmt->execute();

        return $stmt;
    }

    // Leer reseñas por usuario
    public function readByUser() {
        // Query para seleccionar reseñas de un usuario
        $query = "SELECT r.*, d.NOMBRE as DESTINO_NOMBRE
                  FROM " . $this->table_name . " r
                  JOIN DESTINOS d ON r.ID_DESTINO = d.ID
                  WHERE r.ID_USUARIO = ?
                  ORDER BY r.CREATED_AT DESC";

        // Preparar query statement
        $stmt = $this->conn->prepare($query);

        // Bind ID del usuario
        $stmt->bindParam(1, $this->ID_USUARIO);

        // Ejecutar query
        $stmt->execute();

        return $stmt;
    }

    // Leer una sola reseña
    public function readOne() {
        // Query para leer un registro
        $query = "SELECT r.*, u.NOMBRE as USUARIO_NOMBRE, d.NOMBRE as DESTINO_NOMBRE
                  FROM " . $this->table_name . " r
                  JOIN USUARIOS u ON r.ID_USUARIO = u.ID
                  JOIN DESTINOS d ON r.ID_DESTINO = d.ID
                  WHERE r.ID = ?";

        // Preparar query statement
        $stmt = $this->conn->prepare($query);

        // Bind ID de la reseña a seleccionar
        $stmt->bindParam(1, $this->ID);

        // Ejecutar query
        $stmt->execute();

        // Obtener fila recuperada
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Asignar valores a propiedades del objeto
            $this->ID_USUARIO = $row['ID_USUARIO'];
            $this->ID_DESTINO = $row['ID_DESTINO'];
            $this->RATING = $row['RATING'];
            $this->COMENTARIO = $row['COMENTARIO'];
            $this->VERIFICADO = $row['VERIFICADO'];
            $this->CREATED_AT = $row['CREATED_AT'];
            $this->UPDATED_AT = $row['UPDATED_AT'];
            
            // Información adicional
            $this->USUARIO_NOMBRE = $row['USUARIO_NOMBRE'];
            $this->DESTINO_NOMBRE = $row['DESTINO_NOMBRE'];
            
            return true;
        }
        
        return false;
    }

    // Verificar si el usuario ya ha dejado una reseña para este destino
    public function checkExisting() {
        // Query para verificar
        $query = "SELECT ID FROM " . $this->table_name . " 
                  WHERE ID_USUARIO = ? AND ID_DESTINO = ?";

        // Preparar query statement
        $stmt = $this->conn->prepare($query);

        // Bind valores
        $stmt->bindParam(1, $this->ID_USUARIO);
        $stmt->bindParam(2, $this->ID_DESTINO);

        // Ejecutar query
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Crear una nueva reseña
    public function create() {
        // Query para insertar
        $query = "INSERT INTO " . $this->table_name . " 
                  SET ID_USUARIO=:ID_USUARIO, ID_DESTINO=:ID_DESTINO, 
                      RATING=:RATING, COMENTARIO=:COMENTARIO, 
                      VERIFICADO=:VERIFICADO, CREATED_AT=NOW()";

        // Preparar query
        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->COMENTARIO = htmlspecialchars(strip_tags($this->COMENTARIO));
        $this->VERIFICADO = htmlspecialchars(strip_tags($this->VERIFICADO));

        // Bind valores
        $stmt->bindParam(":ID_USUARIO", $this->ID_USUARIO);
        $stmt->bindParam(":ID_DESTINO", $this->ID_DESTINO);
        $stmt->bindParam(":RATING", $this->RATING);
        $stmt->bindParam(":COMENTARIO", $this->COMENTARIO);
        $stmt->bindParam(":VERIFICADO", $this->VERIFICADO);

        // Ejecutar query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Actualizar una reseña
    public function update() {
        // Query para actualizar
        $query = "UPDATE " . $this->table_name . " 
                  SET RATING=:RATING, COMENTARIO=:COMENTARIO, 
                      VERIFICADO=:VERIFICADO, UPDATED_AT=NOW() 
                  WHERE ID=:ID";

        // Preparar query
        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->COMENTARIO = htmlspecialchars(strip_tags($this->COMENTARIO));
        $this->VERIFICADO = htmlspecialchars(strip_tags($this->VERIFICADO));
        $this->ID = htmlspecialchars(strip_tags($this->ID));

        // Bind valores
        $stmt->bindParam(":RATING", $this->RATING);
        $stmt->bindParam(":COMENTARIO", $this->COMENTARIO);
        $stmt->bindParam(":VERIFICADO", $this->VERIFICADO);
        $stmt->bindParam(":ID", $this->ID);

        // Ejecutar query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Eliminar una reseña
    public function delete() {
        // Query para eliminar
        $query = "DELETE FROM " . $this->table_name . " WHERE ID = ?";

        // Preparar query
        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->ID = htmlspecialchars(strip_tags($this->ID));

        // Bind ID del registro a eliminar
        $stmt->bindParam(1, $this->ID);

        // Ejecutar query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }
}
