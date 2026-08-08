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

    getAll(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id) || null;
    },

    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    add(key, item) {
        const items = this.getAll(key);
        items.push(item);
        this.save(key, items);
        return item;
    },

    update(key, id, updates) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            this.save(key, items);
            return items[index];
        }
        return null;
    },

    remove(key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(item => item.id !== id);
        this.save(key, filtered);
    },

    search(key, field, query) {
        const items = this.getAll(key);
        if (!query) return items;
        const lowerQuery = query.toLowerCase();
        return items.filter(item => 
            item[field] !== undefined && item[field] !== null && item[field].toString().toLowerCase().includes(lowerQuery)
        );
    },

    generateId() {
        return Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
    },

    login(username, password) {
        const users = this.getAll(this.KEYS.USERS);
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const sessionData = { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol };
            this.save(this.KEYS.SESSION, sessionData);
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem(this.KEYS.SESSION);
    },

    isLoggedIn() {
        return !!localStorage.getItem(this.KEYS.SESSION);
    },

    getSession() {
        const session = localStorage.getItem(this.KEYS.SESSION);
        return session ? JSON.parse(session) : null;
    },

    init() {
        if (!localStorage.getItem(this.KEYS.USERS)) {
            const defaultUsers = [
                {"id":"user-1","username":"admin","password":"admin123","nombre":"Administrador","rol":"admin"},
                {"id":"user-2","username":"adonis","password":"Adonis123","nombre":"Adonis Anastasio","rol":"cliente"}
            ];
            this.save(this.KEYS.USERS, defaultUsers);
            
            const defaultCategories = ["Útiles Escolares","Artículos de Oficina","Juguetes","Mochilas","Accesorios","Productos de Belleza","Otros"];
            this.save(this.KEYS.CATEGORIAS, defaultCategories);
            
            const defaultProducts = [
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
            ];
            this.save(this.KEYS.PRODUCTOS, defaultProducts);
            
            const defaultProviders = [
                {"id":"prov-1","nombre":"Distribuidora Escolar S.A.","ruc":"0991234567001","telefono":"0991234567","email":"dist.escolar@email.com","direccion":"Guayaquil"},
                {"id":"prov-2","nombre":"Importadora Juguetes & Más","ruc":"0997654321001","telefono":"0997654321","email":"importadora@email.com","direccion":"Guayaquil"},
                {"id":"prov-3","nombre":"Cosméticos del Pacífico","ruc":"0993456789001","telefono":"0993456789","email":"cosmeticos@email.com","direccion":"Puná"}
            ];
            this.save(this.KEYS.PROVEEDORES, defaultProviders);
            
            const now = new Date().toISOString();
            const defaultSales = [
                {"id":"venta-1","fecha":now,"items":[{"productoId":"prod-1","nombre":"Cuaderno Universitario 100H","cantidad":2,"precio":1.75,"subtotal":3.50},{"productoId":"prod-4","nombre":"Bolígrafo Azul","cantidad":3,"precio":0.40,"subtotal":1.20}],"total":4.70,"pago":5.00,"cambio":0.30,"cliente":"Consumidor Final"},
                {"id":"venta-2","fecha":now,"items":[{"productoId":"prod-5","nombre":"Mochila Escolar","cantidad":1,"precio":15.00,"subtotal":15.00}],"total":15.00,"pago":15.00,"cambio":0.00,"cliente":"María López"},
                {"id":"venta-3","fecha":now,"items":[{"productoId":"prod-2","nombre":"Lápiz HB","cantidad":5,"precio":0.35,"subtotal":1.75},{"productoId":"prod-3","nombre":"Borrador Blanco","cantidad":2,"precio":0.25,"subtotal":0.50}],"total":2.25,"pago":3.00,"cambio":0.75,"cliente":"Consumidor Final"}
            ];
            this.save(this.KEYS.VENTAS, defaultSales);
            this.save(this.KEYS.COMPRAS, []);
            this.save(this.KEYS.TRANSACCIONES, []);
        }
    },

    exportAll() {
        const data = {};
        Object.values(this.KEYS).forEach(key => {
            data[key] = this.getAll(key);
        });
        return JSON.stringify(data);
    },

    importAll(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.values(this.KEYS).forEach(key => {
                if (data[key]) {
                    this.save(key, data[key]);
                }
            });
            return true;
        } catch (e) {
            console.error("Error importing data", e);
            return false;
        }
    },

    getTodaySales() {
        const sales = this.getAll(this.KEYS.VENTAS);
        const today = new Date().toDateString();
        return sales.filter(sale => new Date(sale.fecha).toDateString() === today);
    },

    getLowStockProducts() {
        const products = this.getAll(this.KEYS.PRODUCTOS);
        return products.filter(p => p.cantidad <= p.stockMinimo);
    },

    getTopProducts(limit = 5) {
        const sales = this.getAll(this.KEYS.VENTAS);
        const productCounts = {};
        
        sales.forEach(sale => {
            if(sale.items) {
                sale.items.forEach(item => {
                    if (!productCounts[item.productoId]) {
                        productCounts[item.productoId] = { id: item.productoId, nombre: item.nombre, cantidad: 0, ingresos: 0 };
                    }
                    productCounts[item.productoId].cantidad += item.cantidad;
                    productCounts[item.productoId].ingresos += item.subtotal;
                });
            }
        });
        
        return Object.values(productCounts)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, limit);
    },

    getMonthlySalesTotal() {
        const sales = this.getAll(this.KEYS.VENTAS);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let total = 0;
        sales.forEach(sale => {
            const date = new Date(sale.fecha);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                total += parseFloat(sale.total || 0);
            }
        });
        return total;
    }
};
