# EBENEZER STORE — Sistema de Control de Ventas e Inventario

EBENEZER STORE es una aplicación web local diseñada para la gestión completa de un bazar y papelería. Permite llevar el control del inventario, realizar ventas mediante un Punto de Venta (POS), administrar compras, proveedores, y manejar las transacciones del "Banco del Barrio", todo desde una interfaz moderna con un tema oscuro tipo *glassmorphism*.

## Características (Módulos)

El sistema se compone de los siguientes módulos:

1. **Dashboard:** Vista principal con indicadores clave, ventas del día, inventario bajo y productos más vendidos.
2. **Productos:** CRUD de productos, categorías y códigos, con alertas de stock mínimo.
3. **Inventario:** Vista de existencias y valorizaciones del inventario.
4. **Punto de Venta (Ventas):** Interfaz rápida para registro de ventas, carrito de compras y emisión de comprobantes (simulada).
5. **Compras:** Registro de compras y reabastecimiento de inventario que actualiza el stock automáticamente.
6. **Proveedores:** Administración de la lista de proveedores autorizados.
7. **Banco del Barrio:** Registro de transacciones bancarias, depósitos, retiros y pago de servicios básicos.
8. **Reportes:** Visualización de estadísticas de ventas, compras, inventario y movimientos bancarios. Permite hacer copias de seguridad (Backup) y restaurar datos.

## Tecnologías Utilizadas

- **HTML5:** Semántico y estructurado.
- **CSS3:** Variables CSS para el tema, Flexbox/Grid para diseño responsivo y efectos modernos.
- **JavaScript (ES6+):** Lógica del lado del cliente, manipulación del DOM y manejo de eventos.
- **localStorage:** Base de datos en el navegador del usuario para almacenamiento persistente de la información.
- *Sin frameworks externos, dependencias de terceros, ni librerías, excepto Google Fonts.*

## Cómo Ejecutar el Proyecto

Dado que el sistema utiliza `localStorage` y no tiene un servidor backend:

1. Descarga o clona este repositorio en tu computadora.
2. Ve a la carpeta `ebenezer-store/`.
3. Abre el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari).

### Credenciales por Defecto

Para ingresar al sistema por primera vez, utiliza:
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## Estructura del Proyecto

```text
ebenezer-store/
├── index.html           (Inicio de Sesión)
├── dashboard.html       (Panel principal)
├── productos.html       (Catálogo de Productos)
├── inventario.html      (Existencias)
├── ventas.html          (Punto de Venta - POS)
├── compras.html         (Ingreso de Mercadería)
├── proveedores.html     (Directorio)
├── banco.html           (Operaciones Bancarias)
├── reportes.html        (Informes y Respaldo)
├── css/
│   └── style.css        (Estilos globales y componentes)
├── js/
│   ├── storage.js       (Manejador de Base de Datos Local - DB)
│   ├── app.js           (Funciones globales, UI y Auth - App)
│   ├── productos.js     (Lógica del módulo)
│   ├── inventario.js    (Lógica del módulo)
│   ├── ventas.js        (Lógica del módulo)
│   ├── compras.js       (Lógica del módulo)
│   ├── proveedores.js   (Lógica del módulo)
│   ├── banco.js         (Lógica del módulo)
│   └── reportes.js      (Lógica del módulo)
└── README.md            (Documentación)
```

## Autor

**Proyecto de Análisis y Diseño de Sistemas**  
Desarrollado como una solución integral de escritorio web para negocios minoristas.
