/**
 * AI Assistant Screen - المساعد الذكي
 */
const AI = {
    messages: [
        { role: 'ai', text: 'مرحباً! أنا مساعدك الذكي في IBRA Soft ERP. يمكنني مساعدتك في:\n• تحليل مبيعاتك\n• نصائح لتحسين الأرباح\n• الإجابة عن أسئلة النظام\n• إعطاء تقارير سريعة\n\nاسألني أي شيء!' }
    ],
    quickActions: [
        { icon:'fa-chart-line', label:'ملخص مبيعات اليوم', query:'ملخص المبيعات' },
        { icon:'fa-coins', label:'أفضل الأصناف مبيعاً', query:'الأصناف الأكثر مبيعاً' },
        { icon:'fa-triangle-exclamation', label:'مواد منخفضة', query:'المواد المنخفضة' },
        { icon:'fa-users', label:'ديون العملاء', query:'ديون العملاء' },
        { icon:'fa-fire', label:'حالة المطبخ', query:'حالة الطلبات' },
        { icon:'fa-lightbulb', label:'نصائح لزيادة الأرباح', query:'نصائح' }
    ],

    render: function() {
        return `
        <div class="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary via-blue-800 to-primary text-white rounded-t-2xl p-4 shadow-md flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <i class="fa-solid fa-robot text-xl"></i>
                </div>
                <div class="flex-1">
                    <h3 class="font-black text-lg">المساعد الذكي</h3>
                    <p class="text-xs opacity-90 flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        جاهز للمساعدة
                    </p>
                </div>
                <button onclick="AI.clearChat()" class="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center" title="مسح المحادثة">
                    <i class="fa-solid fa-trash text-sm"></i>
                </button>
            </div>

            <!-- Chat Messages -->
            <div id="ai-messages" class="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 border-x border-slate-200"></div>

            <!-- Quick Actions -->
            <div class="bg-white border-x border-slate-200 p-3 border-t border-slate-200">
                <p class="text-xs font-bold text-slate-500 mb-2">أسئلة سريعة:</p>
                <div class="flex gap-2 overflow-x-auto pb-1">
                    ${this.quickActions.map(a => `
                        <button onclick="AI.sendQuick('${a.query}')" class="px-3 py-1.5 bg-slate-100 hover:bg-primary hover:text-white rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5">
                            <i class="fa-solid ${a.icon}"></i> ${a.label}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Input -->
            <div class="bg-white rounded-b-2xl border border-slate-200 p-3 flex gap-2">
                <input type="text" id="ai-input" placeholder="اكتب سؤالك هنا..." 
                       onkeydown="if(event.key==='Enter')AI.sendMessage()"
                       class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary">
                <button onclick="AI.sendMessage()" class="px-5 py-2.5 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
        `;
    },

    afterRender: function() {
        this.renderMessages();
        document.getElementById('ai-input')?.focus();
    },

    renderMessages: function() {
        const container = document.getElementById('ai-messages');
        if (!container) return;
        
        container.innerHTML = this.messages.map(m => `
            <div class="flex ${m.role==='user'?'justify-start':'justify-end'} chat-message">
                <div class="${m.role==='user'?'chat-bubble-user':'chat-bubble-ai'} whitespace-pre-line text-sm">${this.formatMessage(m.text)}</div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    },

    formatMessage: function(text) {
        return Utils.esc(text)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>');
    },

    sendMessage: function() {
        const input = document.getElementById('ai-input');
        const text = input.value.trim();
        if (!text) return;
        
        this.messages.push({ role: 'user', text });
        this.renderMessages();
        input.value = '';
        
        setTimeout(() => {
            const response = this.getResponse(text);
            this.messages.push({ role: 'ai', text: response });
            this.renderMessages();
        }, 500);
    },

    sendQuick: function(query) {
        document.getElementById('ai-input').value = query;
        this.sendMessage();
    },

    clearChat: function() {
        this.messages = [{ role: 'ai', text: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟' }];
        this.renderMessages();
    },

    getResponse: function(query) {
        const q = query.toLowerCase();
        const invoices = DB.get('invoices') || [];
        const today = new Date().toDateString();
        const todayInvoices = invoices.filter(i => new Date(i.date).toDateString() === today);
        const todaySales = todayInvoices.reduce((s,i) => s + i.total, 0);
        const sys = DB.get('system');

        // Sales summary
        if (q.includes('مبيعات') || q.includes('مبيعات اليوم') || q.includes('ملخص')) {
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const yesterdayInvoices = invoices.filter(i => new Date(i.date).toDateString() === yesterday);
            const yesterdaySales = yesterdayInvoices.reduce((s,i) => s + i.total, 0);
            const diff = yesterdaySales ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1) : 0;
            const trend = diff > 0 ? '📈 زيادة' : diff < 0 ? '📉 انخفاض' : '➡️ ثابت';
            
            return `**📊 ملخص مبيعات اليوم:**
            
• عدد الفواتير: ${todayInvoices.length}
• إجمالي المبيعات: **${Utils.formatCurrency(todaySales)}**
• متوسط الفاتورة: ${Utils.formatCurrency(todayInvoices.length ? todaySales/todayInvoices.length : 0)}

**المقارنة مع الأمس:**
• أمس: ${Utils.formatCurrency(yesterdaySales)}
• الفرق: ${trend} بنسبة ${Math.abs(diff)}%

${diff > 0 ? '✅ أداء ممتاز! استمر.' : diff < 0 ? '⚠️ حاول تحسين الأداء بتحفيز العملاء.' : ''}`;
        }

        // Top items
        if (q.includes('أفضل') || q.includes('الأكثر مبيعاً') || q.includes('أصناف')) {
            const items = {};
            invoices.filter(i => new Date(i.date).toDateString() === today).forEach(inv => {
                inv.items.forEach(it => {
                    if (!items[it.name]) items[it.name] = { qty: 0, total: 0 };
                    items[it.name].qty += it.quantity;
                    items[it.name].total += it.total;
                });
            });
            const sorted = Object.entries(items).sort((a,b) => b[1].qty - a[1].qty).slice(0, 5);
            
            if (sorted.length === 0) return 'لا توجد مبيعات اليوم بعد.';

            return `**🏆 الأصناف الأكثر مبيعاً اليوم:**
            
${sorted.map((item, i) => `${i+1}. ${item[0]} - ${item[1].qty} وحدة (${Utils.formatCurrency(item[1].total)})`).join('\n')}

**نصيحة:** ركّز على الترويج لهذه الأصناف أكثر لزيادة المبيعات!`;
        }

        // Low inventory
        if (q.includes('منخفض') || q.includes('مخزون')) {
            const inventory = DB.get('inventory') || [];
            const low = inventory.filter(i => i.quantity <= i.minQuantity);
            if (low.length === 0) return '✅ جميع المواد ضمن الحد الآمن. لا يوجد تنبيهات.';
            
            return `**⚠️ تنبيه: مواد منخفضة (${low.length} مادة):**
            
${low.slice(0,10).map(i => `• ${i.name}: ${i.quantity} ${i.unit} (الحد: ${i.minQuantity})`).join('\n')}

**التوصية:** قم بإنشاء فاتورة مشتريات لتزويد هذه المواد في أقرب وقت.`;
        }

        // Customer debts
        if (q.includes('ديون') || q.includes('عملاء')) {
            const customers = DB.get('customers') || [];
            const debtors = customers.filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance);
            const total = debtors.reduce((s,c) => s + c.balance, 0);
            
            if (debtors.length === 0) return '✅ لا توجد ديون على العملاء.';

            return `**💰 ديون العملاء:**
            
إجمالي الديون: **${Utils.formatCurrency(total)}**
عدد العملاء المدينين: ${debtors.length}

**أعلى 5 مدينين:**
${debtors.slice(0,5).map((c,i) => `${i+1}. ${c.name}: ${Utils.formatCurrency(c.balance)}`).join('\n')}

**التوصية:** تواصل مع العملاء لتسوية مدفوعاتهم.`;
        }

        // Kitchen status
        if (q.includes('مطبخ') || q.includes('طلبات') || q.includes('حالة')) {
            const orders = DB.get('orders') || [];
            const newOrders = orders.filter(o => o.status === 'new').length;
            const preparing = orders.filter(o => o.status === 'preparing').length;
            const ready = orders.filter(o => o.status === 'ready').length;

            return `**🍳 حالة المطبخ:**
            
• طلبات جديدة: **${newOrders}** 🔴
• قيد التحضير: **${preparing}** 🟡
• جاهزة للتقديم: **${ready}** 🟢

${newOrders > 3 ? '⚠️ يوجد تراكم في الطلبات، قد تحتاج لتعزيز الطاقم.' : '✅ المطبخ يعمل بشكل طبيعي.'}`;
        }

        // Tips
        if (q.includes('نصائح') || q.includes('تحسين') || q.includes('زيادة')) {
            const topItems = this.getTopSelling();
            const tips = [
                '**1. ركّز على الأصناف الأكثر ربحية** - راجع تقرير الأرباح وروّج للأصناف ذات هامش ربح عالي.',
                '**2. عروض الترويج في الساعات الهادئة** - اعرض خصومات في الساعات التي تشهد انخفاضاً في المبيعات.',
                '**3. برنامج ولاء للعملاء** - كافئ العملاء الدائمين بنقاط أو خصومات.',
                '**4. تتبع المخزون بدقة** - تجنب الهدر وتوفير التكاليف.',
                '**5. تدريب الطاقم** - كاشير سريع = خدمة أسرع = عملاء أكثر رضا.',
                '**6. تسويق رقمي** - استخدم وسائل التواصل الاجتماعي لعرض أصنافك.'
            ];
            return `**💡 نصائح لزيادة الأرباح:**
            
${tips.join('\n\n')}

${topItems.length ? `\n**ملاحظة:** أفضل صنف لديك حالياً هو "${topItems[0][0]}" - ركّز على الترويج له.` : ''}`;
        }

        // Profit
        if (q.includes('ربح') || q.includes('أرباح')) {
            let revenue = 0, cost = 0;
            todayInvoices.forEach(inv => {
                inv.items.forEach(it => {
                    revenue += it.total;
                    cost += (it.cost || 0) * it.quantity;
                });
            });
            const profit = revenue - cost;
            const margin = revenue ? (profit/revenue*100).toFixed(1) : 0;
            
            return `**📈 تحليل أرباح اليوم:**
            
• الإيرادات: ${Utils.formatCurrency(revenue)}
• التكلفة: ${Utils.formatCurrency(cost)}
• **صافي الربح: ${Utils.formatCurrency(profit)}**
• هامش الربح: **${margin}%**

${margin >= 30 ? '✅ هامش ربح ممتاز!' : margin >= 20 ? '⚠️ هامش مقبول، يمكن تحسينه.' : '❌ هامش منخفض، راجع التسعير والتكاليف.'}`;
        }

        // System info
        if (q.includes('نظام') || q.includes('معلومات') || q.includes('إصدار')) {
            return `**ℹ️ معلومات النظام:**
            
• الاسم: ${sys.nameAr}
• الإصدار: ${sys.version}
• العملة: ${sys.currency}
• نسبة الضريبة: ${(sys.taxRate*100).toFixed(0)}%
• نسبة الخدمة: ${(sys.serviceCharge*100).toFixed(0)}%

للمزيد من المعلومات، توجه إلى **الإعدادات**.`;
        }

        // Default
        return `لم أفهم سؤالك تماماً. جرّب الأسئلة السريعة أعلاه أو اسألني عن:
• مبيعات اليوم
• الأصناف الأكثر مبيعاً  
• المواد المنخفضة
• ديون العملاء
• حالة المطبخ
• نصائح لزيادة الأرباح
• تحليل الأرباح`;
    },

    getTopSelling: function() {
        const invoices = DB.get('invoices') || [];
        const items = {};
        invoices.filter(i => new Date(i.date).toDateString() === new Date().toDateString()).forEach(inv => {
            inv.items.forEach(it => {
                if (!items[it.name]) items[it.name] = { qty: 0 };
                items[it.name].qty += it.quantity;
            });
        });
        return Object.entries(items).sort((a,b) => b[1].qty - a[1].qty).map(x => [x[0], x[1].qty]);
    }
};