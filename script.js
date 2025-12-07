// ==========================================
// VARIABLES GLOBALES
// ==========================================
let cart = [];
let productosGlobales = [];
let slideIndex = 0;

// ==========================================
// INICIALIZACIÓN (AL CARGAR LA PÁGINA)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar catálogo inicial
    cargarProductos(''); 
    
    // 2. Iniciar Carrusel Automático
    setInterval(() => moverCarrusel(1), 5000); 
});

// ==========================================
// 1. LÓGICA DEL CARRUSEL (PUBLICIDAD)
// ==========================================
function moverCarrusel(n) {
    const slides = document.querySelectorAll('.carousel-item');
    slideIndex += n;
    
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    
    // Validación por si el elemento no existe aún en el DOM
    const track = document.getElementById('carouselSlide');
    if(track) track.style.transform = `translateX(-${slideIndex * 100}%)`;
}

// ==========================================
// 2. CATÁLOGO Y PRODUCTOS (CONEXIÓN BD)
// ==========================================
async function cargarProductos(filtro) {
    let url = 'api/obtener_productos.php?';
    const titulo = document.getElementById('titulo-productos');

    // Configurar título y URL según filtro
    if(filtro === 'Ofertas') {
        url += 'ofertas=true';
        titulo.innerText = 'Mejores Ofertas';
    } else if (filtro) {
        url += `categoria=${filtro}`;
        titulo.innerText = `Departamento: ${filtro}`;
    } else {
        titulo.innerText = 'Catálogo Completo';
    }

    const grid = document.getElementById('grid-productos');
    grid.innerHTML = '<div class="loader">Cargando inventario distribuido...</div>';

    try {
        const res = await fetch(url);
        const productos = await res.json();
        
        // Guardamos copia global para el carrito
        productosGlobales = productos;
        grid.innerHTML = '';

        if(productos.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">No hay productos en esta categoría.</p>';
            return;
        }

        // Renderizar Tarjetas (Diseño Premium)
        productos.forEach(prod => {
            const pNormal = parseFloat(prod.precio);
            const pOferta = prod.precio_oferta ? parseFloat(prod.precio_oferta) : null;
            
            let precioHTML = pOferta 
                ? `<div class="price-main">$${pOferta.toFixed(2)}</div>
                   <div class="price-old">$${pNormal.toFixed(2)}</div>`
                : `<div class="price-main">$${pNormal.toFixed(2)}</div>`;

            // Verificamos si hay stock global
            const stockMsg = prod.stock_total > 0 
                ? `<span style="color:green"><i class="fas fa-check-circle"></i> Disponible (${prod.stock_total})</span>`
                : `<span style="color:red"><i class="fas fa-times-circle"></i> Agotado</span>`;

            const btnDisabled = prod.stock_total > 0 ? '' : 'disabled style="background:#ccc; cursor:not-allowed;"';

            const card = `
                <div class="product-card">
                    <img src="${prod.imagen_url}" class="product-img" onerror="this.src='https://via.placeholder.com/200'">
                    <div class="product-info">
                        <h3 class="product-title">${prod.nombre}</h3>
                        <div class="price-container">${precioHTML}</div>
                        <p style="font-size:0.8rem; margin-bottom:10px;">${stockMsg}</p>
                        <button class="btn-add" onclick="agregarAlCarrito(${prod.id_producto})" ${btnDisabled}>
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            `;
            grid.innerHTML += card;
        });

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p>Error al conectar con la base de datos.</p>';
    }
}

// Búsqueda desde la barra superior
function buscarProductosGlobal() {
    const term = document.getElementById('searchInput').value;
    if(term) {
        document.getElementById('titulo-productos').innerText = `Resultados para: "${term}"`;
        // Reutilizamos la lógica llamando a la API con el parámetro busqueda
        fetch(`api/obtener_productos.php?busqueda=${term}`)
            .then(res => res.json())
            .then(productos => {
                const grid = document.getElementById('grid-productos');
                grid.innerHTML = '';
                productosGlobales = productos;
                
                if(productos.length === 0) {
                    grid.innerHTML = '<p>No se encontraron productos.</p>';
                    return;
                }

                productos.forEach(prod => {
                    const pNormal = parseFloat(prod.precio);
                    const card = `
                        <div class="product-card">
                            <img src="${prod.imagen_url}" class="product-img">
                            <div class="product-info">
                                <h3 class="product-title">${prod.nombre}</h3>
                                <div class="price-container"><div class="price-main">$${pNormal.toFixed(2)}</div></div>
                                <button class="btn-add" onclick="agregarAlCarrito(${prod.id_producto})">Agregar</button>
                            </div>
                        </div>`;
                    grid.innerHTML += card;
                });
            });
    }
}

