<?php
// api/recibo.php
require 'db.php';
global $pdo;
/** @var PDO $pdo */

$id = $_GET['id'] ?? null;
if (!$id) { echo "ID de venta no especificado"; exit; }

$stmtV = $pdo->prepare("SELECT * FROM ventas WHERE id_venta = ?");
$stmtV->execute([$id]);
$venta = $stmtV->fetch(PDO::FETCH_ASSOC);
if (!$venta) { echo "Venta no encontrada"; exit; }

$stmtDet = $pdo->prepare("SELECT * FROM ventas_detalle WHERE id_venta = ?");
$stmtDet->execute([$id]);
$detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Recibo #<?=htmlspecialchars($venta['id_venta'])?></title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:20px auto;}
    h2{text-align:center}
    table{width:100%;border-collapse:collapse;margin-top:10px}
    th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}
    .total{font-weight:700;text-align:right;margin-top:10px}
    .small{font-size:0.85rem;color:#666}
    @media print { button{display:none} }
  </style>
</head>
<body>
  <h2>Tienda UGM - Recibo</h2>
  <p class="small">Venta #: <?=htmlspecialchars($venta['id_venta'])?><br>
     Fecha: <?=htmlspecialchars($venta['fecha'])?><br>
     Sucursal: <?=htmlspecialchars($venta['sucursal_id'])?><br>
     Cliente: <?=htmlspecialchars($venta['nombre_cliente'])?></p>

  <table>
    <thead><tr><th>Producto ID</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
    <tbody>
    <?php foreach($detalles as $d): ?>
      <tr>
        <td><?=htmlspecialchars($d['id_producto'])?></td>
        <td><?=htmlspecialchars($d['cantidad'])?></td>
        <td>$<?=number_format($d['precio_unit'],2)?></td>
        <td>$<?=number_format($d['precio_unit'] * $d['cantidad'],2)?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>

  <div class="total">TOTAL: $<?=number_format($venta['total'],2)?></div>

  <div style="margin-top:20px;text-align:center;">
    <button onclick="window.print()">Imprimir</button>
    <button onclick="window.close()">Cerrar</button>
  </div>
</body>
</html>
