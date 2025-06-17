# Profolio - Proje Yönetim Platformu

Profolio, bir proje yönetim platformudur. Kullanıcıların projelerini verimli bir şekilde yönetmelerine, işbirliği yapmalarına ve ilerlemelerini takip etmelerine olanak sağlar. Proje geliştirme aşamasındadır.

## Özellikler

- 📊 Proje Takibi
- 👥 Ekip Oluşturma
- 📅 Takvim Entegrasyonu
- 💬 Mesajlaşma
- 📈 Raporlama
- 🔔 Bildirim Sistemi (geliştirme aşamasında)
- 👤 Kullanıcı Yönetimi

## Teknolojiler

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Veritabanı:** SQLite (Prisma ORM)
- **Kimlik Doğrulama:** NextAuth.js
- **UI Bileşenleri:** Shadcn/ui
- **Animasyonlar:** Framer Motion

## Başlangıç

### Gereksinimler

- Node.js 18.0.0 veya üzeri
- npm veya yarn

### Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/Selinclb/profolio.git
cd profolio
```

2. Bağımlılıkları yükleyin:
```bash
npm install --legacy-peer-deps

```

3. Veritabanını oluşturun:
```bash
npx prisma migrate dev
```
4. Admin kullanıcısı oluşturmak için script:
### Seed Verilerini Ekleme

```bash
npm run seed
```
### Varsayılan Kullanıcı

Projeyi ilk kez çalıştırdığınızda, aşağıdaki bilgilerle giriş yapabilirsiniz:

- **Email:** admin@example.com
- **Şifre:** admin123


5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
```


6. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.



## Proje Yapısı

```
profolio/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── auth/         # Kimlik doğrulama API'leri
│   │   ├── notifications/# Bildirim API'leri
│   │   └── projects/     # Proje API'leri
│   ├── dashboard/        # Dashboard sayfaları
│   │   ├── admin/       # Admin paneli
│   │   ├── calendar/    # Takvim sayfası
│   │   ├── messages/    # Mesajlaşma sayfası
│   │   ├── projects/    # Proje yönetimi
│   │   ├── reports/     # Raporlar
│   │   ├── settings/    # Ayarlar
│   │   └── team/        # Takım yönetimi
│   ├── login/           # Giriş sayfası
│   ├── signup/          # Kayıt sayfası
│   ├── layout.tsx       # Ana layout
│   └── page.tsx         # Ana sayfa
├── components/           # React bileşenleri
│   ├── ui/              # Temel UI bileşenleri
│   ├── dashboard/       # Dashboard bileşenleri
│   └── forms/           # Form bileşenleri
├── hooks/               # Custom React hooks
├── lib/                 # Yardımcı fonksiyonlar
│   ├── auth.ts         # Kimlik doğrulama
│   ├── prisma.ts       # Prisma client
│   └── utils.ts        # Genel yardımcı fonksiyonlar
├── prisma/             # Veritabanı
│   ├── migrations/     # Veritabanı migration'ları
│   └── schema.prisma   # Veritabanı şeması
├── public/             # Statik dosyalar
│   ├── avatars/        # Profil resimleri
│   └── profoliologo.svg# Logo
├── scripts/            # Yardımcı scriptler
│   └── seed.ts         # Veritabanı seed scripti
├── styles/             # Global stiller
├── types/              # TypeScript tip tanımlamaları
├── middleware.ts       # Next.js middleware
├── next.config.mjs     # Next.js yapılandırması
├── tailwind.config.ts  # Tailwind CSS yapılandırması
└── tsconfig.json       # TypeScript yapılandırması
```

### Önemli Dosyalar ve Klasörler

