# EBENEZER STORE — Design System Reference

## PROJECT INFO
- Name: EBENEZER STORE — Sistema de Control de Ventas e Inventario
- Path: C:\Users\Adonis\.gemini\antigravity\scratch\ebenezer-store
- Tech: HTML5, CSS3, JavaScript ES6+ (NO frameworks, NO libraries except Google Fonts)
- Storage: localStorage
- Font: Inter from Google Fonts
- Theme: Premium dark mode with glassmorphism accents

## DIRECTORY STRUCTURE
```
ebenezer-store/
├── index.html           (Login)
├── dashboard.html
├── productos.html
├── inventario.html
├── ventas.html
├── compras.html
├── proveedores.html
├── banco.html
├── reportes.html
├── css/
│   └── style.css
├── js/
│   ├── storage.js
│   ├── app.js
│   ├── productos.js
│   ├── inventario.js
│   ├── ventas.js
│   ├── compras.js
│   ├── proveedores.js
│   ├── banco.js
│   └── reportes.js
└── README.md
```

## COLOR PALETTE (CSS Custom Properties)
```css
:root {
    --bg-primary: #0a0e1a;
    --bg-secondary: #111627;
    --bg-card: #1a1f36;
    --bg-card-hover: #222845;
    --bg-sidebar: #0d1025;
    --bg-input: #151a30;
    --bg-overlay: rgba(0, 0, 0, 0.6);
    --accent-primary: #6366f1;
    --accent-primary-hover: #818cf8;
    --accent-primary-glow: rgba(99, 102, 241, 0.2);
    --accent-secondary: #8b5cf6;
    --accent-success: #10b981;
    --accent-success-bg: rgba(16, 185, 129, 0.1);
    --accent-danger: #ef4444;
    --accent-danger-bg: rgba(239, 68, 68, 0.1);
    --accent-warning: #f59e0b;
    --accent-warning-bg: rgba(245, 158, 11, 0.1);
    --accent-info: #3b82f6;
    --accent-info-bg: rgba(59, 130, 246, 0.1);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --border-color: #1e293b;
    --border-light: rgba(255, 255, 255, 0.06);
    --glass-bg: rgba(26, 31, 54, 0.8);
    --glass-border: rgba(255, 255, 255, 0.08);
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);
    --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
    --sidebar-width: 260px;
    --sidebar-collapsed: 0px;
    --header-height: 70px;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

## SIDEBAR HTML (Use EXACTLY this in all pages EXCEPT index.html/login)
Set the correct nav-item as "active" based on the current page by adding the class "active" to the matching <a>.

```html
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="logo">
            <span class="logo-icon">🏪</span>
            <span class="logo-text">EBENEZER STORE</span>
        </div>
    </div>
    <nav class="sidebar-nav">
        <a href="dashboard.html" class="nav-item" data-page="dashboard">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
        </a>
        <a href="productos.html" class="nav-item" data-page="productos">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Productos</span>
        </a>
        <a href="inventario.html" class="nav-item" data-page="inventario">
            <span class="nav-icon">📋</span>
            <span class="nav-text">Inventario</span>
        </a>
        <a href="ventas.html" class="nav-item" data-page="ventas">
            <span class="nav-icon">🛒</span>
            <span class="nav-text">Punto de Venta</span>
        </a>
        <a href="compras.html" class="nav-item" data-page="compras">
            <span class="nav-icon">📥</span>
            <span class="nav-text">Compras</span>
        </a>
        <a href="proveedores.html" class="nav-item" data-page="proveedores">
            <span class="nav-icon">🏭</span>
            <span class="nav-text">Proveedores</span>
        </a>
        <a href="banco.html" class="nav-item" data-page="banco">
            <span class="nav-icon">🏦</span>
            <span class="nav-text">Banco del Barrio</span>
        </a>
        <a href="reportes.html" class="nav-item" data-page="reportes">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Reportes</span>
        </a>
    </nav>
    <div class="sidebar-footer">
        <div class="user-info">
            <div class="user-avatar">👤</div>
            <div class="user-details">
                <span class="user-name" id="userName">Administrador</span>
                <span class="user-role">Admin</span>
            </div>
        </div>
        <button class="btn-logout" id="btnLogout" title="Cerrar Sesión">⏻</button>
    </div>
