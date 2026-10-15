# Ödeme / Sipariş — Frontend Prompt (PayTR + Siparişlerim)

> Aşağıdaki bloğu frontend ajanına olduğu gibi ver. Backend sözleşmesi bu repodaki
> Laravel API'sidir; alan adları gerçek resource çıktılarından alınmıştır.

---

## PROMPT

Sen kıdemli bir Next.js (App Router) geliştiricisisin. Aşağıdaki backend
sözleşmesine göre ödeme ve sipariş ekranlarını uygula. Yeni bir UI kütüphanesi
ekleme; mevcut tasarım, tablo, form, toast ve hata gösterme desenlerini kullan.
Tüm metinler Türkçe olacak.

### Ortam
- API base: `NEXT_PUBLIC_API_BASE_URL` (ör. `http://danismanlik.test`) + `/api/v1`.
- Frontend base: `FRONTEND_URL` (ör. `http://localhost:3000`). Backend, e-posta ve
  PayTR dönüş linklerini bu adres üzerinden üretir.

### Uygulanacak rotalar
1. `GET /api/v1/orders` — giriş yapan müşterinin siparişleri. Sayfa: `/dashboard/customer/siparislerim`.
2. `GET /api/v1/orders/{orderId}` — tek sipariş detayı (admin veya sahibi erişebilir).
3. `POST /api/v1/orders/{orderId}/payments` — ödeme başlatır, PayTR token'ı döner.
4. `POST /api/v1/cart/checkout` — sepeti siparişe çevirir.
5. `GET /api/v1/appointments` — randevular; artık `order_id` ve `payment_url` alanlarını içerir.

### Siparişlerim (`/dashboard/customer/siparislerim`)
- `data`: sipariş dizisi. Her sipariş: `id`, `order_no`, `subtotal_amount`,
  `discount_amount`, `total_amount`, `currency`, `status`, `created_at`, `items[]`,
  `payments[]`.
- `items[]`: `item_type`, `item_id`, `name`, `quantity`, `unit_price`, `total_price`, `metadata`.
- `status` değerleri: `PENDING`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`
  (Türkçe etiketle: "Ödeme Bekleniyor", "Ödendi", "Başarısız", "İptal", "İade").
- `status === "PENDING"` olan siparişlerde **"Ödemeyi Tamamla"** butonu → `/odeme/{orderId}`.
- Bildirim e-postalarındaki ödeme ve indirme linkleri `/odeme/{orderId}` adresine düşer.

### Ödeme sayfası (`/odeme/{orderId}`)
- `POST /api/v1/orders/{orderId}/payments` çağır. Başarılı yanıt:
  ```json
  {
    "data": { "id": 12, "merchant_oid": "PAYORD...", "amount": "2500.00", "status": "PENDING", "provider": "PAYTR", "test_mode": true },
    "paytr": { "token": "...", "iframe_url": "https://www.paytr.com/odeme/iframe/..." }
  }
  ```
- `paytr.iframe_url` değerini PayTR iframe'ine göm. Ödeme akışı iframe içinde tamamlanır.
- `data.status` `PENDING` değilse (ör. zaten `PAID`) tekrar ödeme başlatma; sipariş detayını göster.
- Hata: 422 → alan/mesaj göster (Türkçe), ağ hatası → "Tekrar dene" butonu.

### PayTR dönüş sayfaları (ZORUNLU)
PayTR, kullanıcıyı ödeme sonrası backend'in ürettiği şu adreslere döndürür;
bu iki sayfayı oluştur:
- **Başarılı:** `/odeme/{orderId}/basarili` → teşekkür + sipariş özeti + (varsa) indirme/yönlendirme.
- **Başarısız:** `/odeme/{orderId}/basarisiz` → "Ödeme tamamlanamadı" + "Tekrar Dene" → `/odeme/{orderId}`.
- İki sayfa da `GET /api/v1/orders/{orderId}` ile güncel durumu çekip göstermeli
  (PayTR dönüşü tek başına ödeme onayı değildir; asıl onay sunucu-sunucu callback ile gelir).
- Sorgu parametreleri güvenilir değildir; durumu daima API'den oku.

> Not: Sunucu-sunucu bildirim adresi (`/api/paytr/callback`) PayTR mağaza panelindeki
> "Bildirim URL" ayarına girilir; frontend'de bu adrese ihtiyaç yoktur.

### Checkout'ta e-posta (`POST /api/v1/cart/checkout`)
- Gövde: `{ "contract_accepted": true, "email": "musteri@example.com" }`.
- `email`, kullanıcının kayıtlı e-postası yoksa **zorunludur**; dijital ürün/indirme
  bildirimleri bu adrese gider. Kayıtlı e-postası olan kullanıcıda gönderilmese de olur.
- 422 yanıtındaki `errors.email` mesajını alan altında göster.

### Randevular (`/appointments`)
- `AppointmentResource` artık şunları döner: `order_id`, `payment_url` (yalnızca
  ödenmemiş, `PENDING` siparişe bağlı randevularda dolu; aksi halde `null`).
- `status === "PENDING"` ve `payment_url` dolu olan randevularda **"Ödemeyi Tamamla"**
  bağlantısını `payment_url`'e bağla (önceden frontend `item_type=APPOINTMENT`
  eşleşmesini kendi kuruyordu; artık gerek yok).
- İptal onay penceresinde **hizmet adını** göster ve metni gerçek davranışla uyumlu yaz:
  kayıt "İptal Edildi" olarak kalır (geri alınamaz).

### Çalışma saati / mola / kapalı zaman formları
- `POST|PUT /api/v1/working-hours`, `/breaks`, `/blocked-times` başarılı yanıtları artık
  üst seviyede `conflicts` dizisi döner:
  ```json
  { "data": { ... }, "conflicts": [ { "appointment_id": 5, "start_at": "2026-10-20T10:00:00+03:00", "customer_name": "Ayşe Yılmaz" } ] }
  ```
- `conflicts` boş değilse **tek yerde** uyarı göster (form altı VEYA toast — ikisini birden
  kullanıp tekrarlama): "Bu değişiklik şu randevularla çakışıyor: ...".
- 422 doğrulama hataları (ör. mola çalışma saatleri dışında) ayrıca gösterilir; mesajlar Türkçedir.

### Bildirim şablonları (admin)
- `/dashboard/admin/bildirim-sablonlari` → `GET /api/v1/admin/notification-templates`
  (filtreler: `audience`, `channel`, `search`; değerler `CUSTOMER|CONSULTANT|ADMIN`,
  `sms|mail`).
- Detay/düzenleme: `GET /api/v1/admin/notification-templates/{type}`,
  `PUT|PATCH /api/v1/admin/notification-templates/{type}/{channel}` (channel: `sms|mail`,
  büyük/küçük harf duyarsız), `POST .../{type}/{channel}/reset`,
  `POST .../{type}/preview` (opsiyonel `?channel=sms|mail`).
- `templates` anahtarları küçük harftir (`sms`, `mail`); `is_default: true` → özelleştirilmemiş.

### Kabul kriterleri
- Ödeme bekleyen siparişten `/odeme/{orderId}`'ye gidilebiliyor; PayTR iframe gömülü.
- `/odeme/{orderId}/basarili` ve `/odeme/{orderId}/basarisiz` sayfaları çalışıyor.
- E-posta yoksa checkout e-posta ister; girilince kaydedilir.
- Randevu listesinde ödenmemiş randevuda "Ödemeyi Tamamla" görünür.
- Çakışma uyarısı tek yerde gösterilir.
- Mobil (≤ 390 px) yatay kaydırma yok; lint/tip temiz.
