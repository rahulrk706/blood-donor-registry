#!/bin/bash
# Blood Donor Registry - Full Setup Script
# Run this from the project root: bash setup.sh

set -e

ROOT_DIR="$(pwd)"
CUSTOM_BACKEND="$ROOT_DIR/backend"

echo "================================================"
echo "  Blood Donor Registry - Setup"
echo "================================================"

# ── Backend ──────────────────────────────────────────
echo ""
echo "[1/4] Creating Laravel project (this may take a minute)..."

# Stash our custom backend files
cp -r "$CUSTOM_BACKEND" "$ROOT_DIR/backend-custom"

# Remove the stub directory so composer can scaffold into it
rm -rf "$CUSTOM_BACKEND"

# Create a fresh Laravel project
composer create-project laravel/laravel backend --prefer-dist --no-interaction

echo ""
echo "[2/4] Overlaying custom application files..."

# Overlay our custom files onto the fresh Laravel scaffold
cp -r "$ROOT_DIR/backend-custom/app/."        "$CUSTOM_BACKEND/app/"
cp -r "$ROOT_DIR/backend-custom/database/."   "$CUSTOM_BACKEND/database/"
cp    "$ROOT_DIR/backend-custom/routes/api.php"   "$CUSTOM_BACKEND/routes/api.php"
cp    "$ROOT_DIR/backend-custom/config/cors.php"   "$CUSTOM_BACKEND/config/cors.php"
cp    "$ROOT_DIR/backend-custom/.env.example"      "$CUSTOM_BACKEND/.env.example"

# Clean up stash
rm -rf "$ROOT_DIR/backend-custom"

cd "$CUSTOM_BACKEND"

# Generate app key (artisan now exists)
php artisan key:generate

echo ""
echo "  >> Open backend/.env and set your database credentials."
echo "     DB_DATABASE=blood_donors"
echo "     DB_USERNAME=root"
echo "     DB_PASSWORD=yourpassword"
echo ""
echo "  Press ENTER when done..."
read -r

# Run migrations and seed sample data
php artisan migrate --seed

cd "$ROOT_DIR"

# ── Frontend ─────────────────────────────────────────
echo ""
echo "[3/4] Installing React frontend..."
cd frontend
npm install
cd "$ROOT_DIR"

echo ""
echo "================================================"
echo "  Setup complete!"
echo ""
echo "  Start backend:   cd backend && php artisan serve"
echo "  Start frontend:  cd frontend && npm run dev"
echo ""
echo "  Backend:   http://localhost:8000"
echo "  Frontend:  http://localhost:5173"
echo "================================================"
