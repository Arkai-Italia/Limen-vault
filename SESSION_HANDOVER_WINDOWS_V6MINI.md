# Session Handover: LIMEN Vault v6Mini — Windows 11 x64 Release

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data Consegna**: 29 settembre 2026  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch Git**: `windows-build`  
> **Commit di Chiusura Release**: `41f0507`  
> **Stato Complessivo**: **INSTALLER PRODOTTO — ACCETTAZIONE DELLA RELEASE APERTA (IN ATTESA DI AUDIT)**

---

## 1. Executive Summary & Deliverables

La pipeline di porting, packaging e verifica a livello libreria/Rust per Windows 11 x64 di **LIMEN Vault v6Mini** (v0.6.0) ha prodotto l'installer NSIS di release. L'accettazione della release rimane formalmente **aperta**, in attesa dell'audit indipendente su evidenze e test e dell'esecuzione della lista unica di collaudi reali applicativi end-to-end.

### Pacchetto Rilasciato

* **Percorso Installer**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)
* **Dimensione**: **19.007.431 byte** (~18.1 MB)
* **Algoritmo & Checksum SHA-256**:
  ```
  2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092
  ```
* **File di Verifica Checksum**: [`USER INSTALL WINDOWS/SHA256SUMS.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/SHA256SUMS.txt)
* **Guida Utente e Istruzioni Installazione**: [`USER INSTALL WINDOWS/LEGGIMI_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LEGGIMI_WINDOWS.md)
* **Evidenze Collaudo Matrice 24 Criteri**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md)

---

## 2. Cronologia Commits per Fase

Come prescritto dalle regole di progetto (`AGENTS.md`), è stato eseguito **esattamente un commit atomico per fase**:

