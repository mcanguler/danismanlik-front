Danışmanlık Dev Sitesi – QA Hata Raporu
Tarih: 15 Ekim 2026 · Ortam: dev.danismanlik.mtdijital.com · Not: PayTR dev ortamında kurulu değil, ödeme ekranı hatası beklenen davranıştır.
1. Ürün modülü
   • Aynı varyasyon kombinasyonu iki kez eklenebiliyor.
   • Galeri resimlerinin etiketi hepsi "#1" görünüyor.
   • Galeri yüklemesinde spinner takılı kalıyor.
   • Küçük resim / kategori görseli 2 MB üzeri veya .txt ise sessizce yok sayılıyor, yine de başarı mesajı çıkıyor.
   • Galeri ve dijital dosya sıralama okları hiçbir şey yapmıyor (tüm kayıtlar sıra 1, istek gitmiyor).
   • Ürün kaydedilince "Aktif" anahtarı kısa süre kapalı görünüp titriyor.
   • Boş fiyat kabul ediliyor.
   • Varyasyonda negatif stok hatası toast'ı okunamıyor.
   • Dijital dosya alanı her dosya türünü kabul ediyor.
   • SKU, seçenek adlarından otomatik üretiliyor.
   • Dijital üründe Varyasyonlar bölümü gizleniyor.
2. Ürün kategorileri
   • Aynı isimli kategori eklenebiliyor.
   • Hata mesajları tutarsız ve bazen tekrarlı.
   • Pasif kategoriler ürün formunda seçilebiliyor.
   • Silme onayı, kategorinin kullanımda olduğunu uyarmıyor.
3. Satın alma akışı
   • Kupon hata mesajı İngilizce.
   • Müşteri için sipariş geçmişi sayfası yok.
   • Sipariş oluşturulunca sepet boşalıyor; ödeme başarısız olursa kullanıcı yeniden sepet kurmak zorunda.
   • "Eğitime Hemen Kaydol" sözleşme onay kutusunu atlıyor.
   • Randevu slotları 10 dakika aralıkla örtüşüyor (30/45 dk hizmet için 09:00, 09:10, 09:20…).
   • Menüde "Görüntülü Görüşme Seansı" var, hizmet sayfasında yalnızca Online Sesli Danışmanlık listeleniyor.
   • E-kitap metni e-posta ile gönderileceğini söylüyor ama e-posta istenmiyor.
   • Pasif ödeme butonu neden pasif olduğunu söylemiyor.
   • Sayfa başlıklarında "seo title" gibi yer tutucu metin var.
   • Fiziksel ürün için adres/kargo adımı gözlemlenemedi.
   • Misafir sepetinin girişten sonra birleşmesi doğrulanamadı.
4. Hizmet ve danışman modülleri
   • Hizmet formunda fiyat/süre yok, bunlar ayrı "Danışman Hizmetleri" ekranında girilir; kafa karıştırıcı.
   • Hizmet liste ve formunda İngilizce "Name" etiketi var.
   • Danışman panosunda "CONSULTANT rolündeki kullanıcılar" şeklinde İngilizce rol adı içeren ve boş bir dashboard var.
   • Çalışma saati çakışma hatası iki kez gösteriliyor (alan altı ve form altı).
   • Danışman adı bazı yerlerde "Güpray", bazı yerlerde "Gürpay".
5. Randevu akışı
   • Pazar gibi uygun olmayan günler takvimde tıklanabiliyor, sonra "müsait saat yok" diyor.
   • İptal penceresi "geri alınamaz" diyor, ama kayıt "İptal Edildi" olarak duruyor; pencerede hizmet adı da yok.
   • Beklemedeki randevu için ödemeyi tamamla/yeniden dene bağlantısı yok.
   • İptal edilen randevunun siparişi "Ödeme Bekleniyor" kalıyor.
   • Randevu listelerinin sıralaması rollere göre farklı (admin yeniden eskiye, diğerleri eskiden yeniye).
   • Çalışma saati dışında (22:40, 23:10) randevular var.
6. Çalışan doğrulamalar
   • Boş form, bitiş < başlangıç ve çakışan çalışma saati engelleniyor.
   • Çalışma saati dışı mola engelleniyor.
   • Kapalı zaman, mola ve mevcut randevu payı slotlardan doğru düşülüyor.
   • Randevu alma, iptal ve admin tarafında görünürlük çalışıyor.
7. Temizlenecek test verileri
   • Ürün "TEST Senaryo Dijital Urun" ve dijital dosyası
   • Hizmet kategorisi "TEST Senaryo Kategori", hizmet "TEST Senaryo Hizmet", danışman ataması
   • Danışman kapalı zamanı 20.10.2026 12:00–15:00
   • Siparişler ORD-20261015110413-MR7DVY ve ORD-20261015111123-UN6L0J
