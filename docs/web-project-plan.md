# Modern Web Projesi Dönüşüm Planı

## Proje Özeti
Mevcut Node.js CLI tabanlı görsel işleme araçlarını, modern tech stack kullanarak kişisel kullanım için web uygulamasına dönüştürme planı.

## Mevcut Durum
- ✅ `remove-text.js` - Text kaldırma scripti
- ✅ `rename-to-kebab.js` - Kebab-case dönüşüm scripti  
- ✅ `process-images.js` - Tümleşik işlem scripti
- ✅ Klasör yapısı: raw/ → processed/

## Hedef Web Uygulaması

### Temel İhtiyaçlar
- Kişisel kullanım (tek kullanıcı)
- Modern, hızlı ve verimli
- Gelecekte genişletilebilir (farklı file/image işlemleri)
- Ücretsiz deployment
- Orta seviye tasarım

### Modern Tech Stack

#### Core Framework
- **Next.js 14** (App Router)
  - Static Export für ücretsiz hosting
  - TypeScript desteği
  - Built-in optimizasyonlar

#### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components
- **Lucide Icons** - Modern icon seti
- **Framer Motion** - Smooth animasyonlar (opsiyonel)

#### File Processing
- **Browser APIs:** File API, Drag & Drop API
- **JSZip** - Toplu dosya indirme
- **File-saver** - Dosya kaydetme utility

#### Development Tools
- **TypeScript** - Type safety
- **ESLint + Prettier** - Code quality
- **Husky** - Git hooks

### Proje Yapısı
```
image-processor-web/
├── app/
│   ├── page.tsx                    # Ana sayfa
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   └── ...
│   ├── file-upload.tsx             # Drag & drop component
│   ├── processing-panel.tsx        # İşlem ayarları
│   ├── preview-panel.tsx           # Dosya önizleme
│   └── download-manager.tsx        # İndirme yönetimi
├── lib/
│   ├── file-processor.ts           # Core processing logic
│   ├── utils.ts                    # Utility functions
│   └── types.ts                    # TypeScript types
├── hooks/
│   └── use-file-processing.ts      # Custom hook
├── public/
└── package.json
```

### Ana Özellikler

#### 1. Modern File Upload Interface
- shadcn/ui kullanarak elegant drag & drop
- Progress indicators (Tailwind animations)
- File type validation ve preview
- Batch file selection

#### 2. İşlem Yönetim Paneli
- Customizable text removal rules
- Processing type selection (radio buttons)
- Real-time filename preview
- Settings persistence (localStorage)

#### 3. Live Preview System
- Before/after comparison cards
- File count ve size indicators
- Processing status indicators
- Responsive grid layout

#### 4. Download Management
- ZIP file generation progress
- Individual file download option
- Success notifications (toast messages)
- Processing statistics

## Geliştirme Roadmap

### Sprint 1: Project Setup (1 gün)
- [ ] Next.js 14 projesini oluştur
- [ ] TypeScript konfigürasyonu
- [ ] Tailwind CSS + shadcn/ui setup
- [ ] Temel proje yapısını kur
- [ ] Git repository setup

### Sprint 2: Core Components (2-3 gün)
- [ ] FileUpload component (drag & drop)
- [ ] ProcessingPanel component (settings)
- [ ] PreviewPanel component (file list)
- [ ] DownloadManager component
- [ ] Responsive layout implementation

### Sprint 3: Business Logic (2-3 gün)
- [ ] file-processor.ts - Core logic adaptation
- [ ] useFileProcessing custom hook
- [ ] TypeScript type definitions
- [ ] Error handling & validation
- [ ] Progress tracking system

### Sprint 4: UI Polish & Features (2 gün)
- [ ] Loading states & animations
- [ ] Toast notifications
- [ ] Settings persistence
- [ ] Dark mode support (optional)
- [ ] Mobile responsiveness

### Sprint 5: Testing & Deployment (1-2 gün)
- [ ] Unit tests (Jest + Testing Library)
- [ ] E2E tests temel scenario
- [ ] Next.js static export konfigürasyonu
- [ ] Vercel deployment setup
- [ ] Performance optimization

## Deployment Strategy

### Vercel (Önerilen)
- **Framework:** Next.js native support
- **Maliyet:** Ücretsiz tier yeterli
- **Domain:** Custom domain desteği
- **CI/CD:** Git push ile otomatik deployment
- **Analytics:** Built-in web analytics

### Alternatif: Netlify
- Next.js static export ile uyumlu
- Form handling özellikleri
- Edge functions desteği

## Genişletilebilirlik Mimarisi

### Modüler Processor System
```typescript
interface FileProcessor {
  name: string;
  description: string;
  process(file: File, options: any): Promise<ProcessedFile>;
}

// Mevcut processors
- TextRemovalProcessor
- KebabCaseProcessor
- CombinedProcessor

// Gelecek processors
- ImageResizeProcessor
- FormatConverterProcessor
- WatermarkProcessor
```

### Plugin Architecture
- Easy processor ekleme
- UI component lazy loading
- Settings schema validation
- Process chaining support

## Örnek Kullanıcı Deneyimi

1. **Uygulama açılır**
   - Temiz, minimal arayüz
   - "Drop files here" alanı

2. **Dosyalar sürüklenir/seçilir**  
   - Anında dosya listesi gösterilir
   - Mevcut ve yeni isimler önizlenir

3. **İşlem ayarları**
   - Kaldırılacak text girişi
   - İşlem tipi seçimi (text remove / kebab-case / both)

4. **İşlem başlatılır**
   - Progress bar gösterilir
   - İşlem tamamlandığında ZIP indirme

5. **Sonuç**
   - Başarı mesajı
   - İşlenen dosya sayısı
   - Yeni işlem için reset

## Güvenlik Konuları
- Dosyalar sadece tarayıcıda işlenir
- Sunucuya hiçbir veri gönderilmez  
- LocalStorage kullanımı minimal
- XSS koruması için input sanitization

## Performans Hedefleri
- 100 dosyaya kadar batch işlem
- Dosya başına max 10MB
- İşlem süresi: < 1 saniye/dosya
- Mobile cihaz desteği

Bu plan kapsamlı mı? Eksik gördüğün bir nokta var mı?