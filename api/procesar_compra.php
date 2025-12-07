<?php
// api/procesar_compra.php
require 'db.php';
header('Content-Type: application/json');

global $pdo;
/** @var PDO $pdo */

$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input['carrito']) || !is_array($input['carrito'])) {
    echo json_encode(['success' => false, 'error' => 'Datos de compra inválidos']);
    exit;
}

// cliente y sucursal opcionales (puedes adaptarlos desde el frontend)
$cliente = $input['cliente'] ?? 'Cliente Web';
$sucursal = $input['sucursal'] ?? 'norte'; // default: 'norte'

try {
    $pdo->beginTransaction();

    // Calcular total y validar stock por cada item
    $total = 0.0;
    foreach ($input['carrito'] as $item) {
        // esquema del carrito: { id:..., cantidad:..., precio:... } o según tu frontend
        $prodId = $item['id'] ?? ($item['id_producto'] ?? null);
        $qty = intval($item['quantity'] ?? $item['qty'] ?? $item['cantidad'] ?? 0);
        $precio = floatval($item['price'] ?? $item['precio'] ?? 0);

        if (!$prodId || $qty <= 0) {
            throw new Exception("Producto inválido en carrito");
        }

        $total += $precio * $qty;

        // Bloqueamos la fila de inventario para evitar carrera (SELECT ... FOR UPDATE)
        $stmtInv = $pdo->prepare("SELECT cantidad FROM inventario WHERE id_producto = ? AND sucursal_id = ? FOR UPDATE");
        $stmtInv->execute([$prodId, $sucursal]);
        $row = $stmtInv->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            throw new Exception("Producto {$prodId} no disponible en sucursal {$sucursal}");
        }

        $stockActual = intval($row['cantidad']);
        if ($stockActual < $qty) {
            throw new Exception("Stock insuficiente para el producto ID {$prodId} (disponible: {$stockActual})");
        }
    }

    // 1) Insertar la venta y obtener id_venta
    $stmtVenta = $pdo->prepare("INSERT INTO ventas (nombre_cliente, total, sucursal_id) VALUES (?, ?, ?) RETURNING id_venta");
    $stmtVenta->execute([$cliente, $total, $sucursal]);
    $idVenta = $stmtVenta->fetchColumn();

    // 2) Insertar detalles y descontar stock
    $stmtDet = $pdo->prepare("INSERT INTO ventas_detalle (id_venta, id_producto, cantidad, precio_unit) VALUES (?, ?, ?, ?)");
    $stmtUpdateStock = $pdo->prepare("UPDATE inventario SET cantidad = cantidad - ? WHERE id_producto = ? AND sucursal_id = ?");

    foreach ($input['carrito'] as $item) {
        $prodId = $item['id'] ?? ($item['id_producto'] ?? null);
        $qty = intval($item['quantity'] ?? $item['qty'] ?? $item['cantidad'] ?? 0);
        $precio = floatval($item['price'] ?? $item['precio'] ?? 0);

        $stmtDet->execute([$idVenta, $prodId, $qty, $precio]);
        $stmtUpdateStock->execute([$qty, $prodId, $sucursal]);
    }

    $pdo->commit();

    echo json_encode(['success' => true, 'id_venta' => $idVenta]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

