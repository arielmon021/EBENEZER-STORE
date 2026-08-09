document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && !App.checkRole(['admin'])) return;
    // State
    let productos = [];
    let proveedores = [];
    let itemRowCount = 0;
    
    // DOM Elements
    const tableBody = document.querySelector('#comprasTable tbody');
    const emptyState = document.getElementById('comprasEmptyState');
    const btnNueva = document.getElementById('btnNuevaCompra');
    
    // Form Elements
    const form = document.getElementById('compraForm');
    const proveedorSelect = document.getElementById('proveedorId');
    const facturaInput = document.getElementById('factura');
    const itemsContainer = document.getElementById('compraItemsContainer');
    const btnAddItem = document.getElementById('btnAddItem');
    const totalDisplay = document.getElementById('compraTotalDisplay');
    const btnSave = document.getElementById('btnSaveCompra');
    
    // Initialize
    loadData();
    populateSelects();
    
    // Event Listeners
    btnNueva.addEventListener('click', openNewCompra);
    btnAddItem.addEventListener('click', addItemRow);
    btnSave.addEventListener('click', saveCompra);
    
    // Functions
    function loadData() {
        const compras = DB.getAll(DB.KEYS.COMPRAS);
        proveedores = DB.getAll(DB.KEYS.PROVEEDORES);
        productos = DB.getAll(DB.KEYS.PRODUCTOS);
        
        renderTable(compras);
    }
    
    function populateSelects() {
        proveedorSelect.innerHTML = '<option value="">Seleccione un proveedor</option>';
        proveedores.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.id;
            option.textContent = prov.nombre;
            proveedorSelect.appendChild(option);
        });
    }
    
    function getProductOptions() {
        let options = '<option value="">Seleccione...</option>';
        productos.forEach(prod => {
            options += `<option value="${prod.id}" data-costo="${prod.costo}">${prod.nombre} (${prod.codigo})</option>`;
        });
        return options;
    }
    
    function renderTable(compras) {
        tableBody.innerHTML = '';
        
        if (compras.length === 0) {
            tableBody.parentElement.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        
        tableBody.parentElement.style.display = 'table';
        emptyState.style.display = 'none';
        
        // Sort descending by date
        compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        compras.forEach(compra => {
            const tr = document.createElement('tr');
            
            const prov = proveedores.find(p => p.id === compra.proveedorId);
            const provNombre = prov ? prov.nombre : 'Desconocido';
            
            const cantProductos = compra.items.reduce((sum, item) => sum + item.cantidad, 0);
            
            tr.innerHTML = `
                <td>${compra.factura}</td>
                <td>${provNombre}</td>
                <td>${cantProductos}</td>
                <td style="font-weight: 500; color: var(--accent-success);">${App.formatCurrency(compra.total)}</td>
                <td>${App.formatDate(compra.fecha)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-icon btn-sm" onclick="viewDetalle('${compra.id}')" title="Ver Detalle" style="background: var(--accent-info-bg); color: var(--accent-info);">👁️</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
    
    function openNewCompra() {
        form.reset();
        itemsContainer.innerHTML = '';
        itemRowCount = 0;
        updateTotal();
        addItemRow(); // Add first empty row
        App.openModal('modalCompra');
    }
    
    function addItemRow() {
        const index = itemRowCount++;
        const tr = document.createElement('tr');
        tr.id = `itemRow_${index}`;
        
        tr.innerHTML = `
            <td>
                <select class="form-control item-product" data-index="${index}" required>
                    ${getProductOptions()}
                </select>
            </td>
            <td>
                <input type="number" class="form-control item-qty" data-index="${index}" min="1" step="1" value="1" required>
            </td>
            <td>
                <input type="number" class="form-control item-cost" data-index="${index}" min="0.01" step="0.01" value="0.00" required>
            </td>
            <td>
                <input type="text" class="form-control item-subtotal" data-index="${index}" value="$0.00" readonly style="background: var(--bg-secondary);">
            </td>
            <td>
                <button type="button" class="btn btn-icon btn-sm" onclick="removeItemRow(${index})" style="background: var(--accent-danger-bg); color: var(--accent-danger);">×</button>
            </td>
        `;
        
        itemsContainer.appendChild(tr);
        
        // Setup listeners for this row
        const productSelect = tr.querySelector('.item-product');
        const qtyInput = tr.querySelector('.item-qty');
        const costInput = tr.querySelector('.item-cost');
        
        productSelect.addEventListener('change', (e) => {
            const option = e.target.options[e.target.selectedIndex];
            if (option.value) {
                costInput.value = option.dataset.costo;
            } else {
                costInput.value = '0.00';
            }
            updateSubtotal(index);
        });
        
        qtyInput.addEventListener('input', () => updateSubtotal(index));
        costInput.addEventListener('input', () => updateSubtotal(index));
    };
    
    window.removeItemRow = function(index) {
        const row = document.getElementById(`itemRow_${index}`);
        if (row) {
            row.remove();
            updateTotal();
        }
    };
    
    function updateSubtotal(index) {
        const row = document.getElementById(`itemRow_${index}`);
        if (!row) return;
        
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const cost = parseFloat(row.querySelector('.item-cost').value) || 0;
        const subtotal = qty * cost;
        
        row.querySelector('.item-subtotal').value = App.formatCurrency(subtotal);
        row.dataset.subtotal = subtotal; // Store raw value
        
        updateTotal();
    };
    
    function updateTotal() {
        let total = 0;
        const rows = itemsContainer.querySelectorAll('tr');
        
        rows.forEach(row => {
            const sub = parseFloat(row.dataset.subtotal) || 0;
            total += sub;
        });
        
        totalDisplay.textContent = App.formatCurrency(total);
        form.dataset.total = total; // Store raw total
    }
    
    function saveCompra() {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const proveedorId = proveedorSelect.value;
        const factura = facturaInput.value;
        
        const rows = itemsContainer.querySelectorAll('tr');
        if (rows.length === 0) {
            App.showNotification('Debe agregar al menos un producto', 'warning');
            return;
        }
        
        const items = [];
        let total = 0;
        let valid = true;
        
        rows.forEach(row => {
            const select = row.querySelector('.item-product');
            const qty = parseInt(row.querySelector('.item-qty').value);
            const cost = parseFloat(row.querySelector('.item-cost').value);
            
            if (!select.value || isNaN(qty) || isNaN(cost) || qty <= 0 || cost < 0) {
                valid = false;
                return;
            }
            
            const prodNombre = select.options[select.selectedIndex].text.split(' (')[0];
            const subtotal = qty * cost;
            
            items.push({
                productoId: select.value,
                nombre: prodNombre,
                cantidad: qty,
                costo: cost,
                subtotal: subtotal
            });
            
            total += subtotal;
        });
        
        if (!valid) {
            App.showNotification('Revise los datos de los productos', 'danger');
            return;
        }
        
        const compra = {
            id: DB.generateId(),
            proveedorId: proveedorId,
            factura: factura,
            fecha: new Date().toISOString(),
            items: items,
            total: total
        };
        
        // Save to DB
        DB.add(DB.KEYS.COMPRAS, compra);
        
        // Update product stock and optionally average cost
        items.forEach(item => {
            const prod = productos.find(p => p.id === item.productoId);
            if (prod) {
                // Update quantity
                prod.cantidad += item.cantidad;
                // Simple cost replacement (could implement weighted average if needed)
                prod.costo = item.costo;
                DB.update(DB.KEYS.PRODUCTOS, prod.id, { 
                    cantidad: prod.cantidad,
                    costo: prod.costo
                });
            }
        });
        
        // Transaction saving removed for Banco del Barrio compatibility
        
        App.showNotification('Compra registrada con éxito', 'success');
        App.closeModal('modalCompra');
        loadData(); // Reload table and products
    }
    
    window.viewDetalle = function(id) {
        const compra = DB.getById(DB.KEYS.COMPRAS, id);
        if (!compra) return;
        
        const prov = proveedores.find(p => p.id === compra.proveedorId);
        
        document.getElementById('detProveedor').textContent = prov ? prov.nombre : 'Desconocido';
        document.getElementById('detFactura').textContent = compra.factura;
        document.getElementById('detFecha').textContent = App.formatDate(compra.fecha);
        document.getElementById('detTotal').textContent = App.formatCurrency(compra.total);
        
        const itemsContainer = document.getElementById('detItemsContainer');
        itemsContainer.innerHTML = '';
        
        compra.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${App.formatCurrency(item.costo)}</td>
                <td style="font-weight: 500;">${App.formatCurrency(item.subtotal)}</td>
            `;
            itemsContainer.appendChild(tr);
        });
        
        App.openModal('modalDetalle');
    };
});
