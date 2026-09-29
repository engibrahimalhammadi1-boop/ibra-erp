/**
 * Customers Screen - العملاء
 */
const Customers = {
    searchQuery: '',

    render: function() {
        const customers = DB.get('customers') || [];
        const totalDebt = customers.reduce((s,c) => s + Math.max(0, c.balance||0), 0);

        return `
        <div class="space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-users text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${customers.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي العملاء</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-user-check text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${customers.filter(c=>c.type==='regular').length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">عملاء مسجلون</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-hand-holding-dollar text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(totalDebt).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي الديون</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-crown text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${customers.filter(c=>c.balance<0).length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">عملاء دائنون</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="cust-search" placeholder="ابحث بالاسم أو الهاتف..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <button onclick="Customers.openForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> عميل جديد
                </button>
            </div>

            <div id="cust-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderList();
        const search = document.getElementById('cust-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderList();
            }, 150);
        }
    },

    renderList: function() {
        const container = document.getElementById('cust-container');
        if (!container) return;

        let customers = DB.get('customers') || [];
        if (this.searchQuery) {
            customers = customers.filter(c => 
                c.name.toLowerCase().includes(this.searchQuery) ||
                (c.phone||'').includes(this.searchQuery)
            );
        }

        if (customers.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-users text-5xl mb-3"></i>
                <p>لا يوجد عملاء</p>
            </div>`;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${customers.map(c => {
                    const balance = c.balance || 0;
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-black text-lg">
                                        ${c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p class="font-bold">${Utils.esc(c.name)}</p>
                                        <p class="text-xs text-slate-500 font-en" dir="ltr">${c.phone || '—'}</p>
                                    </div>
                                </div>
                                ${c.type === 'cash' ? '<span class="badge badge-gray">نقدي</span>' : ''}
                            </div>
                            
                            <div class="grid grid-cols-2 gap-2 mb-3">
                                <div class="bg-slate-50 rounded-xl p-2 text-center">
                                    <p class="text-xs text-slate-500">الرصيد</p>
                                    <p class="font-black ${balance>0?'text-red-600':balance<0?'text-green-600':'text-slate-800'}">
                                        ${Utils.formatCurrency(Math.abs(balance))}
                                    </p>
                                    <p class="text-[10px] text-slate-400">${balance>0?'مدين':balance<0?'دائن':'مسدد'}</p>
                                </div>
                                <div class="bg-slate-50 rounded-xl p-2 text-center">
                                    <p class="text-xs text-slate-500">الفواتير</p>
                                    <p class="font-black text-slate-800">
                                        ${(DB.get('invoices')||[]).filter(i=>i.customerId===c.id).length}
                                    </p>
                                </div>
                            </div>

                            <div class="flex gap-1">
                                <button onclick="Customers.viewStatement(${c.id})" class="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                                    <i class="fa-solid fa-file-invoice"></i> كشف
                                </button>
                                <button onclick="Customers.openPayment(${c.id})" class="flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold">
                                    <i class="fa-solid fa-money-bill"></i> دفعة
                                </button>
                                <button onclick="Customers.openForm(${c.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center">
                                    <i class="fa-solid fa-edit text-xs"></i>
                                </button>
                                <button onclick="Customers.deleteCustomer(${c.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    openForm: function(custId = null) {
        const c = custId ? DB.find('customers', custId) : null;
        const isEdit = !!c;
        
        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">اسم العميل *</label>
                    <input type="text" id="cust-name" value="${c?.name || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">رقم الهاتف</label>
                        <input type="tel" id="cust-phone" value="${c?.phone || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en" dir="ltr">
                    </div>
                    <div>
    <label class="block text-sm font-bold mb-1">الرقم الضريبي</label>
    <input type="text" id="cust-taxNumber" value="${c?.taxNumber || ''}" dir="ltr"
           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
</div>
                    <div>
                        <label class="block text-sm font-bold mb-1">النوع</label>
                        <select id="cust-type" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="regular" ${c?.type==='regular'?'selected':''}>عميل عادي</option>
                            <option value="vip" ${c?.type==='vip'?'selected':''}>VIP</option>
                            <option value="wholesale" ${c?.type==='wholesale'?'selected':''}>جملة</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">العنوان</label>
                    <input type="text" id="cust-address" value="${c?.address || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                ${isEdit ? `
                    <div>
                        <label class="block text-sm font-bold mb-1">الرصيد</label>
                        <input type="number" id="cust-balance" value="${c?.balance || 0}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                ` : ''}
                <div>
                    <label class="block text-sm font-bold mb-1">ملاحظات</label>
                    <textarea id="cust-notes" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">${c?.notes || ''}</textarea>
                </div>
                <button onclick="Customers.save(${custId||'null'})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة العميل'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل عميل' : 'عميل جديد', content, { size: 'max-w-lg' });
    },

    save: function(custId) {
        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const type = document.getElementById('cust-type').value;
        const address = document.getElementById('cust-address').value.trim();
        const notes = document.getElementById('cust-notes').value.trim();
        

        if (!name) { Utils.toast('error', 'أدخل اسم العميل'); return; }

        const data = { name, phone, type, address, notes };
        

        if (custId) {
            const balanceInput = document.getElementById('cust-balance');
            if (balanceInput) data.balance = parseFloat(balanceInput.value) || 0;
            DB.update('customers', custId, data);
            DB.log('customers', `تعديل عميل ${name}`);
            Utils.toast('success', 'تم التحديث');
        } else {
            data.balance = 0;
            DB.add('customers', data);
            DB.log('customers', `إضافة عميل ${name}`);
            Utils.toast('success', 'تمت الإضافة');
        }
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    deleteCustomer: function(id) {
        const c = DB.find('customers', id);
        if (c?.type === 'cash' || c?.name === 'عميل نقدي') {
            Utils.toast('error', 'لا يمكن حذف العميل النقدي');
            return;
        }
        Utils.confirm('حذف العميل؟', () => {
            DB.remove('customers', id);
            Utils.toast('success', 'تم الحذف');
            this.renderList();
        });
    },

    viewStatement: function(custId) {
        const c = DB.find('customers', custId);
        if (!c) return;
        
        const invoices = (DB.get('invoices')||[]).filter(i => i.customerId === custId).sort((a,b)=>new Date(b.date)-new Date(a.date));
        const payments = (DB.get('vouchers')||[]).filter(v => v.type === 'receipt' && v.entityId === custId && v.entityType === 'customer');
        
        const allTx = [
            ...invoices.map(i => ({ date: i.date, desc: `فاتورة ${i.number}`, debit: i.total, credit: 0 })),
            ...payments.map(p => ({ date: p.date, desc: `سند قبض ${p.number}`, debit: 0, credit: p.amount }))
        ].sort((a,b) => new Date(b.date) - new Date(a.date));

        const content = `
            <div class="space-y-3">
                <div class="bg-gradient-to-r from-primary to-blue-800 text-white rounded-xl p-4">
                    <h3 class="font-black text-lg">${Utils.esc(c.name)}</h3>
                    <p class="text-sm opacity-90 font-en" dir="ltr">${c.phone || ''}</p>
                    <div class="mt-3 pt-3 border-t border-white/20 flex justify-between">
                        <span>الرصيد:</span>
                        <span class="font-black text-lg">${Utils.formatCurrency(Math.abs(c.balance||0))}</span>
                    </div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden max-h-96 overflow-y-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>التاريخ</th><th>البيان</th><th>مدين</th><th>دائن</th></tr>
                        </thead>
                        <tbody>
                            ${allTx.length === 0 ? '<tr><td colspan="4" class="text-center text-slate-400 py-8">لا توجد حركات</td></tr>' :
                              allTx.map(t => `
                                <tr>
                                    <td class="text-xs">${Utils.formatDate(t.date)}</td>
                                    <td class="text-sm">${Utils.esc(t.desc)}</td>
                                    <td class="text-red-600">${t.debit ? t.debit.toLocaleString() : '-'}</td>
                                    <td class="text-green-600">${t.credit ? t.credit.toLocaleString() : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <button onclick="Customers.printStatement(${custId})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-print"></i> طباعة الكشف
                </button>
            </div>
        `;
        Utils.modal('كشف حساب العميل', content, { size: 'max-w-2xl' });
    },

    printStatement: function(custId) {
    const c = DB.find('customers', custId);
    if (!c) return;
    
    const sys = DB.get('system') || {};
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    const dev = DB.get('developerInfo') || {};
    
    const invoices = (DB.get('invoices')||[]).filter(i => i.customerId === custId);
    const payments = (DB.get('vouchers')||[]).filter(v => v.type === 'receipt' && v.entityId === custId && v.entityType === 'customer');
    
    const allTx = [
        ...invoices.map(i => ({ date: i.date, desc: `فاتورة ${i.number}`, debit: i.total, credit: 0 })),
        ...payments.map(p => ({ date: p.date, desc: `سند قبض ${p.number}`, debit: 0, credit: p.amount }))
    ].sort((a,b) => new Date(a.date) - new Date(b.date));

    let running = 0;
    const txWithBalance = allTx.map(t => {
        running += (t.debit - t.credit);
        return { ...t, balance: running };
    });

    const totalDebit = allTx.reduce((s,t) => s + t.debit, 0);
    const totalCredit = allTx.reduce((s,t) => s + t.credit, 0);

    const infoCards = [
        {
            title: 'بيانات العميل',
            icon: 'fa-user',
            rows: [
                { lbl: 'الاسم', val: c.name },
                { lbl: 'الهاتف', val: c.phone || '-' },
                { lbl: 'العنوان', val: c.address || '-' }
            ]
        },
        {
            title: 'ملخص الحساب',
            icon: 'fa-chart-line',
            rows: [
                { lbl: 'إجمالي المدين', val: `${totalDebit.toLocaleString()} ${sys.currency}` },
                { lbl: 'إجمالي الدائن', val: `${totalCredit.toLocaleString()} ${sys.currency}` },
                { lbl: 'الرصيد الحالي', val: `${Math.abs(c.balance || 0).toLocaleString()} ${sys.currency}` }
            ]
        }
    ];

    const tableHeaders = ['التاريخ', 'البيان', 'مدين', 'دائن', 'الرصيد'];
    const tableRows = txWithBalance.length === 0 
        ? [['-', 'لا توجد حركات', '-', '-', '-']]
        : txWithBalance.map(t => [
            Utils.formatDate(t.date),
            Utils.esc(t.desc),
            t.debit ? `<span style="color:#dc2626;font-weight:700;">${t.debit.toLocaleString()}</span>` : '-',
            t.credit ? `<span style="color:#059669;font-weight:700;">${t.credit.toLocaleString()}</span>` : '-',
            `<span style="font-weight:800;color:${t.balance > 0 ? '#dc2626' : '#059669'};">${Math.abs(t.balance).toLocaleString()}</span>`
        ]);

    const totals = [
        { lbl: 'الرصيد النهائي', val: `${Math.abs(c.balance || 0).toLocaleString()} ${sys.currency}`, type: 'final' }
    ];

    const html = Utils.buildGoldInvoice({
        type: 'statement',
        typeLabel: 'كشف حساب عميل',
        number: c.name,
        date: new Date(),
        infoCards: infoCards,
        tableHeaders: tableHeaders,
        tableRows: tableRows,
        totals: totals,
        signatures: ['توقيع المحاسب', 'توقيع العميل'],
        footerThanks: 'شكراً لتعاملكم معنا',
        devInfo: {
            name: dev.nameEn || '',
            title: dev.titleEn || '',
            phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
            copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
        }
    });
    
    Utils.printHTML(html, 'كشف حساب عميل');
},
    openPayment: function(custId) {
        const c = DB.find('customers', custId);
        if (!c) return;
        
        const content = `
            <div class="space-y-3">
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm">
                    <div class="flex justify-between mb-1"><span>العميل:</span><span class="font-bold">${Utils.esc(c.name)}</span></div>
                    <div class="flex justify-between"><span>الرصيد:</span><span class="font-bold text-red-600">${Utils.formatCurrency(c.balance||0)}</span></div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المبلغ المستلم</label>
                    <input type="number" id="cust-pay-amt" value="${Math.max(0, c.balance||0)}" min="0" step="0.01"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-lg font-bold text-center">
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">طريقة الدفع</label>
                    <select id="cust-pay-method" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        <option value="cash">نقدي</option>
                        <option value="card">بطاقة</option>
                        <option value="transfer">تحويل</option>
                    </select>
                </div>
                <button onclick="Customers.savePayment(${custId})" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ الدفعة
                </button>
            </div>
        `;
        Utils.modal('تسجيل دفعة عميل', content, { size: 'max-w-md' });
    },

    savePayment: function(custId) {
        const amt = parseFloat(document.getElementById('cust-pay-amt').value) || 0;
        const method = document.getElementById('cust-pay-method').value;
        if (amt <= 0) { Utils.toast('error', 'أدخل مبلغ'); return; }
        
        const c = DB.find('customers', custId);
        if (!c) return;

        DB.update('customers', custId, { balance: (c.balance||0) - amt });

        const voucher = {
            number: Utils.generateVoucherNumber('receipt'),
            type: 'receipt',
            date: new Date().toISOString(),
            entityType: 'customer',
            entityId: custId,
            entityName: c.name,
            amount: amt,
            paymentMethod: method,
            notes: `دفعة من العميل ${c.name}`,
            cashboxId: (DB.get('cashbox')||[{}])[0].id || 1,
            user: Utils.currentUser()?.name || 'system'
        };
        DB.add('vouchers', voucher);

        const cashboxes = DB.get('cashbox') || [];
        if (cashboxes.length > 0) {
            cashboxes[0].balance += amt;
            DB.set('cashbox', cashboxes);
        }

        DB.log('customers', `دفعة ${amt} من ${c.name}`);
        Utils.toast('success', 'تم تسجيل الدفعة');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    }
};