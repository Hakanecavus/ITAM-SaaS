# ITAM SaaS (IT Asset Management) 🚀

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

ITAM (IT Asset Management), orta ve büyük ölçekli şirketlerin BT donanımlarını, yazılım lisanslarını, sarf malzemelerini ve bu varlıkların finansal yaşam döngülerini tek bir merkezden yönetmelerini sağlayan **Multi-Tenant (Çoklu Kiracı) destekli bir B2B SaaS** platformudur.

## 🌟 Öne Çıkan Özellikler

- **Multi-Tenant Mimari (Subdomain Desteği):** Her şirket kendi alt alan adından (`sirket.itam.com`) giriş yapar. Veritabanı ve dosyaları tamamen izoledir.
- **Varlık ve Zimmet Yönetimi:** Bilgisayar, telefon, sunucu gibi donanımların kimde olduğunu barkod/QR kod desteğiyle anlık takip edin.
- **Dinamik Özel Alanlar (Custom Fields):** Varlıklara "RAM", "İşletim Sistemi", "MAC Adresi" gibi şirketinize özel sınırsız alan ekleyin.
- **Finans ve Amortisman Raporları:** Satın alınan donanımların faydalı ömürlerine göre yıllara yayılan değer kaybını grafikler üzerinden izleyin. BT yatırım bütçenizi yönetin.
- **Sarf Malzemesi & Stok Yönetimi:** Klavye, fare, toner gibi sayılamayacak kadar çok olan demirbaş dışı malzemelerin stok takibini yapın.
- **Yazılım Lisans Yönetimi:** Şirketinizdeki Office 365, Adobe, Figma gibi lisansların maliyetlerini ve kime atandıklarını kontrol altında tutun.
- **Rol Tabanlı Erişim (RBAC):** "Sistem Yöneticisi", "IK Uzmanı", "BT Uzmanı" gibi özel yetkiler tanımlayın.
- **Dijital İmza & Sözleşme:** Cihaz teslimlerinde sistem üzerinden otomatik oluşturulan zimmet tutanaklarını dijital olarak imzalatın.

## 🛠️ Kullanılan Teknolojiler

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Dil:** TypeScript
- **Stil & UI:** Tailwind CSS, Lucide Icons, Recharts (Finansal grafikler için)
- **Veritabanı (ORM):** Prisma ORM (SQLite Multi-Database mimarisi)
- **Barkod/QR:** `react-qr-code`, `html2canvas` (Etiket yazdırma işlemleri için)

## 🚀 Kurulum ve Çalıştırma (Geliştirme Ortamı)

Bu projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

**1. Depoyu Klonlayın**
```bash
git clone https://github.com/Hakanecavus/ITAM-SaaS.git
cd ITAM-SaaS
```

**2. Bağımlılıkları Yükleyin**
```bash
npm install
```

**3. Çevresel Değişkenleri Ayarlayın**
Ana dizinde `.env` isimli bir dosya oluşturun ve geliştirme veritabanı ayarlarınızı ekleyin:
```env
# Master Veritabanı
DATABASE_URL="file:./prisma/master.db"
```

**4. Veritabanlarını Başlatın**
```bash
# Prisma migration komutlarını çalıştırın
npx prisma generate
npx prisma db push
```

**5. Geliştirme Sunucusunu Başlatın**
```bash
npm run dev
```

Proje varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.
*(Örnek tenant girişi için sistemin proxy ayarlarından dolayı `http://[kiraci_adi].localhost:3000` kullanabilirsiniz).*

## 📊 Ekran Görüntüleri ve Arayüz
Platform, modern **Glassmorphism** tasarım diliyle oluşturulmuştur. Açık ve Koyu tema (Dark Mode) desteği varsayılan olarak sistem ayarlarına göre çalışır. Finansal raporlardan cihaz detay ekranlarına kadar her arayüz yöneticilerin kullanımını kolaylaştıracak şekilde optimize edilmiştir.

---
*Bu proje modern kurumsal standartlar gözetilerek geliştirilmiştir.*
