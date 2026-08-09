function loadInventario() {
    const query = document.getElementById('searchInv').value.toLowerCase();
    const estado = document.getElementById('filterEstado').value;
    const categoria = document.getElementById('filterCategoriaInv').value;
    
    let productos = DB.getAll(DB.KEYS.PRODUCTOS);
    renderStats(productos); // Stats use all products

    if (query) {
        productos = productos.filter(p => 
            p.nombre.toLowerCase().includes(query) || 
            p.codigo.toLowerCase().includes(query)
        );
    }
    if (categoria) {
        productos = productos.filter(p => p.categoria === categoria);
    }
    if (estado) {
        productos = productos.filter(p => {
            const currentEstado = getEstado(p.cantidad, p.stockMinimo);
            return currentEstado === estado;
        });
    }

    renderTable(productos);
}

function getEstado(cantidad, stockMinimo) {
    if (cantidad === 0) return 'Agotado';
    if (cantidad <= stockMinimo) return 'Bajo';
    return 'Normal';
}

function renderStats(productos) {
    let normal = 0, bajo = 0, agotado = 0;
    productos.forEach(p => {
        const est = getEstado(p.cantidad, p.stockMinimo);
        if (est === 'Agotado') agotado++;
        else if (est === 'Bajo') bajo++;
        else normal++;
    });

    document.getElementById('statTotal').textContent = productos.length;
    document.getElementById('statNormal').textContent = normal;
    document.getElementById('statBajo').textContent = bajo;
    document.getElementById('statAgotado').textContent = agotado;
}

function renderTable(productos) {
    const tbody = document.getElementById('inventarioTableBody');
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-text" style="text-align: center; padding: 20px;">No se encontraron productos en el inventario.</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map(p => {
        const estado = getEstado(p.cantidad, p.stockMinimo);
        let badgeClass = 'badge-success';
        if (estado === 'Bajo') badgeClass = 'badge-warning';
        if (estado === 'Agotado') badgeClass = 'badge-danger';

        return `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td><strong>${p.cantidad}</strong></td>
                <td>${p.stockMinimo}</td>
                <td><span class="badge ${badgeClass}">${estado}</span></td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-primary" onclick="openAjusteModal('${p.id}')">Ajustar</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAjusteModal(id) {
    const p = DB.getById(DB.KEYS.PRODUCTOS, id);
    if (!p) return;

    document.getElementById('formAjuste').reset();
    document.getElementById('ajusteProdId').value = p.id;
    document.getElementById('ajusteProdNombre').value = p.nombre + ` (Stock Actual: ${p.cantidad})`;
    
    App.openModal('modalAjuste');
}

function saveAjuste() {
    const form = document.getElementById('formAjuste');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('ajusteProdId').value;
    const tipo = document.getElementById('ajusteTipo').value;
    const cantidadStr = document.getElementById('ajusteCantidad').value;
    const motivo = document.getElementById('ajusteMotivo').value.trim();
    const cantidadAjuste = parseInt(cantidadStr, 10);

    if (cantidadAjuste <= 0) {
        App.showNotification('La cantidad debe ser mayor a 0.', 'warning');
        return;
    }

    const p = DB.getById(DB.KEYS.PRODUCTOS, id);
    if (!p) return;

    let nuevaCantidad = p.cantidad;
    if (tipo === 'Agregar') {
        nuevaCantidad += cantidadAjuste;
    } else {
        if (cantidadAjuste > p.cantidad) {
            App.showNotification('No hay suficiente stock para retirar esta cantidad.', 'danger');
            return;
        }
        nuevaCantidad -= cantidadAjuste;
    }

    DB.update(DB.KEYS.PRODUCTOS, id, { cantidad: nuevaCantidad });
    
    // Log transaction (if transacciones store exists in DB.KEYS)
    const tx = {
        productoId: id,
        tipo: tipo, // 'Agregar' or 'Retirar'
        cantidad: cantidadAjuste,
        motivo: motivo,
        fecha: new Date().toISOString(),
        usuario: DB.getSession()?.username || 'admin'
    };
    if (DB.KEYS.TRANSACCIONES) {
        DB.add(DB.KEYS.TRANSACCIONES, tx);
    }
    
    App.showNotification('Ajuste de inventario guardado con éxito.', 'success');
    App.closeModal('modalAjuste');
    loadInventario();
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && !App.checkRole(['admin'])) return;
    // Populate categories
    const categorias = DB.getAll(DB.KEYS.CATEGORIAS);
    const filterCat = document.getElementById('filterCategoriaInv');
    categorias.forEach(c => {
        filterCat.innerHTML += `<option value="${c}">${c}</option>`;
    });

    loadInventario();

    // Event listeners
    document.getElementById('searchInv').addEventListener('input', loadInventario);
    document.getElementById('filterEstado').addEventListener('change', loadInventario);
    document.getElementById('filterCategoriaInv').addEventListener('change', loadInventario);
});
