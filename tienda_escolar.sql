-- 1. EXTENSIÓN PARA DISTRIBUCIÓN
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER servidor_norte FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname 'sucursal_norte', port '5432');
CREATE SERVER servidor_sur   FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname 'sucursal_sur', port '5432');
CREATE SERVER servidor_este  FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname 'sucursal_este', port '5432');
CREATE SERVER servidor_oeste FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname 'sucursal_oeste', port '5432');


CREATE USER MAPPING FOR postgres SERVER servidor_norte OPTIONS (user 'postgres', password 'Hobimore188');
CREATE USER MAPPING FOR postgres SERVER servidor_sur   OPTIONS (user 'postgres', password 'Hobimore188');
CREATE USER MAPPING FOR postgres SERVER servidor_este  OPTIONS (user 'postgres', password 'Hobimore188');
CREATE USER MAPPING FOR postgres SERVER servidor_oeste OPTIONS (user 'postgres', password 'Hobimore188');

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150),
    descripcion TEXT,
    precio DECIMAL(10, 2),
    precio_oferta DECIMAL(10, 2),
    categoria VARCHAR(50),
    imagen_url TEXT
);

-- Limpiar tabla productos por si acaso
TRUNCATE TABLE productos CASCADE;

INSERT INTO productos (nombre, descripcion, precio, precio_oferta, categoria, imagen_url) VALUES
-- COMPUTACIÓN
('Laptop HP Pavilion', 'Ryzen 5, 8GB RAM', 12500.00, 11000.00, 'Computación', 'https://m.media-amazon.com/images/I/71p-M3sPhhL.jpg'),
('Mouse Logitech G203', 'RGB Gamer', 450.00, 399.00, 'Computación', 'https://m.media-amazon.com/images/I/61UxfXTUyvL.jpg'),
('Teclado Mecánico Redragon', 'Kumara K552', 899.00, NULL, 'Computación', 'https://m.media-amazon.com/images/I/71cngLX2xuL.jpg'),
('Monitor Samsung 24"', 'FHD 75Hz', 2800.00, 2500.00, 'Computación', 'https://m.media-amazon.com/images/I/914WC+70b+L.jpg'),
('Disco SSD Kingston 480GB', 'SATA 3', 600.00, 550.00, 'Computación', 'https://m.media-amazon.com/images/I/91w02a8dMbL.jpg'),
('Memoria RAM 8GB DDR4', 'HyperX Fury', 750.00, NULL, 'Computación', 'https://m.media-amazon.com/images/I/51yoI59d-uL.jpg'),
('Webcam HD 1080p', 'Con micrófono', 400.00, 350.00, 'Computación', 'https://m.media-amazon.com/images/I/61xM2-q7enL.jpg'),

('Kit Arduino Uno R3', 'Con cable USB', 320.00, NULL, 'Electrónica', 'https://m.media-amazon.com/images/I/71S21-a3tJL.jpg'),
('Sensor Ultrasónico HC-SR04', 'Medidor distancia', 45.00, 35.00, 'Electrónica', 'https://m.media-amazon.com/images/I/41s7p2i4qOL.jpg'),
('Servomotor SG90', 'Micro servo 9g', 50.00, 40.00, 'Electrónica', 'https://m.media-amazon.com/images/I/51+r7J-y7DL.jpg'),
('Protoboard 830 Puntos', 'Para prototipos', 90.00, NULL, 'Electrónica', 'https://m.media-amazon.com/images/I/710Jq+2uHUL.jpg'),
('Cables Jumper Macho-Macho', 'Paquete 40 pzs', 60.00, 50.00, 'Electrónica', 'https://m.media-amazon.com/images/I/71b2fJz+jIL.jpg'),
('Módulo Bluetooth HC-05', 'Comunicación inalámbrica', 120.00, NULL, 'Electrónica', 'https://m.media-amazon.com/images/I/61b17+1oQIL.jpg'),
('Multímetro Digital', 'Básico escolar', 180.00, 150.00, 'Electrónica', 'https://m.media-amazon.com/images/I/71P4q+jYc+L.jpg'),

