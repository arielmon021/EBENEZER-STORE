document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined' && !App.checkRole(['admin'])) return;
    if (typeof App !== 'undefined') {
        App.init();
    }

    let activeReport = 'ventas';
    let activePeriod = 'todo';

    // Elements
    const reportTabs = document.getElementById('reportTabs').querySelectorAll('.btn');
    const periodTabs = document.getElementById('periodTabs').querySelectorAll('.btn');
    const reportContent = document.getElementById('reportContent');
    const btnExport = document.getElementById('btnExport');
    const btnBackup = document.getElementById('btnBackup');
    const btnRestoreClick = document.getElementById('btnRestoreClick');
    const restoreFile = document.getElementById('restoreFile');

    // Event Listeners for Tabs
    reportTabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            reportTabs.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            const target = e.target;
            target.classList.remove('btn-secondary');
            target.classList.add('btn-primary');
            activeReport = target.dataset.tab;
            
            // Si es inventario, el filtro de tiempo no aplica tanto, pero lo dejamos
            loadReport();
        });
    });

    periodTabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            periodTabs.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            const target = e.target;
            target.classList.remove('btn-secondary');
            target.classList.add('btn-primary');
            activePeriod = target.dataset.period;
            loadReport();
        });
    });

    // Data Management
    btnExport.addEventListener('click', exportData);
    btnBackup.addEventListener('click', backupData);
    btnRestoreClick.addEventListener('click', () => restoreFile.click());
    restoreFile.addEventListener('change', restoreData);

    // Initial Load
    loadReport();

    function loadReport() {
        switch(activeReport) {
            case 'ventas': renderVentasReport(); break;
            case 'compras': renderComprasReport(); break;
            case 'inventario': renderInventarioReport(); break;
            case 'banco': renderBancoReport(); break;
        }
    }

    function filterByPeriod(items, dateField = 'fecha') {
        if (activePeriod === 'todo') return items;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return items.filter(item => {
            const d = new Date(item[dateField]);
            if (activePeriod === 'hoy') {
                return d >= today;
            } else if (activePeriod === 'semana') {
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                return d >= lastWeek;
            } else if (activePeriod === 'mes') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            return true;
        });
    }

    function renderVentasReport() {
        const ventas = DB.getAll(DB.KEYS.VENTAS) || [];
        const filteredVentas = filterByPeriod(ventas);

        const totalVentas = filteredVentas.length;
        const totalIngresos = filteredVentas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);

        // Calculate top products
        const productCounts = {};
        filteredVentas.forEach(v => {
            (v.items || []).forEach(item => {
                if (!productCounts[item.nombre]) {
                    productCounts[item.nombre] = 0;
                }
                productCounts[item.nombre] += parseInt(item.cantidad || 0);
            });
        });

        const sortedProducts = Object.keys(productCounts).map(k => ({ nombre: k, cantidad: productCounts[k] }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);

        const maxQty = sortedProducts.length > 0 ? sortedProducts[0].cantidad : 1;

        let topProductsHtml = sortedProducts.length > 0 ? sortedProducts.map(p => {
            const width = Math.max((p.cantidad / maxQty) * 100, 5);
            return `
                <div class="chart-bar">
                    <div class="chart-label">${p.nombre} (${p.cantidad} und.)</div>
                    <div class="chart-bar-fill" style="width: ${width}%; background: var(--accent-primary);"></div>
                </div>
            `;
        }).join('') : '<p class="text-muted">No hay datos de productos vendidos</p>';

        let tableRows = filteredVentas.map(v => `
            <tr>
                <td>${App.formatDateTime(v.fecha)}</td>
                <td>${v.cliente || 'Consumidor Final'}</td>
                <td>${(v.items || []).length} items</td>
                <td style="font-weight: 600;">${App.formatCurrency(v.total)}</td>
            </tr>
        `).join('');

        if (filteredVentas.length === 0) {
            tableRows = `<tr><td colspan="4" class="text-center" style="padding: 2rem;">No hay ventas registradas en este período</td></tr>`;
        }

        reportContent.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Total Ventas</span>
                        <h3 class="stat-value">${totalVentas}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-primary-bg); color: var(--accent-primary);">🛒</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Total Ingresos</span>
                        <h3 class="stat-value">${App.formatCurrency(totalIngresos)}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-success-bg); color: var(--accent-success);">💰</div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header"><h2>Top 5 Productos Más Vendidos</h2></div>
                <div class="card-body">
                    <div class="report-chart">
                        ${topProductsHtml}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>Detalle de Ventas</h2></div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Productos</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function renderComprasReport() {
        const compras = DB.getAll(DB.KEYS.COMPRAS) || [];
        const filteredCompras = filterByPeriod(compras);
        const proveedores = DB.getAll(DB.KEYS.PROVEEDORES) || [];

        const totalCompras = filteredCompras.length;
        const totalGasto = filteredCompras.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);

        let tableRows = filteredCompras.map(c => {
            const prov = proveedores.find(p => p.id === c.proveedorId);
            const provNombre = prov ? prov.nombre : 'N/A';
            return `
            <tr>
                <td>${App.formatDateTime(c.fecha)}</td>
                <td>${provNombre}</td>
                <td>${c.factura || 'N/A'}</td>
                <td style="font-weight: 600;">${App.formatCurrency(c.total)}</td>
            </tr>
        `}).join('');

        if (filteredCompras.length === 0) {
            tableRows = `<tr><td colspan="4" class="text-center" style="padding: 2rem;">No hay compras registradas en este período</td></tr>`;
        }

        reportContent.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Total Compras</span>
                        <h3 class="stat-value">${totalCompras}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-warning-bg); color: var(--accent-warning);">📥</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Total Gasto</span>
                        <h3 class="stat-value">${App.formatCurrency(totalGasto)}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-danger-bg); color: var(--accent-danger);">💸</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>Detalle de Compras</h2></div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Proveedor</th>
                                    <th>Factura</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function renderInventarioReport() {
        const productos = DB.getAll(DB.KEYS.PRODUCTOS) || [];
        
        const totalProductos = productos.length;
        const valorTotal = productos.reduce((sum, p) => sum + ((parseFloat(p.precio) || 0) * (parseInt(p.cantidad) || 0)), 0);
        
        const bajos = productos.filter(p => parseInt(p.cantidad) <= parseInt(p.stockMinimo));
        
        let bajosRows = bajos.map(p => `
            <tr>
                <td>${p.codigo}</td>
                <td>${p.nombre}</td>
                <td><span class="badge badge-danger">${p.cantidad}</span></td>
                <td>${p.stockMinimo}</td>
            </tr>
        `).join('');

        if (bajos.length === 0) {
            bajosRows = `<tr><td colspan="4" class="text-center" style="padding: 2rem;">No hay productos con bajo stock</td></tr>`;
        }

        // Agrupar por categoría
        const byCat = {};
        productos.forEach(p => {
            if (!byCat[p.categoria]) byCat[p.categoria] = { count: 0, valor: 0 };
            byCat[p.categoria].count++;
            byCat[p.categoria].valor += (parseFloat(p.precio) || 0) * (parseInt(p.cantidad) || 0);
        });

        let catRows = Object.keys(byCat).map(k => `
            <tr>
                <td>${k}</td>
                <td>${byCat[k].count}</td>
                <td style="font-weight: 600;">${App.formatCurrency(byCat[k].valor)}</td>
            </tr>
        `).join('');

        if (Object.keys(byCat).length === 0) {
            catRows = `<tr><td colspan="3" class="text-center" style="padding: 2rem;">No hay categorías registradas</td></tr>`;
        }

        reportContent.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Total Productos (Catálogo)</span>
                        <h3 class="stat-value">${totalProductos}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-info-bg); color: var(--accent-info);">📦</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Valor Total Inventario (PVP)</span>
                        <h3 class="stat-value">${App.formatCurrency(valorTotal)}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-success-bg); color: var(--accent-success);">💵</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Productos Bajo Stock</span>
                        <h3 class="stat-value" style="color: var(--accent-danger);">${bajos.length}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-danger-bg); color: var(--accent-danger);">⚠️</div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 20px;">
                <div class="card-header"><h2>Resumen por Categorías</h2></div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Categoría</th>
                                    <th>Variedad de Productos</th>
                                    <th>Valor Total</th>
                                </tr>
                            </thead>
                            <tbody>${catRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>Productos en Bajo Stock</h2></div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Stock Actual</th>
                                    <th>Stock Mínimo</th>
                                </tr>
                            </thead>
                            <tbody>${bajosRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function renderBancoReport() {
        const transacciones = DB.getAll(DB.KEYS.TRANSACCIONES) || [];
        const filtered = filterByPeriod(transacciones);

        const totals = { Depósito: 0, Retiro: 0, Recarga: 0, 'Pago de Servicio': 0 };
        const counts = { Depósito: 0, Retiro: 0, Recarga: 0, 'Pago de Servicio': 0 };

        filtered.forEach(t => {
            const m = parseFloat(t.monto) || 0;
            if (totals[t.tipo] !== undefined) {
                totals[t.tipo] += m;
                counts[t.tipo]++;
            }
        });

        const sumDep = totals['Depósito'];
        const sumRet = totals['Retiro'];
        const sumRec = totals['Recarga'];
        const sumPag = totals['Pago de Servicio'];

        let tableRows = filtered.map(t => {
            let badgeClass = 'badge-secondary';
            if (t.tipo === 'Depósito') badgeClass = 'badge-info';
            else if (t.tipo === 'Retiro') badgeClass = 'badge-warning';
            else if (t.tipo === 'Recarga') badgeClass = 'badge-success';

            return `
            <tr>
                <td>${App.formatDateTime(t.fecha)}</td>
                <td><span class="badge ${badgeClass}">${t.tipo}</span></td>
                <td>${t.cliente}</td>
                <td style="font-weight: 600;">${App.formatCurrency(t.monto)}</td>
            </tr>
        `}).join('');

        if (filtered.length === 0) {
            tableRows = `<tr><td colspan="4" class="text-center" style="padding: 2rem;">No hay transacciones registradas en este período</td></tr>`;
        }

        reportContent.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Depósitos (${counts['Depósito']})</span>
                        <h3 class="stat-value">${App.formatCurrency(sumDep)}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-info-bg); color: var(--accent-info);">💵</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Retiros (${counts['Retiro']})</span>
                        <h3 class="stat-value">${App.formatCurrency(sumRet)}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-warning-bg); color: var(--accent-warning);">💳</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Recargas (${counts['Recarga']})</span>
                        <h3 class="stat-value">${App.formatCurrency(sumRec)}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-success-bg); color: var(--accent-success);">📱</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-info">
                        <span class="stat-label">Pagos Serv. (${counts['Pago de Servicio']})</span>
                        <h3 class="stat-value">${App.formatCurrency(sumPag)}</h3>
                    </div>
                    <div class="stat-card-icon" style="background: var(--accent-secondary-bg); color: var(--accent-secondary);">📄</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header"><h2>Detalle de Transacciones</h2></div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    function exportData() {
        try {
            const data = DB.exportAll();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `ebenezer-backup-${date}.json`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            App.showNotification('Datos exportados correctamente', 'success');
        } catch (e) {
            App.showNotification('Error al exportar los datos', 'danger');
        }
    }

    function backupData() {
        if (confirm('¿Está seguro de que desea crear un respaldo de toda la base de datos? Esto descargará un archivo a su computadora.')) {
            exportData();
        }
    }

    function restoreData(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (confirm('¿ATENCIÓN: Restaurar una copia de seguridad sobrescribirá TODOS los datos actuales. ¿Desea continuar?')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const contents = e.target.result;
                try {
                    const success = DB.importAll(contents);
                    if (success) {
                        App.showNotification('Base de datos restaurada con éxito. Recargando...', 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        App.showNotification('Error: Formato de archivo no válido', 'danger');
                    }
                } catch (error) {
                    App.showNotification('Error al procesar el archivo', 'danger');
                }
            };
            reader.readAsText(file);
        }
        
        // Reset file input
        event.target.value = '';
    }
});
