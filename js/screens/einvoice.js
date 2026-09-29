/**
 * E-Invoice Screen - الفاتورة الإلكترونية
 */
const EInvoice = {
    searchQuery: '',
    filterStatus: 'all',

    render: function() {
        const invoices = DB.get('invoices') || [];
        const einvoices = DB.get('einvoices') || [];
        
        const totalEInvoices = einvoices.length;
        const sentCount = einvoices.filter(e => e.status === 'sent').length;
        const pendingCount = einvoices.filter(e => e.status === 'pending').length;
        const failedCount = einvoices.filter(e => e.status === 'failed').length;

        return `
        <div class="space-y-4">
            
            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-file-invoice text-2xl opacity-80"></i>
                        <span class="text-2xl font-black">${totalEInvoices}</span>
                    </div>
                    <p class="text-xs font-bold mt-2 opacity-90">إجمالي الفواتير الإلكترونية</p>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-paper-plane text-2xl opacity-80"></i>
                        <span class="text-2xl font-black">${sentCount}</span>
                    </div>
                    <p class="text-xs font-bold mt-2 opacity-90">مرسلة</p>
                </div>
                <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-clock text-2xl opacity-80"></i>
                        <span class="text-2xl font-black">${pendingCount}</span>
                    </div>
                    <p class="text-xs font-bold mt-2 opacity-90">معلقة</p>
                </div>
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-4 shadow-md">
                    <div class="flex items-center justify-between">
                        <i class="fa-solid fa-circle-xmark text-2xl opacity-80"></i>
                        <span class="text-2xl font-black">${failedCount}</span>
                    </div>
                    <p class="text-xs font-bold mt-2 opacity-90">فاشلة</p>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col md:flex-row gap-2">
                <div class="flex-1 relative">
                    <i class="fa-solid fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="ei-search" placeholder="ابحث برقم الفاتورة أو العميل أو الرقم الضريبي..." 
                           class="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm">
                </div>
                <button onclick="EInvoice.openSettings()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-gear"></i> الإعدادات
                </button>
                <button onclick="EInvoice.generateFromInvoices()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold">
                    <i class="fa-solid fa-file-circle-plus"></i> توليد فواتير
                </button>
            </div>

            <!-- List -->
            <div id="ei-container"></div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderList();
        const search = document.getElementById('ei-search');
        if (search) {
            search.oninput = Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderList();
            }, 150);
        }
    },

    renderList: function() {
        const container = document.getElementById('ei-container');
        if (!container) return;

        let einvoices = DB.get('einvoices') || [];
        
        if (this.searchQuery) {
            einvoices = einvoices.filter(e => 
                (e.number||'').toLowerCase().includes(this.searchQuery) ||
                (e.customerName||'').toLowerCase().includes(this.searchQuery) ||
                (e.taxNumber||'').toLowerCase().includes(this.searchQuery)
            );
        }
        einvoices.sort((a,b) => new Date(b.date) - new Date(a.date));

        if (einvoices.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-2xl border border-slate-200 text-center py-20 text-slate-400">
                    <i class="fa-solid fa-file-invoice text-5xl mb-3"></i>
                    <p class="font-bold">لا توجد فواتير إلكترونية</p>
                    <p class="text-sm mt-1">اضغط "توليد فواتير" لإنشاء فواتير إلكترونية من الفواتير الحالية</p>
                    <button onclick="EInvoice.generateFromInvoices()" class="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold">
                        <i class="fa-solid fa-plus"></i> توليد الآن
                    </button>
                </div>
            `;
            return;
        }

        const statusInfo = {
            draft: { label: 'مسودة', cls: 'badge-gray', icon: 'fa-file' },
            pending: { label: 'معلقة', cls: 'badge-warning', icon: 'fa-clock' },
            sent: { label: 'مرسلة', cls: 'badge-success', icon: 'fa-paper-plane' },
            failed: { label: 'فاشلة', cls: 'badge-danger', icon: 'fa-circle-xmark' }
        };

        container.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>التاريخ</th>
                                <th>العميل</th>
                                <th>الرقم الضريبي</th>
                                <th>الإجمالي</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${einvoices.map(e => {
                                const info = statusInfo[e.status] || statusInfo.draft;
                                return `
                                    <tr>
                                        <td class="font-bold font-en">${e.number}</td>
                                        <td>
                                            <p class="text-sm">${Utils.formatDate(e.date)}</p>
                                            <p class="text-xs text-slate-400">${Utils.formatTime(e.date)}</p>
                                        </td>
                                        <td>${Utils.esc(e.customerName || 'عميل نقدي')}</td>
                                        <td class="font-en text-xs" dir="ltr">${e.taxNumber || '-'}</td>
                                        <td class="font-black text-primary">${Utils.formatCurrency(e.total)}</td>
                                        <td><span class="badge ${info.cls}"><i class="fa-solid ${info.icon}"></i> ${info.label}</span></td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button onclick="EInvoice.viewInvoice(${e.id})" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center" title="عرض">
                                                    <i class="fa-solid fa-eye text-xs"></i>
                                                </button>
                                                <button onclick="EInvoice.printInvoice(${e.id})" class="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center" title="طباعة">
                                                    <i class="fa-solid fa-print text-xs"></i>
                                                </button>
                                                ${e.status !== 'sent' ? `
                                                    <button onclick="EInvoice.markAsSent(${e.id})" class="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center" title="تعليم كمرسلة">
                                                        <i class="fa-solid fa-paper-plane text-xs"></i>
                                                    </button>
                                                ` : ''}
                                                <button onclick="EInvoice.deleteInvoice(${e.id})" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center">
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

    // ✅ توليد فواتير إلكترونية من الفواتير العادية
    generateFromInvoices: function() {
        const invoices = DB.get('invoices') || [];
        const einvoices = DB.get('einvoices') || [];
        
        // ✅ الفواتير التي لم يتم توليدها
        const existingNumbers = einvoices.map(e => e.originalInvoiceNumber);
        const toGenerate = invoices.filter(i => !existingNumbers.includes(i.number));

        if (toGenerate.length === 0) {
            Utils.toast('info', 'جميع الفواتير تم توليدها مسبقاً');
            return;
        }

        Utils.confirm(`هل تريد توليد ${toGenerate.length} فاتورة إلكترونية؟`, () => {
            const sys = DB.get('system') || {};
            
            toGenerate.forEach(inv => {
                const customer = DB.find('customers', inv.customerId);
                
                DB.add('einvoices', {
                    number: `EINV-${inv.number}`,
                    originalInvoiceNumber: inv.number,
                    date: inv.date,
                    customerId: inv.customerId,
                    customerName: customer?.name || 'عميل نقدي',
                    taxNumber: customer?.taxNumber || sys.taxNumber || '',
                    items: inv.items,
                    subtotal: inv.subtotal,
                    tax: inv.tax || 0,
                    total: inv.total,
                    status: 'draft',
                    qrCode: this.generateQRData(inv),
                    user: Utils.currentUser()?.name || 'system'
                });
            });
            
            DB.log('einvoice', `توليد ${toGenerate.length} فاتورة إلكترونية`);
            Utils.toast('success', `تم توليد ${toGenerate.length} فاتورة إلكترونية`);
            this.renderList();
        });
    },

    // ✅ توليد بيانات QR
    generateQRData: function(inv) {
        const sys = DB.get('system') || {};
        const seller = sys.nameAr || 'IBRA Soft ERP';
        const vatNumber = sys.taxNumber || '';
        const timestamp = new Date(inv.date).toISOString();
        const total = inv.total;
        const vat = inv.tax || 0;
        
        // ✅ بيانات QR وفق معيار ZATCA السعودي (مبسط)
        const qrData = [
            seller,
            vatNumber,
            timestamp,
            total.toString(),
            vat.toString()
        ].join('|');
        
        return qrData;
    },

    viewInvoice: function(id) {
        const e = DB.find('einvoices', id);
        if (!e) return;

        const statusLabels = {
            draft: 'مسودة', pending: 'معلقة', sent: 'مرسلة', failed: 'فاشلة'
        };

        const content = `
            <div class="space-y-4">
                <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-5">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <p class="text-xs opacity-90">الفاتورة الإلكترونية</p>
                            <h3 class="font-black text-xl font-en">${e.number}</h3>
                        </div>
                        <span class="badge bg-white/20 text-white">${statusLabels[e.status]}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p class="opacity-75">التاريخ</p>
                            <p class="font-bold">${Utils.formatDate(e.date, true)}</p>
                        </div>
                        <div>
                            <p class="opacity-75">الإجمالي</p>
                            <p class="font-black">${Utils.formatCurrency(e.total)}</p>
                        </div>
                    </div>
                </div>

                <!-- العميل -->
                <div class="bg-slate-50 rounded-xl p-4">
                    <h4 class="font-bold text-sm mb-2"><i class="fa-solid fa-user text-blue-600"></i> بيانات العميل</h4>
                    <div class="space-y-1 text-sm">
                        <div class="flex justify-between"><span class="text-slate-500">الاسم:</span><span class="font-bold">${Utils.esc(e.customerName)}</span></div>
                        <div class="flex justify-between"><span class="text-slate-500">الرقم الضريبي:</span><span class="font-en" dir="ltr">${e.taxNumber || '-'}</span></div>
                    </div>
                </div>

                <!-- QR Code -->
                <div class="bg-white border-2 border-slate-200 rounded-xl p-4 text-center">
                    <p class="text-xs text-slate-500 mb-2">رمز QR للتحقق</p>
                    <div id="qr-view-${e.id}" class="flex justify-center"></div>
                </div>

                <!-- الأصناف -->
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table class="data-table">
                        <thead>
                            <tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                        </thead>
                        <tbody>
                            ${e.items.map(i => `
                                <tr>
                                    <td>${Utils.esc(i.name)}</td>
                                    <td>${i.quantity}</td>
                                    <td>${i.price.toLocaleString()}</td>
                                    <td class="font-bold">${i.total.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- المجاميع -->
                <div class="bg-primary/5 rounded-xl p-4 space-y-2">
                    <div class="flex justify-between text-sm"><span>المجموع الفرعي:</span><span>${e.subtotal.toLocaleString()}</span></div>
                    <div class="flex justify-between text-sm"><span>الضريبة:</span><span>${e.tax.toLocaleString()}</span></div>
                    <div class="flex justify-between font-black text-lg pt-2 border-t border-primary/20">
                        <span>الإجمالي:</span>
                        <span class="text-primary">${e.total.toLocaleString()}</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="EInvoice.printInvoice(${e.id})" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                        <i class="fa-solid fa-print"></i> طباعة
                    </button>
                    ${e.status !== 'sent' ? `
                        <button onclick="EInvoice.markAsSent(${e.id})" class="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">
                            <i class="fa-solid fa-paper-plane"></i> تعليم كمرسلة
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        Utils.modal('تفاصيل الفاتورة الإلكترونية', content, { size: 'max-w-2xl' });
        
        // رسم QR
        setTimeout(() => this.renderQR(e), 100);
    },

    // ✅ رسم QR بسيط
    renderQR: function(e) {
        const container = document.getElementById(`qr-view-${e.id}`);
        if (!container) return;
        
        const qrData = e.qrCode || e.number;
        
        // استخدام API خارجي لتوليد QR
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
        
        container.innerHTML = `<img src="${qrUrl}" alt="QR" style="width:150px;height:150px;border-radius:8px;">`;
    },

    printInvoice: function(id) {
        const e = DB.find('einvoices', id);
        if (!e) return;
        
        const sys = DB.get('system') || {};
        const dev = DB.get('developerInfo') || {};
        const inv = (DB.get('settings') || {}).invoice || {};
        
        const infoCards = [
            {
                title: 'بيانات العميل',
                icon: 'fa-user',
                rows: [
                    { lbl: 'الاسم', val: e.customerName },
                    { lbl: 'الرقم الضريبي', val: e.taxNumber || '-' }
                ]
            },
            {
                title: 'بيانات الفاتورة',
                icon: 'fa-file-invoice',
                rows: [
                    { lbl: 'رقم الفاتورة', val: e.number },
                    { lbl: 'الفاتورة الأصلية', val: e.originalInvoiceNumber || '-' },
                    { lbl: 'التاريخ', val: Utils.formatDate(e.date) }
                ]
            }
        ];
        
        const tableHeaders = ['الصنف', 'الكمية', 'السعر', 'الإجمالي'];
        const tableRows = e.items.map(i => [
            Utils.esc(i.name),
            i.quantity,
            i.price.toLocaleString(),
            i.total.toLocaleString()
        ]);
        
        const totals = [
            { lbl: 'المجموع الفرعي', val: `${e.subtotal.toLocaleString()} ${sys.currency}` },
            { lbl: 'الضريبة', val: `${e.tax.toLocaleString()} ${sys.currency}`, type: 'tax' },
            { lbl: 'الإجمالي', val: `${e.total.toLocaleString()} ${sys.currency}`, type: 'final' }
        ];
        
        const html = Utils.buildGoldInvoice({
            type: 'invoice',
            typeLabel: 'فاتورة إلكترونية',
            number: e.number,
            date: e.date,
            infoCards: infoCards,
            tableHeaders: tableHeaders,
            tableRows: tableRows,
            totals: totals,
            signatures: ['توقيع المستلم', 'توقيع الكاشير'],
            footerThanks: 'شكراً لزيارتكم',
            devInfo: {
                name: dev.nameEn || '',
                title: dev.titleEn || '',
                phone: dev.phones && dev.phones[0] ? dev.phones[0].number.replace('+', '') : '',
                copyright: `جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'}`
            }
        });
        
        // إضافة QR في نهاية المستند قبل التذييل
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(e.qrCode || e.number)}`;
        const htmlWithQR = html.replace(
            '<div class="doc-footer-gold">',
            `<div class="doc-qr-gold">
                <img src="${qrUrl}" alt="QR">
                <p>امسح للتحقق من الفاتورة</p>
            </div>
            <div class="doc-footer-gold">`
        );
        
        Utils.printHTML(htmlWithQR, 'فاتورة إلكترونية');
    },

    markAsSent: function(id) {
        DB.update('einvoices', id, { 
            status: 'sent', 
            sentAt: new Date().toISOString() 
        });
        Utils.toast('success', 'تم تعليم الفاتورة كمرسلة');
        this.renderList();
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
    },

    deleteInvoice: function(id) {
        Utils.confirm('حذف الفاتورة الإلكترونية؟', () => {
            DB.remove('einvoices', id);
            Utils.toast('success', 'تم الحذف');
            this.renderList();
        });
    },

    openSettings: function() {
        const sys = DB.get('system') || {};
        
        const content = `
            <div class="space-y-4">
                <div class="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                    <i class="fa-solid fa-info-circle"></i>
                    <strong>ملاحظة:</strong> هذه إعدادات الفاتورة الإلكترونية. سيتم استخدامها في الفواتير الجديدة.
                </div>

                <div>
                    <label class="block text-sm font-bold mb-1">الرقم الضريبي للمنشأة</label>
                    <input type="text" id="ei-tax-number" value="${sys.taxNumber || ''}" dir="ltr"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                </div>

                <div>
                    <label class="block text-sm font-bold mb-1">نسبة الضريبة (%)</label>
                    <input type="number" id="ei-tax-rate" value="${((sys.taxRate||0)*100).toFixed(0)}" min="0" max="100"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>

                <div>
                    <label class="block text-sm font-bold mb-1">العنوان الوطني</label>
                    <input type="text" id="ei-address" value="${sys.address || ''}"
                           class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                </div>

                <button onclick="EInvoice.saveSettings()" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ الإعدادات
                </button>
            </div>
        `;
        
        Utils.modal('إعدادات الفاتورة الإلكترونية', content, { size: 'max-w-md' });
    },

    saveSettings: function() {
        const sys = DB.get('system') || {};
        sys.taxNumber = document.getElementById('ei-tax-number').value.trim();
        sys.taxRate = (parseFloat(document.getElementById('ei-tax-rate').value) || 0) / 100;
        sys.address = document.getElementById('ei-address').value.trim();
        DB.set('system', sys);
        Utils.toast('success', 'تم حفظ الإعدادات');
        document.querySelectorAll('#modal-root > div').forEach(m => m.remove());
    }
};