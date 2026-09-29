# Walkthrough Fase 4: Script di Packaging Riproducibile e Generazione Installer NSIS

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Stato Fase 4**: **Chiusa e committata** (`325fdd9`)

---

## 1. Obiettivi e Perimetro di Fase 4
La Fase 4 ha implementato e validato l'intera pipeline di packaging automatizzata e riproducibile per Windows 11 x64, producendo l'installer definitivo in formato NSIS:
1. **Script PowerShell deterministico**: realizzazione di [`scripts/package-v6mini-windows.ps1`](file:///E:/Projects/vault_memai_obsi/scripts/package-v6mini-windows.ps1) con gestione errori vincolante (`$ErrorActionPreference = "Stop"`, verifica esplicita `$LASTEXITCODE -eq 0` per ciascuna fase nativa);
2. **Validazione e disponibilità strumenti**: installazione globale di `pnpm@12.6.0` per garantire che i comandi `beforeDevCommand` e `beforeBuildCommand` configurati in Tauri trovino l'eseguibile nei processi figli;
3. **Controllo isolamento risorse native**: verifica della presenza dei 20 componenti x64 Win32 in `resources/native-windows/` e dell'assenza totale di librerie o binari Mach-O Apple;
4. **Verifica bundle frontend di produzione**: build reale del client desktop Vite/React, controllo di integrità su `apps/desktop/dist/index.html` (escluso il segnaposto di fallback di `build.rs`, verificata inclusione asset JS/CSS e allineamento titolo a "LIMEN Vault v6Mini");
5. **Compilazione release e packaging NSIS**: compilazione completa del profilo release per `x86_64-pc-windows-msvc` e packaging NSIS (`currentUser`);
6. **Distribuzione e checksum**: collocazione dell'installer finale in `USER INSTALL WINDOWS/` e generazione di `SHA256SUMS.txt`.

---

## 2. Dettaglio delle Modifiche Apportate

### 2.1 Script di Packaging (`scripts/package-v6mini-windows.ps1`)
Creato lo script PowerShell conforme alle istruzioni di rilascio Windows, articolato in 6 passaggi sequenziali:
- **Passo 1**: Verifica versioni di Node (v24.14.0), pnpm (12.6.0), rustc (1.95.0 MSVC) e cargo (1.95.0);
- **Passo 2**: Controllo integrità risorse `resources/native-windows/` (verifica `llama-server.exe`, `llama.dll`, `ggml.dll`, `ggml-base.dll`, `mtmd.dll`, `ggml-vulkan.dll`, DLL CPU; asserzione su 0 residui `.dylib` o `.so`);
- **Passo 3**: Esecuzione build frontend Vite (`pnpm --filter @limen-vault/desktop build`);
- **Passo 4**: Validazione file `dist/index.html` (verifica dimensione > 200 byte, assenza stringa `<h1>LIMEN Vault</h1>`, presenza riferimenti bundle `assets/`);
- **Passo 5**: Compilazione e packaging Tauri: `pnpm --filter @limen-vault/desktop tauri build --bundles nsis --target x86_64-pc-windows-msvc --no-sign`;
- **Passo 6**: Rilevamento automatico dell'output NSIS, copia in `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` e calcolo hash SHA-256 su `SHA256SUMS.txt`.

### 2.2 Allineamento Titolo Applicazione (`apps/desktop/index.html`)
- Allineato il tag `<title>` del template HTML frontend da `LIMEN Vault V5` a `LIMEN Vault v6Mini`, garantendo coerenza di identità in tutto il bundle distribuito.

---

## 3. Validazione Esecutiva ed Evidenze

### 3.1 Esecuzione Packaging
La pipeline è stata eseguita con esito positivo:
```text
Finished `release` profile [optimized] target(s) in 7m 06s
Built application at: apps\desktop\src-tauri\target\x86_64-pc-windows-msvc\release\limen-vault.exe
Info Patching limen-vault.exe with bundle type information: nsis
Info Target: x64
Running makensis to produce bundle\nsis\LIMEN Vault v6Mini_0.6.0_x64-setup.exe
Finished 1 bundle at:
    bundle\nsis\LIMEN Vault v6Mini_0.6.0_x64-setup.exe
```

### 3.2 Scheda Artefatto Finale Rilasciato
* **File Installer**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)
* **Dimensione**: **19.007.431 byte**
* **Checksum SHA-256**:
  ```text
  2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092
  ```
* **File Checksum**: [`USER INSTALL WINDOWS/SHA256SUMS.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/SHA256SUMS.txt)
* **Metadati Binario Win32**:
  - `ProductName`: `LIMEN Vault v6Mini`
  - `FileVersion`: `0.6.0`
  - `ProductVersion`: `0.6.0`
  - `LegalCopyright`: `Copyright © 2026 Arkitecna Hong Kong Limited`
  - `InstallMode`: `currentUser` (installazione per-utente senza UAC)
* **Firma**: non firmato (`--no-sign`), esplicitamente dichiarato.

Evidenze complete archiviate in:
* [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-packaging-nsis.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-packaging-nsis.md)

---

## 4. Prossimi Passi (Fase 5)
* Commit atomico di Fase 4 eseguito (`325fdd9`).
* Avviare la **Fase 5**: Collaudo matrice 24 criteri su ambiente Windows isolato (installazione pulita dell'installer `.exe`, apertura vault di test, persistenza, OCR, ricerca semantica, assenza chiamate esterne).
