<?php
header("Content-Type: application/json");

// Conexión a la Base de Datos Central
$host = "localhost";
$db   = "tienda_escolar";
$user = "postgres";
$pass = "Hobimore188"; 

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta a la tabla DISTRIBUIDA 'ventas'
    // Al ser distribuida, PostgreSQL traerá automáticamente los datos de Norte, Sur, Este y Oeste
    $sql = "SELECT * FROM ventas ORDER BY id_venta DESC LIMIT 20";
    
    $stmt = $pdo->query($sql);
    $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($ventas);

} catch (PDOException $e) {
    // Si hay error, devolvemos un array vacío o el mensaje
    echo json_encode(["error" => $e->getMessage()]);
}
?>