/**
 * Utility Functions
 */
const Utils = {
    // Format currency
    formatCurrency: function(amount, currency = 'ر.ي') {
        const num = parseFloat(amount) || 0;
        return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' ' + currency;
    },

    // Format date
    formatDate: function(date, withTime = false) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (withTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return d.toLocaleDateString('ar-EG', options);
    },

    // Format time
    formatTime: function(date) {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    },

    // Generate invoice number
    generateInvoiceNumber: function(prefix = 'INV') {
        const invoices = DB.get('invoices') || [];
        const year = new Date().getFullYear();
        const count = invoices.filter(i => new Date(i.date).getFullYear() === year).length + 1;
        return `${prefix}-${year}-${String(count).padStart(5, '0')}`;
    },

    // Generate order number
    generateOrderNumber: function() {
        const orders = DB.get('orders') || [];
        const year = new Date().getFullYear();
        const count = orders.filter(o => new Date(o.date).getFullYear() === year).length + 1;
        return `ORD-${year}-${String(count).padStart(5, '0')}`;
    },

    // Generate voucher number
    generateVoucherNumber: function(type) {
        const vouchers = DB.get('vouchers') || [];
        const year = new Date().getFullYear();
        const prefix = { receipt: 'RCV', payment: 'PAY', journal: 'JRN', simple: 'SMP' }[type] || 'VCH';
        const count = vouchers.filter(v => new Date(v.date).getFullYear() === year).length + 1;
        return `${prefix}-${year}-${String(count).padStart(5, '0')}`;
    },

    // Toast notification
    toast: function(type, message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toastId = 'toast-' + Date.now();
        
        const config = {
            success: { bg: 'bg-slate-800', icon: 'fa-check-circle text-green-400' },
            error: { bg: 'bg-red-600', icon: 'fa-circle-exclamation text-white' },
            warning: { bg: 'bg-amber-600', icon: 'fa-triangle-exclamation text-white' },
            info: { bg: 'bg-blue-600', icon: 'fa-circle-info text-white' }
        };
        const c = config[type] || config.info;

        const html = `
            <div id="${toastId}" class="toast flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${c.bg} text-white min-w-[280px]">
                <i class="fa-solid ${c.icon}"></i>
                <span class="text-sm font-semibold flex-1">${message}</span>
                <button onclick="document.getElementById('${toastId}').remove()" class="text-white/70 hover:text-white">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        const el = document.getElementById(toastId);

        setTimeout(() => {
            el.classList.add('hide');
            setTimeout(() => el.remove(), 300);
        }, 3500);
    },

    // Confirm dialog
    confirm: function(message, onConfirm, title = 'تأكيد العملية') {
        const modalId = 'confirm-' + Date.now();
        const html = `
            <div id="${modalId}" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[95] flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden screen-enter">
                    <div class="p-6">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <i class="fa-solid fa-triangle-exclamation text-amber-600 text-xl"></i>
                            </div>
                            <h3 class="text-lg font-bold">${title}</h3>
                        </div>
                        <p class="text-slate-600">${message}</p>
                    </div>
                    <div class="bg-slate-50 px-6 py-4 flex gap-3 justify-end">
                        <button onclick="document.getElementById('${modalId}').remove()" class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors">
                            إلغاء
                        </button>
                        <button id="${modalId}-ok" class="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-lg text-sm font-bold transition-colors">
                            تأكيد
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('modal-root').insertAdjacentHTML('beforeend', html);
        document.getElementById(`${modalId}-ok`).onclick = () => {
            document.getElementById(modalId).remove();
            onConfirm();
        };
    },

    // Modal
    modal: function(title, content, options = {}) {
        const modalId = 'modal-' + Date.now();
        const size = options.size || 'max-w-2xl';
        const html = `
            <div id="${modalId}" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[95] flex items-center justify-center p-4 overflow-y-auto">
                <div class="bg-white rounded-2xl shadow-2xl w-full ${size} my-8 screen-enter">
                    <div class="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
                        <h3 class="text-lg font-bold">${title}</h3>
                        <button onclick="document.getElementById('${modalId}').remove()" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div class="p-4 md:p-6">${content}</div>
                </div>
            </div>
        `;
        document.getElementById('modal-root').insertAdjacentHTML('beforeend', html);
        return modalId;
    },

    // Print HTML
    printHTML: function(html, title = 'طباعة') {
    const sys = DB.get('system') || {};
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    
    const paperSize = inv.paperSize || 'A4';
    const pageSize = this.getPageSizeCSS(); // ✅ صيغة صحيحة
    const copies = inv.printCopies || 1;
    
    console.log('🖨️ printHTML | paperSize:', paperSize, '| pageSize:', pageSize, '| copies:', copies);

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
        Utils.toast('error', 'الرجاء السماح بالنوافذ المنبثقة للطباعة');
        return;
    }
    
    const baseUrl = window.location.href.replace(/\/[^\/]*$/, '/');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link rel="stylesheet" href="${baseUrl}css/style.css">
            <style>
                @page { 
                    size: ${pageSize}; 
                    margin: 0; 
                }
                
                * { 
                    box-sizing: border-box; 
                    margin: 0; 
                    padding: 0;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                html, body { 
                    font-family: 'Cairo', sans-serif; 
                    direction: rtl; 
                    background: #e2e8f0; 
                }
                
                body { 
                    display: flex; 
                    justify-content: center; 
                    align-items: flex-start; 
                    min-height: 100vh; 
                    padding: 20px; 
                }
                
                .print-toolbar { 
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    right: 0; 
                    background: #1e3a8a; 
                    color: white;
                    padding: 10px 20px; 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    z-index: 9999; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
                    font-family: 'Cairo', sans-serif; 
                }
                
                .print-toolbar button { 
                    padding: 8px 18px; 
                    background: white; 
                    color: #1e3a8a; 
                    border: none;
                    border-radius: 8px; 
                    font-weight: 800; 
                    cursor: pointer; 
                    font-family: 'Cairo', sans-serif;
                    font-size: 13px; 
                    margin-right: 6px; 
                }
                
                .print-toolbar button:hover { 
                    background: #d97706; 
                    color: white; 
                }
                
                .print-content { 
                    margin-top: 70px; 
                    display: flex; 
                    justify-content: center; 
                    width: 100%; 
                }
                
                @media print {
                    body { 
                        background: white; 
                        padding: 0; 
                        display: block; 
                    }
                    .print-toolbar { 
                        display: none !important; 
                    }
                    .print-content { 
                        margin: 0 !important; 
                        display: block !important; 
                    }
                    .doc-paper, .invoice-preview { 
                        box-shadow: none !important; 
                        margin: 0 auto !important; 
                    }
                }
            </style>
        </head>
        <body>
            <div class="print-toolbar no-print">
                <span style="font-weight:700;">
                    <i class="fa-solid fa-print"></i> 
                    معاينة الطباعة — مقاس: <strong style="color:#fbbf24;">${paperSize}</strong>
                    ${copies > 1 ? ` — نسخ: <strong style="color:#fbbf24;">${copies}</strong>` : ''}
                </span>
                <div>
                    <button onclick="window.print()">
                        <i class="fa-solid fa-print"></i> طباعة
                    </button>
                    <button onclick="window.close()" style="background:#e2e8f0;color:#475569;">
                        <i class="fa-solid fa-xmark"></i> إغلاق
                    </button>
                </div>
            </div>
            <div class="print-content">
                ${html}
            </div>
            <script>
                window.addEventListener('load', function() {
                    if (document.fonts && document.fonts.ready) {
                        document.fonts.ready.then(function() {
                            setTimeout(function() { 
                                window.focus(); 
                                window.print(); 
                            }, 500);
                        });
                    } else {
                        setTimeout(function() { 
                            window.focus(); 
                            window.print(); 
                        }, 1000);
                    }
                });
            <\/script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
},

    // Export to CSV
    exportCSV: function(data, filename = 'export.csv') {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    },

    // Calculate cart totals
    calculateCart: function(cart, options = {}) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = options.discount || 0;
        const taxRate = options.taxRate || 0;
        const serviceRate = options.serviceRate || 0;
        
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * taxRate;
        const service = afterDiscount * serviceRate;
        const total = afterDiscount + tax + service;
        
        return { subtotal, discount, tax, service, total, afterDiscount };
    },

    // Get current user
    currentUser: function() {
        try {
            return JSON.parse(sessionStorage.getItem('ibra_current_user') || 'null') || (DB.get('users') || [])[0];
        } catch (e) {
            return (DB.get('users') || [])[0];
        }
    },

    // Check permission
    hasPermission: function(permission) {
        const user = this.currentUser();
        if (!user) return false;
        if (!user.permissions) return false;
        if (user.permissions.includes('all')) return true;
        return user.permissions.includes(permission);
    },

    // Sound beep
    beep: function() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    },

    // Escape HTML
    esc: function(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    },

    // Debounce
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    // Get paper class
    // ✅ إصلاح: تُرجع الصنف الصحيح المطابق لـ CSS
