# Photobooth Studio — Prototype Web App

Prototipe interaktif untuk alur **Photobooth Studio** — mulai dari konfigurasi admin, pemilihan frame & foto oleh customer, editing, hingga export. Dibangun di atas **TanStack Start (React 19 + Vite 7)** dengan **Tailwind v4**, **Zustand** (persisted store), dan **shadcn/ui**.

---

## 1. Ringkasan Fitur

### Admin Studio (`/admin`)
- **General** — pengaturan umum studio (timer, kuota foto, dsb).
- **Brand** — nama studio, warna primer, font heading, copy welcome.
- **Frames** — kelola katalog frame:
  - Import gambar frame (PNG/JPG) langsung dari komputer (bukan dummy lagi).
  - **Auto-detect slot**: analisis pixel pada gambar frame untuk menemukan area kosong (slot foto) yang dipisahkan garis/objek. Mendukung deteksi multi-slot (mis. 6 slot pada grid 2×3).
  - **Slot Editor Canvas**: tiap slot bisa di-**drag** untuk dipindah, **resize** dari tiap pojok (pointer capture, anti-stale), dan **rotate** dengan snapping sudut.
  - Override kategori / harga per frame.
- **Session** — folder foto sumber, nama sesi, privacy (sembunyikan path dari customer).
- **Output** — konfigurasi hasil export.

### Customer Flow (`/customer/*`)
1. **Welcome** — sapa customer, tampilkan nama studio & sesi.
2. **Frame** — pilih frame dari katalog, atur kuantitas, filter per kategori.
3. **Photos** — pilih foto dari folder (dengan timer flow & shortcut keyboard ←/→/Space).
4. **Editor** — letakkan foto ke slot frame, preview live di `FrameCanvas`.
5. **Review** — verifikasi hasil sebelum bayar.
6. **Finish** — konfirmasi pembayaran & status export.

---

## 2. Arsitektur Teknis

```text
src/
├── routes/                  # File-based routing (TanStack Router)
│   ├── __root.tsx           # Root shell + Toaster + error boundary
│   ├── index.tsx            # Landing
│   ├── admin.tsx            # Admin layout (sidebar)
│   ├── admin.{brand,frames,general,output,session,index}.tsx
│   ├── customer.tsx         # Customer layout (header/back btn)
│   └── customer.{welcome,frame,photos,editor,review,finish,index}.tsx
├── components/
│   ├── admin-shell.tsx
│   ├── customer-shell.tsx
│   ├── frame-canvas.tsx     # Render frame + foto pada slot
│   ├── slot-editor-canvas.tsx  # Drag/resize/rotate slot (pointer capture)
│   ├── flow-timer.tsx
│   ├── unsaved-modal.tsx
│   └── ui/                  # shadcn/ui
├── lib/
│   ├── studio-store.ts      # Zustand store (persist) — frames, session, brand
│   ├── detect-slots.ts      # Pixel-level slot detection
│   ├── detect-slots.test.ts # TDD: sintetis grid 2×3 → 6 slot
│   ├── slot-geometry.ts     # Pure: move / resize / rotate math
│   └── slot-geometry.test.ts
└── assets/frames/           # Frame default (filmstrip, cinema, vintage)
```

### State
- **Zustand + persist** menyimpan: `brand`, `frames` (override), `session`, `selectedFrameIds`, `frameQuantities`, `selectedPhotoIds`, `privacy`.
- Tipe utama: `Frame { id, name, category, slots, slotRects: {x,y,w,h}[] (%) }`.

### Slot Detection Pipeline
1. Load gambar ke `<canvas>` off-screen.
2. Bangun **barrier mask** dari luminance + saturation (garis/objek = barrier).
3. **Flood fill** 4-connectivity pada area non-barrier → kandidat slot.
4. Filter: area 0.5%–70%, buang region yang menyentuh semua sisi, validasi aspect ratio.
5. Convert bounding box ke persen → `SlotRect[]`.
6. Group rows → columns untuk ordering yang natural.

### Interaksi Slot Editor
- `pointerdown` pada slot → mode `move`; pada handle pojok → mode `resize-{nw|ne|sw|se}`; pada handle atas → `rotate`.
- `setPointerCapture` agar drag cepat tidak hilang.
- `modeRef` mencegah stale closure di `pointermove`.
- Clamping ke kanvas; rotate dengan snapping (default 15°).
- Coverage TDD: `slot-geometry.test.ts` (move/resize/rotate) & `detect-slots.test.ts` (grid sintetis).

---

## 3. Alur UI/UX

### 3a. Admin → Setup Frame Baru
```text
[Admin/Frames]
   │  klik "Tambah Frame"
   ▼
[Import Gambar PNG/JPG] ──► gambar dirender di Slot Editor
   │
   ▼
[Auto-Detect Slot]  (tombol; loading "Mendeteksi…")
   │  → 6 slot terdeteksi otomatis pada layout grid
   ▼
[Adjust per-slot]
   ├─ drag tengah  → pindah
   ├─ drag pojok   → resize fleksibel
   └─ drag rotate  → putar (snap 15°)
   │
   ▼
[Simpan]  → masuk katalog, langsung bisa dipakai customer
```

### 3b. Customer Flow
```text
Welcome ──► Frame ──► Photos ──► Editor ──► Review ──► Finish
   │          │          │          │          │          │
   │          │          │          │          │          └─ konfirmasi & export
   │          │          │          │          └─ verifikasi komposisi
   │          │          │          └─ tarik foto ke slot
   │          │          └─ pilih foto (timer + shortcut)
   │          └─ pilih frame + qty + filter kategori
   └─ greeting dinamis dari brand
```

### 3c. State Guards
- Tiap route customer redirect ke `/admin/session` bila `folderName` belum di-set.
- `privacy.hideFilePathFromCustomer` menyembunyikan path file dari layar customer (kecuali `adminMode`).

---

## 4. Menjalankan Project

```bash
bun install
bun dev           # preview Vite
bunx vitest run   # jalankan unit test (slot geometry + detection)
```

Routes utama:
- `/` — landing
- `/admin` — admin panel (default ke `/admin/index`)
- `/customer/welcome` — entry customer (butuh session)

---

## 5. Catatan untuk Demo Client
- Frame baru dapat di-import & langsung dipakai pada flow customer (tanpa rebuild).
- Auto-detect mengakomodasi layout strip, grid, dan kolase tidak beraturan.
- Editor slot mendukung **drag · resize · rotate** dengan handle visual; semua transformasi tersimpan dalam persen sehingga aman terhadap resolusi gambar.
- TDD mencakup core geometry + detection — aman untuk iterasi cepat.
