function populateSelects() {
    const categorias = DB.getAll(DB.KEYS.CATEGORIAS);
    const proveedores = DB.getAll(DB.KEYS.PROVEEDORES);

    const filterCat = document.getElementById('filterCategoria');
    const formCat = document.getElementById('prodCategoria');
    const formProv = document.getElementById('prodProveedor');

    // Populate filter
    filterCat.innerHTML = '<option value="">Todas las Categorías</option>';
    categorias.forEach(c => {
        filterCat.innerHTML += `<option value="${c}">${c}</option>`;
    });

    // Populate form category
    formCat.innerHTML = '<option value="">Seleccione Categoría</option>';
    categorias.forEach(c => {
        formCat.innerHTML += `<option value="${c}">${c}</option>`;
    });

    // Populate form provider
    formProv.innerHTML = '<option value="">Seleccione Proveedor</option>';
    proveedores.forEach(p => {
        formProv.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
}

function loadProductos() {
    const query = document.getElementById('searchProducto').value.toLowerCase();
    const category = document.getElementById('filterCategoria').value;
    let productos = DB.getAll(DB.KEYS.PRODUCTOS);

    if (query) {
        productos = productos.filter(p => 
            p.nombre.toLowerCase().includes(query) || 
            p.codigo.toLowerCase().includes(query)
        );
    }
    if (category) {
        productos = productos.filter(p => p.categoria === category);
    }

    renderTable(productos);
}

function renderTable(productos) {
    const tbody = document.getElementById('productosTableBody');
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-text" style="text-align: center; padding: 20px;">No se encontraron productos.</td></tr>';
        return;
    }

    const isAdmin = DB.getSession()?.rol === 'admin';

    tbody.innerHTML = productos.map(p => {
        const isLow = p.cantidad <= p.stockMinimo;
        const badgeClass = isLow ? 'badge-danger' : 'badge-success';
        return `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${App.formatCurrency(p.precio)}</td>
                ${isAdmin ? `<td>${App.formatCurrency(p.costo)}</td>` : ''}
                <td><span class="badge ${badgeClass}">${p.cantidad}</span></td>
                <td>${p.stockMinimo}</td>
                ${isAdmin ? `<td class="table-actions">
                    <button class="btn btn-sm btn-primary" onclick="openEditModal('${p.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProducto('${p.id}')">Eliminar</button>
                </td>` : ''}
            </tr>
        `;
    }).join('');
}

function openAddModal() {
    document.getElementById('formProducto').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('modalProductoTitle').textContent = 'Nuevo Producto';
    App.openModal('modalProducto');
}

function openEditModal(id) {
    const p = DB.getById(DB.KEYS.PRODUCTOS, id);
    if (!p) return;

    document.getElementById('prodId').value = p.id;
    document.getElementById('prodCodigo').value = p.codigo;
    document.getElementById('prodNombre').value = p.nombre;
    document.getElementById('prodCategoria').value = p.categoria;
    document.getElementById('prodProveedor').value = p.proveedor;
    document.getElementById('prodPrecio').value = p.precio;
    document.getElementById('prodCosto').value = p.costo;
    document.getElementById('prodCantidad').value = p.cantidad;
    document.getElementById('prodStockMinimo').value = p.stockMinimo;
    
    document.getElementById('modalProductoTitle').textContent = 'Editar Producto';
    App.openModal('modalProducto');
}

function saveProducto() {
    const form = document.getElementById('formProducto');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('prodId').value;
    const codigo = document.getElementById('prodCodigo').value.trim();
    const nombre = document.getElementById('prodNombre').value.trim();
    const categoria = document.getElementById('prodCategoria').value;
    const proveedor = document.getElementById('prodProveedor').value;
    const precio = parseFloat(document.getElementById('prodPrecio').value);
    const costo = parseFloat(document.getElementById('prodCosto').value);
    const cantidad = parseInt(document.getElementById('prodCantidad').value, 10);
    const stockMinimo = parseInt(document.getElementById('prodStockMinimo').value, 10);

    if (precio <= 0 || costo <= 0) {
        App.showNotification('El precio y costo deben ser mayores a cero.', 'warning');
        return;
    }
    if (cantidad < 0 || stockMinimo < 0) {
        App.showNotification('Las cantidades no pueden ser negativas.', 'warning');
        return;
    }

    const productos = DB.getAll(DB.KEYS.PRODUCTOS);
    // Check code uniqueness
    const exists = productos.find(p => p.codigo === codigo && p.id !== id);
    if (exists) {
        App.showNotification('El código del producto ya existe.', 'danger');
        return;
    }

    const data = { codigo, nombre, categoria, proveedor, precio, costo, cantidad, stockMinimo };

    if (id) {
        DB.update(DB.KEYS.PRODUCTOS, id, data);
        App.showNotification('Producto actualizado con éxito.', 'success');
    } else {
        DB.add(DB.KEYS.PRODUCTOS, data);
        App.showNotification('Producto creado con éxito.', 'success');
    }

    App.closeModal('modalProducto');
    loadProductos();
}

function deleteProducto(id) {
    if (App.confirmAction && !App.confirmAction('¿Está seguro de eliminar este producto?')) {
        return;
    } else if (!App.confirmAction && !confirm('¿Está seguro de eliminar este producto?')) {
        return;
    }

    DB.remove(DB.KEYS.PRODUCTOS, id);
    App.showNotification('Producto eliminado.', 'success');
    loadProductos();
}

document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = DB.getSession()?.rol === 'admin';
    if (!isAdmin) {
        // Hide 'Nuevo Producto' button
        const addBtn = document.querySelector('.header-right .btn-primary');
        if (addBtn) addBtn.style.display = 'none';
        
        // Hide table headers for Costo and Acciones
        const headers = document.querySelectorAll('.data-table th');
        if (headers.length >= 8) {
            headers[4].style.display = 'none'; // Costo
            headers[7].style.display = 'none'; // Acciones
        }
    }

    populateSelects();
    loadProductos();

    document.getElementById('searchProducto').addEventListener('input', loadProductos);
    document.getElementById('filterCategoria').addEventListener('change', loadProductos);
});
