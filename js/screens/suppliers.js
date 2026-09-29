/**
 * Suppliers Screen - الموردين
 */
const Suppliers = {
    searchQuery: '',

    render: function() {
        const suppliers = DB.get('suppliers') || [];
        const totalDebt = suppliers.reduce((s,x) => s + Math.max(0, x.balance||0), 0);

        return `
        <div class="space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-handshake text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${suppliers.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي الموردين</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-hand-holding-dollar text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(totalDebt).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">مستحقات للموردين</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-truck text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${(DB.get('purchases')||[]).length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">فواتير المشتريات</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-wallet text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency((DB.get('purchases')||[]).reduce((s,p)=>s+(p.paid||0),0)).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي المدفوع</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="supp-search" placeholder="ابحث بالاسم أو الهاتف..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <button onclick="Suppliers.openForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> مورد جديد
                </button>
            </div>

            <div id="supp-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderList();
        const search = document.getElementById('supp-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderList();
            }, 150);
        }
    },

    renderList: function() {
        const container = document.getElementById('supp-container');
        if (!container) return;

        let suppliers = DB.get('suppliers') || [];
        if (this.searchQuery) {
            suppliers = suppliers.filter(s => 
                s.name.toLowerCase().includes(this.searchQuery) ||
                (s.phone||'').includes(this.searchQuery)
            );
        }

        if (suppliers.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-handshake text-5xl mb-3"></i>
                <p>لا يوجد موردين</p>
            </div>`;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${suppliers.map(s => {
                    const balance = s.balance || 0;
                    const purchases = (DB.get('purchases')||[]).filter(p => p.supplierId === s.id);
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center">
                                        <i class="fa-solid fa-truck"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold">${Utils.esc(s.name)}</p>
                                        <p class="text-xs text-slate-500 font-en" dir="ltr">${s.phone || '—'}</p>
                                    </div>
                                </div>
                            </div>
                            ${s.category ? `<p class="text-xs text-slate-500 mb-3"><i class="fa-solid fa-tag"></i> ${Utils.esc(s.category)}</p>` : ''}
                            
                            <div class="grid grid-cols-2 gap-2 mb-3">
                                <div class="bg-slate-50 rounded-xl p-2 text-center">
                                    <p class="text-xs text-slate-500">المستحق له</p>
                                    <p class="font-black ${balance>0?'text-red-600':'text-green-600'}">
                                        ${Utils.formatCurrency(Math.abs(balance))}
                                    </p>
                                    <p class="text-[10px] text-slate-400">${balance>0?'نحن مدينون':'مسدد'}</p>
                                </div>
                                <div class="bg-slate-50 rounded-xl p-2 text-center">
                                    <p class="text-xs text-slate-500">الفواتير</p>
                                    <p class="font-black text-slate-800">${purchases.length}</p>
                                </div>
                            </div>

                            <div class="flex gap-1">
                                <button onclick="Suppliers.viewStatement(${s.id})" class="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                                    <i class="fa-solid fa-file-invoice"></i> كشف
                                </button>
                                <button onclick="Suppliers.openPayment(${s.id})" class="flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold">
                                    <i class="fa-solid fa-money-bill"></i> دفعة
                                </button>
                                <button onclick="Suppliers.openForm(${s.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center">
                                    <i class="fa-solid fa-edit text-xs"></i>
                                </button>
                                <button onclick="Suppliers.deleteSupplier(${s.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    openForm: function(suppId = null) {
        const s = suppId ? DB.find('suppliers', suppId) : null;
        const isEdit = !!s;
        
        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">اسم المورد *</label>
                    <input type="text" id="supp-name" value="${s?.name || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">رقم الهاتف</label>
                        <input type="tel" id="supp-phone" value="${s?.phone || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en" dir="ltr">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">نوع التوريد</label>
                        <input type="text" id="supp-category" value="${s?.category || ''}" placeholder="لحوم، خضار..."
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">العنوان</label>
                    <input type="text" id="supp-address" value="${s?.address || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                ${isEdit ? `
                    <div>
                        <label class="block text-sm font-bold mb-1">الرصيد</label>
                        <input type="number" id="supp-balance" value="${s?.balance || 0}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                ` : ''}
                <div>
                    <label class="block text-sm font-bold mb-1">ملاحظات</label>
                    <textarea id="supp-notes" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">${s?.notes || ''}</textarea>
                </div>
                <button onclick="Suppliers.save(${suppId||'null'})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة المورد'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل مورد' : 'مورد جديد', content, { size: 'max-w-lg' });
    },

    save: function(suppId) {
        const name = document.getElementById('supp-name').value.trim();
        const phone = document.getElementById('supp-phone').value.trim();
        const category = document.getElementById('supp-category').value.trim();
        const address = document.getElementById('supp-address').value.trim();
        const notes = document.getElementById('supp-notes').value.trim();

        if (!name) { Utils.toast('error', 'أدخل اسم المورد'); return; }

        const data = { name, phone, category, address, notes };

        if (suppId) {
            const balanceInput = document.getElementById('supp-balance');
            if (balanceInput) data.balance = parseFloat(balanceInput.value) || 0;
            DB.update('suppliers', suppId, data);
            DB.log('suppliers', `تعديل مورد ${name}`);
            Utils.toast('success', 'تم التحديث');
        } else {
            data.balance = 0;
            DB.add('suppliers', data);
            DB.log('suppliers', `إضافة مورد ${name}`);
            Utils.toast('success', 'تمت الإضافة');
        }
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    deleteSupplier: function(id) {
        const purchases = (DB.get('purchases')||[]).filter(p => p.supplierId === id);
        if (purchases.length > 0) {
            Utils.toast('error', 'لا يمكن الحذف - يوجد فواتير مرتبطة');
            return;
        }
        Utils.confirm('حذف المورد؟', () => {
            DB.remove('suppliers', id);
            Utils.toast('success', 'تم الحذف');
            this.renderList();
        });
    },

    viewStatement: function(suppId) {
        const s = DB.find('suppliers', suppId);
        if (!s) return;
        
        const purchases = (DB.get('purchases')||[]).filter(p => p.supplierId === suppId).sort((a,b)=>new Date(b.date)-new Date(a.date));
        const payments = (DB.get('vouchers')||[]).filter(v => v.type === 'payment' && v.entityId === suppId && v.entityType === 'supplier');
        
        const allTx = [
            ...purchases.map(p => ({ date: p.date, desc: `فاتورة ${p.number}`, debit: 0, credit: p.total })),
            ...payments.map(p => ({ date: p.date, desc: `سند صرف ${p.number}`, debit: p.amount, credit: 0 }))
        ].sort((a,b) => new Date(b.date) - new Date(a.date));

        const content = `
            <div class="space-y-3">
                <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-4">
                    <h3 class="font-black text-lg">${Utils.esc(s.name)}</h3>
                    <p class="text-sm opacity-90 font-en" dir="ltr">${s.phone || ''}</p>
                    <div class="mt-3 pt-3 border-t border-white/20 flex justify-between">
                        <span>الرصيد:</span>
                        <span class="font-black text-lg">${Utils.formatCurrency(Math.abs(s.balance||0))}</span>
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
                                    <td class="text-green-600">${t.debit ? t.debit.toLocaleString() : '-'}</td>
                                    <td class="text-red-600">${t.credit ? t.credit.toLocaleString() : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <button onclick="Suppliers.printStatement(${suppId})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-print"></i> طباعة الكشف
                </button>
            </div>
        `;
        Utils.modal('كشف حساب المورد', content, { size: 'max-w-2xl' });
    },

    printStatement: function(suppId) {
    const s = DB.find('suppliers', suppId);
    if (!s) return;
    
    const sys = DB.get('system') || {};
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    const dev = DB.get('developerInfo') || {};
    
    // ✅ هنا: purchases (لأنه مورد) و payment (صرف)
    const purchases = (DB.get('purchases')||[]).filter(p => p.supplierId === suppId);
    const payments = (DB.get('vouchers')||[]).filter(v => 
        v.type === 'payment' && 
        v.entityId === suppId && 
        v.entityType === 'supplier'
    );
    
    // جمع كل الحركات
    const allTx = [
        ...purchases.map(p => ({ 
            date: p.date, 
            desc: `فاتورة مشتريات ${p.number}`, 
            debit: 0, 
            credit: p.total 
        })),
        ...payments.map(p => ({ 
            date: p.date, 
            desc: `سند صرف ${p.number}`, 
            debit: p.amount, 
            credit: 0 
        }))
    ].sort((a,b) => new Date(a.date) - new Date(b.date));

    // الرصيد التراكمي (معكوس لأن المورد له رصيد سالب)
    let running = 0;
    const txWithBalance = allTx.map(t => {
        running += (t.credit - t.debit);
        return { ...t, balance: running };
    });

    const totalCredit = allTx.reduce((sum, t) => sum + t.credit, 0);
    const totalDebit = allTx.reduce((sum, t) => sum + t.debit, 0);

    // ✅ بطاقات المعلومات
    const infoCards = [
        {
            title: 'بيانات المورد',
            icon: 'fa-truck',
            rows: [
                { lbl: 'الاسم', val: s.name },
                { lbl: 'الهاتف', val: s.phone || '-' },
                { lbl: 'التصنيف', val: s.category || '-' }
            ]
        },
        {
            title: 'ملخص الحساب',
            icon: 'fa-chart-line',
            rows: [
                { lbl: 'إجمالي المشتريات', val: `${totalCredit.toLocaleString()} ${sys.currency || ''}` },
                { lbl: 'إجمالي المدفوعات', val: `${totalDebit.toLocaleString()} ${sys.currency || ''}` },
                { lbl: 'الرصيد الحالي', val: `${Math.abs(s.balance || 0).toLocaleString()} ${sys.currency || ''}` }
            ]
        }
    ];

    // ✅ جدول الحركات
    const tableHeaders = ['التاريخ', 'البيان', 'مدين (دفعنا)', 'دائن (علينا)', 'الرصيد'];
    
    const tableRows = txWithBalance.length === 0 
        ? [['-', 'لا توجد حركات', '-', '-', '-']]
        : txWithBalance.map(t => [
            Utils.formatDate(t.date),
            Utils.esc(t.desc),
            t.debit ? `<span style="color:#059669;font-weight:700;">${t.debit.toLocaleString()}</span>` : '-',
            t.credit ? `<span style="color:#dc2626;font-weight:700;">${t.credit.toLocaleString()}</span>` : '-',
            `<span style="font-weight:800;color:${t.balance > 0 ? '#dc2626' : '#059669'};">${Math.abs(t.balance).toLocaleString()}</span>`
        ]);

    // ✅ صندوق الإجمالي
    const totals = [
        { 
            lbl: 'الرصيد النهائي', 
            val: `${Math.abs(s.balance || 0).toLocaleString()} ${sys.currency || ''}`, 
            type: 'final' 
        }
    ];

    // ✅ استدعاء الدالة الموحدة
    const html = Utils.buildGoldInvoice({
        type: 'statement',
        typeLabel: 'كشف حساب مورد',
        number: s.name,
        date: new Date(),
        infoCards: infoCards,
        tableHeaders: tableHeaders,
        tableRows: tableRows,
        totals: totals,
        signatures: ['توقيع المحاسب', 'توقيع المورد'],
        footerThanks: 'شكراً لتعاملكم معنا',
        footerSubtext: 'نتشرف بخدمتكم دائماً',
        devInfo: {
            name: dev.nameEn || '',
            title: dev.titleEn || '',
            phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
            copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
        }
    });
    
    Utils.printHTML(html, 'كشف حساب مورد');
},

    openPayment: function(suppId) {
        const s = DB.find('suppliers', suppId);
        if (!s) return;
        const cashboxes = DB.get('cashbox') || [];
        
        const content = `
            <div class="space-y-3">
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm">
                    <div class="flex justify-between mb-1"><span>المورد:</span><span class="font-bold">${Utils.esc(s.name)}</span></div>
                    <div class="flex justify-between"><span>الرصيد:</span><span class="font-bold text-red-600">${Utils.formatCurrency(s.balance||0)}</span></div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المبلغ المدفوع</label>
                    <input type="number" id="supp-pay-amt" value="${Math.max(0, s.balance||0)}" min="0" step="0.01"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-lg font-bold text-center">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">طريقة الدفع</label>
                        <select id="supp-pay-method" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="cash">نقدي</option>
                            <option value="bank">تحويل بنكي</option>
                            <option value="check">شيك</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الصندوق</label>
                        <select id="supp-pay-cashbox" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            ${cashboxes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <button onclick="Suppliers.savePayment(${suppId})" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ الدفعة
                </button>
            </div>
        `;
        Utils.modal('تسجيل دفعة للمورد', content, { size: 'max-w-md' });
    },

    savePayment: function(suppId) {
        const amt = parseFloat(document.getElementById('supp-pay-amt').value) || 0;
        const method = document.getElementById('supp-pay-method').value;
        const cashboxId = parseInt(document.getElementById('supp-pay-cashbox').value) || 1;
        if (amt <= 0) { Utils.toast('error', 'أدخل مبلغ'); return; }
        
        const s = DB.find('suppliers', suppId);
        if (!s) return;

        DB.update('suppliers', suppId, { balance: Math.max(0, (s.balance||0) - amt) });

        const voucher = {
            number: Utils.generateVoucherNumber('payment'),
            type: 'payment',
            date: new Date().toISOString(),
            entityType: 'supplier',
            entityId: suppId,
            entityName: s.name,
            amount: amt,
            paymentMethod: method,
            cashboxId,
            notes: `دفعة للمورد ${s.name}`,
            user: Utils.currentUser()?.name || 'system'
        };
        DB.add('vouchers', voucher);

        const cashboxes = DB.get('cashbox') || [];
        const idx = cashboxes.findIndex(c => c.id === cashboxId);
        if (idx !== -1) {
            cashboxes[idx].balance -= amt;
            DB.set('cashbox', cashboxes);
        }

        DB.log('suppliers', `دفعة ${amt} للمورد ${s.name}`);
        Utils.toast('success', 'تم تسجيل الدفعة');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    }
};