| Fase | Commit Hash | Messaggio di Commit | Walkthrough di Fase |
|:---:|:---:|:---|:---|
| **Fase 1** | [`08cdf03`](file:///E:/Projects/vault_memai_obsi) | `Fase 1: Core Rust Win32, sincronizzazione catalogo e spike OCR` | [`WALKTHROUGH_FASE1_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/WALKTHROUGH_FASE1_WINDOWS.md) |
| **Fase 2** | [`0213f6a`](file:///E:/Projects/vault_memai_obsi) | `Fase 2: Selezione binari llama.cpp x64, disaccoppiamento Metal e politica deterministica CPU/GPU Windows` | [`WALKTHROUGH_FASE2_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/WALKTHROUGH_FASE2_WINDOWS.md) |
| **Fase 3** | [`d136bb0`](file:///E:/Projects/vault_memai_obsi) | `Fase 3: Configurazione Tauri per piattaforma e disaccoppiamento risorse native Windows` | [`WALKTHROUGH_FASE3_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/WALKTHROUGH_FASE3_WINDOWS.md) |
| **Fase 4** | [`3f02ae5`](file:///E:/Projects/vault_memai_obsi) | `Fase 4: Script di packaging riproducibile e generazione installer NSIS Windows x64` | [`WALKTHROUGH_FASE4_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/WALKTHROUGH_FASE4_WINDOWS.md) |
| **Fase 5** | [`48e6022`](file:///E:/Projects/vault_memai_obsi) | `Fase 5: Collaudo matrice 24 criteri di accettazione su Windows x64` | [`WALKTHROUGH_FASE5_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/WALKTHROUGH_FASE5_WINDOWS.md) |
| **Fase 6** | [`41f0507`](file:///E:/Projects/vault_memai_obsi) | `Fase 6: Consegna finale e chiusura release Windows v6Mini (0.6.0)` | [`WALKTHROUGH_FASE6_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/WALKTHROUGH_FASE6_WINDOWS.md) |

---

## 3. Riepilogo Tecnico delle Fasi Eseguite

### Fase 0 — Ricognizione Ambiente
- Verificato ambiente host: Node v24.14.0, Rust 1.95.0 MSVC toolchain, Windows 11 Build 26100 (64-bit), Microsoft Edge WebView2 runtime `153.0.4234.48`.
- Evidenze: `IMPLEMENTATION/WINDOWS_BUILD_EVIDENCE/fase0-ricognizione-ambiente.txt`.

### Fase 1 — Core Rust, Manifest Win32 & Spike OCR
- Rilevamento memoria fisica Win32 reale tramite API `GlobalMemoryStatusEx` (non hardcoded, 31.96 GB host rilevati).
- Manifest dell'applicazione con abilitazione esplicita Common Controls 6.0 (`comctl32.dll`) per rendering nativo controlli Windows 11.
- Pipeline di estrazione parziale con contratti `ExtractionOutput`, flag `is_partial`, warning diagnostici, badge UI ed eliminazione regressioni in catalog sync.
- Spike OCR completato e superato con 10 unit test su 5 fixture reali (PDF, PNG, JPG, TIFF, DOCX). Residuo formati legacy DOC/RTF formalmente censito come non bloccante.

### Fase 2 — llama.cpp x64 & Politica CPU/GPU Windows
- Selezionata e validata build llama.cpp Build 8477 x64 (Clang MSVC).
- Disaccoppiato totalmente il supporto Apple Metal (`libggml-metal.so`) circoscritto unicamente a macOS.
- Politica deterministica: CPU sicura di default (`-ngl 0`), con override utente tramite variabile d'ambiente `LIMEN_GPU_NGL`.
- Flag `CREATE_NO_WINDOW` (`0x08000000`) impostato per tutti i sottoprocessi figli (`llama-server.exe`) per evitare pop-up prompt DOS.
- Coesistenza dinamica dei port loopback (embedding bge-m3 su 127.0.0.1 dinamico + Ministral su porta distinta) senza collisioni, verificata da 57 unit test.

### Fase 3 — Configurazione Tauri per Piattaforma & Isolamento Risorse
- Disaccoppiate le configurazioni in `tauri.windows.conf.json` (target `nsis`, installer per-utente `currentUser`) e `tauri.macos.conf.json` (`dmg`).
- Creata cartella isolata `resources/native-windows/` contenente i 20 componenti nativi x64 (binari `llama-server.exe`, DLL runtime, modelli e vocabolari).
- Esclusione al 100% di file Apple (.dylib, Mach-O, `.DS_Store`).

### Fase 4 — Pipeline Packaging Riproducibile NSIS
- Installato globalmente `pnpm@12.6.0` per risoluzione child-process da parte di Tauri CLI.
- Creato script di automazione [`scripts/package-v6mini-windows.ps1`](file:///E:/Projects/vault_memai_obsi/scripts/package-v6mini-windows.ps1) con controlli d'uscita rigorosi (`$LASTEXITCODE -eq 0`).
- Build frontend di produzione verificata: bundle Vite reale in `apps/desktop/dist/index.html` (477 byte, JS minificato in `assets/index-BzskkXDT.js`, titolo allineato a `LIMEN Vault v6Mini`).
- Compilazione release e bundling NSIS completati con successo in 7m 06s, generando `LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` (19.007.431 byte).

### Fase 5 — Collaudo Matrice dei 24 Criteri di Accettazione
- Suite Rust `cargo test --lib` eseguita: **243 test passati, 0 falliti, 2 ignorati** (i 2 test di download GGUF reale).
- Roundtrip credenziali Windows Credential Manager (`CredWriteW`/`CredReadW`/`CredDeleteW`) verificato con successo.
- Metadati PE verificati (`ProductName: LIMEN Vault v6Mini`, `ProductVersion: 0.6.0`, `CompanyName: Arkitecna Hong Kong Limited`).
- Stato firma Authenticode censito come `NotSigned` e documentato in modo trasparente.
- Corrispondenza crittografica SHA-256 verificata al 100%.

### Fase 6 — Consegna Finale & Chiusura Release
- Redatto [`USER INSTALL WINDOWS/LEGGIMI_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LEGGIMI_WINDOWS.md) per l'utente finale.
- Allineati `TASK_LIST.md`, `TODO LIST.TXT` e l'artifact del piano di implementazione.
- Preservati tutti gli asset preesistenti e le patch storiche.

---

## 4. Conformità alle Regole di Progetto (`AGENTS.md`)

| Regola | Esito | Dettaglio / Evidenza |
|:---|:---:|:---|
| **Nessuna chiamata a OpenAI** | RISPETTATA | Nessuna chiamata di rete esterna o a OpenAI; usati solo mock su loopback locale `127.0.0.1`. |
| **Nessuna scrittura in modelli/vault utente** | RISPETTATA | Zero scritture in `C:\Users\user\LIMEN Vault\models\`, `C:\Users\user\.limen-vault\` o nel vault reale. |
| **Nessuna chiusura processi non propri** | RISPETTATA | Nessun `Stop-Process` o `taskkill` arbitrario; nessun processo estraneo terminato. |
| **Nessun llama-server lasciato attivo** | RISPETTATA | Verificata l'assenza di processi orfani al termine dei test. |
| **Dati grezzi verificati** | RISPETTATA | Checksum, conteggi test (243/243) e byte (19.007.431) estratti direttamente dagli output di sistema. |
| **Esattamente un commit per fase** | RISPETTATA | 6 commit lineari (`08cdf03`, `0213f6a`, `d136bb0`, `3f02ae5`, `48e6022`, `52f60b4`). |
| **Walkthrough salvati in root e artifacts** | RISPETTATA | Generati `WALKTHROUGH_FASE1_WINDOWS.md` ... `FASE6_WINDOWS.md` in root e artifact `walkthrough.md`. |

---

## 5. Istruzioni per Cesare: Come Avviare e Provare la Release

1. **Installazione Utente**:
   Eseguire con doppio clic:
   [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)
   - L'installer si installa in `%LOCALAPPDATA%\Programs\LIMEN Vault v6Mini` senza richiedere privilegi di amministratore UAC.
   - All'avviso Microsoft Defender SmartScreen ("PC protetto da Windows"), cliccare su **"Ulteriori informazioni"** e poi su **"Esegui comunque"**.

2. **Avvio Diretto in Modalità Sviluppo Ottimizzata** (se desiderato):
   ```powershell
   cd "E:\Projects\vault_memai_obsi"
   npx pnpm --filter @limen-vault/desktop tauri dev --release
   ```
   (La cache di compilazione Rust è già calda e pronta).