- **app/**: Next.js 14 app router yapısı. Tüm sayfalar ve API rotaları burada bulunur.
- **components/**: Yeniden kullanılabilir React bileşenleri.
- **lib/**: Proje genelinde kullanılan yardımcı fonksiyonlar ve servisler.
- **prisma/**: Veritabanı şeması ve migration'lar.
- **public/**: Statik dosyalar (resimler, logolar vb.).
- **scripts/**: Veritabanı seed ve diğer yardımcı scriptler.
- **types/**: TypeScript tip tanımlamaları.

## Veritabanı İşlemleri

### Veritabanını Sıfırlama

Veritabanını sıfırlamak için:

```bash
npx prisma migrate reset
```


## Dağıtım

Projeyi production ortamına dağıtmak için:

1. Build alın:
```bash
npm run build
```

2. Production sunucusunu başlatın:
```bash
npm start
```
## Değerlendirme
Projeye başladığımda önce frontend kısmının nasıl olacağını tasarladım. Basit görünümlü sade bir anasayfa, anlaşılır bir dashboard olmasını istedim. Uzun CSS kodları kullanmak yerine Tailwind kullandım çünkü tasarım sade kalacağı için tailwind işimi gördü. Yaptığım başka projelerde kullanıcı kimlik doğrulamasını doğru bir şekilde entegre ederken bazen sıkıntı yaşıyordum. Bu konuda projede kodları yazmadan önce chatgpt ile auth işlemlerinin nasıl olduğuyla ilgili bir yardım aldım. Yan bir proje oluşturup sadece auth işlemlerini yaparak test ettim. Sonra bu projede auth yapılandırmalarını yaptım. 

Şifre hashlemek için bcryptjs kullandım. Projeleri componentlere ayırdım. İlk yaptığımda daha fazla component vardı. Component sayısını azaltıp yeniden düzenledim. Dashboard sidebar kısmını yaparken sadece adminin ulaşabileceği bir sekme yer alıyor.

Takım üyesi eklerken yeni üye ekle diyerek arama motoruna kullanıcının sisteme kayıt olduğu e-mail adresi yazılarak ekleme işlemi gerçekleştirilir. Bunun dışında email bilgisi girilmemişse kullanıcılar listelenemez olarak ayarladım.

Veritabanı işlemlerinde Prisma ORM kullanarak SQLite veritabanı ile çalıştım. Prisma'nın type-safe özelliği sayesinde veritabanı işlemlerini daha güvenli bir şekilde gerçekleştirdim. Proje yapısını oluştururken Next.js 14'ün app router yapısını kullandım. Bu sayede sayfa yönlendirmelerini ve API rotalarını daha düzenli bir şekilde yönetebildim.

Projede kullanıcı deneyimini iyileştirmek için Framer Motion ile animasyonlar ekledim. Özellikle sayfa geçişlerinde ve bildirimlerde animasyonlar kullanarak daha akıcı bir deneyim sağladım. UI bileşenleri için Shadcn/ui kütüphanesini tercih ettim çünkü hem özelleştirilebilir hem de modern bir görünüm sunuyor.

Proje geliştirme sürecinde en büyük zorluklardan biri bildirim sistemini implemente etmek oldu. Gerçek zamanlı bildirimler için WebSocket kullanmayı düşündüm ancak şu an için basit bir bildirim sistemi ile devam ediyorum. İlerleyen aşamalarda WebSocket entegrasyonu ile gerçek zamanlı bildirimleri eklemeyi planlıyorum.

Takvim entegrasyonu için React Big Calendar kütüphanesini kullandım. Bu sayede proje tarihlerini ve görevleri görsel olarak takip edebilmek mümkün oldu. Mesajlaşma özelliğini eklerken, kullanıcılar arası iletişimi sağlamak için basit bir mesajlaşma sistemi tasarladım.

Projeyi geliştirirken TypeScript kullanmanın faydalarını gördüm. Tip güvenliği sayesinde hataları daha erken tespit edebildim ve kod kalitesini artırabildim. Ayrıca, projenin bakımını ve geliştirilmesini daha kolay hale getirdi.

Gelecek planlarım arasında:
- Gerçek zamanlı bildirim sistemi
- Dosya paylaşım özelliği
- Gelişmiş raporlama araçları
- Ekip üyeleri arası görev atama sistemi
- Proje şablonları
- Şifremi unuttum işlemleri
gibi özelliklerin eklenmesi yer alıyor.
