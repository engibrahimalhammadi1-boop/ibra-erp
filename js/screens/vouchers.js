/**
 * Vouchers Screen - السندات والدفعات
 */
const Vouchers = {
    activeType: 'all',
    filterDate: 'month',
    searchQuery: '',

    render: function() {
        const vouchers = DB.get('vouchers') || [];
        const today = new Date().toDateString();
        const todayVouchers = vouchers.filter(v => new Date(v.date).toDateString() === today);
        const todayIn = todayVouchers.filter(v => v.type === 'receipt').reduce((s,v) => s + v.amount, 0);
        const todayOut = todayVouchers.filter(v => v.type === 'payment').reduce((s,v) => s + v.amount, 0);

        return `
        <div class="space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-arrow-down text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(todayIn).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">مقبوضات اليوم</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-arrow-up text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(todayOut).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">مدفوعات اليوم</p>
                </div>
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-file-invoice text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${vouchers.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي السندات</p>
                </div>
                <div class="bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-scale-balanced text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(todayIn-todayOut).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">صافي اليوم</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button onclick="Vouchers.openForm('receipt')" class="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-green-500 hover:shadow-md transition-all flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                        <i class="fa-solid fa-arrow-down"></i>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-sm">سند قبض</p>
                        <p class="text-xs text-slate-500">استلام نقدية</p>
                    </div>
                </button>
                <button onclick="Vouchers.openForm('payment')" class="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-red-500 hover:shadow-md transition-all flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                        <i class="fa-solid fa-arrow-up"></i>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-sm">سند صرف</p>
                        <p class="text-xs text-slate-500">دفع نقدية</p>
                    </div>
                </button>
                <button onclick="Vouchers.openForm('journal')" class="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <i class="fa-solid fa-book"></i>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-sm">سند قيد</p>
                        <p class="text-xs text-slate-500">قيد محاسبي</p>
                    </div>
                </button>
                <button onclick="Vouchers.openForm('simple')" class="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <i class="fa-solid fa-receipt"></i>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-sm">سند بسيط</p>
                        <p class="text-xs text-slate-500">مصروف سريع</p>
                    </div>
                </button>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                    ${[
                        {id:'all', label:'الكل', icon:'fa-list'},
                        {id:'receipt', label:'قبض', icon:'fa-arrow-down'},
                        {id:'payment', label:'صرف', icon:'fa-arrow-up'},
                        {id:'journal', label:'قيود', icon:'fa-book'},
                        {id:'simple', label:'بسيطة', icon:'fa-receipt'}
                    ].map(t => `
                        <button onclick="Vouchers.setType('${t.id}')" data-vt="${t.id}"
                                class="vc-type-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1">
                            <i class="fa-solid ${t.icon}"></i> ${t.label}
                        </button>
                    `).join('')}
                </div>
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="vc-search" placeholder="ابحث..." class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <select onchange="Vouchers.setDateFilter(this.value)" id="vc-date"
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                    <option value="today">اليوم</option>
                    <option value="week">هذا الأسبوع</option>
                    <option value="month" selected>هذا الشهر</option>
                    <option value="year">هذه السنة</option>
                    <option value="all">الكل</option>
                </select>
            </div>

            <div id="vc-content"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.updateTypeButtons();
        this.renderList();
        const search = document.getElementById('vc-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderList();
            }, 150);
        }
    },

    updateTypeButtons: function() {
        document.querySelectorAll('.vc-type-btn').forEach(b => {
            const isActive = b.dataset.vt === this.activeType;
            b.className = `vc-type-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                isActive ? 'bg-amber-500 text-white shadow' : 'text-slate-600 hover:bg-white'
            }`;
        });
    },

    setType: function(t) {
        this.activeType = t;
        this.updateTypeButtons();
        this.renderList();
    },

    setDateFilter: function(v) {
        this.filterDate = v;
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
                case 'year': return d.getFullYear() === now.getFullYear();
                default: return true;
            }
        });
    },

    renderList: function() {
        const container = document.getElementById('vc-content');
        if (!container) return;

        let vouchers = this.filterByDate(DB.get('vouchers') || []);
        if (this.activeType !== 'all') vouchers = vouchers.filter(v => v.type === this.activeType);
        if (this.searchQuery) {
            vouchers = vouchers.filter(v => 
                (v.number||'').toLowerCase().includes(this.searchQuery) ||
                (v.entityName||'').toLowerCase().includes(this.searchQuery)
            );
        }
        vouchers.sort((a,b) => new Date(b.date) - new Date(a.date));

        if (vouchers.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-money-check-dollar text-5xl mb-3"></i>
                <p>لا توجد سندات</p>
            </div>`;
            return;
        }

        const typeInfo = {
            receipt: { label: 'قبض', cls: 'badge-success', icon: 'fa-arrow-down', sign: '+' },
            payment: { label: 'صرف', cls: 'badge-danger', icon: 'fa-arrow-up', sign: '-' },
            journal: { label: 'قيد', cls: 'badge-info', icon: 'fa-book', sign: '' },
            simple: { label: 'بسيط', cls: 'badge-warning', icon: 'fa-receipt', sign: '' }
        };

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>الرقم</th>
                                <th>النوع</th>
                                <th>التاريخ</th>
                                <th>الجهة</th>
                                <th>البيان</th>
                                <th>المبلغ</th>
                                <th>الطريقة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${vouchers.map(v => {
                                const info = typeInfo[v.type] || typeInfo.simple;
                                return `
                                    <tr>
                                        <td class="font-bold font-en">${v.number}</td>
                                        <td><span class="badge ${info.cls}"><i class="fa-solid ${info.icon}"></i> ${info.label}</span></td>
                                        <td>
                                            <p class="text-sm">${Utils.formatDate(v.date)}</p>
                                            <p class="text-xs text-slate-400">${Utils.formatTime(v.date)}</p>
                                        </td>
                                        <td>${Utils.esc(v.entityName || v.description || '-')}</td>
                                        <td class="text-sm text-slate-600">${Utils.esc(v.notes || v.description || '-')}</td>
                                        <td class="font-black ${v.type==='receipt'?'text-green-600':v.type==='payment'?'text-red-600':'text-primary'}">
                                            ${info.sign}${Utils.formatCurrency(v.amount)}
                                        </td>
                                        <td><span class="badge badge-gray">${v.paymentMethod || 'نقدي'}</span></td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button onclick="Vouchers.viewVoucher(${v.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center">
                                                    <i class="fa-solid fa-eye text-xs"></i>
                                                </button>
                                                <button onclick="Vouchers.printVoucher(${v.id})" class="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center">
                                                    <i class="fa-solid fa-print text-xs"></i>
                                                </button>
                                                <button onclick="Vouchers.deleteVoucher(${v.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                                    <i class="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openForm: function(type) {
        const customers = DB.get('customers') || [];
        const suppliers = DB.get('suppliers') || [];
        const cashboxes = DB.get('cashbox') || [];
        
        window._voucherType = type;
        const num = Utils.generateVoucherNumber(type);
        const title = { receipt: 'سند قبض', payment: 'سند صرف', journal: 'سند قيد', simple: 'سند بسيط' }[type];

        let specificFields = '';
        
        if (type === 'receipt') {
            specificFields = `
                <div>
                    <label class="block text-sm font-bold mb-1">استلمنا من *</label>
                    <select id="vc-entity-type" onchange="Vouchers.updateEntityList()" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary mb-2">
                        <option value="customer">عميل</option>
                        <option value="other">أخرى</option>
                    </select>
                    <select id="vc-entity-id" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        ${customers.map(c => `<option value="${c.id}">${Utils.esc(c.name)}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (type === 'payment') {
            specificFields = `
                <div>
                    <label class="block text-sm font-bold mb-1">دفعنا إلى *</label>
                    <select id="vc-entity-type" onchange="Vouchers.updateEntityList()" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary mb-2">
                        <option value="supplier">مورد</option>
                        <option value="employee">موظف</option>
                        <option value="other">أخرى</option>
                    </select>
                    <select id="vc-entity-id" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        ${suppliers.map(s => `<option value="${s.id}">${Utils.esc(s.name)}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (type === 'journal') {
            specificFields = `
                <div class="space-y-2">
                    <label class="block text-sm font-bold">الطرف المدين *</label>
                    <input type="text" id="vc-debit" placeholder="الحساب المدين" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    <label class="block text-sm font-bold">الطرف الدائن *</label>
                    <input type="text" id="vc-credit" placeholder="الحساب الدائن" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
            `;
        } else {
            specificFields = `
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">نوع الحركة</label>
                        <select id="vc-simple-kind" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="expense">مصروف</option>
                            <option value="income">إيراد</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الحساب</label>
                        <input type="text" id="vc-account" placeholder="مثال: مصاريف كهرباء" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>
            `;
        }

        const now = new Date();
        const dateValue = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        const content = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">رقم السند</label>
                        <input type="text" id="vc-number" value="${num}" readonly class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none font-en">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">التاريخ *</label>
                        <input type="datetime-local" id="vc-date" value="${dateValue}" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>
                ${specificFields}
                <div>
                    <label class="block text-sm font-bold mb-1">المبلغ *</label>
                    <input type="number" id="vc-amount" placeholder="0.00" step="0.01" min="0.01" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-lg font-bold text-center">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">طريقة الدفع</label>
                        <select id="vc-payment-method" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="cash">نقدي</option>
                            <option value="card">بطاقة</option>
                            <option value="transfer">تحويل بنكي</option>
                            <option value="check">شيك</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الصندوق</label>
                        <select id="vc-cashbox" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            ${cashboxes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">البيان / ملاحظات</label>
                    <textarea id="vc-notes" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary"></textarea>
                </div>
                <button onclick="Vouchers.save()" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ السند
                </button>
            </div>
        `;
        Utils.modal(`إنشاء ${title}`, content, { size: 'max-w-lg' });
    },

    updateEntityList: function() {
        const type = document.getElementById('vc-entity-type')?.value;
        const sel = document.getElementById('vc-entity-id');
        if (!sel) return;
        let list = [];
        if (type === 'customer') list = DB.get('customers') || [];
        else if (type === 'supplier') list = DB.get('suppliers') || [];
        else if (type === 'employee') list = DB.get('employees') || [];
        sel.innerHTML = list.map(x => `<option value="${x.id}">${Utils.esc(x.name)}</option>`).join('') || '<option value="other">أخرى</option>';
    },

    save: function() {
        const type = window._voucherType;
        const number = document.getElementById('vc-number').value;
        const dateInput = document.getElementById('vc-date').value;
        const amount = parseFloat(document.getElementById('vc-amount').value) || 0;
        const paymentMethod = document.getElementById('vc-payment-method').value;
        const cashboxId = parseInt(document.getElementById('vc-cashbox').value);
        const notes = document.getElementById('vc-notes').value.trim();

        let dateISO = new Date().toISOString();
        try {
            if (dateInput && dateInput.trim() !== '') {
                const parts = dateInput.split('T');
                if (parts.length === 2) {
                    const [year, month, day] = parts[0].split('-').map(Number);
                    const [hour, minute] = parts[1].split(':').map(Number);
                    if (year && month && day) {
                        const d = new Date(year, month - 1, day, hour || 0, minute || 0, 0);
                        if (!isNaN(d.getTime())) dateISO = d.toISOString();
                    }
                }
            }
        } catch (e) {}

        if (amount <= 0) { Utils.toast('error', 'أدخل مبلغ صحيح'); return; }
        if (!cashboxId) { Utils.toast('error', 'اختر صندوق'); return; }

        let entityId = null, entityName = '', entityType = '';
        
        if (type === 'receipt' || type === 'payment') {
            entityType = document.getElementById('vc-entity-type')?.value || '';
            entityId = parseInt(document.getElementById('vc-entity-id')?.value) || null;
            if (entityType === 'customer' && entityId) entityName = DB.find('customers', entityId)?.name || '';
            else if (entityType === 'supplier' && entityId) entityName = DB.find('suppliers', entityId)?.name || '';
            else if (entityType === 'employee' && entityId) entityName = DB.find('employees', entityId)?.name || '';
        } else if (type === 'simple') {
            entityName = document.getElementById('vc-account')?.value || '';
            entityType = document.getElementById('vc-simple-kind')?.value || 'expense';
        } else if (type === 'journal') {
            const debit = document.getElementById('vc-debit')?.value || '';
            const credit = document.getElementById('vc-credit')?.value || '';
            entityName = `${debit} / ${credit}`;
        }

        const voucher = {
            number, type, date: dateISO,
            entityId, entityType, entityName,
            amount, paymentMethod, cashboxId, notes,
            user: Utils.currentUser()?.name || 'system'
        };

        DB.add('vouchers', voucher);

        const cashboxes = DB.get('cashbox') || [];
        const cbIdx = cashboxes.findIndex(c => c.id === cashboxId);
        if (cbIdx !== -1) {
            if (type === 'receipt') cashboxes[cbIdx].balance += amount;
            else if (type === 'payment') cashboxes[cbIdx].balance -= amount;
            else if (type === 'simple') {
                const kind = document.getElementById('vc-simple-kind')?.value;
                if (kind === 'income') cashboxes[cbIdx].balance += amount;
                else cashboxes[cbIdx].balance -= amount;
            }
            DB.set('cashbox', cashboxes);
        }

        if (type === 'receipt' && entityType === 'customer' && entityId) {
            const c = DB.find('customers', entityId);
            if (c) DB.update('customers', entityId, { balance: (c.balance||0) - amount });
        }
        if (type === 'payment' && entityType === 'supplier' && entityId) {
            const s = DB.find('suppliers', entityId);
            if (s) DB.update('suppliers', entityId, { balance: Math.max(0, (s.balance||0) - amount) });
        }

        DB.log('vouchers', `${type} ${number} بمبلغ ${amount}`);
        Utils.toast('success', `تم حفظ السند ${number}`);
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    viewVoucher: function(id) {
        const v = DB.find('vouchers', id);
        if (!v) return;
        const typeLabels = { receipt:'سند قبض', payment:'سند صرف', journal:'سند قيد', simple:'سند بسيط' };

        const content = `
            <div class="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-slate-600">النوع:</span><span class="font-bold">${typeLabels[v.type]}</span></div>
                <div class="flex justify-between"><span class="text-slate-600">الرقم:</span><span class="font-bold font-en">${v.number}</span></div>
                <div class="flex justify-between"><span class="text-slate-600">التاريخ:</span><span>${Utils.formatDate(v.date, true)}</span></div>
                ${v.entityName ? `<div class="flex justify-between"><span class="text-slate-600">الجهة:</span><span class="font-bold">${Utils.esc(v.entityName)}</span></div>` : ''}
                <div class="flex justify-between"><span class="text-slate-600">طريقة الدفع:</span><span>${v.paymentMethod||'نقدي'}</span></div>
                <div class="flex justify-between pt-2 border-t border-slate-200">
                    <span class="text-slate-600">المبلغ:</span>
                    <span class="font-black text-2xl text-amber-600">${Utils.formatCurrency(v.amount)}</span>
                </div>
                ${v.notes ? `<div class="pt-2 border-t border-slate-200"><p class="text-slate-600 text-xs mb-1">البيان:</p><p>${Utils.esc(v.notes)}</p></div>` : ''}
            </div>
            <div class="flex gap-2 mt-4">
                <button onclick="Vouchers.printVoucher(${id})" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-print"></i> طباعة
                </button>
            </div>
        `;
        Utils.modal(typeLabels[v.type], content, { size: 'max-w-md' });
    },

    // ============================================
    // ✅ طباعة السند - تصميم مميز لكل نوع
    // ============================================
    printVoucher: function(id) {
        const v = DB.find('vouchers', id);
        if (!v) return;
        
        const sys = DB.get('system') || {};
        const dev = DB.get('developerInfo') || {};
        
        // ✅ إعدادات كل نوع (أيقونة، تسمية، توقيعات)
        const typeConfig = {
            receipt: { 
                label: 'سند قبض', 
                icon: 'fa-arrow-down',
                entityLabel: 'استلمنا من',
                entityIcon: 'fa-user',
                signature1: 'توقيع المستلم',
                signature2: 'توقيع المسؤول'
            },
            payment: { 
                label: 'سند صرف', 
                icon: 'fa-arrow-up',
                entityLabel: 'دفعنا إلى',
                entityIcon: 'fa-user-tie',
                signature1: 'توقيع المستلم',
                signature2: 'توقيع المسؤول'
            },
            journal: { 
                label: 'سند قيد', 
                icon: 'fa-book',
                entityLabel: 'الطرفان المدين / الدائن',
                entityIcon: 'fa-scale-balanced',
                signature1: 'توقيع المحاسب',
                signature2: 'توقيع المدقق'
            },
            simple: { 
                label: 'سند بسيط', 
                icon: 'fa-receipt',
                entityLabel: 'البيان',
                entityIcon: 'fa-tag',
                signature1: 'توقيع المسؤول',
                signature2: 'توقيع المستلم'
            }
        };
        
        const cfg = typeConfig[v.type] || typeConfig.simple;
        const amountWords = this.numberToArabicWords(v.amount);
        
        // ✅ جدول تفصيلي حسب النوع
        let tableHeaders = [];
        let tableRows = [];
        
        if (v.type === 'journal') {
            tableHeaders = ['البيان', 'مدين', 'دائن'];
            tableRows = [
                [Utils.esc(v.entityName || '-'), `<strong>${v.amount.toLocaleString()}</strong>`, '-'],
                [Utils.esc(v.notes || 'القيد المحاسبي'), '-', `<strong>${v.amount.toLocaleString()}</strong>`]
            ];
        } else {
            tableHeaders = ['البيان', 'المبلغ'];
            tableRows = [
                [Utils.esc(v.entityName || cfg.entityLabel), `<strong>${v.amount.toLocaleString()} ${sys.currency || ''}</strong>`]
            ];
        }
        
        // ✅ بطاقات المعلومات
        const infoCards = [
            {
                title: 'معلومات السند',
                icon: 'fa-file-invoice',
                rows: [
                    { lbl: 'رقم السند', val: v.number },
                    { lbl: 'التاريخ', val: Utils.formatDate(v.date) },
                    { lbl: 'الوقت', val: Utils.formatTime(v.date) },
                    { lbl: 'طريقة الدفع', val: 
                        v.paymentMethod === 'cash' ? 'نقدي' : 
                        v.paymentMethod === 'card' ? 'بطاقة' : 
                        v.paymentMethod === 'transfer' ? 'تحويل بنكي' : 
                        v.paymentMethod === 'check' ? 'شيك' : 
                        (v.paymentMethod || 'نقدي') 
                    }
                ]
            },
            {
                title: cfg.entityLabel,
                icon: cfg.entityIcon,
                rows: [
                    { lbl: 'الجهة', val: v.entityName || '-' },
                    { lbl: 'المستخدم', val: v.user || '-' },
                    ...(v.notes ? [{ lbl: 'ملاحظات', val: v.notes }] : [])
                ]
            }
        ];
        
        // ✅ بناء المستند (النوع يحدد اللون تلقائياً من CSS)
        const html = Utils.buildGoldInvoice({
            type: v.type,
            typeLabel: cfg.label,
            number: v.number,
            date: v.date,
            infoCards: infoCards,
            tableHeaders: tableHeaders,
            tableRows: tableRows,
            bigAmount: {
                label: 'المبلغ الإجمالي',
                value: `${v.amount.toLocaleString()} ${sys.currency || ''}`,
                words: amountWords
            },
            signatures: [cfg.signature1, cfg.signature2],
            footerThanks: 'شكراً لتعاملكم معنا',
            footerSubtext: 'نتشرف بخدمتكم دائماً',
            devInfo: {
                name: dev.nameEn || '',
                title: dev.titleEn || '',
                phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
                copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
            }
        });
        
        Utils.printHTML(html, cfg.label);
        DB.log('vouchers', `طباعة ${cfg.label} ${v.number}`);
    },

    numberToArabicWords: function(num) {
        if (!num) return '';
        num = Math.floor(num);
        const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
        const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
        const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
        const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
        
        if (num === 0) return 'صفر';
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) {
            const o = num % 10;
            const t = Math.floor(num / 10);
            return o ? `${ones[o]} و${tens[t]}` : tens[t];
        }
        if (num < 1000) {
            const h = Math.floor(num / 100);
            const r = num % 100;
            return r ? `${hundreds[h]} و${this.numberToArabicWords(r)}` : hundreds[h];
        }
        if (num < 1000000) {
            const th = Math.floor(num / 1000);
            const r = num % 1000;
            const thWord = th === 1 ? 'ألف' : th === 2 ? 'ألفان' : `${this.numberToArabicWords(th)} آلاف`;
            return r ? `${thWord} و${this.numberToArabicWords(r)}` : thWord;
        }
        const m = Math.floor(num / 1000000);
        const r = num % 1000000;
        const mWord = m === 1 ? 'مليون' : m === 2 ? 'مليونان' : `${this.numberToArabicWords(m)} ملايين`;
        return r ? `${mWord} و${this.numberToArabicWords(r)}` : mWord;
    },

    deleteVoucher: function(id) {
        Utils.confirm('حذف السند؟ سيتم عكس تأثير الحركة على الصندوق.', () => {
            const v = DB.find('vouchers', id);
            if (v) {
                const cashboxes = DB.get('cashbox') || [];
                const cbIdx = cashboxes.findIndex(c => c.id === v.cashboxId);
                if (cbIdx !== -1) {
                    if (v.type === 'receipt') cashboxes[cbIdx].balance -= v.amount;
                    else if (v.type === 'payment') cashboxes[cbIdx].balance += v.amount;
                    DB.set('cashbox', cashboxes);
                }
            }
            DB.remove('vouchers', id);
            Utils.toast('success', 'تم الحذف');
            this.renderList();
        });
    }
};