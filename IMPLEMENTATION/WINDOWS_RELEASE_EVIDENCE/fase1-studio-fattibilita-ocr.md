# Studio di Fattibilità Tecnica: OCR Locale e Pipeline Documentale Windows 11 x64

> **Data**: 29 settembre 2026  
> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Destinazione**: Distribuzione NSIS `.exe` per Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Obiettivo**: Raggiungere la parità funzionale con il framework Apple Vision di macOS in modalità 100% offline, senza dipendenze cloud o prerequisiti globali sul PC dell'utente.

---

## 1. Analisi Comparativa dei Motori OCR per Windows 11 x64

### Opzione A: `Windows.Media.Ocr` (WinRT / Windows App SDK)
* **API Documentata**: [`Windows.Media.Ocr.OcrEngine`](https://learn.microsoft.com/en-us/uwp/api/windows.media.ocr)
* **Requisito di Package Identity**:
  * Microsoft documenta `Windows.Media.Ocr` come parte delle API UWP/WinRT che richiedono *Package Identity* per il corretto funzionamento di gestione risorse e Language Pack nelle applicazioni desktop.
  * In un packaging **NSIS standard** (`.exe` Win32 puro), l'applicazione è *unpackaged*. L'attribuzione di un'identità di pacchetto richiederebbe la registrazione di uno *Sparse Package* (tramite API Win32 `AddPackageByUriAsync` o registrazioni manifest esterne), introducendo complessità elevate nell'installer e potenziali fallimenti se l'utente non ha privilegi o su edizioni Windows restrittive.
  * Un wrapper C++/WinRT o invocazioni da Rust tramite la crate `windows` non aggirano, di per sé, questo requisito architetturale.
* **Dipendenza dai Language Pack del Sistema Operativo**:
  * `OcrEngine.IsLanguageSupported(Language)` e `TryCreateFromLanguage(Language)` dipendono dalla presenza della Feature on Demand (FOD) "Optical Character Recognition" installata nel sistema operativo Windows per quella specifica lingua.
  * **Problema critico**: Non è possibile garantire a priori che i pacchetti OCR per l'italiano (`it-IT`) siano preinstallati su un'installazione Windows 11 pulita (es. edizioni Enterprise, N, o sistemi configurati solo con lingua base inglese). Sebbene DISM consenta il provisioning offline specificando una sorgente locale con `/Source` e l'opzione `/LimitAccess` (senza richiedere necessariamente la rete, come documentato da Microsoft), tale operazione richiede privilegi elevati di amministratore e supporti locali di installazione non disponibili per un setup utente standard.
* **Formato di Input**:
  * `OcrEngine.RecognizeAsync` accetta esclusivamente un oggetto `SoftwareBitmap`. Non accetta flussi di byte raw né formati PDF.
* **Valutazione di Fattibilità**: **NON RACCOMANDATA / RISCHIOSA per packaging NSIS** a causa dell'assenza nativa di package identity e dell'onere di provisioning dei Language Pack a livello di sistema operativo.

---

### Opzione B: Motore OCR Standalone Embedded — `Tesseract 5.x` + `Leptonica` (Proposta da convalidare)
* **Architettura**:
  * Motore C++ nativo Win32 puro, compilato staticamente o distribuito tramite singola DLL x64 (`tesseract53.dll` / `leptonica.dll` o binary helper dedicato).
  * Invocabile direttamente da Rust tramite binding FFI (`tesseract-rs` / `lept-rs`) o tramite processo helper interno eseguito con `CREATE_NO_WINDOW`.
* **Package Identity**:
  * **Zero requisiti di package identity**. Compatibilità 100% nativa con qualsiasi packaging Win32, compreso l'installer NSIS.
* **Disponibilità Lingue e Funzionamento Offline**:
  * I file di addestramento linguistico Tesseract (`tessdata_fast` o `tessdata_best`, es. release ufficiale `tesseract-ocr/tessdata_fast`):
    * `ita.traineddata` (~4.5 MB)
    * `eng.traineddata` (~4.1 MB)
  * Vengono inclusi direttamente nella cartella delle risorse dell'applicazione (`resources/tessdata/`).
  * Funzionamento offline da verificare sulla distribuzione selezionata, senza dipendere da componenti opzionali o configurazioni linguistiche dell'OS host.
* **Licenze e Dipendenze**:
  * `Tesseract`: licenza **Apache 2.0**.
  * `Leptonica`: licenza **BSD 2-Clause**.
  * Entrambe le licenze sono permissive e compatibili con il progetto.
* **Formati di Input**:
  * Tramite Leptonica (`pixReadMem`), legge direttamente buffer di memoria raw di immagini PNG, JPEG, TIFF, BMP, WebP.
* **Valutazione di Fattibilità**: **PROPOSTA RACCOMANDATA PER LO SPIKE**. Risolve i vincoli di package identity ed elimina le dipendenze da Feature on Demand dell'OS host.

---

## 2. Pipeline di Rendering da PDF a Bitmap (Rasterizzazione)

Nessun motore OCR (né WinRT né Tesseract) legge direttamente i byte di un documento PDF: entrambi elaborano bitmap. Per consentire l'OCR di PDF scansionati o misti su Windows:

1. **Valutazione di `pdf-extract`**:
   * `pdf-extract` (crate Rust) estrae esclusivamente il testo vettoriale già codificato come font/caratteri all'interno del PDF.
   * Su PDF scansionati (immagini scannerizzate inserite in pagine PDF senza testo vettoriale), `pdf-extract` restituisce stringa vuota o fallisce. Non è quindi sufficiente da sola per la parità con macOS.
2. **Soluzione per la Rasterizzazione: `pdfium` (`pdfium-render`)**:
   * Binding Rust: crate `pdfium-render` (licenza Apache 2.0 / MIT). **Nota di licenza**: la crate Rust non include i binari nativi di PDFium e rimanda a distribuzioni esterne.
   * Binario motore nativo: distribuzione precompilata x64 di Google Chromium PDFium (es. release ufficiali verificate `bblanchon/pdfium-binaries` per Windows x64 MSVC), distribuita sotto licenza Chromium/PDFium (Apache 2.0 / BSD 3-Clause).
   * Capacità:
     * Caricamento documento da memoria (`Pdfium::load_pdf_from_byte_slice`);
     * Scansione pagina per pagina;
     * Rendering a risoluzione configurabile (es. 200–300 DPI per OCR ottimale) in buffer bitmap RGBA;
     * Passaggio diretto del buffer bitmap a Leptonica/Tesseract per l'estrazione OCR del testo.
3. **Pipeline Completa Ibrida per PDF**:
   - Se il PDF contiene testo vettoriale leggibile: estrazione rapida nativa.
   - Per pagine scansionate o immagini prive di testo incorporato: rasterizzazione con PDFium ➔ OCR con Tesseract locale (tessdata `ita` + `eng`).
   - Fusione coerente del testo strutturato con indicazione dei numeri di pagina.
   - **Caso PDF misti**: se una pagina contiene testo vettoriale e una figura/scansione incorporata con testo differente, la pipeline deve estrarre il testo vettoriale E processare con OCR la parte grafica, evitando duplicazioni o salti dell'OCR.

---

## 3. Gestione Formati Documentali e Parità macOS

| Formato | Comportamento macOS | Soluzione Tecnica Windows 11 | Componente / Crate | Licenza | Stato Parità |
|---|---|---|---|---|:---:|
| **PDF (testuale)** | Swift PDFKit | Estrazione nativa stream testo | `pdf-extract` / `pdfium` | Apache 2.0 | Copertura prevista; parità NON VERIFICATA |
| **PDF (scansione/misto)** | Vision OCR | Rasterizzazione + OCR locale | `pdfium.dll` + `tesseract53.dll` | Apache 2.0 / BSD | Copertura prevista; parità NON VERIFICATA |
| **Immagini autonome**<br>*(PNG, JPG, WebP, TIF)* | Vision OCR | Decodifica bitmap + OCR | `leptonica` / `image-rs` + Tesseract | Apache 2.0 / BSD | Copertura prevista; parità NON VERIFICATA |
| **DOCX, PPTX, ODT** | XML + Vision OCR | XML parser + OCR immagini isolato | Decompressione ZIP, parser XML, Tesseract per `media/` | Permissiva | Copertura prevista; parità NON VERIFICATA |
| **XLSX** | Parser fogli | Tabelle e celle native | Parser ZIP/XML tabellare | Permissiva | Copertura prevista; parità NON VERIFICATA |
| **RTF** | macOS `textutil` | Parser RTF nativo multipiattaforma | Crate Rust `rtf-parser` / extractor | MIT / Apache 2.0 | Copertura prevista; parità NON VERIFICATA |
| **DOC (legacy binario)** | macOS `textutil` | Estrattore binario OLE2 DOC | Parser OLE2/CFBF con fallback | MIT / Apache 2.0 | Copertura prevista; parità NON VERIFICATA |

---

## 4. Prove Tecniche Pianificate prima dell'Integrazione (Spike Eseguibile)
1. **Spike Standalone Binari**:
   * Verifica DLL x64 di `pdfium` (`bblanchon/pdfium-binaries` tag fissato) e `tesseract 5` con dizionari `ita` ed `eng`.
   * Verifica esecuzione senza finestra console (`CREATE_NO_WINDOW`).
   * Test OCR a riga di comando su una fixture isolata con:
     * Un'immagine PNG con testo italiano e accenti;
     * Un PDF scansionato (solo immagine);
     * Un documento DOCX contenente testo e un'immagine con testo.
2. **Verifica Licenze**: Confermata la compatibilità (Apache 2.0 per Tesseract e PDFium, BSD per Leptonica, Apache/MIT per pdfium-render).
3. **Verifica Assenza Dipendenze OS**: I binari e i dizionari risiederanno interamente in `resources/native/` nel bundle Tauri NSIS, senza richiedere runtime esterni o diritti di amministratore.
