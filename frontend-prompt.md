# Randevu Modülü — Frontend Geliştirme Promptu

> Aşağıdaki bloğu (`PROMPT BAŞLANGIÇ` ile `PROMPT BİTİŞ` arasını) frontend AI aracınıza
> (Cursor, Copilot, Claude Code vb.) olduğu gibi yapıştırın.
> API referansının tam hali için `docs/appointments-api.md` dosyasına bakılabilir.

---

## PROMPT BAŞLANGIÇ

Sen kıdemli bir Next.js frontend geliştiricisisin. Laravel tabanlı bir danışmanlık platformunun **Randevular modülünü** geliştireceksin. Backend API tamamen hazırdır — **hiçbir API değişikliği yapma, sadece tüket.**

### 1. Teknoloji ve proje kuralları

- Next.js (App Router), TypeScript, Tailwind CSS.
- API base URL: `process.env.NEXT_PUBLIC_API_BASE_URL` (örn. `http://danismanlik.test`).
- Tüm isteklerde header: `Accept: application/json` ve (giriş yapılmışsa) `Authorization: Bearer {token}`.
- Tip güvenli bir API client katmanı yaz (`src/lib/api.ts`); endpoint'leri typed fonksiyonlar olarak sarmala.

### 2. Kimlik doğrulama

