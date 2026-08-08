document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && !App.checkRole(['admin'])) return;
    // State
    let cart = [];
    let availableProducts = [];
    
    // DOM Elements
    const productGrid = document.getElementById('posProductGrid');
    const emptyState = document.getElementById('posEmptyState');
    const searchInput = document.getElementById('posSearch');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmptyState = document.getElementById('cartEmptyState');
    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartTotalEl = document.getElementById('cartTotal');
    const montoRecibidoInput = document.getElementById('montoRecibido');
    const cambioDisplay = document.getElementById('cambio');
    const btnProcesar = document.getElementById('btnProcesarVenta');
    const clienteInput = document.getElementById('cliente');
    
    // Initialize
    loadProducts();
    
    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = availableProducts.filter(p => 
            p.nombre.toLowerCase().includes(query) || p.codigo.toLowerCase().includes(query)
        );
        renderProductCards(filtered);
    });
    
    montoRecibidoInput.addEventListener('input', calculateChange);
    
    btnProcesar.addEventListener('click', processVenta);
    
    // Functions
    function loadProducts() {
        const allProducts = DB.getAll(DB.KEYS.PRODUCTOS);
        // Only show products with stock > 0
        availableProducts = allProducts.filter(p => p.cantidad > 0);
        renderProductCards(availableProducts);
    }
    
    function renderProductCards(products) {
        productGrid.innerHTML = '';
        
        if (products.length === 0) {
            productGrid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        
        productGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'pos-product-card card';
            card.style.cursor = 'pointer';
            card.style.transition = 'all var(--transition-fast)';
            
            // Allow clicking the card to add to cart
            card.onclick = () => addToCart(product.id);
            
            card.innerHTML = `
                <div class="card-body" style="padding: 1rem; text-align: center;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📦</div>
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${product.nombre}">${product.nombre}</h4>
                    <div style="color: var(--accent-success); font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem;">${App.formatCurrency(product.precio)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Stock: ${product.cantidad}</div>
                </div>
            `;
            
            // Hover effect
            card.onmouseover = () => card.style.transform = 'translateY(-2px)';
            card.onmouseout = () => card.style.transform = 'none';
            
            productGrid.appendChild(card);
        });
    }
    
    window.addToCart = function(productoId) {
        const product = availableProducts.find(p => p.id === productoId);
        if (!product) return;
        
        const existingItemIndex = cart.findIndex(item => item.productoId === productoId);
        
        if (existingItemIndex >= 0) {
            // Check stock
            if (cart[existingItemIndex].cantidad >= product.cantidad) {
                App.showNotification('No hay más stock disponible', 'warning');
                return;
            }
            cart[existingItemIndex].cantidad++;
            cart[existingItemIndex].subtotal = cart[existingItemIndex].cantidad * cart[existingItemIndex].precio;
        } else {
            cart.push({
                productoId: product.id,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1,
                subtotal: product.precio
            });
        }
        
        renderCart();
    };
    
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        renderCart();
    };
    
    window.updateCartQty = function(index, delta) {
        const item = cart[index];
        const product = availableProducts.find(p => p.id === item.productoId);
        
        const newQty = item.cantidad + delta;
        
        if (newQty <= 0) {
            removeFromCart(index);
            return;
        }
        
        if (newQty > product.cantidad) {
            App.showNotification('No hay más stock disponible', 'warning');
            return;
        }
        
        item.cantidad = newQty;
        item.subtotal = item.cantidad * item.precio;
        renderCart();
    };
    
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.style.display = 'none';
            cartEmptyState.style.display = 'flex';
            cartSubtotalEl.textContent = '$0.00';
            cartTotalEl.textContent = '$0.00';
            btnProcesar.disabled = true;
            calculateChange();
            return;
        }
        
        cartItemsContainer.style.display = 'block';
        cartEmptyState.style.display = 'none';
        btnProcesar.disabled = false;
        
        let total = 0;
        
        cart.forEach((item, index) => {
            total += item.subtotal;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.style.display = 'flex';
            itemEl.style.alignItems = 'center';
            itemEl.style.padding = '0.75rem 1rem';
            itemEl.style.borderBottom = '1px solid var(--border-color)';
            
            itemEl.innerHTML = `
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.nombre}">${item.nombre}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${App.formatCurrency(item.precio)} c/u</div>
                </div>
                <div style="display: flex; alignItems: center; background: var(--bg-input); border-radius: var(--radius-sm); margin: 0 10px;">
                    <button class="btn btn-icon btn-sm" onclick="updateCartQty(${index}, -1)" style="background: transparent; color: var(--text-primary); border: none;">-</button>
                    <span style="padding: 0 10px; font-weight: 500; min-width: 30px; text-align: center;">${item.cantidad}</span>
                    <button class="btn btn-icon btn-sm" onclick="updateCartQty(${index}, 1)" style="background: transparent; color: var(--text-primary); border: none;">+</button>
                </div>
                <div style="font-weight: bold; width: 70px; text-align: right; margin-right: 10px;">
                    ${App.formatCurrency(item.subtotal)}
                </div>
                <button class="btn btn-icon btn-sm" onclick="removeFromCart(${index})" style="background: var(--accent-danger-bg); color: var(--accent-danger); border: none;">×</button>
            `;
            
            cartItemsContainer.appendChild(itemEl);
        });
        
        cartSubtotalEl.textContent = App.formatCurrency(total);
        cartTotalEl.textContent = App.formatCurrency(total);
        
        calculateChange();
    }
    
    function calculateChange() {
        if (cart.length === 0) {
            cambioDisplay.textContent = '$0.00';
            cambioDisplay.style.color = 'var(--text-muted)';
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
        const recibido = parseFloat(montoRecibidoInput.value) || 0;
        
        if (recibido >= total) {
            const cambio = recibido - total;
            cambioDisplay.textContent = App.formatCurrency(cambio);
            cambioDisplay.style.color = 'var(--accent-success)';
            btnProcesar.disabled = false;
        } else {
            const faltante = total - recibido;
            cambioDisplay.textContent = '-' + App.formatCurrency(faltante);
            cambioDisplay.style.color = 'var(--accent-danger)';
            if (montoRecibidoInput.value !== '') {
                btnProcesar.disabled = true; // Wait for enough money
            }
        }
    }
    
    function processVenta() {
        if (cart.length === 0) return;
        
        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
        const recibido = parseFloat(montoRecibidoInput.value) || 0;
        
        if (montoRecibidoInput.value && recibido < total) {
            App.showNotification('El monto recibido es menor al total', 'danger');
            return;
        }
        
        const pago = recibido >= total ? recibido : total;
        const cambio = pago - total;
        
        const sale = {
            id: DB.generateId(),
            fecha: new Date().toISOString(),
            items: JSON.parse(JSON.stringify(cart)),
            total: total,
            pago: pago,
            cambio: cambio,
            cliente: clienteInput.value || 'Consumidor Final'
        };
        
        // Save to DB
        DB.add(DB.KEYS.VENTAS, sale);
        
        // Deduct stock
        const productos = DB.getAll(DB.KEYS.PRODUCTOS);
        sale.items.forEach(item => {
            const prod = productos.find(p => p.id === item.productoId);
            if (prod) {
                prod.cantidad -= item.cantidad;
                DB.update(DB.KEYS.PRODUCTOS, prod.id, { cantidad: prod.cantidad });
            }
        });
        
        // Transaction saving removed for Banco del Barrio compatibility
        
        App.showNotification('Venta procesada con éxito', 'success');
        
        // Show receipt
        showReceipt(sale);
        
        // Reset POS
        cart = [];
        montoRecibidoInput.value = '';
        clienteInput.value = 'Consumidor Final';
        renderCart();
        loadProducts(); // Reload to reflect stock changes
    }
    
    function showReceipt(sale) {
        document.getElementById('reciboFecha').textContent = `Fecha: ${App.formatDateTime(sale.fecha)}`;
        document.getElementById('reciboCliente').textContent = `Cliente: ${sale.cliente}`;
        
        const itemsContainer = document.getElementById('reciboItems');
        itemsContainer.innerHTML = '';
        
        sale.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: left;">${item.cantidad}</td>
                <td style="text-align: left;">${item.nombre}</td>
                <td style="text-align: right;">${App.formatCurrency(item.subtotal)}</td>
            `;
            itemsContainer.appendChild(tr);
        });
        
        document.getElementById('reciboTotal').textContent = App.formatCurrency(sale.total);
        document.getElementById('reciboPagado').textContent = App.formatCurrency(sale.pago);
        document.getElementById('reciboCambio').textContent = App.formatCurrency(sale.cambio);
        
        App.openModal('modalRecibo');
    }
});
