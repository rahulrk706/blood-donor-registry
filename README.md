# Blood Donor Registry

A full-stack blood donor management system with a Laravel REST API backend and a React frontend.

## Project Structure

```
webai/
├── backend/          # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/DonorController.php
│   │   └── Models/Donor.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   ├── config/cors.php
│   └── .env.example
│
├── frontend/         # React 18 + Vite
│   ├── src/
│   │   ├── api/donors.js
│   │   ├── pages/
│   │   │   ├── DonorList.jsx   # Sortable, filterable table
│   │   │   └── DonorForm.jsx   # Add / edit donor
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── setup.sh
└── README.md
```

## Quick Start

### 1. Database

Create a MySQL database named `blood_donors` (or any name you prefer).

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
# Edit .env: set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate --seed
php artisan serve
# → http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Or use `bash setup.sh` from the project root (interactive).

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donors` | List donors (supports filters + sort + pagination) |
| POST | `/api/donors` | Create a new donor |
| GET | `/api/donors/{id}` | Get single donor |
| PUT | `/api/donors/{id}` | Update donor |
| DELETE | `/api/donors/{id}` | Delete donor |

### GET /api/donors — Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search name, email, phone |
| `blood_type` | string | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `gender` | string | `male`, `female`, `other` |
| `is_available` | boolean | `true` / `false` |
| `city` | string | Partial city name match |
| `sort_by` | string | `name`, `blood_type`, `age`, `city`, `last_donation_date`, `created_at` |
| `sort_dir` | string | `asc` / `desc` |
| `page` | int | Page number |
| `per_page` | int | Items per page (default: 8) |

---

## Donor Fields

| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| email | string | Required, unique |
| phone | string | Required |
| blood_type | enum | A+/A-/B+/B-/AB+/AB-/O+/O- |
| age | integer | 18–65 |
| gender | enum | male/female/other |
| city | string | Required |
| address | text | Optional |
| weight | decimal | kg, optional |
| last_donation_date | date | Optional |
| is_available | boolean | Default: true |
| notes | text | Optional |

## Tech Stack

- **Backend**: Laravel 11, MySQL
- **Frontend**: React 18, Vite, React Router 6, Axios
