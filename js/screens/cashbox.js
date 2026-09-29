/**
 * Cashbox Screen - الصناديق
 */
const Cashbox = {
    render: function() {
        const cashboxes = DB.get('cashbox') || [];
        const vouchers = DB.get('vouchers') || [];
        const invoices = DB.get('invoices') || [];
        const purchases = DB.get('purchases') || [];
        const total = cashboxes.reduce((s,c) => s + c.balance, 0);

        const today = new Date().toDateString();
        const todayVouchers = vouchers.filter(v => new Date(v.date).toDateString() === today);
        const todayInv = invoices.filter(i => new Date(i.date).toDateString() === today);
        const todayPur = purchases.filter(p => new Date(p.date).toDateString() === today);
        
        const todayIn = todayVouchers.filter(v => v.type === 'receipt').reduce((s,v) => s + v.amount, 0) +
                        todayInv.filter(i => i.paymentMethod === 'cash').reduce((s,i) => s + i.total, 0);
        const todayOut = todayVouchers.filter(v => v.type === 'payment').reduce((s,v) => s + v.amount, 0) +
                         todayPur.reduce((s,p) => s + (p.paid||0), 0);

        return `
        <div class="space-y-4">
            <div class="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white rounded-2xl p-6 shadow-lg">
                <p class="text-sm opacity-90 mb-1">إجمالي النقدية في جميع الصناديق</p>
                <p class="text-4xl md:text-5xl font-black">${Utils.formatCurrency(total)}</p>
                <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                    <div>
                        <p class="text-xs opacity-90">مقبوضات اليوم</p>
                        <p class="text-xl font-black text-green-200">+${Utils.formatCurrency(todayIn)}</p>
                    </div>
                    <div>
                        <p class="text-xs opacity-90">مدفوعات اليوم</p>
                        <p class="text-xl font-black text-red-200">-${Utils.formatCurrency(todayOut)}</p>
                    </div>
                </div>
            </div>

            <div class="flex flex-wrap gap-2">
                <button onclick="Cashbox.openTransfer()" class="px-4 py-2 bg-white border border-slate-200 hover:border-amber-500 rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-right-left text-amber-500"></i> تحويل
                </button>
                <button onclick="Cashbox.openDeposit()" class="px-4 py-2 bg-white border border-slate-200 hover:border-amber-500 rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-plus-circle text-green-600"></i> إيداع
                </button>
                <button onclick="Cashbox.openWithdraw()" class="px-4 py-2 bg-white border border-slate-200 hover:border-amber-500 rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-minus-circle text-red-600"></i> سحب
                </button>
                <button onclick="Cashbox.openPrintReport()" class="px-4 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-print"></i> طباعة تقرير
                </button>
                <button onclick="Cashbox.openForm()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> صندوق جديد
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${cashboxes.map(c => {
                    const cInvoices = invoices.filter(i => i.cashboxId === c.id);
                    const cVouchers = vouchers.filter(v => v.cashboxId === c.id);
                    const sales = cInvoices.reduce((s,i) => s + i.total, 0);
                    const receipts = cVouchers.filter(v => v.type === 'receipt').reduce((s,v) => s + v.amount, 0);
                    const payments = cVouchers.filter(v => v.type === 'payment').reduce((s,v) => s + v.amount, 0);
                    
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center">
                                        <i class="fa-solid fa-vault text-lg"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold">${Utils.esc(c.name)}</p>
                                        <p class="text-xs text-slate-500">${c.currency || ''}</p>
                                    </div>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="Cashbox.printCashboxReport(${c.id})" class="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center" title="طباعة">
                                        <i class="fa-solid fa-print text-xs"></i>
                                    </button>
                                    <button onclick="Cashbox.openForm(${c.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center">
                                        <i class="fa-solid fa-edit text-xs"></i>
                                    </button>
                                    ${cashboxes.length > 1 ? `
                                        <button onclick="Cashbox.deleteCashbox(${c.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                            <i class="fa-solid fa-trash text-xs"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="bg-amber-50 rounded-xl p-3 mb-3 border border-amber-200">
                                <p class="text-xs text-amber-700">الرصيد الحالي</p>
                                <p class="text-3xl font-black text-amber-600">${Utils.formatCurrency(c.balance)}</p>
                            </div>
                            <div class="grid grid-cols-3 gap-2 text-xs">
                                <div class="bg-blue-50 rounded-lg p-2 text-center">
                                    <p class="text-blue-700">مبيعات</p>
                                    <p class="font-bold text-blue-700 text-xs">${Utils.formatCurrency(sales).split(' ')[0]}</p>
                                </div>
                                <div class="bg-green-50 rounded-lg p-2 text-center">
                                    <p class="text-green-700">قبض</p>
                                    <p class="font-bold text-green-700 text-xs">${Utils.formatCurrency(receipts).split(' ')[0]}</p>
                                </div>
                                <div class="bg-red-50 rounded-lg p-2 text-center">
                                    <p class="text-red-700">صرف</p>
                                    <p class="font-bold text-red-700 text-xs">${Utils.formatCurrency(payments).split(' ')[0]}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200">
                    <h3 class="font-bold"><i class="fa-solid fa-clock-rotate-left text-slate-400"></i> آخر الحركات</h3>
                </div>
                <div class="max-h-96 overflow-y-auto">
                    ${[...vouchers, ...invoices.map(i=>({...i,type:'invoice'})), ...purchases.map(p=>({...p,type:'purchase'}))]
                        .sort((a,b)=>new Date(b.date)-new Date(a.date))
                        .slice(0,30)
                        .map(m => {
                            let icon, color, label, amount, sign;
                            if (m.type === 'receipt') { icon='fa-arrow-down'; color='green'; label='سند قبض'; amount=m.amount; sign='+'; }
                            else if (m.type === 'payment') { icon='fa-arrow-up'; color='red'; label='سند صرف'; amount=m.amount; sign='-'; }
                            else if (m.type === 'invoice') { icon='fa-file-invoice'; color='blue'; label=`فاتورة ${m.number}`; amount=m.total; sign='+'; }
                            else if (m.type === 'purchase') { icon='fa-truck'; color='amber'; label=`مشتريات ${m.number}`; amount=m.paid||0; sign='-'; }
                            else return '';
                            if (!amount) return '';
                            return `
                                <div class="flex items-center gap-3 p-3 border-b border-slate-100 hover:bg-slate-50">
                                    <div class="w-9 h-9 rounded-lg bg-${color}-100 text-${color}-600 flex items-center justify-center">
                                        <i class="fa-solid ${icon}"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="font-bold text-sm">${Utils.esc(label)}</p>
                                        <p class="text-xs text-slate-500">${Utils.formatDate(m.date, true)}</p>
                                    </div>
                                    <span class="font-black ${sign==='+'?'text-green-600':'text-red-600'}">${sign}${Utils.formatCurrency(amount)}</span>
                                </div>
                            `;
                        }).join('')}
                </div>
            </div>
        </div>
        `;
    },

    afterRender: function() {},

    openForm: function(id = null) {
        const c = id ? DB.find('cashbox', id) : null;
        const isEdit = !!c;

        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">اسم الصندوق *</label>
                    <input type="text" id="cb-name" value="${c?.name||''}" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">العملة</label>
                        <select id="cb-currency" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                            <option value="YER" ${c?.currency==='YER'?'selected':''}>ريال يمني</option>
                            <option value="SAR" ${c?.currency==='SAR'?'selected':''}>ريال سعودي</option>
                            <option value="USD" ${c?.currency==='USD'?'selected':''}>دولار</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الرصيد ${isEdit?'الحالي':'الافتتاحي'}</label>
                        <input type="number" id="cb-balance" value="${c?.balance||0}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                    </div>
                </div>
                <button onclick="Cashbox.save(${id||'null'})" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة الصندوق'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل صندوق' : 'صندوق جديد', content, { size: 'max-w-md' });
    },

    save: function(id) {
        const name = document.getElementById('cb-name').value.trim();
        const currency = document.getElementById('cb-currency').value;
        const balance = parseFloat(document.getElementById('cb-balance').value) || 0;

        if (!name) { Utils.toast('error', 'أدخل اسم الصندوق'); return; }

        if (id) {
            DB.update('cashbox', id, { name, currency, balance });
            Utils.toast('success', 'تم التحديث');
        } else {
            DB.add('cashbox', { name, currency, balance });
            Utils.toast('success', 'تمت الإضافة');
        }
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        Router.navigate('cashbox');
    },

    deleteCashbox: function(id) {
        Utils.confirm('حذف الصندوق؟', () => {
            DB.remove('cashbox', id);
            Utils.toast('success', 'تم الحذف');
            Router.navigate('cashbox');
        });
    },

    openTransfer: function() {
        const cashboxes = DB.get('cashbox') || [];
        if (cashboxes.length < 2) { Utils.toast('error', 'تحتاج صندوقين على الأقل'); return; }

        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">من صندوق</label>
                    <select id="tr-from" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                        ${cashboxes.map(c => `<option value="${c.id}">${c.name} (${Utils.formatCurrency(c.balance)})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">إلى صندوق</label>
                    <select id="tr-to" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                        ${cashboxes.map(c => `<option value="${c.id}">${c.name} (${Utils.formatCurrency(c.balance)})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المبلغ *</label>
                    <input type="number" id="tr-amt" placeholder="0" step="0.01" min="0.01"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-lg font-bold text-center">
                </div>
                <button onclick="Cashbox.saveTransfer()" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> تنفيذ التحويل
                </button>
            </div>
        `;
        Utils.modal('تحويل بين الصناديق', content, { size: 'max-w-md' });
    },

    saveTransfer: function() {
        const fromId = parseInt(document.getElementById('tr-from').value);
        const toId = parseInt(document.getElementById('tr-to').value);
        const amt = parseFloat(document.getElementById('tr-amt').value) || 0;

        if (fromId === toId) { Utils.toast('error', 'اختر صندوقين مختلفين'); return; }
        if (amt <= 0) { Utils.toast('error', 'أدخل مبلغ صحيح'); return; }

        const cashboxes = DB.get('cashbox') || [];
        const fromIdx = cashboxes.findIndex(c => c.id === fromId);
        const toIdx = cashboxes.findIndex(c => c.id === toId);
        
        if (cashboxes[fromIdx].balance < amt) { Utils.toast('error', 'الرصيد غير كافي'); return; }

        cashboxes[fromIdx].balance -= amt;
        cashboxes[toIdx].balance += amt;
        DB.set('cashbox', cashboxes);

        DB.log('cashbox', `تحويل ${amt} من ${cashboxes[fromIdx].name} إلى ${cashboxes[toIdx].name}`);
        Utils.toast('success', 'تم التحويل');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        Router.navigate('cashbox');
    },

    openDeposit: function() {
        const cashboxes = DB.get('cashbox') || [];
        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">الصندوق</label>
                    <select id="dep-cb" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                        ${cashboxes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المبلغ *</label>
                    <input type="number" id="dep-amt" placeholder="0" step="0.01" min="0.01"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-lg font-bold text-center">
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">البيان</label>
                    <input type="text" id="dep-notes" placeholder="سبب الإيداع..." class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                </div>
                <button onclick="Cashbox.saveDeposit()" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-plus"></i> إيداع
                </button>
            </div>
        `;
        Utils.modal('إيداع نقدية', content, { size: 'max-w-md' });
    },

    saveDeposit: function() {
        const cbId = parseInt(document.getElementById('dep-cb').value);
        const amt = parseFloat(document.getElementById('dep-amt').value) || 0;
        const notes = document.getElementById('dep-notes').value.trim();
        if (amt <= 0) return;

        const cashboxes = DB.get('cashbox') || [];
        const idx = cashboxes.findIndex(c => c.id === cbId);
        if (idx === -1) return;
        
        cashboxes[idx].balance += amt;
        DB.set('cashbox', cashboxes);

        DB.add('vouchers', {
            number: Utils.generateVoucherNumber('simple'),
            type: 'simple',
            date: new Date().toISOString(),
            entityName: notes || 'إيداع',
            amount: amt,
            paymentMethod: 'cash',
            cashboxId: cbId,
            notes: notes || 'إيداع نقدية',
            simpleKind: 'income',
            user: Utils.currentUser()?.name || 'system'
        });

        Utils.toast('success', 'تم الإيداع');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        Router.navigate('cashbox');
    },

    openWithdraw: function() {
        const cashboxes = DB.get('cashbox') || [];
        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">الصندوق</label>
                    <select id="wd-cb" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                        ${cashboxes.map(c => `<option value="${c.id}">${c.name} (${Utils.formatCurrency(c.balance)})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المبلغ *</label>
                    <input type="number" id="wd-amt" placeholder="0" step="0.01" min="0.01"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-lg font-bold text-center">
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">البيان</label>
                    <input type="text" id="wd-notes" placeholder="سبب السحب..." class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                </div>
                <button onclick="Cashbox.saveWithdraw()" class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-minus"></i> سحب
                </button>
            </div>
        `;
        Utils.modal('سحب نقدية', content, { size: 'max-w-md' });
    },

    saveWithdraw: function() {
        const cbId = parseInt(document.getElementById('wd-cb').value);
        const amt = parseFloat(document.getElementById('wd-amt').value) || 0;
        const notes = document.getElementById('wd-notes').value.trim();
        if (amt <= 0) return;

        const cashboxes = DB.get('cashbox') || [];
        const idx = cashboxes.findIndex(c => c.id === cbId);
        if (idx === -1) return;
        if (cashboxes[idx].balance < amt) { Utils.toast('error', 'الرصيد غير كافي'); return; }

        cashboxes[idx].balance -= amt;
        DB.set('cashbox', cashboxes);

        DB.add('vouchers', {
            number: Utils.generateVoucherNumber('simple'),
            type: 'simple',
            date: new Date().toISOString(),
            entityName: notes || 'سحب',
            amount: amt,
            paymentMethod: 'cash',
            cashboxId: cbId,
            notes: notes || 'سحب نقدية',
            simpleKind: 'expense',
            user: Utils.currentUser()?.name || 'system'
        });

        Utils.toast('success', 'تم السحب');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        Router.navigate('cashbox');
    },

    openPrintReport: function() {
        const cashboxes = DB.get('cashbox') || [];
        const vouchers = DB.get('vouchers') || [];
        const invoices = DB.get('invoices') || [];
        const sys = DB.get('system') || {};
        const dev = DB.get('developerInfo') || {};
        const total = cashboxes.reduce((s,c) => s + c.balance, 0);

        const infoCards = [
            {
                title: 'ملخص عام',
                icon: 'fa-vault',
                rows: [
                    { lbl: 'عدد الصناديق', val: cashboxes.length },
                    { lbl: 'المستخدم', val: Utils.currentUser()?.name || '-' }
                ]
            },
            {
                title: 'الإجمالي الكلي',
                icon: 'fa-coins',
                rows: [
                    { lbl: 'العملة', val: sys.currency || '' },
                    { lbl: 'إجمالي النقدية', val: `${total.toLocaleString()} ${sys.currency || ''}` }
                ]
            }
        ];

        const tableHeaders = ['الصندوق', 'مبيعات', 'قبض', 'صرف', 'الرصيد'];
        const tableRows = cashboxes.map(c => {
            const sales = invoices.filter(i => i.cashboxId === c.id).reduce((s,i) => s + i.total, 0);
            const receipts = vouchers.filter(v => v.cashboxId === c.id && v.type === 'receipt').reduce((s,v) => s + v.amount, 0);
            const payments = vouchers.filter(v => v.cashboxId === c.id && v.type === 'payment').reduce((s,v) => s + v.amount, 0);
            return [
                Utils.esc(c.name),
                sales.toLocaleString(),
                `<span style="color:#059669;font-weight:700;">${receipts.toLocaleString()}</span>`,
                `<span style="color:#dc2626;font-weight:700;">${payments.toLocaleString()}</span>`,
                `<span style="color:#d97706;font-weight:900;">${c.balance.toLocaleString()}</span>`
            ];
        });

        const totals = [
            { lbl: 'الإجمالي الكلي', val: `${total.toLocaleString()} ${sys.currency || ''}`, type: 'final' }
        ];

        const html = Utils.buildGoldInvoice({
            type: 'cashbox',
            typeLabel: 'تقرير الصناديق',
            number: '',
            date: new Date(),
            infoCards: infoCards,
            tableHeaders: tableHeaders,
            tableRows: tableRows,
            totals: totals,
            signatures: ['توقيع المسؤول', 'توقيع المدقق'],
            footerThanks: 'شكراً لتعاملكم معنا',
            devInfo: {
                name: dev.nameEn || '',
                title: dev.titleEn || '',
                phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
                copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
            }
        });
        Utils.printHTML(html, 'تقرير الصناديق');
    },

    printCashboxReport: function(cashboxId) {
        const c = DB.find('cashbox', cashboxId);
        if (!c) return;
        
        const vouchers = DB.get('vouchers') || [];
        const invoices = DB.get('invoices') || [];
        const purchases = DB.get('purchases') || [];
        const sys = DB.get('system') || {};
        const dev = DB.get('developerInfo') || {};

        const movements = [
            ...invoices.filter(i => i.cashboxId === cashboxId).map(i => ({ date: i.date, label: `فاتورة ${i.number}`, amount: i.total, direction: 'in' })),
            ...vouchers.filter(v => v.cashboxId === cashboxId).map(v => ({
                date: v.date,
                label: `${v.type === 'receipt' ? 'سند قبض' : v.type === 'payment' ? 'سند صرف' : 'سند'} ${v.number}`,
                amount: v.amount,
                direction: (v.type === 'receipt' || (v.type === 'simple' && v.simpleKind === 'income')) ? 'in' : 'out'
            })),
            ...purchases.filter(p => p.cashboxId === cashboxId && (p.paid || 0) > 0).map(p => ({ date: p.date, label: `مشتريات ${p.number}`, amount: p.paid, direction: 'out' }))
        ].sort((a,b) => new Date(a.date) - new Date(b.date));

        const totalIn = movements.filter(m => m.direction === 'in').reduce((s,m) => s + m.amount, 0);
        const totalOut = movements.filter(m => m.direction === 'out').reduce((s,m) => s + m.amount, 0);

        const infoCards = [
            {
                title: 'بيانات الصندوق',
                icon: 'fa-vault',
                rows: [
                    { lbl: 'الاسم', val: c.name },
                    { lbl: 'العملة', val: c.currency || '' },
                    { lbl: 'عدد الحركات', val: movements.length }
                ]
            },
            {
                title: 'ملخص الحركة',
                icon: 'fa-chart-line',
                rows: [
                    { lbl: 'إجمالي الداخل', val: `${totalIn.toLocaleString()} ${sys.currency || ''}` },
                    { lbl: 'إجمالي الخارج', val: `${totalOut.toLocaleString()} ${sys.currency || ''}` },
                    { lbl: 'الرصيد الحالي', val: `${c.balance.toLocaleString()} ${sys.currency || ''}` }
                ]
            }
        ];

        const tableHeaders = ['التاريخ', 'البيان', 'داخل', 'خارج'];
        const tableRows = movements.length === 0
            ? [['-', 'لا توجد حركات', '-', '-']]
            : movements.map(m => [
                Utils.formatDate(m.date),
                Utils.esc(m.label),
                m.direction === 'in' ? `<span style="color:#059669;font-weight:700;">${m.amount.toLocaleString()}</span>` : '-',
                m.direction === 'out' ? `<span style="color:#dc2626;font-weight:700;">${m.amount.toLocaleString()}</span>` : '-'
            ]);

        const totals = [
            { lbl: 'الرصيد النهائي', val: `${c.balance.toLocaleString()} ${sys.currency || ''}`, type: 'final' }
        ];

        const html = Utils.buildGoldInvoice({
            type: 'cashbox',
            typeLabel: 'كشف حساب صندوق',
            number: c.name,
            date: new Date(),
            infoCards: infoCards,
            tableHeaders: tableHeaders,
            tableRows: tableRows,
            totals: totals,
            signatures: ['توقيع المسؤول', 'توقيع المدقق'],
            footerThanks: 'شكراً لتعاملكم معنا',
            devInfo: {
                name: dev.nameEn || '',
                title: dev.titleEn || '',
                phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
                copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
            }
        });
        Utils.printHTML(html, 'كشف صندوق');
    }
};