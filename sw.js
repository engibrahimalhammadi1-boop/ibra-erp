const CACHE_NAME = 'ibra-erp-v1.0.0';
const urlsToCache = [
    './',
    './login.html',
    './app.html',
    './manifest.json',
    './css/style.css',
    './js/db.js',
    './js/utils.js',
    './js/router.js',
    './js/app.js',
    './js/screens/login.js',
    './js/screens/pos.js',
    './js/screens/kitchen.js',
    './js/screens/tables.js',
    './js/screens/menu.js',
    './js/screens/inventory.js',
    './js/screens/purchases.js',
    './js/screens/invoices.js',
    './js/screens/customers.js',
    './js/screens/suppliers.js',
    './js/screens/reports.js',
    './js/screens/vouchers.js',
    './js/screens/accounts.js',
    './js/screens/employees.js',
    './js/screens/payroll.js',
    './js/screens/cashbox.js',
    './js/screens/users.js',
    './js/screens/settings.js',
    './js/screens/logs.js',
    './js/screens/guide.js',
    './js/screens/ai.js',
    './js/screens/developer.js',
    './js/screens/einvoice.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(names => 
            Promise.all(names.map(n => n !== CACHE_NAME ? caches.delete(n) : null))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(res => res || fetch(event.request))
    );
});
