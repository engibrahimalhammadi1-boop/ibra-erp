/**
 * Menu Screen - قائمة الطعام
 */
const MenuScreen = {
    view: 'grid', // grid, list
    filterCategory: 'all',
    searchQuery: '',

    render: function() {
        const categories = DB.get('categories') || [];
        const items = DB.get('menuItems') || [];
        const sys = DB.get('system');

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-utensils text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${items.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي الأصناف</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-check-circle text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${items.filter(i=>i.active!==false).length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">أصناف نشطة</p>
                </div>
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-layer-group text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${categories.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">الفئات</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-chart-line text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(items.reduce((s,i)=>s+(i.price||0),0)/Math.max(items.length,1)).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">متوسط السعر</p>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="menu-search" placeholder="ابحث عن صنف..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm">
                </div>
                <select onchange="MenuScreen.setCategory(this.value)" id="menu-filter-cat"
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary">
                    <option value="all">كل الفئات</option>
                    ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    <button onclick="MenuScreen.setView('grid')" data-v="grid" class="menu-view-btn w-9 h-9 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-grip"></i>
                    </button>
                    <button onclick="MenuScreen.setView('list')" data-v="list" class="menu-view-btn w-9 h-9 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-list"></i>
                    </button>
                </div>
                <button onclick="MenuScreen.openCategoryManager()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-layer-group"></i> الفئات
                </button>
                <button onclick="MenuScreen.openItemForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition-colors">
                    <i class="fa-solid fa-plus"></i> صنف جديد
                </button>
            </div>

            <!-- Items Container -->
            <div id="menu-items-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderItems();
        this.updateViewButtons();
        
        const search = document.getElementById('menu-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderItems();
            }, 150);
        }
    },

    setCategory: function(cat) {
        this.filterCategory = cat;
        this.renderItems();
    },

    setView: function(v) {
        this.view = v;
        this.updateViewButtons();
        this.renderItems();
    },

    updateViewButtons: function() {
        document.querySelectorAll('.menu-view-btn').forEach(b => {
            const isActive = b.dataset.v === this.view;
            b.className = `menu-view-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-white'
            }`;
        });
    },

    renderItems: function() {
        const container = document.getElementById('menu-items-container');
        if (!container) return;

        let items = DB.get('menuItems') || [];
        const categories = DB.get('categories') || [];
        const sys = DB.get('system');

        if (this.filterCategory !== 'all') {
            items = items.filter(i => i.categoryId === parseInt(this.filterCategory));
        }
        if (this.searchQuery) {
            items = items.filter(i => 
                i.name.toLowerCase().includes(this.searchQuery) || 
                (i.nameEn || '').toLowerCase().includes(this.searchQuery)
            );
        }

        if (items.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-utensils text-5xl mb-3"></i>
                <p>لا توجد أصناف</p>
                <button onclick="MenuScreen.openItemForm()" class="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> إضافة صنف
                </button>
            </div>`;
            return;
        }

        if (this.view === 'grid') {
            container.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    ${items.map(item => {
                        const cat = categories.find(c => c.id === item.categoryId);
                        const profit = item.cost > 0 ? ((item.price - item.cost) / item.price * 100).toFixed(0) : 0;
                        return `
                            <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">
                                <div class="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative" 
                                     style="color: ${cat ? cat.color : '#1e3a8a'}">
                                    <i class="fa-solid ${cat ? cat.icon : 'fa-utensils'} text-6xl opacity-40"></i>
                                    ${item.active === false ? `<span class="absolute top-2 right-2 badge badge-danger">معطل</span>` : ''}
                                    ${item.cost && profit > 0 ? `<span class="absolute top-2 left-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                                        +${profit}%
                                    </span>` : ''}
                                </div>
                                <div class="p-3">
                                    <h4 class="font-bold text-sm text-slate-800 line-clamp-1">${Utils.esc(item.name)}</h4>
                                    <p class="text-xs text-slate-400 line-clamp-1 font-en">${Utils.esc(item.nameEn || '')}</p>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="font-black text-primary">${item.price.toLocaleString()}</span>
                                        <span class="text-xs text-slate-400">${item.prepTime || 10} د</span>
                                    </div>
                                    <div class="flex gap-1 mt-3">
                                        <button onclick="MenuScreen.openItemForm(${item.id})" class="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold">
                                            <i class="fa-solid fa-edit"></i> تعديل
                                        </button>
                                        <button onclick="MenuScreen.toggleItem(${item.id})" class="px-2 py-1.5 ${item.active === false ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'} rounded-lg text-xs font-bold" title="${item.active === false ? 'تنشيط' : 'تعطيل'}">
                                            <i class="fa-solid ${item.active === false ? 'fa-check' : 'fa-ban'}"></i>
                                        </button>
                                        <button onclick="MenuScreen.deleteItem(${item.id})" class="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>الصنف</th>
                                    <th>الفئة</th>
                                    <th>سعر البيع</th>
                                    <th>التكلفة</th>
                                    <th>الربح</th>
                                    <th>التحضير</th>
                                    <th>الحالة</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => {
                                    const cat = categories.find(c => c.id === item.categoryId);
                                    const profit = item.cost > 0 ? ((item.price - item.cost)).toFixed(0) : 0;
                                    return `
                                        <tr>
                                            <td>
                                                <div class="flex items-center gap-2">
                                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" 
                                                         style="background:${cat?.color||'#1e3a8a'}20;color:${cat?.color||'#1e3a8a'}">
                                                        <i class="fa-solid ${cat?.icon||'fa-utensils'}"></i>
                                                    </div>
                                                    <div>
                                                        <p class="font-bold">${Utils.esc(item.name)}</p>
                                                        <p class="text-xs text-slate-400 font-en">${Utils.esc(item.nameEn||'')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span class="badge badge-info">${cat?.name||'-'}</span></td>
                                            <td class="font-bold">${Utils.formatCurrency(item.price)}</td>
                                            <td class="text-slate-600">${Utils.formatCurrency(item.cost||0)}</td>
                                            <td class="${profit>0?'text-green-600':'text-slate-400'} font-bold">${profit>0?'+':''}${Utils.formatCurrency(profit)}</td>
                                            <td>${item.prepTime||10} د</td>
                                            <td>${item.active === false 
                                                ? '<span class="badge badge-danger">معطل</span>' 
                                                : '<span class="badge badge-success">نشط</span>'}</td>
                                            <td>
                                                <div class="flex gap-1">
                                                    <button onclick="MenuScreen.openItemForm(${item.id})" class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center">
                                                        <i class="fa-solid fa-edit text-xs"></i>
                                                    </button>
                                                    <button onclick="MenuScreen.deleteItem(${item.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
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
        }
    },

    openItemForm: function(itemId = null) {
        const item = itemId ? DB.find('menuItems', itemId) : null;
        const isEdit = !!item;
        const categories = DB.get('categories') || [];
        const inventory = DB.get('inventory') || [];

        const content = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-2 md:col-span-1">
                        <label class="block text-sm font-bold mb-1">اسم الصنف (عربي) *</label>
                        <input type="text" id="item-name" value="${item?.name || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div class="col-span-2 md:col-span-1">
                        <label class="block text-sm font-bold mb-1">اسم الصنف (إنجليزي)</label>
                        <input type="text" id="item-nameEn" value="${item?.nameEn || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">سعر البيع *</label>
                        <input type="number" id="item-price" value="${item?.price || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">التكلفة</label>
                        <input type="number" id="item-cost" value="${item?.cost || 0}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">وقت التحضير (د)</label>
                        <input type="number" id="item-prepTime" value="${item?.prepTime || 10}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">الفئة *</label>
                        <select id="item-category" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="">اختر فئة</option>
                            ${categories.map(c => `<option value="${c.id}" ${item?.categoryId===c.id?'selected':''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الحالة</label>
                        <select id="item-active" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="true" ${item?.active!==false?'selected':''}>نشط</option>
                            <option value="false" ${item?.active===false?'selected':''}>معطل</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold mb-1">رابط الصورة (URL)</label>
                    <input type="url" id="item-image" value="${item?.image || ''}" placeholder="https://..."
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en text-sm">
                </div>

                <div>
                    <label class="block text-sm font-bold mb-1">الوصف</label>
                    <textarea id="item-desc" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">${item?.description || ''}</textarea>
                </div>

                <button onclick="MenuScreen.saveItem(${itemId||'null'})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة الصنف'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل صنف' : 'إضافة صنف جديد', content, { size: 'max-w-2xl' });
    },

    saveItem: function(itemId) {
        const name = document.getElementById('item-name').value.trim();
        const nameEn = document.getElementById('item-nameEn').value.trim();
        const price = parseFloat(document.getElementById('item-price').value);
        const cost = parseFloat(document.getElementById('item-cost').value) || 0;
        const prepTime = parseInt(document.getElementById('item-prepTime').value) || 10;
        const categoryId = parseInt(document.getElementById('item-category').value);
        const active = document.getElementById('item-active').value === 'true';
        const image = document.getElementById('item-image').value.trim();
        const description = document.getElementById('item-desc').value.trim();

        if (!name || !price || !categoryId) {
            Utils.toast('error', 'يرجى ملء الحقول المطلوبة');
            return;
        }

        const data = { name, nameEn, price, cost, prepTime, categoryId, active, image, description };

        if (itemId) {
            DB.update('menuItems', itemId, data);
            DB.log('menu', `تعديل صنف ${name}`);
            Utils.toast('success', 'تم تحديث الصنف');
        } else {
            DB.add('menuItems', data);
            DB.log('menu', `إضافة صنف ${name}`);
            Utils.toast('success', 'تمت إضافة الصنف');
        }

        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderItems();
        Router.navigate('menu');
    },

    toggleItem: function(itemId) {
        const item = DB.find('menuItems', itemId);
        if (!item) return;
        DB.update('menuItems', itemId, { active: item.active === false });
        Utils.toast('success', 'تم تحديث الحالة');
        this.renderItems();
    },

    deleteItem: function(itemId) {
        Utils.confirm('هل تريد حذف هذا الصنف؟', () => {
            const item = DB.find('menuItems', itemId);
            DB.remove('menuItems', itemId);
            DB.log('menu', `حذف صنف ${item?.name}`);
            Utils.toast('success', 'تم حذف الصنف');
            this.renderItems();
        });
    },

    openCategoryManager: function() {
        const categories = DB.get('categories') || [];
        const items = DB.get('menuItems') || [];
        
        const content = `
            <div class="space-y-3">
                <div class="flex gap-2">
                    <input type="text" id="new-cat-name" placeholder="اسم الفئة الجديدة" 
                           class="flex-1 px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    <input type="text" id="new-cat-icon" placeholder="fa-utensils" value="fa-utensils"
                           class="w-32 px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en text-sm">
                    <input type="color" id="new-cat-color" value="#1e3a8a" class="w-12 h-10 rounded-xl border border-slate-200">
                    <button onclick="MenuScreen.addCategory()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold text-sm">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div class="space-y-2">
                    ${categories.map(c => {
                        const count = items.filter(i => i.categoryId === c.id).length;
                        return `
                            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white" style="background:${c.color}">
                                    <i class="fa-solid ${c.icon}"></i>
                                </div>
                                <div class="flex-1">
                                    <p class="font-bold">${Utils.esc(c.name)}</p>
                                    <p class="text-xs text-slate-500">${count} صنف</p>
                                </div>
                                <button onclick="MenuScreen.editCategory(${c.id})" class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <i class="fa-solid fa-edit text-xs"></i>
                                </button>
                                <button onclick="MenuScreen.deleteCategory(${c.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        window._catModal = Utils.modal('إدارة الفئات', content, { size: 'max-w-lg' });
    },

    addCategory: function() {
        const name = document.getElementById('new-cat-name').value.trim();
        const icon = document.getElementById('new-cat-icon').value.trim() || 'fa-utensils';
        const color = document.getElementById('new-cat-color').value;
        if (!name) { Utils.toast('error', 'أدخل اسم الفئة'); return; }
        
        DB.add('categories', { name, icon, color });
        DB.log('menu', `إضافة فئة ${name}`);
        Utils.toast('success', 'تمت إضافة الفئة');
        document.getElementById(window._catModal)?.remove();
        this.openCategoryManager();
        this.renderItems();
    },

    editCategory: function(catId) {
        const cat = DB.find('categories', catId);
        if (!cat) return;
        const name = prompt('اسم الفئة:', cat.name);
        if (!name) return;
        DB.update('categories', catId, { name });
        Utils.toast('success', 'تم التحديث');
        document.getElementById(window._catModal)?.remove();
        this.openCategoryManager();
    },

    deleteCategory: function(catId) {
        const items = (DB.get('menuItems') || []).filter(i => i.categoryId === catId);
        if (items.length > 0) {
            Utils.toast('error', `لا يمكن حذف الفئة - تحتوي على ${items.length} صنف`);
            return;
        }
        Utils.confirm('حذف الفئة؟', () => {
            DB.remove('categories', catId);
            document.getElementById(window._catModal)?.remove();
            this.openCategoryManager();
            Utils.toast('success', 'تم الحذف');
        });
    }
};