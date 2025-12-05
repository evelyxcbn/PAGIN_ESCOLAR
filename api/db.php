<?php
// api/db.php

// DATOS DE CONEXIÓN
$host = 'localhost';
$db   = 'tienda_escolar'; // Asegúrate que en pgAdmin se llame así
$user = 'postgres';
$pass = 'Hobimore188';    
$port = '5432';

$pdo = null;

try {
    // Conexión directa (sin class) para que funcione en todos los archivos
    $dsn = "pgsql:host=$host;port=$port;dbname=$db";
    $pdo = new PDO($dsn, $user, $pass);
    
    // Configuración para que avise si hay errores
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // Aquí corregimos el error de sintaxis del punto (.)
    die("Error de conexión a BD: " . $e->getMessage());
}
?>