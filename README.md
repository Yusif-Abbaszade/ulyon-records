# Records sayt

`./records` qovluğuna atdığın hər video (`.mp4`, `.webm`, `.mov`, `.mkv`, `.avi`, `.m4v`)
sayt build olunanda avtomatik `index.html`-də görünür. Heç bir kodu əl ilə dəyişmək lazım deyil —
sadəcə faylı əlavə et, GitHub-a push et.

## Necə işləyir

1. `build.js` — `./records` qovluğunu skan edir, tapdığı videoların siyahısını `records.json`
   faylına yazır (ad, ölçü, tarix, url).
2. `index.html` + `app.js` — brauzerdə `records.json`-u oxuyub kartlar şəklində göstərir,
   videonun müddətini (duration) və ilk kadrını (thumbnail) birbaşa brauzerdə hesablayır.
3. Cloudflare Pages hər `git push`-dan sonra `build.js`-i yenidən işə salır, `records.json`
   yenilənir, yeni videolar saytda görünür.

## GitHub

Bu qovluğun bütün fayllarını (`index.html`, `styles.css`, `app.js`, `build.js`, `package.json`,
`records/` daxil) reponun kök (root) qovluğuna at:

```bash
git init
git add .
git commit -m "records sayti"
git branch -M main
git remote add origin <REPO_URL>
git push -u origin main
```

`records/` qovluğuna video əlavə edəndə də eyni şəkildə commit + push et:

```bash
git add records/yeni-video.mp4
git commit -m "yeni record"
git push
```

## Cloudflare Pages ayarları

Cloudflare Pages-də layihəni GitHub reposuna qoşanda bu sahələri belə doldur:

| Sahə | Dəyər |
|---|---|
| **Framework preset** | None |
| **Build command** | `npm run build` (və ya birbaşa `node build.js`) |
| **Build output directory** | `/` (yəni reponun kökü) |
| **Root directory** | `/` (əgər `index.html` reponun kökündədirsə) |

Bundan sonra hər `git push` zamanı Cloudflare avtomatik olaraq bu addımları edir:

1. `npm run build` işə düşür → `build.js` `./records`-i skan edir → `records.json` yenilənir.
2. Bütün fayllar (yeni `records.json` daxil) deploy olunur.
3. Sayt açılanda `app.js` `records.json`-u oxuyur və yeni video avtomatik kartlar arasında görünür.

Node versiyası ilə bağlı problem çıxsa, Cloudflare Pages → Settings → Environment variables
bölməsində `NODE_VERSION` = `18` (və ya daha yeni) əlavə et.

## Yerli test

```bash
node build.js       # records.json-u yenidən yaradır
python3 -m http.server 8080   # və ya istənilən statik server
```

Sonra `http://localhost:8080` aç.

## Qeyd

- Video fayllar böyükdürsə, GitHub-un adi repo limitini (fayl başına ~100MB, tövsiyə olunan repo
  ölçüsü) nəzərə al. Çox böyük/uzun videolar üçün Git LFS və ya ayrıca video hosting (məs.
  Cloudflare Stream, R2) daha uyğun ola bilər — istəsən bunu da qura bilərəm.
- `records/.gitkeep` faylı qovluğun boş olanda belə Git-ə düşməsi üçündür, video əlavə etdikcə
  saxlamağa ehtiyac yoxdur, amma saxlasan da problem yaratmır.
