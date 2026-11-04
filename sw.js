const CACHE_NAME = 'rawdat-almuslim-v1';
const assetsToCache = [
  'index.html',
  'manifest.json',
  'اذان عبدالباسط.mp3',
  'اذان مشاري بن راشد.mp3',
  'اذان محمد رفعت.mp3',
  'اذان محمد علي البنا.mp3',
  'اذان محمود خليل الحصري.mp3',
  'اذان الفجر.mp3',
  'اذان ناصر القطامي.mp3'
];

// تثبيت Service Worker وحفظ الملفات في ذاكرة التخزين المؤقت
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('تم فتح الكاش بنجاح');
      return cache.addAll(assetsToCache.map(url => new Request(url, { mode: 'no-cors' })));
    }).catch(err => {
      console.log('خطأ أثناء التخزين المؤقت:', err);
    })
  );
  self.skipWaiting();
});

// تفعيل Service Worker وتنظيف النسخ القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// التعامل مع طلبات الشبكة (جلب الملفات من الكاش في حال انقطاع الإنترنت أو التشغيل الأوفلاين)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // إذا فشل الاتصال ولم يكن الملف موجوداً في الكاش
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('index.html');
        }
      });
    })
  );
});