/**
 * Users Screen - المستخدمين والصلاحيات
 */
const Users = {
    activeTab: 'users', // users, roles

    render: function() {
        const users = DB.get('users') || [];
        const roles = DB.get('roles') || [];

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-users text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${users.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي المستخدمين</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-user-check text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${users.filter(u=>u.active!==false).length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">نشطون</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-shield-halved text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${roles.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">الأدوار</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-user-xmark text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${users.filter(u=>u.active===false).length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">معطلون</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex gap-1">
                <button onclick="Users.setTab('users')" data-tab="users" class="us-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-users"></i> المستخدمون
                </button>
                <button onclick="Users.setTab('roles')" data-tab="roles" class="us-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                    <i class="fa-solid fa-shield-halved"></i> الأدوار والصلاحيات
                </button>
            </div>

            <!-- Content -->
            <div id="users-content"></div>
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
        document.querySelectorAll('.us-tab-btn').forEach(b => {
            const isActive = b.dataset.tab === this.activeTab;
            b.className = `us-tab-btn flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`;
        });
    },

    renderContent: function() {
        if (this.activeTab === 'users') this.renderUsers();
        else this.renderRoles();
    },

    renderUsers: function() {
        const container = document.getElementById('users-content');
        const users = DB.get('users') || [];
        const roles = DB.get('roles') || [];

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex justify-end">
                <button onclick="Users.openUserForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> مستخدم جديد
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                ${users.map(u => {
                    const role = roles.find(r => r.id === u.role);
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
                            <div class="flex items-start gap-3 mb-3">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-tr ${u.active!==false?'from-primary to-secondary':'from-slate-400 to-slate-500'} text-white flex items-center justify-center font-black text-xl">
                                    ${u.name.charAt(0)}
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <p class="font-bold">${Utils.esc(u.name)}</p>
                                        ${u.active === false ? '<span class="badge badge-danger">معطل</span>' : '<span class="badge badge-success">نشط</span>'}
                                    </div>
                                    <p class="text-xs text-slate-500 font-en" dir="ltr">@${u.username}</p>
                                    <span class="badge badge-info mt-1">${Utils.esc(role?.name || u.role)}</span>
                                </div>
                            </div>
                            <div class="flex gap-1">
                                <button onclick="Users.openUserForm(${u.id})" class="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold">
                                    <i class="fa-solid fa-edit"></i> تعديل
                                </button>
                                <button onclick="Users.toggleUser(${u.id})" class="flex-1 py-1.5 ${u.active===false?'bg-green-50 text-green-600 hover:bg-green-100':'bg-amber-50 text-amber-600 hover:bg-amber-100'} rounded-lg text-xs font-bold">
                                    <i class="fa-solid ${u.active===false?'fa-check':'fa-ban'}"></i> ${u.active===false?'تنشيط':'تعطيل'}
                                </button>
                                ${u.username !== 'admin' ? `
                                    <button onclick="Users.deleteUser(${u.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderRoles: function() {
        const container = document.getElementById('users-content');
        const roles = DB.get('roles') || [];
        const users = DB.get('users') || [];

        const allPermissions = [
            { id:'pos', label:'نقطة البيع', icon:'fa-cash-register' },
            { id:'kitchen', label:'المطبخ', icon:'fa-fire-burner' },
            { id:'invoices', label:'الفواتير', icon:'fa-file-invoice' },
            { id:'menu', label:'قائمة الطعام', icon:'fa-book-open' },
            { id:'inventory', label:'المخزون', icon:'fa-boxes-stacked' },
            { id:'purchases', label:'المشتريات', icon:'fa-truck' },
            { id:'customers', label:'العملاء', icon:'fa-users' },
            { id:'suppliers', label:'الموردين', icon:'fa-handshake' },
            { id:'vouchers', label:'السندات', icon:'fa-money-check-dollar' },
            { id:'accounts', label:'كشوف الحسابات', icon:'fa-chart-line' },
            { id:'cashbox', label:'الصناديق', icon:'fa-vault' },
            { id:'reports', label:'التقارير', icon:'fa-chart-pie' },
            { id:'employees', label:'الموظفين', icon:'fa-user-tie' },
            { id:'payroll', label:'الرواتب', icon:'fa-money-bill-wave' },
            { id:'users', label:'المستخدمين', icon:'fa-users-gear' },
            { id:'settings', label:'الإعدادات', icon:'fa-gear' },
            { id:'logs', label:'سجل العمليات', icon:'fa-clock-rotate-left' }
        ];

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex justify-end mb-4">
                <button onclick="Users.openRoleForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> دور جديد
                </button>
            </div>

            <div class="space-y-3">
                ${roles.map(role => {
                    const userCount = users.filter(u => u.role === role.id).length;
                    return `
                        <div class="bg-white rounded-2xl border border-slate-200 p-4">
                            <div class="flex items-start justify-between mb-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-blue-800 text-white flex items-center justify-center">
                                        <i class="fa-solid fa-shield-halved text-lg"></i>
                                    </div>
                                    <div>
                                        <p class="font-bold text-lg">${Utils.esc(role.name)}</p>
                                        <p class="text-xs text-slate-500">${userCount} مستخدم</p>
                                    </div>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick="Users.openRoleForm('${role.id}')" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                                        <i class="fa-solid fa-edit text-xs"></i>
                                    </button>
                                    ${!['admin'].includes(role.id) ? `
                                        <button onclick="Users.deleteRole('${role.id}')" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                            <i class="fa-solid fa-trash text-xs"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-1.5">
                                ${role.permissions.includes('all') 
                                    ? `<span class="badge badge-success"><i class="fa-solid fa-crown"></i> كل الصلاحيات</span>` 
                                    : role.permissions.map(p => {
                                        const perm = allPermissions.find(x => x.id === p);
                                        if (!perm) return '';
                                        return `<span class="badge badge-info"><i class="fa-solid ${perm.icon}"></i> ${perm.label}</span>`;
                                    }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    openUserForm: function(userId = null) {
        const u = userId ? DB.find('users', userId) : null;
        const isEdit = !!u;
        const roles = DB.get('roles') || [];

        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">الاسم الكامل *</label>
                    <input type="text" id="usr-name" value="${u?.name || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">اسم المستخدم *</label>
                        <input type="text" id="usr-username" value="${u?.username || ''}" dir="ltr"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">كلمة المرور ${isEdit?'':'*'}</label>
                        <input type="text" id="usr-password" value="${u?.password || ''}" dir="ltr"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en"
                               placeholder="${isEdit?'اتركها فارغة لعدم التغيير':''}">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">الدور *</label>
                        <select id="usr-role" onchange="Users.onRoleChange()" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            ${roles.map(r => `<option value="${r.id}" ${u?.role===r.id?'selected':''}>${r.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الحالة</label>
                        <select id="usr-active" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="true" ${u?.active!==false?'selected':''}>نشط</option>
                            <option value="false" ${u?.active===false?'selected':''}>معطل</option>
                        </select>
                    </div>
                </div>
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600">
                    <i class="fa-solid fa-info-circle"></i> الصلاحيات تُدار من قِبل الدور المُختار. يمكنك إدارة الأدوار من تبويب "الأدوار والصلاحيات".
                </div>
                <button onclick="Users.saveUser(${userId||'null'})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة المستخدم'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل مستخدم' : 'مستخدم جديد', content, { size: 'max-w-lg' });
    },

    onRoleChange: function() {},

    saveUser: function(userId) {
        const name = document.getElementById('usr-name').value.trim();
        const username = document.getElementById('usr-username').value.trim().toLowerCase();
        const password = document.getElementById('usr-password').value;
        const role = document.getElementById('usr-role').value;
        const active = document.getElementById('usr-active').value === 'true';

        if (!name || !username) { Utils.toast('error', 'يرجى ملء الحقول المطلوبة'); return; }

        const users = DB.get('users') || [];
        
        // Check unique username
        const existing = users.find(u => u.username === username && u.id !== userId);
        if (existing) { Utils.toast('error', 'اسم المستخدم موجود مسبقاً'); return; }

        const roles = DB.get('roles') || [];
        const roleObj = roles.find(r => r.id === role);

        if (userId) {
            const data = { name, username, role, active, permissions: roleObj?.permissions || [] };
            if (password) data.password = password;
            DB.update('users', userId, data);
            DB.log('users', `تعديل مستخدم ${name}`);
            Utils.toast('success', 'تم التحديث');
        } else {
            if (!password) { Utils.toast('error', 'أدخل كلمة المرور'); return; }
            DB.add('users', { name, username, password, role, active, permissions: roleObj?.permissions || [] });
            DB.log('users', `إضافة مستخدم ${name}`);
            Utils.toast('success', 'تمت الإضافة');
        }
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderUsers();
    },

    toggleUser: function(id) {
        const u = DB.find('users', id);
        if (!u) return;
        if (u.username === 'admin') { Utils.toast('error', 'لا يمكن تعطيل المدير الرئيسي'); return; }
        DB.update('users', id, { active: u.active === false });
        Utils.toast('success', 'تم التحديث');
        this.renderUsers();
    },

    deleteUser: function(id) {
        Utils.confirm('حذف المستخدم؟', () => {
            DB.remove('users', id);
            Utils.toast('success', 'تم الحذف');
            this.renderUsers();
        });
    },

    openRoleForm: function(roleId = null) {
        const r = roleId ? DB.find('roles', roleId) : null;
        const isEdit = !!r;
        
        const allPermissions = [
            { id:'pos', label:'نقطة البيع', icon:'fa-cash-register' },
            { id:'kitchen', label:'المطبخ', icon:'fa-fire-burner' },
            { id:'invoices', label:'الفواتير', icon:'fa-file-invoice' },
            { id:'menu', label:'قائمة الطعام', icon:'fa-book-open' },
            { id:'inventory', label:'المخزون', icon:'fa-boxes-stacked' },
            { id:'purchases', label:'المشتريات', icon:'fa-truck' },
            { id:'customers', label:'العملاء', icon:'fa-users' },
            { id:'suppliers', label:'الموردين', icon:'fa-handshake' },
            { id:'vouchers', label:'السندات', icon:'fa-money-check-dollar' },
            { id:'accounts', label:'كشوف الحسابات', icon:'fa-chart-line' },
            { id:'cashbox', label:'الصناديق', icon:'fa-vault' },
            { id:'reports', label:'التقارير', icon:'fa-chart-pie' },
            { id:'employees', label:'الموظفين', icon:'fa-user-tie' },
            { id:'payroll', label:'الرواتب', icon:'fa-money-bill-wave' },
            { id:'users', label:'المستخدمين', icon:'fa-users-gear' },
            { id:'settings', label:'الإعدادات', icon:'fa-gear' },
            { id:'logs', label:'سجل العمليات', icon:'fa-clock-rotate-left' }
        ];

        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">اسم الدور *</label>
                    <input type="text" id="role-name" value="${r?.name || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <div>
                    <label class="block text-sm font-bold mb-2">الصلاحيات</label>
                    <div class="grid grid-cols-2 gap-2">
                        <label class="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg cursor-pointer">
                            <input type="checkbox" id="role-all" onchange="Users.toggleAllPerms(this.checked)" 
                                   ${r?.permissions.includes('all')?'checked':''} class="accent-primary">
                            <span class="font-bold text-sm text-red-700"><i class="fa-solid fa-crown"></i> كل الصلاحيات</span>
                        </label>
                    </div>
                    <div class="grid grid-cols-2 gap-2 mt-2" id="perms-grid">
                        ${allPermissions.map(p => `
                            <label class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                                <input type="checkbox" class="role-perm accent-primary" value="${p.id}" 
                                       ${r?.permissions.includes(p.id)?'checked':''}>
                                <span class="text-sm"><i class="fa-solid ${p.icon} text-slate-400"></i> ${p.label}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <button onclick="Users.saveRole('${roleId||''}')" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة الدور'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل دور' : 'دور جديد', content, { size: 'max-w-2xl' });
    },

    toggleAllPerms: function(checked) {
        document.querySelectorAll('.role-perm').forEach(cb => cb.checked = checked);
    },

    saveRole: function(roleId) {
        const name = document.getElementById('role-name').value.trim();
        if (!name) { Utils.toast('error', 'أدخل اسم الدور'); return; }

        let perms = [];
        if (document.getElementById('role-all').checked) {
            perms = ['all'];
        } else {
            document.querySelectorAll('.role-perm:checked').forEach(cb => perms.push(cb.value));
        }

        if (roleId) {
            DB.update('roles', roleId, { name, permissions: perms });
            // Update users with this role
            const users = DB.get('users') || [];
            users.forEach(u => {
                if (u.role === roleId) DB.update('users', u.id, { permissions: perms });
            });
            Utils.toast('success', 'تم التحديث');
        } else {
            // Generate new id
            const id = 'role_' + Date.now();
            DB.add('roles', { id, name, permissions: perms });
            Utils.toast('success', 'تمت الإضافة');
        }
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderRoles();
    },

    deleteRole: function(roleId) {
        const users = (DB.get('users')||[]).filter(u => u.role === roleId);
        if (users.length > 0) { Utils.toast('error', `لا يمكن الحذف - يوجد ${users.length} مستخدم بهذا الدور`); return; }
        Utils.confirm('حذف الدور؟', () => {
            DB.remove('roles', roleId);
            Utils.toast('success', 'تم الحذف');
            this.renderRoles();
        });
    }
};