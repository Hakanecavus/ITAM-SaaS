# BT ENVANTER VE VARLIK YÖNETİM SİSTEMİ
## Yazılım Gereksinim Dokümanı: Fabrika Bilgi İşlem Envanter Programı için Fonksiyonel Kapsam, Modüller, Ekranlar ve İş Akışları

* **Versiyon:** 1.0
* **Tarih:** 11.06.2026
* **Kapsam:** Çok lokasyonlu fabrika BT varlık yönetimi

> **Dokümanın Amacı:** > Bu doküman, kurum içinde geliştirilecek Bilgi İşlem Envanter / IT Asset Management sisteminin yazılımcılar tarafından analiz edilmesi, tasarlanması ve fazlar halinde geliştirilmesi için temel gereksinimleri tanımlar. Amaç, yalnızca cihaz listesi tutmak değil; satınalma, zimmet, lokasyon, lisans, garanti, servis, sayım, güvenlik ve yaşam döngüsü yönetimini tek bir sistemde toplamaktır.

---

## 1. Doküman Bilgileri

| Alan | Değer |
| :--- | :--- |
| **Doküman adı** | BT Envanter ve Varlık Yönetim Sistemi - Yazılım Gereksinim Dokümanı |
| **Versiyon** | 1.0 |
| **Hazırlanma tarihi** | 11.06.2026 |
| **Kullanım amacı** | Yazılımcılara analiz ve geliştirme kapsamı vermek |
| **Hedef kullanıcılar** | Bilgi İşlem, satınalma, yöneticiler, lokasyon sorumluları, denetim kullanıcıları |
| **Önerilen yaklaşım** | **Fazlı geliştirme:** önce temel envanter ve zimmet, sonra lisans, garanti, servis, sayım, entegrasyon ve helpdesk |

---

## 2. Yönetici Özeti

Geliştirilecek sistem, kurumun tüm BT varlıklarını tek merkezden izleyebilmesini sağlamalıdır. Sistem; laptop, masaüstü bilgisayar, monitör, yazıcı, barkod okuyucu, el terminali, switch, access point, firewall, kamera, sunucu, UPS, telefon, tablet, lisans ve aksesuar gibi varlıkların yaşam döngüsünü yönetmelidir.

Bu sistem Excel tabanlı basit bir cihaz listesi olarak tasarlanmamalıdır. Hedef, cihazın satın alınmasından kullanıcıya zimmetlenmesine, lokasyon değiştirmesine, servis görmesine, garanti ve lisans takibine, fiziksel sayıma, işten çıkış kontrolüne ve hurdaya ayrılmasına kadar tüm süreci kayıt altına alan kurumsal bir **IT Asset Management** yapısıdır.

> **Ana Prensip:** Cihaz kayıtları silinmemelidir. Cihazlar durum değiştirerek yaşam döngüsünde ilerlemelidir: *stokta, hazırlanıyor, kullanımda, serviste, arızalı, kayıp, hurda bekliyor, hurdaya ayrıldı* gibi.

---

## 3. Hedefler

* Tüm BT varlıklarını tekil demirbaş numarası ve seri numarası ile takip etmek.
* Hangi cihazın kimde, hangi fabrikada, hangi departmanda ve hangi durumda olduğunu anlık görebilmek.
* Dijital zimmet, iade ve kullanıcı onayı süreçlerini kayıt altına almak.
* Garanti, lisans, kontrat ve abonelik yenileme tarihlerini otomatik uyarılarla yönetmek.
* Fiziksel sayım süreçlerini QR/barkod ile hızlandırmak.
* Arıza, servis, bakım ve hurda geçmişini cihaz kartı üzerinde izlemek.
* Kullanılmayan lisansları ve atıl cihazları görünür hale getirerek maliyet tasarrufu sağlamak.
* İşe giriş ve işten çıkış süreçlerinde cihaz, lisans ve erişim kontrollerini standartlaştırmak.
* İleride Microsoft 365, Entra ID, Intune, SAP S/4HANA, firewall ve helpdesk entegrasyonlarına hazır bir mimari kurmak.

---

## 4. Referans Alınacak Ürünler ve Yaklaşım

Aşağıdaki ürünler birebir kopyalanacak sistemler olarak değil, fonksiyonel referans olarak değerlendirilmelidir. Kurum içi geliştirilecek sistem, bu ürünlerdeki başarılı özellikleri sade ve fabrika yapısına uygun şekilde uygulamalıdır.