getPaperClass: function() {
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    const size = inv.paperSize || 'A4';
    
    // ✅ CSS يستخدم: size-a4, size-a5, size-80mm, size-58mm
    if (size === 'A4') return 'size-a4';
    if (size === 'A5') return 'size-a5';
    if (size === '58mm') return 'size-58mm';
    if (size === '80mm') return 'size-80mm';
    return 'size-a4'; // default
},

getPaperSize: function() {
    const settings = DB.get('settings') || {};
    return (settings.invoice || {}).paperSize || 'A4';
},

// ✅ دالة مساعدة: تُرجع صيغة @page الصحيحة للطباعة
getPageSizeCSS: function() {
    const size = this.getPaperSize();
    
    if (size === 'A4') return 'A4';
    if (size === 'A5') return 'A5';
    if (size === '80mm') return '80mm auto';
    if (size === '58mm') return '58mm auto';
    return 'A4';
},
    // ✅ دالة مساعدة: بناء رأس الفاتورة الجديد (كما في الصورة)
    buildNewInvoiceHeader: function(options = {}) {
        const sys = DB.get('system') || {};
        const settings = DB.get('settings') || {};
        const inv = settings.invoice || {};
        
        const title = options.title || 'فاتورة';
        const number = options.number || '';
        const date = options.date || new Date();
        
        return `
            <div class="invoice-header">
                <div class="title-left">
                    <h1 class="doc-title-main">${Utils.esc(title)}</h1>
                    ${number ? `<p class="doc-number">${Utils.esc(number)}</p>` : ''}
                    <p class="doc-datetime">${Utils.formatDate(date, true)}</p>
                </div>
                
                <div class="restaurant-center">
                    <h2 class="restaurant-name">${Utils.esc(inv.headerAr || sys.nameAr || '')}</h2>
                    ${inv.address ? `<p class="restaurant-info-line"><i class="fa-solid fa-location-dot"></i> ${Utils.esc(inv.address)}</p>` : ''}
                    ${inv.phone ? `<p class="restaurant-info-line"><i class="fa-solid fa-phone"></i> <span dir="ltr">${inv.phone}</span></p>` : ''}
                    ${inv.taxNumber ? `<p class="restaurant-info-line"><i class="fa-solid fa-file-invoice"></i> الرقم الضريبي: ${inv.taxNumber}</p>` : ''}
                </div>
                
                <div class="logo-right">
                    ${inv.showLogo !== false && inv.logo 
                        ? `<img src="${inv.logo}" alt="logo">` 
                        : `<div class="logo-placeholder"><i class="fa-solid fa-utensils"></i></div>`}
                </div>
            </div>
            <div class="invoice-header-line"></div>
        `;
    },

    // ✅ دالة مساعدة: صندوقَي معلومات
    buildInfoBlocks: function(leftTitle, leftRows, rightTitle, rightRows) {
        const leftHTML = leftRows.map(r => `
            <div class="info-line">
                <span class="info-label">${Utils.esc(r.label)}</span>
                <span class="info-value">${Utils.esc(r.value)}</span>
            </div>
        `).join('');
        
        const rightHTML = rightRows.map(r => `
            <div class="info-line">
                <span class="info-label">${Utils.esc(r.label)}</span>
                <span class="info-value">${Utils.esc(r.value)}</span>
            </div>
        `).join('');
        
        return `
            <div class="invoice-info-row">
                <div class="info-block">
                    <h4>${Utils.esc(leftTitle)}</h4>
                    ${leftHTML}
                </div>
                <div class="info-block">
                    <h4>${Utils.esc(rightTitle)}</h4>
                    ${rightHTML}
                </div>
            </div>
        `;
    },

    // ✅ دالة مساعدة: التذييل الجديد
    buildInvoiceFooter: function() {
        const sys = DB.get('system') || {};
        const dev = DB.get('developerInfo') || {};
        const settings = DB.get('settings') || {};
        const inv = settings.invoice || {};
        
        return `
            <div class="invoice-footer">
                <div class="thanks-line"></div>
                <h3 class="thanks-title">${Utils.esc(inv.footerText || 'شكراً لزيارتكم')}</h3>
                <p class="thanks-subtitle">نتشرف بخدمتكم دائماً</p>
                
                <div class="dev-divider"></div>
                
                <div class="dev-info">
                    <div class="dev-name">${Utils.esc(dev.nameEn || 'Eng. Ibrahim Al-Hammadi')}</div>
                    <div class="dev-title">${Utils.esc(dev.titleEn || 'Software Developer & Cybersecurity Engineer')}</div>
                    ${(dev.phones && dev.phones[0]) ? `<span class="dev-phone"><i class="fa-solid fa-phone"></i> ${dev.phones[0].number.replace('+','')}</span>` : ''}
                    ${(dev.phones && dev.phones[1]) ? `<span class="dev-phone"><i class="fa-solid fa-phone"></i> ${dev.phones[1].number.replace('+','')}</span>` : ''}
                    <div class="dev-copyright">جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${Utils.esc(dev.copyrightOwnerAr || '')}</div>
                </div>
            </div>
        `;
    },
    // ✅ دالة موحدة لبناء المستندات بتصميم ذهبي
