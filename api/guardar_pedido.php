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

    // Recibir JSON del JS
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data || empty($data['carrito'])) {
        echo json_encode(["success" => false, "msg" => "Carrito vacío"]);
        exit;
    }

    $carrito = $data['carrito'];
    // Recibir la sucursal del JS (o usar 'norte' si falla)
    $sucursalDestino = isset($data['sucursal']) ? $data['sucursal'] : 'norte';
    
    $totalVenta = 0;
    $detallesTexto = "";

    // 1. Calcular total y actualizar stock
    foreach ($carrito as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $totalVenta += $subtotal;
        $detallesTexto .= "{$item['name']} (x{$item['quantity']}), ";
        
        // --- RESTA DE STOCK DINÁMICA ---
        $updateStock = "UPDATE inventario SET cantidad = cantidad - :cant 
                        WHERE id_producto = :id AND sucursal_id = :sucursal";
        
        $stmtStock = $pdo->prepare($updateStock);
        $stmtStock->execute([
            ':cant' => $item['quantity'], 
            ':id' => $item['id'],
            ':sucursal' => $sucursalDestino // Sucursal dinámica
        ]);
    }

    // 2. Insertar en la tabla DISTRIBUIDA 'ventas' Y OBTENER FOLIO
    // "RETURNING id_venta" obliga a Postgres a devolver el ID generado
    $sqlVenta = "INSERT INTO ventas (sucursal_id, cliente_nombre, total, detalles, estatus) 
                 VALUES (:sucursal, :cliente, :total, :detalles, 'PAGADO')
                 RETURNING id_venta";
    
    $stmt = $pdo->prepare($sqlVenta);
    $stmt->execute([
        ':sucursal' => $sucursalDestino,
        ':cliente'  => 'Cliente Web',
        ':total'    => $totalVenta,
        ':detalles' => rtrim($detallesTexto, ", ")
    ]);

    // Capturar el ID (Folio) que devolvió la base de datos
    $folio = $stmt->fetchColumn();

    // 3. Devolver respuesta completa al JavaScript
    echo json_encode([
        "success" => true, 
        "msg" => "Compra registrada correctamente",
        "folio" => $folio,            // <--- IMPORTANTE PARA EL TICKET
        "sucursal" => $sucursalDestino,
        "fecha" => date("Y-m-d H:i:s")
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "msg" => "Error BD: " . $e->getMessage()]);
}
?>