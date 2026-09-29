/**
 * Settings Screen - الإعدادات
 */
const Settings = {
    activeTab: 'restaurant',

    render: function() {
        const tabs = [
    { id:'restaurant', label:'بيانات المطعم', icon:'fa-store' },
    { id:'invoice', label:'إعدادات الفاتورة', icon:'fa-receipt' },
    { id:'printer', label:'الطباعة', icon:'fa-print' },
    { id:'appearance', label:'المظهر والصوت', icon:'fa-palette' },
    { id:'pos', label:'نقطة البيع', icon:'fa-cash-register' },
    { id:'backup', label:'النسخ الاحتياطي', icon:'fa-database' },
    { id:'developer', label:'المطور', icon:'fa-laptop-code' }
];

        return `
        <div class="space-y-4 max-w-6xl mx-auto">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 flex flex-wrap gap-1">
                ${tabs.map(t => `
                    <button onclick="Settings.setTab('${t.id}')" data-tab="${t.id}"
                            class="st-tab-btn flex-1 py-2.5 px-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2">
                        <i class="fa-solid ${t.icon}"></i> <span class="hidden sm:inline">${t.label}</span>
                    </button>
                `).join('')}
            </div>

            <div id="settings-content"></div>
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
        document.querySelectorAll('.st-tab-btn').forEach(b => {
            const isActive = b.dataset.tab === this.activeTab;
            b.className = `st-tab-btn flex-1 py-2.5 px-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`;
        });
    },

    renderContent: function() {
    switch(this.activeTab) {
        case 'restaurant': this.renderRestaurant(); break;
        case 'invoice': this.renderInvoice(); break;
        case 'printer': this.renderPrinter(); break;
        case 'appearance': this.renderAppearance(); break;  // ✅ جديد
        case 'pos': this.renderPOS(); break;
        case 'backup': this.renderBackup(); break;
        case 'developer': this.renderDeveloper(); break;
    }
},

    // ============================================
    // بيانات المطعم
    // ============================================
    renderRestaurant: function() {
        const container = document.getElementById('settings-content');
        const sys = DB.get('system') || {};

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-store text-primary"></i> بيانات المطعم
                </h3>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold mb-1">اسم المطعم (عربي) *</label>
                            <input type="text" id="sys-nameAr" value="${Utils.esc(sys.nameAr || '')}" 
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">اسم المطعم (إنجليزي)</label>
                            <input type="text" id="sys-nameEn" value="${Utils.esc(sys.nameEn || '')}" 
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">العملة</label>
                            <select id="sys-currency" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                                <option value="ر.ي" ${sys.currency==='ر.ي'?'selected':''}>ريال يمني (ر.ي)</option>
                                <option value="ر.س" ${sys.currency==='ر.س'?'selected':''}>ريال سعودي (ر.س)</option>
                                <option value="$" ${sys.currency==='$'?'selected':''}>دولار ($)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">الرقم الضريبي</label>
                            <input type="text" id="sys-taxNumber" value="${Utils.esc(sys.taxNumber||'')}" dir="ltr"
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">نسبة الضريبة (%)</label>
                            <input type="number" id="sys-taxRate" value="${((sys.taxRate||0)*100).toFixed(0)}" step="1" min="0" max="100"
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">نسبة الخدمة (%)</label>
                            <input type="number" id="sys-serviceCharge" value="${((sys.serviceCharge||0)*100).toFixed(0)}" step="1" min="0" max="100"
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        </div>
                    </div>
                    <button onclick="Settings.saveRestaurant()" class="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                        <i class="fa-solid fa-check"></i> حفظ التغييرات
                    </button>
                </div>
            </div>
        `;
    },

    saveRestaurant: function() {
        const sys = DB.get('system') || {};
        sys.nameAr = document.getElementById('sys-nameAr').value.trim();
        sys.nameEn = document.getElementById('sys-nameEn').value.trim();
        sys.currency = document.getElementById('sys-currency').value;
        sys.taxNumber = document.getElementById('sys-taxNumber').value.trim();
        sys.taxRate = (parseFloat(document.getElementById('sys-taxRate').value) || 0) / 100;
        sys.serviceCharge = (parseFloat(document.getElementById('sys-serviceCharge').value) || 0) / 100;
        DB.set('system', sys);

        const versionEl = document.getElementById('sidebar-version');
        if (versionEl) versionEl.innerText = `${sys.nameEn} v${sys.version}`;
        
        DB.log('settings', 'تحديث بيانات المطعم');
        Utils.toast('success', 'تم حفظ الإعدادات');
    },

    // ============================================
    // إعدادات الفاتورة
    // ============================================
    renderInvoice: function() {
        const container = document.getElementById('settings-content');
        const settings = DB.get('settings') || {};
        const inv = settings.invoice || {};

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-receipt text-primary"></i> إعدادات الفاتورة
                </h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold mb-1">اسم المطعم في رأس الفاتورة</label>
                            <input type="text" id="inv-headerAr" value="${Utils.esc(inv.headerAr||'')}" 
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">الاسم الإنجليزي (اختياري)</label>
                            <input type="text" id="inv-headerEn" value="${Utils.esc(inv.headerEn||'')}" 
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-bold mb-1">الهاتف</label>
                                <input type="tel" id="inv-phone" value="${Utils.esc(inv.phone||'')}" dir="ltr"
                                       class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                            </div>
                            <div>
                                <label class="block text-sm font-bold mb-1">الرقم الضريبي</label>
                                <input type="text" id="inv-taxNumber" value="${Utils.esc(inv.taxNumber||'')}" dir="ltr"
                                       class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary font-en">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">العنوان</label>
                            <input type="text" id="inv-address" value="${Utils.esc(inv.address||'')}" 
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">نص تذييل الفاتورة</label>
                            <input type="text" id="inv-footerText" value="${Utils.esc(inv.footerText||'')}" 
                                   class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                        </div>

                        <div>
                            <label class="block text-sm font-bold mb-2">شعار المطعم</label>
                            <div class="flex items-center gap-3">
                                <div id="logo-preview" class="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                    ${inv.logo 
                                        ? `<img src="${inv.logo}" class="w-full h-full object-contain">` 
                                        : '<i class="fa-solid fa-image text-2xl text-slate-400"></i>'}
                                </div>
                                <div class="flex-1 space-y-2">
                                    <input type="file" id="logo-input" accept="image/*" onchange="Settings.uploadLogo(this)" class="hidden">
                                    <button onclick="document.getElementById('logo-input').click()" class="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold">
                                        <i class="fa-solid fa-upload"></i> رفع شعار
                                    </button>
                                    ${inv.logo ? `
                                        <button onclick="Settings.removeLogo()" class="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold">
                                            <i class="fa-solid fa-trash"></i> حذف
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="space-y-2 pt-3 border-t border-slate-200">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <div class="switch">
                                    <input type="checkbox" id="inv-showLogo" ${inv.showLogo!==false?'checked':''}>
                                    <span class="slider"></span>
                                </div>
                                <span class="text-sm font-bold">إظهار الشعار في الفاتورة</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <div class="switch">
                                    <input type="checkbox" id="inv-showTax" ${inv.showTax!==false?'checked':''}>
                                    <span class="slider"></span>
                                </div>
                                <span class="text-sm font-bold">إظهار الضريبة</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <div class="switch">
                                    <input type="checkbox" id="inv-showServiceCharge" ${inv.showServiceCharge!==false?'checked':''}>
                                    <span class="slider"></span>
                                </div>
                                <span class="text-sm font-bold">إظهار رسوم الخدمة</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <div class="switch">
                                    <input type="checkbox" id="inv-autoPrint" ${inv.autoPrint?'checked':''}>
                                    <span class="slider"></span>
                                </div>
                                <span class="text-sm font-bold">طباعة تلقائية بعد الدفع</span>
                            </label>
                        </div>

                        <button onclick="Settings.saveInvoice()" class="w-full py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                            <i class="fa-solid fa-check"></i> حفظ الإعدادات
                        </button>
                    </div>

                    <div>
                        <p class="text-sm font-bold mb-2 flex items-center gap-2">
                            <i class="fa-solid fa-eye text-primary"></i> معاينة مباشرة
                        </p>
                        <div class="bg-slate-100 rounded-2xl p-4 sticky top-4">
                            <div id="inv-live-preview" class="mx-auto" style="max-width:300px;">
                                ${this.buildPreview(inv)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        ['inv-headerAr','inv-phone','inv-address','inv-taxNumber','inv-footerText'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => Settings.updateLivePreview());
        });
        ['inv-showLogo','inv-showTax','inv-showServiceCharge'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => Settings.updateLivePreview());
        });
    },

    buildPreview: function(inv) {
        return `
            <div class="bg-white rounded-lg shadow-lg p-4 text-center" style="font-size:10px;">
                ${inv.showLogo !== false && inv.logo ? `<img src="${inv.logo}" style="max-height:40px;margin:0 auto 4px;">` : ''}
                <h4 class="font-black" style="font-size:14px;">${Utils.esc(inv.headerAr||'اسم المطعم')}</h4>
                <p>${Utils.esc(inv.address||'العنوان')}</p>
                <p>${inv.phone?'هاتف: '+inv.phone:''}</p>
                ${inv.taxNumber?`<p>الرقم الضريبي: ${inv.taxNumber}</p>`:''}
                <hr class="my-2 border-dashed border-slate-400">
                <div class="text-right">
                    <div class="flex justify-between"><span>رقم الفاتورة:</span><span class="font-en">INV-2026-00001</span></div>
                    <div class="flex justify-between"><span>التاريخ:</span><span>${Utils.formatDate(new Date())}</span></div>
                </div>
                <hr class="my-2 border-dashed border-slate-400">
                <table class="w-full text-right" style="font-size:10px;">
                    <tr class="border-b border-slate-300"><td>صنف 1</td><td>2</td><td>100</td><td>200</td></tr>
                    <tr class="border-b border-slate-300"><td>صنف 2</td><td>1</td><td>300</td><td>300</td></tr>
                </table>
                <hr class="my-2 border-dashed border-slate-400">
                <div class="text-right">
                    <div class="flex justify-between"><span>المجموع:</span><span>500</span></div>
                    ${inv.showTax !== false ? `<div class="flex justify-between"><span>الضريبة:</span><span>25</span></div>` : ''}
                    ${inv.showServiceCharge !== false ? `<div class="flex justify-between"><span>الخدمة:</span><span>50</span></div>` : ''}
                    <div class="flex justify-between font-black border-t-2 border-slate-800 mt-1 pt-1">
                        <span>الإجمالي:</span><span>575</span>
                    </div>
                </div>
                <hr class="my-2 border-dashed border-slate-400">
                <p class="font-bold">${Utils.esc(inv.footerText||'شكراً لزيارتكم')}</p>
            </div>
        `;
    },

    updateLivePreview: function() {
        const settings = DB.get('settings') || {};
        const inv = {
            headerAr: document.getElementById('inv-headerAr').value,
            phone: document.getElementById('inv-phone').value,
            address: document.getElementById('inv-address').value,
            taxNumber: document.getElementById('inv-taxNumber').value,
            footerText: document.getElementById('inv-footerText').value,
            logo: (settings.invoice || {}).logo,
            showLogo: document.getElementById('inv-showLogo').checked,
            showTax: document.getElementById('inv-showTax').checked,
            showServiceCharge: document.getElementById('inv-showServiceCharge').checked
        };
        const el = document.getElementById('inv-live-preview');
        if (el) el.innerHTML = this.buildPreview(inv);
    },

    uploadLogo: function(input) {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 200*1024) { Utils.toast('error', 'حجم الملف كبير جداً (الحد 200KB)'); return; }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const settings = DB.get('settings') || {};
            if (!settings.invoice) settings.invoice = {};
            settings.invoice.logo = dataUrl;
            DB.set('settings', settings);
            
            const preview = document.getElementById('logo-preview');
            if (preview) preview.innerHTML = `<img src="${dataUrl}" class="w-full h-full object-contain">`;
            
            this.updateLivePreview();
            Utils.toast('success', 'تم رفع الشعار');
        };
        reader.readAsDataURL(file);
    },

    removeLogo: function() {
        const settings = DB.get('settings') || {};
        if (settings.invoice) settings.invoice.logo = '';
        DB.set('settings', settings);
        this.renderInvoice();
        Utils.toast('success', 'تم حذف الشعار');
    },

    saveInvoice: function() {
        const settings = DB.get('settings') || {};
        if (!settings.invoice) settings.invoice = {};
        
        settings.invoice.headerAr = document.getElementById('inv-headerAr').value.trim();
        settings.invoice.headerEn = document.getElementById('inv-headerEn').value.trim();
        settings.invoice.phone = document.getElementById('inv-phone').value.trim();
        settings.invoice.taxNumber = document.getElementById('inv-taxNumber').value.trim();
        settings.invoice.address = document.getElementById('inv-address').value.trim();
        settings.invoice.footerText = document.getElementById('inv-footerText').value.trim();
        settings.invoice.showLogo = document.getElementById('inv-showLogo').checked;
        settings.invoice.showTax = document.getElementById('inv-showTax').checked;
        settings.invoice.showServiceCharge = document.getElementById('inv-showServiceCharge').checked;
        settings.invoice.autoPrint = document.getElementById('inv-autoPrint').checked;
        
        DB.set('settings', settings);
        DB.log('settings', 'تحديث إعدادات الفاتورة');
        Utils.toast('success', 'تم حفظ إعدادات الفاتورة');
    },

    // ============================================
    // إعدادات الطباعة ⭐ (المُصلحة بالكامل)
    // ============================================
    renderPrinter: function() {
    const container = document.getElementById('settings-content');
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    
    const currentSize = inv.paperSize || 'A4';
    const currentCopies = inv.printCopies || 1;
    const currentPrinter = inv.defaultPrinter || 'default';
    
    console.log('📄 Rendering printer with size:', currentSize);
    
    const paperSizes = [
        { id:'A4', label:'A4', desc:'210×297mm - ورق رسمي', icon:'fa-file-lines', color:'#1e40af' },
        { id:'A5', label:'A5', desc:'148×210mm - نصف A4', icon:'fa-file', color:'#0284c7' },
        { id:'80mm', label:'حراري 80mm', desc:'طابعة كاشير قياسية', icon:'fa-receipt', color:'#059669' },
        { id:'58mm', label:'حراري 58mm', desc:'طابعة محمولة صغيرة', icon:'fa-receipt', color:'#d97706' }
    ];

    container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                <i class="fa-solid fa-print text-primary"></i> إعدادات الطباعة
            </h3>

            <div class="space-y-6">
                <!-- اختيار حجم الورق -->
                <div>
                    <label class="block text-sm font-bold mb-3">
                        حجم ورق الطباعة الافتراضي
                        <span class="ml-2 badge badge-info" id="current-size-badge">${currentSize}</span>
                    </label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        ${paperSizes.map(p => `
                            <button onclick="Settings.setPaperSize('${p.id}')" data-paper="${p.id}"
                                    class="printer-size-btn p-4 rounded-2xl border-2 text-center transition-all">
                                <i class="fa-solid ${p.icon} text-3xl mb-2" style="color:${p.color};"></i>
                                <p class="font-bold">${p.label}</p>
                                <p class="text-xs opacity-70 mt-1">${p.desc}</p>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- المعاينة الحية -->
                <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                    <p class="text-sm font-bold mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-eye text-primary"></i> معاينة مباشرة للحجم المختار
                    </p>
                    <div class="flex justify-center">
                        <div id="size-preview" class="bg-white rounded-lg shadow-md flex items-center justify-center text-slate-400" 
                             style="border: 2px dashed #cbd5e1;">
                            <div class="text-center p-4">
                                <i class="fa-solid fa-file text-4xl mb-2"></i>
                                <p class="text-xs font-bold" id="preview-label">${currentSize}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- عدد النسخ + الطابعة -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold mb-1">عدد النسخ</label>
                        <input type="number" id="inv-copies" value="${currentCopies}" min="1" max="10"
                               class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-sm font-bold mb-1">الطابعة الافتراضية</label>
                        <select id="inv-printer" class="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-primary">
                            <option value="default" ${currentPrinter==='default'?'selected':''}>الطابعة الافتراضية للنظام</option>
                            <option value="a4printer" ${currentPrinter==='a4printer'?'selected':''}>طابعة A4 / ليزر</option>
                            <option value="thermal1" ${currentPrinter==='thermal1'?'selected':''}>طابعة الكاشير (حرارية 80mm)</option>
                            <option value="thermal2" ${currentPrinter==='thermal2'?'selected':''}>طابعة المطبخ (حرارية 58mm)</option>
                        </select>
                    </div>
                </div>

                <!-- شرح -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                    <i class="fa-solid fa-info-circle"></i>
                    <strong>ملاحظة:</strong> سيتم استخدام هذا الحجم لجميع الفواتير والسندات والتقارير والكشوفات تلقائياً.
                </div>

                <!-- أزرار -->
                <div class="flex flex-wrap gap-3">
                    <button onclick="Settings.savePrinter()" class="px-6 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                        <i class="fa-solid fa-check"></i> حفظ الإعدادات
                    </button>
                    <button onclick="Settings.testPrint()" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">
                        <i class="fa-solid fa-print"></i> طباعة اختبارية
                    </button>
                </div>
            </div>
        </div>
    `;
    
    this.updatePaperButtons();
    this.updateSizePreview();
},

// ✅ جديد: تحديث معاينة الحجم
updateSizePreview: function() {
    const size = Utils.getPaperSize();
    const previewEl = document.getElementById('size-preview');
    const labelEl = document.getElementById('preview-label');
    if (!previewEl) return;
    
    const sizes = {
        'A4': { w: 180, h: 250, label: 'A4 (210×297mm)' },
        'A5': { w: 130, h: 180, label: 'A5 (148×210mm)' },
        '80mm': { w: 100, h: 200, label: 'حراري 80mm' },
        '58mm': { w: 75, h: 180, label: 'حراري 58mm' }
    };
    
    const cfg = sizes[size] || sizes['A4'];
    previewEl.style.width = cfg.w + 'px';
    previewEl.style.height = cfg.h + 'px';
    if (labelEl) labelEl.textContent = cfg.label;
},

updatePaperButtons: function() {
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    const currentSize = inv.paperSize || 'A4';
    
    document.querySelectorAll('.printer-size-btn').forEach(b => {
        const isActive = b.dataset.paper === currentSize;
        b.className = `printer-size-btn p-4 rounded-2xl border-2 text-center transition-all ${
            isActive 
                ? 'border-primary bg-primary/5 text-primary shadow-md ring-2 ring-primary/20' 
                : 'border-slate-200 hover:border-primary text-slate-600'
        }`;
    });

    const badge = document.getElementById('current-size-badge');
    if (badge) badge.textContent = currentSize;
    
    this.updateSizePreview();
},

setPaperSize: function(size) {
    const settings = DB.get('settings') || {};
    if (!settings.invoice) settings.invoice = {};
    settings.invoice.paperSize = size;
    DB.set('settings', settings);
    
    const verify = DB.get('settings').invoice.paperSize;
    console.log('✅ Paper size saved:', size, '| Verify:', verify);
    
    this.updatePaperButtons();
    Utils.toast('success', `تم اختيار ${size} - سيُطبق على جميع المستندات`);
    DB.log('settings', `تغيير حجم الورق إلى ${size}`);
},

savePrinter: function() {
    const settings = DB.get('settings') || {};
    if (!settings.invoice) settings.invoice = {};
    
    settings.invoice.printCopies = parseInt(document.getElementById('inv-copies').value) || 1;
    settings.invoice.defaultPrinter = document.getElementById('inv-printer').value;
    
    if (!settings.invoice.paperSize) {
        settings.invoice.paperSize = 'A4';
    }
    
    DB.set('settings', settings);
    
    console.log('✅ Printer settings saved:', settings.invoice);
    DB.log('settings', `حفظ إعدادات الطباعة - ${settings.invoice.paperSize}`);
    Utils.toast('success', `تم حفظ الإعدادات (${settings.invoice.paperSize})`);
    
    this.updatePaperButtons();
},

    testPrint: function() {
        const sys = DB.get('system') || {};
        const settings = DB.get('settings') || {};
        const inv = settings.invoice || {};
        
        // ✅ استخدم Utils.getPaperClass() - يقرأ من DB مباشرة
        const paperClass = Utils.getPaperClass();
        const currentSize = Utils.getPaperSize();
        
        console.log('🖨️ Test print with paperClass:', paperClass, '| Size:', currentSize);

        const html = `
            <div class="invoice-preview ${paperClass} mx-auto text-center">
                <div class="invoice-header">
                    ${inv.showLogo !== false && inv.logo ? `<img src="${inv.logo}" class="logo">` : ''}
                    <h1>${Utils.esc(inv.headerAr || sys.nameAr || 'اسم المطعم')}</h1>
                    <p>${Utils.esc(inv.address || '')}</p>
                    <p>${inv.phone ? 'هاتف: ' + inv.phone : ''}</p>
                </div>

                <div style="text-align:center;">
                    <span class="doc-type-badge">فاتورة اختبارية</span>
                </div>

                <div class="doc-info-grid">
                    <div class="doc-info-row"><span class="label">مقاس الورق</span><span class="value" style="color:#dc2626;font-weight:900;">${currentSize}</span></div>
                    <div class="doc-info-row"><span class="label">عدد النسخ</span><span class="value">${inv.printCopies || 1}</span></div>
                    <div class="doc-info-row"><span class="label">التاريخ</span><span class="value">${Utils.formatDate(new Date(), true)}</span></div>
                    <div class="doc-info-row"><span class="label">المستخدم</span><span class="value">${Utils.esc(Utils.currentUser()?.name || '')}</span></div>
                </div>

                <table class="doc-items-table">
                    <thead>
                        <tr>
                            <th style="text-align:right;">الصنف</th>
                            <th style="text-align:center;">كمية</th>
                            <th style="text-align:center;">سعر</th>
                            <th style="text-align:left;">إجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>صنف تجريبي 1</td><td style="text-align:center;">2</td><td style="text-align:center;">100</td><td style="text-align:left;" class="amount">200</td></tr>
                        <tr><td>صنف تجريبي 2</td><td style="text-align:center;">1</td><td style="text-align:center;">300</td><td style="text-align:left;" class="amount">300</td></tr>
                    </tbody>
                </table>

                <div class="doc-totals">
                    <div class="row"><span>المجموع الفرعي</span><span>500 ${sys.currency || ''}</span></div>
                    <div class="row tax"><span>الضريبة</span><span>25 ${sys.currency || ''}</span></div>
                    <div class="row grand-total"><span>الإجمالي</span><span>525 ${sys.currency || ''}</span></div>
                </div>

                <div class="doc-footer">
                    ${Utils.esc(inv.footerText || 'شكراً لزيارتكم')}
                    <div class="system-version">${sys.nameEn || ''} v${sys.version || ''}</div>
                </div>
            </div>
        `;
        Utils.printHTML(html, 'اختبار طباعة');
        Utils.toast('info', `طباعة اختبارية بمقاس: ${currentSize}`);
    },
    
    // ============================================
// 🎨 المظهر والصوت
// ============================================
renderAppearance: function() {
    const container = document.getElementById('settings-content');
    const settings = DB.get('settings') || {};
    const appearance = settings.appearance || {
        darkMode: false,
        soundsEnabled: true,
        vibrationEnabled: true,
        volume: 70,
        primaryColor: '#1e3a8a',
        accentColor: '#d97706'
    };

    container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                <i class="fa-solid fa-palette text-amber-500"></i> المظهر والصوت
            </h3>

            <div class="space-y-5">

                <!-- الوضع الليلي -->
                <div class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-2xl">
                                🌗
                            </div>
                            <div>
                                <p class="font-bold text-lg">تبديل الوضع (ليلي/نهاري)</p>
                                <p class="text-xs opacity-75 mt-1">يتم تبديل المظهر فوراً</p>
                            </div>
                        </div>
                        <button onclick="Settings.toggleDarkMode()" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold transition-all shadow-lg">
                            <i class="fa-solid fa-moon"></i> <span id="dark-mode-label">${appearance.darkMode ? 'نهاري' : 'ليلي'}</span>
                        </button>
                    </div>
                </div>

                <!-- الأصوات -->
                <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <i class="fa-solid fa-volume-high"></i>
                            </div>
                            <div>
                                <p class="font-bold">الأصوات</p>
                                <p class="text-xs text-slate-500">تشغيل أصوات التنبيه عند العمليات</p>
                            </div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="app-sounds" ${appearance.soundsEnabled ? 'checked' : ''} onchange="Settings.toggleAppearance('soundsEnabled', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>

                <!-- الاهتزاز -->
                <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                <i class="fa-solid fa-mobile-screen"></i>
                            </div>
                            <div>
                                <p class="font-bold">الاهتزاز</p>
                                <p class="text-xs text-slate-500">اهتزاز الجوال عند التنبيهات</p>
                            </div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="app-vibration" ${appearance.vibrationEnabled ? 'checked' : ''} onchange="Settings.toggleAppearance('vibrationEnabled', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>

                <!-- مستوى الصوت -->
                <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <label class="block font-bold mb-3 flex items-center justify-between">
                        <span>مستوى الصوت</span>
                        <span id="volume-value" class="text-amber-600 font-black">${appearance.volume}%</span>
                    </label>
                    <input type="range" id="app-volume" min="0" max="100" value="${appearance.volume}" 
                           class="w-full accent-amber-500" 
                           oninput="document.getElementById('volume-value').textContent = this.value + '%'; Settings.toggleAppearance('volume', parseInt(this.value))">
                </div>

                <!-- أزرار الاختبار -->
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="Settings.testSound()" class="py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors">
                        <i class="fa-solid fa-volume-high"></i> اختبار الصوت
                    </button>
                    <button onclick="Settings.testVibration()" class="py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors">
                        <i class="fa-solid fa-mobile-screen"></i> اختبار الاهتزاز
                    </button>
                </div>

                <!-- الخصائص -->
                <div class="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                    <i class="fa-solid fa-info-circle"></i>
                    <strong>ملاحظة:</strong> يتم حفظ الإعدادات تلقائياً عند تغييرها.
                </div>
            </div>
        </div>
    `;

    this.applyTheme(appearance.darkMode);
},

// ✅ تبديل الوضع الليلي
toggleDarkMode: function() {
    const settings = DB.get('settings') || {};
    if (!settings.appearance) settings.appearance = {};
    
    settings.appearance.darkMode = !settings.appearance.darkMode;
    DB.set('settings', settings);

    this.applyTheme(settings.appearance.darkMode);

    const label = document.getElementById('dark-mode-label');
    if (label) label.textContent = settings.appearance.darkMode ? 'نهاري' : 'ليلي';

    Utils.toast('success', settings.appearance.darkMode ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري');
},

// ✅ تطبيق الوضع الليلي على الصفحة
applyTheme: function(darkMode) {
    if (darkMode) {
        document.documentElement.classList.add('dark-mode');
        document.body.style.background = '#0f172a';
        document.body.style.color = '#e2e8f0';
        
        // ✅ حفظ في localStorage للتطبيق في كل الصفحات
        localStorage.setItem('ibra_dark_mode', 'true');
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.style.background = '';
        document.body.style.color = '';
        localStorage.setItem('ibra_dark_mode', 'false');
    }
},

// ✅ تبديل الإعداد
toggleAppearance: function(key, value) {
    const settings = DB.get('settings') || {};
    if (!settings.appearance) settings.appearance = {};
    settings.appearance[key] = value;
    DB.set('settings', settings);
    DB.log('settings', `تغيير ${key} إلى ${value}`);
},

// ✅ اختبار الصوت
testSound: function() {
    const settings = DB.get('settings') || {};
    const volume = (settings.appearance?.volume || 70) / 100;
    
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        Utils.toast('success', 'تم تشغيل الصوت');
    } catch (e) {
        Utils.toast('error', 'لا يمكن تشغيل الصوت');
    }
},

// ✅ اختبار الاهتزاز
testVibration: function() {
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
        Utils.toast('success', 'تم الاهتزاز');
    } else {
        Utils.toast('warning', 'جهازك لا يدعم الاهتزاز');
    }
},

    // ============================================
    // إعدادات نقطة البيع
    // ============================================
    renderPOS: function() {
        const container = document.getElementById('settings-content');
        const settings = DB.get('settings') || {};
        const pos = settings.pos || {};

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-cash-register text-primary"></i> إعدادات نقطة البيع
                </h3>

                <div class="space-y-3">
                    ${[
                        { id:'soundEnabled', label:'تشغيل صوت عند إضافة صنف', desc:'صوت تنبيه قصير عند كل إضافة' },
                        { id:'autoFocusSearch', label:'تركيز تلقائي على البحث', desc:'عند فتح نقطة البيع يتم التركيز على حقل البحث' },
                        { id:'allowNegativeStock', label:'السماح بالمخزون السالب', desc:'السماح بالبيع حتى لو نفذت الكمية' },
                        { id:'tableService', label:'تفعيل خدمة الطاولات', desc:'عرض خيار "محلي" واختيار الطاولة' },
                        { id:'takeaway', label:'تفعيل الطلبات السفري', desc:'عرض خيار "سفري"' },
                        { id:'delivery', label:'تفعيل التوصيل', desc:'عرض خيار "توصيل"' }
                    ].map(opt => `
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <p class="font-bold text-sm">${opt.label}</p>
                                <p class="text-xs text-slate-500">${opt.desc}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="pos-${opt.id}" ${pos[opt.id]!==false?'checked':''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                    `).join('')}
                </div>

                <button onclick="Settings.savePOS()" class="mt-4 px-6 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-check"></i> حفظ الإعدادات
                </button>
            </div>
        `;
    },

    savePOS: function() {
        const settings = DB.get('settings') || {};
        if (!settings.pos) settings.pos = {};
        const keys = ['soundEnabled','autoFocusSearch','allowNegativeStock','tableService','takeaway','delivery'];
        keys.forEach(k => {
            const el = document.getElementById('pos-'+k);
            if (el) settings.pos[k] = el.checked;
        });
        DB.set('settings', settings);
        DB.log('settings', 'تحديث إعدادات نقطة البيع');
        Utils.toast('success', 'تم حفظ الإعدادات');
    },

    // ============================================
    // النسخ الاحتياطي
    // ============================================
    renderBackup: function() {
        const container = document.getElementById('settings-content');
        const allData = DB.exportAll();
        const dataSize = new Blob([JSON.stringify(allData)]).size;
        const sizeKB = (dataSize / 1024).toFixed(1);

        const invoices = (DB.get('invoices')||[]).length;
        const orders = (DB.get('orders')||[]).length;
        const purchases = (DB.get('purchases')||[]).length;
        const vouchers = (DB.get('vouchers')||[]).length;

        container.innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-database text-primary"></i> النسخ الاحتياطي والاستعادة
                </h3>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div class="bg-blue-50 rounded-xl p-3 text-center">
                        <p class="text-2xl font-black text-blue-700">${invoices}</p>
                        <p class="text-xs text-blue-600">فواتير</p>
                    </div>
                    <div class="bg-green-50 rounded-xl p-3 text-center">
                        <p class="text-2xl font-black text-green-700">${orders}</p>
                        <p class="text-xs text-green-600">طلبات</p>
                    </div>
                    <div class="bg-amber-50 rounded-xl p-3 text-center">
                        <p class="text-2xl font-black text-amber-700">${purchases}</p>
                        <p class="text-xs text-amber-600">مشتريات</p>
                    </div>
                    <div class="bg-purple-50 rounded-xl p-3 text-center">
                        <p class="text-2xl font-black text-purple-700">${vouchers}</p>
                        <p class="text-xs text-purple-600">سندات</p>
                    </div>
                </div>

                <div class="bg-slate-50 rounded-xl p-4 mb-4 flex items-center justify-between">
                    <div>
                        <p class="text-sm font-bold">حجم البيانات الحالي</p>
                        <p class="text-xs text-slate-500">حجم قاعدة البيانات المحلية</p>
                    </div>
                    <span class="text-2xl font-black text-primary">${sizeKB} KB</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button onclick="Settings.exportData()" class="p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl text-right transition-all">
                        <i class="fa-solid fa-download text-3xl text-blue-600 mb-2"></i>
                        <p class="font-bold text-blue-900">تصدير البيانات</p>
                        <p class="text-xs text-blue-700 mt-1">حفظ نسخة احتياطية</p>
                    </button>
                    <button onclick="document.getElementById('import-file').click()" class="p-5 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-2xl text-right transition-all">
                        <i class="fa-solid fa-upload text-3xl text-green-600 mb-2"></i>
                        <p class="font-bold text-green-900">استعادة من ملف</p>
                        <p class="text-xs text-green-700 mt-1">استرجاع البيانات</p>
                    </button>
                </div>
                <input type="file" id="import-file" accept=".json" onchange="Settings.importData(this)" class="hidden">

                <div class="mt-6 pt-6 border-t border-red-200">
                    <h4 class="font-bold text-red-700 mb-3 flex items-center gap-2">
                        <i class="fa-solid fa-triangle-exclamation"></i> منطقة الخطر
                    </h4>
                    <button onclick="Settings.resetSystem()" class="w-full p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-2xl text-right transition-all">
                        <p class="font-bold text-red-900">إعادة تعيين النظام</p>
                        <p class="text-xs text-red-700 mt-1">حذف جميع البيانات وإعادة التعيين</p>
                    </button>
                </div>
            </div>
        `;
    },

    exportData: function() {
        const data = DB.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ibra-erp-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        DB.log('settings', 'تصدير نسخة احتياطية');
        Utils.toast('success', 'تم تصدير البيانات');
    },

    importData: function(input) {
        const file = input.files[0];
        if (!file) return;
        Utils.confirm('سيتم استبدال جميع البيانات الحالية. متأكد؟', () => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    DB.importAll(data);
                    DB.log('settings', 'استعادة من نسخة احتياطية');
                    Utils.toast('success', 'تم الاستعادة - إعادة التحميل...');
                    setTimeout(() => location.reload(), 1500);
                } catch (err) {
                    Utils.toast('error', 'ملف غير صالح');
                }
            };
            reader.readAsText(file);
        });
    },

    resetSystem: function() {
        Utils.confirm('⚠️ سيتم حذف جميع البيانات. متأكد؟', () => {
            Utils.confirm('تأكيد أخير؟', () => {
                DB.reset();
                Utils.toast('success', 'تم إعادة التعيين');
                setTimeout(() => location.reload(), 1000);
            }, 'تحذير نهائي');
        });
    },

    // ============================================
    // المطور
    // ============================================
    renderDeveloper: function() {
        const container = document.getElementById('settings-content');
        const dev = DB.get('developerInfo') || {};
        const sys = DB.get('system') || {};

        container.innerHTML = `
            <div class="glass-card rounded-3xl overflow-hidden relative">
                <div class="h-32 bg-gradient-to-r from-slate-900 via-primary to-slate-800 relative overflow-hidden">
                    <div class="absolute bottom-4 right-6 flex items-center gap-2 text-white/90 font-en text-sm tracking-widest uppercase">
                        <i class="fa-solid fa-laptop-code text-secondary"></i>
                        <span>${sys.nameEn}</span>
                    </div>
                </div>

                <div class="p-8 relative">
                    <div class="absolute -top-16 left-8">
                        <div class="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg transform rotate-3">
                            <div class="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white font-en">
                                <span class="text-2xl font-black">IBRA</span>
                                <span class="text-[10px] text-secondary tracking-widest">SOFT</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">👨‍💻 المطور</p>
                                <h3 class="text-2xl font-bold text-slate-900 font-en">${Utils.esc(dev.nameEn)}</h3>
                                <p class="text-primary font-semibold text-sm mt-1 font-en">${Utils.esc(dev.titleEn)}</p>
                                <p class="text-slate-600 mt-1">${Utils.esc(dev.nameAr)}</p>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">🏢 المؤسسة</p>
                                <p class="text-lg font-bold text-slate-800">${Utils.esc(dev.organizationAr)}</p>
                                <p class="text-sm font-en text-slate-500">${Utils.esc(dev.organizationEn)}</p>
                            </div>
                        </div>

                        <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <p class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-headset text-primary"></i> التواصل
                            </p>
                            ${(dev.phones||[]).map(p => `
                                <div class="flex gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm mb-2">
                                    <span class="font-en font-bold text-slate-700 tracking-wider flex-1 text-center" dir="ltr">${p.number}</span>
                                    <button onclick="window.open('tel:${p.number}','_self')" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                                        <i class="fa-solid fa-phone text-xs"></i>
                                    </button>
                                    <button onclick="window.open('https://wa.me/${p.number.replace(/[+\\s]/g,'')}','_blank')" class="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center">
                                        <i class="fa-brands fa-whatsapp text-sm"></i>
                                    </button>
                                    <button onclick="Settings.copyPhone('${p.number}')" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center">
                                        <i class="fa-regular fa-copy text-xs"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between text-sm">
                        <div class="flex items-center gap-2 text-slate-500">
                            <i class="fa-regular fa-copyright"></i>
                            <span>جميع الحقوق محفوظة © ${dev.copyrightYear} م/ ${Utils.esc(dev.copyrightOwnerAr)}</span>
                        </div>
                        <span class="text-slate-500 text-xs font-bold font-en">System Core V ${sys.version}</span>
                    </div>
                </div>
            </div>
        `;
    },

    copyPhone: function(num) {
        const textArea = document.createElement("textarea");
        textArea.value = num;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        Utils.toast('success', `تم نسخ: ${num}`);
    }
};