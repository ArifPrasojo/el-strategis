# El Strategis 💎

Ekosistem manajemen keuangan pribadi (Personal Finance Management) yang dirancang untuk membantu Anda mencatat transaksi harian, mengelola anggaran, dan mencapai tujuan finansial (Wishlist) dengan antarmuka yang modern dan wawasan yang sangat jernih.

## ✨ Fitur Utama

- **📊 Pencatatan Transaksi:** Catat seluruh pemasukan dan pengeluaran harian Anda dengan mudah. Setiap transaksi dapat dihubungkan ke Akun, Kategori, dan Wishlist tertentu.
- **💳 Manajemen Akun & Kategori:** Buat dan sesuaikan daftar rekening/dompet Anda serta kelola kategori pengeluaran/pemasukan sesuai kebutuhan Anda.
- **🎯 Fitur Wishlist Otomatis:** Catat barang atau tujuan finansial impian Anda. Tabungan Wishlist akan terisi secara **otomatis** setiap kali Anda menambahkan transaksi tipe Pemasukan yang dihubungkan ke Wishlist tersebut!
- **📉 Anggaran (Budgets) Pintar:** Tetapkan batas pengeluaran untuk setiap kategori. Sistem akan memberikan indikator visual (Hijau = Aman, Kuning = Mendekati batas, Merah = Melebihi batas).
- **📱 Dukungan PWA (Progressive Web App):** Aplikasi ini bisa di-install layaknya aplikasi native di Android, iOS, maupun Desktop (Windows/Mac) sehingga memberikan pengalaman *full-screen* tanpa browser bar.
- **🔒 Keamanan Maksimal:** Autentikasi dan sesi pengguna dikelola dengan enkripsi standar industri menggunakan Supabase Auth.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun menggunakan teknologi web modern berkinerja tinggi:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **Database:** PostgreSQL (Di-hosting di [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Otentikasi:** Supabase Auth (SSR)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikon:** [Lucide React](https://lucide.dev/)
- **PWA:** `@ducanh2912/next-pwa`

## 🚀 Panduan Instalasi (Development)

Jika Anda ingin menjalankan atau mengembangkan proyek ini di komputer lokal (Localhost):

### 1. Kloning Repository
```bash
git clone https://github.com/ArifPrasojo/el-strategis.git
cd el-strategis
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file bernama `.env` di root direktori proyek Anda, lalu masukkan kredensial berikut (Dapatkan dari Dashboard Supabase Anda):

```env
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Sinkronisasi Skema Database
Dorong skema database ke Supabase dan *generate* Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Jalankan Server
```bash
npm run dev
```
Aplikasi Anda sekarang berjalan di `http://localhost:3000`.

## 🌐 Panduan Deployment (Vercel)

El Strategis sangat dioptimalkan untuk di-deploy ke Vercel:

1. Buat proyek baru di [Vercel](https://vercel.com/) dan *import* repository GitHub Anda.
2. Pada bagian **Environment Variables**, tambahkan keempat variabel `.env` di atas (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Vercel akan otomatis mengenali Next.js dan menjalankan `npm run build`. (Proses `prisma generate` sudah ditangani otomatis lewat perintah `postinstall` di `package.json`).
4. Klik **Deploy**.

## 📄 Lisensi

Proyek ini dibuat untuk Portofolio dan dapat digunakan secara personal.