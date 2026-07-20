# UI/UX Tasarım Standartları ve Arayüz Analiz Dökümantasyonu (Çift Tema Destekli)

Bu döküman, ERZE BT Envanter (IT Asset Management) sistemine ait tüm ekran görüntülerinin detaylı analizine dayanarak hazırlanmış; hem mevcut Koyu Tema (Dark Mode) mimarisini hem de sisteme entegre edilmesi gereken **Açık Tema (Light Mode)** tasarım standartlarını içeren esnek bir Tasarım Sistemi (Design System) kılavuzudur.

---

## 1. Genel Tasarım İlkeleri ve Görsel Kimlik
Uygulama, kullanıcının çalışma ortamına ve tercihine göre sol alt profil kartındaki Güneş/Ay ikonu aracılığıyla anlık olarak değiştirilebilen **Çift Tema (Dark/Light Mode)** esnekliğine sahip bir mimariyi benimsemektedir.

### Renk ve Tema Dönüşüm Matrisi (Theme Tokens)
Uygulamanın görsel bütünlüğünü bozmadan iki tema arasında yapılması gereken dönüşüm kuralları aşağıda tanımlanmıştır:

* **Ana Arka Plan:** Koyu temada mat ve koyu nötr bir yüzey kullanılırken; açık temada gözü yormayan, hafif ve soft bir gri tonu tercih edilir.
* **Kart / Panel Yüzeyi:** Dashboard kartları, tablolar ve form kutularının iç yüzeyleri; koyu temada antrasit/koyu gri tonlarında, açık temada ise saf beyaz olarak kurgulanır.
* **Birincil Aksiyon (Primary):** Markanın kimlik rengi olan **canlı kırmızı**, her iki temada da (butonlar, aktif sekmeler, kritik vurgular) görsel sürekliliği sağlamak adına **sabit kalır**.
* **Metin Hiyerarşisi:** Koyu temadaki beyaz sayfa başlıkları ve birincil metinler, açık temada yüksek kontrastlı koyu antrasit/siyah tonlarına dönüşir. Yardımcı metinler ve tablo başlıkları ise her iki temada da arka plana uygun gri tonlarıyla ayrıştırılır.
* **Durum Etiketleri (Badge):** Kullanımda (Yeşil), Arızalı/Hurda (Kırmızı), Depoda (Mavi) ve Yenileme Yaklaşan (Turuncu) gibi durum renkleri açık temaya geçildiğinde okunabilirliği korumak adına daha koyu ve doygun tonlarda metin kontrastı ile sunulur.
* **Kart Gölgeleri ve Derinlik (Shadows):** Koyu temada katmanlar ince sınır çizgileriyle ayrılırken; açık temada saf beyaz kartların havada durma hissini (elevation) netleştirmek için yumuşak, dağılan hafif gölgeler kullanılır.

### Tipografi Standartları
- **Yazı Tipi (Font Family):** Ekran genelinde temiz ve geometrik çizgilere sahip modern bir sans-serif font ailesi (Inter, Segoe UI veya Roboto) kullanılmalıdır.
- **Hiyerarşi Ölçüleri:** Sayfa başlıkları kalın (Bold) ve belirgin; kart metrikleri büyük punto ve durum renkleriyle kodlanmış; tablo içerikleri ise düzenli (Regular) punto ve yüksek okunabilirlikte olmalıdır.

---

## 2. Sol Navigasyon Menüsü (Navigation Sidebar)
Tüm ekranlarda sol tarafa sabitlenmiş, uygulamanın ana yönetim omurgasını oluşturan dikey menü mimarisidir.
- **Logo Alanı:** Sol üst köşede kırmızı "erze" logosu ve yanında "BT Envanter / IT Asset Management" alt başlığı yer alır.
- **Açık Tema Dönüşümü:** Koyu temada tamamen koyu olan bu menü, Açık Tema moduna geçildiğinde temiz bir beyaz veya çok hafif bir gri tonu almalı, ana ekran ile birleştiği sağ sınır çizgisi ince bir dikey çizgiyle ayrılmalıdır.
- **Aktif Menü Elemanı:** Seçili olan sekme (örn. Dashboard, Cihazlar) koyu temada hafif kırmızımsı karartılmış bir arka plan alırken; açık temada soluna dik kırmızı bir çizgi yerleştirilerek veya soft, şeffaf bir kırmızı arka plan dolgusuyla belirginleştirilmelidir.
- **Kullanıcı Profil Kartı (Alt Alan):** Giriş yapan kullanıcının bilgilerini barındıran alt alandaki Güneş/Ay ikonu, aktif bir geçiş anahtarı (toggle) görevi görerek temayı anlık olarak değiştirir.

---

## 3. Ortak Bileşenlerin Tasarım Standartları

### A. İstatistik ve Metrik Kartları
- **Koyu Tema:** Kart arka planı koyu antrasit, sayılar beyaz, kenarlıklar minimal belirginliktedir.
- **Açık Tema:** Kart arka planı saf beyaz, etrafında yumuşak bir gölge yer alır. Sayısal metrikler kendi durum renklerinin koyu kontrastlı versiyonlarıyla yazılır.