</aside>
```

## CSS CLASS REFERENCE
Layout: .sidebar, .sidebar-header, .sidebar-nav, .sidebar-footer, .nav-item, .nav-item.active, .nav-icon, .nav-text, .logo, .logo-icon, .logo-text, .main-content, .page-header, .page-body, .header-left, .header-right, .mobile-toggle, .user-info, .user-avatar, .user-details, .user-name, .user-role, .btn-logout
Login: .login-page, .login-bg, .orb, .orb-1, .orb-2, .orb-3, .login-container, .login-card, .login-header, .login-body, .login-footer
Cards: .card, .card-header, .card-body, .card-footer
Stats: .stats-grid, .stat-card, .stat-card-icon, .stat-card-info, .stat-value, .stat-label, .stat-change, .stat-change.positive, .stat-change.negative
Tables: .table-container, .data-table, .table-actions
Forms: .form-group, .form-label, .form-control, .form-row, .form-actions, .form-text
Buttons: .btn, .btn-primary, .btn-success, .btn-danger, .btn-warning, .btn-secondary, .btn-sm, .btn-icon, .btn-group
Modals: .modal, .modal.active, .modal-content, .modal-header, .modal-body, .modal-footer, .modal-close
Notifications: .notification, .notification.show, .notification.success, .notification.danger, .notification.warning, .notification.info
Badges: .badge, .badge-success, .badge-danger, .badge-warning, .badge-info
Search: .search-box, .search-input
Filters: .filters-bar, .filter-group
Empty State: .empty-state, .empty-icon, .empty-text
POS: .pos-layout, .pos-products, .pos-cart, .pos-product-grid, .pos-product-card, .cart-items, .cart-item, .cart-summary, .cart-total
Reports: .report-section, .report-chart, .chart-bar, .chart-bar-fill, .chart-label

## STORAGE.JS API (DB object)

```javascript
const DB = {
    KEYS: {
        SESSION: 'eb_session',
        USERS: 'eb_users',
        PRODUCTOS: 'eb_productos',
        CATEGORIAS: 'eb_categorias',
        PROVEEDORES: 'eb_proveedores',
        VENTAS: 'eb_ventas',
        COMPRAS: 'eb_compras',
        TRANSACCIONES: 'eb_transacciones'
    },
    getAll(key) {},
    getById(key, id) {},
    save(key, data) {},
    add(key, item) {},
    update(key, id, updates) {},
    remove(key, id) {},
    search(key, field, query) {},
    generateId() {},
    login(username, password) {},
    logout() {},
    isLoggedIn() {},
    getSession() {},
    init() {},
    exportAll() {},
    importAll(json) {},
    getTodaySales() {},
    getLowStockProducts() {},
    getTopProducts(limit) {},
    getMonthlySalesTotal() {},
};
```

## APP.JS API (App object)

```javascript
const App = {
    init() {},
    checkAuth() {},
    initSidebar() {},
    setActivePage() {},
    showNotification(message, type) {},
    openModal(modalId) {},
    closeModal(modalId) {},
    closeAllModals() {},
    formatCurrency(amount) {},
    formatDate(dateString) {},
    formatDateTime(dateString) {},
    confirmAction(message) {},
};
```

## SEED DATA

### Default Users
```json
[{"id":"user-1","username":"admin","password":"admin123","nombre":"Administrador","rol":"admin"}]
```

### Default Categories
```json
["Útiles Escolares","Artículos de Oficina","Juguetes","Mochilas","Accesorios","Productos de Belleza","Otros"]
```

### Default Products
```json
[
    {"id":"prod-1","codigo":"UE-001","nombre":"Cuaderno Universitario 100H","categoria":"Útiles Escolares","precio":1.75,"costo":1.20,"cantidad":50,"stockMinimo":10,"proveedor":"prov-1"},
    {"id":"prod-2","codigo":"UE-002","nombre":"Lápiz HB","categoria":"Útiles Escolares","precio":0.35,"costo":0.20,"cantidad":100,"stockMinimo":20,"proveedor":"prov-1"},
    {"id":"prod-3","codigo":"UE-003","nombre":"Borrador Blanco","categoria":"Útiles Escolares","precio":0.25,"costo":0.15,"cantidad":80,"stockMinimo":15,"proveedor":"prov-1"},
    {"id":"prod-4","codigo":"UE-004","nombre":"Bolígrafo Azul","categoria":"Útiles Escolares","precio":0.40,"costo":0.25,"cantidad":120,"stockMinimo":25,"proveedor":"prov-1"},
    {"id":"prod-5","codigo":"MO-001","nombre":"Mochila Escolar","categoria":"Mochilas","precio":15.00,"costo":10.00,"cantidad":12,"stockMinimo":3,"proveedor":"prov-2"},
    {"id":"prod-6","codigo":"UE-005","nombre":"Regla 30cm","categoria":"Útiles Escolares","precio":0.50,"costo":0.30,"cantidad":40,"stockMinimo":10,"proveedor":"prov-1"},
    {"id":"prod-7","codigo":"UE-006","nombre":"Tijera Escolar","categoria":"Útiles Escolares","precio":1.00,"costo":0.65,"cantidad":30,"stockMinimo":8,"proveedor":"prov-1"},
    {"id":"prod-8","codigo":"UE-007","nombre":"Goma Eva A4","categoria":"Útiles Escolares","precio":0.75,"costo":0.45,"cantidad":60,"stockMinimo":15,"proveedor":"prov-1"},
    {"id":"prod-9","codigo":"PB-001","nombre":"Esmalte de Uñas","categoria":"Productos de Belleza","precio":2.00,"costo":1.30,"cantidad":25,"stockMinimo":5,"proveedor":"prov-3"},
    {"id":"prod-10","codigo":"JU-001","nombre":"Muñeca Pequeña","categoria":"Juguetes","precio":5.00,"costo":3.50,"cantidad":8,"stockMinimo":2,"proveedor":"prov-2"}
]
```

### Default Providers
```json
[
    {"id":"prov-1","nombre":"Distribuidora Escolar S.A.","ruc":"0991234567001","telefono":"0991234567","email":"dist.escolar@email.com","direccion":"Guayaquil"},
    {"id":"prov-2","nombre":"Importadora Juguetes & Más","ruc":"0997654321001","telefono":"0997654321","email":"importadora@email.com","direccion":"Guayaquil"},
    {"id":"prov-3","nombre":"Cosméticos del Pacífico","ruc":"0993456789001","telefono":"0993456789","email":"cosmeticos@email.com","direccion":"Puná"}
]
```

### Sample Sales (use new Date().toISOString() for dates at init time)
```json
[
    {"id":"venta-1","items":[{"productoId":"prod-1","nombre":"Cuaderno Universitario 100H","cantidad":2,"precio":1.75,"subtotal":3.50},{"productoId":"prod-4","nombre":"Bolígrafo Azul","cantidad":3,"precio":0.40,"subtotal":1.20}],"total":4.70,"pago":5.00,"cambio":0.30,"cliente":"Consumidor Final"},
    {"id":"venta-2","items":[{"productoId":"prod-5","nombre":"Mochila Escolar","cantidad":1,"precio":15.00,"subtotal":15.00}],"total":15.00,"pago":15.00,"cambio":0.00,"cliente":"María López"},
    {"id":"venta-3","items":[{"productoId":"prod-2","nombre":"Lápiz HB","cantidad":5,"precio":0.35,"subtotal":1.75},{"productoId":"prod-3","nombre":"Borrador Blanco","cantidad":2,"precio":0.25,"subtotal":0.50}],"total":2.25,"pago":3.00,"cambio":0.75,"cliente":"Consumidor Final"}
]
```

## IMPORTANT RULES
1. ALL code must be COMPLETE and FUNCTIONAL. No pseudocode, no placeholders, no TODO comments.
2. Use semantic HTML5.
3. All interactive elements must have unique IDs.
4. Currency is USD ($).
5. Date format: DD/MM/YYYY.
6. Notification div goes at end of body in ALL pages.
7. Tables show empty state when no data.
8. All pages except login check auth on load.
