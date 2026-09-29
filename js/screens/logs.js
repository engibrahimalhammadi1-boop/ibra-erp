/**
 * Logs Screen - سجل العمليات
 */
const Logs = {
    filterType: 'all',
    searchQuery: '',
    filterDate: 'week',

    render: function() {
        const logs = DB.get('logs') || [];
        const today = new Date().toDateString();
        const todayLogs = logs.filter(l => new Date(l.date).toDateString() === today);

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-clock-rotate-left text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${logs.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي العمليات</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-calendar-day text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${todayLogs.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">عمليات اليوم</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-users text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${[...new Set(logs.map(l=>l.user))].length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">مستخدمين نشطين</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-tags text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${[...new Set(logs.map(l=>l.type))].length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">أنواع العمليات</p>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="log-search" placeholder="ابحث في سجل العمليات..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <select onchange="Logs.setType(this.value)" id="log-type"
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                    <option value="all">كل الأنواع</option>
                    <option value="system">النظام</option>
                    <option value="pos">نقطة البيع</option>
                    <option value="kitchen">المطبخ</option>
                    <option value="invoice">الفواتير</option>
                    <option value="purchases">المشتريات</option>
                    <option value="vouchers">السندات</option>
                    <option value="cashbox">الصناديق</option>
                    <option value="menu">قائمة الطعام</option>
                    <option value="inventory">المخزون</option>
                    <option value="users">المستخدمين</option>
                    <option value="settings">الإعدادات</option>
                </select>
                <select onchange="Logs.setDate(this.value)" id="log-date"
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                    <option value="today">اليوم</option>
                    <option value="week" selected>هذا الأسبوع</option>
                    <option value="month">هذا الشهر</option>
                    <option value="all">الكل</option>
                </select>
                <button onclick="Logs.clearLogs()" class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-trash"></i> مسح
                </button>
            </div>

            <!-- Logs List -->
            <div id="logs-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderList();
        const search = document.getElementById('log-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderList();
            }, 150);
        }
    },

    setType: function(t) {
        this.filterType = t;
        this.renderList();
    },

    setDate: function(d) {
        this.filterDate = d;
        this.renderList();
    },

    filterByDate: function(items) {
        if (this.filterDate === 'all') return items;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return items.filter(item => {
            const d = new Date(item.date);
            const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            switch(this.filterDate) {
                case 'today': return itemDay.getTime() === today.getTime();
                case 'week': { const w = new Date(today); w.setDate(today.getDate()-7); return itemDay >= w; }
                case 'month': return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                default: return true;
            }
        });
    },

    renderList: function() {
        const container = document.getElementById('logs-container');
        if (!container) return;

        let logs = this.filterByDate(DB.get('logs') || []);
        if (this.filterType !== 'all') logs = logs.filter(l => l.type === this.filterType);
        if (this.searchQuery) {
            logs = logs.filter(l => 
                l.message.toLowerCase().includes(this.searchQuery) ||
                (l.user||'').toLowerCase().includes(this.searchQuery)
            );
        }

        if (logs.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-clock-rotate-left text-5xl mb-3"></i>
                <p>لا توجد عمليات</p>
            </div>`;
            return;
        }

        const typeInfo = {
            system: { icon:'fa-server', color:'slate', label:'النظام' },
            pos: { icon:'fa-cash-register', color:'green', label:'نقطة البيع' },
            kitchen: { icon:'fa-fire-burner', color:'amber', label:'المطبخ' },
            invoice: { icon:'fa-file-invoice', color:'blue', label:'فاتورة' },
            invoices: { icon:'fa-file-invoice', color:'blue', label:'فواتير' },
            purchases: { icon:'fa-truck', color:'purple', label:'مشتريات' },
            vouchers: { icon:'fa-money-check-dollar', color:'emerald', label:'سند' },
            cashbox: { icon:'fa-vault', color:'cyan', label:'صندوق' },
            menu: { icon:'fa-book-open', color:'orange', label:'قائمة' },
            inventory: { icon:'fa-boxes-stacked', color:'indigo', label:'مخزون' },
            users: { icon:'fa-users-gear', color:'red', label:'مستخدمين' },
            settings: { icon:'fa-gear', color:'slate', label:'إعدادات' },
            customers: { icon:'fa-users', color:'blue', label:'عملاء' },
            suppliers: { icon:'fa-handshake', color:'amber', label:'موردين' },
            employees: { icon:'fa-user-tie', color:'purple', label:'موظفين' },
            payroll: { icon:'fa-money-bill-wave', color:'green', label:'رواتب' },
            tables: { icon:'fa-chair', color:'orange', label:'طاولات' }
        };

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                    ${logs.map(log => {
                        const info = typeInfo[log.type] || typeInfo.system;
                        return `
                            <div class="flex items-start gap-3 p-3 hover:bg-slate-50">
                                <div class="w-10 h-10 rounded-lg bg-${info.color}-100 text-${info.color}-600 flex items-center justify-center flex-shrink-0">
                                    <i class="fa-solid ${info.icon}"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="badge badge-gray">${info.label}</span>
                                        <span class="text-xs text-slate-500 font-en">${log.user||'system'}</span>
                                    </div>
                                    <p class="text-sm mt-1">${Utils.esc(log.message)}</p>
                                </div>
                                <div class="text-left flex-shrink-0">
                                    <p class="text-xs text-slate-500">${Utils.formatDate(log.date)}</p>
                                    <p class="text-xs text-slate-400">${Utils.formatTime(log.date)}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    clearLogs: function() {
        Utils.confirm('هل تريد مسح جميع سجلات العمليات؟', () => {
            DB.set('logs', []);
            Utils.toast('success', 'تم مسح السجلات');
            this.renderList();
        });
    }
};