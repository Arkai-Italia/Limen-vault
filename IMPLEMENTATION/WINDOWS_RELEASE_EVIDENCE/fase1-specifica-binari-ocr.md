# Specifica Tecnica Binari OCR, Modelli Linguistici e Parità Piattaforme (Windows x64)

> **Data**: 29 settembre 2026  
> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Stato Parità Windows / macOS**: **APERTA** (Parità NON verificata; formati legacy DOC/RTF con residuo registrato)  
> **Vincolo Tassativo di Esecuzione**: Nessun utilizzo implicito di eseguibili o librerie presenti nel `%PATH%` di sistema. Tutti i componenti devono essere identificati esattamente per URL, versione/tag, hash crittografico, architettura, licenza e percorsi relativi espliciti conformi al futuro bundle Tauri (`resources/native/`).

---

## 1. Identificazione Esatta dei Binari e Dipendenze Native

### 1.1 Renderer PDF a Bitmap: PDFium (`pdfium.dll`)
* **Ruolo nel Sistema**: Rasterizzazione ad alta definizione (200–300 DPI) delle pagine PDF (scansionate o con immagini incorporate) in buffer bitmap RGBA/BGRA raw per l'alimentazione del motore OCR.
* **Distributore Ufficiale**: `bblanchon/pdfium-binaries` (pipeline di build automatica ufficiale e riproducibile dei sorgenti Google Chromium PDFium per tutte le piattaforme).
* **URL dell'Artefatto**: `https://github.com/bblanchon/pdfium-binaries/releases/download/chromium/8066/pdfium-win-x64.tgz`
* **Versione / Tag Esatto**: `chromium/8066` (PDFium versione `156.0.8066.0`), commit target `f2e9a1c45bb17b85b540abf1af30146ef65416ac`.
* **Dimensione Archivio**: `3.823.498` byte (~3.64 MB).
* **Impronta Crittografica SHA-256**:
  `739a57d597d864297909cc40a2411eba728490c76a0fa25e3ea299c7f6b07020`
* **Architettura**: `x86_64` (`x64`), linkata per Windows MSVC.
* **DLL e Dipendenze di Runtime Richieste**:
  * `bin/pdfium.dll` (DLL standalone, include il motore di rendering PDF completo).
  * Nessun runtime esterno non standard; compatibile con Microsoft Universal C Runtime (UCRT) presente in Windows 10/11.
* **Requisiti Minimi CPU**: Qualsiasi processore x86_64 (64-bit) conforme ai requisiti minimi di Windows 11.
* **Licenze e Avvisi per la Distribuzione**:
  * Licenza: **Chromium / PDFium License** (BSD 3-Clause con clausola brevetti Google e componenti Apache 2.0).
  * Avviso di attribuzione obbligatorio da includere in `THIRD_PARTY_LICENSES.txt`:
    `Copyright 2014 The Chromium Authors. All rights reserved.`

---

### 1.2 Motore OCR: Tesseract 5.4.0 + Leptonica 1.84.1
* **Ruolo nel Sistema**: Riconoscimento ottico dei caratteri su buffer bitmap di immagini isolate (PNG, JPG, TIFF, WebP), componenti grafici estratti da archivi Office (DOCX, PPTX) e pagine PDF rasterizzate.
* **Distributore Ufficiale**: UB-Mannheim (University Library of Mannheim / Stefan Weil, distributore ufficiale e canonical packager dei binari Windows per il progetto `tesseract-ocr`).
* **URL dell'Artefatto**: `https://github.com/UB-Mannheim/tesseract/releases/download/v5.4.0.20240606/tesseract-ocr-w64-setup-5.4.0.20240606.exe`
* **Versione / Tag Esatto**: `v5.4.0.20240606` (Tesseract `5.4.0`, Leptonica `1.84.1`, LibPNG `1.6.43`, LibTIFF `4.6.0`, Zlib `1.3.1`).
* **Dimensione Installer / Archivio**: `50.175.248` byte (~47.85 MB).
* **Impronta Crittografica SHA-256**:
  `ca20da481e56645ce0df9daeac272e013650d2856844ae8bd4bdff3020ff9fca`
* **Architettura**: `x86_64` (`win-x64`).
* **Binari e DLL Estratti per il Bundle**:
  * `tesseract.exe` (processo helper eseguito da Rust con `CREATE_NO_WINDOW`)
  * `tesseract54.dll`
  * `leptonica-1.84.1.dll`
  * Librerie di decodifica grafica collegate: `libpng16.dll`, `libjpeg-62.dll`, `libtiff-5.dll`, `libwebp-7.dll`, `zlib1.dll`.
  * Runtime richiesto: Microsoft Visual C++ 2015-2022 Redistributable (x64) o Universal CRT standard.
* **Requisiti Minimi CPU**: Standard x86_64 CPU. Il motore integra ottimizzazioni SIMD (AVX/AVX2) che vengono attivate a runtime se presenti sulla CPU dell'utente, con fallback deterministico su CPU standard.
* **Licenze e Avvisi per la Distribuzione**:
  * **Tesseract**: Apache License 2.0 (`Copyright 2018 Google LLC`).
  * **Leptonica**: BSD 2-Clause License (`Copyright Dan Bloomberg`).
  * **LibPNG**: PNG Reference Library License version 2.
  * **LibJPEG**: Independent JPEG Group (IJG) License.
  * **LibTIFF**: Silicon Graphics / Sam Leffler License (BSD-style).
  * **Zlib**: zlib License (`Jean-loup Gailly and Mark Adler`).
  Tutti i testi di licenza devono confluire nella documentazione delle terze parti dell'installer.

