# Panduan Uji Coba Lokal

URL dev server saat ini:

```text
http://127.0.0.1:5174/admin/session
```

## Cara Menjalankan di Windows

Cara paling gampang:

1. Buka folder project `lovable-proto-play-flow`.
2. Double-click `START-PROTOTYPE-WINDOWS.cmd`.
3. Browser akan membuka `http://127.0.0.1:5174/admin/session`.
4. Biarkan jendela terminal tetap terbuka selama testing.
5. Untuk berhenti, tekan `Ctrl+C` di terminal.

Alternatif manual:

```text
npm run dev -- --host 127.0.0.1 --port 5174
```

## 0. Tes Cepat Tanpa File Eksternal

Gunakan ini untuk memastikan mesin flow dan export hidup sebelum memakai foto/frame asli.

```text
http://127.0.0.1:5174/admin/session?demo=1
```

Yang otomatis disiapkan:

- 8 foto demo lokal berbasis data URL.
- 1 frame proof 4 slot.
- target pilihan foto menjadi 4.

Alur tes cepat:

1. Buka URL `?demo=1`.
2. Klik `Mulai Customer Flow`.
3. Pilih `Proof Frame 4 Slot`.
4. Klik `Lanjut ke Pilih Foto`.
5. Klik `Auto pick 4`.
6. Klik `Lanjut ke Editor`.
7. Pastikan frame sudah terisi 4/4.
8. Klik `Lanjut ke Review`.
9. Klik `Export PNG Sekarang`.
10. Halaman Finish harus menampilkan nama file `Demo-Export-Local_Frame-Proof-Frame-4-Slot-01.png`.

## 1. Pilih Foto Asli

1. Buka `Session`.
2. Isi nama session/customer jika perlu.
3. Klik `Pilih Folder Foto`.
4. Pilih folder berisi foto customer hasil export Lightroom.
5. Aplikasi akan membaca file gambar valid: JPG, JPEG, PNG, WEBP.
6. Klik `Mulai Customer Flow`.

Catatan:

- Di Chrome/Edge, app akan mencoba akses folder lokal langsung lewat File System Access API.
- Jika browser tidak mendukung akses folder langsung, app otomatis fallback ke folder picker browser lama.
- Folder boleh berisi subfolder; file gambar valid akan tetap dibaca dan diurutkan berdasarkan path/nama.
- Foto tidak diupload ke cloud.
- Foto dipakai dari izin file lokal browser.

## 1B. Uji Dengan File Fisik Bawaan

Kalau belum punya foto/frame asli saat testing, pakai sample fisik ini:

Folder foto:

```text
sample-assets/photos-customer-demo
```

Frame PNG transparan:

```text
sample-assets/frames/FRAME_PROOF_4_SLOT_TRANSPARENT.png
```

Detailnya ada di:

```text
sample-assets/README.md
```

## 2. Import Frame Asli

1. Buka `Frame Manager`.
2. Klik `Import Frame PNG`.
3. Pilih file frame PNG transparan.
4. Isi nama, kategori, dan harga jika premium.
5. Klik `Import & Atur Slot`.
6. Atur slot:
   - drag kotak untuk geser,
   - tarik sudut untuk resize,
   - gunakan input X/Y/W/H jika perlu,
   - klik `Simpan Slot`.

Catatan:

- MVP frame hanya menerima PNG transparan.
- Jika auto-detect tidak pas, koreksi manual slot.

## 3. Customer Flow

1. Customer pilih frame.
2. Customer pilih foto terbaik sesuai target.
3. Customer masuk editor.
4. Gunakan `Auto Isi`, klik slot, atau pilih foto manual.
5. Lanjut ke Review setelah semua slot terisi.

## 4. Export PNG

1. Buka `Output Settings`.
2. Klik `Pilih` di Folder Output jika browser mendukung izin folder lokal.
3. Di halaman Review, cek `Export Checklist`.
4. Jika ada frame premium, aktifkan mode admin dan tandai pembayaran lunas.
5. Klik `Export PNG Sekarang`.
6. Jika folder output sudah diberi izin, PNG akan disimpan langsung ke folder itu.
7. Jika browser tidak mendukung izin tulis folder, browser akan download satu file PNG untuk setiap frame/cetakan.
8. Halaman Finish akan menampilkan daftar nama file hasil export dan memberi tahu apakah hasilnya `tersimpan ke folder` atau `download browser`.

## 5. Hal Yang Perlu Diperhatikan

- Browser web belum bisa selalu menulis langsung ke folder output tanpa permission tambahan.
- Untuk prototype ini, export akan mencoba simpan langsung ke folder output jika browser mendukung File System Access API. Jika tidak, export otomatis fallback menjadi download PNG.
- Versi desktop app nanti bisa dibuat agar menyimpan langsung ke folder output lokal.
- File foto/frame asli dari komputer dipakai untuk sesi browser berjalan. Jika refresh halaman, pilih ulang folder foto dan import ulang frame jika preview file lokal hilang.
- Frame PNG besar tidak dipaksa masuk localStorage agar settings browser tidak rusak karena limit storage.