| Referans Ürün | Güçlü Yönü | Bu Projede Örnek Alınacak Taraf |
| :--- | :--- | :--- |
| **Snipe-IT** | Açık kaynak varlık yönetimi, zimmet, check-in/check-out, QR/barkod, lisans ve aksesuar takibi | Sade kullanıcı deneyimi, dijital zimmet, QR etiket, aksesuar ve lisans atama mantığı |
| **ManageEngine AssetExplorer** | Satınalma, kontrat, lisans uyumluluğu, varlık yaşam döngüsü, raporlama | Satınalma-fatura-tedarikçi ilişkisi, kontrat ve lisans yenileme uyarıları |
| **Lansweeper** | Ağdan otomatik cihaz keşfi, donanım/yazılım envanteri, bilinmeyen cihaz görünürlüğü | IP/MAC/hostname keşfi, bilinmeyen cihaz uyarısı, otomatik envanter zenginleştirme |
| **GLPI** | ITSM, helpdesk, envanter, lisans, ticket ve varlık ilişkisi | İleride talep yönetimi ve cihaz bazlı destek geçmişi |
| **ServiceNow ITAM** | Kurumsal seviyede donanım, yazılım ve cloud varlık yaşam döngüsü | Uzun vadeli vizyon: uçtan uca lifecycle, CMDB ve süreç otomasyonu |
| **Microsoft Intune** | Yönetilen Windows cihazlardan donanım ve uygulama özellikleri toplama | Microsoft 365/Entra/Intune entegrasyonu ile otomatik veri besleme |

---

## 5. Kapsam

### 5.1 Kapsama Dahil Varlık Tipleri
* **Bilgisayarlar:** Laptop, masaüstü PC, mini PC, thin client.
* **Çevre Birimleri:** Monitör, klavye, mouse, adaptör, dock station, çanta.
* **Yazıcılar ve Sarflar:** Yazıcı, etiket yazıcı, toner, kartuş, drum, etiket rulosu.
* **Mobil ve Saha Cihazları:** Tablet, cep telefonu, el terminali, barkod okuyucu, RFID cihazı.
* **Ağ Cihazları:** Switch, access point, firewall, modem/router, SFP, patch panel gibi izlenmesi gereken ekipmanlar.
* **Güvenlik ve Altyapı:** Kamera, NVR/DVR, UPS, rack ekipmanı, sunucu, NAS, backup cihazı.
* **Yazılım ve Lisanslar:** Microsoft 365, Windows, Office, antivirus/EDR, VPN, SQL Server, CAD, Adobe, firewall lisansı, backup lisansı.
* **Abonelik ve Kontratlar:** Domain, SSL, cloud servisleri, bakım anlaşmaları, destek sözleşmeleri.

### 5.2 Kapsam Dışı veya İleri Faz
* İlk fazda tam otomatik ajan tabanlı envanter zorunlu değildir; ancak mimari buna hazır olmalıdır.
* İlk fazda SAP entegrasyonu zorunlu değildir; ancak satınalma ve duran varlık bağlantı alanları hazır olmalıdır.
* İlk fazda kapsamlı helpdesk zorunlu değildir; ancak talep sistemiyle birleşebilecek veri modeli kurulmalıdır.
* Kamera, kapı geçiş, üretim makineleri gibi OT varlıkları ilk aşamada minimum kimlik bilgisiyle takip edilebilir.

---

## 6. Kullanıcı Rolleri ve Yetkiler

| Rol | Yetkiler |
| :--- | :--- |
| **Sistem Yöneticisi** | Tüm modüllere erişim, kullanıcı/rol tanımı, sistem ayarları, silme/iptal yetkileri, entegrasyon ayarları. |
| **BT Yöneticisi** | Tüm varlıkları görme, onaylama, raporlama, zimmet/servis/hurda kararlarını yönetme. |
| **BT Personeli** | Varlık kaydı açma, zimmetleme, iade alma, servis kaydı oluşturma, QR basma, sayım yapma. |
| **Satınalma Kullanıcısı** | Satınalma, fatura, tedarikçi, kontrat ve garanti bilgilerini yönetme; teknik alanlara sınırlı erişim. |
| **Lokasyon Sorumlusu** | Kendi fabrika/lokasyonundaki cihazları görme, sayım yapma, durum bildirimi oluşturma. |
| **Departman Yöneticisi** | Kendi ekibindeki kullanıcıların cihaz ve lisanslarını görme; onay süreçlerine katılma. |
| **Son Kullanıcı** | Kendi zimmetli cihazlarını görme, teslim kabulü verme, iade talebi veya arıza talebi açma. |
| **Denetim Kullanıcısı** | Sadece okuma ve rapor alma yetkisi; kayıt değiştirme yetkisi yok. |

---

## 7. Ana Veri Yapısı

### 7.1 Temel Master Veriler

| Master Veri | Açıklama / Örnek |
| :--- | :--- |
| **Şirket** | Erze, Eple, Treplar gibi şirket yapıları. |
| **Fabrika / Lokasyon** | İzmir XPS, Urfa Flexible, Treplar America, ofis, depo, üretim sahası, server odası. |
| **Departman** | BT, üretim, kalite, planlama, depo, muhasebe, satınalma, satış, grafik. |
| **Kullanıcı** | Ad-soyad, e-posta, departman, yönetici, lokasyon, aktif/pasif durumu. |
| **Kategori** | Laptop, monitör, firewall, yazıcı, access point, lisans, sarf vb. |
| **Marka/Model** | Dell Latitude 5440, HP ProBook, Fortinet 100F, UniFi AP vb. |
| **Tedarikçi** | Satınalma yapılan firma, servis firması, distribütör. |
| **Durum Kodları** | Stokta, hazırlanıyor, kullanımda, arızalı, serviste, hurda, kayıp vb. |
| **Maliyet Merkezi** | Departman veya fabrika bazlı maliyet kırılımı. |
| **Lisans Tipi** | Kullanıcı bazlı, cihaz bazlı, abonelik, perpetual, concurrent vb. |

