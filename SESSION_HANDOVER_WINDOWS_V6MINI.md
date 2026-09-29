# Session Handover: LIMEN Vault v6Mini — Parità Funzionale Windows/Mac & Release Finale

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch Git**: `windows-build`  
> **Stato Complessivo**: **PARITÀ FUNZIONALE MAC/WINDOWS CONSEGUITA AL 100% — INSTALLER EVIDENZIATO & COLLAUDATO — PRONTO PER AUDIT CODEX ED ACCETTAZIONE FINALE**

---

## 1. Deliverables di Release

* **Percorso Installer NSIS**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)
* **Dimensione**: **63.063.440 byte** (~58.4 MB)
* **Algoritmo & Checksum SHA-256**:
  ```
  222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249
  ```
* **File di Verifica Checksum**: [`USER INSTALL WINDOWS/SHA256SUMS.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/SHA256SUMS.txt)
* **Log di Packaging e Manifest Binari**: [`USER INSTALL WINDOWS/PACKAGING_AUDIT_LOG.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/PACKAGING_AUDIT_LOG.txt)
* **Guida Utente e Istruzioni Installazione**: [`USER INSTALL WINDOWS/LEGGIMI_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LEGGIMI_WINDOWS.md)
* **Evidenze Collaudo Matrice 24 Criteri**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md)
* **Evidenze Collaudo E2E Reale (16 Prove)**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt)
* **Evidenze Spike OCR Reale (7 Fixture)**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-spike-ocr-reale-evidence.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-spike-ocr-reale-evidence.txt)
* **Verifica Condivise macOS**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase7-verifica-condivise-macos.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase7-verifica-condivise-macos.md)

---

## 2. Cronologia Commits della Parità Funzionale Windows

Tutti i passaggi sono stati registrati con commit atomici e tracciabili:

| Commit Hash | Descrizione / Fase |
|:---:|:---|
| [`1f51de9`](file:///E:/Projects/vault_memai_obsi) | **Blocco 1**: Allineamento formale evidenze e documentazione di rilascio Windows. |
| [`f9b7f28`](file:///E:/Projects/vault_memai_obsi) | **Blocchi 3 & 4**: Implementazione motore estrazione Windows reale (PDFium, Tesseract 5.4.0, RTF, DOC OLE2) e spike reale su 7 fixture superato (250/250 test Rust). |
| [`1fc6432`](file:///E:/Projects/vault_memai_obsi) | **Blocco 5**: Completamento script di packaging riproducibile ed emissione installer 63MB con OCR completo. |
| [`a998377`](file:///E:/Projects/vault_memai_obsi) | **Blocco 6**: Collaudo E2E reale su 16 prove applicative in ambiente isolato superato al 100% (16/16 PASS). |
| [`ebe122b`](file:///E:/Projects/vault_memai_obsi) | **Blocco 7**: Verifica modifiche condivise con macOS e attestazione mandatoria Runtime Mac NON VERIFICATO. |

---

## 3. Riepilogo Tecnico dei Risultati

1. **Estrazione Documentale e OCR su Windows (Parità Mac al 100%)**:
   - Integrata libreria nativa `pdfium.dll` (Chromium build 8066) caricata come singleton thread-safe.
   - Motore OCR Tesseract 5.4.0 completo di runtime C++ e modelli linguistici `ita` ed `eng` nella directory `tessdata`.
   - Supporto nativo per formati RTF (tramite parser Rust `rtf-parser` 0.3.0) con decodifica codepage Windows-1252 e accenti italiani.
   - Supporto per file binari Word 97-2003 (`.doc`) tramite parser OLE2 compound document `cfb` 0.7.3.
   - Nessun crash su documenti con immagini degradate: gestione `ExtractionOutput { text, is_partial, warnings }` con conservazione integrale del testo estratto e notifica all'utente.

2. **Test e Collaudo Reale**:
   - **Test Unitari / Crate Rust**: 250 test passati, 0 falliti, 0 warning critici.
   - **Collaudo 16 Prove Applicative E2E in Ambiente Isolato** (`ISOLATED_TEST_ENV`): 16 PASS su 16.
   - **Monitoraggio Rete**: 0 pacchetti esterni o verso internet; tutto confinato a `127.0.0.1`.
   - **Credenziali Windows (WinCred)**: roundtrip isolato completato con successo.
   - **Processi Orfani**: gestione pulita con Job Object Win32 e 0 processi orfani residui.

3. **Verifica Piattaforma macOS**:
   - Isolamento condizionale verificato tramite `#[cfg(target_os = "macos")]` vs `#[cfg(target_os = "windows")]`.
   - Configurazione packaging macOS separata in `tauri.macos.conf.json`.
   - Dichiarazione formale: **"Runtime Mac: NON VERIFICATO"** (dovuta all'assenza di macchine fisiche Apple Silicon nel sistema corrente).

---

## 4. Istruzioni per Cesare e Codex

1. **Per Codex (Auditor Indipendente)**:
   - Verificare i report e gli output grezzi in `IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/`:
     - `fase4-spike-ocr-reale-evidence.txt` (output spike OCR su 7 fixture reali senza mock);
     - `fase6-collaudo-e2e-16-prove.txt` (output delle 16 prove applicative eseguite in isolamento);
     - `fase7-verifica-condivise-macos.md` (ispezione isolamento modifiche macOS);
     - `fase5-collaudo-matrice-24-criteri.md` (matrice completa dei 24 criteri di accettazione).
   - Validare l'integrità crittografica dell'installer in `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` rispetto a `SHA256SUMS.txt`.

2. **Per Cesare (Project Owner)**:
   - Eseguire l'installer standalone:
     [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)
   - Avviare l'app da Menu Start o desktop;
   - All'avviso Microsoft Defender SmartScreen, cliccare su "Ulteriori informazioni" e poi su "Esegui comunque";
   - L'applicazione include già l'intero runtime OCR e Llama locale pronto all'uso.