- **Giriş:** `POST /api/login` body `{ "phone": "...", "password": "..." }`
  → `200 { "token": "...", "user": { "id", "phone", "first_name", "last_name", "name", "email", "role", "consultant_id" } }`
  - `role`: `"ADMIN" | "CONSULTANT" | "CUSTOMER"`
  - `consultant_id`: CONSULTANT kullanıcılar için dolu (kendi danışman profil id'si), diğerlerinde `null`.
- Token'ı sakla (localStorage/cookie), çıkışta `POST /api/logout` çağır ve temizle.
- Mevcut kullanıcı: `GET /api/user` → `{ "data": { ...user } }`
- **401** → oturumu temizle ve `/login` sayfasına yönlendir.
- Giriş yaptıktan sonra role göre yönlendir: ADMIN/CONSULTANT → `/appointments`, CUSTOMER → `/appointments`.

### 3. Roller ve geliştirilecek sayfalar

| Sayfa | Yol | ADMIN | CONSULTANT | CUSTOMER |
|---|---|---|---|---|
| Giriş | `/login` | ✅ | ✅ | ✅ |
| Randevularım | `/appointments` | tüm randevular | sadece kendi randevuları | sadece kendi randevuları |
| Randevu Al / Ekle | `/appointments/new` | herkes için | kendi takvimine | kendisi için |
| Randevu düzenle | `/appointments/{id}/edit` | tümü | sadece kendine ait | ❌ (erişemez) |

- `/appointments` sayfasında: rol bazlı kolonlar (CUSTOMER için danışman + hizmet, CONSULTANT için müşteri + hizmet), durum rozetleri, iptal butonu (yalnız `PENDING`/`CONFIRMED` durumundakilerde), ADMIN/CONSULTANT için düzenle butonu.
- Liste `start_at` artan sıralıdır; frontend'de gün/geçmiş-gelecek gruplaması yapabilirsin (`start_at` alanına göre).

### 4. API referansı

**Public (token gerekmez)**

```http
GET /api/consultants
→ { "data": [ { "id", "user_id", "title", "slug", "is_active",
                "user": { "id", "first_name", "last_name", "name" } } ] }
```
Aktif danışmanlar.

```http
GET /api/v1/consultants/{consultant}/services
→ { "data": [ { "id", "consultant_id", "service_id", "price", "duration",
                "break_duration", "is_active", "service": { "id", "name", "slug" } } ] }
```
Danışmanın aktif hizmetleri. Buradaki `id` = randevu oluşturmadaki `consultant_service_id`.

```http
GET /api/v1/consultants/{consultant}/availability?service_id={id}&date={Y-m-d}
→ { "data": { "date": "YYYY-MM-DD", "consultant_id": 2, "service_id": 3,
              "slots": [ { "start": "09:00", "end": "09:50" } ] } }
```
Müsait slotlar. **Slot hesaplamasını frontend ASLA yapmaz.** Boş `slots` = o gün müsaitlik yok. Geçmiş tarih için boş döner.

**Randevular (token gerekli)**

```http
GET    /api/v1/appointments
POST   /api/v1/appointments
GET    /api/v1/appointments/{id}
PATCH  /api/v1/appointments/{id}
POST   /api/v1/appointments/{id}/cancel
```

`POST /appointments` payload:

| Alan | Tip | Zorunlu | Not |
|---|---|---|---|
| `customer_id` | int | ✅ | CUSTOMER kendi `user.id`'sini gönderir. |
| `consultant_id` | int | ✅ | CONSULTANT kendi `user.consultant_id`'sini gönderir; farklıysa 403. |
| `consultant_service_id` | int | ✅ | Seçilen hizmet bu danışmana ait olmalı. |
| `start_at` | string | ✅ | `"YYYY-MM-DD HH:MM:00"` — seçilen slotun `start`'ı. |
| `end_at` | string | ✅ | `"YYYY-MM-DD HH:MM:00"` — seçilen slotun `end`'i (= start + duration). |
| `notes` | string | – | Opsiyonel. |

`PATCH /appointments/{id}` payload (yalnız ADMIN/CONSULTANT; CUSTOMER 403 alır):

```json
{ "notes": "...", "status": "CONFIRMED" }
```
`status`: `PENDING | CONFIRMED | COMPLETED | CANCELLED`.

`POST /appointments/{id}/cancel` → randevuyu `CANCELLED` yapar (200). Yalnız `PENDING`/`CONFIRMED` iptal edilebilir; `422` dönerse kullanıcıya "bu randevu iptal edilemez" göster.

**ADMIN'e özel (form veri kaynakları)**

```http
GET /api/v1/customers
→ { "data": [ { "id", "first_name", "last_name", "name", "phone", "email", "addresses": [ ... ] } ] }
```
Müşteri seçimi için (ADMIN randevu ekleme formunda `customer_id` kaynağı).

```http
GET /api/v1/consultant-services
→ { "data": [ { "id", "consultant_id", "service_id", "price", "duration", "break_duration",
                "service": { "id", "name", "slug" }, "consultant": { "id", "slug", "name" } } ] }
```
Danışman-hizmet eşleştirmeleri (ADMIN randevu ekleme formunda `consultant_service_id` kaynağı; `consultant_id`'ye göre filtreleyin). **Bu uç ADMIN token ister — CUSTOMER/CONSULTANT için 403 döner.**

### 5. Form davranışları (rol bazlı)

**CUSTOMER — "Randevu Al" (`/appointments/new`)**
1. Danışman seç: `GET /api/consultants` (isim + title göster).
2. Hizmet seç: `GET /api/v1/consultants/{consultant}/services` (ad, süre, fiyat göster).
3. Tarih seç: tarih girişinin `min` değeri bugün.
4. Slot seç: `GET /api/v1/consultants/{consultant}/availability?service_id=&date=` → slot butonları; boşsa "Bu tarihte müsait saat yok".
5. `customer_id` = giriş yapan kullanıcının `id`'si (gizli alan).
6. Kaydet: `start_at = `${date} ${slot.start}:00``, `end_at = `${date} ${slot.end}:00``.

**CONSULTANT — "Randevu Ekle" (`/appointments/new`)**
1. Müşteri seç: `customer_id` kaynağı **kendi randevu listendeki** `customer.id` / `customer.name` değerleridir (`GET /api/v1/appointments` yanıtı); yeni müşteri için müşteri kendisi randevu almalıdır.
2. Hizmet seç: `GET /api/v1/consultants/{user.consultant_id}/services`.
3. Tarih + slot: yukarıdaki gibi (`consultant_id = user.consultant_id`).
4. `consultant_id` = `user.consultant_id` (başka değer gönderilirse 403).

**ADMIN — "Randevu Ekle"**
1. Müşteri seç: `GET /api/v1/customers`.
2. Danışman seç: `GET /api/consultants`.
3. Hizmet seç: `GET /api/v1/consultant-services` (seçilen danışmana göre filtrele).
4. Tarih + slot: availability.
5. Üç rolün ortak kuralı: `end_at` her zaman seçilen slotun `end` değeridir; frontend süre hesaplaması yapmaz.

### 6. Hata yönetimi

- `422` → gövdedeki `errors` nesnesini alan bazlı göster (`errors.start_at[0]` vb.). Sık hatalar:
  - `start_at`: "geçmiş zamana randevu oluşturulamaz", "müsait slot değil", "slot zaten alınmış".
  - `end_at`: "randevu süresi hizmet süresiyle uyuşmuyor".
  - `consultant_service_id`: "hizmet bu danışmana ait değil".
- `401` → logout + login yönlendirme.
- `403` → "Bu işlem için yetkiniz yok." (ADMIN-only yönetim uçlarına non-admin token ile girilirse de döner; frontend bu uçları yalnız ADMIN menüsünde göstermeli.)
- `404` → kayıt bulunamadı; liste sayfasına dön.
- Çift kayıt/çakışma backend'de engellenir; frontend slotları availability'den alıp olduğu gibi gönderdiği sürece bu hata yalnızca yarış durumunda çıkar → kullanıcıya "slot artık müsait değil, lütfen yenileyin" göster ve slotları yeniden çek.

### 7. UX kuralları

- Durum rozetleri: `PENDING` sarı, `CONFIRMED` yeşil, `COMPLETED` gri, `CANCELLED` kırmızı.
- İptal butonu `PENDING`/`CONFIRMED` dışında render edilmez; tıklanınca onay dialogu göster.
- İptal başarılı olursa listeyi yenile (iptal edilen randevu listede `CANCELLED` rozetiyle kalır).
- Tarih seçici geleceğe kısıtlı; geçmiş tarih seçilirse availability zaten boş döner.
- Yükleme/boş durumları: "Randevunuz bulunmuyor", "Bu tarihte müsait saat yok".
- Her mutation sonrası ilgili listeyi yeniden çek (veya optimistic update + refetch).

### 8. Teslim edilecekler

1. `src/lib/api.ts` — typed API client (auth, appointments, consultants, services, availability).
2. `/login`, `/appointments`, `/appointments/new`, `/appointments/{id}/edit` sayfaları.
3. Rol bazlı yönlendirme ve menü (ADMIN/CONSULTANT/CUSTOMER).
4. Hata/boş/yükleme durumlarıyla çalışan, yukarıdaki kabul kriterlerini karşılayan uygulama.

## PROMPT BİTİŞ
