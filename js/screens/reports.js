/**
 * Reports Screen - التقارير
 */
const Reports = {
    activeReport: 'sales',
    dateFrom: new Date(Date.now() - 30*86400000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],

    render: function() {
        return `
        <div class="space-y-4">
            
            <!-- Report Tabs -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-wrap gap-1">
                ${[
                    {id:'sales', label:'المبيعات', icon:'fa-chart-line'},
                    {id:'profit', label:'الأرباح', icon:'fa-coins'},
                    {id:'items', label:'الأصناف', icon:'fa-utensils'},
                    {id:'employees', label:'الموظفين', icon:'fa-user-tie'},
                    {id:'inventory', label:'المخزون', icon:'fa-boxes-stacked'}
                ].map(r => `
                    <button onclick="Reports.setReport('${r.id}')" data-rpt="${r.id}"
                            class="rpt-btn flex-1 py-2.5 px-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1">
                        <i class="fa-solid ${r.icon}"></i> ${r.label}
                    </button>
                `).join('')}
            </div>

            <!-- Date Filter -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-wrap gap-2 items-center">
                <div class="flex items-center gap-2">
                    <label class="text-sm font-bold">من:</label>
                    <input type="date" id="rpt-from" value="${this.dateFrom}" onchange="Reports.updateDates(this.value, null)"
                           class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-sm font-bold">إلى:</label>
                    <input type="date" id="rpt-to" value="${this.dateTo}" onchange="Reports.updateDates(null, this.value)"
                           class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                </div>
                <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    <button onclick="Reports.quickDate('today')" class="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white">اليوم</button>
                    <button onclick="Reports.quickDate('week')" class="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white">أسبوع</button>
                    <button onclick="Reports.quickDate('month')" class="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white">شهر</button>
                    <button onclick="Reports.quickDate('year')" class="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white">سنة</button>
                </div>
                <div class="flex-1"></div>
                <button onclick="Reports.printReport()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-print"></i> طباعة
                </button>
                <button onclick="Reports.exportReport()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-file-csv"></i> تصدير
                </button>
            </div>

            <!-- Report Content -->
            <div id="rpt-content" class="space-y-4"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.updateTabs();
        this.renderReport();
    },

    setReport: function(r) {
        this.activeReport = r;
        this.updateTabs();
        this.renderReport();
    },

    updateTabs: function() {
        document.querySelectorAll('.rpt-btn').forEach(b => {
            const isActive = b.dataset.rpt === this.activeReport;
            b.className = `rpt-btn flex-1 py-2.5 px-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-1 ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`;
        });
    },

    updateDates: function(from, to) {
        if (from) this.dateFrom = from;
        if (to) this.dateTo = to;
        this.renderReport();
    },

    quickDate: function(range) {
        const now = new Date();
        let from = new Date();
        switch(range) {
            case 'today': from = new Date(); break;
            case 'week': from.setDate(now.getDate()-7); break;
            case 'month': from.setMonth(now.getMonth()-1); break;
            case 'year': from.setFullYear(now.getFullYear()-1); break;
        }
        this.dateFrom = from.toISOString().split('T')[0];
        this.dateTo = now.toISOString().split('T')[0];
        const fromEl = document.getElementById('rpt-from');
        const toEl = document.getElementById('rpt-to');
        if (fromEl) fromEl.value = this.dateFrom;
        if (toEl) toEl.value = this.dateTo;
        this.renderReport();
    },

    filterByDate: function(items, dateField = 'date') {
        const from = new Date(this.dateFrom);
        from.setHours(0,0,0,0);
        const to = new Date(this.dateTo);
        to.setHours(23,59,59,999);
        return items.filter(item => {
            const d = new Date(item[dateField]);
            return d >= from && d <= to;
        });
    },

    renderReport: function() {
        const container = document.getElementById('rpt-content');
        if (!container) return;
        
        try {
            switch(this.activeReport) {
                case 'sales': this.renderSales(container); break;
                case 'profit': this.renderProfit(container); break;
                case 'items': this.renderItems(container); break;
                case 'employees': this.renderEmployees(container); break;
                case 'inventory': this.renderInventory(container); break;
            }
        } catch (e) {
            console.error('Render report error:', e);
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-red-500">
                <i class="fa-solid fa-triangle-exclamation text-4xl mb-3"></i>
                <p>حدث خطأ في التقرير</p>
                <p class="text-sm text-slate-500 mt-2">${e.message}</p>
            </div>`;
        }
    },

    // ============================================
    // تقرير المبيعات - عرض الشاشة
    // ============================================
    renderSales: function(container) {
        const sys = DB.get('system') || {};
        const invoices = this.filterByDate(DB.get('invoices') || []).filter(i => i.status !== 'cancelled' && i.status !== 'returned');
        const purchases = this.filterByDate(DB.get('purchases') || []);
        
        const totalSales = invoices.reduce((s,i) => s + i.total, 0);
        const totalPurchases = purchases.reduce((s,p) => s + p.total, 0);
        const totalVAT = invoices.reduce((s,i) => s + (i.tax||0), 0);
        const totalDiscount = invoices.reduce((s,i) => s + (i.discount||0), 0);
        const cashIn = invoices.filter(i => i.paymentMethod === 'cash').reduce((s,i) => s + i.total, 0);
        const cardIn = invoices.filter(i => i.paymentMethod === 'card').reduce((s,i) => s + i.total, 0);
        const creditIn = invoices.filter(i => i.paymentMethod === 'credit').reduce((s,i) => s + i.total, 0);
        const avgTicket = invoices.length ? totalSales / invoices.length : 0;

        const daily = {};
        invoices.forEach(inv => {
            const d = new Date(inv.date).toISOString().split('T')[0];
            if (!daily[d]) daily[d] = { count: 0, total: 0, tax: 0, discount: 0 };
            daily[d].count++;
            daily[d].total += inv.total;
            daily[d].tax += inv.tax || 0;
            daily[d].discount += inv.discount || 0;
        });
        const dailyArr = Object.entries(daily).sort((a,b) => b[0].localeCompare(a[0]));

        container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-chart-line text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalSales).split(' ')[0]}</p>
                    <p class="text-xs font-bold opacity-90">إجمالي المبيعات</p>
                </div>
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-file-invoice text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${invoices.length}</p>
                    <p class="text-xs font-bold opacity-90">عدد الفواتير</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-receipt text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(avgTicket).split(' ')[0]}</p>
                    <p class="text-xs font-bold opacity-90">متوسط الفاتورة</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-truck text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalPurchases).split(' ')[0]}</p>
                    <p class="text-xs font-bold opacity-90">إجمالي المشتريات</p>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-white rounded-2xl p-3 border border-slate-200">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fa-solid fa-money-bill-wave text-green-600"></i>
                        <span class="text-xs text-slate-500">نقدي</span>
                    </div>
                    <p class="text-lg font-black text-slate-800">${Utils.formatCurrency(cashIn)}</p>
                </div>
                <div class="bg-white rounded-2xl p-3 border border-slate-200">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fa-solid fa-credit-card text-blue-600"></i>
                        <span class="text-xs text-slate-500">بطاقة</span>
                    </div>
                    <p class="text-lg font-black text-slate-800">${Utils.formatCurrency(cardIn)}</p>
                </div>
                <div class="bg-white rounded-2xl p-3 border border-slate-200">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fa-solid fa-hand-holding-dollar text-amber-600"></i>
                        <span class="text-xs text-slate-500">آجل</span>
                    </div>
                    <p class="text-lg font-black text-slate-800">${Utils.formatCurrency(creditIn)}</p>
                </div>
                <div class="bg-white rounded-2xl p-3 border border-slate-200">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fa-solid fa-percent text-purple-600"></i>
                        <span class="text-xs text-slate-500">إجمالي الخصومات</span>
                    </div>
                    <p class="text-lg font-black text-slate-800">${Utils.formatCurrency(totalDiscount)}</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 class="font-bold"><i class="fa-solid fa-calendar-days text-slate-400"></i> التفصيل اليومي</h3>
                    <span class="text-xs text-slate-500">${dailyArr.length} يوم</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>عدد الفواتير</th>
                                <th>إجمالي المبيعات</th>
                                <th>الضريبة</th>
                                <th>الخصومات</th>
                                <th>الصافي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dailyArr.length === 0 ? '<tr><td colspan="6" class="text-center text-slate-400 py-8">لا توجد بيانات</td></tr>' :
                              dailyArr.map(([date, data]) => `
                                <tr>
                                    <td class="font-bold">${Utils.formatDate(date)}</td>
                                    <td>${data.count}</td>
                                    <td>${Utils.formatCurrency(data.total)}</td>
                                    <td class="text-slate-500">${Utils.formatCurrency(data.tax)}</td>
                                    <td class="text-red-600">${Utils.formatCurrency(data.discount)}</td>
                                    <td class="font-black text-primary">${Utils.formatCurrency(data.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="bg-slate-100 font-black">
                                <td>الإجمالي</td>
                                <td>${invoices.length}</td>
                                <td>${Utils.formatCurrency(totalSales)}</td>
                                <td>${Utils.formatCurrency(totalVAT)}</td>
                                <td>${Utils.formatCurrency(totalDiscount)}</td>
                                <td>${Utils.formatCurrency(totalSales)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
    },

    // ============================================
    // تقرير الأرباح - عرض الشاشة
    // ============================================
    renderProfit: function(container) {
        const invoices = this.filterByDate(DB.get('invoices') || []).filter(i => i.status !== 'cancelled' && i.status !== 'returned');
        
        let totalRevenue = 0, totalCost = 0, totalProfit = 0;
        const itemProfit = {};

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                const cost = item.cost || 0;
                const revenue = item.total;
                const profit = revenue - (cost * item.quantity);
                
                totalRevenue += revenue;
                totalCost += cost * item.quantity;
                totalProfit += profit;

                if (!itemProfit[item.name]) {
                    itemProfit[item.name] = { name: item.name, qty: 0, revenue: 0, cost: 0, profit: 0 };
                }
                itemProfit[item.name].qty += item.quantity;
                itemProfit[item.name].revenue += revenue;
                itemProfit[item.name].cost += cost * item.quantity;
                itemProfit[item.name].profit += profit;
            });
        });

        const profitArr = Object.values(itemProfit).sort((a,b) => b.profit - a.profit);
        const margin = totalRevenue ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;

        container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-money-bill-wave text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalRevenue).split(' ')[0]}</p>
                    <p class="text-xs font-bold opacity-90">الإيرادات</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-shopping-cart text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalCost).split(' ')[0]}</p>
                    <p class="text-xs font-bold opacity-90">التكلفة</p>
                </div>
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-coins text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalProfit).split(' ')[0]}</p>
                    <p class="text-xs font-bold opacity-90">صافي الربح</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4 shadow-md">
                    <i class="fa-solid fa-percent text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${margin}%</p>
                    <p class="text-xs font-bold opacity-90">هامش الربح</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200">
                    <h3 class="font-bold"><i class="fa-solid fa-chart-bar text-slate-400"></i> ربحية الأصناف</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>الصنف</th>
                                <th>الكمية المباعة</th>
                                <th>الإيرادات</th>
                                <th>التكلفة</th>
                                <th>الربح</th>
                                <th>الهامش</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${profitArr.length === 0 ? '<tr><td colspan="6" class="text-center text-slate-400 py-8">لا توجد بيانات</td></tr>' :
                              profitArr.map(p => {
                                  const m = p.revenue ? (p.profit/p.revenue*100).toFixed(1) : 0;
                                  return `
                                    <tr>
                                        <td class="font-bold">${Utils.esc(p.name)}</td>
                                        <td>${p.qty}</td>
                                        <td>${Utils.formatCurrency(p.revenue)}</td>
                                        <td class="text-red-600">${Utils.formatCurrency(p.cost)}</td>
                                        <td class="font-black text-green-600">${Utils.formatCurrency(p.profit)}</td>
                                        <td>
                                            <span class="badge ${m>=30?'badge-success':m>=15?'badge-warning':'badge-danger'}">${m}%</span>
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

    // ============================================
    // تقرير الأصناف - عرض الشاشة
    // ============================================
    renderItems: function(container) {
        const invoices = this.filterByDate(DB.get('invoices') || []).filter(i => i.status !== 'cancelled' && i.status !== 'returned');
        const itemStats = {};

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!itemStats[item.name]) itemStats[item.name] = { name: item.name, qty: 0, total: 0, count: 0 };
                itemStats[item.name].qty += item.quantity;
                itemStats[item.name].total += item.total;
                itemStats[item.name].count++;
            });
        });

        const arr = Object.values(itemStats).sort((a,b) => b.qty - a.qty);
        const totalQty = arr.reduce((s,i) => s + i.qty, 0);
        const totalSales = arr.reduce((s,i) => s + i.total, 0);

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-utensils text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${arr.length}</p>
                    <p class="text-xs opacity-90">أصناف مباعة</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-shopping-bag text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${totalQty}</p>
                    <p class="text-xs opacity-90">إجمالي الوحدات</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-coins text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalSales).split(' ')[0]}</p>
                    <p class="text-xs opacity-90">إجمالي المبيعات</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200">
                    <h3 class="font-bold"><i class="fa-solid fa-ranking-star text-slate-400"></i> الأصناف الأكثر مبيعاً</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>الصنف</th>
                                <th>عدد مرات البيع</th>
                                <th>الكمية</th>
                                <th>الإجمالي</th>
                                <th>النسبة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.map((item, i) => `
                                <tr>
                                    <td>
                                        <span class="w-6 h-6 rounded-full ${i<3?'bg-amber-100 text-amber-600':'bg-slate-100 text-slate-600'} inline-flex items-center justify-center text-xs font-black">
                                            ${i+1}
                                        </span>
                                    </td>
                                    <td class="font-bold">${Utils.esc(item.name)}</td>
                                    <td>${item.count}</td>
                                    <td class="font-bold">${item.qty}</td>
                                    <td>${Utils.formatCurrency(item.total)}</td>
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                                                <div class="h-full bg-primary rounded-full" style="width:${totalQty?(item.qty/totalQty*100):0}%"></div>
                                            </div>
                                            <span class="text-xs font-bold">${totalQty?(item.qty/totalQty*100).toFixed(1):0}%</span>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ============================================
    // تقرير الموظفين - عرض الشاشة
    // ============================================
    renderEmployees: function(container) {
        const employees = DB.get('employees') || [];
        const invoices = this.filterByDate(DB.get('invoices') || []);
        
        const empStats = {};
        invoices.forEach(inv => {
            const u = inv.user || 'غير معروف';
            if (!empStats[u]) empStats[u] = { name: u, count: 0, total: 0 };
            empStats[u].count++;
            empStats[u].total += inv.total;
        });
        const arr = Object.values(empStats).sort((a,b) => b.total - a.total);

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-user-tie text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${employees.length}</p>
                    <p class="text-xs opacity-90">عدد الموظفين</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-cash-register text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${arr.length}</p>
                    <p class="text-xs opacity-90">كاشيريين نشطين</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-coins text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(invoices.reduce((s,i)=>s+i.total,0)).split(' ')[0]}</p>
                    <p class="text-xs opacity-90">إجمالي المبيعات</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200">
                    <h3 class="font-bold"><i class="fa-solid fa-ranking-star text-slate-400"></i> أداء الكاشيريين</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>المستخدم</th>
                                <th>عدد الفواتير</th>
                                <th>إجمالي المبيعات</th>
                                <th>متوسط الفاتورة</th>
                                <th>النسبة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${arr.length === 0 ? '<tr><td colspan="6" class="text-center text-slate-400 py-8">لا توجد بيانات</td></tr>' :
                              arr.map((e, i) => {
                                  const totalSales = invoices.reduce((s,x)=>s+x.total,0);
                                  const avg = e.count ? e.total/e.count : 0;
                                  return `
                                    <tr>
                                        <td>
                                            <span class="w-6 h-6 rounded-full ${i<3?'bg-amber-100 text-amber-600':'bg-slate-100 text-slate-600'} inline-flex items-center justify-center text-xs font-black">
                                                ${i+1}
                                            </span>
                                        </td>
                                        <td class="font-bold">${Utils.esc(e.name)}</td>
                                        <td>${e.count}</td>
                                        <td>${Utils.formatCurrency(e.total)}</td>
                                        <td>${Utils.formatCurrency(avg)}</td>
                                        <td>
                                            <span class="badge badge-info">${totalSales?(e.total/totalSales*100).toFixed(1):0}%</span>
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

    // ============================================
    // تقرير المخزون - عرض الشاشة
    // ============================================
    renderInventory: function(container) {
        const inventory = DB.get('inventory') || [];
        const purchases = this.filterByDate(DB.get('purchases') || []);
        
        const totalValue = inventory.reduce((s,i) => s + (i.quantity * i.cost), 0);
        const lowItems = inventory.filter(i => i.quantity <= i.minQuantity);
        const totalPurchases = purchases.reduce((s,p) => s + p.total, 0);

        container.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-boxes-stacked text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${inventory.length}</p>
                    <p class="text-xs opacity-90">إجمالي المواد</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-coins text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalValue).split(' ')[0]}</p>
                    <p class="text-xs opacity-90">قيمة المخزون</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-triangle-exclamation text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${lowItems.length}</p>
                    <p class="text-xs opacity-90">مواد منخفضة</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4">
                    <i class="fa-solid fa-truck text-2xl opacity-80"></i>
                    <p class="text-2xl font-black mt-2">${Utils.formatCurrency(totalPurchases).split(' ')[0]}</p>
                    <p class="text-xs opacity-90">المشتريات</p>
                </div>
            </div>

            ${lowItems.length > 0 ? `
                <div class="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <h3 class="font-bold text-red-800 mb-2"><i class="fa-solid fa-triangle-exclamation"></i> تنبيهات: مواد منخفضة</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        ${lowItems.map(i => `
                            <div class="bg-white rounded-lg p-2 border border-red-100 flex justify-between items-center">
                                <span class="font-bold text-sm">${Utils.esc(i.name)}</span>
                                <span class="text-xs text-red-600 font-black">${i.quantity} / ${i.minQuantity} ${i.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200">
                    <h3 class="font-bold"><i class="fa-solid fa-boxes-stacked text-slate-400"></i> تفاصيل المخزون</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>المادة</th>
                                <th>الفئة</th>
                                <th>الكمية</th>
                                <th>الحد الأدنى</th>
                                <th>تكلفة الوحدة</th>
                                <th>القيمة</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inventory.map(i => {
                                const isLow = i.quantity <= i.minQuantity;
                                return `
                                    <tr>
                                        <td class="font-bold">${Utils.esc(i.name)}</td>
                                        <td><span class="badge badge-gray">${Utils.esc(i.category||'-')}</span></td>
                                        <td class="font-black">${i.quantity} ${i.unit}</td>
                                        <td>${i.minQuantity} ${i.unit}</td>
                                        <td>${Utils.formatCurrency(i.cost)}</td>
                                        <td class="font-bold">${Utils.formatCurrency(i.quantity * i.cost)}</td>
                                        <td>
                                            ${i.quantity<=0 ? '<span class="badge badge-danger">نفذ</span>' :
                                              isLow ? '<span class="badge badge-warning">منخفض</span>' :
                                              '<span class="badge badge-success">متوفر</span>'}
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

    // ============================================
    // ✅ الطباعة - استخدام التصميم الذهبي الجديد
    // ============================================
    printReport: function() {
        const sys = DB.get('system') || {};
        const reportNames = {
            sales: 'تقرير المبيعات',
            profit: 'تقرير الأرباح',
            items: 'تقرير الأصناف',
            employees: 'تقرير الموظفين',
            inventory: 'تقرير المخزون'
        };
        const reportTitle = reportNames[this.activeReport] || 'تقرير';

        let reportData;
        switch(this.activeReport) {
            case 'sales': reportData = this.buildSalesReport(); break;
            case 'profit': reportData = this.buildProfitReport(); break;
            case 'items': reportData = this.buildItemsReport(); break;
            case 'employees': reportData = this.buildEmployeesReport(); break;
            case 'inventory': reportData = this.buildInventoryReport(); break;
        }

        if (!reportData) {
            Utils.toast('error', 'لا توجد بيانات لطباعتها');
            return;
        }

        // ✅ استخدم buildGoldReport إذا متوفرة
        if (typeof Utils.buildGoldReport === 'function') {
            const html = Utils.buildGoldReport({
                reportTitle: reportTitle,
                reportSubtitle: sys.nameAr || '',
                dateFrom: this.dateFrom,
                dateTo: this.dateTo,
                ...reportData
            });
            Utils.printHTML(html, reportTitle);
        } else {
            // ✅ fallback: استخدم buildGoldInvoice
            const html = Utils.buildGoldInvoice({
                type: 'statement',
                typeLabel: reportTitle,
                number: sys.nameAr || '',
                date: new Date(),
                infoCards: reportData.kpiCards ? reportData.kpiCards.slice(0, 2).map(c => ({
                    title: c.label,
                    icon: c.icon,
                    rows: [{ lbl: 'القيمة', val: c.value }]
                })) : [],
                tableHeaders: reportData.tableHeaders || [],
                tableRows: reportData.tableRows || [],
                totals: reportData.summaryRows || [],
                signatures: reportData.signatures || ['توقيع المسؤول', 'توقيع المدقق'],
                footerThanks: 'شكراً لتعاملكم معنا',
                devInfo: {
                    name: DB.get('developerInfo')?.nameEn || '',
                    title: DB.get('developerInfo')?.titleEn || '',
                    phone: DB.get('developerInfo')?.phones?.[0]?.number.replace('+', '') || '',
                    copyright: `جميع الحقوق محفوظة © ${DB.get('developerInfo')?.copyrightYear || '2026'}`
                }
            });
            Utils.printHTML(html, reportTitle);
        }
        DB.log('reports', `طباعة ${reportTitle}`);
    },

    // ============================================
    // ✅ بناء بيانات التقرير للطباعة
    // ============================================
    buildSalesReport: function() {
        const sys = DB.get('system') || {};
        const invoices = this.filterByDate(DB.get('invoices') || []).filter(i => i.status !== 'cancelled' && i.status !== 'returned');
        const purchases = this.filterByDate(DB.get('purchases') || []);

        const totalSales = invoices.reduce((s,i) => s + i.total, 0);
        const totalPurchases = purchases.reduce((s,p) => s + p.total, 0);
        const totalVAT = invoices.reduce((s,i) => s + (i.tax||0), 0);
        const totalDiscount = invoices.reduce((s,i) => s + (i.discount||0), 0);
        const cashIn = invoices.filter(i => i.paymentMethod === 'cash').reduce((s,i) => s + i.total, 0);
        const cardIn = invoices.filter(i => i.paymentMethod === 'card').reduce((s,i) => s + i.total, 0);
        const creditIn = invoices.filter(i => i.paymentMethod === 'credit').reduce((s,i) => s + i.total, 0);
        const avgTicket = invoices.length ? totalSales / invoices.length : 0;

        const daily = {};
        invoices.forEach(inv => {
            const d = new Date(inv.date).toISOString().split('T')[0];
            if (!daily[d]) daily[d] = { count: 0, total: 0, tax: 0, discount: 0 };
            daily[d].count++;
            daily[d].total += inv.total;
            daily[d].tax += inv.tax || 0;
            daily[d].discount += inv.discount || 0;
        });
        const dailyArr = Object.entries(daily).sort((a,b) => b[0].localeCompare(a[0]));

        return {
            kpiCards: [
                { icon: 'fa-chart-line', label: 'إجمالي المبيعات', value: Utils.formatCurrency(totalSales), color: '#059669' },
                { icon: 'fa-file-invoice', label: 'عدد الفواتير', value: invoices.length.toString(), color: '#1e40af' },
                { icon: 'fa-receipt', label: 'متوسط الفاتورة', value: Utils.formatCurrency(avgTicket), color: '#7c3aed' },
                { icon: 'fa-truck', label: 'إجمالي المشتريات', value: Utils.formatCurrency(totalPurchases), color: '#dc2626' }
            ],
            additionalBlocks: [{
                title: 'تفصيل طرق الدفع',
                icon: 'fa-credit-card',
                html: `
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                        <div style="background:#f0fdf4;padding:8px;border-radius:8px;text-align:center;border:1px solid #86efac;">
                            <div style="font-size:10px;color:#15803d;font-weight:600;">نقدي</div>
                            <div style="font-size:13px;font-weight:900;color:#059669;margin-top:2px;">${Utils.formatCurrency(cashIn)}</div>
                        </div>
                        <div style="background:#eff6ff;padding:8px;border-radius:8px;text-align:center;border:1px solid #93c5fd;">
                            <div style="font-size:10px;color:#1e40af;font-weight:600;">بطاقة</div>
                            <div style="font-size:13px;font-weight:900;color:#2563eb;margin-top:2px;">${Utils.formatCurrency(cardIn)}</div>
                        </div>
                        <div style="background:#fef3c7;padding:8px;border-radius:8px;text-align:center;border:1px solid #fcd34d;">
                            <div style="font-size:10px;color:#92400e;font-weight:600;">آجل</div>
                            <div style="font-size:13px;font-weight:900;color:#d97706;margin-top:2px;">${Utils.formatCurrency(creditIn)}</div>
                        </div>
                    </div>
                `
            }],
            tableHeaders: ['التاريخ', 'الفواتير', 'المبيعات', 'الضريبة', 'الخصومات', 'الصافي'],
            tableRows: dailyArr.map(([date, data]) => [
                Utils.formatDate(date),
                data.count.toString(),
                Utils.formatCurrency(data.total),
                Utils.formatCurrency(data.tax),
                `<span style="color:#dc2626;">${Utils.formatCurrency(data.discount)}</span>`,
                `<span style="color:#d97706;font-weight:900;">${Utils.formatCurrency(data.total)}</span>`
            ]),
            summaryRows: [
                { lbl: 'إجمالي المبيعات', val: `${totalSales.toLocaleString()} ${sys.currency}` },
                { lbl: 'إجمالي الضريبة', val: `${totalVAT.toLocaleString()} ${sys.currency}`, type: 'tax' },
                { lbl: 'إجمالي الخصومات', val: `-${totalDiscount.toLocaleString()} ${sys.currency}`, type: 'discount' },
                { lbl: 'صافي المبيعات', val: `${totalSales.toLocaleString()} ${sys.currency}`, type: 'final' }
            ],
            signatures: ['توقيع الكاشير', 'توقيع المدير'],
            footerNote: `تم تحليل ${invoices.length} فاتورة خلال الفترة المحددة.`
        };
    },

    buildProfitReport: function() {
        const sys = DB.get('system') || {};
        const invoices = this.filterByDate(DB.get('invoices') || []).filter(i => i.status !== 'cancelled' && i.status !== 'returned');
        
        let totalRevenue = 0, totalCost = 0, totalProfit = 0;
        const itemProfit = {};

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                const cost = item.cost || 0;
                const revenue = item.total;
                const profit = revenue - (cost * item.quantity);
                totalRevenue += revenue;
                totalCost += cost * item.quantity;
                totalProfit += profit;
                if (!itemProfit[item.name]) {
                    itemProfit[item.name] = { name: item.name, qty: 0, revenue: 0, cost: 0, profit: 0 };
                }
                itemProfit[item.name].qty += item.quantity;
                itemProfit[item.name].revenue += revenue;
                itemProfit[item.name].cost += cost * item.quantity;
                itemProfit[item.name].profit += profit;
            });
        });

        const profitArr = Object.values(itemProfit).sort((a,b) => b.profit - a.profit);
        const margin = totalRevenue ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;

        return {
            kpiCards: [
                { icon: 'fa-money-bill-wave', label: 'الإيرادات', value: Utils.formatCurrency(totalRevenue), color: '#059669' },
                { icon: 'fa-shopping-cart', label: 'التكلفة', value: Utils.formatCurrency(totalCost), color: '#dc2626' },
                { icon: 'fa-coins', label: 'صافي الربح', value: Utils.formatCurrency(totalProfit), color: '#1e40af' },
                { icon: 'fa-percent', label: 'هامش الربح', value: `${margin}%`, color: '#7c3aed' }
            ],
            tableHeaders: ['الصنف', 'الكمية المباعة', 'الإيرادات', 'التكلفة', 'الربح', 'الهامش'],
            tableRows: profitArr.map(p => {
                const m = p.revenue ? (p.profit/p.revenue*100).toFixed(1) : 0;
                return [
                    Utils.esc(p.name),
                    p.qty.toString(),
                    Utils.formatCurrency(p.revenue),
                    `<span style="color:#dc2626;">${Utils.formatCurrency(p.cost)}</span>`,
                    `<span style="color:#059669;font-weight:800;">${Utils.formatCurrency(p.profit)}</span>`,
                    `<span style="color:#d97706;font-weight:800;">${m}%</span>`
                ];
            }),
            summaryRows: [
                { lbl: 'إجمالي الإيرادات', val: `${totalRevenue.toLocaleString()} ${sys.currency}` },
                { lbl: 'إجمالي التكلفة', val: `-${totalCost.toLocaleString()} ${sys.currency}`, type: 'discount' },
                { lbl: 'صافي الربح', val: `${totalProfit.toLocaleString()} ${sys.currency}`, type: 'final' }
            ],
            signatures: ['توقيع المحاسب', 'توقيع المدير'],
            footerNote: `هامش الربح الحالي: ${margin}%`
        };
    },

    buildItemsReport: function() {
        const sys = DB.get('system') || {};
        const invoices = this.filterByDate(DB.get('invoices') || []).filter(i => i.status !== 'cancelled' && i.status !== 'returned');
        const itemStats = {};

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!itemStats[item.name]) itemStats[item.name] = { name: item.name, qty: 0, total: 0, count: 0 };
                itemStats[item.name].qty += item.quantity;
                itemStats[item.name].total += item.total;
                itemStats[item.name].count++;
            });
        });

        const arr = Object.values(itemStats).sort((a,b) => b.qty - a.qty);
        const totalQty = arr.reduce((s,i) => s + i.qty, 0);
        const totalSales = arr.reduce((s,i) => s + i.total, 0);

        return {
            kpiCards: [
                { icon: 'fa-utensils', label: 'أصناف مباعة', value: arr.length.toString(), color: '#1e40af' },
                { icon: 'fa-shopping-bag', label: 'إجمالي الوحدات', value: totalQty.toString(), color: '#059669' },
                { icon: 'fa-coins', label: 'إجمالي المبيعات', value: Utils.formatCurrency(totalSales), color: '#d97706' }
            ],
            tableHeaders: ['#', 'الصنف', 'مرات البيع', 'الكمية', 'الإجمالي', 'النسبة'],
            tableRows: arr.map((item, i) => {
                const percent = totalQty ? (item.qty/totalQty*100).toFixed(1) : 0;
                return [
                    (i+1).toString(),
                    Utils.esc(item.name),
                    item.count.toString(),
                    item.qty.toString(),
                    Utils.formatCurrency(item.total),
                    `<span style="color:#d97706;font-weight:800;">${percent}%</span>`
                ];
            }),
            summaryRows: [
                { lbl: 'إجمالي الأصناف المباعة', val: arr.length.toString() },
                { lbl: 'إجمالي الوحدات', val: totalQty.toString() },
                { lbl: 'إجمالي المبيعات', val: `${totalSales.toLocaleString()} ${sys.currency}`, type: 'final' }
            ],
            signatures: ['توقيع المسؤول', 'توقيع المدير'],
            footerNote: `الأكثر مبيعاً: "${arr[0]?.name || '-'}"`
        };
    },

    buildEmployeesReport: function() {
        const sys = DB.get('system') || {};
        const employees = DB.get('employees') || [];
        const invoices = this.filterByDate(DB.get('invoices') || []);
        
        const empStats = {};
        invoices.forEach(inv => {
            const u = inv.user || 'غير معروف';
            if (!empStats[u]) empStats[u] = { name: u, count: 0, total: 0 };
            empStats[u].count++;
            empStats[u].total += inv.total;
        });
        const arr = Object.values(empStats).sort((a,b) => b.total - a.total);
        const totalSales = invoices.reduce((s,i) => s + i.total, 0);

        return {
            kpiCards: [
                { icon: 'fa-user-tie', label: 'عدد الموظفين', value: employees.length.toString(), color: '#1e40af' },
                { icon: 'fa-cash-register', label: 'كاشيريين نشطين', value: arr.length.toString(), color: '#059669' },
                { icon: 'fa-coins', label: 'إجمالي المبيعات', value: Utils.formatCurrency(totalSales), color: '#d97706' }
            ],
            tableHeaders: ['#', 'المستخدم', 'عدد الفواتير', 'المبيعات', 'متوسط الفاتورة', 'النسبة'],
            tableRows: arr.map((e, i) => {
                const avg = e.count ? e.total/e.count : 0;
                const percent = totalSales ? (e.total/totalSales*100).toFixed(1) : 0;
                return [
                    (i+1).toString(),
                    Utils.esc(e.name),
                    e.count.toString(),
                    Utils.formatCurrency(e.total),
                    Utils.formatCurrency(avg),
                    `<span style="color:#d97706;font-weight:800;">${percent}%</span>`
                ];
            }),
            summaryRows: [
                { lbl: 'إجمالي الكاشيريين', val: arr.length.toString() },
                { lbl: 'إجمالي الفواتير', val: invoices.length.toString() },
                { lbl: 'إجمالي المبيعات', val: `${totalSales.toLocaleString()} ${sys.currency}`, type: 'final' }
            ],
            signatures: ['توقيع المدير', 'توقيع المحاسب'],
            footerNote: `تحليل أداء ${arr.length} مستخدم خلال الفترة.`
        };
    },

    buildInventoryReport: function() {
        const sys = DB.get('system') || {};
        const inventory = DB.get('inventory') || [];
        const purchases = this.filterByDate(DB.get('purchases') || []);
        
        const totalValue = inventory.reduce((s,i) => s + (i.quantity * i.cost), 0);
        const lowItems = inventory.filter(i => i.quantity <= i.minQuantity);
        const totalPurchases = purchases.reduce((s,p) => s + p.total, 0);

        return {
            kpiCards: [
                { icon: 'fa-boxes-stacked', label: 'إجمالي المواد', value: inventory.length.toString(), color: '#1e40af' },
                { icon: 'fa-coins', label: 'قيمة المخزون', value: Utils.formatCurrency(totalValue), color: '#059669' },
                { icon: 'fa-triangle-exclamation', label: 'مواد منخفضة', value: lowItems.length.toString(), color: '#dc2626' },
                { icon: 'fa-truck', label: 'إجمالي المشتريات', value: Utils.formatCurrency(totalPurchases), color: '#d97706' }
            ],
            additionalBlocks: lowItems.length > 0 ? [{
                title: `تنبيهات: مواد منخفضة (${lowItems.length})`,
                icon: 'fa-triangle-exclamation',
                html: `
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">
                        ${lowItems.slice(0, 10).map(i => `
                            <div style="background:white;border-radius:6px;padding:6px 10px;border:1px solid #fecaca;display:flex;justify-content:space-between;align-items:center;">
                                <span style="font-weight:700;font-size:10.5px;color:#991b1b;">${Utils.esc(i.name)}</span>
                                <span style="font-size:10px;color:#dc2626;font-weight:800;">${i.quantity} / ${i.minQuantity} ${i.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                `
            }] : [],
            tableHeaders: ['المادة', 'الفئة', 'الكمية', 'الحد الأدنى', 'تكلفة الوحدة', 'القيمة', 'الحالة'],
            tableRows: inventory.map(i => {
                const isLow = i.quantity <= i.minQuantity;
                const isEmpty = i.quantity <= 0;
                return [
                    Utils.esc(i.name),
                    Utils.esc(i.category || '-'),
                    `<span style="font-weight:900;">${i.quantity} ${i.unit}</span>`,
                    `${i.minQuantity} ${i.unit}`,
                    Utils.formatCurrency(i.cost),
                    `<span style="color:#d97706;font-weight:800;">${Utils.formatCurrency(i.quantity * i.cost)}</span>`,
                    isEmpty 
                        ? `<span style="color:#dc2626;font-weight:800;">نفذ</span>` 
                        : isLow 
                        ? `<span style="color:#d97706;font-weight:800;">منخفض</span>` 
                        : `<span style="color:#059669;font-weight:800;">متوفر</span>`
                ];
            }),
            summaryRows: [
                { lbl: 'عدد المواد', val: inventory.length.toString() },
                { lbl: 'إجمالي قيمة المخزون', val: `${totalValue.toLocaleString()} ${sys.currency}`, type: 'final' }
            ],
            signatures: ['توقيع أمين المخزن', 'توقيع المدير'],
            footerNote: lowItems.length > 0 
                ? `⚠️ يوجد ${lowItems.length} مادة تحتاج إعادة تعبئة عاجلة.` 
                : '✅ جميع المواد ضمن الحد الآمن.'
        };
    },

    // ============================================
    // تصدير CSV
    // ============================================
    exportReport: function() {
        if (this.activeReport === 'sales') {
            const invoices = this.filterByDate(DB.get('invoices')||[]);
            const data = invoices.map(i => ({
                'الرقم': i.number,
                'التاريخ': Utils.formatDate(i.date, true),
                'العميل': DB.find('customers', i.customerId)?.name || '',
                'الإجمالي': i.total,
                'الضريبة': i.tax || 0,
                'الخصم': i.discount || 0,
                'طريقة الدفع': i.paymentMethod
            }));
            Utils.exportCSV(data, 'sales-report.csv');
        } else if (this.activeReport === 'profit') {
            const invoices = this.filterByDate(DB.get('invoices')||[]);
            const items = {};
            invoices.forEach(inv => inv.items.forEach(it => {
                if (!items[it.name]) items[it.name] = { name: it.name, qty:0, revenue:0, cost:0, profit:0 };
                items[it.name].qty += it.quantity;
                items[it.name].revenue += it.total;
                items[it.name].cost += (it.cost||0) * it.quantity;
                items[it.name].profit += it.total - ((it.cost||0) * it.quantity);
            }));
            Utils.exportCSV(Object.values(items), 'profit-report.csv');
        } else if (this.activeReport === 'items') {
            const invoices = this.filterByDate(DB.get('invoices')||[]);
            const items = {};
            invoices.forEach(inv => inv.items.forEach(it => {
                if (!items[it.name]) items[it.name] = { name: it.name, qty:0, total:0 };
                items[it.name].qty += it.quantity;
                items[it.name].total += it.total;
            }));
            Utils.exportCSV(Object.values(items), 'items-report.csv');
        } else if (this.activeReport === 'inventory') {
            Utils.exportCSV(DB.get('inventory')||[], 'inventory-report.csv');
        } else if (this.activeReport === 'employees') {
            const invoices = this.filterByDate(DB.get('invoices')||[]);
            const empStats = {};
            invoices.forEach(inv => {
                const u = inv.user || 'غير معروف';
                if (!empStats[u]) empStats[u] = { name: u, count: 0, total: 0 };
                empStats[u].count++;
                empStats[u].total += inv.total;
            });
            Utils.exportCSV(Object.values(empStats), 'employees-report.csv');
        } else {
            Utils.toast('info', 'التصدير متاح للتقارير الأخرى من ملفاتها');
        }
    }
};