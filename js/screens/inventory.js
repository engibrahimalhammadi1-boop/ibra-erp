/**
 * Inventory Screen - المخزون
 */
const Inventory = {
    searchQuery: '',
    filterCategory: 'all',
    showLowOnly: false,

    render: function() {
        const items = DB.get('inventory') || [];
        const lowItems = items.filter(i => i.quantity <= i.minQuantity);
        const totalValue = items.reduce((s,i) => s + (i.quantity * i.cost), 0);

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-boxes-stacked text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${items.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي المواد</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-coins text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(totalValue).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">قيمة المخزون</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-3 shadow-md cursor-pointer" onclick="Inventory.setLowFilter(true)">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-triangle-exclamation text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${lowItems.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">مواد منخفضة</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-layer-group text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${[...new Set(items.map(i=>i.category))].length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">الفئات</p>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="inv-search" placeholder="ابحث عن مادة..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-sm">
                </div>
                <label class="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer">
                    <input type="checkbox" id="inv-low-filter" onchange="Inventory.setLowFilter(this.checked)" ${this.showLowOnly?'checked':''} class="accent-primary">
                    <span class="font-bold">المواد المنخفضة فقط</span>
                </label>
                <button onclick="Inventory.openMovementForm()" class="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-right-left"></i> حركة مخزون
                </button>
                <button onclick="Inventory.openItemForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> مادة جديدة
                </button>
            </div>

            <!-- Items Table -->
            <div id="inv-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderItems();
        const search = document.getElementById('inv-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderItems();
            }, 150);
        }
    },

    setLowFilter: function(val) {
        this.showLowOnly = val;
        const cb = document.getElementById('inv-low-filter');
        if (cb) cb.checked = val;
        this.renderItems();
    },

    renderItems: function() {
        const container = document.getElementById('inv-container');
        if (!container) return;

        let items = DB.get('inventory') || [];
        
        if (this.searchQuery) {
            items = items.filter(i => i.name.toLowerCase().includes(this.searchQuery));
        }
        if (this.showLowOnly) {
            items = items.filter(i => i.quantity <= i.minQuantity);
        }

        if (items.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-boxes-stacked text-5xl mb-3"></i>
                <p>لا توجد مواد</p>
            </div>`;
            return;
        }

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>المادة</th>
                                <th>الفئة</th>
                                <th>الكمية</th>
                                <th>الحد الأدنى</th>
                                <th>الوحدة</th>
                                <th>تكلفة الوحدة</th>
                                <th>القيمة</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => {
                                const isLow = item.quantity <= item.minQuantity;
                                const isEmpty = item.quantity <= 0;
                                return `
                                    <tr>
                                        <td>
                                            <div class="flex items-center gap-2">
                                                <div class="w-8 h-8 rounded-lg ${isLow?'bg-red-100 text-red-600':'bg-blue-100 text-blue-600'} flex items-center justify-center">
                                                    <i class="fa-solid fa-box"></i>
                                                </div>
                                                <p class="font-bold">${Utils.esc(item.name)}</p>
                                            </div>
                                        </td>
                                        <td><span class="badge badge-gray">${Utils.esc(item.category||'-')}</span></td>
                                        <td>
                                            <span class="font-black text-lg ${isEmpty?'text-red-600':isLow?'text-amber-600':'text-slate-800'}">
                                                ${item.quantity}
                                            </span>
                                            <span class="text-xs text-slate-400">${item.unit}</span>
                                        </td>
                                        <td>${item.minQuantity} ${item.unit}</td>
                                        <td>${item.unit}</td>
                                        <td>${Utils.formatCurrency(item.cost)}</td>
                                        <td class="font-bold">${Utils.formatCurrency(item.quantity * item.cost)}</td>
                                        <td>
                                            ${isEmpty ? '<span class="badge badge-danger">نفذ</span>' : 
                                              isLow ? '<span class="badge badge-warning">منخفض</span>' : 
                                              '<span class="badge badge-success">متوفر</span>'}
                                        </td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button onclick="Inventory.openMovementForm(${item.id})" class="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center" title="حركة">
                                                    <i class="fa-solid fa-right-left text-xs"></i>
                                                </button>
                                                <button onclick="Inventory.openItemForm(${item.id})" class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <i class="fa-solid fa-edit text-xs"></i>
                                                </button>
                                                <button onclick="Inventory.deleteItem(${item.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
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
    },

    openItemForm: function(itemId = null) {
        const item = itemId ? DB.find('inventory', itemId) : null;
        const isEdit = !!item;
        const units = ['kg', 'g', 'ltr', 'ml', 'قطعة', 'علبة', 'كرتون', 'كيس'];

        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">اسم المادة *</label>
                    <input type="text" id="inv-name" value="${item?.name || ''}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">الفئة</label>
                        <input type="text" id="inv-category" value="${item?.category || ''}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الوحدة</label>
                        <select id="inv-unit" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            ${units.map(u => `<option value="${u}" ${item?.unit===u?'selected':''}>${u}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">الكمية</label>
                        <input type="number" id="inv-qty" value="${item?.quantity || 0}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الحد الأدنى</label>
                        <input type="number" id="inv-min" value="${item?.minQuantity || 5}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">تكلفة الوحدة</label>
                        <input type="number" id="inv-cost" value="${item?.cost || 0}" step="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>
                <button onclick="Inventory.saveItem(${itemId||'null'})" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    ${isEdit ? 'حفظ التعديلات' : 'إضافة المادة'}
                </button>
            </div>
        `;
        Utils.modal(isEdit ? 'تعديل مادة' : 'إضافة مادة جديدة', content, { size: 'max-w-lg' });
    },

    saveItem: function(itemId) {
        const name = document.getElementById('inv-name').value.trim();
        const category = document.getElementById('inv-category').value.trim();
        const unit = document.getElementById('inv-unit').value;
        const quantity = parseFloat(document.getElementById('inv-qty').value) || 0;
        const minQuantity = parseFloat(document.getElementById('inv-min').value) || 0;
        const cost = parseFloat(document.getElementById('inv-cost').value) || 0;

        if (!name) { Utils.toast('error', 'أدخل اسم المادة'); return; }

        const data = { name, category, unit, quantity, minQuantity, cost };

        if (itemId) {
            DB.update('inventory', itemId, data);
            DB.log('inventory', `تعديل مادة ${name}`);
            Utils.toast('success', 'تم تحديث المادة');
        } else {
            DB.add('inventory', data);
            DB.log('inventory', `إضافة مادة ${name}`);
            Utils.toast('success', 'تمت إضافة المادة');
        }
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderItems();
    },

    deleteItem: function(itemId) {
        Utils.confirm('حذف المادة؟', () => {
            DB.remove('inventory', itemId);
            Utils.toast('success', 'تم الحذف');
            this.renderItems();
        });
    },

    openMovementForm: function(itemId = null) {
        const inventory = DB.get('inventory') || [];
        if (inventory.length === 0) {
            Utils.toast('error', 'أضف مواد أولاً');
            return;
        }

        const content = `
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold mb-1">المادة *</label>
                    <select id="mov-item" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        ${inventory.map(i => `<option value="${i.id}" ${itemId===i.id?'selected':''}>${i.name} (${i.quantity} ${i.unit})</option>`).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">نوع الحركة</label>
                        <select id="mov-type" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="in">إضافة (وارد)</option>
                            <option value="out">صرف (صادر)</option>
                            <option value="adjust">تسوية</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الكمية *</label>
                        <input type="number" id="mov-qty" value="1" step="0.01" min="0.01"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">السبب / ملاحظات</label>
                    <input type="text" id="mov-notes" placeholder="مثال: تلف، استلام من مورد، جرد..." 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>
                <button onclick="Inventory.saveMovement()" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ الحركة
                </button>
            </div>
        `;
        Utils.modal('حركة مخزون', content, { size: 'max-w-md' });
    },

    saveMovement: function() {
        const itemId = parseInt(document.getElementById('mov-item').value);
        const type = document.getElementById('mov-type').value;
        const qty = parseFloat(document.getElementById('mov-qty').value) || 0;
        const notes = document.getElementById('mov-notes').value.trim();
        
        const item = DB.find('inventory', itemId);
        if (!item) return;
        if (qty <= 0) { Utils.toast('error', 'أدخل كمية صحيحة'); return; }

        let newQty = item.quantity;
        if (type === 'in') newQty += qty;
        else if (type === 'out') newQty -= qty;
        else newQty = qty;

        DB.update('inventory', itemId, { quantity: newQty });
        DB.log('inventory', `${type === 'in' ? 'إضافة' : type === 'out' ? 'صرف' : 'تسوية'} ${qty} ${item.unit} من ${item.name}`);
        Utils.toast('success', 'تم حفظ الحركة');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderItems();
    }
};