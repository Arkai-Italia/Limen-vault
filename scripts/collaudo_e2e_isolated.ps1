# ==============================================================================
# LIMEN Vault v6Mini - Verifica Componenti e Censimento Collaudo Applicativo
# Target: Windows 11 x64 (dev.arkai.limenvault v0.6.0)
# ==============================================================================
# Questo script esegue verifiche reali sui componenti nativi estratti ed archivia
# con rigore lo stato di ciascuna prova (distinguendo prove di componente da prove
# applicative end-to-end non eseguite o bloccate).
# Nessun riepilogo fisso, nessun valore inventato, nessun Stop-Process non autorizzato.
# ==============================================================================

param (
    [string]$EvidenceOut = "E:\Projects\vault_memai_obsi\IMPLEMENTATION\WINDOWS_RELEASE_EVIDENCE\fase6-collaudo-componenti-e-censimento-e2e.txt"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RootDir = "E:\Projects\vault_memai_obsi"
$IsoDir = "$RootDir\ISOLATED_TEST_ENV"
$AppDir = "$IsoDir\installed_app"
$NativeDir = "$AppDir\native"
$ModelsDir = "$IsoDir\models"
$VaultDir = "$IsoDir\vault\collaudo_vault"
$InstallerPath = "$RootDir\USER INSTALL WINDOWS\LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe"

$results = [System.Collections.Generic.List[string]]::new()
$counts = @{
    "PASS_COMPONENTE" = 0
    "NON_ESEGUITO_APPLICATIVO" = 0
    "BLOCCATO" = 0
    "FAIL" = 0
}

function Log-Proof($num, $title, $status, $detail) {
    $line = "[PROVA {0:D2}] {1,-42} : {2,-25} | {3}" -f $num, $title, $status, $detail
    Write-Host $line -ForegroundColor $(
        if ($status -eq "PASS_COMPONENTE") { "Green" }
        elseif ($status -eq "FAIL") { "Red" }
        elseif ($status -eq "BLOCCATO") { "Magenta" }
        else { "Yellow" }
    )
    $results.Add($line)
    if ($counts.ContainsKey($status)) {
        $counts[$status]++
    } else {
        $counts["FAIL"]++
    }
}

# Calcolo dinamico dell'hash dell'installer realmente presente su disco
if (Test-Path $InstallerPath) {
    $calcInstallerHash = (Get-FileHash -Path $InstallerPath -Algorithm SHA256).Hash.ToLower()
    $installerSize = (Get-Item $InstallerPath).Length
} else {
    $calcInstallerHash = "FILE_NON_TROVATO"
    $installerSize = 0
}

$header = @"
================================================================================
VERIFICA COMPONENTI E CENSIMENTO COLLAUDO APPLICATIVO - LIMEN VAULT v6Mini
Data Esecuzione: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Sistema Operativo: $([System.Environment]::OSVersion.VersionString) (Windows 11 x64)
Account Windows Effettivo: $env:USERNAME (NOTA: Nessun profilo OS separato configurato)
Cartella Staging: $IsoDir
Installer Verificato: $InstallerPath
Installer Dimensione: $installerSize byte
Installer Hash SHA-256 Calcolato: $calcInstallerHash
================================================================================
"@
$results.Add($header)

Write-Host "Esecuzione verifica componenti e censimento prove applicative..." -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# PROVA 01: Installazione Pulita & WebView2 Runtime
# -----------------------------------------------------------------------------
try {
    # Rilevamento WebView2 reale dal registro di Windows (senza fallback inventati)
    $regKeyLM = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
    $regKeyCU = "HKCU:\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
    $wvVersion = $null
    if (Test-Path $regKeyLM) {
        $wvVersion = (Get-ItemProperty $regKeyLM -ErrorAction SilentlyContinue).pv
    }
    if (-not $wvVersion -and (Test-Path $regKeyCU)) {
        $wvVersion = (Get-ItemProperty $regKeyCU -ErrorAction SilentlyContinue).pv
    }

    $exePath = "$AppDir\limen-vault.exe"
    $uninstallPath = "$AppDir\uninstall.exe"
    $filesPresent = (Test-Path $exePath) -and (Test-Path $uninstallPath)

    if ($filesPresent -and $wvVersion) {
        Log-Proof 1 "Installazione Pulita & WebView2" "NON_ESEGUITO_APPLICATIVO" "Binari presenti nello staging ($exePath), WebView2 registrato v$wvVersion. Installazione interattiva Menu Start non eseguita."
    } elseif ($filesPresent) {
        Log-Proof 1 "Installazione Pulita & WebView2" "NON_ESEGUITO_APPLICATIVO" "Binari presenti nello staging, ma runtime WebView2 non rilevato a registro."
    } else {
        Log-Proof 1 "Installazione Pulita & WebView2" "FAIL" "File limen-vault.exe o uninstall.exe mancanti nello staging."
    }
} catch {
    Log-Proof 1 "Installazione Pulita & WebView2" "FAIL" $_.Exception.Message
}

# -----------------------------------------------------------------------------
# PROVA 02: Creazione Vault & Persistenza
# -----------------------------------------------------------------------------
# La creazione reale del vault deve avvenire attraverso l'app LIMEN.
# La sola creazione di cartelle da PowerShell non collauda l'applicazione.
Log-Proof 2 "Creazione Vault & Persistenza" "NON_ESEGUITO_APPLICATIVO" "Creazione, chiusura e riapertura del vault attraverso la UI dell'app non eseguita."

# -----------------------------------------------------------------------------
# PROVA 03: Importazione Formati & Byte-Identità
# -----------------------------------------------------------------------------
# L'importazione deve avvenire attraverso il catalogo e le funzioni di LIMEN.
# Il solo Copy-Item da PowerShell non esercita l'ingestion applicativa.
Log-Proof 3 "Importazione Formati & Byte-Identita" "NON_ESEGUITO_APPLICATIVO" "Importazione attraverso l'interfaccia o IPC di LIMEN non eseguita; verificata solo la presenza delle 7 fixture sorgente."

# -----------------------------------------------------------------------------
# PROVA 04: OCR Reale & Gestione Degrado (Prova di Componente Standalone)
# -----------------------------------------------------------------------------
try {
    $tessExe = "$NativeDir\tesseract.exe"
    $f1 = "$RootDir\apps\desktop\tests\fixtures\ocr-spike\fixture_1_immagine_autonoma.png"
    $ocrOutBase = "$IsoDir\logs\ocr_standalone_out"
    if (-not (Test-Path "$IsoDir\logs")) { New-Item -ItemType Directory -Path "$IsoDir\logs" -Force | Out-Null }
    
    if ((Test-Path $tessExe) -and (Test-Path $f1)) {
        $pTess = Start-Process -FilePath $tessExe -ArgumentList "`"$f1`" `"$ocrOutBase`" -l ita+eng --tessdata-dir `"$NativeDir\tessdata`"" -Wait -PassThru -NoNewWindow
        if ($pTess.ExitCode -eq 0 -and (Test-Path "$ocrOutBase.txt")) {
            $ocrText = Get-Content -Path "$ocrOutBase.txt" -Raw -Encoding utf8
            # Riporto verbatim di cosa ha estratto Tesseract (compresi errori ortografici)
            $firstLine = ($ocrText -split "`r?`n" | Where-Object { $_.Trim().Length -gt 0 } | Select-Object -First 1)
            Log-Proof 4 "OCR Reale Componente Tesseract" "PASS_COMPONENTE" "Esecuzione standalone tesseract.exe riuscita. Testo estratto grezzo: '$firstLine'. Nota: integrazione e rendering su UI non testati."
        } else {
            Log-Proof 4 "OCR Reale Componente Tesseract" "FAIL" "Tesseract standalone exit code $($pTess.ExitCode)."
        }
    } else {
        Log-Proof 4 "OCR Reale Componente Tesseract" "FAIL" "Binario tesseract.exe o fixture_1 non trovati."
    }
} catch {
    Log-Proof 4 "OCR Reale Componente Tesseract" "FAIL" $_.Exception.Message
}

# -----------------------------------------------------------------------------
# PROVA 05: Ricerca Semantica con bge-m3 (Prova di Componente Standalone)
# -----------------------------------------------------------------------------
# Richiesta diretta HTTP a bge-m3 verifica il server nativo standalone,
# non l'indicizzazione e ricerca attraverso l'applicazione LIMEN.
Log-Proof 5 "Ricerca Semantica bge-m3" "NON_ESEGUITO_APPLICATIVO" "Indicizzazione e ricerca semantica attraverso LIMEN non eseguita; server embedding testabile solo come componente."

# -----------------------------------------------------------------------------
# PROVA 06: Coesistenza Simultanea Porte (Prova di Componente Loopback)
# -----------------------------------------------------------------------------
# L'apertura di TcpListener dimostra solo bind OS, non l'avvio simultaneo
# reale di bge-m3 e Ministral con modelli GGUF caricati in memoria dall'app.
Log-Proof 6 "Coesistenza Simultanea Porte" "NON_ESEGUITO_APPLICATIVO" "Avvio simultaneo reale bge-m3 + Ministral con pesi caricati in app non eseguito."

# -----------------------------------------------------------------------------
# PROVA 07: 20 Domande Consecutive a Ministral
# -----------------------------------------------------------------------------
# Nessuna domanda è stata inviata a Ministral. La simulazione di hash GUID
# non costituisce collaudo dell'inferenza né misura della RAM dell'app.
Log-Proof 7 "20 Domande Consecutive Ministral" "NON_ESEGUITO_APPLICATIVO" "Nessuna inferenza inviata al modello Ministral attraverso l'applicazione installata."

# -----------------------------------------------------------------------------
# PROVA 08: Monitoraggio Solo Locale (Traffico di Rete)
# -----------------------------------------------------------------------------
# Il monitoraggio reale richiede l'app installata in esecuzione con tutti i processi figli.
Log-Proof 8 "Monitoraggio Solo Locale" "NON_ESEGUITO_APPLICATIVO" "Monitoraggio del traffico durante l'esecuzione attiva dell'app installata non eseguito."

# -----------------------------------------------------------------------------
# PROVA 09: Resilienza Modelli & Checksum Errati
# -----------------------------------------------------------------------------
# Richiede l'invocazione della routine di validazione/caricamento dell'app.
Log-Proof 9 "Resilienza Modelli & Checksum" "NON_ESEGUITO_APPLICATIVO" "Invocazione della validazione dell'app su modello corrotto non eseguita."

# -----------------------------------------------------------------------------
# PROVA 10: Errori, Timeout & Assenza Processi Orfani
# -----------------------------------------------------------------------------
# Richiede la provocazione di un timeout reale dell'app e verifica Job Object.
Log-Proof 10 "Errori, Timeout & Processi Orfani" "NON_ESEGUITO_APPLICATIVO" "Nessun timeout provocato sull'applicazione né chiusura controllata di albero processi."

# -----------------------------------------------------------------------------
# PROVA 11: WinCred Isolato (Credential Manager)
# -----------------------------------------------------------------------------
# Eseguire cmdkey sotto l'account 'user' non costituisce isolamento di profilo OS.
# Un profilo Windows separato o una VM non sono stati configurati.
Log-Proof 11 "WinCred in Profilo Isolato" "BLOCCATO" "Profilo utente Windows dedicato o VM non configurati; esecuzione sotto 'user' non isola le credenziali."

# -----------------------------------------------------------------------------
# PROVA 12: Fonti & Citazioni (Sanitizzazione e Apertura)
# -----------------------------------------------------------------------------
# La sola regex PowerShell non dimostra la corrispondenza fra risposta,
# citazione e documento realmente aperto nel lettore integrato.
Log-Proof 12 "Fonti & Citazioni" "NON_ESEGUITO_APPLICATIVO" "Verifica interattiva dell'apertura del documento sorgente e del passaggio citato nel lettore non eseguita."

# -----------------------------------------------------------------------------
# PROVA 13: Snapshot Vault & Ripristino
# -----------------------------------------------------------------------------
# Richiede l'utilizzo dei comandi snapshot/restore interni di LIMEN Vault.
Log-Proof 13 "Snapshot Vault & Ripristino" "NON_ESEGUITO_APPLICATIVO" "Esecuzione dello snapshot e del ripristino attraverso le funzioni interne di LIMEN non eseguita."

# -----------------------------------------------------------------------------
# PROVA 14: Percorsi, Spazi & Lettere Accentate
# -----------------------------------------------------------------------------
# Richiede che l'app LIMEN apra, indicizzi e cerchi su percorsi speciali.
Log-Proof 14 "Percorsi, Spazi & Accenti" "NON_ESEGUITO_APPLICATIVO" "Esercizio dell'applicazione su percorsi con caratteri speciali non eseguito."

# -----------------------------------------------------------------------------
# PROVA 15: Adattabilità DPI & Layout UI
# -----------------------------------------------------------------------------
# Richiede ispezione visiva interattiva dell'interfaccia a 100%, 125% e 150%.
Log-Proof 15 "Adattabilita DPI & Layout UI" "NON_ESEGUITO_APPLICATIVO" "Prove visive dell'interfaccia a 100%, 125% e 150% non eseguite (richiede sessione grafica interattiva)."

# -----------------------------------------------------------------------------
# PROVA 16: Ciclo di Vita Pacchetto & Disinstallatore
# -----------------------------------------------------------------------------
# Richiede esecuzione effettiva dell'uninstaller ed ispezione dei dati conservati.
Log-Proof 16 "Ciclo di Vita Pacchetto" "NON_ESEGUITO_APPLICATIVO" "Esecuzione reale dell'installer/uninstaller con verifica della conservazione del vault non eseguita."

# -----------------------------------------------------------------------------
# Calcolo Dinamico del Riepilogo
# -----------------------------------------------------------------------------
$summaryLine = @"

================================================================================
RIEPILOGO STATO EFFETTIVO COLLAUDO:
- Prove Componente Eseguite (PASS_COMPONENTE): $($counts["PASS_COMPONENTE"])
- Prove Applicative E2E Non Eseguite (NON_ESEGUITO_APPLICATIVO): $($counts["NON_ESEGUITO_APPLICATIVO"])
- Prove Bloccate (BLOCCATO): $($counts["BLOCCATO"])
- Prove Fallite (FAIL): $($counts["FAIL"])

CONCLUSIONE: Collaudo dell'app installata NON DIMOSTRATO. Isolamento del profilo NON REALIZZATO.
================================================================================
"@
$results.Add($summaryLine)
Write-Host $summaryLine -ForegroundColor Yellow

Set-Content -Path $EvidenceOut -Value $results -Encoding utf8
Write-Host "Rapporto salvato in: $EvidenceOut" -ForegroundColor Cyan
