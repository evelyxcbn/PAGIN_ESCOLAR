let cart = [];
let productosGlobales = [];

// ====== CARGAR PRODUCTOS ======
async function cargarProductos() {
    const res = await fetch('api/obtener_productos.php');
    const productos = await res.json();

    productosGlobales = productos;
    const grid = document.getElementById('grid-productos');
    grid.innerHTML = '';

    productos.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <h3>${p.nombre}</h3>
                <p>$${p.precio}</p>
                <button onclick="agregarAlCarrito(${p.id_producto})">Agregar</button>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', cargarProductos);

// ====== CARRITO ======
function agregarAlCarrito(id) {
    const prod = productosGlobales.find(p => p.id_producto == id);
    const existe = cart.find(i => i.id == id);

    if (existe) existe.qty++;
    else cart.push({ id, nombre: prod.nombre, precio: prod.precio, qty: 1 });

    actualizarCarrito();
}

function actualizarCarrito() {
    document.getElementById('cart-count').innerText =
        `Carrito (${cart.reduce((a,b)=>a+b.qty,0)})`;
}

function verCarrito() {
    renderizarCarrito();
    document.getElementById('modalCarrito').style.display = 'flex';
}

function cerrarCarrito() {
    document.getElementById('modalCarrito').style.display = 'none';
}

function renderizarCarrito() {
    const lista = document.getElementById('listaCarrito');
    lista.innerHTML = '';
    let total = 0;

    cart.forEach((p,i) => {
        total += p.precio * p.qty;
        lista.innerHTML += `
            <p>${p.nombre} x ${p.qty}
            <button onclick="eliminar(${i})">X</button></p>
        `;
    });

    document.getElementById('totalCarrito').innerText = total.toFixed(2);
}

function eliminar(i) {
    cart.splice(i,1);
    actualizarCarrito();
    renderizarCarrito();
}

function vaciarCarrito() {
    cart = [];
    actualizarCarrito();
    renderizarCarrito();
}

// ====== PROCESAR COMPRA ======
async function procesarCompra() {
    const res = await fetch('api/procesar_compra.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ carrito: cart })
    });

    const data = await res.json();

    if(data.success){
        alert("Compra registrada");
        vaciarCarrito();
        cerrarCarrito();
    } else {
        alert("Error al comprar");
    }
}
