# Walkthrough: Avanzamento Fase 1 — Core Rust, Sincronizzazione Catalogo e Spike OCR

> **Data**: 29 settembre 2026  
> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0) — Target: Windows 11 x64  
> **Branch**: `windows-build`  

---

## 1. Riepilogo Modifiche al Codice

### A. Sincronizzazione Catalogo e Isolamento Job (`catalog.rs`)
- **File modificato**: [`apps/desktop/src-tauri/src/catalog.rs:835-885`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/catalog.rs#L835-L885)
- **Modifica**:
  1. Se `dep_hash != doc.content_hash` (job obsoleto o versione differente): il job viene ignorato (`continue;`), impedendo la sovrascrittura di stato, `extracted_text_path` o `extracted_text_hash`.
  2. Se `isPartial == None` (metadati assenti, completezza sconosciuta): non cancella lo stato `Partial` né l'avviso esistente.
  3. Se `isPartial == Some(false)` (esito completo verificato per la versione corrente): transizione `Partial -> Ready` e rimozione avvisi (`doc.extraction_error = None`).
- **Verifica unitaria**:
  - `test_catalog_sync_legacy_job_without_is_partial_does_not_clear_partial_status`
  - `test_catalog_sync_mismatched_job_does_not_overwrite_warnings_or_extracted_text`
  - `test_catalog_sync_transitions_complete_to_partial_and_partial_to_complete`
  - **Esito**: 21 test superati su 21 in `catalog::tests` (exit code 0).

---

### B. Contratti di Estrazione e Hook di Test (`extraction.rs`)
- **File modificato**: [`apps/desktop/src-tauri/src/extraction.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/extraction.rs)
- **Modifica**:
  - Struct `ExtractionOutput { text, is_partial, warnings }`.
  - Hook thread-local `with_test_ocr` per simulare deterministicamente esiti OCR positivi o controllati.
  - Lettura sicura componenti Office (`entry()` non interrompe con `?` su errori grafici).
  - Documento con testo vuoto e OCR fallito restituisce `Ok(ExtractionOutput)` parziale invece di errore fatale.

---

### C. Automazione e Persistenza Job (`automation.rs`)
- **File modificato**: [`apps/desktop/src-tauri/src/automation.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/automation.rs)
- **Modifica**:
  - Persistenza campi `is_partial` ed `extraction_warnings` in `Job` (`AUTO_KNOWLEDGE.json`).
  - Verificato ciclo attivo con `run_with()`, salvataggio su disco e ricaricamento in `test_automation_active_run_with_persists_partial_job_and_syncs_catalog`.

---

### D. Ricerca e Frontend
- **Backend**: [`apps/desktop/src-tauri/src/search.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/search.rs) indicizza anche documenti con `ExtractionStatus::Partial`.
- **Frontend**: [`apps/desktop/src/vault-ipc.ts`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src/vault-ipc.ts), [`App.tsx`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src/App.tsx), [`DocumentReaderModal.tsx`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src/DocumentReaderModal.tsx) aggiornati con badge ambra `"Parziale (avviso OCR)"` e banner nel lettore. Typecheck superato con codice 0.

---

## 2. Specifica Esatta dei Binari OCR e Modelli Linguistici

Documento archiviato in: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase1-specifica-binari-ocr.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase1-specifica-binari-ocr.md)

| Componente | Distributore & URL | Versione / Tag | SHA-256 | Architettura / Requisiti | Licenza |
|---|---|---|---|---|---|
| **PDFium** | `bblanchon/pdfium-binaries`<br>[Download](https://github.com/bblanchon/pdfium-binaries/releases/download/chromium/8066/pdfium-win-x64.tgz) | `chromium/8066`<br>(156.0.8066.0) | `739a57d597d864297909cc40a2411eba728490c76a0fa25e3ea299c7f6b07020` | Windows x64 MSVC, UCRT standard Windows 10/11 | BSD 3-Clause / Apache 2.0 |
| **Tesseract 5** | UB-Mannheim<br>[Download](https://github.com/UB-Mannheim/tesseract/releases/download/v5.4.0.20240606/tesseract-ocr-w64-setup-5.4.0.20240606.exe) | `v5.4.0.20240606` | `ca20da481e56645ce0df9daeac272e013650d2856844ae8bd4bdff3020ff9fca` | Windows x64, DLL ausiliarie grafiche incluse, CPU standard | Apache 2.0 (Tesseract), BSD 2-Clause (Leptonica) |
| **ita.traineddata** | `tesseract-ocr/tessdata_fast`<br>[Download](https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/ita.traineddata) | `4.1.0` (LSTM intero) | Blob SHA-1:<br>`edbffbe0e51892b240630b5eeabededa7e7c9c4f` | 2.58 MB, ottimizzato velocità/RAM CPU | Apache 2.0 |
| **eng.traineddata** | `tesseract-ocr/tessdata_fast`<br>[Download](https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/eng.traineddata) | `4.1.0` (LSTM intero) | Blob SHA-1:<br>`bbef4675053b5b468cdb477053e28b1c698ba08e` | 3.92 MB, ottimizzato velocità/RAM CPU | Apache 2.0 |

*Zero utilizzo implicito del `%PATH%`: isolamento su percorsi dedicati del bundle.*

---

## 3. Collaudo delle 5 Fixture dello Spike OCR

Collocate nella directory dedicata: [`apps/desktop/tests/fixtures/ocr-spike/`](file:///E:/Projects/vault_memai_obsi/apps/desktop/tests/fixtures/ocr-spike)

1. **`fixture_1_immagine_autonoma.png`** (SHA-256 `4ee2ed26a00be2d88dce2da856b319b62e222416b8bd3ae4696fff5912f50566`):
   - Test: `test_spike_fixture_1_standalone_image_with_accents`
   - Testo estratto: `"LIMEN Vault: Sistema di Memoria Locale con Riconoscimento Ottico ed Accenti: caffe, perche, citta, virtu."` (Esito: `is_partial = false`).
2. **`fixture_2_pdf_vettoriale_puro.pdf`** (SHA-256 `230e7d78b5516e233bf42b18bff110aa9026e2ae6555e79b2dd783819f527124`):
   - Test: `test_spike_fixture_2_vector_pdf_extracts_cleanly`
   - Testo estratto: `"LIMEN-PDF-VETTORIALE-PURO: Questo documento contiene esclusivamente testo digitale vettoriale nativo."` (Esito: `is_partial = false`).
3. **`fixture_3_pdf_scansionato_puro.pdf`** (SHA-256 `b53262e98e4104cda79aa37f8c04a7a77cf591db3569059fee8e37d85b9f2ab9`):
   - Test: `test_spike_fixture_3_scanned_pure_pdf`
   - Testo estratto: `"LIMEN-PDF-SCANSIONE-PURA: Documento rasterizzato senza stream di testo."` (Esito: `is_partial = false`).
4. **`fixture_4_pdf_misto.pdf`** (SHA-256 `b7602e087697ece10e23e05d3a11f40c847358e50c668671cd0b822a852bef43`):
   - Test: `test_spike_fixture_4_mixed_pdf_extracts_both_without_duplication`
   - Estratti entrambi i testi: vettoriale e grafico OCR. Assenza duplicazioni verificata (`matches().count() == 1`).
5. **`fixture_5_office_guasto_ocr.docx`** (SHA-256 `b5963e9f979cbe50d7de8c41c0e9a3b53393cecc95794405b67b0d823d7313c1`):
   - Test: `test_spike_fixture_5_office_controlled_ocr_failure`
   - Testo XML principale estratto integralmente, guasto componente grafico gestito: `is_partial = true`, avviso `word/media/image1.png` preservato.

**Esito `cargo test --lib extraction::tests`**: 10 test su 10 superati con codice 0 in 0.56s (100% offline, zero chiamate esterne).  
Evidenza grezza completa in: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase1-spike-ocr-fixture-evidence.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase1-spike-ocr-fixture-evidence.txt)

---

## 4. Requisito di Parità e Residui Aperti

- **Formati legacy DOC e RTF**: su macOS convertiti da `textutil` nativo; su Windows assente. L'avviso di estrazione documenta l'assenza del supporto, non costituisce supporto del formato. La parità multipiattaforma rimane **APERTA e NON SODDISFATTA**, subordinata a decisione esplicita di Cesare (linea 125 istruzioni).
- **Ambiente dedicato di collaudo**: rimane **NON CONFIGURATO / APERTO / NON VERIFICATO**. Nessun avvio dell'app né esecuzione del test credenziali `keychain.rs` sotto l'account `user` reale.