// ==========================================
// 3. CARRITO DE COMPRAS (Funcionalidad Completa)
// ==========================================

// Agregar item al array cart
function agregarAlCarrito(id) {
    const prod = productosGlobales.find(p => p.id_producto == id);
    const existe = cart.find(item => item.id == id);
    
    if(existe) {
        existe.quantity++;
    } else {
        const precioReal = prod.precio_oferta ? prod.precio_oferta : prod.precio;
        cart.push({
            id: prod.id_producto,
            name: prod.nombre,
            price: parseFloat(precioReal),
            quantity: 1,
            img: prod.imagen_url // Guardamos la imagen para mostrarla en el carrito
        });
    }
    actualizarCarritoUI();
    
    // Animación visual del botón
    const btn = event.target;
    if(btn) {
        const textoOriginal = btn.innerText;
        btn.innerText = "¡Agregado!";
        btn.style.background = "#2e7d32";
        setTimeout(() => { btn.innerText = textoOriginal; btn.style.background = ""; }, 1000);
    }
}

// Actualizar contador del header
function actualizarCarritoUI() {
    const count = cart.reduce((a,b)=>a+b.quantity,0);
    document.getElementById('cart-count').innerText = `Carrito (${count})`;
}

// Abrir Modal y Renderizar
function verCarrito() {
    const modal = document.getElementById('modalCarrito');
    if(modal) {
         renderizarListaCarrito();
         modal.style.display = 'flex';
    } else {
        alert("Error: No se encuentra el modal del carrito en el HTML.");
    }
}

// Cerrar Modal
function cerrarModalCarrito() {
    document.getElementById('modalCarrito').style.display = 'none';
}

// Generar HTML de la tabla del carrito
function renderizarListaCarrito() {
    const container = document.getElementById('lista-carrito'); // <tbody> en el HTML
    const totalSpan = document.getElementById('total-carrito');
    
    if(!container || !totalSpan) return;

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Tu carrito está vacío 🛒</td></tr>';
        totalSpan.innerText = '0.00';
        return;
    }

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = `
            <tr>
                <td style="display:flex; align-items:center; gap:10px;">
                    <img src="${item.img}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                    ${item.name}
                </td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    </div>
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-remove" onclick="eliminarDelCarrito(${item.id})" style="background:red; color:white; border:none; border-radius:4px; padding:5px 10px; cursor:pointer;">&times;</button>
                </td>
            </tr>
        `;
        container.innerHTML += row;
    });

    totalSpan.innerText = total.toFixed(2);
}

// Modificar cantidad (+ o -)
function cambiarCantidad(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            eliminarDelCarrito(id);
        } else {
            actualizarCarritoUI();
            renderizarListaCarrito();
        }
    }
}

// Eliminar un producto específico
function eliminarDelCarrito(id) {
    cart = cart.filter(i => i.id !== id);
    actualizarCarritoUI();
    renderizarListaCarrito();
}

// Vaciar todo el carrito
function vaciarCarrito() {
    if(confirm('¿Estás seguro de vaciar el carrito?')) {
        cart = [];
        actualizarCarritoUI();
        renderizarListaCarrito();
    }
}

