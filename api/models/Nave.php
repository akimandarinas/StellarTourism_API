<?php
class Nave {
    private $conn;
    private $table_name = "NAVES";
    
    public $ID;
    public $NOMBRE;
    public $CAPACIDAD;
    public $URL;
    public $ESPECIFICACIONES;
    public $CARACTERISTICAS;
    public $VELOCIDAD;
    public $TAMAÑO;
    public $PROPULSION;
    public $RANGO;
    public $IS_ACTIVE;
    public $CREATED_AT;
    public $UPDATED_AT;
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Leer todas las naves
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY NOMBRE";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
    
    // Leer una nave
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE ID = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->ID);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            // Asignar valores a las propiedades del objeto
            $this->NOMBRE = $row['NOMBRE'];
            $this->CAPACIDAD = $row['CAPACIDAD'];
            $this->URL = $row['URL'];
            $this->ESPECIFICACIONES = $row['ESPECIFICACIONES'];
            $this->CARACTERISTICAS = $row['CARACTERISTICAS'];
            $this->VELOCIDAD = $row['VELOCIDAD'];
            $this->TAMAÑO = $row['TAMAÑO'];
            $this->PROPULSION = $row['PROPULSION'];
            $this->RANGO = $row['RANGO'];
            $this->IS_ACTIVE = $row['IS_ACTIVE'];
            $this->CREATED_AT = $row['CREATED_AT'];
            $this->UPDATED_AT = $row['UPDATED_AT'];
            
            return true;
        }
        
        return false;
    }
    
    // Crear nave
    public function create() {
        // Consulta para insertar
        $query = "INSERT INTO " . $this->table_name . " 
                  (NOMBRE, CAPACIDAD, URL, ESPECIFICACIONES, CARACTERISTICAS, VELOCIDAD, TAMAÑO, PROPULSION, RANGO, IS_ACTIVE, CREATED_AT) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->conn->prepare($query);
        
        $this->NOMBRE = htmlspecialchars(strip_tags($this->NOMBRE));
        $this->CAPACIDAD = htmlspecialchars(strip_tags($this->CAPACIDAD));
        $this->URL = htmlspecialchars(strip_tags($this->URL));
        // No sanitizar JSON
        $this->VELOCIDAD = htmlspecialchars(strip_tags($this->VELOCIDAD));
        $this->TAMAÑO = htmlspecialchars(strip_tags($this->TAMAÑO));
        $this->PROPULSION = htmlspecialchars(strip_tags($this->PROPULSION));
        $this->RANGO = htmlspecialchars(strip_tags($this->RANGO));
        $this->IS_ACTIVE = htmlspecialchars(strip_tags($this->IS_ACTIVE));
        
        // Vincular valores
        $stmt->bindParam(1, $this->NOMBRE);
        $stmt->bindParam(2, $this->CAPACIDAD);
        $stmt->bindParam(3, $this->URL);
        $stmt->bindParam(4, $this->ESPECIFICACIONES);
        $stmt->bindParam(5, $this->CARACTERISTICAS);
        $stmt->bindParam(6, $this->VELOCIDAD);
        $stmt->bindParam(7, $this->TAMAÑO);
        $stmt->bindParam(8, $this->PROPULSION);
        $stmt->bindParam(9, $this->RANGO);
        $stmt->bindParam(10, $this->IS_ACTIVE);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET NOMBRE = ?, CAPACIDAD = ?, URL = ?, ESPECIFICACIONES = ?, CARACTERISTICAS = ?, 
                      VELOCIDAD = ?, TAMAÑO = ?, PROPULSION = ?, RANGO = ?, IS_ACTIVE = ?, UPDATED_AT = NOW() 
                  WHERE ID = ?";
        
        $stmt = $this->conn->prepare($query);
        
        $this->NOMBRE = htmlspecialchars(strip_tags($this->NOMBRE));
        $this->CAPACIDAD = htmlspecialchars(strip_tags($this->CAPACIDAD));
        $this->URL = htmlspecialchars(strip_tags($this->URL));
        // No sanitizar JSON
        $this->VELOCIDAD = htmlspecialchars(strip_tags($this->VELOCIDAD));
        $this->TAMAÑO = htmlspecialchars(strip_tags($this->TAMAÑO));
        $this->PROPULSION = htmlspecialchars(strip_tags($this->PROPULSION));
        $this->RANGO = htmlspecialchars(strip_tags($this->RANGO));
        $this->IS_ACTIVE = htmlspecialchars(strip_tags($this->IS_ACTIVE));
        $this->ID = htmlspecialchars(strip_tags($this->ID));
        
        // Vincular valores
        $stmt->bindParam(1, $this->NOMBRE);
        $stmt->bindParam(2, $this->CAPACIDAD);
        $stmt->bindParam(3, $this->URL);
        $stmt->bindParam(4, $this->ESPECIFICACIONES);
        $stmt->bindParam(5, $this->CARACTERISTICAS);
        $stmt->bindParam(6, $this->VELOCIDAD);
        $stmt->bindParam(7, $this->TAMAÑO);
        $stmt->bindParam(8, $this->PROPULSION);
        $stmt->bindParam(9, $this->RANGO);
        $stmt->bindParam(10, $this->IS_ACTIVE);
        $stmt->bindParam(11, $this->ID);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Eliminar nave
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE ID = ?";
        
        $stmt = $this->conn->prepare($query);
        $this->ID = htmlspecialchars(strip_tags($this->ID));
        $stmt->bindParam(1, $this->ID);
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Obtener imágenes de la nave
    public function getImages() {
        $query = "SELECT * FROM IMAGENES_NAVES WHERE ID_NAVES = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->ID);
        $stmt->execute();
        return $stmt;
    }
    
    public function getAmenities() {
        $query = "SELECT * FROM COMODIDADES_NAVE WHERE ID_NAVE = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->ID);
        $stmt->execute();
        return $stmt;
    }
}
