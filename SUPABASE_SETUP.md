# Setup Database Supabase untuk CleanScape VR

## 1. Setup Supabase

### Buat Project di Supabase
1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up atau login
3. Klik "New Project"
4. Pilih organisasi dan beri nama project
5. Buat password untuk database
6. Pilih region (Singapore untuk Indonesia)

### Dapatkan Credentials
1. Setelah project dibuat, buka **Settings > API**
2. Copy `Project URL` dan `anon public` key
3. Update file `.env.local` dengan credentials tersebut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 2. Setup Database Schema

1. Buka Supabase Dashboard
2. Pergi ke **SQL Editor**
3. Buat new query
4. Copy dan paste isi file `supabase/schema.sql`
5. Klik "Run" untuk menjalankan query

## 3. Struktur Database

### Table: user_sessions
Menyimpan data sesi pengguna setelah login:
- `id` (UUID): Primary key
- `nim` (VARCHAR): NIM mahasiswa
- `full_name` (VARCHAR): Nama lengkap
- `email` (VARCHAR): Email
- `fakultas` (VARCHAR): Fakultas
- `program_studi` (VARCHAR): Program studi
- `login_time` (TIMESTAMP): Waktu login
- `total_score` (INTEGER): Total skor quiz
- `time_taken` (INTEGER): Waktu yang digunakan (detik)
- `tour_completed` (BOOLEAN): Status penyelesaian tour
- `completed_at` (TIMESTAMP): Waktu selesai tour
- `session_data` (JSONB): Data sesi dalam format JSON
- `created_at` (TIMESTAMP): Waktu dibuat
- `updated_at` (TIMESTAMP): Waktu diupdate

### Table: quiz_answers
Menyimpan jawaban quiz (opsional untuk analisis detail):
- `id` (UUID): Primary key
- `session_id` (UUID): Foreign key ke user_sessions
- `position` (INTEGER): Posisi quiz
- `answers` (JSONB): Jawaban dalam format JSON
- `score` (INTEGER): Skor quiz
- `time_taken` (INTEGER): Waktu mengerjakan quiz
- `created_at` (TIMESTAMP): Waktu dibuat

## 4. Cara Kerja Aplikasi

### Saat Login
1. User login dengan username/password
2. Data user disimpan ke `user_sessions` table
3. Session ID disimpan di cookies

### Selama Tour
1. Progress tour disimpan di localStorage (offline)
2. Quiz completion dan skor dihitung real-time

### Saat Selesai Tour
1. Data final (skor, waktu) dikirim ke database
2. Record di `user_sessions` diupdate dengan status completed

## 5. View Data

### Melalui Supabase Dashboard
1. Buka project di Supabase
2. Pergi ke **Table Editor**
3. Pilih table `user_sessions`
4. Lihat data pengguna

### Melalui API (untuk admin)
GET request ke `/api/admin/sessions` akan mengembalikan semua data sesi.

## 6. Security Notes

- RLS (Row Level Security) sudah diaktifkan
- Saat ini policy mengizinkan semua operasi (untuk development)
- Untuk production, sesuaikan policy sesuai kebutuhan keamanan
- Pertimbangkan untuk menambah authentication untuk admin API

## 7. Next Steps

1. Setup credentials di `.env.local`
2. Jalankan schema SQL di Supabase
3. Test login dan tour completion
4. Buat dashboard admin jika diperlukan
5. Implement proper security policies