### 7.2 Varlık Kartı Zorunlu Alanları

| Alan | Zorunluluk | Açıklama |
| :--- | :--- | :--- |
| **Demirbaş No** | Zorunlu | Sistem tarafından benzersiz üretilmeli veya manuel girilebilmeli. |
| **Seri No** | Zorunlu / Tipe Bağlı | Laptop, PC, yazıcı, switch, firewall gibi cihazlarda zorunlu olmalı. |
| **Kategori** | Zorunlu | Varlık tipini belirler. Form alanları kategoriye göre değişebilir. |
| **Marka / Model** | Zorunlu | Standart model kataloğundan seçilmeli. |
| **Durum** | Zorunlu | Yaşam döngüsü durumunu gösterir. |
| **Lokasyon** | Zorunlu | Cihazın fiziksel yeri. |
| **Kullanıcı / Sorumlu** | Tipe Bağlı | Kullanıcıya zimmetli cihazlarda zorunlu; ağ cihazlarında lokasyon sorumlusu olabilir. |
| **Alım Tarihi** | Önerilir | Garanti ve yaş raporları için gerekli. |
| **Garanti Bitiş Tarihi**| Önerilir | Otomatik uyarı için gerekli. |
| **Fatura No / Belge** | Önerilir | Satınalma ve mali kayıt için. |
| **IP / MAC / Hostname**| Tipe Bağlı | Ağ ve bilgisayar cihazlarında izlenmeli. |
| **Ek Dosyalar** | Opsiyonel | Fatura, servis formu, fotoğraf, zimmet formu. |
| **Açıklama / Not** | Opsiyonel | Özel durumlar için serbest metin. |

---

## 8. Durum ve Yaşam Döngüsü Modeli

Her varlık sistemde bir yaşam döngüsüne sahip olmalıdır. Varlık silinmemeli; yalnızca durumu değiştirilmelidir. Tüm durum değişiklikleri tarih, kullanıcı ve açıklama bilgisiyle loglanmalıdır.

| Durum | Anlamı | Sonraki Olası Durumlar |
| :--- | :--- | :--- |
| **Satınalma Sürecinde** | Ürün talep edildi veya sipariş verildi. | Depoya girdi, iptal edildi |
| **Depoya Girdi / Stokta**| Cihaz fiziksel olarak teslim alındı ve stokta bekliyor. | Hazırlanıyor, kullanımda, iade, hurda |
| **Hazırlanıyor** | BT kurulum, format, domain, güvenlik ayarları yapıyor. | Kullanımda, stokta, arızalı |
| **Kullanımda** | Kullanıcıya veya lokasyona atanmış durumda. | İade edildi, arızalı, serviste, kayıp |
| **İade Edildi** | Kullanıcıdan geri alındı. | Stokta, hazırlanıyor, hurda bekliyor |
| **Arızalı** | Kullanım dışı sorunlu cihaz. | Serviste, hurda bekliyor, stokta |
| **Serviste** | Dış servis veya iç tamirde. | Stokta, kullanımda, hurda bekliyor |
| **Kayıp** | Fiziksel olarak bulunamıyor. | Bulundu, hurda, denetim aksiyonu |
| **Hurda Bekliyor** | Hurdaya ayrılması önerilmiş, onay bekliyor. | Hurdaya ayrıldı, stokta |
| **Hurdaya Ayrıldı** | Kullanım dışı ve süreç tamamlandı. | Kapalı durum |

---

## 9. Modül Gereksinimleri

### 9.1 Varlık Kartı Modülü
* Her varlık için tekil bir kart oluşturulmalıdır. Kart üzerinde kimlik, teknik, mali, lokasyon, zimmet, garanti, lisans, servis ve dosya bilgileri bulunmalıdır.
* Kategoriye göre dinamik alanlar desteklenmelidir. Örneğin laptop için CPU/RAM/disk/OS; firewall için model, lisans, seri no, WAN bilgileri; yazıcı için sayaç ve sarf bilgileri.
* Varlık üzerinde yapılan tüm değişiklikler tarihçe olarak saklanmalıdır.
* Bir varlık başka varlıklara bağlanabilmelidir. Örneğin laptop + adaptör + çanta + dock station bir kit olarak zimmetlenebilir.

### 9.2 Zimmet ve İade Modülü
* Cihaz kullanıcıya, departmana veya lokasyona atanabilmelidir.
* Zimmet formu otomatik PDF olarak üretilebilmelidir. Kullanıcı dijital olarak teslim aldığını onaylayabilmelidir.
* İade sırasında kondisyon kontrol listesi doldurulmalıdır. Eksik aksesuar, hasar, çalışmıyor, format gerekli gibi durumlar işaretlenebilmelidir.
* Zimmet geçmişi kesinlikle kaybolmamalıdır.