### B. Form Giriş Alanları ve Seçim Kutuları (Inputs & Dropdowns)
- **Giriş Kutuları (Inputs):** Açık temada iç arka plan saf beyaz, kenarlıklar açık gri olmalıdır. Odaklanıldığında (focus durumunda) kenarlık rengi birincil marka kırmızısına dönmeli ve hafif bir parlama efekti vermelidir.
- **Placeholder Metinler:** Kullanıcıyı yönlendiren örnek metinler (örn. "Marka (ör. Xiaomi)") giriş alanıyla karışmaması için soft gri tonlarında tutulmalıdır.
- **Modal Pencereler (Pop-up Forms):** Yeni kayıt ekleme veya arıza bildirme esnasında ekranın üzerine açılan, arka planı karartan iki sütunlu simetrik pencerelerdir. Sağ altta yan yana konumlanmış gri "İptal" ve kırmızı "Kaydet" buton gruplarını barındırır.

### C. Gelişmiş Tablo Mimarisi (Data Tables)
- **Üst Kontrol Alanı:** Tablonun üstünde kelime bazlı hızlı arama inputu ve dinamik kategori/durum dropdown seçicileri yer alır.
- **Aksiyon Butonları:** Satır sonlarında hızlı işlemler için standart ikonlar bulunur (Düzenle, Sil, İade Et, Form İndir).

---

## 4. Ekran Bazlı Fonksiyonel Analizler

### A. Dashboard ve Metrikler
- Sayfa başında profil ve bildirim alanı, hemen altında grid yapıda özet metrik kartları, orta alanda durum ve şube dağılımlarını gösteren grafikler (pasta ve çubuk grafikler) ve en altta "Son Zimmetler" ile "Son Eklenen Cihazlar" tabloları yer alır. Sayfa genelinde lokasyon bazlı hızlı filtreleme sağlayan yatay çip (Segmented Control) grubu bulunur.

### B. Lisans & Abonelik Modülü
- **Metrik Kartları:** Toplam Lisans, Toplam Koltuk, Kullanılan, Boş Koltuk, Yenileme Yaklaşan ve Yıllık Maliyet özetlerini içerir.
- **Yeni Lisans Formu:** Lisans adı, abonelik/ömür boyu tipi, tedarikçi, koltuk adeti, ürün anahtarı, maliyet, para birimi seçimi, satın alma ve yenileme tarihlerini barındıran giriş alanlarından oluşur.

### C. Fiziksel Sayım Modülü (Barkod & QR Entegrasyonu)
- **Sayım Takip Ekranı:** Üst barda Beklenen, Sayılan, Eksik ve İlerleme Yüzdesi (%0 - %100) kartları yer alır.
- **Cihaz Okut / Ara Paneli:** El okuyucu (Zebra vb. donanımsal scanner) entegrasyonu destekli, barkod okutulduğunda otomatik işlem yapan ve manuel giriş için "İşaretle" butonu barındıran akıllı arama alanıdır.
- **Alt Sekmeler (Tabs):** "Sayılanlar" ve "Eksikler" olarak iki ana sekmede envanter listelenir.

### D. Raporlar Modülü
- **Filtre Grupları:** Garanti Raporu sekmesinde kalan süreye göre hızlı filtreleme sağlayan zamansal buton grupları ("30 gün", "90 gün" vb.) yer alır. Sağ üst köşede "Excel İndir" aksiyonu standarttır.

### E. Ayarlar ve Yapılandırma Paneli
- **Departman Yönetimi Tablosu:** Şirket organizasyon şemasına uygun departman isimleri listelenir. "Bağlı Personel" sütununda soft mavi bir badge içerisinde ilgili departmana ait personel sayıları (örn. "11 personel") gösterilir.

---

## 5. UX/UI Geliştirme ve Tutarlılık Kuralları

1. **Boş Durum (Empty State) Yönetimi:** Tablolarda listelenecek veri bulunmadığında (örn. hiç lisans veya sayım kaydı yoksa) ekran ortasında kullanıcı dostu, açıklayıcı bir metin ("Lisans kaydı yok", "Henüz sayım yapılmamış") konumlandırılmalıdır. Bu metinler açık temada arka plan rengi içinde kaybolmayacak kontrastta olmalıdır.
2. **Zebra Tablo Düzeni (Stripped Tables):** Geniş veri tablolarında, açık tema modunda satırların takibini kolaylaştırmak adına ardışık satırlarda çok hafif, birbirini takip eden açık gri ve beyaz renk geçişleri kullanılmalıdır.
3. **Zebra Scanner Uyumluluğu:** Fiziksel sayım ekranındaki giriş alanı, donanımsal el terminallerinden gelen anlık "Enter" sinyalini yakalayarak sayfayı yenilemeden veriyi doğrudan listeye ekleyecek teknik altyapıya sahip olmalıdır.
4. **Sayım Ekranı Göz Konforu:** Fiziksel sayım gibi personelin sahada ekrana çok uzun süre bakarak işlem yaptığı modüllerde, göz yorgunluğunu önlemek amacıyla sistem açık temada olsa dahi kullanıcının isteğe bağlı olarak sadece sayım panelini koyu modda tutabilmesine (bireysel gece modu) olanak tanınmalıdır.