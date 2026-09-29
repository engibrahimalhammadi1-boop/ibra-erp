/**
 * Developer Screen - بيانات النظام والمطور
 */
const Developer = {
    render: function() {
        const dev = DB.get('developerInfo');
        const sys = DB.get('system');

        return `
        <div class="max-w-4xl mx-auto space-y-4">
            
            <!-- Main Card -->
            <div class="glass-card rounded-3xl overflow-hidden relative">
                <div class="h-40 bg-gradient-to-r from-slate-900 via-primary to-slate-800 relative overflow-hidden">
                    <div class="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
                    <div class="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary/20 rounded-full blur-3xl"></div>
                    
                    <div class="absolute bottom-4 right-6 flex items-center gap-2 text-white/90 font-en text-sm tracking-widest uppercase">
                        <i class="fa-solid fa-laptop-code text-secondary"></i>
                        <span>${sys.nameEn}</span>
                    </div>
                    <div class="absolute top-6 left-6 flex items-center gap-2 text-white/90 text-xs">
                        <span class="flex h-2 w-2 relative">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>System Core v${sys.version}</span>
                    </div>
                </div>

                <div class="p-6 md:p-8 relative">
                    <!-- Floating Logo -->
                    <div class="absolute -top-16 left-8">
                        <div class="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white p-1 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <div class="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white font-en border border-slate-700">
                                <span class="text-2xl md:text-3xl font-black">IBRA</span>
                                <span class="text-[10px] md:text-xs text-secondary tracking-widest">SOFT</span>
                                <span class="text-[8px] text-slate-500 mt-1">ERP</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <!-- Developer Info -->
                        <div class="lg:col-span-2 space-y-5">
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">👨‍💻 المطوّر</p>
                                <h3 class="text-3xl font-black text-slate-900 font-en">${Utils.esc(dev.nameEn)}</h3>
                                <p class="text-slate-700 text-lg mt-1">${Utils.esc(dev.nameAr)}</p>
                                <p class="text-primary font-bold text-sm mt-2 font-en">${Utils.esc(dev.titleEn)}</p>
                            </div>

                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">🏢 المؤسسة</p>
                                <p class="text-xl font-bold text-slate-800">${Utils.esc(dev.organizationAr)}</p>
                                <p class="text-sm font-en text-slate-500">${Utils.esc(dev.organizationEn)}</p>
                            </div>

                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">🛠️ الخدمات</p>
                                <div class="flex flex-wrap gap-2">
                                    ${dev.services.map(s => `<span class="badge badge-info"><i class="fa-solid fa-check"></i> ${Utils.esc(s)}</span>`).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Contact -->
                        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200 lg:sticky lg:top-4">
                            <p class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-headset text-primary"></i>
                                التواصل مع المطور
                            </p>
                            ${dev.phones.map(p => `
                                <div class="flex flex-col gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm mb-3">
                                    <div class="flex items-center gap-2 justify-center">
                                        <i class="fa-solid fa-phone text-slate-400 text-xs"></i>
                                        <span class="font-en font-bold text-slate-800 tracking-wider text-sm" dir="ltr">${p.number}</span>
                                    </div>
                                    <div class="flex gap-1.5">
                                        <button onclick="window.open('tel:${p.number}','_self')" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                            <i class="fa-solid fa-phone"></i> اتصال
                                        </button>
                                        <button onclick="window.open('https://wa.me/${p.number.replace(/[+\\s]/g,'')}','_blank')" class="flex-1 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                                            <i class="fa-brands fa-whatsapp text-sm"></i> واتساب
                                        </button>
                                        <button onclick="Developer.copy('${p.number}')" class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors">
                                            <i class="fa-regular fa-copy"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="pt-6 mt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                        <div class="flex items-center gap-2 text-slate-500 font-medium">
                            <i class="fa-regular fa-copyright"></i>
                            <span>جميع الحقوق محفوظة © ${dev.copyrightYear} م/ ${Utils.esc(dev.copyrightOwnerAr)}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="badge badge-success">
                                <i class="fa-solid fa-shield-halved"></i> Protected
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Info -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-server text-primary"></i> معلومات النظام
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500 mb-1">اسم النظام</p>
                        <p class="font-bold text-slate-800">${sys.nameAr}</p>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500 mb-1">الإصدار</p>
                        <p class="font-bold text-primary font-en">${sys.version}</p>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500 mb-1">العملة</p>
                        <p class="font-bold text-slate-800">${sys.currency}</p>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3">
                        <p class="text-xs text-slate-500 mb-1">الرقم الضريبي</p>
                        <p class="font-bold text-slate-800 font-en" dir="ltr">${sys.taxNumber||'-'}</p>
                    </div>
                </div>
            </div>

            <!-- Copyright Alert -->
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <i class="fa-solid fa-circle-info text-blue-500 mt-1"></i>
                <p class="text-sm text-blue-800 leading-relaxed">
                    <strong>ملاحظة قانونية:</strong> بيانات المطور وحقوق النظام هي بيانات أساسية ثابتة لحفظ حقوق الملكية الفكرية ولا يمكن تعديلها من قبل مستخدمي النظام. أي نسخ أو توزيع دون ترخيص يعتبر انتهاكاً لحقوق الملكية.
                </p>
            </div>

        </div>
        `;
    },

    copy: function(num) {
        const ta = document.createElement("textarea");
        ta.value = num;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        Utils.toast('success', `تم نسخ: ${num}`);
    }
};