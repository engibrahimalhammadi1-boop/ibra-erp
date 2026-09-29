/**
 * Invoices Screen - الطلبات والفواتير
 */
const Invoices = {
    activeTab: 'invoices',
    filterStatus: 'all',
    filterDate: 'today',
    searchQuery: '',

    render: function() {
        const invoices = DB.get('invoices') || [];
        const orders = DB.get('orders') || [];
        const today = new Date().toDateString();
        
        const todayInvoices = invoices.filter(i => new Date(i.date).toDateString() === today);
        const todaySales = todayInvoices.reduce((s,i) => s + i.total, 0);
        const pendingOrders = orders.filter(o => ['new','preparing','ready'].includes(o.status));

        return `
        <div class="space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-file-invoice-dollar text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${todayInvoices.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">فواتير اليوم</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-coins text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(todaySales).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">مبيعات اليوم</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-clock text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${pendingOrders.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">طلبات نشطة</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-chart-line text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(invoices.reduce((s,i)=>s+i.total,0)).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي المبيعات</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex gap-1">
                <button onclick="Invoices.setTab('invoices')" data-tab="invoices" class="inv-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-file-invoice-dollar"></i> الفواتير
                </button>
                <button onclick="Invoices.setTab('orders')" data-tab="orders" class="inv-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-receipt"></i> الطلبات
                    <span class="badge badge-warning text-xs">${pendingOrders.length}</span>
                </button>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="inv-search" placeholder="ابحث برقم الفاتورة أو اسم العميل..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <select id="inv-date-filter" onchange="Invoices.setDateFilter(this.value)" 
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                    <option value="today">اليوم</option>
                    <option value="yesterday">أمس</option>
                    <option value="week">هذا الأسبوع</option>
                    <option value="month">هذا الشهر</option>
                    <option value="year">هذه السنة</option>
                    <option value="all">الكل</option>
                </select>
                <button onclick="Invoices.exportCSV()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-file-csv"></i> تصدير
                </button>
            </div>

            <div id="inv-content"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.updateTabButtons();
        this.renderContent();
        const search = document.getElementById('inv-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderContent();
            }, 150);
        }
        const dateFilter = document.getElementById('inv-date-filter');
        if (dateFilter) dateFilter.value = this.filterDate;
    },

    setTab: function(tab) {
        this.activeTab = tab;
        this.updateTabButtons();
        this.renderContent();
    },

    updateTabButtons: function() {
        document.querySelectorAll('.inv-tab-btn').forEach(b => {
            const isActive = b.dataset.tab === this.activeTab;
            b.className = `inv-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`;
        });
    },

    setDateFilter: function(val) {
        this.filterDate = val;
        this.renderContent();
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
                case 'yesterday': return itemDay.getTime() === today.getTime() - 86400000;
                case 'week': {
                    const weekAgo = new Date(today); weekAgo.setDate(today.getDate()-7);
                    return itemDay >= weekAgo;
                }
                case 'month': return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                case 'year': return d.getFullYear() === now.getFullYear();
                default: return true;
            }
        });
    },

    renderContent: function() {
        if (this.activeTab === 'invoices') this.renderInvoices();
        else this.renderOrders();
    },

    renderInvoices: function() {
        const container = document.getElementById('inv-content');
        if (!container) return;

        let invoices = this.filterByDate(DB.get('invoices') || []);
        if (this.searchQuery) {
            invoices = invoices.filter(i => 
                (i.number||'').toLowerCase().includes(this.searchQuery) ||
                (DB.find('customers', i.customerId)?.name||'').toLowerCase().includes(this.searchQuery)
            );
        }
        invoices.sort((a,b) => new Date(b.date) - new Date(a.date));

        if (invoices.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-file-invoice text-5xl mb-3"></i>
                <p>لا توجد فواتير</p>
            </div>`;
            return;
        }

        const methodLabels = { cash: 'نقدي', card: 'بطاقة', credit: 'آجل' };
        const methodIcons = { cash: 'fa-money-bill-wave', card: 'fa-credit-card', credit: 'fa-hand-holding-dollar' };

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>التاريخ</th>
                                <th>العميل</th>
                                <th>الأصناف</th>
                                <th>الإجمالي</th>
                                <th>الدفع</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoices.map(inv => {
                                const customer = DB.find('customers', inv.customerId);
                                return `
                                    <tr>
                                        <td class="font-bold font-en">${inv.number}</td>
                                        <td>
                                            <p class="text-sm">${Utils.formatDate(inv.date)}</p>
                                            <p class="text-xs text-slate-400">${Utils.formatTime(inv.date)}</p>
                                        </td>
                                        <td>${Utils.esc(customer?.name || 'عميل نقدي')}</td>
                                        <td>${(inv.items||[]).length}</td>
                                        <td class="font-black text-primary">${Utils.formatCurrency(inv.total)}</td>
                                        <td>
                                            <span class="badge ${inv.paymentMethod==='cash'?'badge-success':inv.paymentMethod==='card'?'badge-info':'badge-warning'}">
                                                <i class="fa-solid ${methodIcons[inv.paymentMethod]||'fa-money-bill'}"></i>
                                                ${methodLabels[inv.paymentMethod]||inv.paymentMethod}
                                            </span>
                                        </td>
                                        <td>
                                            ${inv.status === 'cancelled' 
                                                ? '<span class="badge badge-danger">ملغاة</span>'
                                                : inv.status === 'returned'
                                                ? '<span class="badge badge-warning">مرتجعة</span>'
                                                : '<span class="badge badge-success">مدفوعة</span>'}
                                        </td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button onclick="Invoices.viewInvoice(${inv.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center" title="عرض">
                                                    <i class="fa-solid fa-eye text-xs"></i>
                                                </button>
                                                <button onclick="Invoices.reprintInvoice(${inv.id})" class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center" title="إعادة طباعة">
                                                    <i class="fa-solid fa-print text-xs"></i>
                                                </button>
                                                <button onclick="Invoices.returnInvoice(${inv.id})" class="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center" title="مرتجع">
                                                    <i class="fa-solid fa-rotate-left text-xs"></i>
                                                </button>
                                                ${inv.status !== 'cancelled' && Utils.currentUser()?.role === 'admin' ? `
                                                    <button onclick="Invoices.cancelInvoice(${inv.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center" title="إلغاء">
                                                        <i class="fa-solid fa-ban text-xs"></i>
                                                    </button>
                                                ` : ''}
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

    renderOrders: function() {
        const container = document.getElementById('inv-content');
        if (!container) return;

        let orders = this.filterByDate(DB.get('orders') || []);
        if (this.searchQuery) {
            orders = orders.filter(o => (o.number||'').toLowerCase().includes(this.searchQuery));
        }
        orders.sort((a,b) => new Date(b.date) - new Date(a.date));

        if (orders.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-receipt text-5xl mb-3"></i>
                <p>لا توجد طلبات</p>
            </div>`;
            return;
        }

        const statusInfo = {
            new: { label: 'جديد', cls: 'badge-danger' },
            preparing: { label: 'قيد التحضير', cls: 'badge-warning' },
            ready: { label: 'جاهز', cls: 'badge-info' },
            served: { label: 'تم التقديم', cls: 'badge-gray' },
            paid: { label: 'مدفوع', cls: 'badge-success' },
            cancelled: { label: 'ملغي', cls: 'badge-danger' }
        };

        const typeLabels = { 'dine-in': 'محلي', 'takeaway': 'سفري', 'delivery': 'توصيل' };
        const typeIcons = { 'dine-in': 'fa-utensils', 'takeaway': 'fa-bag-shopping', 'delivery': 'fa-motorcycle' };

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${orders.map(o => {
                    const info = statusInfo[o.status] || statusInfo.new;
                    const table = o.tableId ? DB.find('tables', o.tableId) : null;
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
                            <div class="flex items-start justify-between mb-3">
                                <div>
                                    <p class="font-black font-en text-lg">${o.number}</p>
                                    <p class="text-xs text-slate-500">${Utils.formatDate(o.date, true)}</p>
                                </div>
                                <span class="badge ${info.cls}">${info.label}</span>
                            </div>
                            
                            <div class="flex items-center gap-3 mb-3 text-xs">
                                <span class="flex items-center gap-1">
                                    <i class="fa-solid ${typeIcons[o.type]}"></i>
                                    ${typeLabels[o.type]}
                                </span>
                                ${table ? `<span class="flex items-center gap-1"><i class="fa-solid fa-chair"></i> ${table.name}</span>` : ''}
                            </div>

                            <div class="max-h-24 overflow-y-auto bg-slate-50 rounded-lg p-2 space-y-1 mb-3">
                                ${o.items.map(i => `
                                    <div class="flex justify-between text-xs">
                                        <span>${Utils.esc(i.name)} × ${i.quantity}</span>
                                        <span class="font-bold">${i.total.toLocaleString()}</span>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="flex items-center justify-between pt-3 border-t border-slate-200">
                                <span class="font-black text-primary text-lg">${Utils.formatCurrency(o.total)}</span>
                                <div class="flex gap-1">
                                    ${o.status === 'ready' ? `
                                        <button onclick="Invoices.serveOrder(${o.id})" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold">
                                            <i class="fa-solid fa-check-double"></i> تقديم
                                        </button>
                                    ` : ''}
                                    ${['served','ready'].includes(o.status) ? `
                                        <button onclick="Invoices.convertOrderToInvoice(${o.id})" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold">
                                            <i class="fa-solid fa-money-bill"></i> تحصيل
                                        </button>
                                    ` : ''}
                                    <button onclick="Invoices.viewOrder(${o.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                                        <i class="fa-solid fa-eye text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    viewInvoice: function(id) {
        const inv = DB.find('invoices', id);
        if (!inv) return;
        const html = this.buildInvoiceHTML(inv);
        Utils.modal('تفاصيل الفاتورة', html, { size: 'max-w-2xl' });
    },

    buildInvoiceHTML: function(inv) {
    const sys = DB.get('system') || {};
    const settings = DB.get('settings') || {};
    const invSettings = settings.invoice || {};
    const dev = DB.get('developerInfo') || {};
    const customer = DB.find('customers', inv.customerId) || {};
    const table = inv.tableId ? DB.find('tables', inv.tableId) : null;

    // بطاقات المعلومات
    const infoCards = [
        {
            title: 'معلومات العميل',
            icon: 'fa-user',
            rows: [
                { lbl: 'الاسم', val: customer.name || 'عميل نقدي' },
                { lbl: 'الهاتف', val: customer.phone || '-' },
                { lbl: 'الكاشير', val: inv.user || '-' }
            ]
        },
        {
            title: 'معلومات الفاتورة',
            icon: 'fa-file-invoice',
            rows: [
                { lbl: 'رقم الفاتورة', val: inv.number },
                { lbl: 'نوع الطلب', val: inv.orderType === 'dine-in' ? 'محلي' : inv.orderType === 'takeaway' ? 'سفري' : 'توصيل' },
                ...(table ? [{ lbl: 'الطاولة', val: table.name }] : []),
                { lbl: 'طريقة الدفع', val: inv.paymentMethod === 'cash' ? 'نقدي' : inv.paymentMethod === 'card' ? 'بطاقة' : 'آجل' }
            ]
        }
    ];

    // جدول الأصناف
    const tableHeaders = ['الصنف', 'الكمية', 'السعر', 'الإجمالي'];
    const tableRows = inv.items.map(i => [
        Utils.esc(i.name) + (i.notes ? `<br><small style="color:#d97706;">${Utils.esc(i.notes)}</small>` : ''),
        i.quantity,
        i.price.toLocaleString(),
        i.total.toLocaleString()
    ]);

    // المجاميع
    const totals = [
        { lbl: 'المجموع الفرعي', val: `${inv.subtotal.toLocaleString()} ${sys.currency}` },
        ...(inv.discount ? [{ lbl: 'الخصم', val: `-${inv.discount.toLocaleString()} ${sys.currency}`, type: 'discount' }] : []),
        ...(invSettings.showTax !== false && inv.tax ? [{ lbl: 'الضريبة', val: `${inv.tax.toLocaleString()} ${sys.currency}`, type: 'tax' }] : []),
        ...(invSettings.showServiceCharge !== false && inv.service ? [{ lbl: 'الخدمة', val: `${inv.service.toLocaleString()} ${sys.currency}`, type: 'service' }] : []),
        { lbl: 'الإجمالي', val: `${inv.total.toLocaleString()} ${sys.currency}`, type: 'final' }
    ];

    // استدعاء الدالة الموحدة
    const html = Utils.buildGoldInvoice({
        type: 'invoice',
        typeLabel: 'فاتورة',
        number: inv.number,
        date: inv.date,
        infoCards: infoCards,
        tableHeaders: tableHeaders,
        tableRows: tableRows,
        totals: totals,
        signatures: ['توقيع المستلم', 'توقيع الكاشير'],
        footerThanks: invSettings.footerText || 'شكراً لزيارتكم',
        devInfo: {
            name: dev.nameEn || '',
            title: dev.titleEn || '',
            phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
            copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
        }
    });

    return html + `
        <div class="mt-4 flex gap-2 no-print">
            <button onclick="Invoices.printCurrent()" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                <i class="fa-solid fa-print"></i> طباعة
            </button>
            <button onclick="Invoices.editInvoiceDetails(${inv.id})" class="flex-1 py-2.5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-bold">
                <i class="fa-solid fa-edit"></i> تعديل
            </button>
        </div>
    `;
},


    printCurrent: function() {
        const printArea = document.getElementById('print-area');
        if (!printArea) return;
        Utils.printHTML(printArea.outerHTML, 'فاتورة');
    },

    editInvoiceDetails: function(id) {
        const inv = DB.find('invoices', id);
        if (!inv) return;
        
        const content = `
            <div class="space-y-3">
                <p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <i class="fa-solid fa-info-circle"></i> التعديل هنا يؤثر على الفاتورة الأصلية.
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">رقم الفاتورة</label>
                        <input type="text" id="edit-inv-num" value="${inv.number}" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">التاريخ</label>
                        <input type="date" id="edit-inv-date" value="${new Date(inv.date).toISOString().split('T')[0]}" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">العميل</label>
                    <select id="edit-inv-customer" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        ${(DB.get('customers')||[]).map(c => `<option value="${c.id}" ${inv.customerId===c.id?'selected':''}>${Utils.esc(c.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-bold mb-1">الخصم</label>
                        <input type="number" id="edit-inv-discount" value="${inv.discount||0}" class="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">الضريبة</label>
                        <input type="number" id="edit-inv-tax" value="${inv.tax||0}" class="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">الخدمة</label>
                        <input type="number" id="edit-inv-service" value="${inv.service||0}" class="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center">
                    </div>
                </div>
                <button onclick="Invoices.saveInvoiceEdit(${id})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ التعديلات
                </button>
            </div>
        `;
        Utils.modal('تعديل تفاصيل الفاتورة', content, { size: 'max-w-2xl' });
    },

    saveInvoiceEdit: function(id) {
        const inv = DB.find('invoices', id);
        if (!inv) return;

        const number = document.getElementById('edit-inv-num').value.trim();
        const date = document.getElementById('edit-inv-date').value;
        const customerId = parseInt(document.getElementById('edit-inv-customer').value);
        const discount = parseFloat(document.getElementById('edit-inv-discount').value) || 0;
        const tax = parseFloat(document.getElementById('edit-inv-tax').value) || 0;
        const service = parseFloat(document.getElementById('edit-inv-service').value) || 0;
        
        const subtotal = inv.items.reduce((s,i) => s + i.total, 0);
        const total = subtotal - discount + tax + service;

        let dateISO = new Date().toISOString();
        if (date) {
            const pd = new Date(date);
            if (!isNaN(pd.getTime())) dateISO = pd.toISOString();
        }

        DB.update('invoices', id, {
            number, date: dateISO, customerId,
            discount, tax, service, subtotal, total
        });

        DB.log('invoices', `تعديل الفاتورة ${number}`);
        Utils.toast('success', 'تم حفظ التعديلات');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderInvoices();
    },

    reprintInvoice: function(id) {
        const inv = DB.find('invoices', id);
        if (!inv) return;
        const html = this.buildInvoiceHTML(inv);
        const printArea = document.createElement('div');
        printArea.innerHTML = html;
        const printContent = printArea.querySelector('#print-area');
        Utils.printHTML(printContent ? printContent.outerHTML : html, 'فاتورة');
        DB.log('invoices', `إعادة طباعة الفاتورة ${inv.number}`);
    },

    returnInvoice: function(id) {
        const inv = DB.find('invoices', id);
        if (!inv) return;

        const content = `
            <div class="space-y-3">
                <p class="text-sm bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-700">
                    <i class="fa-solid fa-info-circle"></i> سيتم إرجاع كامل الفاتورة، ويُعاد المبلغ للعميل.
                </p>
                <div class="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
                    <div class="flex justify-between"><span>الفاتورة:</span><span class="font-bold font-en">${inv.number}</span></div>
                    <div class="flex justify-between"><span>الإجمالي:</span><span class="font-bold">${inv.total.toLocaleString()}</span></div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">سبب الإرجاع</label>
                    <textarea id="return-reason" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary"></textarea>
                </div>
                <button onclick="Invoices.confirmReturn(${id})" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-rotate-left"></i> تأكيد الإرجاع
                </button>
            </div>
        `;
        Utils.modal('إرجاع فاتورة', content, { size: 'max-w-md' });
    },

    confirmReturn: function(id) {
        const inv = DB.find('invoices', id);
        if (!inv) return;
        const reason = document.getElementById('return-reason').value.trim();

        DB.update('invoices', id, { status: 'returned', returnReason: reason, returnDate: new Date().toISOString() });

        const cashboxes = DB.get('cashbox') || [];
        if (cashboxes.length > 0 && inv.paymentMethod !== 'credit') {
            cashboxes[0].balance -= inv.total;
            DB.set('cashbox', cashboxes);
        }

        if (inv.paymentMethod === 'credit') {
            const customer = DB.find('customers', inv.customerId);
            if (customer) {
                DB.update('customers', inv.customerId, { balance: (customer.balance||0) - inv.total });
            }
        }

        DB.log('invoices', `إرجاع الفاتورة ${inv.number} - السبب: ${reason}`);
        Utils.toast('success', 'تم إرجاع الفاتورة');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderInvoices();
    },

    cancelInvoice: function(id) {
        Utils.confirm('هل أنت متأكد من إلغاء الفاتورة؟', () => {
            const inv = DB.find('invoices', id);
            DB.update('invoices', id, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelledBy: Utils.currentUser()?.name });
            
            const cashboxes = DB.get('cashbox') || [];
            if (cashboxes.length > 0 && inv?.paymentMethod !== 'credit') {
                cashboxes[0].balance -= inv.total;
                DB.set('cashbox', cashboxes);
            }
            
            DB.log('invoices', `إلغاء الفاتورة ${inv?.number}`);
            Utils.toast('success', 'تم إلغاء الفاتورة');
            this.renderInvoices();
        });
    },

    viewOrder: function(id) {
        const o = DB.find('orders', id);
        if (!o) return;
        const statusInfo = { new:'جديد', preparing:'قيد التحضير', ready:'جاهز', served:'تم التقديم', paid:'مدفوع', cancelled:'ملغي' };
        const content = `
            <div class="space-y-3">
                <div class="bg-gradient-to-r from-primary to-blue-800 text-white rounded-xl p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-black text-lg font-en">${o.number}</h3>
                            <p class="text-xs opacity-90">${Utils.formatDate(o.date, true)}</p>
                        </div>
                        <span class="badge bg-white/20">${statusInfo[o.status]}</span>
                    </div>
                </div>
                <div class="space-y-2">
                    ${o.items.map(i => `
                        <div class="flex justify-between bg-slate-50 rounded-lg p-2 text-sm">
                            <div>
                                <p class="font-bold">${Utils.esc(i.name)}</p>
                                ${i.notes?`<p class="text-xs text-amber-600">${Utils.esc(i.notes)}</p>`:''}
                            </div>
                            <div class="text-left">
                                <p>${i.quantity} × ${i.price.toLocaleString()}</p>
                                <p class="font-black">${i.total.toLocaleString()}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="bg-primary/5 rounded-xl p-3 flex justify-between font-black text-lg border border-primary/20">
                    <span>الإجمالي:</span>
                    <span class="text-primary">${o.total.toLocaleString()}</span>
                </div>
            </div>
        `;
        Utils.modal('تفاصيل الطلب', content, { size: 'max-w-md' });
    },

    serveOrder: function(id) {
        DB.update('orders', id, { status: 'served' });
        Utils.toast('success', 'تم تسجيل التقديم');
        this.renderOrders();
    },

    convertOrderToInvoice: function(id) {
        const o = DB.find('orders', id);
        if (!o) return;

        const sys = DB.get('system');
        const custId = o.customerId || 1;
        const subtotal = o.items.reduce((s,i) => s + i.total, 0);
        const taxRate = sys.taxRate || 0;
        const serviceRate = o.type === 'dine-in' ? (sys.serviceCharge || 0) : 0;
        const tax = subtotal * taxRate;
        const service = subtotal * serviceRate;
        const total = subtotal + tax + service;

        const invoice = {
            number: Utils.generateInvoiceNumber('INV'),
            date: new Date().toISOString(),
            items: o.items,
            subtotal, discount: 0, tax, service, total,
            paid: total, change: 0,
            paymentMethod: 'cash',
            cashboxId: 1,
            customerId: custId,
            tableId: o.tableId,
            orderType: o.type,
            status: 'paid',
            user: Utils.currentUser()?.name || 'system',
            orderRef: o.number
        };

        DB.add('invoices', invoice);
        DB.update('orders', id, { status: 'paid' });

        const cashboxes = DB.get('cashbox') || [];
        if (cashboxes.length > 0) {
            cashboxes[0].balance += total;
            DB.set('cashbox', cashboxes);
        }

        if (o.tableId) {
            DB.update('tables', o.tableId, { status: 'cleaning', currentOrder: null });
        }

        DB.log('invoices', `تحويل طلب ${o.number} إلى فاتورة ${invoice.number}`);
        Utils.toast('success', `تم إنشاء الفاتورة ${invoice.number}`);
        this.renderOrders();
    },

    exportCSV: function() {
        if (this.activeTab === 'invoices') {
            const invoices = this.filterByDate(DB.get('invoices')||[]);
            const data = invoices.map(i => ({
                'رقم الفاتورة': i.number,
                'التاريخ': Utils.formatDate(i.date, true),
                'العميل': DB.find('customers', i.customerId)?.name || '',
                'الإجمالي': i.total,
                'الدفع': i.paymentMethod,
                'الحالة': i.status
            }));
            Utils.exportCSV(data, 'invoices.csv');
        } else {
            const orders = this.filterByDate(DB.get('orders')||[]);
            const data = orders.map(o => ({
                'رقم الطلب': o.number,
                'التاريخ': Utils.formatDate(o.date, true),
                'النوع': o.type,
                'الإجمالي': o.total,
                'الحالة': o.status
            }));
            Utils.exportCSV(data, 'orders.csv');
        }
    }
};