### 9.3 QR / Barkod Etiket Modülü
* Her varlık için QR veya barkod etiketi üretilebilmelidir. Etiket üzerinde demirbaş no, kategori, marka/model and kısa lokasyon bilgisi bulunmalıdır.
* Mobil cihaz veya barkod okuyucu ile okutulduğunda varlık kartı açılmalıdır. Toplu etiket basımı desteklenmelidir.
* Sayım, zimmet, iade ve servis işlemleri QR okutma ile yapılabilmelidir.

### 9.4 Lokasyon ve Organizasyon Modülü
* Çok şirketetli, çok fabrikalı, çok departmanlı yapı desteklenmelidir. Lokasyon hiyerarşisi sınırsız alt kırılımla oluşturulabilmelidir.
* Cihazların lokasyon geçmişi tutulmalıdır. Fabrika, departman ve oda/saha bazlı envanter raporları alınabilmelidir.

### 9.5 Satınalma, Fatura ve Tedarikçi Modülü
* Satınalma talebi, sipariş, fatura, tedarikçi ve maliyet bilgileri varlıkla ilişkilendirilmelidir. Bir fatura veya satınalma belgesi altında birden fazla cihaz oluşturulabilmelidir.
* Garanti başlangıç ve bitiş tarihleri satınalma tarihinden üretilebilmelidir. Tedarikçi performansı ve servis maliyeti raporlanabilmelidir.
* İleride SAP S/4HANA satınalma ve duran varlık entegrasyonuna hazır alanlar bulunmalıdır.

### 9.6 Lisans ve Abonelik Yönetimi Modülü
* Yazılım lisansları kullanıcıya, cihaza veya departmana atanabilmelidir. Lisans adedi, kullanılan adet, boşta kalan adet ve kullanım oranı izlenmelidir.
* Bitiş tarihi, yenileme tarihi ve yıllık maliyet bilgisi takip edilmelidir. Kullanılmayan veya atıl lisanslar raporlanmalıdır.
* Farklı lisans tipleri desteklenmelidir (Microsoft 365, Adobe, CAD, vb.).

### 9.7 Garanti ve Kontrat Takip Modülü
* Garanti bitiş tarihleri cihaz kartında ve toplu raporlarda izlenmelidir. Kontratlar birden fazla varlıkla ilişkilendirilebilmelidir.
* 90, 60, 30 ve 15 gün önceden otomatik uyarı üretilebilmelidir. Domain, SSL, firewall, backup lisansı ve bakım anlaşmaları aynı yapıda takip edilmelidir.

### 9.8 Arıza, Servis ve Bakım Modülü
* Her cihaz için arıza ve servis geçmişi tutulmalıdır. Servise gönderme, servis dönüşü, garanti kapsamında / ücretli ayrımı yapılmalıdır.
* Yedek cihaz verildiyse servis kaydıyla ilişkilendirilmelidir. Maliyetler cihaz, model, kullanıcı, tedarikçi ve lokasyon bazlı raporlanmalıdır.
* Çok arıza yapan cihazlar otomatik olarak yenileme listesine önerilmelidir.

### 9.9 Fiziksel Sayım ve Denetim Modülü
* Sayım dönemi açılabilmeli ve lokasyon bazlı sayım yapılabilmelidir. QR/barkod okutularak cihazlar sayılmalıdır.
* Sistemde var ama bulunamadı, bulundu ama sistemde yok ve lokasyonu yanlış cihazlar raporlanmalıdır. Sayım sonucu onaylanmalı ve farklar tarihçe olarak saklanmalıdır.

### 9.10 Otomatik Keşif ve Ağ Envanteri Modülü
* İlk fazda basit IP tarama, ping, hostname, MAC ve vendor tespiti yapılabilir. Bilinmeyen ağ cihazları raporlanmalı ve son görülme tarihi tutulmalıdır.
* İleri fazda Windows agent, WMI/WinRM, SNMP, Intune ve Entra ID entegrasyonu düşünülmelidir. Keşif sonucu gelen cihazlar doğrudan ana envantere alınmamalı; önce BT onayına düşmelidir.

### 9.11 Microsoft 365 / Entra ID / Intune Entegrasyonu
* Kullanıcı bilgileri Entra ID üzerinden senkronize edilebilmeli ve aktif/pasif durumları takip edilmelidir.
* Microsoft 365 lisans atamaları görüntülenebilmelidir. Intune yönetimindeki cihazlardan donanım ve uygulama bilgileri alınabilmelidir. İşten ayrılan kullanıcı için otomatik kontrol listesi oluşturulmalıdır.

