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
    if (slides.length === 0) return; // Validación extra

    slideIndex += n;
    
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    
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
    if (!grid) return;
    grid.innerHTML = '<div class="loader">Cargando inventario distribuido...</div>';

    try {
        const res = await fetch(url);
        const productos = await res.json();
        
        productosGlobales = productos; // Guardamos copia global
        grid.innerHTML = '';

        if(productos.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">No hay productos en esta categoría.</p>';
            return;
        }

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
// 3. CARRITO DE COMPRAS
// ==========================================

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
            img: prod.imagen_url 
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

function actualizarCarritoUI() {
    const count = cart.reduce((a,b)=>a+b.quantity,0);
    const badge = document.getElementById('cart-count');
    if(badge) badge.innerText = `Carrito (${count})`;
}

function verCarrito() {
    const modal = document.getElementById('modalCarrito');
    if(modal) {
         renderizarListaCarrito();
         modal.style.display = 'flex';
    } else {
        alert("Error: No se encuentra el modal del carrito en el HTML.");
    }
}

function cerrarModalCarrito() {
    document.getElementById('modalCarrito').style.display = 'none';
}

function renderizarListaCarrito() {
    const container = document.getElementById('lista-carrito'); 
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

function eliminarDelCarrito(id) {
    cart = cart.filter(i => i.id !== id);
    actualizarCarritoUI();
    renderizarListaCarrito();
}

function vaciarCarrito() {
    if(confirm('¿Estás seguro de vaciar el carrito?')) {
        cart = [];
        actualizarCarritoUI();
        renderizarListaCarrito();
    }
}

// ==========================================
// FUNCIÓN DE PAGO Y TICKET (CORREGIDA SIN ERROR NULL)
// ==========================================
async function procesarCompra() {
    if(cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const btn = event.target; 
    const textoOriginal = btn ? btn.innerText : 'Pagar Ahora';
    if(btn) { btn.innerText = "Procesando..."; btn.disabled = true; }

    // Elegir sucursal aleatoria
    const sucursales = ['norte', 'sur', 'este', 'oeste'];
    const sucursalAleatoria = sucursales[Math.floor(Math.random() * sucursales.length)];

    try {
        const res = await fetch('api/guardar_pedido.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                carrito: cart,
                sucursal: sucursalAleatoria 
            })
        });

        // Intentar leer la respuesta
        let data;
        try {
            data = await res.json();
        } catch (jsonError) {
            console.error("Error al leer JSON:", jsonError);
            throw new Error("El servidor no devolvió una respuesta válida. Revisa la consola.");
        }

        if(data.success) {
            // CORRECCIÓN IMPORTANTE: 
            // Buscamos el div directo dentro de modalCarrito, sin depender de la clase .modal-content
            const modalContent = document.querySelector('#modalCarrito > div');

            if (!modalContent) {
                alert("Compra exitosa, pero no se pudo mostrar el ticket. Recarga la página.");
                return;
            }

            // Ocultamos el pie del carrito si existe
            const footerDiv = modalContent.querySelector('div[style*="text-align:right"]');
            if(footerDiv) footerDiv.style.display = 'none';

            // Datos para el Ticket
            const fecha = data.fecha || new Date().toLocaleDateString();
            const folio = data.folio || 'PEND';
            const nodo = (data.sucursal || sucursalAleatoria).toUpperCase();
            const total = cart.reduce((a,b)=>a+(b.price*b.quantity),0).toFixed(2);
            
            let itemsHTML = '';
            cart.forEach(item => {
                itemsHTML += `
                    <tr style="border-bottom:1px dashed #ccc;">
                        <td style="padding:5px; font-size:12px;">${item.name} <br> <small>x${item.quantity}</small></td>
                        <td style="text-align:right; font-size:12px;">$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `;
            });

            // Reemplazar contenido con el Ticket
            modalContent.innerHTML = `
                <div id="ticket-visual" style="text-align:center; font-family:'Courier New', monospace; padding:10px; border:1px solid #ddd; background:#fffcf5;">
                    <h2 style="margin:0; font-size:1.5rem;">TIENDA UGM</h2>
                    <p style="margin:5px 0; font-size:0.9rem;">Campus Minatitlán</p>
                    <p>---------------------------</p>
                    <p><strong>FOLIO: #${folio}</strong></p>
                    <p>FECHA: ${fecha}</p>
                    <p>NODO: ${nodo}</p>
                    <p>---------------------------</p>
                    <table style="width:100%; text-align:left;">
                        ${itemsHTML}
                    </table>
                    <p>---------------------------</p>
                    <h3 style="text-align:right; margin:10px 0;">TOTAL: $${total}</h3>
                    <p>---------------------------</p>
                    <p style="font-size:0.8rem;">¡Gracias por su compra!</p>
                    <br>
                    <button onclick="window.print()" style="background:#333; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; font-weight:bold; font-size:1rem;">
                        <i class="fas fa-print"></i> IMPRIMIR TICKET
                    </button>
                    <br><br>
                    <button onclick="location.reload()" style="background:none; border:1px solid #333; padding:5px 10px; cursor:pointer; border-radius:5px;">
                        Cerrar y Seguir Comprando
                    </button>
                </div>
            `;

            cart = []; 
            actualizarCarritoUI();

        } else {
            alert("Error del servidor: " + data.msg);
            if(btn) { btn.innerText = textoOriginal; btn.disabled = false; }
        }

    } catch (e) {
        console.error(e);
        alert("Ocurrió un error: " + e.message);
        if(btn) { btn.innerText = textoOriginal; btn.disabled = false; }
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
    document.getElementById('stockResults').innerHTML = '<p style="color:#777; font-style:italic;">Busque un producto...</p>';
    document.getElementById('stockSearch').value = '';
}

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
            let color = '#333';
            let badgeColor = '#eee';
            
            switch(item.sucursal_id) {
                case 'norte': color = '#d32f2f'; badgeColor='#ffebee'; break; 
                case 'sur': color = '#1976d2'; badgeColor='#e3f2fd'; break; 
                case 'este': color = '#388e3c'; badgeColor='#e8f5e9'; break; 
                case 'oeste': color = '#fbc02d'; badgeColor='#fffde7'; break; 
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

async function verReporteVentas() {
    const divResultados = document.getElementById('stockResults');
    divResultados.innerHTML = '<div class="loader">Cargando reporte global...</div>';

    try {
        const res = await fetch('api/ver_ventas.php');
        const ventas = await res.json();

        divResultados.innerHTML = '<h3>Últimas Ventas (Global)</h3>';

        if(ventas.length === 0) {
            divResultados.innerHTML += '<p>No hay ventas registradas.</p>';
            return;
        }

        ventas.forEach(v => {
            let color = '#333';
            if(v.sucursal_id === 'norte') color = '#d32f2f'; 
            if(v.sucursal_id === 'sur') color = '#1976d2';
            if(v.sucursal_id === 'este') color = '#388e3c';
            if(v.sucursal_id === 'oeste') color = '#fbc02d';

            divResultados.innerHTML += `
                <div style="border-left: 4px solid ${color}; background:#f9f9f9; padding:10px; margin-bottom:8px; font-size:0.9rem;">
                    <div style="display:flex; justify-content:space-between;">
                        <strong>Pedido #${v.id_venta}</strong>
                        <span style="color:${color}; font-weight:bold;">${v.sucursal_id.toUpperCase()}</span>
                    </div>
                    <div>Cliente: ${v.cliente_nombre}</div>
                    <div style="font-style:italic; color:#555;">"${v.detalles}"</div>
                    <div style="text-align:right; font-weight:bold; margin-top:5px;">Total: $${v.total}</div>
                </div>
            `;
        });

    } catch (e) {
        console.warn("Función de reporte de ventas requiere api/ver_ventas.php");
        divResultados.innerHTML = 'Error o función no disponible.';
    }
}

const formNuevo = document.getElementById('formNuevoProducto');
if(formNuevo) {
    formNuevo.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert("Función de guardar lista para conectar"); 
    });
}