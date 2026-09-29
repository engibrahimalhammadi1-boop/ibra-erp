/**
 * POS Screen - نقطة البيع
 */
const POS = {
    cart: [],
    selectedCategory: 'all',
    searchQuery: '',
    selectedTable: null,
    orderType: 'dine-in',
    customerId: 1,
    discount: 0,
    notes: '',
    heldOrders: [],
    clockInterval: null,
    cartVisible: false,

    render: function(params = {}) {
        const categories = DB.get('categories') || [];
        const sys = DB.get('system');

        return `
        <div class="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 relative">
            
            <div class="flex-1 flex flex-col gap-3 min-h-0">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                    <div class="flex-1 relative">
                        <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" id="pos-search" placeholder="ابحث عن صنف بالاسم أو الباركود..." 
                               class="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none text-sm">
                    </div>
                    <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">
                        <button onclick="POS.setOrderType('dine-in')" data-type="dine-in" 
                                class="pos-type-btn px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                            <i class="fa-solid fa-utensils"></i> محلي
                        </button>
                        <button onclick="POS.setOrderType('takeaway')" data-type="takeaway"
                                class="pos-type-btn px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                            <i class="fa-solid fa-bag-shopping"></i> سفري
                        </button>
                        <button onclick="POS.setOrderType('delivery')" data-type="delivery"
                                class="pos-type-btn px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1">
                            <i class="fa-solid fa-motorcycle"></i> توصيل
                        </button>
                    </div>
                    <div id="table-selector-wrap" class="relative">
                        <button onclick="POS.openTableSelector()" class="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-chair text-slate-500"></i>
                            <span id="selected-table-label" class="font-bold">اختر طاولة</span>
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 overflow-x-auto">
                    <div class="flex gap-2 min-w-max">
                        <button onclick="POS.filterCategory('all')" 
                                class="pos-cat-btn px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2"
                                data-cat="all">
                            <i class="fa-solid fa-border-all"></i> الكل
                        </button>
                        ${categories.map(c => `
                            <button onclick="POS.filterCategory(${c.id})" 
                                    class="pos-cat-btn px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2"
                                    data-cat="${c.id}">
                                <i class="fa-solid ${c.icon}" style="color:${c.color}"></i>
                                ${c.name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                    <div id="pos-products" class="pos-menu-grid"></div>
                </div>
            </div>

            <button onclick="POS.toggleCart()" id="cart-toggle-btn"
                    class="lg:hidden fixed bottom-4 left-4 right-4 z-30 py-3 px-4 bg-gradient-to-r from-secondary to-amber-500 hover:from-amber-500 hover:to-secondary text-white rounded-xl shadow-2xl font-bold text-base flex items-center justify-between transition-all">
                <span class="flex items-center gap-2">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span>السلة (<span id="cart-item-count">0</span>)</span>
                </span>
                <span class="flex items-center gap-2">
                    <span id="cart-total-preview">0</span>
                    <span class="text-xs opacity-90">اضغط للعرض</span>
                </span>
            </button>

            <div id="pos-cart-panel" 
                 class="fixed lg:relative inset-y-0 right-0 w-full sm:w-96 lg:w-96 bg-white lg:rounded-2xl shadow-2xl lg:shadow-lg border border-slate-200 overflow-hidden z-40 flex flex-col
                        translate-x-full lg:translate-x-0 transition-transform duration-300">
                
                <div class="p-4 bg-gradient-to-r from-primary to-blue-800 text-white flex-shrink-0">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="font-bold flex items-center gap-2">
                            <i class="fa-solid fa-cart-shopping"></i> سلة الطلب
                        </h3>
                        <div class="flex items-center gap-2">
                            <button onclick="POS.clearCart()" class="text-white/80 hover:text-white text-sm" title="مسح السلة">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                            <button onclick="POS.toggleCart()" class="lg:hidden w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" title="إغلاق">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 text-xs">
                        <div class="flex items-center gap-1">
                            <i class="fa-solid fa-receipt"></i>
                            <span id="pos-order-num">طلب جديد</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <i class="fa-solid fa-clock"></i>
                            <span id="pos-clock">${Utils.formatTime(new Date())}</span>
                        </div>
                    </div>
                </div>

                <div class="p-3 border-b border-slate-200 bg-slate-50 space-y-2 flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-user text-slate-400 text-sm"></i>
                        <select id="pos-customer" class="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-primary">
                            ${(DB.get('customers')||[]).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div id="pos-table-info" class="hidden flex items-center gap-2 text-sm">
                        <i class="fa-solid fa-chair text-primary"></i>
                        <span class="font-bold">طاولة: <span id="pos-table-num">-</span></span>
                    </div>
                </div>

                <div id="pos-cart-items" class="flex-1 overflow-y-auto p-3 space-y-2"></div>

                <div class="border-t border-slate-200 bg-slate-50 p-3 space-y-2 flex-shrink-0">
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-600">المجموع الفرعي</span>
                        <span class="font-bold" id="pos-subtotal">0</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-slate-600">الخصم</span>
                        <div class="flex-1 flex items-center gap-1">
                            <input type="number" id="pos-discount" value="0" min="0" 
                                   class="flex-1 px-2 py-1 border border-slate-200 rounded text-sm text-center outline-none focus:border-primary"
                                   oninput="POS.updateDiscount(this.value)">
                            <span class="text-xs text-slate-500">${sys.currency}</span>
                        </div>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-600">الضريبة (${(sys.taxRate*100).toFixed(0)}%)</span>
                        <span class="font-bold" id="pos-tax">0</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-600">الخدمة (${(sys.serviceCharge*100).toFixed(0)}%)</span>
                        <span class="font-bold" id="pos-service">0</span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span class="font-bold text-lg">الإجمالي</span>
                        <span class="font-black text-2xl text-primary" id="pos-total">0</span>
                    </div>
                </div>

                <div class="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-2 flex-shrink-0">
                    <button onclick="POS.holdOrder()" class="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1">
                        <i class="fa-solid fa-pause"></i> تعليق
                    </button>
                    <button onclick="POS.openHeldOrders()" class="py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1 relative">
                        <i class="fa-solid fa-list"></i> المعلقة
                        <span id="pos-held-count" class="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">0</span>
                    </button>
                    <button onclick="POS.sendToKitchen()" class="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1">
                        <i class="fa-solid fa-fire-burner"></i> إرسال للمطبخ
                    </button>
                    <button onclick="POS.openCheckout()" class="py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1">
                        <i class="fa-solid fa-credit-card"></i> دفع
                    </button>
                </div>
            </div>

            <div id="pos-cart-overlay" onclick="POS.toggleCart()"
                 class="hidden lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderProducts();
        this.renderCart();
        this.updateTypeButtons();
        this.updateHeldCount();
        
        // ✅ إخفاء السلة افتراضيًا على الجوال
        const panel = document.getElementById('pos-cart-panel');
        if (panel) {
            panel.classList.add('translate-x-full');
            panel.classList.remove('translate-x-0');
        }
        
        const search = document.getElementById('pos-search');
        if (search) {
            search.focus();
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderProducts();
            }, 150);
            
            search.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    const q = search.value.trim();
                    if (q) {
                        const item = (DB.get('menuItems')||[]).find(i => (i.nameEn||'').toLowerCase() === q.toLowerCase() || i.name === q);
                        if (item) {
                            this.addToCart(item.id);
                            search.value = '';
                            this.searchQuery = '';
                            this.renderProducts();
                        }
                    }
                }
            };
        }

        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(() => {
            const el = document.getElementById('pos-clock');
            if (el) el.textContent = Utils.formatTime(new Date());
            else clearInterval(this.clockInterval);
        }, 1000);
    },

    // ✅ دالة جديدة: إظهار/إخفاء السلة
    toggleCart: function() {
        const panel = document.getElementById('pos-cart-panel');
        const overlay = document.getElementById('pos-cart-overlay');
        if (!panel) return;
        
        this.cartVisible = !this.cartVisible;
        
        if (this.cartVisible) {
            panel.classList.remove('translate-x-full');
            panel.classList.add('translate-x-0');
            if (overlay) overlay.classList.remove('hidden');
        } else {
            panel.classList.add('translate-x-full');
            panel.classList.remove('translate-x-0');
            if (overlay) overlay.classList.add('hidden');
        }
    },

    renderProducts: function() {
        const container = document.getElementById('pos-products');
        if (!container) return;

        let items = DB.get('menuItems') || [];
        
        if (this.selectedCategory !== 'all') {
            items = items.filter(i => i.categoryId === parseInt(this.selectedCategory));
        }
        
        if (this.searchQuery) {
            items = items.filter(i => 
                i.name.toLowerCase().includes(this.searchQuery) || 
                (i.nameEn || '').toLowerCase().includes(this.searchQuery)
            );
        }
        
        items = items.filter(i => i.active !== false);

        if (items.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400">
                <i class="fa-solid fa-search text-4xl mb-3"></i>
                <p>لا توجد أصناف مطابقة</p>
            </div>`;
            return;
        }

        const categories = DB.get('categories') || [];

        container.innerHTML = items.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            return `
                <div onclick="POS.addToCart(${item.id})" 
                     class="product-card bg-white border border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center gap-2 hover:border-primary hover:shadow-lg relative overflow-hidden">
                    <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl" 
                         style="color: ${cat ? cat.color : '#1e3a8a'}">
                        <i class="fa-solid ${cat ? cat.icon : 'fa-utensils'}"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm text-slate-800 line-clamp-2">${Utils.esc(item.name)}</h4>
                    </div>
                    <div class="w-full flex items-center justify-between">
                        <span class="text-xs text-slate-500">${item.prepTime || 10} د</span>
                        <span class="font-black text-primary text-sm">${item.price.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterCategory: function(catId) {
        this.selectedCategory = catId;
        document.querySelectorAll('.pos-cat-btn').forEach(b => {
            const isActive = String(b.dataset.cat) === String(catId);
            b.className = `pos-cat-btn px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive ? 'bg-primary text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`;
        });
        this.renderProducts();
    },

    setOrderType: function(type) {
        this.orderType = type;
        this.updateTypeButtons();
        
        const tableWrap = document.getElementById('table-selector-wrap');
        const tableInfo = document.getElementById('pos-table-info');
        if (type === 'dine-in') {
            if (tableWrap) tableWrap.classList.remove('hidden');
            if (tableInfo && this.selectedTable) tableInfo.classList.remove('hidden');
        } else {
            if (tableWrap) tableWrap.classList.add('hidden');
            if (tableInfo) tableInfo.classList.add('hidden');
            this.selectedTable = null;
        }
    },

    updateTypeButtons: function() {
        document.querySelectorAll('.pos-type-btn').forEach(b => {
            const isActive = b.dataset.type === this.orderType;
            b.className = `pos-type-btn px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                isActive ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-white'
            }`;
        });
    },

    openTableSelector: function() {
        const tables = DB.get('tables') || [];
        const content = `
            <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
                ${tables.map(t => {
                    const colors = {
                        available: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
                        occupied: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
                        reserved: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
                        cleaning: 'bg-slate-100 border-slate-200 text-slate-700'
                    };
                    const disabled = t.status === 'occupied' ? 'opacity-50 cursor-not-allowed' : '';
                    return `
                        <button onclick="POS.selectTable(${t.id})" ${t.status==='occupied'?'disabled':''}
                                class="p-3 rounded-xl border-2 ${colors[t.status]} ${disabled} transition-all text-center">
                            <i class="fa-solid fa-chair text-2xl mb-1"></i>
                            <p class="font-bold text-sm">${t.name}</p>
                            <p class="text-xs opacity-70">${t.capacity} أشخاص</p>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        const modalId = Utils.modal('اختر طاولة', content, { size: 'max-w-2xl' });
        window._posTableModal = modalId;
    },

    selectTable: function(tableId) {
        const table = DB.find('tables', tableId);
        if (!table) return;
        this.selectedTable = tableId;
        
        const label = document.getElementById('selected-table-label');
        if (label) label.textContent = table.name;
        
        const tableNum = document.getElementById('pos-table-num');
        if (tableNum) tableNum.textContent = table.name;
        
        const tableInfo = document.getElementById('pos-table-info');
        if (tableInfo) tableInfo.classList.remove('hidden');
        
        if (window._posTableModal) {
            document.getElementById(window._posTableModal)?.remove();
        }
    },

    addToCart: function(itemId) {
        const item = DB.find('menuItems', itemId);
        if (!item) return;

        const existing = this.cart.find(c => c.itemId === itemId);
        if (existing) {
            existing.quantity++;
            existing.total = existing.quantity * existing.price;
        } else {
            this.cart.push({
                itemId: item.id,
                name: item.name,
                price: item.price,
                cost: item.cost || 0,
                quantity: 1,
                total: item.price,
                notes: ''
            });
        }
        
        this.renderCart();
        if (DB.get('settings')?.pos?.soundEnabled !== false) Utils.beep();
    },

    removeFromCart: function(itemId) {
        this.cart = this.cart.filter(c => c.itemId !== itemId);
        this.renderCart();
    },

    updateQuantity: function(itemId, delta) {
        const item = this.cart.find(c => c.itemId === itemId);
        if (!item) return;
        
        item.quantity += delta;
        if (item.quantity <= 0) {
            this.removeFromCart(itemId);
            return;
        }
        item.total = item.quantity * item.price;
        this.renderCart();
    },

    setQuantity: function(itemId, qty) {
        const item = this.cart.find(c => c.itemId === itemId);
        if (!item) return;
        qty = parseInt(qty) || 1;
        if (qty <= 0) { this.removeFromCart(itemId); return; }
        item.quantity = qty;
        item.total = item.quantity * item.price;
        this.renderCart();
    },

    setItemNotes: function(itemId) {
        const item = this.cart.find(c => c.itemId === itemId);
        if (!item) return;
        const modalId = Utils.modal('ملاحظات الصنف', `
            <p class="text-sm text-slate-600 mb-3">الصنف: <strong>${Utils.esc(item.name)}</strong></p>
            <textarea id="item-notes-input" class="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-primary outline-none" rows="3" placeholder="مثال: بدون بصل...">${item.notes || ''}</textarea>
            <div class="flex gap-2 mt-4 flex-wrap">
                ${['بدون ملح','بدون بصل','حار','إضافة جبنة','سريع'].map(n => 
                    `<button onclick="document.getElementById('item-notes-input').value += '${n}, '" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">${n}</button>`
                ).join('')}
            </div>
            <button onclick="POS.saveItemNotes(${itemId}, '${modalId}')" class="w-full mt-4 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                حفظ
            </button>
        `, { size: 'max-w-md' });
    },

    saveItemNotes: function(itemId, modalId) {
        const input = document.getElementById('item-notes-input');
        const item = this.cart.find(c => c.itemId === itemId);
        if (item) item.notes = input.value.trim();
        document.getElementById(modalId)?.remove();
        this.renderCart();
    },

    renderCart: function() {
        const container = document.getElementById('pos-cart-items');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 text-slate-300">
                    <i class="fa-solid fa-cart-shopping text-5xl mb-3"></i>
                    <p class="text-slate-400 text-sm">السلة فارغة</p>
                </div>
            `;
        } else {
            container.innerHTML = this.cart.map(item => `
                <div class="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-bold text-sm truncate">${Utils.esc(item.name)}</h4>
                            ${item.notes ? `<p class="text-xs text-amber-600 mt-0.5"><i class="fa-solid fa-note-sticky"></i> ${Utils.esc(item.notes)}</p>` : ''}
                            <p class="text-xs text-slate-500 mt-0.5">${item.price.toLocaleString()} × ${item.quantity}</p>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <span class="font-black text-primary text-sm">${item.total.toLocaleString()}</span>
                            <div class="flex items-center gap-1">
                                <button onclick="POS.updateQuantity(${item.itemId}, -1)" class="w-6 h-6 rounded bg-white border border-slate-200 hover:bg-red-50 text-slate-600 flex items-center justify-center">
                                    <i class="fa-solid fa-minus text-xs"></i>
                                </button>
                                <input type="number" value="${item.quantity}" min="1" 
                                       onchange="POS.setQuantity(${item.itemId}, this.value)"
                                       class="w-10 h-6 text-center text-xs border border-slate-200 rounded outline-none focus:border-primary">
                                <button onclick="POS.updateQuantity(${item.itemId}, 1)" class="w-6 h-6 rounded bg-white border border-slate-200 hover:bg-green-50 text-slate-600 flex items-center justify-center">
                                    <i class="fa-solid fa-plus text-xs"></i>
                                </button>
                            </div>
                            <div class="flex gap-1">
                                <button onclick="POS.setItemNotes(${item.itemId})" class="text-slate-400 hover:text-primary text-xs" title="ملاحظات">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button onclick="POS.removeFromCart(${item.itemId})" class="text-slate-400 hover:text-red-500 text-xs" title="حذف">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // تحديث عدّاد السلة والإجمالي في الزر العائم
        const countEl = document.getElementById('cart-item-count');
        const totalEl = document.getElementById('cart-total-preview');
        const sys = DB.get('system') || {};
        
        if (countEl) {
            const count = this.cart.reduce((s, i) => s + i.quantity, 0);
            countEl.textContent = count;
        }
        if (totalEl) {
            const total = this.cart.reduce((s, i) => s + i.total, 0);
            totalEl.textContent = `${total.toLocaleString()} ${sys.currency || ''}`;
        }

        this.updateTotals();
    },

    updateDiscount: function(val) {
        this.discount = parseFloat(val) || 0;
        this.updateTotals();
    },

    updateTotals: function() {
        const sys = DB.get('system');
        const totals = Utils.calculateCart(this.cart, {
            discount: this.discount,
            taxRate: sys.taxRate,
            serviceRate: this.orderType === 'dine-in' ? sys.serviceCharge : 0
        });

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = Utils.formatCurrency(val); };
        set('pos-subtotal', totals.subtotal);
        set('pos-tax', totals.tax);
        set('pos-service', totals.service);
        set('pos-total', totals.total);
        
        return totals;
    },

    clearCart: function() {
        if (this.cart.length === 0) return;
        Utils.confirm('هل تريد مسح جميع الأصناف من السلة؟', () => {
            this.cart = [];
            this.discount = 0;
            const d = document.getElementById('pos-discount');
            if (d) d.value = 0;
            this.selectedTable = null;
            const label = document.getElementById('selected-table-label');
            if (label) label.textContent = 'اختر طاولة';
            this.renderCart();
        });
    },

    holdOrder: function() {
        if (this.cart.length === 0) {
            Utils.toast('warning', 'السلة فارغة');
            return;
        }
        const heldOrders = DB.get('heldOrders') || [];
        heldOrders.push({
            id: Date.now(),
            cart: [...this.cart],
            orderType: this.orderType,
            tableId: this.selectedTable,
            customerId: parseInt(document.getElementById('pos-customer')?.value || 1),
            discount: this.discount,
            notes: this.notes,
            time: new Date().toISOString()
        });
        DB.set('heldOrders', heldOrders);
        
        this.cart = [];
        this.discount = 0;
        this.selectedTable = null;
        const d = document.getElementById('pos-discount');
        if (d) d.value = 0;
        const label = document.getElementById('selected-table-label');
        if (label) label.textContent = 'اختر طاولة';
        this.renderCart();
        this.updateHeldCount();
        Utils.toast('success', 'تم تعليق الطلب');
    },

    openHeldOrders: function() {
        const heldOrders = DB.get('heldOrders') || [];
        if (heldOrders.length === 0) {
            Utils.toast('info', 'لا توجد طلبات معلقة');
            return;
        }
        const content = `
            <div class="space-y-2">
                ${heldOrders.map((o, idx) => `
                    <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <div class="flex items-center justify-between mb-2">
                            <div>
                                <p class="font-bold text-sm">طلب #${idx+1}</p>
                                <p class="text-xs text-slate-500">${Utils.formatTime(o.time)} - ${o.cart.length} صنف</p>
                            </div>
                            <p class="font-black text-primary">${o.cart.reduce((s,i)=>s+i.total,0).toLocaleString()}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="POS.resumeOrder(${o.id})" class="flex-1 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">
                                <i class="fa-solid fa-play"></i> استرجاع
                            </button>
                            <button onclick="POS.deleteHeldOrder(${o.id})" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        Utils.modal('الطلبات المعلقة', content, { size: 'max-w-md' });
    },

    resumeOrder: function(orderId) {
        const heldOrders = DB.get('heldOrders') || [];
        const order = heldOrders.find(o => o.id === orderId);
        if (!order) return;
        
        this.cart = order.cart;
        this.orderType = order.orderType;
        this.selectedTable = order.tableId;
        this.discount = order.discount;
        
        if (this.selectedTable) {
            const table = DB.find('tables', this.selectedTable);
            const label = document.getElementById('selected-table-label');
            if (label && table) label.textContent = table.name;
            const tableNum = document.getElementById('pos-table-num');
            if (tableNum && table) tableNum.textContent = table.name;
            const ti = document.getElementById('pos-table-info');
            if (ti && this.orderType === 'dine-in') ti.classList.remove('hidden');
        }
        
        const d = document.getElementById('pos-discount');
        if (d) d.value = this.discount;
        this.updateTypeButtons();
        this.renderCart();
        
        DB.set('heldOrders', heldOrders.filter(o => o.id !== orderId));
        this.updateHeldCount();
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        Utils.toast('success', 'تم استرجاع الطلب');
    },

    deleteHeldOrder: function(orderId) {
        Utils.confirm('حذف الطلب المعلق؟', () => {
            const heldOrders = DB.get('heldOrders') || [];
            DB.set('heldOrders', heldOrders.filter(o => o.id !== orderId));
            this.updateHeldCount();
            document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
            Utils.toast('success', 'تم الحذف');
        });
    },

    updateHeldCount: function() {
        const count = (DB.get('heldOrders') || []).length;
        const el = document.getElementById('pos-held-count');
        if (el) {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    sendToKitchen: function() {
    if (this.cart.length === 0) {
        Utils.toast('warning', 'السلة فارغة');
        return;
    }

    const orderNum = Utils.generateOrderNumber();
    const order = {
        number: orderNum,
        items: this.cart.map(i => ({ ...i, status: 'pending' })),
        type: this.orderType,
        tableId: this.selectedTable,
        customerId: parseInt(document.getElementById('pos-customer')?.value || 1),
        status: 'new',
        date: new Date().toISOString(),
        total: this.cart.reduce((s,i)=>s+i.total, 0),
        user: Utils.currentUser()?.name || 'system'
    };
    
    // ✅ استخدام DB.add بدلاً من push يدوي (يضيف id تلقائياً)
    DB.add('orders', order);
    
    if (this.selectedTable) {
        DB.update('tables', this.selectedTable, { status: 'occupied', currentOrder: order.number });
    }
    
    DB.log('kitchen', `إرسال طلب ${orderNum} للمطبخ`);
    Utils.toast('success', `تم إرسال الطلب ${orderNum} للمطبخ`);
    
    this.cart = [];
    this.discount = 0;
    this.selectedTable = null;
    const d = document.getElementById('pos-discount');
    if (d) d.value = 0;
    const label = document.getElementById('selected-table-label');
    if (label) label.textContent = 'اختر طاولة';
    const ti = document.getElementById('pos-table-info');
    if (ti) ti.classList.add('hidden');
    this.renderCart();
},

    openCheckout: function() {
        if (this.cart.length === 0) {
            Utils.toast('warning', 'السلة فارغة');
            return;
        }

        const sys = DB.get('system');
        const totals = this.updateTotals();
        const cashboxes = DB.get('cashbox') || [];
        const orderNum = Utils.generateInvoiceNumber('INV');
        
        const content = `
            <div class="space-y-4">
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm">
                    <div class="flex justify-between mb-1"><span class="text-slate-600">رقم الفاتورة:</span><span class="font-bold font-en">${orderNum}</span></div>
                    <div class="flex justify-between mb-1"><span class="text-slate-600">التاريخ:</span><span>${Utils.formatDate(new Date())}</span></div>
                    <div class="flex justify-between"><span class="text-slate-600">عدد الأصناف:</span><span>${this.cart.length} (${this.cart.reduce((s,i)=>s+i.quantity,0)} وحدة)</span></div>
                </div>

                <div class="max-h-40 overflow-y-auto bg-slate-50 rounded-xl p-2 border border-slate-200">
                    ${this.cart.map(i => `
                        <div class="flex justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                            <span>${Utils.esc(i.name)} × ${i.quantity}</span>
                            <span class="font-bold">${i.total.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="bg-primary/5 rounded-xl p-3 border border-primary/20 space-y-1">
                    <div class="flex justify-between text-sm"><span>المجموع الفرعي:</span><span class="font-bold">${totals.subtotal.toLocaleString()}</span></div>
                    ${totals.discount > 0 ? `<div class="flex justify-between text-sm text-red-600"><span>الخصم:</span><span class="font-bold">-${totals.discount.toLocaleString()}</span></div>` : ''}
                    ${totals.tax > 0 ? `<div class="flex justify-between text-sm"><span>الضريبة:</span><span>${totals.tax.toLocaleString()}</span></div>` : ''}
                    ${totals.service > 0 ? `<div class="flex justify-between text-sm"><span>الخدمة:</span><span>${totals.service.toLocaleString()}</span></div>` : ''}
                    <div class="flex justify-between text-xl pt-2 border-t border-primary/20">
                        <span class="font-bold">الإجمالي:</span>
                        <span class="font-black text-primary">${totals.total.toLocaleString()} ${sys.currency}</span>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold mb-2">طريقة الدفع</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button onclick="POS.selectPayment('cash')" data-pay="cash" class="pay-method-btn py-3 rounded-xl border-2 border-slate-200 hover:border-primary font-bold text-sm flex flex-col items-center gap-1">
                            <i class="fa-solid fa-money-bill-wave text-lg"></i> نقدي
                        </button>
                        <button onclick="POS.selectPayment('card')" data-pay="card" class="pay-method-btn py-3 rounded-xl border-2 border-slate-200 hover:border-primary font-bold text-sm flex flex-col items-center gap-1">
                            <i class="fa-solid fa-credit-card text-lg"></i> بطاقة
                        </button>
                        <button onclick="POS.selectPayment('credit')" data-pay="credit" class="pay-method-btn py-3 rounded-xl border-2 border-slate-200 hover:border-primary font-bold text-sm flex flex-col items-center gap-1">
                            <i class="fa-solid fa-hand-holding-dollar text-lg"></i> آجل
                        </button>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold mb-2">الصندوق</label>
                    <select id="pos-cashbox" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        ${cashboxes.map(c => `<option value="${c.id}">${c.name} - ${Utils.formatCurrency(c.balance)}</option>`).join('')}
                    </select>
                </div>

                <div id="paid-amount-wrap">
                    <label class="block text-sm font-bold mb-2">المبلغ المدفوع</label>
                    <input type="number" id="pos-paid" value="${totals.total}" 
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-lg font-bold text-center"
                           oninput="POS.calcChange(${totals.total})">
                    <div class="mt-2 flex justify-between text-sm">
                        <span>الباقي:</span>
                        <span id="pos-change" class="font-bold text-green-600">0</span>
                    </div>
                </div>

                <div class="flex gap-2 pt-2 border-t border-slate-200">
                    <button onclick="POS.previewInvoice(${totals.total})" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm">
                        <i class="fa-solid fa-eye"></i> معاينة
                    </button>
                    <button onclick="POS.confirmCheckout(${totals.total})" class="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                        <i class="fa-solid fa-check-circle"></i> تأكيد الدفع والطباعة
                    </button>
                </div>
            </div>
        `;
        
        window._posTotals = totals;
        window._posPaymentMethod = 'cash';
        window._posInvoiceNum = orderNum;
        Utils.modal('إتمام عملية الدفع', content, { size: 'max-w-2xl' });
        
        setTimeout(() => this.selectPayment('cash'), 50);
    },

    selectPayment: function(method) {
        window._posPaymentMethod = method;
        document.querySelectorAll('.pay-method-btn').forEach(b => {
            const isActive = b.dataset.pay === method;
            b.className = `pay-method-btn py-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 ${
                isActive ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-primary'
            }`;
        });
        
        const paidWrap = document.getElementById('paid-amount-wrap');
        if (paidWrap) paidWrap.style.display = method === 'cash' ? 'block' : 'none';
    },

    calcChange: function(total) {
        const paid = parseFloat(document.getElementById('pos-paid')?.value) || 0;
        const change = Math.max(0, paid - total);
        const el = document.getElementById('pos-change');
        if (el) el.textContent = change.toLocaleString();
    },

    previewInvoice: function(total) {
        const html = this.buildInvoiceHTML(total, window._posInvoiceNum, true);
        Utils.modal('معاينة الفاتورة', html, { size: 'max-w-2xl' });
    },

    buildInvoiceHTML: function(total, invoiceNum, isPreview = false) {
    const sys = DB.get('system') || {};
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    const dev = DB.get('developerInfo') || {};
    
    const customerId = parseInt(document.getElementById('pos-customer')?.value || 1);
    const customer = DB.find('customers', customerId) || {};
    const table = this.selectedTable ? DB.find('tables', this.selectedTable) : null;

    const totals = Utils.calculateCart(this.cart, {
        discount: this.discount,
        taxRate: sys.taxRate,
        serviceRate: this.orderType === 'dine-in' ? sys.serviceCharge : 0
    });

    // بطاقات المعلومات
    const infoCards = [
        {
            title: 'معلومات العميل',
            icon: 'fa-user',
            rows: [
                { lbl: 'الاسم', val: customer.name || 'عميل نقدي' },
                { lbl: 'الكاشير', val: Utils.currentUser()?.name || '' }
            ]
        },      
        {
            title: 'معلومات الفاتورة',
            icon: 'fa-file-invoice',
            rows: [
                { lbl: 'رقم الفاتورة', val: invoiceNum },
                { lbl: 'نوع الطلب', val: this.orderType === 'dine-in' ? 'محلي' : this.orderType === 'takeaway' ? 'سفري' : 'توصيل' },
                ...(table ? [{ lbl: 'الطاولة', val: table.name }] : [])
            ]
        }
    ];

    // جدول الأصناف
    const tableHeaders = ['الصنف', 'الكمية', 'السعر', 'الإجمالي'];
    const tableRows = this.cart.map(i => [
        Utils.esc(i.name) + (i.notes ? `<br><small style="color:#d97706;">${Utils.esc(i.notes)}</small>` : ''),
        i.quantity,
        i.price.toLocaleString(),
        i.total.toLocaleString()
    ]);

    // المجاميع
    const totalsRows = [
        { lbl: 'المجموع الفرعي', val: `${totals.subtotal.toLocaleString()} ${sys.currency}` },
        ...(totals.discount ? [{ lbl: 'الخصم', val: `-${totals.discount.toLocaleString()} ${sys.currency}`, type: 'discount' }] : []),
        ...(totals.tax ? [{ lbl: 'الضريبة', val: `${totals.tax.toLocaleString()} ${sys.currency}`, type: 'tax' }] : []),
        ...(totals.service ? [{ lbl: 'الخدمة', val: `${totals.service.toLocaleString()} ${sys.currency}`, type: 'service' }] : []),
        { lbl: 'الإجمالي المستحق', val: `${totals.total.toLocaleString()} ${sys.currency}`, type: 'final' }
    ];

    // استدعاء الدالة الموحدة
    const html = Utils.buildGoldInvoice({
        type: 'invoice',
        typeLabel: 'فاتورة',
        number: invoiceNum,
        date: new Date(),
        infoCards: infoCards,
        tableHeaders: tableHeaders,
        tableRows: tableRows,
        totals: totalsRows,
        signatures: ['توقيع المستلم', 'توقيع الكاشير'],
        footerThanks: inv.footerText || 'شكراً لزيارتكم',
        footerSubtext: 'نتشرف بخدمتكم دائماً',
        devInfo: {
            name: dev.nameEn || '',
            title: dev.titleEn || '',
            phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
            copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
        }
    });

    // إضافة أزرار المعاينة إذا كان في وضع المعاينة
    if (isPreview) {
        return html + `
            <div class="mt-4 flex gap-2 no-print">
                <button onclick="POS.printInvoiceFromPreview(${total})" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-print"></i> طباعة
                </button>
                <button onclick="document.querySelectorAll('#modal-root > div').forEach(m=>m.remove())" class="flex-1 py-2.5 bg-slate-200 rounded-xl font-bold">إغلاق</button>
            </div>
        `;
    }
    
    return html;
},
    printInvoiceFromPreview: function(total) {
        const html = this.buildInvoiceHTML(total, window._posInvoiceNum, false);
        Utils.printHTML(html, 'فاتورة');
    },

    confirmCheckout: function(total) {
        const sys = DB.get('system');
        const paymentMethod = window._posPaymentMethod || 'cash';
        const cashboxId = parseInt(document.getElementById('pos-cashbox')?.value || 1);
        const paid = parseFloat(document.getElementById('pos-paid')?.value || total);
        const totals = window._posTotals;
        const invoiceNum = window._posInvoiceNum;
        const customerId = parseInt(document.getElementById('pos-customer')?.value || 1);

        const invoice = {
            number: invoiceNum,
            date: new Date().toISOString(),
            items: [...this.cart],
            subtotal: totals.subtotal,
            discount: totals.discount,
            tax: totals.tax,
            service: totals.service,
            total: totals.total,
            paid: paid,
            change: Math.max(0, paid - totals.total),
            paymentMethod: paymentMethod,
            cashboxId: cashboxId,
            customerId: customerId,
            tableId: this.selectedTable,
            orderType: this.orderType,
            status: 'paid',
            user: Utils.currentUser()?.name || 'system'
        };

        const invoices = DB.get('invoices') || [];
        invoices.push(invoice);
        DB.set('invoices', invoices);

        if (paymentMethod !== 'credit') {
            const cashboxes = DB.get('cashbox') || [];
            const idx = cashboxes.findIndex(c => c.id === cashboxId);
            if (idx !== -1) {
                cashboxes[idx].balance += totals.total;
                DB.set('cashbox', cashboxes);
            }
        }

        if (paymentMethod === 'credit') {
            const customer = DB.find('customers', customerId);
            if (customer) {
                DB.update('customers', customerId, { balance: (customer.balance || 0) + totals.total });
            }
        }

        if (this.selectedTable) {
            DB.update('tables', this.selectedTable, { status: 'cleaning', currentOrder: null, guests: 0 });
        }

        DB.log('invoice', `فاتورة ${invoiceNum} بمبلغ ${totals.total}`);
        Utils.toast('success', `تم حفظ الفاتورة ${invoiceNum}`);

        const html = this.buildInvoiceHTML(total, invoiceNum, false);
        Utils.printHTML(html, 'فاتورة');

        this.cart = [];
        this.discount = 0;
        this.selectedTable = null;
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        
        setTimeout(() => Router.navigate('pos'), 100);
    }
};