---

### 1.3 Modelli Linguistici: Tessdata (`ita.traineddata`, `eng.traineddata`)
* **Scelta della Distribuzione**: **`tessdata_fast`** (modelli LSTM a 8-bit interi).
  * **Motivazione Tecnica della Scelta**: Rispetto a `tessdata_best` (float32 ad alta precisione ma 4x più pesante in RAM e 3x più lento su CPU consumer senza GPU), la versione `tessdata_fast` è stata espressamente progettata da Google/Tesseract per l'integrazione desktop a risorse contenute. Fornisce un'accuratezza quasi identica sui testi a stampa di documenti e scansioni, con occupazione disco contenuta (~6.5 MB complessivi per italiano e inglese) e consumi di memoria minimi, preservando la RAM per il modello linguistico locale Ministral.
* **Distributore Ufficiale**: Repository ufficiale Google / Tesseract `tesseract-ocr/tessdata_fast`.
* **Tag Esatto**: `4.1.0` (commit `923915d4ced2a7235221788285785a29c4a42d4a`).
* **Dettaglio Modelli Selezionati**:
  1. **Italiano (`ita.traineddata`)**:
     * URL: `https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/ita.traineddata`
     * Dimensione: `2.701.314` byte (~2.58 MB)
     * Git Blob SHA-1: `edbffbe0e51892b240630b5eeabededa7e7c9c4f`
  2. **Inglese (`eng.traineddata`)**:
     * URL: `https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/eng.traineddata`
     * Dimensione: `4.113.088` byte (~3.92 MB)
     * Git Blob SHA-1: `bbef4675053b5b468cdb477053e28b1c698ba08e`
* **Collocazione nel Bundle**: `resources/tessdata/` all'interno della directory di installazione dell'app.
* **Licenza**: Apache License 2.0.

---

## 2. Matrice di Parità Formati Documentali: macOS vs Windows 11

| Formato Documentale | Implementazione macOS | Implementazione Proposta Windows 11 | Componente Tecnico | Stato Parità Funzionale |
|---|---|---|---|:---:|
| **PDF con Testo Vettoriale** | Apple PDFKit | Estrazione stream nativo testo | `pdf-extract` (Rust) | Copertura prevista; parità NON VERIFICATA |
| **PDF Scansionato (Raster)** | Apple Vision Framework | Rasterizzazione + OCR locale | `pdfium.dll` + `tesseract 5` | Copertura prevista; parità NON VERIFICATA |
| **PDF Misto (Testo + Immagini)** | Apple PDFKit + Vision | Estrazione vettoriale + OCR componenti grafici (deduplicazione) | `pdf-extract` + `pdfium` + `tesseract` | Copertura prevista; parità NON VERIFICATA |
| **Immagini Autonome (PNG/JPG)** | Apple Vision Framework | Decodifica bitmap + OCR | `image-rs` / Leptonica + `tesseract` | Copertura prevista; parità NON VERIFICATA |
| **Office Moderni (DOCX, PPTX)** | XML Parser + Vision per `media/` | ZIP XML parser + Tesseract per `media/` | Rust `zip`, `quick-xml`, `tesseract` | Copertura prevista; parità NON VERIFICATA |
| **Fogli di Calcolo (XLSX)** | Parser tabelle XML | Parser ZIP/XML tabellare | Rust `zip`, parser celle XML | Copertura prevista; parità NON VERIFICATA |
| **Formati Legacy: RTF** | `/usr/bin/textutil` (nativo macOS) | Nessun convertitore nativo su Windows. Richiede parser RTF dedicato o fallback. | Crate RTF dedicata (non ancora integrata) | **RESIDUO APERTO**: Parità NON SODDISFATTA |
| **Formati Legacy: DOC (Word 97-2004)** | `/usr/bin/textutil` (nativo macOS) | Nessun convertitore nativo su Windows. Struttura binaria complessa OLE2/CFBF. | Crate OLE2/CFBF dedicata (non ancora integrata) | **RESIDUO APERTO**: Parità NON SODDISFATTA |

### 2.1 Dichiarazione Formale sui Formati Legacy DOC e RTF
1. L'emissione di un avviso controllato (`"Formato legacy DOC/RTF non supportato"`) documenta l'assenza della funzionalità e ne preserva l'integrità senza crash, ma **non equivale al supporto del formato**.
2. Su macOS, `textutil` converte trasparentemente sia RTF che DOC in testo puro per l'indicizzazione.
3. Se i formati DOC e RTF non vengono dotati di un motore di estrazione effettivo su Windows prima del rilascio finale:
   - La parità tra le versioni Mac e Windows rimane **aperta e non conseguita** per questi due formati;
   - In conformità alle [Istruzioni Windows (linea 125)](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL/ISTRUZIONI_CODER_BUILD_WINDOWS.md#L125), una release con perimetro di formati ridotto richiederà l'autorizzazione e la decisione formale ed esplicita di Cesare.