// ==========================================
// FUNCIÓN DE PAGO REAL (CONECTADA A BD)
// ==========================================
async function procesarCompra() {
    if(cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    // Feedback visual en el botón
    const btn = event.target; 
    const textoOriginal = btn ? btn.innerText : 'Pagar';
    if(btn) {
        btn.innerText = "Procesando...";
        btn.disabled = true;
    }

    try {
        // Enviamos el carrito al Backend
        const res = await fetch('api/guardar_pedido.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ carrito: cart })
        });

        const data = await res.json();

        if(data.success) {
            alert("¡Compra Exitosa! " + data.msg);
            
            // Limpieza
            cart = []; 
            actualizarCarritoUI(); 
            cerrarModalCarrito(); 
            
            // Importante: Recargar productos para ver que bajó el stock
            cargarProductos(''); 
        } else {
            alert("Error al procesar: " + data.msg);
        }

    } catch (e) {
        console.error(e);
        alert("Error de conexión con el servidor.");
    } finally {
        // Restaurar botón
        if(btn) {
            btn.innerText = textoOriginal;
            btn.disabled = false;
        }
    }
}

// ==========================================
// 4. ADMINISTRADOR (LOGIN & BÚSQUEDA DISTRIBUIDA)
// ==========================================
function abrirLoginAdmin() {
    document.getElementById('modalLogin').style.display = 'flex';
}

function cerrarModalLogin() {
    document.getElementById('modalLogin').style.display = 'none';
}

function validarLogin() {
    const u = document.getElementById('userAdmin').value;
    const p = document.getElementById('passAdmin').value;

    if(u === 'admin' && p === 'admin123') {
        document.getElementById('modalLogin').style.display = 'none';
        document.getElementById('modalPanelAdmin').style.display = 'flex';
        // Limpiar campos
        document.getElementById('userAdmin').value = '';
        document.getElementById('passAdmin').value = '';
        document.getElementById('loginError').style.display = 'none';
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function cerrarSesion() {
    document.getElementById('modalPanelAdmin').style.display = 'none';
    // Limpiar resultados anteriores
    document.getElementById('stockResults').innerHTML = '<p style="color:#777; font-style:italic;">Busque un producto...</p>';
    document.getElementById('stockSearch').value = '';
}

// BÚSQUEDA DE STOCK EN NODOS (Norte, Sur, Este, Oeste)
async function buscarStockAdmin() {
    const term = document.getElementById('stockSearch').value;
    const resultsDiv = document.getElementById('stockResults');
    
    if(!term) return;
    
    resultsDiv.innerHTML = '<div class="loader">Consultando nodos remotos...</div>';

    try {
        const res = await fetch(`api/admin_inventario.php?q=${term}`);
        const data = await res.json();

        resultsDiv.innerHTML = '';
        
        if(data.error) {
            resultsDiv.innerHTML = `<p style="color:red">Error: ${data.error}</p>`;
            return;
        }

        if(data.length === 0) {
            resultsDiv.innerHTML = '<p style="color:red">No se encontraron productos en ninguna sucursal.</p>';
            return;
        }

        data.forEach(item => {
            // Asignar color según sucursal
            let color = '#333';
            let badgeColor = '#eee';
            
            switch(item.sucursal_id) {
                case 'norte': color = '#d32f2f'; badgeColor='#ffebee'; break; // Rojo
                case 'sur': color = '#1976d2'; badgeColor='#e3f2fd'; break; // Azul
                case 'este': color = '#388e3c'; badgeColor='#e8f5e9'; break; // Verde
                case 'oeste': color = '#fbc02d'; badgeColor='#fffde7'; break; // Amarillo
            }
            
            resultsDiv.innerHTML += `
                <div class="stock-item" style="border-left: 4px solid ${color}; padding-left:10px; margin-bottom:5px;">
                    <div><strong>${item.nombre}</strong></div>
                    <div style="display:flex; justify-content:space-between; margin-top:5px; font-size:0.9rem;">
                        <span>Nodo: <b style="background:${badgeColor}; padding:2px 5px; border-radius:4px; color:${color}">${item.sucursal_id.toUpperCase()}</b></span>
                        <span>Stock: <b>${item.cantidad}</b></span>
                        <span>Ubicación: ${item.pasillo || 'General'}</span>
                    </div>
                </div>
            `;
        });

    } catch (e) {
        console.error(e);
        resultsDiv.innerHTML = 'Error de conexión con el servidor.';
    }
}

// Guardar Nuevo Producto (Desde el modal Admin)
const formNuevo = document.getElementById('formNuevoProducto');
if(formNuevo) {
    formNuevo.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert("Función de guardar lista para conectar"); 
    });
}