/**
 * Kitchen Screen - شاشة المطبخ
 */
const Kitchen = {
    filterStatus: 'active',
    autoRefreshInterval: null,
    soundInterval: null,

    render: function() {
        const newCount = this.getOrdersByStatus('new').length;
        const preparingCount = this.getOrdersByStatus('preparing').length;
        const readyCount = this.getOrdersByStatus('ready').length;
        const servedCount = this.getOrdersByStatus('served').length;

        return `
        <div class="h-[calc(100vh-8rem)] flex flex-col gap-3">
            
            <!-- Stats Bar -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                ${this.statCard('new', 'طلبات جديدة', 'fa-bell', 'red', newCount)}
                ${this.statCard('preparing', 'قيد التحضير', 'fa-fire', 'amber', preparingCount)}
                ${this.statCard('ready', 'جاهزة للتسليم', 'fa-bell-concierge', 'green', readyCount)}
                ${this.statCard('served', 'تم التقديم', 'fa-check-double', 'blue', servedCount)}
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-wrap gap-2 items-center">
                <div class="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                    ${[
                        {id:'active', label:'نشطة', icon:'fa-fire'},
                        {id:'new', label:'جديدة', icon:'fa-bell'},
                        {id:'preparing', label:'تحضير', icon:'fa-fire-burner'},
                        {id:'ready', label:'جاهزة', icon:'fa-bell-concierge'},
                        {id:'served', label:'تم التقديم', icon:'fa-check-double'},
                        {id:'all', label:'الكل', icon:'fa-list'}
                    ].map(f => `
                        <button onclick="Kitchen.setFilter('${f.id}')" data-kf="${f.id}"
                                class="kt-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap">
                            <i class="fa-solid ${f.icon}"></i> ${f.label}
                        </button>
                    `).join('')}
                </div>
                
                <div class="flex-1"></div>
                
                <span class="text-xs text-slate-500 flex items-center gap-1">
                    <span class="flex h-2 w-2 relative">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    تحديث تلقائي كل 5 ثوان
                </span>
                
                <button onclick="Kitchen.toggleSound()" id="sound-toggle-btn" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors" title="تشغيل/إيقاف الصوت">
                    <i class="fa-solid fa-volume-high"></i>
                </button>
                <button onclick="Kitchen.refresh()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-rotate"></i> تحديث
                </button>
                <button onclick="Kitchen.toggleFullscreen()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-expand"></i>
                </button>
            </div>

            <!-- Orders Grid -->
            <div class="flex-1 overflow-y-auto">
                <div id="kitchen-orders" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"></div>
            </div>
        </div>
        `;
    },

    statCard: function(id, label, icon, color, count) {
        const colors = {
            red: 'from-red-500 to-red-600',
            amber: 'from-amber-500 to-amber-600',
            green: 'from-green-500 to-green-600',
            blue: 'from-blue-500 to-blue-600'
        };
        return `
            <div class="bg-gradient-to-br ${colors[color]} text-white rounded-2xl p-3 shadow-md">
                <div class="flex items-center justify-between">
                    <i class="fa-solid ${icon} text-xl opacity-80"></i>
                    <span class="text-2xl font-black">${count}</span>
                </div>
                <p class="text-xs font-bold mt-1 opacity-90">${label}</p>
            </div>
        `;
    },

    afterRender: function() {
        this.renderOrders();
        this.updateFilterButtons();
        
        // ✅ Auto refresh
        this.autoRefreshInterval = setInterval(() => this.refresh(), 5000);
        
        // ✅ Sound interval - تشغيل صوت عند وجود طلبات جديدة
        this.soundInterval = setInterval(() => {
            const orders = DB.get('orders') || [];
            const today = new Date().toDateString();
            const newOrders = orders.filter(o => 
                new Date(o.date).toDateString() === today && 
                o.status === 'new' &&
                !o._notified
            );
            
            if (newOrders.length > 0 && this.soundEnabled !== false) {
                Utils.beep();
                newOrders.forEach(o => {
                    o._notified = true;
                    DB.update('orders', o.id, { _notified: true });
                });
            }
        }, 8000);
        
        // Cleanup
        const check = setInterval(() => {
            if (!document.getElementById('kitchen-orders')) {
                clearInterval(this.autoRefreshInterval);
                clearInterval(this.soundInterval);
                clearInterval(check);
            }
        }, 1000);
    },

    toggleSound: function() {
        this.soundEnabled = this.soundEnabled === false ? true : false;
        const btn = document.getElementById('sound-toggle-btn');
        if (btn) {
            btn.innerHTML = this.soundEnabled !== false 
                ? '<i class="fa-solid fa-volume-high"></i>' 
                : '<i class="fa-solid fa-volume-xmark text-slate-400"></i>';
        }
        Utils.toast('info', this.soundEnabled !== false ? 'تم تفعيل الصوت' : 'تم كتم الصوت');
    },

    updateFilterButtons: function() {
        document.querySelectorAll('.kt-filter-btn').forEach(b => {
            const isActive = b.dataset.kf === this.filterStatus;
            b.className = `kt-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-white'
            }`;
        });
    },

    setFilter: function(status) {
        this.filterStatus = status;
        this.updateFilterButtons();
        this.renderOrders();
    },

    getOrdersByStatus: function(status) {
        const orders = DB.get('orders') || [];
        const today = new Date().toDateString();
        return orders.filter(o => 
            new Date(o.date).toDateString() === today && 
            o.status === status
        );
    },

    getTodayCount: function() {
        const orders = DB.get('orders') || [];
        const today = new Date().toDateString();
        return orders.filter(o => new Date(o.date).toDateString() === today).length;
    },

    refresh: function() {
        const content = document.getElementById('content-area');
        if (content && content.querySelector('#kitchen-orders')) {
            // تحديث الإحصائيات
            const statsContainer = content.querySelector('.grid-cols-2');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    ${this.statCard('new', 'طلبات جديدة', 'fa-bell', 'red', this.getOrdersByStatus('new').length)}
                    ${this.statCard('preparing', 'قيد التحضير', 'fa-fire', 'amber', this.getOrdersByStatus('preparing').length)}
                    ${this.statCard('ready', 'جاهزة للتسليم', 'fa-bell-concierge', 'green', this.getOrdersByStatus('ready').length)}
                    ${this.statCard('served', 'تم التقديم', 'fa-check-double', 'blue', this.getOrdersByStatus('served').length)}
                `;
            }
            this.renderOrders();
        }
    },

    renderOrders: function() {
    const container = document.getElementById('kitchen-orders');
    if (!container) return;

    // ✅ إعادة قراءة الطلبات من DB مباشرة
    const allOrders = DB.get('orders') || [];
    const today = new Date().toDateString();
    let orders = allOrders.filter(o => new Date(o.date).toDateString() === today);

    // ✅ فلترة حسب الحالة
    if (this.filterStatus === 'active') {
        orders = orders.filter(o => ['new','preparing','ready'].includes(o.status));
    } else if (this.filterStatus !== 'all') {
        orders = orders.filter(o => o.status === this.filterStatus);
    }

    // ✅ ترتيب حسب التاريخ
    orders.sort((a,b) => new Date(b.date) - new Date(a.date));

    // ✅ لا توجد طلبات
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20 text-slate-400">
                <i class="fa-solid fa-fire-burner text-5xl mb-3"></i>
                <p class="font-bold">لا توجد طلبات حالياً</p>
                <p class="text-sm text-slate-300 mt-1">ستظهر الطلبات الجديدة هنا تلقائياً</p>
            </div>
        `;
        return;
    }

    // ✅ إعدادات الحالات
    const statusInfo = {
        new: { 
            label: 'جديد', 
            icon: 'fa-bell', 
            bg: 'bg-red-500',
            border: 'border-red-500',
            headerBg: 'bg-gradient-to-r from-red-500 to-red-600',
            lightBg: 'bg-red-50'
        },
        preparing: { 
            label: 'قيد التحضير', 
            icon: 'fa-fire', 
            bg: 'bg-amber-500',
            border: 'border-amber-500',
            headerBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
            lightBg: 'bg-amber-50'
        },
        ready: { 
            label: 'جاهز للتسليم', 
            icon: 'fa-bell-concierge', 
            bg: 'bg-green-500',
            border: 'border-green-500',
            headerBg: 'bg-gradient-to-r from-green-500 to-green-600',
            lightBg: 'bg-green-50'
        },
        served: { 
            label: 'تم التقديم', 
            icon: 'fa-check-double', 
            bg: 'bg-blue-500',
            border: 'border-blue-500',
            headerBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
            lightBg: 'bg-blue-50'
        },
        paid: { 
            label: 'مدفوع', 
            icon: 'fa-money-bill', 
            bg: 'bg-slate-500',
            border: 'border-slate-500',
            headerBg: 'bg-gradient-to-r from-slate-500 to-slate-600',
            lightBg: 'bg-slate-50'
        },
        cancelled: { 
            label: 'ملغي', 
            icon: 'fa-xmark', 
            bg: 'bg-slate-400',
            border: 'border-slate-400',
            headerBg: 'bg-gradient-to-r from-slate-400 to-slate-500',
            lightBg: 'bg-slate-50'
        }
    };

    // ✅ بناء البطاقات
    container.innerHTML = orders.map(o => {
        const info = statusInfo[o.status] || statusInfo.new;
        const table = o.tableId ? DB.find('tables', o.tableId) : null;
        const elapsed = Math.floor((Date.now() - new Date(o.date).getTime()) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        return `
            <div class="kitchen-card ${o.status} bg-white rounded-2xl shadow-md border-2 ${info.border} overflow-hidden flex flex-col" data-order-id="${o.id}">
                
                <!-- Header -->
                <div class="p-3 ${info.headerBg} text-white flex items-center justify-between">
                    <div>
                        <p class="font-black text-lg font-en">${o.number}</p>
                        <p class="text-xs opacity-90">${Utils.formatTime(o.date)}</p>
                    </div>
                    <div class="text-center">
                        <div class="bg-white/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                            <p class="font-black text-base font-en">${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Status Badge -->
                <div class="px-3 py-2 ${info.lightBg} border-b border-slate-100 flex items-center justify-between">
                    <span class="badge ${info.bg} text-white font-bold">
                        <i class="fa-solid ${info.icon}"></i> ${info.label}
                    </span>
                    ${table ? `<span class="text-xs font-bold text-slate-600"><i class="fa-solid fa-chair"></i> ${table.name}</span>` : ''}
                </div>
                
                <!-- Type -->
                <div class="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3 text-xs">
                    <span class="font-bold flex items-center gap-1">
                        ${o.type === 'dine-in' ? '<i class="fa-solid fa-utensils text-blue-600"></i> محلي' : 
                          o.type === 'takeaway' ? '<i class="fa-solid fa-bag-shopping text-amber-600"></i> سفري' : 
                          '<i class="fa-solid fa-motorcycle text-green-600"></i> توصيل'}
                    </span>
                </div>
                
                <!-- Items -->
                <div class="flex-1 p-3 space-y-2 overflow-y-auto max-h-60">
                    ${o.items.map(i => `
                        <div class="flex items-start gap-2 py-1.5 border-b border-dashed border-slate-100 last:border-0">
                            <span class="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-sm font-black flex-shrink-0">${i.quantity}</span>
                            <div class="flex-1 min-w-0">
                                <p class="font-bold text-sm">${Utils.esc(i.name)}</p>
                                ${i.notes ? `<p class="text-xs text-amber-600 mt-0.5"><i class="fa-solid fa-note-sticky"></i> ${Utils.esc(i.notes)}</p>` : ''}
                            </div>
                            ${o.status === 'served' ? '<i class="fa-solid fa-check-circle text-green-500 text-xs mt-1"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Actions -->
                <div class="p-2 bg-slate-50 border-t border-slate-200">
                    ${o.status === 'new' ? `
                        <button onclick="Kitchen.updateStatus(${o.id}, 'preparing')" 
                                class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                            <i class="fa-solid fa-play"></i> بدء التحضير
                        </button>
                    ` : ''}
                    
                    ${o.status === 'preparing' ? `
                        <button onclick="Kitchen.updateStatus(${o.id}, 'ready')" 
                                class="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                            <i class="fa-solid fa-bell-concierge"></i> جاهز للتسليم
                        </button>
                    ` : ''}
                    
                    ${o.status === 'ready' ? `
                        <button onclick="Kitchen.updateStatus(${o.id}, 'served')" 
                                class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                            <i class="fa-solid fa-check-double"></i> تم التقديم
                        </button>
                    ` : ''}
                    
                    ${o.status === 'served' ? `
                        <div class="text-center text-xs text-green-600 py-2 font-bold">
                            <i class="fa-solid fa-circle-check"></i> تم تقديم الطلب بنجاح
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
},

    updateStatus: function(orderId, status) {
    // ✅ 1. تحديث قاعدة البيانات
    const updated = DB.update('orders', orderId, { status });
    
    if (!updated) {
        Utils.toast('error', 'لم يتم العثور على الطلب');
        return;
    }
    
    console.log('✅ Order updated:', orderId, '→', status);
    
    DB.log('kitchen', `تحديث حالة الطلب ${orderId} إلى ${status}`);
    
    const settings = DB.get('settings') || {};
    const appearance = settings.appearance || {};
    
    // ✅ 2. صوت + اهتزاز
    if (status === 'ready' && appearance.soundsEnabled !== false) {
        Utils.beep();
        setTimeout(() => Utils.beep(), 200);
    }
    if (appearance.vibrationEnabled !== false && navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    // ✅ 3. تحديث الإحصائيات
    this.updateStats();
    
    // ✅ 4. إعادة رسم البطاقات فوراً
    this.renderOrders();
    
    // ✅ 5. رسالة نجاح
    const statusLabels = { 
        new: 'جديد',
        preparing: 'قيد التحضير', 
        ready: 'جاهز للتسليم', 
        served: 'تم التقديم'
    };
    Utils.toast('success', `✓ الطلب أصبح ${statusLabels[status] || status}`);
},

// ✅ دالة جديدة: تحديث الإحصائيات فقط
updateStats: function() {
    const content = document.getElementById('content-area');
    if (!content) return;
    
    const statsContainer = content.querySelector('.grid-cols-2');
    if (statsContainer) {
        statsContainer.innerHTML = `
            ${this.statCard('new', 'طلبات جديدة', 'fa-bell', 'red', this.getOrdersByStatus('new').length)}
            ${this.statCard('preparing', 'قيد التحضير', 'fa-fire', 'amber', this.getOrdersByStatus('preparing').length)}
            ${this.statCard('ready', 'جاهزة للتسليم', 'fa-bell-concierge', 'green', this.getOrdersByStatus('ready').length)}
            ${this.statCard('served', 'تم التقديم', 'fa-check-double', 'blue', this.getOrdersByStatus('served').length)}
        `;
    }
},

// ✅ تحديث refresh ليستخدم الدوال الجديدة
refresh: function() {
    const content = document.getElementById('content-area');
    if (content && content.querySelector('#kitchen-orders')) {
        this.updateStats();
        this.renderOrders();
    }
},

    toggleFullscreen: function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
};

