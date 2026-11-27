<div align="center">

<img src="https://i.ibb.co.com/q3RGJJpP/logo-infranexia.png" alt="Infranexia Logo" width="180" />

# 🛰️ Infranexia — OTDR Dashboard

**Front-End Dashboard untuk Kalkulasi & Analisis Data OTDR**

Platform berbasis web untuk mengunggah file Excel hasil pengukuran OTDR, mengolahnya secara otomatis melalui engine Python di sisi backend, lalu menyajikan hasil kalkulasi redaman, bending, dan estimasi Rx ONU secara real-time.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Laravel Sanctum](https://img.shields.io/badge/Sanctum-Auth-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/docs/sanctum)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Turnstile-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/products/turnstile/)

[Fitur](#-fitur-utama) • [Tech Stack](#-tech-stack) • [Instalasi](#-instalasi--setup) • [Struktur Project](#-struktur-project) • [Environment](#-konfigurasi-environment) • [API Contract](#-api-contract)

</div>

---

## 📖 Tentang Project

**Infranexia OTDR Dashboard** adalah antarmuka modern untuk mempermudah teknisi jaringan fiber optik dalam:

- Mengunggah file Excel mentah hasil pengukuran **OTDR (Optical Time-Domain Reflectometer)**
- Memvalidasi & mengolah data melalui **Python converter** yang berjalan di backend Laravel
- Menampilkan hasil kalkulasi: **jumlah titik putus, bending, redaman per core, estimasi Rx ONU,** dan **threshold loss**
- Menyimpan riwayat kalkulasi dalam database sehingga bisa ditelusuri kembali kapan saja

Aplikasi ini dirancang sebagai SPA (Single Page Application) yang terhubung ke REST API Laravel dengan autentikasi berbasis **Laravel Sanctum (Bearer Token)**.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🔐 **Autentikasi Aman** | Login dengan token Sanctum + proteksi **Cloudflare Turnstile** (CAPTCHA invisible) |
| 📊 **Dashboard Interaktif** | Ringkasan metrik OTDR: total upload, jumlah core bermasalah, grafik distribusi redaman |
| 📤 **Upload & Konversi** | Upload file Excel (`.xlsx`/`.xls`, maks 10 MB) yang langsung diproses backend & dikembalikan sebagai file hasil siap unduh |
| 📜 **Riwayat Kalkulasi** | Tabel lengkap semua riwayat upload beserta detail per-core (bending, titik putus, Rx ONU, dll) |
| 🌙 **Dark / Light Mode** | Tema dapat diganti & tersimpan otomatis di `localStorage` |
| 🌐 **Multi-Bahasa (i18n)** | Dukungan Bahasa Indonesia & English toggle instan |
| 📱 **Responsif Penuh** | Layout adaptif dari mobile (sidebar drawer) hingga desktop |
| 🤖 **Floating Chatbot** | Asisten bantuan mengambang untuk panduan penggunaan |
| 🔄 **Auto-logout 401** | Interceptor Axios otomatis logout & redirect jika token kedaluwarsa |
| 🛡️ **Protected Routes** | Semua halaman dalam (`/`, `/upload`, `/history`, `/settings`) hanya bisa diakses dengan token valid |

---

## 🧰 Tech Stack

**Core**
- ⚛️ **React 19** — library UI
- ⚡ **Vite 7** — build tool & dev server super cepat
- 🧭 **React Router DOM v7** — routing SPA

**UI & Styling**
- 🎨 **TailwindCSS 4** — utility-first CSS
- 🎯 **Lucide React** — icon set konsisten
- 🌗 **Dark mode** via `class` strategy Tailwind

**State & Data**
- 📡 **Axios** — HTTP client dengan interceptor (Bearer token + auto-401 handling)
- 🗃️ **React Context API** — global state untuk tema & bahasa
- 💾 **localStorage** — persistensi tema, bahasa, token, dan data user

**Keamanan**
- 🛡️ **@marsidev/react-turnstile** — integrasi Cloudflare Turnstile
- 🔑 **Laravel Sanctum** — Bearer token authentication

**Tools**
- 🧹 **ESLint** — linting
- 📦 **npm** — package manager

---

## 🚀 Instalasi & Setup

### Prasyarat

- **Node.js** ≥ 20.x ([unduh](https://nodejs.org))
- **npm** ≥ 10.x
- Backend Laravel (Infranexia API) sudah berjalan di `http://localhost:8000`

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/username/infranexia-otdr-frontend.git
cd infranexia-otdr-frontend

# 2. Install dependencies
npm install

# 3. Copy environment
cp .env.example .env

# 4. Sesuaikan VITE_API_URL di .env (lihat bagian Environment)

# 5. Jalankan dev server
npm run dev