('Cuaderno Profesional', 'Cuadro chico 100 hojas', 35.00, 28.00, 'Papelería', 'https://m.media-amazon.com/images/I/61b-9+yT5BL.jpg'),
('Paquete Bolígrafos BIC', 'Negro/Azul/Rojo', 45.00, NULL, 'Papelería', 'https://m.media-amazon.com/images/I/81xXj2+qLWL.jpg'),
('Juego Geometría', 'Regla, escuadras, compás', 60.00, NULL, 'Papelería', 'https://m.media-amazon.com/images/I/71k+0+lq+XL.jpg'),
('Calculadora Casio', 'Científica fx-82MS', 250.00, 220.00, 'Papelería', 'https://m.media-amazon.com/images/I/71s6+2+yT5L.jpg'),
('Marcadores Sharpie', '12 colores', 180.00, 150.00, 'Papelería', 'https://m.media-amazon.com/images/I/81+m4+yT5L.jpg'),

('Mochila UGM Oficial', 'Color Negro/Dorado', 450.00, 400.00, 'Mochilas', 'https://m.media-amazon.com/images/I/91s+8+yT5L.jpg'),
('Funda Laptop 15.6"', 'Neopreno', 200.00, NULL, 'Accesorios', 'https://m.media-amazon.com/images/I/71t+9+yT5L.jpg'),
('Botella de Agua UGM', 'Metálica 1L', 150.00, 120.00, 'Accesorios', 'https://m.media-amazon.com/images/I/61u+3+yT5L.jpg'),
('Gorra UGM', 'Bordada', 180.00, NULL, 'Accesorios', 'https://m.media-amazon.com/images/I/81v+2+yT5L.jpg'),
('USB Kingston 64GB', '3.0 Metálica', 180.00, 140.00, 'Computación', 'https://m.media-amazon.com/images/I/61w+5+yT5L.jpg'),
('Tablet Samsung A7', 'Lite 32GB', 2800.00, 2400.00, 'Computación', 'https://m.media-amazon.com/images/I/71z+6+yT5L.jpg');

-- 5. TABLA DISTRIBUIDA DE INVENTARIO
CREATE TABLE inventario (
    id_producto INT,
    sucursal_id VARCHAR(20),
    cantidad INT,
    pasillo VARCHAR(10)
) PARTITION BY LIST (sucursal_id);

-- Conectar particiones de inventario
CREATE FOREIGN TABLE inv_norte PARTITION OF inventario FOR VALUES IN ('norte') SERVER servidor_norte OPTIONS (table_name 'inventario_local');
CREATE FOREIGN TABLE inv_sur   PARTITION OF inventario FOR VALUES IN ('sur')   SERVER servidor_sur   OPTIONS (table_name 'inventario_local');
CREATE FOREIGN TABLE inv_este  PARTITION OF inventario FOR VALUES IN ('este')  SERVER servidor_este  OPTIONS (table_name 'inventario_local');
CREATE FOREIGN TABLE inv_oeste PARTITION OF inventario FOR VALUES IN ('oeste') SERVER servidor_oeste OPTIONS (table_name 'inventario_local');

-- 6. TABLA DISTRIBUIDA DE VENTAS (PEDIDOS)
CREATE TABLE ventas (
    id_venta SERIAL,
    sucursal_id VARCHAR(20),
    cliente_nombre VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    detalles TEXT,
    estatus VARCHAR(20)
) PARTITION BY LIST (sucursal_id);

-- Conectar particiones de ventas
CREATE FOREIGN TABLE venta_norte PARTITION OF ventas FOR VALUES IN ('norte') SERVER servidor_norte OPTIONS (table_name 'ventas_local');
CREATE FOREIGN TABLE venta_sur   PARTITION OF ventas FOR VALUES IN ('sur')   SERVER servidor_sur   OPTIONS (table_name 'ventas_local');
CREATE FOREIGN TABLE venta_este  PARTITION OF ventas FOR VALUES IN ('este')  SERVER servidor_este  OPTIONS (table_name 'ventas_local');
CREATE FOREIGN TABLE venta_oeste PARTITION OF ventas FOR VALUES IN ('oeste') SERVER servidor_oeste OPTIONS (table_name 'ventas_local');

-- 7. DISTRIBUIR STOCK INICIAL
INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'norte', floor(random() * 20 + 1)::int, 'A1' FROM productos;

INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'sur', floor(random() * 15)::int, 'B2' FROM productos;

INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'este', floor(random() * 10)::int, 'C3' FROM productos;

INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'oeste', floor(random() * 10)::int, 'D4' FROM productos;

