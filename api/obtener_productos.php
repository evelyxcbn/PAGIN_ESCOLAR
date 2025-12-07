<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Configuración de Conexión a la CENTRAL (tienda_escolar)
$host = "localhost";
$db   = "tienda_escolar";
$user = "postgres";
$pass = "Hobimore188"; // Tu contraseña

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Búsqueda o Filtros
    $where = "";
    $params = [];

    if (isset($_GET['categoria'])) {
        $where = "WHERE p.categoria = :cat";
        $params[':cat'] = $_GET['categoria'];
    } elseif (isset($_GET['busqueda'])) {
        $where = "WHERE p.nombre ILIKE :busq";
        $params[':busq'] = "%" . $_GET['busqueda'] . "%";
    } elseif (isset($_GET['ofertas'])) {
        $where = "WHERE p.precio_oferta IS NOT NULL";
    }

    // QUERY MAESTRO:
    // Une productos (local) con inventario (distribuido)
    // Suma la cantidad de todas las particiones (norte, sur, este, oeste)
    $sql = "SELECT 
                p.id_producto, 
                p.nombre, 
                p.precio, 
                p.precio_oferta, 
                p.imagen_url, 
                p.categoria,
                COALESCE(SUM(i.cantidad), 0) as stock_total
            FROM productos p
            LEFT JOIN inventario i ON p.id_producto = i.id_producto
            $where
            GROUP BY p.id_producto, p.nombre, p.precio, p.precio_oferta, p.imagen_url, p.categoria
            ORDER BY p.id_producto ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($productos);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
}
?>