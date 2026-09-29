/**
 * Guide Screen - دليل الاستخدام
 */
const Guide = {
    activeSection: 'intro',

    sections: [
        { id:'intro', label:'مقدمة', icon:'fa-home' },
        { id:'pos', label:'نقطة البيع', icon:'fa-cash-register' },
        { id:'tables', label:'الطاولات', icon:'fa-chair' },
        { id:'kitchen', label:'المطبخ', icon:'fa-fire-burner' },
        { id:'invoices', label:'الفواتير', icon:'fa-file-invoice' },
        { id:'menu', label:'قائمة الطعام', icon:'fa-book-open' },
        { id:'inventory', label:'المخزون', icon:'fa-boxes-stacked' },
        { id:'purchases', label:'المشتريات', icon:'fa-truck' },
        { id:'customers', label:'العملاء والموردين', icon:'fa-users' },
        { id:'cash', label:'الخزينة والصناديق', icon:'fa-vault' },
        { id:'reports', label:'التقارير', icon:'fa-chart-pie' },
        { id:'settings', label:'الإعدادات', icon:'fa-gear' },
        { id:'shortcuts', label:'اختصارات لوحة المفاتيح', icon:'fa-keyboard' }
    ],

    content: {
        intro: `
            <h2 class="text-2xl font-black text-primary mb-4">مرحباً بك في IBRA Soft ERP</h2>
            <p class="text-slate-700 leading-relaxed mb-4">
                نظام متكامل لإدارة المطاعم والكافيهات، مصمم خصيصاً لتسهيل العمليات اليومية من نقطة البيع إلى إدارة المخزون والتقارير.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
                <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 class="font-bold text-blue-900 mb-2"><i class="fa-solid fa-bolt text-blue-600"></i> سرعة وأداء</h4>
                    <p class="text-sm text-blue-800">يعمل من المتصفح مباشرة دون إنترنت، سريع الاستجابة.</p>
                </div>
                <div class="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 class="font-bold text-green-900 mb-2"><i class="fa-solid fa-shield-halved text-green-600"></i> آمن</h4>
                    <p class="text-sm text-green-800">بياناتك محفوظة محلياً على جهازك، نسخ احتياطي بضغطة زر.</p>
                </div>
                <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <h4 class="font-bold text-amber-900 mb-2"><i class="fa-solid fa-print text-amber-600"></i> طباعة احترافية</h4>
                    <p class="text-sm text-amber-800">دعم الطباعة الحرارية 80mm/58mm و A4 مع تخصيص كامل.</p>
                </div>
                <div class="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h4 class="font-bold text-purple-900 mb-2"><i class="fa-solid fa-chart-line text-purple-600"></i> تقارير ذكية</h4>
                    <p class="text-sm text-purple-800">تقارير مبيعات وأرباح وأداء الموظفين بشكل تفاعلي.</p>
                </div>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-3 mt-6">كيف تبدأ؟</h3>
            <ol class="list-decimal list-inside space-y-2 text-slate-700">
                <li>اذهب إلى <strong>الإعدادات → بيانات المطعم</strong> وأدخل معلومات مطعمك.</li>
                <li>من <strong>قائمة الطعام</strong> أضف الفئات والأصناف والأسعار.</li>
                <li>من <strong>المخزون</strong> أدخل المواد الخام.</li>
                <li>من <strong>الطاولات</strong> أضف طاولات المطعم والمناطق.</li>
                <li>من <strong>المستخدمين</strong> أنشئ حسابات الكاشير والمطبخ.</li>
                <li>ابدأ العمل من <strong>نقطة البيع</strong> مباشرة!</li>
            </ol>
        `,
        pos: `
            <h2 class="text-2xl font-black text-primary mb-4">نقطة البيع (POS)</h2>
            <p class="text-slate-700 mb-4">شاشة البيع الرئيسية لإنشاء الطلبات والفواتير بسرعة.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">الخطوات الأساسية:</h3>
            <ol class="list-decimal list-inside space-y-2 text-slate-700">
                <li>اختر <strong>نوع الطلب</strong>: محلي / سفري / توصيل.</li>
                <li>إذا كان محلي، اختر <strong>الطاولة</strong> من القائمة.</li>
                <li>اختر العميل من القائمة المنسدلة.</li>
                <li>اختر فئة أو ابحث عن الصنف، ثم اضغط عليه لإضافته للسلة.</li>
                <li>عدّل الكميات أو أضف ملاحظات لكل صنف (مثل: بدون بصل).</li>
                <li>أضف الخصم إذا لزم الأمر.</li>
            </ol>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">الأزرار الرئيسية:</h3>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p class="font-bold text-blue-900">🔥 إرسال للمطبخ</p>
                    <p class="text-xs text-blue-700 mt-1">يرسل الطلب لشاشة المطبخ ويحدّث حالة الطاولة.</p>
                </div>
                <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p class="font-bold text-green-900">💳 دفع</p>
                    <p class="text-xs text-green-700 mt-1">يفتح شاشة الدفع لتحصيل المبلغ وطباعة الفاتورة.</p>
                </div>
                <div class="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p class="font-bold text-amber-900">⏸ تعليق</p>
                    <p class="text-xs text-amber-700 mt-1">يحفظ الطلب معلقاً لاسترجاعه لاحقاً.</p>
                </div>
                <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p class="font-bold text-slate-900">📋 المعلقة</p>
                    <p class="text-xs text-slate-700 mt-1">يعرض الطلبات المعلقة لاسترجاعها.</p>
                </div>
            </div>
        `,
        tables: `
            <h2 class="text-2xl font-black text-primary mb-4">إدارة الطاولات</h2>
            <p class="text-slate-700 mb-4">نظرة شاملة على جميع طاولات المطعم وحالاتها.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">حالات الطاولات:</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div class="bg-green-500 text-white rounded-lg p-3 text-center">
                    <p class="font-bold">متاحة</p>
                    <p class="text-xs opacity-90">جاهزة للعملاء</p>
                </div>
                <div class="bg-red-500 text-white rounded-lg p-3 text-center">
                    <p class="font-bold">مشغولة</p>
                    <p class="text-xs opacity-90">يوجد عملاء</p>
                </div>
                <div class="bg-amber-500 text-white rounded-lg p-3 text-center">
                    <p class="font-bold">محجوزة</p>
                    <p class="text-xs opacity-90">حجز مسبق</p>
                </div>
                <div class="bg-slate-500 text-white rounded-lg p-3 text-center">
                    <p class="font-bold">تنظيف</p>
                    <p class="text-xs opacity-90">تحتاج تجهيز</p>
                </div>
            </div>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">العمليات:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>اضغط على أي طاولة لفتح قائمة العمليات.</li>
                <li><strong>طلب جديد</strong>: يفتح نقطة البيع مباشرة مع اختيار الطاولة.</li>
                <li><strong>الطلبات</strong>: يعرض طلبات هذه الطاولة.</li>
                <li>يمكن تغيير الحالة بضغطة زر.</li>
            </ul>
        `,
        kitchen: `
            <h2 class="text-2xl font-black text-primary mb-4">شاشة المطبخ</h2>
            <p class="text-slate-700 mb-4">شاشة عرض الطلبات للطهاة مع تتبع حالة كل طلب.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">دورة حياة الطلب:</h3>
            <div class="flex flex-wrap gap-2 items-center mb-4">
                <span class="badge badge-danger">جديد</span>
                <i class="fa-solid fa-arrow-left text-slate-400"></i>
                <span class="badge badge-warning">قيد التحضير</span>
                <i class="fa-solid fa-arrow-left text-slate-400"></i>
                <span class="badge badge-info">جاهز</span>
                <i class="fa-solid fa-arrow-left text-slate-400"></i>
                <span class="badge badge-gray">تم التقديم</span>
            </div>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">ميزات الشاشة:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>تحديث تلقائي كل 5 ثوان.</li>
                <li>عرض الوقت المنقضي لكل طلب.</li>
                <li>فلترة حسب الحالة (جديد، تحضير، جاهز).</li>
                <li>صوت تنبيه عند جاهزية الطلب.</li>
                <li>وضع ملء الشاشة (F11).</li>
            </ul>
        `,
        invoices: `
            <h2 class="text-2xl font-black text-primary mb-4">الفواتير والطلبات</h2>
            <p class="text-slate-700 mb-4">إدارة شاملة لجميع الفواتير والطلبات مع إمكانية التعديل والطباعة.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">الميزات:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>تبويبين: الفواتير المكتملة + الطلبات النشطة.</li>
                <li>فلترة حسب الفترة الزمنية (اليوم/أسبوع/شهر).</li>
                <li><strong>إعادة طباعة</strong> أي فاتورة سابقة.</li>
                <li><strong>تعديل تفاصيل الفاتورة</strong> قبل الطباعة مباشرة من شاشة المعاينة.</li>
                <li><strong>مرتجع</strong>: إرجاع فاتورة كاملة وعكس تأثيرها.</li>
                <li><strong>إلغاء</strong>: للفواتير الخاطئة (admin فقط).</li>
                <li>تحويل الطلب إلى فاتورة بضغطة زر.</li>
            </ul>
        `,
        menu: `
            <h2 class="text-2xl font-black text-primary mb-4">قائمة الطعام</h2>
            <p class="text-slate-700 mb-4">إدارة كاملة لأصناف القائمة والفئات.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">إدارة الفئات:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>كل فئة لها أيقونة ولون مميز.</li>
                <li>يمكن إضافة/تعديل/حذف الفئات.</li>
                <li>لا يمكن حذف فئة تحتوي على أصناف.</li>
            </ul>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">الأصناف:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>اسم عربي وإنجليزي.</li>
                <li>سعر البيع + التكلفة (لحساب الأرباح).</li>
                <li>وقت التحضير (يظهر في المطبخ).</li>
                <li>تفعيل/تعطيل الصنف.</li>
                <li>عرض شبكي أو قائمة.</li>
            </ul>
        `,
        inventory: `
            <h2 class="text-2xl font-black text-primary mb-4">المخزون</h2>
            <p class="text-slate-700 mb-4">تتبع المواد الخام والكميات مع تنبيهات ذكية.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">الميزات:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>تسجيل المواد بالوحدات (كجم، لتر، قطعة).</li>
                <li>حد أدنى لكل مادة لتنبيه إعادة الطلب.</li>
                <li>حركات المخزون (وارد / صادر / تسوية).</li>
                <li>احتساب قيمة المخزون الإجمالية.</li>
                <li>عرض المواد المنخفضة فقط بضغطة.</li>
                <li>ربط تلقائي مع المشتريات.</li>
            </ul>
        `,
        purchases: `
            <h2 class="text-2xl font-black text-primary mb-4">المشتريات</h2>
            <p class="text-slate-700 mb-4">إدارة فواتير الشراء من الموردين مع ربط تلقائي بالمخزون.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">دورة الشراء:</h3>
            <ol class="list-decimal list-inside space-y-1 text-slate-700">
                <li>إنشاء فاتورة مشتريات جديدة.</li>
                <li>اختيار المورد وإضافة الأصناف بكمياتها وتكاليفها.</li>
                <li>تحديد المبلغ المدفوع (يمكن أن يكون جزئياً).</li>
                <li>عند الحفظ: تُضاف الكميات للمخزون تلقائياً.</li>
                <li>يمكن تسجيل دفعات لاحقة.</li>
            </ol>
        `,
        customers: `
            <h2 class="text-2xl font-black text-primary mb-4">العملاء والموردين</h2>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">العملاء:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700 mb-4">
                <li>تسجيل بيانات كاملة (اسم، هاتف، نوع).</li>
                <li>تتبع الرصيد (مدين/دائن).</li>
                <li>كشف حساب مفصل مع كل الحركات.</li>
                <li>تسجيل دفعات فورية.</li>
                <li>طباعة كشف الحساب.</li>
            </ul>

            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">الموردين:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>متابعة مستحقات الموردين.</li>
                <li>ربط كامل مع فواتير المشتريات.</li>
                <li>سندات صرف تلقائية عند الدفع.</li>
                <li>كشف حساب مفصل وطباعته.</li>
            </ul>
        `,
        cash: `
            <h2 class="text-2xl font-black text-primary mb-4">الخزينة والصناديق</h2>
            <p class="text-slate-700 mb-4">إدارة كل حركة نقدية داخل المطعم.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">أنواع السندات:</h3>
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p class="font-bold text-green-900"><i class="fa-solid fa-arrow-down"></i> سند قبض</p>
                    <p class="text-xs text-green-700 mt-1">استلام نقدية من عميل أو مصدر آخر.</p>
                </div>
                <div class="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p class="font-bold text-red-900"><i class="fa-solid fa-arrow-up"></i> سند صرف</p>
                    <p class="text-xs text-red-700 mt-1">دفع نقدية لمورد أو موظف.</p>
                </div>
                <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p class="font-bold text-blue-900"><i class="fa-solid fa-book"></i> سند قيد</p>
                    <p class="text-xs text-blue-700 mt-1">قيد محاسبي مزدوج (مدين/دائن).</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p class="font-bold text-purple-900"><i class="fa-solid fa-receipt"></i> سند بسيط</p>
                    <p class="text-xs text-purple-700 mt-1">مصروف/إيراد سريع بدون ربط.</p>
                </div>
            </div>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">الصناديق:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>إنشاء صناديق متعددة (رئيسي، كاشير، احتياطي).</li>
                <li>تحويل بين الصناديق.</li>
                <li>إيداع وسحب مباشر.</li>
                <li>متابعة كل حركة نقدية.</li>
            </ul>
        `,
        reports: `
            <h2 class="text-2xl font-black text-primary mb-4">التقارير</h2>
            <p class="text-slate-700 mb-4">تحليلات شاملة لأداء المطعم.</p>

            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">التقارير المتوفرة:</h3>
            <div class="space-y-2">
                <div class="bg-slate-50 rounded-lg p-3">
                    <p class="font-bold"><i class="fa-solid fa-chart-line text-primary"></i> تقرير المبيعات</p>
                    <p class="text-sm text-slate-600">إجمالي المبيعات، عدد الفواتير، تفصيل يومي، طرق الدفع.</p>
                </div>
                <div class="bg-slate-50 rounded-lg p-3">
                    <p class="font-bold"><i class="fa-solid fa-coins text-primary"></i> تقرير الأرباح</p>
                    <p class="text-sm text-slate-600">الإيرادات، التكلفة، صافي الربح، ربحية كل صنف.</p>
                </div>
                <div class="bg-slate-50 rounded-lg p-3">
                    <p class="font-bold"><i class="fa-solid fa-utensils text-primary"></i> تقرير الأصناف</p>
                    <p class="text-sm text-slate-600">الأكثر مبيعاً، كميات، نسب مئوية.</p>
                </div>
                <div class="bg-slate-50 rounded-lg p-3">
                    <p class="font-bold"><i class="fa-solid fa-user-tie text-primary"></i> تقرير الموظفين</p>
                    <p class="text-sm text-slate-600">أداء الكاشيريين والمبيعات لكل مستخدم.</p>
                </div>
                <div class="bg-slate-50 rounded-lg p-3">
                    <p class="font-bold"><i class="fa-solid fa-boxes-stacked text-primary"></i> تقرير المخزون</p>
                    <p class="text-sm text-slate-600">قيمة المخزون، المواد المنخفضة، المشتريات.</p>
                </div>
            </div>
        `,
        settings: `
            <h2 class="text-2xl font-black text-primary mb-4">الإعدادات</h2>
            <p class="text-slate-700 mb-4">تخصيص النظام بالكامل حسب احتياجك.</p>
            
            <h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">بيانات المطعم:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>الاسم العربي والإنجليزي، العملة.</li>
                <li>الرقم الضريبي، نسبة الضريبة.</li>
                <li>نسبة رسوم الخدمة.</li>
            </ul>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">إعدادات الفاتورة:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>رفع شعار المطعم (PNG/JPG).</li>
                <li>تعديل اسم المطعم ورأس الفاتورة.</li>
                <li>تعديل العنوان والهاتف والرقم الضريبي.</li>
                <li>تذييل الفاتورة (شكراً لزيارتكم).</li>
                <li>إظهار/إخفاء الضريبة والخدمة.</li>
                <li><strong>معاينة مباشرة</strong> أثناء التعديل.</li>
            </ul>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">إعدادات الطباعة:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>اختيار حجم الورق: <strong>80mm</strong> / <strong>58mm</strong> / <strong>A5</strong> / <strong>A4</strong>.</li>
                <li>عدد النسخ.</li>
                <li>طباعة اختبارية للتأكد.</li>
            </ul>

            <h3 class="text-lg font-bold text-slate-800 mt-6 mb-2">النسخ الاحتياطي:</h3>
            <ul class="list-disc list-inside space-y-1 text-slate-700">
                <li>تصدير جميع البيانات كملف JSON.</li>
                <li>استعادة من ملف نسخة سابقة.</li>
                <li>إعادة تعيين النظام (حذر!).</li>
            </ul>
        `,
        shortcuts: `
            <h2 class="text-2xl font-black text-primary mb-4">اختصارات لوحة المفاتيح</h2>
            <div class="space-y-2">
                <div class="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span class="font-bold">البحث السريع</span>
                    <kbd class="bg-white border border-slate-300 rounded px-3 py-1 font-en">Ctrl + K</kbd>
                </div>
                <div class="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span class="font-bold">الدفع (في نقطة البيع)</span>
                    <kbd class="bg-white border border-slate-300 rounded px-3 py-1 font-en">F2</kbd>
                </div>
                <div class="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span class="font-bold">تعليق الطلب</span>
                    <kbd class="bg-white border border-slate-300 rounded px-3 py-1 font-en">F4</kbd>
                </div>
                <div class="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span class="font-bold">إرسال للمطبخ</span>
                    <kbd class="bg-white border border-slate-300 rounded px-3 py-1 font-en">F9</kbd>
                </div>
                <div class="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span class="font-bold">تفريغ البحث</span>
                    <kbd class="bg-white border border-slate-300 rounded px-3 py-1 font-en">Esc</kbd>
                </div>
                <div class="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span class="font-bold">ملء الشاشة (مطبخ)</span>
                    <kbd class="bg-white border border-slate-300 rounded px-3 py-1 font-en">F11</kbd>
                </div>
            </div>
        `
    },

    render: function() {
        return `
        <div class="max-w-6xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Sidebar Menu -->
                <div class="md:col-span-1">
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-4">
                        <div class="p-4 border-b border-slate-200 bg-gradient-to-r from-primary to-blue-800 text-white">
                            <h3 class="font-bold flex items-center gap-2">
                                <i class="fa-solid fa-book"></i> دليل الاستخدام
                            </h3>
                        </div>
                        <ul class="py-2">
                            ${this.sections.map(s => `
                                <li>
                                    <button onclick="Guide.setSection('${s.id}')" data-sec="${s.id}"
                                            class="guide-menu-btn w-full flex items-center gap-3 px-4 py-3 text-right transition-colors">
                                        <i class="fa-solid ${s.icon} w-5"></i>
                                        <span class="text-sm">${s.label}</span>
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Content -->
                <div class="md:col-span-3">
                    <div id="guide-content" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        ${this.content[this.activeSection]}
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    afterRender: function() {
        this.updateMenu();
    },

    setSection: function(id) {
        this.activeSection = id;
        this.updateMenu();
        document.getElementById('guide-content').innerHTML = this.content[id];
        document.getElementById('guide-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    updateMenu: function() {
        document.querySelectorAll('.guide-menu-btn').forEach(b => {
            const isActive = b.dataset.sec === this.activeSection;
            b.className = `guide-menu-btn w-full flex items-center gap-3 px-4 py-3 text-right transition-colors ${
                isActive ? 'bg-primary text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`;
        });
    }
};