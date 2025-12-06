<?php
header('Content-Type: application/json');

$conn = pg_connect("host=localhost dbname=tienda_coppel_escolar user=postgres password=Hobimore188");

$data = json_decode(file_get_contents("php://input"), true);
$carrito = $data['carrito'];

pg_query($conn, "BEGIN");

foreach($carrito as $item){
    $sql = "INSERT INTO ventas (producto_id, cantidad, precio)
            VALUES ($1, $2, $3)";

    $res = pg_query_params($conn, $sql, [
        $item['id'],
        $item['qty'],
        $item['precio']
    ]);

    if(!$res){
        pg_query($conn, "ROLLBACK");
        echo json_encode(["success"=>false]);
        exit;
    }
}

pg_query($conn, "COMMIT");
echo json_encode(["success"=>true]);