SELECT sucursal_id, COUNT(*) as total_productos
FROM inventario
GROUP BY sucursal_id;

SELECT * FROM inventario;



-- Verificar las últimas ventas registradas en todo el sistema
SELECT * FROM ventas 
WHERE sucursal_id = 'norte' 
ORDER BY fecha DESC 
LIMIT 7;


-- 1. LIMPIAR LA TABLA (Para evitar duplicados)
TRUNCATE TABLE productos CASCADE;

INSERT INTO productos (nombre, descripcion, precio, precio_oferta, categoria, imagen_url) VALUES
('Laptop HP Pavilion', 'Ryzen 5, 8GB RAM', 12500.00, 11000.00, 'Computación', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80'),
('Mouse Logitech G203', 'RGB Gamer', 450.00, 399.00, 'Computación', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'),
('Teclado Mecánico Redragon', 'Kumara K552', 899.00, NULL, 'Computación', 'https://images.unsplash.com/photo-1587829741301-dc798b91a607?w=600&q=80'),
('Monitor Samsung 24"', 'FHD 75Hz', 2800.00, 2500.00, 'Computación', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'),
('Disco SSD Kingston 480GB', 'SATA 3', 600.00, 550.00, 'Computación', 'https://images.unsplash.com/photo-1597872252123-15653baa9734?w=600&q=80'),
('Memoria RAM 8GB DDR4', 'HyperX Fury', 750.00, NULL, 'Computación', 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=80'),
('Webcam HD 1080p', 'Con micrófono', 400.00, 350.00, 'Computación', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'),
('USB Kingston 64GB', '3.0 Metálica', 180.00, 140.00, 'Computación', 'https://images.unsplash.com/photo-1620404494192-231a49c952dc?w=600&q=80'),
('Tablet Samsung A7', 'Lite 32GB', 2800.00, 2400.00, 'Computación', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80');

INSERT INTO productos (nombre, descripcion, precio, precio_oferta, categoria, imagen_url) VALUES
('Kit Arduino Uno R3', 'Con cable USB', 320.00, NULL, 'Electrónica', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&q=80'),
('Sensor Ultrasónico HC-SR04', 'Medidor distancia', 45.00, 35.00, 'Electrónica', 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80'),
('Servomotor SG90', 'Micro servo 9g', 50.00, 40.00, 'Electrónica', 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=600&q=80'),
('Protoboard 830 Puntos', 'Para prototipos', 90.00, NULL, 'Electrónica', 'https://images.unsplash.com/photo-1608538656722-6b9933457a46?w=600&q=80'),
('Cables Jumper Macho-Macho', 'Paquete 40 pzs', 60.00, 50.00, 'Electrónica', 'https://images.unsplash.com/photo-1563770095-39d468f9a51d?w=600&q=80'),
('Módulo Bluetooth HC-05', 'Comunicación inalámbrica', 120.00, NULL, 'Electrónica', 'https://images.unsplash.com/photo-1531297461136-82lw9z1w9?w=600&q=80'),
('Multímetro Digital', 'Básico escolar', 180.00, 150.00, 'Electrónica', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80');

INSERT INTO productos (nombre, descripcion, precio, precio_oferta, categoria, imagen_url) VALUES
('Cuaderno Profesional', 'Cuadro chico 100 hojas', 35.00, 28.00, 'Papelería', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80'),
('Paquete Bolígrafos BIC', 'Negro/Azul/Rojo', 45.00, NULL, 'Papelería', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&q=80'),
('Juego Geometría', 'Regla, escuadras, compás', 60.00, NULL, 'Papelería', 'https://images.unsplash.com/photo-1582140164627-897e9309c0aa?w=600&q=80'),
('Calculadora Casio', 'Científica fx-82MS', 250.00, 220.00, 'Papelería', 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=600&q=80'),
('Marcadores Sharpie', '12 colores', 180.00, 150.00, 'Papelería', 'https://images.unsplash.com/photo-1515286576774-4b53e8f80479?w=600&q=80');

INSERT INTO productos (nombre, descripcion, precio, precio_oferta, categoria, imagen_url) VALUES
('Mochila UGM Oficial', 'Color Negro/Dorado', 450.00, 400.00, 'Mochilas', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'),
('Funda Laptop 15.6"', 'Neopreno', 200.00, NULL, 'Accesorios', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80'),
('Botella de Agua UGM', 'Metálica 1L', 150.00, 120.00, 'Accesorios', 'https://images.unsplash.com/photo-1602143407151-01114195bc51?w=600&q=80'),
('Gorra UGM', 'Bordada', 180.00, NULL, 'Accesorios', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80');

-- Repartir stock aleatorio en los nodos remotos
INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'norte', floor(random() * 20 + 1)::int, 'A1' FROM productos;

INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'sur', floor(random() * 15)::int, 'B2' FROM productos;

INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'este', floor(random() * 10)::int, 'C3' FROM productos;

INSERT INTO inventario (id_producto, sucursal_id, cantidad, pasillo)
SELECT id_producto, 'oeste', floor(random() * 10)::int, 'D4' FROM productos;

SELECT sucursal_id, COUNT(*) as total_productos, SUM(cantidad) as stock_total
FROM inventario
GROUP BY sucursal_id;

SELECT nombre, imagen_url 
FROM productos 
LIMIT 5;

UPDATE productos 
SET imagen_url = 'img/teclado redragon.jpg' 
WHERE nombre LIKE '%Teclado Mecánico%';

UPDATE productos 
SET imagen_url = 'im/teclado redragon.jpg' 
WHERE nombre LIKE '%Teclado Mecánico Redragon%';

SELECT * FROM ventas 
WHERE sucursal_id = 'norte' 
ORDER BY fecha DESC 
LIMIT 10;

SELECT * FROM ventas 
WHERE sucursal_id = 'este' 
ORDER BY fecha DESC 
LIMIT 5;

SELECT * FROM ventas 
WHERE sucursal_id = 'sur' 
ORDER BY fecha DESC 
LIMIT 5;

UPDATE productos 
SET imagen_url = 'im/ssd.jpg' 
WHERE nombre LIKE '%Disco SSD Kingston 480GB%';

UPDATE productos 
SET imagen_url = 'im/memoria.jpg' 
WHERE nombre LIKE '%USB Kingston 64GB%';

UPDATE productos 
SET imagen_url = 'im/sensor.jpg' 
WHERE nombre LIKE '%Sensor Ultrasónico HC-SR04%';

UPDATE productos 
SET imagen_url = 'im/protoboard.jpg' 
WHERE nombre LIKE '%Protoboard 830 Puntos%';

UPDATE productos 
SET imagen_url = 'im/sg90.jpg' 
WHERE nombre LIKE '%Servomotor SG90%';

UPDATE productos 
SET imagen_url = 'im/jumper.jpg' 
WHERE nombre LIKE '%Cables Jumper Macho-Macho%';

UPDATE productos 
SET imagen_url = 'im/modulo.jpg' 
WHERE nombre LIKE '%Módulo Bluetooth HC-05%';

UPDATE productos 
SET imagen_url = 'im/multimetro.jpg' 
WHERE nombre LIKE '%Multímetro Digital%';

UPDATE productos 
SET imagen_url = 'im/botella.jpg' 
WHERE nombre LIKE '%Botella de Agua UGM%';

UPDATE productos 
SET imagen_url = 'im/marcadores.jpg' 
WHERE nombre LIKE '%Marcadores Sharpie%';

UPDATE productos 
SET imagen_url = 'im/calculadora.jpg' 
WHERE nombre LIKE '%Calculadora Casio%';

UPDATE productos 
SET imagen_url = 'im/cuaderno.jpg' 
WHERE nombre LIKE '%Cuaderno Profesional%';

UPDATE productos 
SET imagen_url = 'im/geometria.jpg' 
WHERE nombre LIKE '%Juego Geometría%';

UPDATE productos 
SET imagen_url = 'im/monitor.jpg' 
WHERE nombre LIKE '%Monitor Samsung 24"%';

UPDATE productos 
SET imagen_url = 'im/hp.png' 
WHERE nombre LIKE '%Laptop HP Pavilion%';

UPDATE productos 
SET imagen_url = 'im/funda.jpg' 
WHERE nombre LIKE '%Funda Laptop 15.6"%';

UPDATE productos 
SET imagen_url = 'im/kit.jpg' 
WHERE nombre LIKE '%Kit Arduino Uno R3%';

SELECT * FROM ventas 
WHERE sucursal_id = 'oeste' 
ORDER BY fecha DESC 
LIMIT 7;
