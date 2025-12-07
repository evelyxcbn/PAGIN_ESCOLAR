<?php
// api/ventas_historial.php
require 'db.php';
header('Content-Type: application/json');
global $pdo; /** @var PDO $pdo */

try {
    $stmt = $pdo->query("SELECT id_venta, nombre_cliente, total, sucursal_id, fecha FROM ventas ORDER BY fecha DESC LIMIT 100");
    $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true, 'ventas'=>$ventas]);
} catch (Exception $e) {
    echo json_encode(['success'=>false, 'error'=>$e->getMessage()]);
}
