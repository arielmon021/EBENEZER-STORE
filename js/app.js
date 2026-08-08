const App = {
    init() {
        if (typeof DB !== 'undefined') {
            DB.init();
        }
        this.checkAuth();
        this.initSidebar();
        this.setActivePage();
        this.initModals();
    },

    checkAuth() {
        const path = window.location.pathname;
        const isIndex = path.endsWith('index.html') || path.endsWith('/');
        
        if (typeof DB !== 'undefined') {
            const isLoggedIn = DB.isLoggedIn();
            
            if (!isLoggedIn && !isIndex) {
                window.location.href = 'index.html';
            } else if (isLoggedIn && isIndex) {
                window.location.href = 'dashboard.html';
            }
        }
    },

    initSidebar() {
        // Load user info
        if (typeof DB !== 'undefined' && DB.isLoggedIn()) {
            const session = DB.getSession();
            const userNameEl = document.getElementById('userName');
            if (userNameEl && session) {
                userNameEl.textContent = session.nombre || session.username;
            }
        }

        // Logout
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if (this.confirmAction('¿Está seguro de que desea cerrar sesión?')) {
                    if (typeof DB !== 'undefined') {
                        DB.logout();
                        window.location.href = 'index.html';
                    }
                }
            });
        }

        // Mobile Toggle & Overlay
        const mobileToggle = document.querySelector('.mobile-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileToggle && sidebar) {
            // Create overlay if it doesn't exist
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }

            const toggleSidebar = () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            };

            mobileToggle.addEventListener('click', toggleSidebar);
            overlay.addEventListener('click', toggleSidebar);
        }

        // Role-based menu visibility
        const session = DB.getSession();
        if (session && session.rol === 'cliente') {
            const restrictedPages = ['inventario', 'ventas', 'compras', 'proveedores', 'banco', 'reportes'];
            document.querySelectorAll('.nav-item').forEach(item => {
                const page = item.getAttribute('data-page');
                if (restrictedPages.includes(page)) {
                    item.style.display = 'none';
                }
            });
        }
    },

    setActivePage() {
        const path = window.location.pathname;
        let page = path.split('/').pop().replace('.html', '');
        if (!page || page === 'index') return;

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === page) {
                item.classList.add('active');
            }
        });
    },

    showNotification(message, type = 'info') {
        // Remove existing notifications if too many
        const existing = document.querySelectorAll('.notification');
        if (existing.length > 3) {
            existing[0].remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                     type === 'danger' ? '❌' : 
                     type === 'warning' ? '⚠️' : 'ℹ️';

        notification.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger reflow for animation
        void notification.offsetWidth;
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    },

    initModals() {
        // Modal closing mechanisms
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Click outside modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    formatCurrency(amount) {
        const value = parseFloat(amount);
        if (isNaN(value)) return '$0.00';
        return '$' + value.toFixed(2);
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    },

    formatDateTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    },

    getUserRole() {
        const session = this.getSession ? DB.getSession() : null;
        return session ? session.rol : null;
    },

    isAdmin() {
        return this.getUserRole() === 'admin';
    },

    checkRole(allowedRoles) {
        const session = DB.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return false;
        }
        if (!allowedRoles.includes(session.rol)) {
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    },

    confirmAction(message) {
        return window.confirm(message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
