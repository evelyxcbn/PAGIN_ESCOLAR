<?php
require 'db.php'; 
header('Content-Type: application/json');

global $pdo;
/** @var PDO $pdo */  // ← quita el rojo en VS Code

$term = $_GET['q'] ?? '';

if (empty($term)) {
    echo json_encode([]);
    exit;
}

try {
    $sql = "SELECT p.nombre, i.sucursal_id, i.cantidad, i.pasillo 
            FROM productos p
            JOIN inventario i ON p.id_producto = i.id_producto
            WHERE p.nombre ILIKE ?
            ORDER BY p.nombre, i.sucursal_id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(["%$term%"]);

    echo json_encode($stmt->fetchAll());

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
