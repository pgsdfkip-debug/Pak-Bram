# Pak Bram versi baru: cara memasang

## Isi folder

- `index.html`: aplikasi Pak Bram, cukup satu file ini.
- `netlify/functions/tanya.js`: penghubung ke AI generatif (Gemini). Opsional.
- `netlify/functions/suara.js`: suara alami Pak Bram (Gemini TTS). Opsional.
- `netlify.toml`: pengaturan Netlify untuk penghubung AI.

## Cara A: tanpa AI generatif (paling cepat)

1. Buka Netlify, pilih situs `asisstenbelajaripasd`, lalu buka **Deploys**.
2. Seret file `index.html` (atau folder ini) ke kotak *drag and drop*.
3. Selesai. Pak Bram menjawab dari buku catatan IPA ditambah 11 pelajaran etnosains.

## Cara B: dengan AI generatif (untuk Tanya Pak Bram)

> Catatan: fitur *drag and drop* Netlify tidak menjalankan Functions. Untuk cara B, situs harus di-deploy lewat GitHub atau Netlify CLI.

1. Buat API key gratis di https://aistudio.google.com (menu *Get API key*).
2. Di Netlify, buka **Site configuration → Environment variables**, lalu tambahkan:
   - `GEMINI_API_KEY` = API key tadi
   - `GEMINI_MODEL` = `gemini-2.5-flash` (opsional)
3. Unggah seluruh folder ini ke repositori GitHub, lalu hubungkan ke situs Netlify. Cara lain: jalankan `netlify deploy --prod` dari folder ini.
4. Buka `index.html`, cari baris `const AI_ENDPOINT = '';` lalu ubah menjadi:
   `const AI_ENDPOINT = '/.netlify/functions/tanya';`
5. Deploy ulang. Di layar Tanya Pak Bram akan muncul tulisan "Pak Bram memakai AI generatif".

Kalau AI gagal atau kuotanya habis, Pak Bram otomatis kembali memakai buku catatan, jadi aplikasi tetap jalan.

## Suara Pak Bram

**Tanpa pengaturan tambahan.** Pak Bram otomatis memilih suara pria Bahasa Indonesia paling alami di perangkat, tanpa mengubah nadanya. Teks dibacakan kalimat demi kalimat dengan jeda, seperti guru bicara. Tombol **🎙 Suara Pak Bram** di bagian atas bisa dipakai untuk memilih suara lain dan mengetesnya.

- Laptop atau PC: buka Pak Bram di **Microsoft Edge**, lalu pilih **Microsoft Ardi Online (Natural)**. Suara ini pria dan terdengar paling alami.
- HP Android: pasang atau perbarui **Speech Services by Google**, lalu unduh suara Bahasa Indonesia di Pengaturan, bagian Text-to-Speech.

**Suara alami yang sama di semua perangkat (Gemini TTS).** Cara ini perlu deploy lewat GitHub atau Netlify CLI, sama seperti penghubung AI.

1. Pastikan `GEMINI_API_KEY` sudah diisi di Netlify.
2. Opsional: isi `GEMINI_TTS_VOICE` dengan suara bawaan (default `Charon`). Siswa atau guru tetap bisa memilih sendiri dari menu.
3. Di `index.html`, ubah `const TTS_ENDPOINT = '';` menjadi `const TTS_ENDPOINT = '/.netlify/functions/suara';`.

Setelah aktif, menu **🎙 Suara Pak Bram** menampilkan **8 pilihan suara pria**:

| Pilihan di menu | Karakter | Nama suara Gemini |
|---|---|---|
| Pak Bram Tenang | Tenang dan jelas (bawaan) | Charon |
| Pak Bram Ramah | Ramah dan hangat | Achird |
| Pak Bram Ceria | Ceria dan bersemangat | Puck |
| Pak Bram Jernih | Jernih dan mudah dipahami | Iapetus |
| Pak Bram Berwibawa | Berwibawa dan berilmu | Sadaltager |
| Pak Bram Tegas | Tegas dan mantap | Orus |
| Pak Bram Berat | Bersuara berat dan dalam | Algenib |
| Pak Bram Enerjik | Enerjik dan antusias | Fenrir |

Selain suara, tersedia pilihan **gaya bicara** (hangat bercerita, bersemangat, tenang dan pelan, tegas dan jelas) dan **kecepatan** (pelan, normal, cepat). Pilihan ini tersimpan di perangkat masing-masing.

Jika server suara lambat atau gagal, Pak Bram otomatis kembali memakai suara perangkat. Setiap kalimat yang sudah pernah dibacakan disimpan sementara, jadi tidak perlu diminta ulang ke server.

## Kode kelas (Mode Kelas)

Format kodenya `PELAJARAN-KELAS`, misalnya `AREN-5` atau `RIMPU-6`.

| Kode | Pelajaran |
|---|---|
| GERABAH | Gerabah Banyumulek |
| NYALE | Tradisi Bau Nyale |
| GARAM | Garam Tradisional Lombok |
| LUMBUNG | Lumbung Sasak |
| AREN | Gula Aren |
| KEBO | Barapan Kebo |
| MADU | Madu Hutan Sumbawa |
| SUSU | Susu Kuda Liar Sumbawa |
| LENGGE | Uma Lengge |
| TENUN | Tenun Tembe Nggoli |
| RIMPU | Rimpu Mpida |

Guru juga bisa membagikan tautan langsung, misalnya `https://asisstenbelajaripasd.netlify.app/?kode=AREN-5`.

## Data ke Google Sheet

Alamat Google Apps Script yang lama tetap dipakai. Kolomnya juga sama: nama, kelas, postur, pertanyaan. Baris laporan sesi ditandai dengan `(laporan)` di kolom pertanyaan, berisi pelajaran, skor kuis, lama belajar, serta nama guru dan guru piket untuk Mode Kelas.

## Menambah video nyata dari YouTube (opsional)

Setiap materi sudah punya slide "Video animasi" buatan sendiri. Untuk menambah video nyata, misalnya proses pembuatan gula aren:

1. Buka videonya di YouTube. Salin kode setelah `watch?v=`, contohnya `abc123XYZ`.
2. Di `index.html`, cari baris `const VIDEO_YOUTUBE = {`.
3. Isi kode tersebut pada materi yang sesuai, contohnya `aren:'abc123XYZ'`.

Slide "Video nyata" akan muncul otomatis setelah slide kata kunci.

## Tombol di slide presentasi

- **🔊**: Pak Bram mengulang penjelasan.
- **▶ Otomatis**: slide berjalan sendiri setelah Pak Bram selesai bicara. Cocok untuk Mode Kelas.
- **🎵 Efek**: menyalakan atau mematikan efek suara suasana.
- **⛶**: layar penuh, untuk proyektor.
- Tombol panah kanan dan kiri di keyboard juga bisa dipakai untuk pindah slide.