### 9.12 İşe Giriş / İşten Çıkış Kontrol Modülü
* **Yeni kullanıcı için:** Cihaz, lisans, mail, VPN, SAP, yazıcı ve klasör erişimi kontrol listesi.
* **İşten çıkan kullanıcı için:** Laptop, adaptör, telefon, Microsoft 365 lisansı, VPN, SAP, firewall, mail yönlendirme ve dosya erişimi kontrolü.
* Her madde sorumlu kişi, tarih ve tamamlandı bilgisi ile izlenmeli; tamamlanmayanlar yöneticilere raporlanmalıdır.

### 9.13 Helpdesk / Talep Modülü - İleri Faz
* Kullanıcılar kendi cihazlarıyla ilişkili destek talebi açabilmeli ve bu talep cihaz kartına bağlanmalıdır. Cihazın geçmiş destek talepleri, SLA, öncelik, atanan kişi ve çözüm notu izlenebilmelidir.
* Çok arıza çıkaran cihazlar otomatik yenileme aday listesine girmelidir.

---

## 10. Ana İş Akışları

| İş Akışı | Adımlar |
| :--- | :--- |
| **Yeni cihaz satınalma ve envantere alma** | Satınalma talebi -> sipariş/fatura -> cihaz teslim alma -> seri no ve demirbaş no -> varlık kartı -> QR etiket -> stokta durumu. |
| **Cihaz hazırlama** | Stokta cihaz -> BT hazırlık kontrol listesi -> kurulum/güvenlik ayarları -> hazırlanıyor -> zimmete hazır. |
| **Kullanıcıya zimmet** | Kullanıcı seçimi -> cihaz/aksesuar/lisans seçimi -> zimmet formu -> kullanıcı onayı -> kullanımda durumu. |
| **İade alma** | Kullanıcıdan iade -> kondisyon kontrolü -> aksesuar kontrolü -> veri silme/format -> stokta, hazırlanıyor, arızalı veya hurda bekliyor. |
| **Servis süreci** | Arıza kaydı -> servis firması -> gönderim -> servis sonucu -> maliyet/garanti -> cihazın yeni durumu. |
| **Lisans atama** | Lisans havuzu -> kullanıcı/cihaz atama -> kullanılan adet artışı -> bitiş tarihi takibi -> kullanım raporu. |
| **Garanti/kontrat uyarısı** | Bitiş tarihi yaklaşan kayıt -> otomatik uyarı -> sorumlu kişiye görev -> yenileme veya aksiyon kaydı. |
| **Fiziksel sayım** | Sayım dönemi -> lokasyon seçimi -> QR okutma -> fark listesi -> onay -> fark aksiyonu. |
| **İşten çıkış** | Pasif kullanıcı tespiti -> cihaz ve lisans listesi -> iade/iptal checklist -> eksik madde raporu -> kapatma onayı. |

---

## 11. Ekran Listesi

| Ekran | Amaç | Öncelik |
| :--- | :--- | :--- |
| **Yönetici Dashboard** | BT varlık sağlığını ve riskleri özet gösterir. | Faz 1 |
| **Varlık Listesi** | Tüm varlıkları filtreleme, arama, dışa aktarma. | Faz 1 |
| **Varlık Kartı** | Cihazın tüm kimlik, teknik, mali ve geçmiş bilgileri. | Faz 1 |
| **Zimmet Verme** | Cihazı kullanıcıya/departmana/lokasyona atama. | Faz 1 |
| **İade Alma** | Cihazı kullanıcıdan geri alma ve kondisyon kontrolü. | Faz 1 |
| **QR Etiket Basımı** | Tekil veya toplu etiket oluşturma. | Faz 1 |
| **Kullanıcı Kartı** | Kullanıcı üzerindeki cihaz, aksesuar ve lisanslar. | Faz 1 |
| **Lokasyon Envanteri** | Fabrika, bölüm ve oda/saha bazlı cihaz görünümü. | Faz 1 |
| **Lisans Yönetimi** | Lisans adedi, kullanım, boşta lisans, bitiş tarihi. | Faz 2 |
| **Garanti ve Kontrat Takibi** | Yaklaşan garanti/kontrat bitişleri. | Faz 2 |
| **Satınalma ve Fatura** | Tedarikçi, fatura, maliyet ve garanti başlangıcı. | Faz 2 |
| **Arıza/Servis Yönetimi** | Servis kayıtları, maliyet ve servis sonucu. | Faz 3 |
| **Fiziksel Sayım** | QR ile sayım ve fark analizi. | Faz 3 |
| **Ağ Keşif Onay Havuzu** | Ağda bulunan ama envantere alınmamış cihazlar. | Faz 4 |
| **İşe Giriş / Çıkış Checklist** | Cihaz, lisans ve erişim kontrolleri. | Faz 4 |
| **Helpdesk Talep Ekranı** | Kullanıcı destek talepleri ve cihaz ilişkisi. | Faz 5 |

---

## 12. Raporlar ve KPI'lar

