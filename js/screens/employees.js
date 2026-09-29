/**
 * Employees Screen - الموظفين
 */
const Employees = {
    searchQuery: '',
    filterStatus: 'all', // all, active, inactive

    render: function() {
        const employees = DB.get('employees') || [];
        const active = employees.filter(e => e.active !== false);
        const totalSalaries = active.reduce((s,e) => s + (e.salary||0), 0);

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-user-tie text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${employees.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي الموظفين</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-user-check text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${active.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">نشطون</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-user-xmark text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${employees.length - active.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">غير نشطين</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-money-bill-wave text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(totalSalaries).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي الرواتب</p>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="emp-search" placeholder="ابحث بالاسم أو الوظيفة أو الهاتف..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    ${[
                        {id:'all', label:'الكل'},
                        {id:'active', label:'نشط'},
                        {id:'inactive', label:'غير نشط'}
                    ].map(f => `
                        <button onclick="Employees.setStatus('${f.id}')" data-st="${f.id}"
                                class="emp-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
                            ${f.label}
                        </button>
                    `).join('')}
                </div>
                <button onclick="Employees.openForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> موظف جديد
                </button>
            </div>

            <!-- List -->
            <div id="emp-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.updateFilterButtons();
        this.renderList();
        const search = document.getElementById('emp-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderList();
            }, 150);
        }
    },

    updateFilterButtons: function() {
        document.querySelectorAll('.emp-filter-btn').forEach(b => {
            const isActive = b.dataset.st === this.filterStatus;
            b.className = `emp-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-white'
            }`;
        });
    },

    setStatus: function(s) {
        this.filterStatus = s;
        this.updateFilterButtons();
        this.renderList();
    },

    renderList: function() {
        const container = document.getElementById('emp-container');
        if (!container) return;

        let employees = DB.get('employees') || [];
        if (this.filterStatus === 'active') employees = employees.filter(e => e.active !== false);
        else if (this.filterStatus === 'inactive') employees = employees.filter(e => e.active === false);
        if (this.searchQuery) {
            employees = employees.filter(e => 
                e.name.toLowerCase().includes(this.searchQuery) ||
                (e.position||'').toLowerCase().includes(this.searchQuery) ||
                (e.phone||'').includes(this.searchQuery)
            );
        }

        if (employees.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-user-tie text-5xl mb-3"></i>
                <p>لا يوجد موظفين</p>
            </div>`;
            return;
        }

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${employees.map(e => {
                    const hireDate = e.hireDate ? new Date(e.hireDate) : null;
                    const years = hireDate ? ((Date.now() - hireDate.getTime()) / (365*86400000)).toFixed(1) : 0;
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
                            <div class="flex items-start gap-3 mb-3">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-tr ${e.active===false?'from-slate-400 to-slate-500':'from-primary to-secondary'} text-white flex items-center justify-center font-black text-xl flex-shrink-0">
                                    ${e.name.charAt(0)}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2">
                                        <p class="font-bold truncate">${Utils.esc(e.name)}</p>
                                        ${e.active === false ? '<span class="badge badge-danger">غير نشط</span>' : '<span class="badge badge-success">نشط</span>'}
                                    </div>
                                    <p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid fa-briefcase"></i> ${Utils.esc(e.position||'-')}</p>
                                    ${e.phone ? `<p class="text-xs text-slate-500 font-en mt-0.5" dir="ltr"><i class="fa-solid fa-phone"></i> ${e.phone}</p>` : ''}
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-2 mb-3">
                                <div class="bg-slate-50 rounded-xl p-2 text-center">
                                    <p class="text-xs text-slate-500">الراتب</p>
                                    <p class="font-black text-primary text-sm">${Utils.formatCurrency(e.salary||0)}</p>
                                </div>
                                <div class="bg-slate-50 rounded-xl p-2 text-center">
                                    <p class="text-xs text-slate-500">مدة العمل</p>
                                    <p class="font-bold text-slate-700 text-sm">${years} سنة</p>
                                </div>
                            </div>

                            <div class="flex gap-1">
                                <button onclick="Employees.viewEmployee(${e.id})" class="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                                    <i class="fa-solid fa-eye"></i> تفاصيل
                                </button>
                                <button onclick="Payroll.openForEmployee(${e.id})" class="flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-bold">
                                    <i class="fa-solid fa-money-bill"></i> راتب
                                </button>
                                <button onclick="Employees.openForm(${e.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center">
                                    <i class="fa-solid fa-edit text-xs"></i>
                                </button>
                                <button onclick="Employees.deleteEmployee(${e.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    openForm: function(empId = null) {
        const e = empId ? DB.find('employees', empId) : null;
        const isEdit = !!e;
        
        const content = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-2">
                        <label class="block text-sm font-bold mb-1">الاسم الكامل *</label>
                        <input type="text" id="emp-name" value="${e?.name || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الوظيفة *</label>
                        <input type="text" id="emp-position" value="${e?.position || ''}" list="positions-list"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        <datalist id="positions-list">
                            <option value="كاشير"><option value="شيف"><option value="ويتر">
                            <option value="مدير"><option value="محاسب"><option value="عامل نظافة">
                            <option value="سائق"><option value="مشتريات">
                        </datalist>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">رقم الهاتف</label>
                        <input type="tel" id="emp-phone" value="${e?.phone || ''}" dir="ltr"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الرقم الوطني / الهوية</label>
                        <input type="text" id="emp-nationalId" value="${e?.nationalId || ''}" dir="ltr"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">تاريخ التعيين</label>
                        <input type="date" id="emp-hireDate" value="${e?.hireDate || new Date().toISOString().split('T')[0]}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الراتب الأساسي *</label>
                        <input type="number" id="emp-salary" value="${e?.salary || 0}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">البدلات</label>
                        <input type="number" id="emp-allowances" value="${e?.allowances || 0}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-bold mb-1">العنوان</label>
                        <input type="text" id="emp-address" value="${e?.address || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-bold mb-1">الحالة</label>
                        <select id="emp-active" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="true" ${e?.active!==false?'selected':''}>نشط</option>
                            <option value="false" ${e?.active===false?'selected':''}>غير نشط</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-bold mb-1">ملاحظات</label>
                        <textarea id="emp-notes" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">${e?.notes || ''}</textarea>
                    </div>
                </div>
                <button onclick="Employees.save(${empId||'null'})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة الموظف'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل موظف' : 'موظف جديد', content, { size: 'max-w-2xl' });
    },

    save: function(empId) {
        const name = document.getElementById('emp-name').value.trim();
        const position = document.getElementById('emp-position').value.trim();
        const phone = document.getElementById('emp-phone').value.trim();
        const nationalId = document.getElementById('emp-nationalId').value.trim();
        const hireDate = document.getElementById('emp-hireDate').value;
        const salary = parseFloat(document.getElementById('emp-salary').value) || 0;
        const allowances = parseFloat(document.getElementById('emp-allowances').value) || 0;
        const address = document.getElementById('emp-address').value.trim();
        const active = document.getElementById('emp-active').value === 'true';
        const notes = document.getElementById('emp-notes').value.trim();

        if (!name || !position) { Utils.toast('error', 'يرجى ملء الحقول المطلوبة'); return; }
        if (salary <= 0) { Utils.toast('error', 'أدخل راتب صحيح'); return; }

        const data = { name, position, phone, nationalId, hireDate, salary, allowances, address, active, notes };

        if (empId) {
            DB.update('employees', empId, data);
            DB.log('employees', `تعديل موظف ${name}`);
            Utils.toast('success', 'تم التحديث');
        } else {
            DB.add('employees', data);
            DB.log('employees', `إضافة موظف ${name}`);
            Utils.toast('success', 'تمت الإضافة');
        }
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    viewEmployee: function(id) {
        const e = DB.find('employees', id);
        if (!e) return;
        
        const payrolls = (DB.get('payrolls')||[]).filter(p => p.employeeId === id);
        const totalPaid = payrolls.reduce((s,p) => s + p.netSalary, 0);
        const hireDate = e.hireDate ? new Date(e.hireDate) : null;
        const years = hireDate ? ((Date.now() - hireDate.getTime()) / (365*86400000)).toFixed(1) : 0;

        const content = `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-primary to-blue-800 text-white rounded-xl p-5">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center font-black text-2xl">
                            ${e.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="font-black text-xl">${Utils.esc(e.name)}</h3>
                            <p class="text-sm opacity-90"><i class="fa-solid fa-briefcase"></i> ${Utils.esc(e.position)}</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500">الراتب الأساسي</p>
                        <p class="font-black text-primary text-lg">${Utils.formatCurrency(e.salary)}</p>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500">البدلات</p>
                        <p class="font-black text-green-600 text-lg">${Utils.formatCurrency(e.allowances||0)}</p>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500">مدة العمل</p>
                        <p class="font-bold text-slate-800">${years} سنة</p>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500">إجمالي المستلم</p>
                        <p class="font-bold text-slate-800">${Utils.formatCurrency(totalPaid)}</p>
                    </div>
                </div>

                <div class="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
                    ${e.phone?`<div class="flex justify-between"><span class="text-slate-500">الهاتف:</span><span class="font-en" dir="ltr">${e.phone}</span></div>`:''}
                    ${e.nationalId?`<div class="flex justify-between"><span class="text-slate-500">الرقم الوطني:</span><span class="font-en" dir="ltr">${e.nationalId}</span></div>`:''}
                    ${e.hireDate?`<div class="flex justify-between"><span class="text-slate-500">تاريخ التعيين:</span><span>${Utils.formatDate(e.hireDate)}</span></div>`:''}
                    ${e.address?`<div class="flex justify-between"><span class="text-slate-500">العنوان:</span><span>${Utils.esc(e.address)}</span></div>`:''}
                </div>

                ${payrolls.length > 0 ? `
                    <div>
                        <h4 class="font-bold mb-2"><i class="fa-solid fa-history text-slate-400"></i> آخر الرواتب</h4>
                        <div class="max-h-40 overflow-y-auto space-y-1">
                            ${payrolls.slice(-5).reverse().map(p => `
                                <div class="flex justify-between bg-white border border-slate-100 rounded-lg p-2 text-xs">
                                    <span>${p.month}/${p.year}</span>
                                    <span class="font-bold">${Utils.formatCurrency(p.netSalary)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        Utils.modal('تفاصيل الموظف', content, { size: 'max-w-lg' });
    },

    deleteEmployee: function(id) {
        Utils.confirm('هل تريد حذف الموظف؟', () => {
            DB.remove('employees', id);
            DB.log('employees', `حذف موظف #${id}`);
            Utils.toast('success', 'تم الحذف');
            this.renderList();
        });
    }
};