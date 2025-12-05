<?php
require 'db.php';
header('Content-Type: application/json');

global $pdo;
/** @var PDO $pdo */  // ← quita el rojo en VS Code

$categoria = $_GET['categoria'] ?? '';
$busqueda  = $_GET['busqueda'] ?? '';
$ofertas   = $_GET['ofertas'] ?? '';

try {
    $sql = "SELECT p.*, COALESCE(SUM(i.cantidad), 0) AS stock_total
            FROM productos p
            LEFT JOIN inventario i ON p.id_producto = i.id_producto
            WHERE 1=1";

    $params = [];

    if (!empty($categoria)) {
        $sql .= " AND p.categoria = ?";
        $params[] = $categoria;
    }

    if (!empty($busqueda)) {
        $sql .= " AND p.nombre ILIKE ?";
        $params[] = "%$busqueda%";
    }

    if (!empty($ofertas) && $ofertas === 'true') {
        $sql .= " AND p.precio_oferta IS NOT NULL";
    }

    $sql .= " GROUP BY p.id_producto ORDER BY p.id_producto ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode($stmt->fetchAll());

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