* **Toplam varlık sayısı:** Kategori, fabrika, departman ve durum bazlı toplamlar.
* **Kullanıcı üzerindeki cihazlar:** Her kullanıcıya zimmetli cihaz, aksesuar ve lisans listesi.
* **Stoktaki cihazlar:** Kullanıma hazır veya hazırlık bekleyen cihazlar.
* **Arızalı ve servisteki cihazlar:** Operasyonel risk ve servis takip listesi.
* **Garanti bitiş raporu:** 90/60/30/15 gün içinde garantisi bitecek cihazlar.
* **Lisans bitiş raporu:** Yenileme gerektiren abonelik ve lisanslar.
* **Kullanılmayan lisanslar:** Atanmış ama kullanılmayan veya işten ayrılan kullanıcıda kalan lisanslar.
* **5 yaş üstü bilgisayarlar:** Yenileme bütçesi için yaşlı cihaz listesi.
* **Windows sürüm dağılımı:** Windows 10/11, destek dışı OS ve riskli cihaz görünümü.
* **BitLocker / antivirus durumu:** Güvenlik uyumluluk raporu.
* **Bilinmeyen ağ cihazları:** Envanterde olmayan ama ağda görülen cihazlar.
* **Model bazlı arıza oranı:** Problemli marka/model tespiti.
* **Tedarikçi servis performansı:** Servis süresi, servis maliyeti, tekrar arıza.
* **Sayım fark raporu:** Eksik, fazla, lokasyonu yanlış cihazlar.
* **Hurda adayları:** Eski, arızalı, ekonomik ömrünü dolduran cihazlar.

---

## 13. Bildirim ve Uyarı Kuralları

| Uyarı | Alıcı | Zamanlama |
| :--- | :--- | :--- |
| **Garanti bitişi** | BT yöneticisi, ilgili BT personeli | 90, 60, 30, 15 gün önce |
| **Lisans/abonelik bitişi** | BT yöneticisi, satınalma | 90, 60, 30, 15 gün önce |
| **Kullanıcıdan iade gecikmesi**| BT, departman yöneticisi | Planlanan iade tarihinden sonra günlük/haftalık |
| **Serviste bekleyen cihaz** | BT personeli, BT yöneticisi | Belirlenen servis SLA süresi aşılınca |
| **İşten ayrılan kullanıcıda açık varlık/lisans** | BT yöneticisi, IK/ilgili yönetici | Kullanıcı pasif olunca veya çıkış checklist açılınca |
| **Bilinmeyen ağ cihazı** | BT güvenlik sorumlusu | Keşif taramasında yeni cihaz bulununca |
| **Sayım farkı** | BT yöneticisi, lokasyon sorumlusu | Sayım tamamlandığında |

---

## 14. Güvenlik ve Yetkilendirme Gereksinimleri

* Tüm kullanıcı işlemleri **audit log** ile kaydedilmelidir.
* Silme işlemleri sınırlandırılmalı; mümkünse pasife alma veya iptal akışı kullanılmalıdır.
* Kullanıcılar yalnızca yetkili oldukları lokasyon/departman kayıtlarını görebilmelidir.
* Zimmet formları ve fatura belgeleri yetkisiz kullanıcılar tarafından görüntülenmemelidir.
* Kişisel veri içeren ekranlarda minimum veri prensibi uygulanmalıdır.
* Sistem girişinde **SSO / Entra ID** entegrasyonu hedeflenmelidir.
* Dosya yüklemelerinde dosya türü ve boyut kontrolü yapılmalıdır.
* API erişimleri token bazlı ve loglanabilir olmalıdır.
* Kritik işlemler için onay mekanizması desteklenmelidir: *hurda, kayıp, toplu silme/iptal, maliyet düzeltme* gibi.

---

## 15. Entegrasyon Gereksinimleri

| Entegrasyon | Amaç | Faz |
| :--- | :--- | :--- |
| **Entra ID / Microsoft 365** | Kullanıcı, departman, yönetici ve lisans bilgilerinin alınması. | Faz 4 |
| **Microsoft Intune** | Yönetilen cihazlardan donanım, uygulama ve güvenlik bilgilerinin alınması. | Faz 4 |
| **E-posta sistemi** | Zimmet, iade, garanti, lisans ve kontrat uyarıları. | Faz 1-2 |
| **SAP S/4HANA** | Satınalma, fatura, maliyet merkezi ve duran varlık bağlantısı. | İleri faz |
| **Firewall / VPN** | VPN kullanıcılarının işten çıkış ve erişim kontrolüyle ilişkilendirilmesi. | İleri faz |
| **Helpdesk sistemi** | Talep ve varlık kartı ilişkisinin kurulması. | Faz 5 |
| **Barkod / QR okuyucu** | Sayım, zimmet, iade ve servis işlemlerinde hızlı okutma. | Faz 1 |
| **Network discovery / SNMP** | Ağ cihazlarının ve bilinmeyen cihazların keşfi. | Faz 4 |

---

## 16. Fazlandırılmış Geliştirme Planı

