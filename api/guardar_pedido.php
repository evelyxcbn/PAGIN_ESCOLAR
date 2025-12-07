<?php
header("Content-Type: application/json");

// Conexión
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
    $totalVenta = 0;
    $detallesTexto = "";

    // 1. Calcular total y preparar string de detalles
    foreach ($carrito as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $totalVenta += $subtotal;
        $detallesTexto .= "{$item['name']} (x{$item['quantity']}), ";
        
        // OPCIONAL: Aquí deberíamos restar stock. 
        // Como es distribuido, restaremos del nodo 'norte' para este ejemplo rápido.
        // Ojo: Esto actualizará la tabla remota 'inventario_local' en servidor_norte
        $updateStock = "UPDATE inventario SET cantidad = cantidad - :cant 
                        WHERE id_producto = :id AND sucursal_id = 'norte'";
        $stmtStock = $pdo->prepare($updateStock);
        $stmtStock->execute([':cant' => $item['quantity'], ':id' => $item['id']]);
    }

    // 2. Insertar en la tabla DISTRIBUIDA 'ventas'
    // Al especificar sucursal_id = 'norte', Postgres enviará esto a 'venta_norte' (servidor remoto)
    $sqlVenta = "INSERT INTO ventas (sucursal_id, cliente_nombre, total, detalles, estatus) 
                 VALUES (:sucursal, :cliente, :total, :detalles, 'PAGADO')";
    
    $stmt = $pdo->prepare($sqlVenta);
    $stmt->execute([
        ':sucursal' => 'norte', // Nodo predeterminado
        ':cliente'  => 'Cliente Web',
        ':total'    => $totalVenta,
        ':detalles' => rtrim($detallesTexto, ", ")
    ]);

    echo json_encode(["success" => true, "msg" => "Compra registrada en Nodo Norte"]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "msg" => "Error BD: " . $e->getMessage()]);
}
?>