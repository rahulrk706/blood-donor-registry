# Blood Donor Registry - Setup Script (PowerShell)
# Run from the project root in PowerShell:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\setup.ps1

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "  Blood Donor Registry - Setup" -ForegroundColor Red
Write-Host "================================================"

# ── Prerequisite checks ───────────────────────────────
Write-Host ""
Write-Host "[0/3] Checking prerequisites..." -ForegroundColor Yellow

$missing = @()
foreach ($cmd in @("php", "composer", "node", "npm")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        $missing += $cmd
    }
}
if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "  ERROR: The following required tools were not found:" -ForegroundColor Red
    foreach ($m in $missing) {
        Write-Host "    - $m" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "  Install the missing tools and re-run setup." -ForegroundColor Yellow
    exit 1
}
Write-Host "  All prerequisites found." -ForegroundColor Green

# ── Backend ──────────────────────────────────────────
Write-Host ""
Write-Host "[1/3] Creating Laravel project (this may take a minute)..." -ForegroundColor Yellow

$CustomBackend = Join-Path $RootDir "backend"
$BackupDir     = Join-Path $RootDir "backend-custom"

# Stash our custom files
Copy-Item -Recurse -Force $CustomBackend $BackupDir

# Remove stub so composer can scaffold into it
Remove-Item -Recurse -Force $CustomBackend

# Create fresh Laravel project
Set-Location $RootDir
composer create-project laravel/laravel backend --prefer-dist --no-interaction

Write-Host ""
Write-Host "[2/3] Overlaying custom application files..." -ForegroundColor Yellow

# Overlay custom files
Copy-Item -Recurse -Force "$BackupDir\app\*"      "$CustomBackend\app\"
Copy-Item -Recurse -Force "$BackupDir\database\*" "$CustomBackend\database\"
Copy-Item -Force "$BackupDir\routes\api.php"      "$CustomBackend\routes\api.php"
Copy-Item -Force "$BackupDir\config\cors.php"     "$CustomBackend\config\cors.php"
Copy-Item -Force "$BackupDir\.env.example"        "$CustomBackend\.env.example"

# Clean up backup
Remove-Item -Recurse -Force $BackupDir

# Fix Laravel 11: register api routes in bootstrap/app.php
$bootstrapApp = "$CustomBackend\bootstrap\app.php"
$content = Get-Content $bootstrapApp -Raw -Encoding UTF8
$content = $content -replace `
    "->withRouting\(\s+web: __DIR__\.'/../routes/web\.php',", `
    "->withRouting(`n        web: __DIR__.'/../routes/web.php',`n        api: __DIR__.'/../routes/api.php',"
Set-Content $bootstrapApp -Value $content -Encoding UTF8 -NoNewline

Set-Location $CustomBackend

# Copy .env.example -> .env so key:generate has a target
if (-not (Test-Path "$CustomBackend\.env")) {
    Copy-Item "$CustomBackend\.env.example" "$CustomBackend\.env"
    Write-Host "  Created .env from .env.example" -ForegroundColor Green
}

# Generate app key
php artisan key:generate

Write-Host ""
Write-Host "  Open backend\.env and set your database credentials:" -ForegroundColor Cyan
Write-Host "    DB_DATABASE=blood_donors" -ForegroundColor White
Write-Host "    DB_USERNAME=root" -ForegroundColor White
Write-Host "    DB_PASSWORD=(your wamp password, often blank)" -ForegroundColor White
Write-Host ""
Write-Host "  Press ENTER when done..." -ForegroundColor Cyan
Read-Host

# Migrate and seed
php artisan migrate --seed
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ERROR: Migration failed. Check your DB credentials in backend\.env" -ForegroundColor Red
    Set-Location $RootDir
    exit 1
}

Set-Location $RootDir

# ── Frontend ─────────────────────────────────────────
Write-Host ""
Write-Host "[3/3] Installing React frontend..." -ForegroundColor Yellow
Set-Location (Join-Path $RootDir "frontend")
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  ERROR: npm install failed. Check Node.js version (>=18 required)." -ForegroundColor Red
    Set-Location $RootDir
    exit 1
}
Set-Location $RootDir

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Start backend:" -ForegroundColor White
Write-Host "    cd backend; php artisan serve" -ForegroundColor Gray
Write-Host ""
Write-Host "  Start frontend (new terminal):" -ForegroundColor White
Write-Host "    cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Backend  -> http://localhost:8000"
Write-Host "  Frontend -> http://localhost:5173"
Write-Host "================================================" -ForegroundColor Green
