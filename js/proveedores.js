document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && !App.checkRole(['admin'])) return;
    // DOM Elements
    const tableBody = document.querySelector('#proveedoresTable tbody');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const btnNuevo = document.getElementById('btnNuevoProveedor');
    
    // Form Elements
    const form = document.getElementById('proveedorForm');
    const idInput = document.getElementById('proveedorId');
    const nombreInput = document.getElementById('nombre');
    const rucInput = document.getElementById('ruc');
    const telefonoInput = document.getElementById('telefono');
    const emailInput = document.getElementById('email');
    const direccionInput = document.getElementById('direccion');
    const modalTitle = document.getElementById('modalTitle');
    const btnSave = document.getElementById('btnSaveProveedor');
    
    // Initialize
    loadProveedores();
    
    // Event Listeners
    searchInput.addEventListener('input', loadProveedores);
    btnNuevo.addEventListener('click', openAddModal);
    btnSave.addEventListener('click', saveProveedor);
    
    // Functions
    function loadProveedores() {
        const query = searchInput.value.toLowerCase();
        let proveedores = DB.getAll(DB.KEYS.PROVEEDORES);
        
        if (query) {
            proveedores = proveedores.filter(p => 
                p.nombre.toLowerCase().includes(query) || 
                p.ruc.includes(query) ||
                (p.email && p.email.toLowerCase().includes(query))
            );
        }
        
        renderTable(proveedores);
    }
    
    function renderTable(proveedores) {
        tableBody.innerHTML = '';
        
        if (proveedores.length === 0) {
            tableBody.parentElement.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        
        tableBody.parentElement.style.display = 'table';
        emptyState.style.display = 'none';
        
        proveedores.forEach(prov => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td style="font-weight: 500;">${prov.nombre}</td>
                <td>${prov.ruc}</td>
                <td>${prov.telefono || '-'}</td>
                <td>${prov.email || '-'}</td>
                <td>${prov.direccion || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-icon btn-sm" onclick="openEditModal('${prov.id}')" title="Editar" style="background: var(--accent-primary-glow); color: var(--accent-primary);">✏️</button>
                        <button class="btn btn-icon btn-sm" onclick="deleteProveedor('${prov.id}')" title="Eliminar" style="background: var(--accent-danger-bg); color: var(--accent-danger);">🗑️</button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
    }
    
    function openAddModal() {
        form.reset();
        idInput.value = '';
        modalTitle.textContent = 'Nuevo Proveedor';
        App.openModal('modalProveedor');
    }
    
    window.openEditModal = function(id) {
        const prov = DB.getById(DB.KEYS.PROVEEDORES, id);
        if (!prov) return;
        
        idInput.value = prov.id;
        nombreInput.value = prov.nombre;
        rucInput.value = prov.ruc;
        telefonoInput.value = prov.telefono || '';
        emailInput.value = prov.email || '';
        direccionInput.value = prov.direccion || '';
        
        modalTitle.textContent = 'Editar Proveedor';
        App.openModal('modalProveedor');
    };
    
    function saveProveedor() {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const id = idInput.value;
        const proveedorData = {
            nombre: nombreInput.value.trim(),
            ruc: rucInput.value.trim(),
            telefono: telefonoInput.value.trim(),
            email: emailInput.value.trim(),
            direccion: direccionInput.value.trim()
        };
        
        if (id) {
            // Update
            DB.update(DB.KEYS.PROVEEDORES, id, proveedorData);
            App.showNotification('Proveedor actualizado exitosamente', 'success');
        } else {
            // Add
            proveedorData.id = DB.generateId();
            DB.add(DB.KEYS.PROVEEDORES, proveedorData);
            App.showNotification('Proveedor agregado exitosamente', 'success');
        }
        
        App.closeModal('modalProveedor');
        loadProveedores();
    }
    
    window.deleteProveedor = function(id) {
        // Check if provider has associated products
        const productos = DB.getAll(DB.KEYS.PRODUCTOS);
        const hasProducts = productos.some(p => p.proveedor === id);
        
        if (hasProducts) {
            App.showNotification('No se puede eliminar. El proveedor tiene productos asociados.', 'danger');
            return;
        }
        
        if (App.confirmAction('¿Está seguro de eliminar este proveedor?')) {
            DB.remove(DB.KEYS.PROVEEDORES, id);
            App.showNotification('Proveedor eliminado exitosamente', 'success');
            loadProveedores();
        }
    };
});
