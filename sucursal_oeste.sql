CREATE TABLE inventario_local (
    id_producto INT NOT NULL,
    sucursal_id VARCHAR(20),  
    cantidad INT NOT NULL,
    pasillo VARCHAR(10)
);

CREATE TABLE ventas_local (
    id_venta SERIAL PRIMARY KEY,
    sucursal_id VARCHAR(20),  
    cliente_nombre VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2),
    detalles TEXT, 
    estatus VARCHAR(20) DEFAULT 'PAGADO'
);