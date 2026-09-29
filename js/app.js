/**
 * Main Application
 */
const App = {
    navMenu: [
        {
            section: 'العمليات اليومية',
            items: [
                { path: 'pos', title: 'نقطة البيع', icon: 'fa-cash-register', permission: 'pos' },
                { path: 'tables', title: 'الطاولات', icon: 'fa-chair', permission: 'pos' },
                { path: 'kitchen', title: 'شاشة المطبخ', icon: 'fa-fire-burner', permission: 'kitchen' },
                { path: 'invoices', title: 'الطلبات والفواتير', icon: 'fa-file-invoice-dollar', permission: 'invoices' }
            ]
        },
        {
            section: 'الإدارة',
            items: [
                { path: 'menu', title: 'قائمة الطعام', icon: 'fa-book-open', permission: 'menu' },
                { path: 'inventory', title: 'المخزون', icon: 'fa-boxes-stacked', permission: 'inventory' },
                { path: 'purchases', title: 'المشتريات', icon: 'fa-truck', permission: 'purchases' },
                { path: 'customers', title: 'العملاء', icon: 'fa-users', permission: 'customers' },
                { path: 'suppliers', title: 'الموردين', icon: 'fa-handshake', permission: 'suppliers' }
            ]
        },
        
            {
    section: 'المالية والمحاسبة',
    items: [
        { path: 'vouchers', title: 'السندات والدفعات', icon: 'fa-money-check-dollar', permission: 'vouchers' },
        { path: 'einvoice', title: 'الفاتورة الإلكترونية', icon: 'fa-file-invoice', permission: 'invoices' },  // ✅ جديد
        { path: 'accounts', title: 'كشوف الحسابات', icon: 'fa-chart-line', permission: 'accounts' },
        { path: 'cashbox', title: 'الصناديق', icon: 'fa-vault', permission: 'cashbox' },
        { path: 'reports', title: 'التقارير', icon: 'fa-chart-pie', permission: 'reports' }
    ]
},
        {
            section: 'الموارد البشرية',
            items: [
                { path: 'employees', title: 'الموظفين', icon: 'fa-user-tie', permission: 'employees' },
                { path: 'payroll', title: 'رواتب الموظفين', icon: 'fa-money-bill-wave', permission: 'payroll' }
            ]
        },
        {
            section: 'النظام',
            items: [
                { path: 'ai', title: 'المساعد الذكي', icon: 'fa-robot', permission: 'all' },
                { path: 'users', title: 'المستخدمين والصلاحيات', icon: 'fa-users-gear', permission: 'users' },
                { path: 'settings', title: 'الإعدادات', icon: 'fa-gear', permission: 'settings' },
                { path: 'logs', title: 'سجل العمليات', icon: 'fa-clock-rotate-left', permission: 'logs' },
                { path: 'guide', title: 'دليل الاستخدام', icon: 'fa-circle-question', permission: 'all' },
                { path: 'developer', title: 'بيانات النظام والمطور', icon: 'fa-laptop-code', permission: 'all' }
            ]
        }
    ],

    buildMenu: function() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        let html = '';

        this.navMenu.forEach(section => {
            const visibleItems = section.items.filter(item => {
                if (item.permission === 'all') return true;
                return Utils.hasPermission(item.permission);
            });
            if (visibleItems.length === 0) return;

            html += `<div class="pt-3 mt-2 first:pt-0 first:mt-0">`;
            html += `<p class="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">${section.section}</p>`;
            visibleItems.forEach(item => {
                html += `
                    <a href="#${item.path}" data-route="${item.path}" 
                       class="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm">
                        <i class="fa-solid ${item.icon} w-5 text-center"></i>
                        <span>${item.title}</span>
                    </a>
                `;
            });
            html += `</div>`;
        });

        nav.innerHTML = html;

        nav.querySelectorAll('a').forEach(a => {
            a.onclick = (e) => {
                e.preventDefault();
                Router.navigate(a.dataset.route);
                if (window.innerWidth < 1024) App.toggleSidebar();
            };
        });
    },

    registerScreens: function() {
        try {
            Router.register('pos', { title: 'نقطة البيع', icon: 'fa-cash-register',
                render: (params) => POS.render(params), afterRender: (params) => POS.afterRender(params) });
            Router.register('tables', { title: 'إدارة الطاولات', icon: 'fa-chair',
                render: () => Tables.render(), afterRender: () => Tables.afterRender() });
            Router.register('kitchen', { title: 'شاشة المطبخ', icon: 'fa-fire-burner',
                render: () => Kitchen.render(), afterRender: () => Kitchen.afterRender() });
            Router.register('invoices', { title: 'الطلبات والفواتير', icon: 'fa-file-invoice-dollar',
                render: () => Invoices.render(), afterRender: () => Invoices.afterRender() });
            Router.register('menu', { title: 'قائمة الطعام', icon: 'fa-book-open',
                render: () => MenuScreen.render(), afterRender: () => MenuScreen.afterRender() });
            Router.register('inventory', { title: 'المخزون', icon: 'fa-boxes-stacked',
                render: () => Inventory.render(), afterRender: () => Inventory.afterRender() });
            Router.register('purchases', { title: 'المشتريات', icon: 'fa-truck',
                render: () => Purchases.render(), afterRender: () => Purchases.afterRender() });
            Router.register('customers', { title: 'العملاء', icon: 'fa-users',
                render: () => Customers.render(), afterRender: () => Customers.afterRender() });
            Router.register('suppliers', { title: 'الموردين', icon: 'fa-handshake',
                render: () => Suppliers.render(), afterRender: () => Suppliers.afterRender() });
            Router.register('vouchers', { title: 'السندات والدفعات', icon: 'fa-money-check-dollar',
                render: () => Vouchers.render(), afterRender: () => Vouchers.afterRender() });
                Router.register('einvoice', { title: 'الفاتورة الإلكترونية', icon: 'fa-file-invoice',
    render: () => EInvoice.render(), afterRender: () => EInvoice.afterRender() });
            Router.register('accounts', { title: 'كشوف الحسابات', icon: 'fa-chart-line',
                render: () => Accounts.render(), afterRender: () => Accounts.afterRender() });
            Router.register('cashbox', { title: 'الصناديق', icon: 'fa-vault',
                render: () => Cashbox.render(), afterRender: () => Cashbox.afterRender() });
            Router.register('reports', { title: 'التقارير', icon: 'fa-chart-pie',
                render: () => Reports.render(), afterRender: () => Reports.afterRender() });
            Router.register('employees', { title: 'الموظفين', icon: 'fa-user-tie',
                render: () => Employees.render(), afterRender: () => Employees.afterRender() });
            Router.register('payroll', { title: 'رواتب الموظفين', icon: 'fa-money-bill-wave',
                render: () => Payroll.render(), afterRender: () => Payroll.afterRender() });
            Router.register('users', { title: 'المستخدمين والصلاحيات', icon: 'fa-users-gear',
                render: () => Users.render(), afterRender: () => Users.afterRender() });
            Router.register('settings', { title: 'الإعدادات', icon: 'fa-gear',
                render: () => Settings.render(), afterRender: () => Settings.afterRender() });
            Router.register('logs', { title: 'سجل العمليات', icon: 'fa-clock-rotate-left',
                render: () => Logs.render(), afterRender: () => Logs.afterRender() });
            Router.register('guide', { title: 'دليل الاستخدام', icon: 'fa-circle-question',
                render: () => Guide.render() });
            Router.register('ai', { title: 'المساعد الذكي', icon: 'fa-robot',
                render: () => AI.render(), afterRender: () => AI.afterRender() });
            Router.register('developer', { title: 'بيانات النظام والمطور', icon: 'fa-laptop-code',
                render: () => Developer.render() });
        } catch (e) {
            console.error('Screen registration error:', e);
        }
    },

    init: function() {
        console.log('App.init starting...');

        // ✅ 1. ربط الدوال العامة أولاً (حتى لا تفشل)
        window.toggleSidebar = () => App.toggleSidebar();
        window.openQuickSearch = () => App.openQuickSearch();
        window.toggleNotifications = () => App.toggleNotifications();
        window.toggleUserMenu = () => App.toggleUserMenu();
        window.logout = () => App.logout();
        
        console.log('Global functions bound.');

        // 2. فحص الجلسة
        const session = sessionStorage.getItem('ibra_current_user');
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        // 3. بناء القائمة
        try {
            this.buildMenu();
            console.log('Menu built.');
        } catch (e) {
            console.error('buildMenu error:', e);
        }

        // 4. تسجيل الشاشات
        try {
            this.registerScreens();
            console.log('Screens registered.');
        } catch (e) {
            console.error('registerScreens error:', e);
        }

        // 5. تحديث بيانات المستخدم
        try {
            this.updateUserInfo();
        } catch (e) {
            console.error('updateUserInfo error:', e);
        }
        
        // 6. إخفاء السايدبار افتراضياً
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.transform = 'translateX(100%)';
        
        // 7. إصدار النظام
        const sys = DB.get('system') || {};
        const versionEl = document.getElementById('sidebar-version');
        if (versionEl) versionEl.innerText = `${sys.nameEn || ''} v${sys.version || ''}`;

        // 8. التنقل الأولي
        const hash = window.location.hash.replace('#', '') || 'pos';
        try {
            Router.navigate(hash);
            console.log('Initial navigation done.');
        } catch (e) {
            console.error('Router.navigate error:', e);
        }

        window.addEventListener('hashchange', () => {
            const route = window.location.hash.replace('#', '') || 'pos';
            Router.navigate(route);
        });

        // 9. اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                App.openQuickSearch();
            }
        });

        // 10. إغلاق قائمة المستخدم عند النقر خارجها
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('user-menu');
            if (menu && !menu.classList.contains('hidden')) {
                if (!e.target.closest('#user-menu') && !e.target.closest('[data-user-menu-toggle]')) {
                    menu.classList.add('hidden');
                }
            }
        });
        
        console.log('App.init completed successfully.');
    },

    toggleSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        const currentTransform = sidebar.style.transform;
        const isHidden = currentTransform === 'translateX(100%)' || currentTransform === '';
        
        if (isHidden) {
            sidebar.style.transform = 'translateX(0)';
            
            let overlay = document.getElementById('sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'sidebar-overlay';
                overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30';
                overlay.style.transition = 'opacity 0.3s ease';
                overlay.style.opacity = '1';
                overlay.onclick = () => App.toggleSidebar();
                document.body.appendChild(overlay);
            } else {
                overlay.style.opacity = '1';
            }
        } else {
            sidebar.style.transform = 'translateX(100%)';
            
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }
        }
    },

    toggleUserMenu: function() {
        const menu = document.getElementById('user-menu');
        if (menu) menu.classList.toggle('hidden');
    },

    updateUserInfo: function() {
        const user = Utils.currentUser();
        if (!user) return;
        
        const nameEl = document.getElementById('header-user-name');
        const avatarEl = document.getElementById('header-user-avatar');
        const menuNameEl = document.getElementById('user-menu-name');
        const menuRoleEl = document.getElementById('user-menu-role');
        
        const roles = DB.get('roles') || [];
        const role = roles.find(r => r.id === user.role);

        if (nameEl) nameEl.textContent = user.name;
        if (avatarEl) avatarEl.textContent = user.name.charAt(0);
        if (menuNameEl) menuNameEl.textContent = user.name;
        if (menuRoleEl) menuRoleEl.textContent = role?.name || user.role;
    },

    logout: function() {
        Utils.confirm('هل تريد تسجيل الخروج؟', () => {
            const user = Utils.currentUser();
            if (user) DB.log('system', `تسجيل خروج: ${user.name}`);
            sessionStorage.removeItem('ibra_current_user');
            window.location.href = 'login.html';
        });
    },

    openQuickSearch: function() {
        Utils.modal('البحث السريع', `
            <input type="text" id="quick-search-input" placeholder="ابحث عن صنف، فاتورة، عميل..." 
                   class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
            <div id="quick-search-results" class="mt-4 max-h-80 overflow-y-auto"></div>
        `, { size: 'max-w-lg' });
        
        setTimeout(() => {
            const input = document.getElementById('quick-search-input');
            if (!input) return;
            input.focus();
            input.oninput = Utils.debounce((e) => {
                const q = e.target.value.trim().toLowerCase();
                const results = document.getElementById('quick-search-results');
                if (!q) { results.innerHTML = ''; return; }
                
                const menu = (DB.get('menuItems') || []).filter(i => i.name.toLowerCase().includes(q)).slice(0, 5);
                const invoices = (DB.get('invoices') || []).filter(i => (i.number || '').toLowerCase().includes(q)).slice(0, 5);
                const customers = (DB.get('customers') || []).filter(i => i.name.toLowerCase().includes(q)).slice(0, 5);
                
                let html = '';
                if (menu.length) {
                    html += `<p class="text-xs font-bold text-slate-500 mb-2">الأصناف</p>`;
                    menu.forEach(m => html += `<div class="p-2 hover:bg-slate-50 rounded cursor-pointer">${m.name} - ${Utils.formatCurrency(m.price)}</div>`);
                }
                if (invoices.length) {
                    html += `<p class="text-xs font-bold text-slate-500 mb-2 mt-3">الفواتير</p>`;
                    invoices.forEach(i => html += `<div class="p-2 hover:bg-slate-50 rounded cursor-pointer">${i.number} - ${Utils.formatCurrency(i.total)}</div>`);
                }
                if (customers.length) {
                    html += `<p class="text-xs font-bold text-slate-500 mb-2 mt-3">العملاء</p>`;
                    customers.forEach(c => html += `<div class="p-2 hover:bg-slate-50 rounded cursor-pointer">${c.name} - ${c.phone}</div>`);
                }
                results.innerHTML = html || '<p class="text-center text-slate-400 py-4">لا توجد نتائج</p>';
            }, 200);
        }, 100);
    },

    toggleNotifications: function() {
        const notifications = (DB.get('logs') || []).slice(0, 5);
        Utils.modal('الإشعارات', notifications.map(n => `
            <div class="p-3 border-b border-slate-100">
                <p class="text-sm font-bold">${n.message}</p>
                <p class="text-xs text-slate-500 mt-1">${Utils.formatDate(n.date, true)}</p>
            </div>
        `).join('') || '<p class="text-center text-slate-400 py-4">لا توجد إشعارات</p>', { size: 'max-w-md' });
    }
};

// ✅ تشغيل التطبيق
window.addEventListener('DOMContentLoaded', () => {
    try {
        App.init();
    } catch (e) {
        console.error('App.init failed:', e);
        // في حال فشل Init، نربط الدوال على الأقل
        window.toggleSidebar = () => {
            const sidebar = document.getElementById('sidebar');
            if (!sidebar) return;
            const isHidden = sidebar.style.transform === 'translateX(100%)' || sidebar.style.transform === '';
            sidebar.style.transform = isHidden ? 'translateX(0)' : 'translateX(100%)';
        };
    }
});