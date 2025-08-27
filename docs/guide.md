# Image Processing Guide

Bu rehber, gorsel dosyalarinizi otomatik olarak islemek icin olusturulmus scriptlerin kullanimini aciklar.

## Klasor Yapisi

```
file-edit/
├── raw/              # Ham gorselleri buraya koyun
├── processed/        # Islenmis gorseller buraya gelir
├── process-images.js # Ana islem scripti
├── remove-text.js    # Sadece text kaldirma
├── rename-to-kebab.js # Sadece kebab-case donusumu
└── guide.md          # Bu rehber
```

## Hizli Kullanim (Onerilen)

### Adim 1: Ham gorselleri yerlestir
- Tum ham gorsellerinizi `raw/` klasorune kopyalayin

### Adim 2: Tek komutla isle
```bash
node process-images.js ./raw ./processed "-Photoroom" "-edited" "unwanted_text"
```

Bu komut:
- Raw klasorden gorselleri alir
- Istenmeyen metinleri kaldirir
- Kebab-case formatina cevirir
- Processed klasore kaydeder

### Ornek Donusum:
```
Giris:  "My Photo-Photoroom-edited.png"
Cikis:  "my-photo.png"
```

## Ayri Scriptler (Istege Bagli)

### Sadece Text Kaldirma:
```bash
node remove-text.js . "-Photoroom" "-edited"
```

### Sadece Kebab-case Donusumu:
```bash
node rename-to-kebab.js .
```

## Notlar

- **Desteklenen formatlar:** PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP
- **Guvenli:** Orijinal dosyalar korunur (kopyalama yapilir)
- **Toplu islem:** Klasordeki tum gorseller ayni anda islenir
- **Temizlik:** Turkce karakter, ozel karakter ve bosluk sorunlari cozulur

## Hizli Test

1. `about the cry.png` dosyasini `raw/` klasore tasi
2. Komutu calistir: `node process-images.js ./raw ./processed "-Photoroom"`
3. `processed/` klasorunde `about-the-cry.png` dosyasini gor