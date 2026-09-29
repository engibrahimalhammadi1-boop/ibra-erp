/**
 * Payroll Screen - رواتب الموظفين
 */
const Payroll = {
    filterMonth: new Date().getMonth() + 1,
    filterYear: new Date().getFullYear(),
    searchQuery: '',

    render: function() {
        const payrolls = DB.get('payrolls') || [];
        const currentMonthPayrolls = payrolls.filter(p => p.month === this.filterMonth && p.year === this.filterYear);
        const totalPaid = currentMonthPayrolls.reduce((s,p) => s + p.netSalary, 0);
        
        const employees = (DB.get('employees')||[]).filter(e => e.active !== false);
        const paidEmpIds = currentMonthPayrolls.map(p => p.employeeId);
        const pendingEmployees = employees.filter(e => !paidEmpIds.includes(e.id));
        const expectedTotal = employees.reduce((s,e) => s + e.salary + (e.allowances||0), 0);

        return `
        <div class="space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-users text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${employees.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي الموظفين</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-check-circle text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${currentMonthPayrolls.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">تم صرف رواتبهم</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-hourglass-half text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${pendingEmployees.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">لم تُصرف</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-coins text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(totalPaid).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">المصروف هذا الشهر</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-wrap gap-2 items-center">
                <select onchange="Payroll.setMonth(parseInt(this.value))" 
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500">
                    ${Array.from({length:12},(_,i)=>i+1).map(m => `<option value="${m}" ${m===this.filterMonth?'selected':''}>${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][m-1]}</option>`).join('')}
                </select>
                <select onchange="Payroll.setYear(parseInt(this.value))" 
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500">
                    ${[2024,2025,2026,2027].map(y => `<option value="${y}" ${y===this.filterYear?'selected':''}>${y}</option>`).join('')}
                </select>
                
                <div class="flex-1"></div>
                
                <div class="text-sm font-bold text-slate-700 hidden md:block">
                    المتوقع: <span class="text-amber-600">${Utils.formatCurrency(expectedTotal)}</span>
                </div>
                
                <button onclick="Payroll.openBulkPayroll()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-money-bill-wave"></i> صرف رواتب الشهر
                </button>
            </div>

            <div id="payroll-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderList();
    },

    setMonth: function(m) {
        this.filterMonth = m;
        this.renderList();
    },

    setYear: function(y) {
        this.filterYear = y;
        this.renderList();
    },

    renderList: function() {
        const container = document.getElementById('payroll-container');
        if (!container) return;

        const employees = (DB.get('employees')||[]).filter(e => e.active !== false);
        const payrolls = (DB.get('payrolls')||[]).filter(p => p.month === this.filterMonth && p.year === this.filterYear);
        const paidMap = {};
        payrolls.forEach(p => paidMap[p.employeeId] = p);

        if (employees.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-money-bill-wave text-5xl mb-3"></i>
                <p>لا يوجد موظفين</p>
            </div>`;
            return;
        }

        const monthName = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][this.filterMonth-1];

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 class="font-bold"><i class="fa-solid fa-calendar-check text-amber-500"></i> كشف رواتب ${monthName} ${this.filterYear}</h3>
                    <span class="badge badge-info">${payrolls.length} / ${employees.length} مصروف</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>الموظف</th>
                                <th>الوظيفة</th>
                                <th>الراتب</th>
                                <th>البدلات</th>
                                <th>الخصومات</th>
                                <th>الصافي</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map(e => {
                                const payroll = paidMap[e.id];
                                const net = payroll ? payroll.netSalary : (e.salary + (e.allowances||0));
                                const deductions = payroll ? payroll.deductions : 0;
                                return `
                                    <tr>
                                        <td>
                                            <div class="flex items-center gap-2">
                                                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs">
                                                    ${e.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p class="font-bold">${Utils.esc(e.name)}</p>
                                                    ${e.phone?`<p class="text-xs text-slate-400 font-en" dir="ltr">${e.phone}</p>`:''}
                                                </div>
                                            </div>
                                        </td>
                                        <td><span class="badge badge-gray">${Utils.esc(e.position)}</span></td>
                                        <td>${Utils.formatCurrency(e.salary)}</td>
                                        <td class="text-green-600">+${Utils.formatCurrency(e.allowances||0)}</td>
                                        <td class="${deductions>0?'text-red-600':'text-slate-400'}">${deductions?'-'+Utils.formatCurrency(deductions):'0'}</td>
                                        <td class="font-black text-amber-600">${Utils.formatCurrency(net)}</td>
                                        <td>
                                            ${payroll 
                                                ? '<span class="badge badge-success"><i class="fa-solid fa-check"></i> مصروف</span>' 
                                                : '<span class="badge badge-warning"><i class="fa-solid fa-hourglass"></i> معلق</span>'}
                                        </td>
                                        <td>
                                            ${payroll 
                                                ? `<button onclick="Payroll.printSlip(${payroll.id})" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-bold">
                                                        <i class="fa-solid fa-print"></i> كشف
                                                   </button>`
                                                : `<button onclick="Payroll.openForEmployee(${e.id})" class="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold">
                                                        <i class="fa-solid fa-money-bill"></i> صرف
                                                   </button>`}
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

    openForEmployee: function(empId) {
        const e = DB.find('employees', empId);
        if (!e) return;
        
        const existing = (DB.get('payrolls')||[]).find(p => p.employeeId === empId && p.month === this.filterMonth && p.year === this.filterYear);
        if (existing) {
            Utils.toast('warning', 'تم صرف راتب هذا الموظف لهذا الشهر');
            return;
        }

        const monthName = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][this.filterMonth-1];
        const baseSalary = e.salary || 0;
        const allowances = e.allowances || 0;
        const gross = baseSalary + allowances;

        const content = `
            <div class="space-y-3">
                <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-4">
                    <h3 class="font-black text-lg">${Utils.esc(e.name)}</h3>
                    <p class="text-sm opacity-90">${Utils.esc(e.position)} - ${monthName} ${this.filterYear}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold mb-1">الراتب الأساسي</label>
                        <input type="number" id="pr-base" value="${baseSalary}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">البدلات</label>
                        <input type="number" id="pr-allow" value="${allowances}" step="0.01" oninput="Payroll.calcNet()"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">المكافآت</label>
                        <input type="number" id="pr-bonus" value="0" step="0.01" oninput="Payroll.calcNet()"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">الخصومات</label>
                        <input type="number" id="pr-deduct" value="0" step="0.01" oninput="Payroll.calcNet()"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                    </div>
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center">
                    <span class="font-bold">الصافي المستحق:</span>
                    <span id="pr-net" class="font-black text-2xl text-amber-600">${Utils.formatCurrency(gross)}</span>
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">الصندوق</label>
                    <select id="pr-cashbox" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                        ${(DB.get('cashbox')||[]).map(c => `<option value="${c.id}">${c.name} - ${Utils.formatCurrency(c.balance)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">ملاحظات</label>
                    <input type="text" id="pr-notes" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                </div>
                <button onclick="Payroll.saveSingle(${empId})" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> صرف الراتب
                </button>
            </div>
        `;
        Utils.modal('صرف راتب', content, { size: 'max-w-md' });
        setTimeout(() => Payroll.calcNet(), 50);
    },

    calcNet: function() {
        const base = parseFloat(document.getElementById('pr-base')?.value) || 0;
        const allow = parseFloat(document.getElementById('pr-allow')?.value) || 0;
        const bonus = parseFloat(document.getElementById('pr-bonus')?.value) || 0;
        const deduct = parseFloat(document.getElementById('pr-deduct')?.value) || 0;
        const net = base + allow + bonus - deduct;
        const el = document.getElementById('pr-net');
        if (el) el.textContent = Utils.formatCurrency(net);
    },

    saveSingle: function(empId) {
        const e = DB.find('employees', empId);
        if (!e) return;

        const baseSalary = parseFloat(document.getElementById('pr-base').value) || 0;
        const allowances = parseFloat(document.getElementById('pr-allow').value) || 0;
        const bonus = parseFloat(document.getElementById('pr-bonus').value) || 0;
        const deductions = parseFloat(document.getElementById('pr-deduct').value) || 0;
        const cashboxId = parseInt(document.getElementById('pr-cashbox').value);
        const notes = document.getElementById('pr-notes').value.trim();
        const netSalary = baseSalary + allowances + bonus - deductions;

        const payroll = {
            employeeId: empId,
            employeeName: e.name,
            position: e.position,
            month: this.filterMonth,
            year: this.filterYear,
            baseSalary, allowances, bonus, deductions, netSalary,
            cashboxId, notes,
            date: new Date().toISOString(),
            user: Utils.currentUser()?.name || 'system'
        };

        DB.add('payrolls', payroll);

        const cashboxes = DB.get('cashbox') || [];
        const idx = cashboxes.findIndex(c => c.id === cashboxId);
        if (idx !== -1) {
            cashboxes[idx].balance -= netSalary;
            DB.set('cashbox', cashboxes);
        }

        DB.add('vouchers', {
            number: Utils.generateVoucherNumber('payment'),
            type: 'payment',
            date: new Date().toISOString(),
            entityType: 'employee',
            entityId: empId,
            entityName: e.name,
            amount: netSalary,
            paymentMethod: 'cash',
            cashboxId,
            notes: `راتب ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][this.filterMonth-1]} ${this.filterYear}`,
            user: Utils.currentUser()?.name || 'system'
        });

        DB.log('payroll', `صرف راتب ${e.name} بمبلغ ${netSalary}`);
        Utils.toast('success', `تم صرف راتب ${e.name}`);
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    openBulkPayroll: function() {
        const employees = (DB.get('employees')||[]).filter(e => e.active !== false);
        const existing = (DB.get('payrolls')||[]).filter(p => p.month === this.filterMonth && p.year === this.filterYear);
        const paidIds = existing.map(p => p.employeeId);
        const pending = employees.filter(e => !paidIds.includes(e.id));

        if (pending.length === 0) {
            Utils.toast('info', 'تم صرف رواتب جميع الموظفين لهذا الشهر');
            return;
        }

        const totalNet = pending.reduce((s,e) => s + e.salary + (e.allowances||0), 0);
        const monthName = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][this.filterMonth-1];

        const content = `
            <div class="space-y-3">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    <i class="fa-solid fa-info-circle"></i>
                    سيتم صرف رواتب <strong>${pending.length}</strong> موظف لشهر ${monthName} ${this.filterYear}.
                </div>
                <div class="max-h-64 overflow-y-auto space-y-1 bg-slate-50 rounded-xl p-2">
                    ${pending.map(e => `
                        <div class="flex justify-between bg-white rounded-lg p-2 border border-slate-100 text-sm">
                            <div>
                                <p class="font-bold">${Utils.esc(e.name)}</p>
                                <p class="text-xs text-slate-500">${Utils.esc(e.position)}</p>
                            </div>
                            <p class="font-black text-amber-600">${Utils.formatCurrency(e.salary + (e.allowances||0))}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center">
                    <span class="font-bold">الإجمالي:</span>
                    <span class="font-black text-2xl text-amber-600">${Utils.formatCurrency(totalNet)}</span>
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1">الصندوق</label>
                    <select id="bulk-cashbox" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-amber-500">
                        ${(DB.get('cashbox')||[]).map(c => `<option value="${c.id}">${c.name} - ${Utils.formatCurrency(c.balance)}</option>`).join('')}
                    </select>
                </div>
                <button onclick="Payroll.saveBulk()" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check-double"></i> صرف جميع الرواتب
                </button>
            </div>
        `;
        window._pendingPayroll = pending;
        Utils.modal('صرف رواتب الشهر', content, { size: 'max-w-lg' });
    },

    saveBulk: function() {
        const pending = window._pendingPayroll || [];
        const cashboxId = parseInt(document.getElementById('bulk-cashbox').value);
        let totalPaid = 0;

        pending.forEach(e => {
            const baseSalary = e.salary || 0;
            const allowances = e.allowances || 0;
            const netSalary = baseSalary + allowances;

            DB.add('payrolls', {
                employeeId: e.id,
                employeeName: e.name,
                position: e.position,
                month: this.filterMonth,
                year: this.filterYear,
                baseSalary, allowances, bonus: 0, deductions: 0,
                netSalary, cashboxId,
                notes: 'صرف جماعي',
                date: new Date().toISOString(),
                user: Utils.currentUser()?.name || 'system'
            });

            totalPaid += netSalary;
        });

        const cashboxes = DB.get('cashbox') || [];
        const idx = cashboxes.findIndex(c => c.id === cashboxId);
        if (idx !== -1) {
            cashboxes[idx].balance -= totalPaid;
            DB.set('cashbox', cashboxes);
        }

        DB.add('vouchers', {
            number: Utils.generateVoucherNumber('payment'),
            type: 'payment',
            date: new Date().toISOString(),
            entityName: `رواتب ${pending.length} موظف`,
            amount: totalPaid,
            paymentMethod: 'cash',
            cashboxId,
            notes: `صرف جماعي لشهر ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][this.filterMonth-1]} ${this.filterYear}`,
            user: Utils.currentUser()?.name || 'system'
        });

        DB.log('payroll', `صرف جماعي لرواتب ${pending.length} موظف بمبلغ ${totalPaid}`);
        Utils.toast('success', `تم صرف ${pending.length} راتب`);
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    printSlip: function(payrollId) {
        const p = DB.find('payrolls', payrollId);
        if (!p) return;
        
        const sys = DB.get('system') || {};
        const dev = DB.get('developerInfo') || {};
        
        const monthName = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][p.month - 1];
        
        const totalEarnings = p.baseSalary + (p.allowances || 0) + (p.bonus || 0);
        const totalDeductions = (p.deductions || 0);

        const infoCards = [
            {
                title: 'بيانات الموظف',
                icon: 'fa-user-tie',
                rows: [
                    { lbl: 'الاسم', val: p.employeeName },
                    { lbl: 'الوظيفة', val: p.position || '-' },
                    { lbl: 'الشهر', val: `${monthName} ${p.year}` }
                ]
            },
            {
                title: 'بيانات الصرف',
                icon: 'fa-calendar',
                rows: [
                    { lbl: 'تاريخ الصرف', val: Utils.formatDate(p.date) },
                    { lbl: 'المستخدم', val: p.user || '-' },
                    { lbl: 'رقم الكشف', val: `PAY-${String(p.id).padStart(5, '0')}` }
                ]
            }
        ];

        const tableHeaders = ['البيان', 'المبلغ'];
        const tableRows = [
            ['الراتب الأساسي', `<span style="color:#d97706;font-weight:900;">${p.baseSalary.toLocaleString()}</span>`],
            ...(p.allowances ? [['البدلات', `<span style="color:#059669;font-weight:700;">+${p.allowances.toLocaleString()}</span>`]] : []),
            ...(p.bonus ? [['المكافآت', `<span style="color:#059669;font-weight:700;">+${p.bonus.toLocaleString()}</span>`]] : []),
            ...(p.deductions ? [['الخصومات', `<span style="color:#dc2626;font-weight:700;">-${p.deductions.toLocaleString()}</span>`]] : [])
        ];

        const totals = [
            { lbl: 'إجمالي الاستحقاقات', val: `${totalEarnings.toLocaleString()} ${sys.currency}` },
            ...(totalDeductions > 0 ? [{ lbl: 'إجمالي الخصومات', val: `-${totalDeductions.toLocaleString()} ${sys.currency}`, type: 'discount' }] : []),
            { lbl: 'الصافي المستحق', val: `${p.netSalary.toLocaleString()} ${sys.currency}`, type: 'final' }
        ];

        const html = Utils.buildGoldInvoice({
            type: 'payroll',
            typeLabel: 'كشف راتب',
            number: `PAY-${String(p.id).padStart(5, '0')}`,
            date: p.date,
            infoCards: infoCards,
            tableHeaders: tableHeaders,
            tableRows: tableRows,
            totals: totals,
            signatures: ['توقيع الموظف', 'توقيع المسؤول'],
            footerThanks: 'شكراً لتعاملكم معنا',
            footerSubtext: 'نتشرف بخدمتكم دائماً',
            devInfo: {
                name: dev.nameEn || '',
                title: dev.titleEn || '',
                phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
                copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
            }
        });
        
        Utils.printHTML(html, 'كشف راتب');
    }
};