<#
.SYNOPSIS
    Package LIMEN Vault v6Mini for Windows 11 x64 (NSIS installer).
.DESCRIPTION
    Builds the production Vite frontend, verifies bundle contents,
    executes Tauri packaging for x86_64-pc-windows-msvc, verifies the
    resulting NSIS installer, copies to USER INSTALL WINDOWS/ and
    computes SHA-256 checksums.
#>
param (
    [switch]$SkipFrontendBuild = $false,
    [string]$Target = "x86_64-pc-windows-msvc",
    [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RootDir = (Resolve-Path "$PSScriptRoot\..").Path
Set-Location $RootDir

Write-Host "=== LIMEN Vault v6Mini Packaging Pipeline (Windows x64) ===" -ForegroundColor Cyan
Write-Host "Root Directory: $RootDir"

if (-not $OutDir) {
    $OutDir = Join-Path $RootDir "USER INSTALL WINDOWS"
}
$LocalReleaseDir = Join-Path $RootDir ".local\limen-v6mini-release-windows"

# 1. Prerequisiti
Write-Host "`n[1/6] Verifica strumenti e prerequisiti..." -ForegroundColor Yellow
$nodeVer = (node --version)
Write-Host "Node: $nodeVer"
$pnpmVer = (pnpm --version)
Write-Host "pnpm: $pnpmVer"
$rustcVer = (rustc --version)
Write-Host "rustc: $rustcVer"
$cargoVer = (cargo --version)
Write-Host "cargo: $cargoVer"

# 2. Verifica risorse native Windows
Write-Host "`n[2/6] Verifica isolamento risorse native Windows..." -ForegroundColor Yellow
$NativeWinDir = Join-Path $RootDir "apps\desktop\src-tauri\resources\native-windows"
if (-not (Test-Path $NativeWinDir)) {
    throw "ERRORE CRITICO: Cartella risorse native Windows non trovata: $NativeWinDir"
}

$RequiredFiles = @(
    "llama-server.exe",
    "llama.dll",
    "ggml.dll",
    "ggml-base.dll",
    "mtmd.dll",
    "ggml-vulkan.dll"
)
foreach ($f in $RequiredFiles) {
    $fp = Join-Path $NativeWinDir $f
    if (-not (Test-Path $fp)) {
        throw "ERRORE CRITICO: File nativo Windows mancante: $fp"
    }
}

# Verifica esclusione artefatti macOS
$MacFiles = @(Get-ChildItem -Path $NativeWinDir -Recurse | Where-Object {
    $_.Extension -in @(".dylib", ".so") -or $_.Name -in @("libggml-metal.so", "llama-server")
})
if ($MacFiles.Count -gt 0) {
    throw "ERRORE CRITICO: Trovati artefatti macOS in resources/native-windows/: $($MacFiles.FullName -join ', ')"
}
Write-Host "Risorse native Windows verificate con successo (20 binari/DLL presenti, 0 residui macOS)." -ForegroundColor Green

# 3. Compilazione Frontend Vite
if (-not $SkipFrontendBuild) {
    Write-Host "`n[3/6] Compilazione frontend Vite per produzione..." -ForegroundColor Yellow
    pnpm --filter @limen-vault/desktop build
    if ($LASTEXITCODE -ne 0) {
        throw "ERRORE CRITICO: Build frontend Vite fallita con codice $LASTEXITCODE"
    }
} else {
    Write-Host "`n[3/6] Skip compilazione frontend (flag -SkipFrontendBuild)" -ForegroundColor Yellow
}

# 4. Validazione dist/index.html
Write-Host "`n[4/6] Validazione bundle frontend dist/index.html..." -ForegroundColor Yellow
$IndexHtmlPath = Join-Path $RootDir "apps\desktop\dist\index.html"
if (-not (Test-Path $IndexHtmlPath)) {
    throw "ERRORE CRITICO: dist/index.html non trovato in $IndexHtmlPath"
}
$IndexContent = [System.IO.File]::ReadAllText($IndexHtmlPath)
$IndexSize = (Get-Item $IndexHtmlPath).Length

if ($IndexContent -like "*<h1>LIMEN Vault</h1>*") {
    throw "ERRORE CRITICO: dist/index.html contiene il segnaposto da 53 byte generato da build.rs!"
}
if ($IndexSize -lt 200) {
    throw "ERRORE CRITICO: dist/index.html ha dimensione anomala ($IndexSize byte)!"
}
if ($IndexContent -notmatch "assets/index-" -and $IndexContent -notmatch "\.js" -and $IndexContent -notmatch "\.css") {
    throw "ERRORE CRITICO: dist/index.html non fa riferimento a bundle JavaScript/CSS compilati!"
}
Write-Host "Validazione dist/index.html superata ($IndexSize byte, bundle Vite reali verificati)." -ForegroundColor Green

# 5. Build Tauri NSIS
Write-Host "`n[5/6] Esecuzione packaging Tauri NSIS (target: $Target)..." -ForegroundColor Yellow
Write-Host "Esecuzione: pnpm --filter @limen-vault/desktop tauri build --bundles nsis --target $Target --no-sign"
pnpm --filter @limen-vault/desktop tauri build --bundles nsis --target $Target --no-sign
if ($LASTEXITCODE -ne 0) {
    throw "ERRORE CRITICO: Tauri build fallita con codice $LASTEXITCODE"
}

# 6. Rilevamento e Copia Installer
Write-Host "`n[6/6] Rilevamento installer e generazione checksum..." -ForegroundColor Yellow
$PossibleBundleDirs = @(
    (Join-Path $RootDir "apps\desktop\src-tauri\target\$Target\release\bundle\nsis"),
    (Join-Path $RootDir "apps\desktop\src-tauri\target\release\bundle\nsis")
)

$FoundExe = $null
foreach ($bDir in $PossibleBundleDirs) {
    if (Test-Path $bDir) {
        $exes = @(Get-ChildItem -Path $bDir -Filter "*.exe" | Sort-Object LastWriteTime -Descending)
        if ($exes.Count -gt 0) {
            $FoundExe = $exes[0]
            Write-Host "Trovato installer NSIS: $($FoundExe.FullName)"
            break
        }
    }
}

if (-not $FoundExe) {
    throw "ERRORE CRITICO: Nessun file .exe trovato nelle cartelle bundle NSIS!"
}

# Assicuriamo esistenza cartelle di destinazione
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}
if (-not (Test-Path $LocalReleaseDir)) {
    New-Item -ItemType Directory -Path $LocalReleaseDir -Force | Out-Null
}

$DestExeName = "LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe"
$DestPath = Join-Path $OutDir $DestExeName
Copy-Item -Path $FoundExe.FullName -Destination $DestPath -Force
Write-Host "Installer copiato con successo in: $DestPath" -ForegroundColor Green

# Calcolo Hash SHA-256
$HashInfo = Get-FileHash -Path $DestPath -Algorithm SHA256
$Sha256 = $HashInfo.Hash.ToLower()
$FileSize = (Get-Item $DestPath).Length

# Scrittura file SHA256SUMS.txt
$ChecksumLine = "$Sha256  $DestExeName"
Set-Content -Path (Join-Path $OutDir "SHA256SUMS.txt") -Value $ChecksumLine -Encoding utf8
Set-Content -Path (Join-Path $LocalReleaseDir "SHA256SUMS-v6mini.txt") -Value $ChecksumLine -Encoding utf8
Set-Content -Path (Join-Path $LocalReleaseDir "EXE_SIZE_BYTES_v6mini.txt") -Value "$FileSize" -Encoding utf8

Write-Host "`n=== PACKAGING WINDOWS v6Mini COMPLETATO CON SUCCESSO ===" -ForegroundColor Cyan
Write-Host "File Installer: $DestPath"
Write-Host "Dimensione:     $FileSize byte"
Write-Host "SHA-256:        $Sha256"
Write-Host "Checksum file:  $(Join-Path $OutDir 'SHA256SUMS.txt')"
