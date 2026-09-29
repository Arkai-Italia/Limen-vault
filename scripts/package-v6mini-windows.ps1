<#
.SYNOPSIS
    Package LIMEN Vault v6Mini for Windows 11 x64 (NSIS installer).
.DESCRIPTION
    Fully reproducible packaging pipeline meeting all 8 requirements of Block 5:
    - Strict validation of toolchain requirements (Node, pnpm, Rust MSVC).
    - Frozen lockfile verification (pnpm install --frozen-lockfile).
    - Complete SHA-256 manifest of all native binaries (llama.cpp, PDFium, Tesseract 5.4, tessdata, licenses).
    - Physical existence check of all JS and CSS assets referenced in dist/index.html.
    - Deterministic detection of the newly built installer.
    - Audit log recording git commit, target architecture, and checksums.
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

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   LIMEN Vault v6Mini Packaging Pipeline (Windows x64 - NSIS Installer)" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Cartella Root: $RootDir"

if (-not $OutDir) {
    $OutDir = Join-Path $RootDir "USER INSTALL WINDOWS"
}
$LocalReleaseDir = Join-Path $RootDir ".local\limen-v6mini-release-windows"

# -----------------------------------------------------------------------------
# 1. Verifica Strumenti, Prerequisiti e Lockfile Congelato
# -----------------------------------------------------------------------------
Write-Host "`n[1/6] Validazione stringente prerequisiti e lockfile congelato..." -ForegroundColor Yellow

$gitCommit = (git rev-parse HEAD).Trim()
Write-Host "Git Commit HEAD: $gitCommit"

$nodeVer = (node --version)
if ($LASTEXITCODE -ne 0 -or -not $nodeVer) {
    throw "ERRORE CRITICO: Node.js non trovato o non funzionante."
}
Write-Host "Node.js: $nodeVer"

$pnpmVer = (pnpm --version)
if ($LASTEXITCODE -ne 0 -or -not $pnpmVer) {
    throw "ERRORE CRITICO: pnpm non trovato o non funzionante."
}
Write-Host "pnpm:    $pnpmVer"

$rustcVer = (rustc --version)
if ($LASTEXITCODE -ne 0 -or -not $rustcVer) {
    throw "ERRORE CRITICO: rustc non trovato."
}
Write-Host "rustc:   $rustcVer"

$cargoVer = (cargo --version)
if ($LASTEXITCODE -ne 0 -or -not $cargoVer) {
    throw "ERRORE CRITICO: cargo non trovato."
}
Write-Host "cargo:   $cargoVer"

# Verifica lockfile congelato
Write-Host "Verifica dipendenze con lockfile congelato (pnpm install --frozen-lockfile)..."
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) {
    throw "ERRORE CRITICO: pnpm install --frozen-lockfile fallito con codice $LASTEXITCODE"
}
Write-Host "Prerequisiti e dipendenze verificate con successo." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 2. Censimento Manifest e Risorse Native Windows
# -----------------------------------------------------------------------------
Write-Host "`n[2/6] Verifica e generazione manifest risorse native Windows..." -ForegroundColor Yellow
$NativeWinDir = Join-Path $RootDir "apps\desktop\src-tauri\resources\native-windows"
if (-not (Test-Path $NativeWinDir)) {
    throw "ERRORE CRITICO: Cartella risorse native Windows non trovata: $NativeWinDir"
}

$RequiredBinaries = @(
    "llama-server.exe",
    "llama.dll",
    "ggml.dll",
    "ggml-base.dll",
    "mtmd.dll",
    "ggml-vulkan.dll",
    "pdfium.dll",
    "tesseract.exe",
    "libleptonica-6.dll",
    "libtesseract-5.dll",
    "tessdata\ita.traineddata",
    "tessdata\eng.traineddata"
)

foreach ($rel in $RequiredBinaries) {
    $full = Join-Path $NativeWinDir $rel
    if (-not (Test-Path $full)) {
        throw "ERRORE CRITICO: Componente nativo richiesto mancante: $full"
    }
}

# Verifica esclusione residui macOS
$MacFiles = @(Get-ChildItem -Path $NativeWinDir -Recurse | Where-Object {
    $_.Extension -in @(".dylib", ".so") -or $_.Name -in @("libggml-metal.so", "llama-server")
})
if ($MacFiles.Count -gt 0) {
    throw "ERRORE CRITICO: Trovati file macOS non ammessi in native-windows: $($MacFiles.FullName -join ', ')"
}