| Faz | Kapsam | Teslim Çıktısı |
| :--- | :--- | :--- |
| **Faz 1 - Temel Envanter ve Zimmet** | Varlık kartı, kategori/model, lokasyon, kullanıcı, zimmet, iade, QR etiket, dosya ekleri, temel dashboard, Excel import/export, rol/yetki. | Kurumun Excel yerine kullanabileceği temel envanter sistemi. |
| **Faz 2 - Lisans, Garanti, Satınalma** | Lisans havuzu, abonelik takibi, garanti/kontrat uyarıları, tedarikçi, fatura ve maliyet bilgileri. | Maliyet ve yenileme risklerini yöneten sistem. |
| **Faz 3 - Servis, Arıza, Sayım** | Arıza kayıtları, servis süreci, yedek cihaz, servis maliyeti, QR ile fiziksel sayım, fark raporu. | Operasyonel takip ve denetim sistemi. |
| **Faz 4 - Entegrasyon ve Otomatik Keşif** | IP tarama, bilinmeyen cihaz, Entra ID, Microsoft 365, Intune, işten çıkış checklist. | Otomatik veri beslenen ve güvenlik kontrolü yapan sistem. |
| **Faz 5 - Helpdesk ve Yaşam Döngüsü** | Talep yönetimi, SLA, cihaz bazlı destek geçmişi, yenileme önerileri, hurda onay akışı. | BT operasyon yönetimi platformu. |

---

## 17. Önceliklendirme - MoSCoW Listesi

| Öncelik | Fonksiyonlar |
| :--- | :--- |
| **Must Have** *(Olmazsa Olmaz)* | Varlık kartı, kullanıcı/lokasyon/departman, zimmet/iade, QR etiket, durum yönetimi, geçmiş kayıtları, rol/yetki, Excel import/export, temel raporlar. |
| **Should Have** *(Olmalı)* | Garanti uyarısı, lisans yönetimi, satınalma/fatura, tedarikçi, servis kayıtları, dosya ekleri, kullanıcı onaylı dijital zimmet. |
| **Could Have** *(Olsa İyi Olur)* | Ağ keşfi, Intune entegrasyonu, Microsoft 365 lisans senkronizasyonu, fiziksel sayım, dashboard KPI'ları. |
| **Later** *(Sonra)* | Helpdesk, SLA, otomatik ajan, SAP entegrasyonu, CMDB, gelişmiş güvenlik uyumluluk raporları. |

---

## 18. Kabul Kriterleri

1. Bir cihaz sisteme tekil demirbaş numarasıyla kaydedilebilmelidir.
2. Aynı seri numarasıyla ikinci aktif cihaz kaydı açılması engellenmelidir.
3. Bir cihaz kullanıcıya zimmetlenebilmeli ve PDF zimmet formu üretilebilmelidir.
4. Zimmetli cihaz iade alınabilmeli ve geçmiş kaydı bozulmadan saklanmalıdır.
5. QR kod okutulduğunda ilgili varlık kartı açılmalıdır.
6. Garanti bitiş tarihi yaklaşan cihazlar raporlanabilmelidir.
7. Lisans adedi, kullanılan adet ve boş adet doğru hesaplanmalıdır.
8. Kullanıcı kartında kişiye atanmış cihaz, aksesuar ve lisanslar görülebilmelidir.
9. Lokasyon bazlı cihaz listesi alınabilmelidir.
10. Sistem her kritik işlem için audit log üretmelidir.
11. Excel import ile toplu cihaz yüklenebilmeli; hatalı satırlar kullanıcıya açıklanmalıdır.
12. Yetkisiz kullanıcılar maliyet, fatura ve tüm lokasyon bilgilerine erişememelidir.

---

## 19. Test Senaryoları

| Senaryo | Beklenen Sonuç |
| :--- | :--- |
| **Yeni laptop kaydı oluşturma** | Demirbaş no atanır, seri no benzersiz kontrol edilir, cihaz stokta görünür. |
| **Laptopu kullanıcıya zimmetleme** | Cihaz kullanımda olur, kullanıcı kartında görünür, zimmet PDF oluşur. |
| **Kullanıcıdan iade alma** | Cihaz kullanıcıdan düşer, kondisyon kontrolü kaydedilir, cihaz stokta/arızalı durumuna geçer. |
| **QR okutma** | Doğru varlık kartı açılır. |
| **Garanti tarihi yaklaşan cihaz** | Dashboard ve garanti raporunda görünür. |
| **Lisans atama** | Kullanılan lisans adedi artar, boş lisans adedi azalır. |
| **İşten çıkan kullanıcı** | Üzerindeki cihaz ve lisanslar checklist olarak listelenir. |
| **Sayımda bulunamayan cihaz** | Sayım fark raporuna eksik olarak düşer. |
| **Servise gönderilen cihaz** | Durumu serviste olur, servis kaydı cihaz kartında görünür. |
| **Yetkisiz kullanıcı erişimi** | Kullanıcı yalnızca yetkili olduğu lokasyon veya kendi zimmet bilgilerini görebilir. |

---

## 20. Teknik ve Mimari Notlar