buildGoldInvoice: function(options) {
    const {
        type = 'invoice',
        typeLabel = 'فاتورة',
        number = '',
        date = new Date(),
        brandName = '',
        brandSubtitle = '',
        address = '',
        phone = '',
        logo = '',
        infoCards = [],
        tableHeaders = [],
        tableRows = [],
        totals = [],
        bigAmount = null,
        qrData = null,
        signatures = ['توقيع المستلم', 'توقيع المسؤول'],
        footerThanks = 'شكراً لزيارتكم',
        footerSubtext = 'نتشرف بخدمتكم دائماً',
        devInfo = null
    } = options;

    const sys = DB.get('system') || {};
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    const paperClass = Utils.getPaperClass();

    return `
        <div id="print-area" class="doc-paper ${paperClass}">
            
            <!-- الرأس الذهبي -->
            <div class="doc-header-new type-${type}">
                <div class="doc-header-title">
                    <h1>${Utils.esc(typeLabel)}</h1>
                    ${number ? `<div class="doc-number">${Utils.esc(number)}</div>` : ''}
                    <div class="doc-date">${Utils.formatDate(date, true)}</div>
                </div>
                
                <div class="doc-header-brand">
                    <div class="doc-brand-info">
                        <div class="doc-brand-name">${Utils.esc(brandName || inv.headerAr || sys.nameAr || '')}</div>
                        ${brandSubtitle ? `<div class="doc-brand-subtitle">${Utils.esc(brandSubtitle)}</div>` : ''}
                        ${address || inv.address ? `<div class="doc-brand-address"><i class="fa-solid fa-location-dot"></i> ${Utils.esc(address || inv.address)}</div>` : ''}
                        ${phone || inv.phone ? `<div class="doc-brand-phone"><i class="fa-solid fa-phone"></i> <span style="direction:ltr;">${phone || inv.phone}</span></div>` : ''}
                    </div>
                    <div class="doc-brand-logo">
                        ${logo || inv.logo 
                            ? `<img src="${logo || inv.logo}" alt="logo">` 
                            : `<i class="fa-solid fa-utensils placeholder-icon"></i>`}
                    </div>
                </div>
            </div>

            <div class="doc-gold-divider type-${type}"></div>

${['receipt','payment','journal','simple'].includes(type) ? `
    <div class="doc-type-banner type-${type}">
        <div class="banner-content">
            <i class="fa-solid ${{
                receipt: 'fa-arrow-down',
                payment: 'fa-arrow-up',
                journal: 'fa-book',
                simple: 'fa-receipt'
            }[type]}"></i>
            ${Utils.esc(typeLabel)}
        </div>
    </div>
