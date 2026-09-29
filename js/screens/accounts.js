/**
 * Accounts Screen - كشوف الحسابات
 */
const Accounts = {
    activeTab: 'customers', // customers, suppliers, cashboxes

    render: function() {
        return `
        <div class="space-y-4">
            <!-- Tabs -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex gap-1">
                <button onclick="Accounts.setTab('customers')" data-tab="customers" class="acc-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-users"></i> حسابات العملاء
                </button>
                <button onclick="Accounts.setTab('suppliers')" data-tab="suppliers" class="acc-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-handshake"></i> حسابات الموردين
                </button>
                <button onclick="Accounts.setTab('cashboxes')" data-tab="cashboxes" class="acc-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-vault"></i> الصناديق
                </button>
            </div>

            <div id="acc-content"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.updateTabs();
        this.renderContent();
    },

    setTab: function(t) {
        this.activeTab = t;
        this.updateTabs();
        this.renderContent();
    },

    updateTabs: function() {
        document.querySelectorAll('.acc-tab-btn').forEach(b => {
            const isActive = b.dataset.tab === this.activeTab;
            b.className = `acc-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`;
        });
    },

    renderContent: function() {
        if (this.activeTab === 'customers') this.renderCustomers();
        else if (this.activeTab === 'suppliers') this.renderSuppliers();
        else this.renderCashboxes();
    },

    renderCustomers: function() {
        const container = document.getElementById('acc-content');
        const customers = DB.get('customers') || [];
        const invoices = DB.get('invoices') || [];
        
        const totalDebit = customers.reduce((s,c) => s + Math.max(0, c.balance||0), 0);
        const totalCredit = customers.reduce((s,c) => s + Math.min(0, c.balance||0), 0);

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3">
                    <i class="fa-solid fa-users text-xl opacity-80"></i>
                    <p class="text-xl font-black mt-1">${customers.length}</p>
                    <p class="text-xs opacity-90">عدد العملاء</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3">
                    <i class="fa-solid fa-hand-holding-dollar text-xl opacity-80"></i>
                    <p class="text-lg font-black mt-1">${Utils.formatCurrency(totalDebit).split(' ')[0]}</p>
                    <p class="text-xs opacity-90">مدينون لنا</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3">
                    <i class="fa-solid fa-wallet text-xl opacity-80"></i>
                    <p class="text-lg font-black mt-1">${Utils.formatCurrency(Math.abs(totalCredit)).split(' ')[0]}</p>
                    <p class="text-xs opacity-90">دائنون لنا</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الهاتف</th>
                            <th>عدد الفواتير</th>
                            <th>إجمالي المشتريات</th>
                            <th>الرصيد</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(c => {
                            const cInv = invoices.filter(i => i.customerId === c.id);
                            const cTotal = cInv.reduce((s,i) => s + i.total, 0);
                            return `
                                <tr>
                                    <td class="font-bold">${Utils.esc(c.name)}</td>
                                    <td class="font-en" dir="ltr">${c.phone||'-'}</td>
                                    <td>${cInv.length}</td>
                                    <td>${Utils.formatCurrency(cTotal)}</td>
                                    <td class="font-black ${c.balance>0?'text-red-600':c.balance<0?'text-green-600':'text-slate-400'}">
                                        ${Utils.formatCurrency(Math.abs(c.balance||0))}
                                    </td>
                                    <td>
                                        <button onclick="Customers.viewStatement(${c.id})" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                                            <i class="fa-solid fa-file-invoice"></i> كشف
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderSuppliers: function() {
        const container = document.getElementById('acc-content');
        const suppliers = DB.get('suppliers') || [];
        const purchases = DB.get('purchases') || [];
        
        const totalOwed = suppliers.reduce((s,x) => s + Math.max(0, x.balance||0), 0);

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3">
                    <i class="fa-solid fa-handshake text-xl opacity-80"></i>
                    <p class="text-xl font-black mt-1">${suppliers.length}</p>
                    <p class="text-xs opacity-90">عدد الموردين</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3">
                    <i class="fa-solid fa-hand-holding-dollar text-xl opacity-80"></i>
                    <p class="text-lg font-black mt-1">${Utils.formatCurrency(totalOwed).split(' ')[0]}</p>
                    <p class="text-xs opacity-90">مستحق للموردين</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3">
                    <i class="fa-solid fa-truck text-xl opacity-80"></i>
                    <p class="text-xl font-black mt-1">${purchases.length}</p>
                    <p class="text-xs opacity-90">فواتير مشتريات</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>المورد</th>
                            <th>الهاتف</th>
                            <th>التصنيف</th>
                            <th>عدد الفواتير</th>
                            <th>إجمالي المشتريات</th>
                            <th>الرصيد</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.map(s => {
                            const sPur = purchases.filter(p => p.supplierId === s.id);
                            const sTotal = sPur.reduce((sum,p) => sum + p.total, 0);
                            return `
                                <tr>
                                    <td class="font-bold">${Utils.esc(s.name)}</td>
                                    <td class="font-en" dir="ltr">${s.phone||'-'}</td>
                                    <td><span class="badge badge-gray">${Utils.esc(s.category||'-')}</span></td>
                                    <td>${sPur.length}</td>
                                    <td>${Utils.formatCurrency(sTotal)}</td>
                                    <td class="font-black ${s.balance>0?'text-red-600':'text-green-600'}">
                                        ${Utils.formatCurrency(Math.abs(s.balance||0))}
                                    </td>
                                    <td>
                                        <button onclick="Suppliers.viewStatement(${s.id})" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                                            <i class="fa-solid fa-file-invoice"></i> كشف
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderCashboxes: function() {
        const container = document.getElementById('acc-content');
        const cashboxes = DB.get('cashbox') || [];
        const vouchers = DB.get('vouchers') || [];
        const total = cashboxes.reduce((s,c) => s + c.balance, 0);

        container.innerHTML = `
            <div class="bg-gradient-to-br from-primary to-blue-800 text-white rounded-2xl p-6 mb-4">
                <p class="text-sm opacity-90">إجمالي أرصدة الصناديق</p>
                <p class="text-4xl font-black mt-2">${Utils.formatCurrency(total)}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${cashboxes.map(c => {
                    const cVouchers = vouchers.filter(v => v.cashboxId === c.id);
                    const receipts = cVouchers.filter(v => v.type === 'receipt').reduce((s,v) => s + v.amount, 0);
                    const payments = cVouchers.filter(v => v.type === 'payment').reduce((s,v) => s + v.amount, 0);
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center">
                                    <i class="fa-solid fa-vault text-lg"></i>
                                </div>
                                <div>
                                    <p class="font-bold">${Utils.esc(c.name)}</p>
                                    <p class="text-xs text-slate-500">${c.currency}</p>
                                </div>
                            </div>
                            <p class="text-3xl font-black text-primary mb-3">${Utils.formatCurrency(c.balance)}</p>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="bg-green-50 rounded-lg p-2">
                                    <p class="text-green-700">مقبوضات</p>
                                    <p class="font-bold text-green-700">${Utils.formatCurrency(receipts)}</p>
                                </div>
                                <div class="bg-red-50 rounded-lg p-2">
                                    <p class="text-red-700">مدفوعات</p>
                                    <p class="font-bold text-red-700">${Utils.formatCurrency(payments)}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
};