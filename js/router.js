/**
 * Router - Navigation between screens
 */
const Router = {
    routes: {},
    currentRoute: null,

    // Register a route
    register: function(path, config) {
        this.routes[path] = config;
    },

    // Navigate to route
    navigate: function(path, params = {}) {
        const route = this.routes[path];
        if (!route) {
            console.error('Route not found:', path);
            return;
        }

        this.currentRoute = path;
        const content = document.getElementById('content-area');
        
        // Update active nav
        document.querySelectorAll('#main-nav a').forEach(a => {
            a.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
            a.classList.add('text-slate-300');
            if (a.dataset.route === path) {
                a.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
                a.classList.remove('text-slate-300');
            }
        });

        // Update page title
        const titleEl = document.getElementById('page-title');
        if (titleEl) {
            titleEl.innerHTML = `<i class="fa-solid ${route.icon || 'fa-circle'} text-slate-400"></i> ${route.title}`;
        }

        // Render content
        try {
            content.innerHTML = `<div class="screen-enter">${route.render(params)}</div>`;
            if (route.afterRender) {
                setTimeout(() => route.afterRender(params), 50);
            }
        } catch (e) {
            console.error('Render error:', e);
            content.innerHTML = `<div class="text-center py-20 text-red-500">
                <i class="fa-solid fa-triangle-exclamation text-4xl mb-3"></i>
                <p>حدث خطأ في تحميل الشاشة</p>
                <p class="text-sm text-slate-500 mt-2">${e.message}</p>
            </div>`;
        }
    }
};