/**
 * Tables Screen - إدارة الطاولات
 */
const Tables = {
    view: 'grid', // grid, list
    filterStatus: 'all',
    filterArea: 'all',

    render: function() {
        const tables = DB.get('tables') || [];
        const areas = [...new Set(tables.map(t => t.area))];

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                ${this.statCard('available', 'متاحة', 'fa-check-circle', 'green', tables.filter(t=>t.status==='available').length)}
                ${this.statCard('occupied', 'مشغولة', 'fa-user', 'red', tables.filter(t=>t.status==='occupied').length)}
                ${this.statCard('reserved', 'محجوزة', 'fa-calendar-check', 'amber', tables.filter(t=>t.status==='reserved').length)}
                ${this.statCard('cleaning', 'قيد التنظيف', 'fa-broom', 'slate', tables.filter(t=>t.status==='cleaning').length)}
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-wrap gap-2 items-center">
                <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    ${[
                        {id:'all', label:'الكل'},
                        {id:'available', label:'متاحة'},
                        {id:'occupied', label:'مشغولة'},
                        {id:'reserved', label:'محجوزة'},
                        {id:'cleaning', label:'تنظيف'}
                    ].map(f => `
                        <button onclick="Tables.setFilter('${f.id}')" data-filter="${f.id}"
                                class="tbl-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                            ${f.label}
                        </button>
                    `).join('')}
                </div>
                
                <select onchange="Tables.setArea(this.value)" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                    <option value="all">كل المناطق</option>
                    ${areas.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>

                <div class="flex-1"></div>
                
                <button onclick="Tables.openTableForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-plus"></i> إضافة طاولة
                </button>
            </div>

            <!-- Tables Grid -->
            <div id="tables-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3"></div>
        </div>
        `;
    },

    statCard: function(id, label, icon, color, count) {
        const colors = {
            green: 'from-green-500 to-green-600',
            red: 'from-red-500 to-red-600',
            amber: 'from-amber-500 to-amber-600',
            slate: 'from-slate-500 to-slate-600'
        };
        return `
            <div class="bg-gradient-to-br ${colors[color]} text-white rounded-2xl p-3 shadow-md">
                <div class="flex items-center justify-between">
                    <i class="fa-solid ${icon} text-2xl opacity-70"></i>
                    <span class="text-2xl font-black">${count}</span>
                </div>
                <p class="text-xs font-bold mt-2 opacity-90">${label}</p>
            </div>
        `;
    },

    afterRender: function() {
        this.renderTables();
        document.querySelectorAll('.tbl-filter-btn').forEach(b => {
            const isActive = b.dataset.filter === this.filterStatus;
            b.className = `tbl-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-white'
            }`;
        });
    },

    setFilter: function(status) {
        this.filterStatus = status;
        this.afterRender();
    },

    setArea: function(area) {
        this.filterArea = area;
        this.renderTables();
    },

    renderTables: function() {
        const container = document.getElementById('tables-grid');
        if (!container) return;

        let tables = DB.get('tables') || [];
        if (this.filterStatus !== 'all') tables = tables.filter(t => t.status === this.filterStatus);
        if (this.filterArea !== 'all') tables = tables.filter(t => t.area === this.filterArea);

        if (tables.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-16 text-slate-400">
                <i class="fa-solid fa-chair text-4xl mb-3"></i>
                <p>لا توجد طاولات مطابقة</p>
            </div>`;
            return;
        }

        const statusInfo = {
            available: { label: 'متاحة', icon: 'fa-check-circle' },
            occupied: { label: 'مشغولة', icon: 'fa-user' },
            reserved: { label: 'محجوزة', icon: 'fa-calendar-check' },
            cleaning: { label: 'تنظيف', icon: 'fa-broom' }
        };

        container.innerHTML = tables.map(t => {
            const info = statusInfo[t.status];
            return `
                <div onclick="Tables.openTableActions(${t.id})" 
                     class="table-card ${t.status} rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-md hover:shadow-xl cursor-pointer">
                    <i class="fa-solid fa-chair text-3xl"></i>
                    <div>
                        <p class="font-black text-lg">${Utils.esc(t.name)}</p>
                        <p class="text-xs opacity-90">${t.capacity} أشخاص</p>
                    </div>
                    <span class="text-[10px] px-2 py-0.5 bg-white/25 rounded-full font-bold flex items-center gap-1">
                        <i class="fa-solid ${info.icon}"></i> ${info.label}
                    </span>
                    ${t.guests ? `<p class="text-xs opacity-90"><i class="fa-solid fa-users"></i> ${t.guests}</p>` : ''}
                </div>
            `;
        }).join('');
    },

    openTableActions: function(tableId) {
        const table = DB.find('tables', tableId);
        if (!table) return;

        const statusOptions = [
            { id: 'available', label: 'متاحة', color: 'green' },
            { id: 'occupied', label: 'مشغولة', color: 'red' },
            { id: 'reserved', label: 'محجوزة', color: 'amber' },
            { id: 'cleaning', label: 'تنظيف', color: 'slate' }
        ];

        const content = `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-primary to-blue-800 text-white rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <i class="fa-solid fa-chair text-3xl"></i>
                        <div>
                            <h3 class="font-black text-xl">${Utils.esc(table.name)}</h3>
                            <p class="text-xs opacity-90">${table.area} - ${table.capacity} أشخاص</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold mb-2">تغيير الحالة</label>
                    <div class="grid grid-cols-2 gap-2">
                        ${statusOptions.map(s => `
                            <button onclick="Tables.changeStatus(${tableId}, '${s.id}')" 
                                    class="py-2.5 rounded-xl border-2 font-bold text-sm ${table.status === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 hover:border-primary'}">
                                ${s.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="Tables.newOrderForTable(${tableId})" class="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm">
                        <i class="fa-solid fa-cart-plus"></i> طلب جديد
                    </button>
                    <button onclick="Tables.viewTableOrders(${tableId})" class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm">
                        <i class="fa-solid fa-receipt"></i> الطلبات
                    </button>
                </div>

                <div class="flex gap-2 pt-3 border-t border-slate-200">
                    <button onclick="Tables.openTableForm(${tableId})" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm">
                        <i class="fa-solid fa-edit"></i> تعديل
                    </button>
                    <button onclick="Tables.deleteTable(${tableId})" class="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        window._tblModal = Utils.modal('إدارة الطاولة', content, { size: 'max-w-md' });
    },

    changeStatus: function(tableId, status) {
        DB.update('tables', tableId, { status });
        document.getElementById(window._tblModal)?.remove();
        this.renderTables();
        Utils.toast('success', 'تم تحديث حالة الطاولة');
        DB.log('tables', `تغيير حالة الطاولة ${tableId} إلى ${status}`);
    },

    newOrderForTable: function(tableId) {
        document.getElementById(window._tblModal)?.remove();
        Router.navigate('pos');
        setTimeout(() => {
            POS.selectTable(tableId);
            POS.setOrderType('dine-in');
        }, 200);
    },

    viewTableOrders: function(tableId) {
        const orders = (DB.get('orders') || []).filter(o => o.tableId === tableId);
        const content = orders.length === 0 
            ? '<p class="text-center text-slate-400 py-8">لا توجد طلبات لهذه الطاولة</p>'
            : orders.reverse().map(o => `
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div class="flex justify-between mb-2">
                        <span class="font-bold text-sm">${o.number}</span>
                        <span class="badge badge-${o.status==='paid'?'success':o.status==='new'?'danger':'warning'}">${o.status}</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-2">${Utils.formatDate(o.date, true)}</p>
                    <div class="space-y-1">
                        ${o.items.map(i => `<div class="flex justify-between text-xs"><span>${Utils.esc(i.name)} × ${i.quantity}</span><span>${i.total.toLocaleString()}</span></div>`).join('')}
                    </div>
                    <p class="text-right font-black text-primary mt-2 border-t pt-2">${o.total.toLocaleString()}</p>
                </div>
            `).join('');
        Utils.modal('طلبات الطاولة', content, { size: 'max-w-md' });
    },

    openTableForm: function(tableId = null) {
        const table = tableId ? DB.find('tables', tableId) : null;
        const isEdit = !!table;
        const areas = ['الصالة الرئيسية', 'الشرفة', 'قسم العائلات', 'الحديقة', 'الطابق الثاني'];
        
        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">اسم/رقم الطاولة</label>
                    <input type="text" id="tbl-name" value="${table?.name || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">الرقم</label>
                    <input type="text" id="tbl-num" value="${table?.number || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المنطقة</label>
                    <input type="text" id="tbl-area" value="${table?.area || ''}" list="areas-list"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    <datalist id="areas-list">${areas.map(a => `<option value="${a}">`).join('')}</datalist>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">السعة (عدد الأشخاص)</label>
                    <input type="number" id="tbl-capacity" value="${table?.capacity || 4}" min="1"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <button onclick="Tables.saveTable(${tableId || 'null'})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة الطاولة'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل طاولة' : 'إضافة طاولة جديدة', content, { size: 'max-w-md' });
    },

    saveTable: function(tableId) {
        const name = document.getElementById('tbl-name').value.trim();
        const number = document.getElementById('tbl-num').value.trim();
        const area = document.getElementById('tbl-area').value.trim() || 'الصالة الرئيسية';
        const capacity = parseInt(document.getElementById('tbl-capacity').value) || 4;

        if (!name) { Utils.toast('error', 'يرجى إدخال اسم الطاولة'); return; }

        if (tableId) {
            DB.update('tables', tableId, { name, number, area, capacity });
            DB.log('tables', `تعديل طاولة ${name}`);
            Utils.toast('success', 'تم تحديث الطاولة');
        } else {
            DB.add('tables', { name, number, area, capacity, status: 'available' });
            DB.log('tables', `إضافة طاولة ${name}`);
            Utils.toast('success', 'تمت إضافة الطاولة');
        }

        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderTables();
    },

    deleteTable: function(tableId) {
        Utils.confirm('هل تريد حذف هذه الطاولة؟', () => {
            DB.remove('tables', tableId);
            document.getElementById(window._tblModal)?.remove();
            this.renderTables();
            Utils.toast('success', 'تم حذف الطاولة');
        });
    }
};