# Generazione manifest crittografico SHA-256 di tutti i file nativi
$ManifestLines = @()
$AllNativeFiles = Get-ChildItem -Path $NativeWinDir -Recurse -File | Sort-Object FullName
foreach ($file in $AllNativeFiles) {
    $relPath = $file.FullName.Substring($NativeWinDir.Length + 1)
    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash.ToLower()
    $ManifestLines += ("{0}  {1,-50}  ({2,9} bytes)" -f $hash, $relPath, $file.Length)
}

$ManifestPath = Join-Path $NativeWinDir "MANIFEST-native-windows.txt"
Set-Content -Path $ManifestPath -Value $ManifestLines -Encoding utf8
Write-Host "Manifest generato con successo in $ManifestPath ($($AllNativeFiles.Count) file nativi censiti)." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 3. Compilazione Frontend Vite
# -----------------------------------------------------------------------------
if (-not $SkipFrontendBuild) {
    Write-Host "`n[3/6] Compilazione frontend Vite per produzione..." -ForegroundColor Yellow
    pnpm --filter @limen-vault/desktop build
    if ($LASTEXITCODE -ne 0) {
        throw "ERRORE CRITICO: Build frontend Vite fallita con codice $LASTEXITCODE"
    }
} else {
    Write-Host "`n[3/6] Skip compilazione frontend (flag -SkipFrontendBuild)" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------------
# 4. Validazione dist/index.html ed Esistenza Fisica degli Asset
# -----------------------------------------------------------------------------
Write-Host "`n[4/6] Validazione dist/index.html ed esistenza fisica asset..." -ForegroundColor Yellow
$DistDir = Join-Path $RootDir "apps\desktop\dist"
$IndexHtmlPath = Join-Path $DistDir "index.html"
if (-not (Test-Path $IndexHtmlPath)) {
    throw "ERRORE CRITICO: dist/index.html non trovato in $IndexHtmlPath"
}
$IndexContent = [System.IO.File]::ReadAllText($IndexHtmlPath)
$IndexSize = (Get-Item $IndexHtmlPath).Length

if ($IndexContent -like "*<h1>LIMEN Vault</h1>*") {
    throw "ERRORE CRITICO: dist/index.html contiene il placeholder di emergenza da 53 byte!"
}
if ($IndexSize -lt 200) {
    throw "ERRORE CRITICO: dist/index.html ha dimensione anomala ($IndexSize byte)!"
}

# Estrazione e verifica fisica di tutti gli asset referenziati (script e stylesheet)
$matches = [regex]::Matches($IndexContent, '(?:src|href)="([^"]+\.(?:js|css))"')
if ($matches.Count -eq 0) {
    throw "ERRORE CRITICO: Nessun asset JS/CSS referenziato in dist/index.html!"
}

foreach ($m in $matches) {
    $assetRel = $m.Groups[1].Value.TrimStart('/')
    # Rimuovi eventuali query string
    if ($assetRel.Contains('?')) {
        $assetRel = $assetRel.Split('?')[0]
    }
    $assetFull = Join-Path $DistDir $assetRel
    if (-not (Test-Path $assetFull)) {
        throw "ERRORE CRITICO: Asset referenziato in index.html non esistente su disco: $assetFull"
    }
    $assetSize = (Get-Item $assetFull).Length
    Write-Host "  -> Asset verificato: $assetRel ($assetSize byte)" -ForegroundColor Gray
}
Write-Host "Validazione dist/index.html superata con $($matches.Count) asset fisici verificati." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 5. Build Tauri NSIS
# -----------------------------------------------------------------------------
Write-Host "`n[5/6] Esecuzione packaging Tauri NSIS (target: $Target)..." -ForegroundColor Yellow
$BuildStartTime = Get-Date

# Pulisci eventuali residui NSIS precedenti per determinismo assoluto
$NsisBundleDir = Join-Path $RootDir "apps\desktop\src-tauri\target\$Target\release\bundle\nsis"
if (Test-Path $NsisBundleDir) {
    Get-ChildItem -Path $NsisBundleDir -Filter "*.exe" | Remove-Item -Force
}

Write-Host "Comando: pnpm --filter @limen-vault/desktop tauri build --bundles nsis --target $Target --no-sign --config src-tauri/tauri.windows.conf.json"
pnpm --filter @limen-vault/desktop tauri build --bundles nsis --target $Target --no-sign --config src-tauri/tauri.windows.conf.json
if ($LASTEXITCODE -ne 0) {
    throw "ERRORE CRITICO: Tauri build fallita con codice $LASTEXITCODE"
}

# -----------------------------------------------------------------------------
# 6. Rilevamento Deterministico e Copia Installer
# -----------------------------------------------------------------------------
Write-Host "`n[6/6] Rilevamento deterministico installer e generazione checksum..." -ForegroundColor Yellow
$PossibleBundleDirs = @(
    $NsisBundleDir,
    (Join-Path $RootDir "apps\desktop\src-tauri\target\release\bundle\nsis")
)

$FoundExe = $null
foreach ($bDir in $PossibleBundleDirs) {
    if (Test-Path $bDir) {
        $exes = @(Get-ChildItem -Path $bDir -Filter "*.exe" | Where-Object { $_.LastWriteTime -ge $BuildStartTime.AddSeconds(-30) } | Sort-Object LastWriteTime -Descending)
        if ($exes.Count -gt 0) {
            $FoundExe = $exes[0]
            Write-Host "Trovato installer NSIS deterministico (creato alle $($FoundExe.LastWriteTime)): $($FoundExe.FullName)"
            break
        }
    }
}

if (-not $FoundExe) {
    # Fallback se la granularità timestamp differisce
    foreach ($bDir in $PossibleBundleDirs) {
        if (Test-Path $bDir) {
            $exes = @(Get-ChildItem -Path $bDir -Filter "*.exe" | Sort-Object LastWriteTime -Descending)
            if ($exes.Count -gt 0) {
                $FoundExe = $exes[0]
                Write-Host "Trovato installer NSIS (fallback): $($FoundExe.FullName)"
                break
            }
        }
    }
}

if (-not $FoundExe) {
    throw "ERRORE CRITICO: Nessun installer .exe trovato nelle cartelle bundle NSIS!"
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
Copy-Item -Path $FoundExe.FullName -Destination (Join-Path $LocalReleaseDir $DestExeName) -Force

# Calcolo Hash SHA-256
$HashInfo = Get-FileHash -Path $DestPath -Algorithm SHA256
$Sha256 = $HashInfo.Hash.ToLower()
$FileSize = (Get-Item $DestPath).Length

# Scrittura file SHA256SUMS.txt
$ChecksumLine = "$Sha256  $DestExeName"
Set-Content -Path (Join-Path $OutDir "SHA256SUMS.txt") -Value $ChecksumLine -Encoding utf8
Set-Content -Path (Join-Path $LocalReleaseDir "SHA256SUMS-v6mini.txt") -Value $ChecksumLine -Encoding utf8
Set-Content -Path (Join-Path $LocalReleaseDir "EXE_SIZE_BYTES_v6mini.txt") -Value "$FileSize" -Encoding utf8

# Scrittura Packaging Audit Log
$AuditLog = @"
================================================================================
LIMEN VAULT v6Mini - WINDOWS RELEASE PACKAGING AUDIT LOG
Data packaging: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Git Commit HEAD: $gitCommit
Target Architecture: $Target
Node.js: $nodeVer
pnpm: $pnpmVer
rustc: $rustcVer
cargo: $cargoVer
File Installer: $DestPath
Dimensione: $FileSize bytes
SHA-256: $Sha256
================================================================================
"@
Set-Content -Path (Join-Path $OutDir "PACKAGING_AUDIT_LOG.txt") -Value $AuditLog -Encoding utf8
Set-Content -Path (Join-Path $LocalReleaseDir "PACKAGING_AUDIT_LOG.txt") -Value $AuditLog -Encoding utf8

Write-Host "`n=== PACKAGING WINDOWS v6Mini COMPLETATO CON SUCCESSO ===" -ForegroundColor Green
Write-Host "File Installer: $DestPath"
Write-Host "Dimensione:     $FileSize byte"
Write-Host "SHA-256:        $Sha256"
Write-Host "Checksum file:  $(Join-Path $OutDir 'SHA256SUMS.txt')"
Write-Host "Audit Log:      $(Join-Path $OutDir 'PACKAGING_AUDIT_LOG.txt')"