` : ''}

            ${infoCards.length ? `
                <div class="doc-info-pair">
                    ${infoCards.map(card => `
                        <div class="doc-info-block">
                            <h4><i class="fa-solid ${card.icon || 'fa-info-circle'}"></i> ${Utils.esc(card.title)}</h4>
                            ${card.rows.map(r => `
                                <div class="row">
                                    <span class="lbl">${Utils.esc(r.lbl)}</span>
                                    <span class="val">${Utils.esc(r.val || '-')}</span>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${tableHeaders.length ? `
                <table class="doc-gold-table type-${type}">
                    <thead>
                        <tr>${tableHeaders.map((h, i) => `
                            <th style="text-align:${i === 0 ? 'right' : i === tableHeaders.length - 1 ? 'left' : 'center'};">${Utils.esc(h)}</th>
                        `).join('')}</tr>
                    </thead>
                    <tbody>
                        ${tableRows.map(row => `
                            <tr>${row.map((cell, i) => `
                                <td class="${i === 0 ? 'amount' : i === row.length - 1 ? 'left amount' : 'center'}">${cell}</td>
                            `).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : ''}

            ${bigAmount ? `
                <div class="doc-big-amount-gold">
                    <div class="label">${Utils.esc(bigAmount.label || 'المبلغ')}</div>
                    <div class="value">${bigAmount.value}</div>
                    ${bigAmount.words ? `<div class="words">${Utils.esc(bigAmount.words)} فقط لا غير</div>` : ''}
                </div>
            ` : ''}

            ${totals.length ? `
                <div class="doc-total-section">
                    <div class="doc-total-left"></div>
                    <div class="doc-total-box type-${type}">
                        ${totals.map(t => `
                            <div class="row ${t.type || ''}">
                                <span>${Utils.esc(t.lbl)}</span>
                                <span>${t.val}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${qrData ? `
                <div class="doc-qr-gold">
                    <div id="qr-placeholder-${Date.now()}" style="width:120px;height:120px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;"></div>
                    <p>امسح للتحقق</p>
                </div>
            ` : ''}

            ${signatures.length ? `
                <div class="doc-signatures-gold">
                    ${signatures.map(s => `
                        <div class="doc-signature-gold">
                            <div class="line"></div>
                            ${Utils.esc(s)}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="doc-footer-gold">
                <div class="thanks">${Utils.esc(footerThanks)}</div>
                <div class="subtext">${Utils.esc(footerSubtext)}</div>
                ${devInfo ? `
                    <div class="dev-info">
                        <strong>${Utils.esc(devInfo.name || '')}</strong>
                        <div>${Utils.esc(devInfo.title || '')}</div>
                        ${devInfo.phone ? `<div class="phone"><i class="fa-solid fa-phone"></i> ${devInfo.phone}</div>` : ''}
                        <div class="copyright">${Utils.esc(devInfo.copyright || '')}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
},
// ============================================
// ✅ دالة موحدة لبناء التقارير بتصميم ذهبي
// ============================================
buildGoldReport: function(options) {
    const {
        reportTitle = 'تقرير',
        reportSubtitle = '',
        dateFrom = null,
        dateTo = null,
        kpiCards = [],        // [{icon, label, value, color}]
        tableHeaders = [],
        tableRows = [],
        summaryRows = [],     // [{lbl, val, type}]
        additionalBlocks = [], // [{title, icon, html}]
        signatures = ['توقيع المسؤول', 'توقيع المدقق'],
        footerNote = ''
    } = options;

    const sys = DB.get('system') || {};
    const settings = DB.get('settings') || {};
    const inv = settings.invoice || {};
    const dev = DB.get('developerInfo') || {};
    const paperClass = Utils.getPaperClass();

    // ✅ التحقق من التاريخ
    let dateRangeText = 'جميع الفترات';
    if (dateFrom && dateTo) {
        dateRangeText = `من ${Utils.formatDate(dateFrom)} إلى ${Utils.formatDate(dateTo)}`;
    } else if (dateFrom) {
        dateRangeText = `من ${Utils.formatDate(dateFrom)}`;
    } else if (dateTo) {
        dateRangeText = `حتى ${Utils.formatDate(dateTo)}`;
    }

    return `
        <div id="print-area" class="doc-paper ${paperClass}">

            <!-- رأس التقرير -->
            <div class="doc-header-new">
                <div class="doc-header-title">
                    <h1>${Utils.esc(reportTitle)}</h1>
                    ${reportSubtitle ? `<div class="doc-number">${Utils.esc(reportSubtitle)}</div>` : ''}
                    <div class="doc-date">${dateRangeText}</div>
                </div>
                
                <div class="doc-header-brand">
                    <div class="doc-brand-info">
                        <div class="doc-brand-name">${Utils.esc(inv.headerAr || sys.nameAr || '')}</div>
                        ${inv.address ? `<div class="doc-brand-address"><i class="fa-solid fa-location-dot"></i> ${Utils.esc(inv.address)}</div>` : ''}
                        ${inv.phone ? `<div class="doc-brand-phone"><i class="fa-solid fa-phone"></i> <span style="direction:ltr;">${inv.phone}</span></div>` : ''}
                    </div>
                    <div class="doc-brand-logo">
                        ${inv.showLogo !== false && inv.logo 
                            ? `<img src="${inv.logo}" alt="logo">` 
                            : `<i class="fa-solid fa-chart-line placeholder-icon"></i>`}
                    </div>
                </div>
            </div>

            <div class="doc-gold-divider"></div>

            <!-- بطاقات المؤشرات (KPI) -->
            ${kpiCards.length ? `
                <div class="doc-kpi-grid">
                    ${kpiCards.map(card => `
                        <div class="doc-kpi-card" style="border-color:${card.color || '#d97706'};">
                            <div class="doc-kpi-icon" style="color:${card.color || '#d97706'};">
                                <i class="fa-solid ${card.icon || 'fa-chart-line'}"></i>
                            </div>
                            <div class="doc-kpi-content">
                                <div class="doc-kpi-label">${Utils.esc(card.label)}</div>
                                <div class="doc-kpi-value" style="color:${card.color || '#d97706'};">${card.value}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- بلوكات إضافية (مثل: تنبيهات المواد المنخفضة) -->
            ${additionalBlocks.map(block => `
                <div class="doc-report-block">
                    <h4 class="doc-report-block-title">
                        <i class="fa-solid ${block.icon || 'fa-info-circle'}"></i>
                        ${Utils.esc(block.title)}
                    </h4>
                    <div class="doc-report-block-content">
                        ${block.html}
                    </div>
                </div>
            `).join('')}

            <!-- جدول التقرير -->
            ${tableHeaders.length ? `
                <div class="doc-report-table-wrapper">
                    <table class="doc-gold-table">
                        <thead>
                            <tr>
                                ${tableHeaders.map((h, i) => `
                                    <th style="text-align:${i === 0 ? 'right' : i === tableHeaders.length - 1 ? 'left' : 'center'};">${Utils.esc(h)}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows.length === 0 
                                ? `<tr><td colspan="${tableHeaders.length}" style="text-align:center;padding:20px;color:#94a3b8;">لا توجد بيانات</td></tr>`
                                : tableRows.map(row => `
                                    <tr>
                                        ${row.map((cell, i) => `
                                            <td class="${i === 0 ? 'amount' : i === row.length - 1 ? 'left amount' : 'center'}">${cell}</td>
                                        `).join('')}
                                    </tr>
                                `).join('')
                            }
                        </tbody>
                    </table>
                </div>
            ` : ''}

            <!-- المجاميع النهائية -->
            ${summaryRows.length ? `
                <div class="doc-total-section">
                    <div class="doc-total-left">
                        ${footerNote ? `<div style="background:#fffbeb;padding:10px;border-radius:8px;border:1px solid #fde68a;color:#92400e;font-size:10.5px;font-weight:600;"><i class="fa-solid fa-info-circle"></i> ${Utils.esc(footerNote)}</div>` : ''}
                    </div>
                    <div class="doc-total-box type-statement">
                        ${summaryRows.map(r => `
                            <div class="row ${r.type || ''}">
                                <span>${Utils.esc(r.lbl)}</span>
                                <span>${r.val}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- التوقيعات -->
            ${signatures.length ? `
                <div class="doc-signatures-gold">
                    ${signatures.map(s => `
                        <div class="doc-signature-gold">
                            <div class="line"></div>
                            ${Utils.esc(s)}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- التذييل -->
            <div class="doc-footer-gold">
                <div class="thanks">${Utils.esc(inv.footerText || 'شكراً لتعاملكم معنا')}</div>
                <div class="subtext">تم إنشاء هذا التقرير بتاريخ ${Utils.formatDate(new Date(), true)} بواسطة ${Utils.esc(Utils.currentUser()?.name || '')}</div>
                <div class="dev-info">
                    <strong>${Utils.esc(dev.nameEn || 'Eng. Ibrahim Al-Hammadi')}</strong>
                    <div>${Utils.esc(dev.titleEn || 'Software Developer & Cybersecurity Engineer')}</div>
                    ${(dev.phones && dev.phones[0]) ? `<div class="phone"><i class="fa-solid fa-phone"></i> ${dev.phones[0].number.replace('+','')}</div>` : ''}
                    <div class="copyright">جميع الحقوق محفوظة © ${dev.copyrightYear || '2026'} م/ ${Utils.esc(dev.copyrightOwnerAr || '')}</div>
                </div>
            </div>
        </div>
    `;
},
};