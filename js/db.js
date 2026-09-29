/**
 * IBRA Soft ERP - Local Database
 * Uses localStorage for persistence
 */
const DB = {
    prefix: 'ibra_erp_',
    
    // Default seed data
    seed: {
        system: {
            nameAr: "نظام إدارة المطاعم",
            nameEn: "IBRA Soft ERP",
            version: "2026.1.0",
            logo: "",
            taxNumber: "310123456700003",
            currency: "ر.ي",
            currencyEn: "YER",
            taxRate: 0.05,
            serviceCharge: 0.10
        },
        developerInfo: {
            nameAr: "م. إبراهيم الحمادي",
            nameEn: "Eng. Ibrahim Al-Hammadi",
            titleEn: "Software Developer & Cybersecurity Engineer",
            phones: [
                { label: "Phone 1", number: "+967736574726" },
                { label: "Phone 2", number: "+967781458044" }
            ],
            organizationAr: "إبراهيم الحمادي",
            organizationEn: "IBRA Soft ERP",
            services: ["تطوير تطبيقات", "برمجيات", "أنظمة شبكات"],
            copyrightYear: "2026",
            copyrightOwnerAr: "إبراهيم الحمادي"
        },
        users: [
            { id: 1, username: 'admin', password: 'admin', name: 'مدير النظام', role: 'admin', active: true, permissions: ['all'] },
            { id: 2, username: 'cashier', password: '1234', name: 'أحمد الكاشير', role: 'cashier', active: true, permissions: ['pos', 'invoices'] },
            { id: 3, username: 'kitchen', password: '1234', name: 'شاشة المطبخ', role: 'kitchen', active: true, permissions: ['kitchen'] }
        ],
        roles: [
            { id: 'admin', name: 'مدير النظام', permissions: ['all'] },
            { id: 'manager', name: 'مدير', permissions: ['pos','invoices','reports','inventory','purchases','customers','suppliers','employees','cashbox'] },
            { id: 'cashier', name: 'كاشير', permissions: ['pos','invoices','customers','cashbox'] },
            { id: 'kitchen', name: 'مطبخ', permissions: ['kitchen'] },
            { id: 'waiter', name: 'ويتر', permissions: ['pos','tables'] },
            { id: 'accountant', name: 'محاسب', permissions: ['invoices','reports','accounts','vouchers','payroll'] }
        ],
        categories: [
            { id: 1, name: 'المشويات', icon: 'fa-drumstick-bite', color: '#ef4444' },
            { id: 2, name: 'المقبلات', icon: 'fa-bowl-food', color: '#f59e0b' },
            { id: 3, name: 'المشروبات', icon: 'fa-mug-hot', color: '#3b82f6' },
            { id: 4, name: 'الحلويات', icon: 'fa-ice-cream', color: '#ec4899' },
            { id: 5, name: 'الوجبات الرئيسية', icon: 'fa-utensils', color: '#10b981' }
        ],
        menuItems: [
            { id: 1, name: 'دجاج مشوي', nameEn: 'Grilled Chicken', price: 3500, cost: 2000, categoryId: 1, active: true, image: '', recipe: [], prepTime: 20 },
            { id: 2, name: 'كباب لحم', nameEn: 'Meat Kebab', price: 4500, cost: 2800, categoryId: 1, active: true, image: '', recipe: [], prepTime: 25 },
            { id: 3, name: 'حمص', nameEn: 'Hummus', price: 800, cost: 300, categoryId: 2, active: true, image: '', recipe: [], prepTime: 5 },
            { id: 4, name: 'متبل', nameEn: 'Mutabbal', price: 900, cost: 350, categoryId: 2, active: true, image: '', recipe: [], prepTime: 5 },
            { id: 5, name: 'شاي', nameEn: 'Tea', price: 300, cost: 50, categoryId: 3, active: true, image: '', recipe: [], prepTime: 3 },
            { id: 6, name: 'قهوة', nameEn: 'Coffee', price: 500, cost: 150, categoryId: 3, active: true, image: '', recipe: [], prepTime: 4 },
            { id: 7, name: 'عصير برتقال', nameEn: 'Orange Juice', price: 1200, cost: 400, categoryId: 3, active: true, image: '', recipe: [], prepTime: 5 },
            { id: 8, name: 'كنافة', nameEn: 'Kunafa', price: 1500, cost: 600, categoryId: 4, active: true, image: '', recipe: [], prepTime: 10 },
            { id: 9, name: 'أرز بخاري', nameEn: 'Bukhari Rice', price: 4000, cost: 2200, categoryId: 5, active: true, image: '', recipe: [], prepTime: 20 },
            { id: 10, name: 'مندي لحم', nameEn: 'Mandi Meat', price: 5500, cost: 3200, categoryId: 5, active: true, image: '', recipe: [], prepTime: 35 }
        ],
        tables: [
            { id: 1, number: '1', name: 'طاولة 1', capacity: 4, status: 'available', area: 'الصالة الرئيسية' },
            { id: 2, number: '2', name: 'طاولة 2', capacity: 4, status: 'available', area: 'الصالة الرئيسية' },
            { id: 3, number: '3', name: 'طاولة 3', capacity: 6, status: 'occupied', area: 'الصالة الرئيسية', currentOrder: null, guests: 4 },
            { id: 4, number: '4', name: 'طاولة 4', capacity: 2, status: 'available', area: 'الشرفة' },
            { id: 5, number: '5', name: 'طاولة 5', capacity: 8, status: 'reserved', area: 'قسم العائلات' },
            { id: 6, number: '6', name: 'طاولة 6', capacity: 4, status: 'available', area: 'قسم العائلات' }
        ],
        customers: [
            { id: 1, name: 'عميل نقدي', phone: '', balance: 0, type: 'cash' },
            { id: 2, name: 'محمد علي', phone: '+967736574726', balance: 0, type: 'regular' }
        ],
        suppliers: [
            { id: 1, name: 'مؤسسة الأغذية الطازجة', phone: '+967736574726', balance: 0 },
            { id: 2, name: 'شركة المشروبات', phone: '+967781458044', balance: 0 }
        ],
        inventory: [
            { id: 1, name: 'دجاج', unit: 'kg', quantity: 50, minQuantity: 10, cost: 2000, category: 'لحوم' },
            { id: 2, name: 'لحم بقري', unit: 'kg', quantity: 30, minQuantity: 10, cost: 4500, category: 'لحوم' },
            { id: 3, name: 'أرز', unit: 'kg', quantity: 100, minQuantity: 20, cost: 800, category: 'حبوب' },
            { id: 4, name: 'زيت', unit: 'ltr', quantity: 40, minQuantity: 10, cost: 1500, category: 'زيوت' },
            { id: 5, name: 'شاي', unit: 'kg', quantity: 15, minQuantity: 5, cost: 3000, category: 'مشروبات' }
        ],
        employees: [
            { id: 1, name: 'أحمد محمد', position: 'كاشير', phone: '+967736574726', salary: 80000, hireDate: '2024-01-15', active: true },
            { id: 2, name: 'علي سعيد', position: 'شيف', phone: '+967781458044', salary: 120000, hireDate: '2023-06-01', active: true },
            { id: 3, name: 'سالم ناصر', position: 'ويتر', phone: '+967736574727', salary: 60000, hireDate: '2024-03-10', active: true }
        ],
        orders: [],
        invoices: [],
        purchases: [],
        vouchers: [],
        cashbox: [
            { id: 1, name: 'الصندوق الرئيسي', balance: 100000, currency: 'YER' },
            { id: 2, name: 'صندوق الكاشير', balance: 50000, currency: 'YER' }
        ],
        logs: [],
        settings: {
    invoice: {
        headerAr: 'مطعم IBRA',
        headerEn: 'IBRA Restaurant',
        logo: '',
        phone: '+967736574726',
        address: 'صنعاء - شارع تعز',
        footerText: 'شكراً لزيارتكم',
        showTax: true,
        showServiceCharge: true,
        showLogo: true,
        paperSize: 'A4',  // ✅ غيّر من '80mm' إلى 'A4'
        defaultPrinter: 'default',
        taxNumber: '',
        autoPrint: false,
        printCopies: 1
    },
    
            pos: {
                defaultCategory: 'all',
                soundEnabled: true,
                autoFocusSearch: true,
                allowNegativeStock: false,
                tableService: true,
                takeaway: true,
                delivery: true
            },
            theme: {
                primary: '#1e3a8a',
                secondary: '#d97706',
                darkMode: false
            }
        }
    },

    // Initialize DB
    init: function() {
        const existing = this.get('system');
        if (!existing) {
            // First time - seed data
            Object.keys(this.seed).forEach(key => {
                this.set(key, this.seed[key]);
            });
            this.log('system', 'تم تهيئة قاعدة البيانات');
        }
    },

    // Get data
    get: function(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('DB get error:', e);
            return null;
        }
    },

    // Set data
    set: function(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('DB set error:', e);
            return false;
        }
    },

    // Update item in collection
    update: function(key, id, updates) {
    const collection = this.get(key) || [];
    const index = collection.findIndex(item => item.id === id);
    if (index !== -1) {
        collection[index] = { ...collection[index], ...updates };
        this.set(key, collection);
        return collection[index];
    }
    return null;
},

    // Add item to collection
    add: function(key, item) {
        const collection = this.get(key) || [];
        const newId = collection.length > 0 ? Math.max(...collection.map(i => i.id || 0)) + 1 : 1;
        const newItem = { ...item, id: newId };
        collection.push(newItem);
        this.set(key, collection);
        return newItem;
    },

    // Delete item
    remove: function(key, id) {
        const collection = this.get(key) || [];
        const filtered = collection.filter(item => item.id !== id);
        this.set(key, filtered);
        return true;
    },

    // Find by id
    find: function(key, id) {
        const collection = this.get(key) || [];
        return collection.find(item => item.id === id);
    },

    // Log operation
    log: function(type, message, user = 'system') {
        const logs = this.get('logs') || [];
        logs.unshift({
            id: Date.now(),
            type,
            message,
            user,
            date: new Date().toISOString()
        });
        // Keep last 500
        if (logs.length > 500) logs.length = 500;
        this.set('logs', logs);
    },

    // Reset database
    reset: function() {
        Object.keys(this.seed).forEach(key => {
            localStorage.removeItem(this.prefix + key);
        });
        this.init();
    },

    // Export all data
    exportAll: function() {
        const data = {};
        Object.keys(this.seed).forEach(key => {
            data[key] = this.get(key);
        });
        return data;
    },

    // Import data
    importAll: function(data) {
        Object.keys(data).forEach(key => {
            this.set(key, data[key]);
        });
    }
};

// Initialize on load
DB.init();
