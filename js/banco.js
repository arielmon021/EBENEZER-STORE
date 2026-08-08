document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && !App.checkRole(['admin'])) return;
    // Initial checks and setup
    if (typeof App !== 'undefined') {
        App.init();
    }
    
    // DOM Elements
    const transaccionesTableBody = document.querySelector('#transaccionesTable tbody');
    const emptyState = document.getElementById('emptyState');
    
    // Filters
    const filterType = document.getElementById('filterType');
    const filterDate = document.getElementById('filterDate');
    const searchInput = document.getElementById('searchInput');
    
    // Stats
    const statTotalTransacciones = document.getElementById('statTotalTransacciones');
    const statDepositos = document.getElementById('statDepositos');
    const statRetiros = document.getElementById('statRetiros');
    const statRecargasPagos = document.getElementById('statRecargasPagos');
    
    // Modal
    const btnNuevaTransaccion = document.getElementById('btnNuevaTransaccion');
    const modalTransaccion = document.getElementById('modalTransaccion');
    const closeModalTransaccion = document.getElementById('closeModalTransaccion');
    const btnCancelTransaccion = document.getElementById('btnCancelTransaccion');
    const btnSaveTransaccion = document.getElementById('btnSaveTransaccion');
    
    // Form Inputs
    const formTransaccion = document.getElementById('formTransaccion');
    const tipoTransaccion = document.getElementById('tipoTransaccion');
    const clienteTransaccion = document.getElementById('clienteTransaccion');
    const montoTransaccion = document.getElementById('montoTransaccion');
    const referenciaTransaccion = document.getElementById('referenciaTransaccion');
    const observacionTransaccion = document.getElementById('observacionTransaccion');

    let todasTransacciones = [];

    // Initialize
    loadTransacciones();

    function loadTransacciones() {
        todasTransacciones = DB.getAll(DB.KEYS.TRANSACCIONES) || [];
        // Sort by date desc
        todasTransacciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        applyFilters();
    }

    function applyFilters() {
        const typeFilter = filterType.value;
        const dateFilter = filterDate.value;
        const searchFilter = searchInput.value.toLowerCase().trim();

        let filtered = todasTransacciones;

        // 1. Type filter
        if (typeFilter !== 'Todos') {
            filtered = filtered.filter(t => t.tipo === typeFilter);
        }

        // 2. Date filter
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (dateFilter === 'Hoy') {
            filtered = filtered.filter(t => {
                const d = new Date(t.fecha);
                return d >= today;
            });
        } else if (dateFilter === 'Esta Semana') {
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            filtered = filtered.filter(t => {
                const d = new Date(t.fecha);
                return d >= lastWeek;
            });
        } else if (dateFilter === 'Este Mes') {
            filtered = filtered.filter(t => {
                const d = new Date(t.fecha);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
        }

        // 3. Search filter
        if (searchFilter) {
            filtered = filtered.filter(t => 
                t.cliente.toLowerCase().includes(searchFilter) || 
                t.referencia.toLowerCase().includes(searchFilter)
            );
        }

        renderStats(filtered);
        renderTable(filtered);
    }

    function renderStats(transacciones) {
        let countHoy = 0;
        let sumDepositos = 0;
        let sumRetiros = 0;
        let sumRecargasPagos = 0;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        transacciones.forEach(t => {
            const tDate = new Date(t.fecha);
            // Count today's transactions for the first stat, 
            // wait, stats are usually based on current filtered view in most apps, but 
            // the spec says "Total Transacciones Hoy", "Depósitos Hoy", etc.
            // Let's assume we filter by today for stats regardless of table filter, OR we calculate stats based on the filtered table. 
            // If dateFilter is not 'Hoy', stats might look weird if they say "Hoy" but show all time.
            // But I'll stick to calculating based on actual 'today' transactions to match the label, 
            // OR I'll just sum the filtered ones and assume the labels mean the filtered period. 
            // Actually, I'll calculate exactly 'Hoy' for the stats to be safe based on labels.
            
            if (tDate >= today) {
                countHoy++;
                const amount = parseFloat(t.monto) || 0;
                
                if (t.tipo === 'Depósito') sumDepositos += amount;
                else if (t.tipo === 'Retiro') sumRetiros += amount;
                else if (t.tipo === 'Recarga' || t.tipo === 'Pago de Servicio') sumRecargasPagos += amount;
            }
        });

        statTotalTransacciones.textContent = countHoy;
        statDepositos.textContent = App.formatCurrency(sumDepositos);
        statRetiros.textContent = App.formatCurrency(sumRetiros);
        statRecargasPagos.textContent = App.formatCurrency(sumRecargasPagos);
    }

    function renderTable(transacciones) {
        transaccionesTableBody.innerHTML = '';
        
        if (transacciones.length === 0) {
            emptyState.style.display = 'flex';
            transaccionesTableBody.parentElement.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        transaccionesTableBody.parentElement.style.display = 'table';

        transacciones.forEach(t => {
            const tr = document.createElement('tr');
            
            // Badge type mapping
            let badgeClass = 'badge-secondary';
            if (t.tipo === 'Depósito') badgeClass = 'badge-info';
            else if (t.tipo === 'Retiro') badgeClass = 'badge-warning';
            else if (t.tipo === 'Recarga') badgeClass = 'badge-success';
            else if (t.tipo === 'Pago de Servicio') badgeClass = 'badge-secondary';

            let statusBadge = t.estado === 'Completado' ? 'badge-success' : 'badge-warning';

            tr.innerHTML = `
                <td>${App.formatDateTime(t.fecha)}</td>
                <td><span class="badge ${badgeClass}">${t.tipo}</span></td>
                <td>${t.cliente}</td>
                <td>${t.referencia}</td>
                <td style="font-weight: 600;">${App.formatCurrency(t.monto)}</td>
                <td><span class="badge ${statusBadge}">${t.estado}</span></td>
            `;
            
            transaccionesTableBody.appendChild(tr);
        });
    }

    // Modal Functions
    function openNewTransaccion() {
        formTransaccion.reset();
        App.openModal('modalTransaccion');
    }

    function saveTransaccion() {
        if (!formTransaccion.checkValidity()) {
            formTransaccion.reportValidity();
            return;
        }

        const monto = parseFloat(montoTransaccion.value);
        if (monto <= 0) {
            App.showNotification('El monto debe ser mayor a 0', 'danger');
            return;
        }

        const newT = {
            id: DB.generateId(),
            tipo: tipoTransaccion.value,
            cliente: clienteTransaccion.value.trim(),
            monto: monto,
            referencia: referenciaTransaccion.value.trim(),
            observacion: observacionTransaccion.value.trim(),
            estado: 'Completado',
            fecha: new Date().toISOString()
        };

        DB.add(DB.KEYS.TRANSACCIONES, newT);
        
        App.showNotification('Transacción registrada exitosamente', 'success');
        App.closeModal('modalTransaccion');
        
        loadTransacciones();
    }

    // Event Listeners
    filterType.addEventListener('change', applyFilters);
    filterDate.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);

    btnNuevaTransaccion.addEventListener('click', openNewTransaccion);
    closeModalTransaccion.addEventListener('click', () => App.closeModal('modalTransaccion'));
    btnCancelTransaccion.addEventListener('click', () => App.closeModal('modalTransaccion'));
    btnSaveTransaccion.addEventListener('click', saveTransaccion);
});
