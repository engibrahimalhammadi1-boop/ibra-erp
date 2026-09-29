/**
 * Purchases Screen - المشتريات
 */
const Purchases = {
    filterStatus: 'all',
    searchQuery: '',

    render: function() {
        const purchases = DB.get('purchases') || [];
        const total = purchases.reduce((s,p) => s + (p.total || 0), 0);
        const paid = purchases.reduce((s,p) => s + (p.paid || 0), 0);

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-truck text-xl opacity-80"></i>
                        <span class="text-2xl font-black">${purchases.length}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي الفواتير</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-coins text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(total).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">إجمالي المشتريات</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-hand-holding-dollar text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(total-paid).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">المتبقي (آجل)</p>
                </div>
                <div class="bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl p-3 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-check-circle text-xl opacity-80"></i>
                        <span class="text-lg font-black">${Utils.formatCurrency(paid).split(' ')[0]}</span>
                    </div>
                    <p class="text-xs font-bold mt-1 opacity-90">المدفوع</p>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="pur-search" placeholder="ابحث برقم الفاتورة أو المورد..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <button onclick="Purchases.exportCSV()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-file-csv"></i> تصدير
                </button>
                <button onclick="Purchases.openForm()" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-plus"></i> فاتورة مشتريات
                </button>
            </div>

            <!-- Table -->
            <div id="pur-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderList();
        const search = document.getElementById('pur-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderList();
            }, 150);
        }
    },

    renderList: function() {
        const container = document.getElementById('pur-container');
        if (!container) return;

        let purchases = DB.get('purchases') || [];
        if (this.searchQuery) {
            purchases = purchases.filter(p => 
                (p.number||'').toLowerCase().includes(this.searchQuery) ||
                (p.supplierName||'').toLowerCase().includes(this.searchQuery)
            );
        }
        purchases.sort((a,b) => new Date(b.date) - new Date(a.date));

        if (purchases.length === 0) {
            container.innerHTML = `<div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                <i class="fa-solid fa-truck text-5xl mb-3"></i>
                <p>لا توجد فواتير مشتريات</p>
            </div>`;
            return;
        }

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>التاريخ</th>
                                <th>المورد</th>
                                <th>عدد الأصناف</th>
                                <th>الإجمالي</th>
                                <th>المدفوع</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchases.map(p => {
                                const remaining = (p.total||0) - (p.paid||0);
                                const status = remaining <= 0 ? 'paid' : p.paid > 0 ? 'partial' : 'unpaid';
                                const statusInfo = {
                                    paid: { label: 'مدفوع', cls: 'badge-success' },
                                    partial: { label: 'جزئي', cls: 'badge-warning' },
                                    unpaid: { label: 'غير مدفوع', cls: 'badge-danger' }
                                }[status];
                                return `
                                    <tr>
                                        <td class="font-bold font-en">${p.number}</td>
                                        <td>${Utils.formatDate(p.date)}</td>
                                        <td>${Utils.esc(p.supplierName||'-')}</td>
                                        <td>${(p.items||[]).length}</td>
                                        <td class="font-bold">${Utils.formatCurrency(p.total)}</td>
                                        <td class="text-green-600">${Utils.formatCurrency(p.paid||0)}</td>
                                        <td class="${remaining>0?'text-red-600 font-bold':'text-slate-400'}">${Utils.formatCurrency(remaining)}</td>
                                        <td><span class="badge ${statusInfo.cls}">${statusInfo.label}</span></td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button onclick="Purchases.viewInvoice(${p.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center" title="عرض">
                                                    <i class="fa-solid fa-eye text-xs"></i>
                                                </button>
                                                <button onclick="Purchases.printInvoice(${p.id})" class="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center justify-center" title="طباعة">
                                                    <i class="fa-solid fa-print text-xs"></i>
                                                </button>
                                                ${remaining > 0 ? `
                                                    <button onclick="Purchases.openPayment(${p.id})" class="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center" title="دفعة">
                                                        <i class="fa-solid fa-money-bill text-xs"></i>
                                                    </button>
                                                ` : ''}
                                                <button onclick="Purchases.deletePurchase(${p.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
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

    openForm: function() {
        const suppliers = DB.get('suppliers') || [];
        const inventory = DB.get('inventory') || [];
        
        window._purchaseItems = [];
        window._purchaseNumber = Utils.generateInvoiceNumber('PUR');

        const content = `
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-bold mb-1">رقم الفاتورة</label>
                        <input type="text" id="pur-num" value="${window._purchaseNumber}" readonly
                               class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none font-en">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">التاريخ</label>
                        <input type="date" id="pur-date" value="${new Date().toISOString().split('T')[0]}" 
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المورد *</label>
                    <select id="pur-supplier" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        <option value="">اختر مورد</option>
                        ${suppliers.map(s => `<option value="${s.id}">${Utils.esc(s.name)}</option>`).join('')}
                    </select>
                </div>

                <!-- Items Adder -->
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <label class="block text-sm font-bold mb-2">إضافة أصناف</label>
                    <div class="grid grid-cols-12 gap-2">
                        <select id="pur-item" class="col-span-5 px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary">
                            <option value="">اختر مادة</option>
                            ${inventory.map(i => `<option value="${i.id}" data-name="${Utils.esc(i.name)}" data-cost="${i.cost}" data-unit="${i.unit}">${Utils.esc(i.name)} (${i.quantity} ${i.unit})</option>`).join('')}
                        </select>
                        <input type="number" id="pur-qty" value="1" min="0.01" step="0.01" placeholder="كمية" 
                               class="col-span-2 px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary">
                        <input type="number" id="pur-cost" value="" placeholder="سعر" step="0.01"
                               class="col-span-3 px-2 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary">
                        <button onclick="Purchases.addItem()" class="col-span-2 bg-primary hover:bg-blue-800 text-white rounded-lg text-sm font-bold">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>

                <!-- Items List -->
                <div id="pur-items-list" class="space-y-1 max-h-40 overflow-y-auto"></div>

                <!-- Totals -->
                <div class="bg-primary/5 rounded-xl p-3 border border-primary/20 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>المجموع الفرعي:</span>
                        <span class="font-bold" id="pur-subtotal">0</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span>الخصم:</span>
                        <input type="number" id="pur-discount" value="0" min="0" oninput="Purchases.updateTotals()"
                               class="w-32 px-2 py-1 border border-slate-200 rounded-lg text-center outline-none focus:border-primary">
                    </div>
                    <div class="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                        <span>الإجمالي:</span>
                        <span class="text-primary" id="pur-total">0</span>
                    </div>
                    <div class="flex justify-between items-center text-sm pt-2 border-t border-primary/20">
                        <span>المدفوع:</span>
                        <input type="number" id="pur-paid" value="0" min="0" step="0.01" oninput="Purchases.updateTotals()"
                               class="w-32 px-2 py-1 border border-slate-200 rounded-lg text-center outline-none focus:border-primary">
                    </div>
                    <div class="flex justify-between text-sm">
                        <span>المتبقي:</span>
                        <span class="font-bold text-red-600" id="pur-remaining">0</span>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold mb-1">ملاحظات</label>
                    <textarea id="pur-notes" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary"></textarea>
                </div>

                <button onclick="Purchases.savePurchase()" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ فاتورة المشتريات
                </button>
            </div>
        `;
        
        window._purModal = Utils.modal('فاتورة مشتريات جديدة', content, { size: 'max-w-3xl' });
        
        setTimeout(() => {
            const itemEl = document.getElementById('pur-item');
            if (itemEl) {
                itemEl.onchange = (e) => {
                    const opt = e.target.selectedOptions[0];
                    if (opt && opt.dataset.cost) {
                        document.getElementById('pur-cost').value = opt.dataset.cost;
                    }
                };
            }
        }, 100);
    },

    addItem: function() {
        const itemSel = document.getElementById('pur-item');
        const itemId = parseInt(itemSel.value);
        const qty = parseFloat(document.getElementById('pur-qty').value) || 0;
        const cost = parseFloat(document.getElementById('pur-cost').value) || 0;
        
        if (!itemId || qty <= 0) {
            Utils.toast('error', 'اختر المادة والكمية');
            return;
        }
        const opt = itemSel.selectedOptions[0];
        
        window._purchaseItems.push({
            itemId,
            name: opt.dataset.name,
            unit: opt.dataset.unit,
            quantity: qty,
            cost: cost,
            total: qty * cost
        });
        
        itemSel.value = '';
        document.getElementById('pur-qty').value = 1;
        document.getElementById('pur-cost').value = '';
        
        this.renderPurchaseItems();
        this.updateTotals();
    },

    removeItem: function(idx) {
        window._purchaseItems.splice(idx, 1);
        this.renderPurchaseItems();
        this.updateTotals();
    },

    renderPurchaseItems: function() {
        const container = document.getElementById('pur-items-list');
        if (!container) return;
        
        if (window._purchaseItems.length === 0) {
            container.innerHTML = '<p class="text-center text-xs text-slate-400 py-2">لم تُضف أصناف بعد</p>';
            return;
        }
        
        container.innerHTML = window._purchaseItems.map((item, idx) => `
            <div class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-sm">
                <span class="flex-1 font-bold">${Utils.esc(item.name)}</span>
                <span class="text-slate-500">${item.quantity} ${item.unit} × ${item.cost.toLocaleString()}</span>
                <span class="font-black text-primary">${item.total.toLocaleString()}</span>
                <button onclick="Purchases.removeItem(${idx})" class="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>
        `).join('');
    },

    updateTotals: function() {
        const subtotal = window._purchaseItems.reduce((s,i) => s + i.total, 0);
        const discount = parseFloat(document.getElementById('pur-discount')?.value) || 0;
        const paid = parseFloat(document.getElementById('pur-paid')?.value) || 0;
        const total = subtotal - discount;
        const remaining = total - paid;

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('pur-subtotal', Utils.formatCurrency(subtotal));
        set('pur-total', Utils.formatCurrency(total));
        set('pur-remaining', Utils.formatCurrency(remaining));
    },

    savePurchase: function() {
        const supplierId = parseInt(document.getElementById('pur-supplier').value);
        const date = document.getElementById('pur-date').value;
        const number = document.getElementById('pur-num').value;
        const discount = parseFloat(document.getElementById('pur-discount').value) || 0;
        const paid = parseFloat(document.getElementById('pur-paid').value) || 0;
        const notes = document.getElementById('pur-notes').value.trim();

        if (!supplierId) { Utils.toast('error', 'اختر المورد'); return; }
        if (window._purchaseItems.length === 0) { Utils.toast('error', 'أضف أصناف'); return; }

        const supplier = DB.find('suppliers', supplierId);
        const subtotal = window._purchaseItems.reduce((s,i) => s + i.total, 0);
        const total = subtotal - discount;

        const purchase = {
            number,
            date: new Date(date).toISOString(),
            supplierId,
            supplierName: supplier?.name || '',
            items: [...window._purchaseItems],
            subtotal,
            discount,
            total,
            paid,
            notes,
            status: paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
            user: Utils.currentUser()?.name || 'system'
        };

        DB.add('purchases', purchase);

        // تحديث كميات المخزون
        purchase.items.forEach(pi => {
            const invItem = DB.find('inventory', pi.itemId);
            if (invItem) {
                DB.update('inventory', pi.itemId, { 
                    quantity: invItem.quantity + pi.quantity,
                    cost: pi.cost || invItem.cost
                });
            }
        });

        // تحديث رصيد المورد
        const remaining = total - paid;
        if (remaining > 0 && supplier) {
            DB.update('suppliers', supplierId, { balance: (supplier.balance||0) + remaining });
        }

        DB.log('purchases', `فاتورة مشتريات ${number} بمبلغ ${total}`);
        Utils.toast('success', 'تم حفظ فاتورة المشتريات');
        
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    viewInvoice: function(id) {
        const p = DB.find('purchases', id);
        if (!p) return;
        
        const content = `
            <div class="space-y-3">
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm space-y-1">
                    <div class="flex justify-between"><span>رقم الفاتورة:</span><span class="font-bold font-en">${p.number}</span></div>
                    <div class="flex justify-between"><span>التاريخ:</span><span>${Utils.formatDate(p.date, true)}</span></div>
                    <div class="flex justify-between"><span>المورد:</span><span>${Utils.esc(p.supplierName)}</span></div>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table class="data-table">
                        <thead>
                            <tr><th>المادة</th><th>الكمية</th><th>التكلفة</th><th>الإجمالي</th></tr>
                        </thead>
                        <tbody>
                            ${p.items.map(i => `
                                <tr>
                                    <td>${Utils.esc(i.name)}</td>
                                    <td>${i.quantity} ${i.unit}</td>
                                    <td>${i.cost.toLocaleString()}</td>
                                    <td class="font-bold">${i.total.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="bg-primary/5 rounded-xl p-3 border border-primary/20 space-y-1 text-sm">
                    <div class="flex justify-between"><span>المجموع:</span><span>${p.subtotal.toLocaleString()}</span></div>
                    ${p.discount ? `<div class="flex justify-between text-red-600"><span>الخصم:</span><span>-${p.discount.toLocaleString()}</span></div>` : ''}
                    <div class="flex justify-between font-black text-lg pt-2 border-t border-primary/20">
                        <span>الإجمالي:</span><span class="text-primary">${p.total.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between text-green-600"><span>المدفوع:</span><span>${(p.paid||0).toLocaleString()}</span></div>
                    <div class="flex justify-between text-red-600"><span>المتبقي:</span><span>${((p.total)-(p.paid||0)).toLocaleString()}</span></div>
                </div>
                <div class="flex gap-2">
                    <button onclick="Purchases.printInvoice(${id})" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold">
                        <i class="fa-solid fa-print"></i> طباعة
                    </button>
                </div>
            </div>
        `;
        Utils.modal('تفاصيل الفاتورة', content, { size: 'max-w-lg' });
    },

    // ============================================
    // ✅ طباعة فاتورة المشتريات - تصميم بنفسجي جديد
    // ============================================
    printInvoice: function(id) {
        const p = DB.find('purchases', id);
        if (!p) return;
        
        const sys = DB.get('system') || {};
        const settings = DB.get('settings') || {};
        const inv = settings.invoice || {};
        const dev = DB.get('developerInfo') || {};
        const supplier = DB.find('suppliers', p.supplierId) || {};
        
        // بطاقات المعلومات
        const infoCards = [
            {
                title: 'بيانات المورد',
                icon: 'fa-truck',
                rows: [
                    { lbl: 'الاسم', val: supplier.name || p.supplierName || '-' },
                    { lbl: 'الهاتف', val: supplier.phone || '-' },
                    { lbl: 'التصنيف', val: supplier.category || '-' }
                ]
            },
            {
                title: 'معلومات الفاتورة',
                icon: 'fa-file-invoice',
                rows: [
                    { lbl: 'رقم الفاتورة', val: p.number },
                    { lbl: 'تاريخ الفاتورة', val: Utils.formatDate(p.date) },
                    { lbl: 'المستخدم', val: p.user || '-' }
                ]
            }
        ];
        
        // حالة الدفع
        const paid = p.paid || 0;
        const total = p.total || 0;
        const remaining = total - paid;
        const paymentStatus = remaining <= 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
        const paymentLabels = {
            paid: { text: '✓ مدفوع بالكامل', class: 'paid', icon: 'fa-check-circle' },
            partial: { text: '⚠ مدفوع جزئياً', class: 'partial', icon: 'fa-hourglass-half' },
            unpaid: { text: '✗ غير مدفوع (آجل)', class: 'unpaid', icon: 'fa-clock' }
        };
        const status = paymentLabels[paymentStatus];
        
        // جدول المواد
        const tableHeaders = ['المادة', 'الكمية', 'الوحدة', 'تكلفة الوحدة', 'الإجمالي'];
        const tableRows = p.items.map(i => [
            Utils.esc(i.name),
            i.quantity.toString(),
            Utils.esc(i.unit || '-'),
            i.cost.toLocaleString(),
            i.total.toLocaleString()
        ]);
        
        // المجاميع
        const totals = [
            { lbl: 'المجموع الفرعي', val: `${(p.subtotal||0).toLocaleString()} ${sys.currency}` },
            ...(p.discount ? [{ lbl: 'الخصم', val: `-${p.discount.toLocaleString()} ${sys.currency}`, type: 'discount' }] : []),
            { lbl: 'الإجمالي المستحق', val: `${total.toLocaleString()} ${sys.currency}`, type: 'final' },
            { lbl: 'المبلغ المدفوع', val: `${paid.toLocaleString()} ${sys.currency}`, type: 'tax' },
            ...(remaining > 0 ? [{ lbl: 'المبلغ المتبقي', val: `${remaining.toLocaleString()} ${sys.currency}`, type: 'discount' }] : [])
        ];
        
        // بناء المستند
        let html = Utils.buildGoldInvoice({
            type: 'purchase',
            typeLabel: 'فاتورة مشتريات',
            number: p.number,
            date: p.date,
            infoCards: infoCards,
            tableHeaders: tableHeaders,
            tableRows: tableRows,
            totals: totals,
            signatures: ['توقيع المستلم', 'توقيع المورد'],
            footerThanks: 'شكراً لتعاملكم معنا',
            footerSubtext: 'نتشرف بخدمتكم دائماً',
            devInfo: {
                name: dev.nameEn || '',
                title: dev.titleEn || '',
                phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
                copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${dev.copyrightOwnerAr || ''}`
            }
        });
        
        // إضافة شارة حالة الدفع بعد الخط الفاصل
        html = html.replace(
            '<div class="doc-gold-divider type-purchase"></div>',
            `<div class="doc-gold-divider type-purchase"></div>
            <div style="text-align:center;margin:10px 0 16px;">
                <span class="doc-payment-badge ${status.class}">
                    <i class="fa-solid ${status.icon}"></i> ${status.text}
                </span>
            </div>`
        );
        
        Utils.printHTML(html, 'فاتورة مشتريات');
        DB.log('purchases', `طباعة فاتورة مشتريات ${p.number}`);
    },

    openPayment: function(id) {
        const p = DB.find('purchases', id);
        if (!p) return;
        const remaining = p.total - (p.paid||0);
        
        const content = `
            <div class="space-y-3">
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-sm">
                    <div class="flex justify-between mb-1"><span>الفاتورة:</span><span class="font-bold font-en">${p.number}</span></div>
                    <div class="flex justify-between mb-1"><span>المورد:</span><span>${Utils.esc(p.supplierName)}</span></div>
                    <div class="flex justify-between mb-1"><span>الإجمالي:</span><span>${p.total.toLocaleString()}</span></div>
                    <div class="flex justify-between"><span>المتبقي:</span><span class="font-bold text-red-600">${remaining.toLocaleString()}</span></div>
                </div>
                <div>
                    <label class="block text-sm font-bold mb-1">المبلغ المدفوع</label>
                    <input type="number" id="pur-payment-amt" value="${remaining}" max="${remaining}" min="0.01"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary text-lg font-bold text-center">
                </div>
                <button onclick="Purchases.savePayment(${id})" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> تسجيل الدفعة
                </button>
            </div>
        `;
        Utils.modal('تسجيل دفعة', content, { size: 'max-w-md' });
    },

    savePayment: function(id) {
        const amt = parseFloat(document.getElementById('pur-payment-amt').value) || 0;
        if (amt <= 0) { Utils.toast('error', 'أدخل مبلغ'); return; }
        
        const p = DB.find('purchases', id);
        if (!p) return;
        const newPaid = (p.paid||0) + amt;
        const status = newPaid >= p.total ? 'paid' : 'partial';
        
        DB.update('purchases', id, { paid: newPaid, status });
        
        const supplier = DB.find('suppliers', p.supplierId);
        if (supplier) {
            DB.update('suppliers', p.supplierId, { balance: Math.max(0, (supplier.balance||0) - amt) });
        }

        const cashboxes = DB.get('cashbox') || [];
        if (cashboxes.length > 0) {
            cashboxes[0].balance -= amt;
            DB.set('cashbox', cashboxes);
        }

        DB.log('purchases', `دفعة ${amt} للفاتورة ${p.number}`);
        Utils.toast('success', 'تم تسجيل الدفعة');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
        this.renderList();
    },

    deletePurchase: function(id) {
        Utils.confirm('حذف فاتورة المشتريات؟ سيتم عكس الكميات من المخزون.', () => {
            const p = DB.find('purchases', id);
            if (p) {
                p.items.forEach(pi => {
                    const invItem = DB.find('inventory', pi.itemId);
                    if (invItem) {
                        DB.update('inventory', pi.itemId, { quantity: invItem.quantity - pi.quantity });
                    }
                });
            }
            DB.remove('purchases', id);
            Utils.toast('success', 'تم الحذف');
            this.renderList();
        });
    },

    exportCSV: function() {
        const purchases = DB.get('purchases') || [];
        const data = purchases.map(p => ({
            'رقم الفاتورة': p.number,
            'التاريخ': Utils.formatDate(p.date),
            'المورد': p.supplierName,
            'الإجمالي': p.total,
            'المدفوع': p.paid,
            'المتبقي': p.total - (p.paid||0),
            'الحالة': p.status
        }));
        Utils.exportCSV(data, 'purchases.csv');
    }
};