* Uygulama **web tabanlı** olmalıdır; mobil tarayıcıdan QR okutma ve temel işlemler yapılabilmelidir.
* Veritabanı yapısı audit log, **soft delete** ve değişiklik tarihçesini desteklemelidir.
* **API-first** yaklaşım tercih edilmelidir; ileride mobil uygulama, Intune, SAP ve network keşif entegrasyonları kolay eklenebilmelidir.
* Dosya ekleri merkezi ve yedeklenebilir bir depoda saklanmalıdır.
* Performans açısından varlık listesi filtreleme ve arama fonksiyonları hızlı çalışmalıdır.
* Yetki modeli lokasyon ve rol bazlı olmalıdır.
* Tüm tarih alanları üzerinde uyarı motoru çalışabilmelidir.
* Ön yüzde tablo kolonları kullanıcı bazlı özelleştirilebilir olmalıdır.
* Excel import/export standart şablonlarla yapılmalıdır.
* Uygulama çok dilli olmak zorunda değildir; ilk faz **Türkçe** olabilir. Ancak teknik alan adları ileride İngilizce karşılıklarıyla eşleştirilebilir.

---

## 21. Önerilen Veri Tabloları - Kavramsal Liste

* `Assets`: Tüm varlıkların ana kartı.
* `AssetCategories`: Kategori tanımları.
* `AssetModels`: Marka/model bilgileri.
* `Users`: Kullanıcı ana verisi.
* `Departments`: Departman tanımları.
* `Locations`: Şirket/fabrika/depo/oda/saha hiyerarşisi.
* `Assignments`: Zimmet ve atama kayıtları.
* `AssignmentItems`: Zimmete bağlı cihaz/aksesuar/lisans detayları.
* `Licenses`: Lisans ana kartları.
* `LicenseAssignments`: Lisans kullanıcı/cihaz atamaları.
* `Vendors`: Tedarikçi ve servis firmaları.
* `Purchases`: Satınalma/fatura bilgileri.
* `Contracts`: Kontrat ve abonelik bilgileri.
* `ServiceTickets`: Arıza ve servis kayıtları.
* `InventoryCounts`: Fiziksel sayım başlıkları.
* `InventoryCountLines`: Sayım satırları ve farklar.
* `Notifications`: Uyarı ve bildirim kayıtları.
* `AuditLogs`: Tüm kritik işlem kayıtları.
* `Files`: Varlık, servis, zimmet ve satınalma dosyaları.
* `DiscoveryDevices`: Ağ keşfinden gelen onay bekleyen cihazlar.

---

## 22. Yazılımcılara Verilecek Kısa Talimat

> Excel benzeri bir cihaz listesi istemiyoruz. Çok lokasyonlu fabrikalarımız için cihazın satın alınmasından kullanıcıya zimmetlenmesine, servis görmesine, garanti ve lisans takibine, fiziksel sayımına ve hurdaya ayrılmasına kadar tüm yaşam döngüsünü yöneten; QR/barkod destekli, rol bazlı yetkilendirmeye sahip, ileride Microsoft 365/Intune/SAP entegrasyonuna hazır bir BT Varlık Yönetimi sistemi istiyoruz.

---

## 23. Kaynakça ve İncelenecek Referanslar

Aşağıdaki kaynaklar ürünlerin resmi sayfaları veya resmi dokümantasyonlarıdır. Yazılım ekibi tasarım aşamasında bu ürünlerin ekran akışlarını ve fonksiyon kapsamlarını inceleyebilir.

* [ServiceNow IT Asset Management](https://www.servicenow.com/products/it-asset-management.html)
* [ServiceNow Hardware Asset Management](https://www.servicenow.com/products/hardware-asset-management.html)
* [ManageEngine AssetExplorer Features](https://www.manageengine.com/products/asset-explorer/features.html)
* [ManageEngine AssetExplorer PO and Contracts](https://www.manageengine.com/products/asset-explorer/po-and-contracts.html)
* [Snipe-IT Product Features](https://snipeitapp.com/product)
* [Lansweeper Hardware Inventory](https://www.lansweeper.com/product/asset-inventory/hardware-inventory/)
* [Lansweeper Asset Discovery](https://www.lansweeper.com/product/asset-discovery/)
* [GLPI ITSM and Asset Tracking](https://www.glpi-project.org/en/)
* [Microsoft Intune Device Properties](https://learn.microsoft.com/en-us/intune/device-configuration/collect-device-properties)
* [Microsoft Intune Device Details](https://learn.microsoft.com/en-us/intune/device-management/inventory-and-status/device-details)

---

## 24. Sonuç

Bu dokümanda tanımlanan sistem, Bilgi İşlem envanterinin pasif bir liste olmaktan çıkarılıp yönetilebilir, denetlenebilir, maliyet odaklı ve güvenlik destekli bir BT varlık yönetimi platformuna dönüştürülmesini hedefler. 

İlk fazda temel envanter ve zimmet yapısı sağlam kurulmalı; sonraki fazlarda lisans, garanti, servis, sayım, entegrasyon ve helpdesk fonksiyonları eklenmelidir.