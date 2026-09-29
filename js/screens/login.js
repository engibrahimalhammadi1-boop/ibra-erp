/**
 * Login Screen - شاشة تسجيل الدخول
 */
const Login = {
    render: function() {
        const sys = DB.get('system') || {};
        const dev = DB.get('developerInfo') || {};

        return `
        <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
             style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);">
            
            <div class="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div class="relative w-full max-w-md">
                
                <div class="text-center mb-8">
                    <div class="w-24 h-24 mx-auto rounded-3xl bg-white shadow-2xl p-1 mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div class="w-full h-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white font-en">
                            <span class="text-3xl font-black">IBRA</span>
                            <span class="text-[10px] text-secondary tracking-widest">SOFT ERP</span>
                        </div>
                    </div>
                    <h1 class="text-3xl font-black text-white mb-2">${Utils.esc(sys.nameAr || 'نظام إدارة المطاعم')}</h1>
                    <p class="text-slate-300 text-sm font-en tracking-wider">${Utils.esc(sys.nameEn || 'IBRA Soft ERP')} v${sys.version || '1.0.0'}</p>
                </div>

                <div class="rounded-3xl p-8 shadow-2xl" style="background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);">
                    
                    <div class="text-center mb-6">
                        <h2 class="text-2xl font-black text-slate-800">تسجيل الدخول</h2>
                        <p class="text-slate-500 text-sm mt-1">أدخل بياناتك للوصول إلى النظام</p>
                    </div>

                    <form id="login-form" onsubmit="Login.submit(event)" class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">
                                <i class="fa-solid fa-user text-primary"></i> اسم المستخدم
                            </label>
                            <input type="text" id="login-username" 
                                   class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 font-en"
                                   placeholder="admin" autocomplete="username" required>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">
                                <i class="fa-solid fa-lock text-primary"></i> كلمة المرور
                            </label>
                            <div class="relative">
                                <input type="password" id="login-password" 
                                       class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 font-en pl-12"
                                       placeholder="••••••••" autocomplete="current-password" required>
                                <button type="button" onclick="Login.togglePassword()" 
                                        class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                                    <i class="fa-solid fa-eye" id="toggle-pass-icon"></i>
                                </button>
                            </div>
                        </div>

                        <div id="login-error" class="hidden bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-center gap-2">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            <span id="login-error-msg">اسم المستخدم أو كلمة المرور غير صحيحة</span>
                        </div>

                        <button type="submit" id="login-btn"
                                class="w-full py-3.5 bg-gradient-to-r from-primary to-blue-800 hover:from-blue-800 hover:to-primary text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            <i class="fa-solid fa-sign-in-alt"></i> دخول
                        </button>
                    </form>

                    <div class="mt-6 pt-4 border-t border-slate-200">
                        <p class="text-xs text-slate-500 text-center mb-2">بيانات الدخول الافتراضية:</p>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <button type="button" onclick="Login.fillDemo('admin','admin')" class="py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 transition-colors">
                                <i class="fa-solid fa-crown text-amber-500"></i> مدير
                            </button>
                            <button type="button" onclick="Login.fillDemo('cashier','1234')" class="py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700 transition-colors">
                                <i class="fa-solid fa-cash-register text-blue-500"></i> كاشير
                            </button>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-6 text-xs text-slate-400 space-y-1">
                    <p><i class="fa-regular fa-copyright"></i> ${dev.copyrightYear || '2026'} - ${Utils.esc(dev.copyrightOwnerAr || 'IBRA Soft')}</p>
                    <p class="font-en tracking-wider">Developed by ${Utils.esc(dev.nameEn || '')}</p>
                </div>
            </div>
        </div>
        `;
    },

    afterRender: function() {
        setTimeout(() => {
            const input = document.getElementById('login-username');
            if (input) input.focus();
        }, 100);
    },

    togglePassword: function() {
        const input = document.getElementById('login-password');
        const icon = document.getElementById('toggle-pass-icon');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fa-solid fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fa-solid fa-eye';
        }
    },

    fillDemo: function(user, pass) {
        document.getElementById('login-username').value = user;
        document.getElementById('login-password').value = pass;
    },

    submit: function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const errorMsg = document.getElementById('login-error-msg');
        const btn = document.getElementById('login-btn');

        errorEl.classList.add('hidden');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جارٍ التحقق...';

        setTimeout(() => {
            const users = DB.get('users') || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (!user) {
                errorMsg.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
                errorEl.classList.remove('hidden');
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> دخول';
                return;
            }

            if (user.active === false) {
                errorMsg.textContent = 'هذا الحساب معطّل. تواصل مع المدير.';
                errorEl.classList.remove('hidden');
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> دخول';
                return;
            }

            sessionStorage.setItem('ibra_current_user', JSON.stringify(user));
            DB.log('system', `تسجيل دخول: ${user.name}`);
            window.location.href = 'app.html';
        }, 400);
    }
};