# Verifica Modifiche Condivise con macOS (Fase 7)

> **Data collaudo**: 2026-09-29  
> **Oggetto**: Ispezione statica e verifica isolamento architetturale delle modifiche condivise rispetto a macOS.  
> **Dichiarazione Mandatoria**: **Runtime Mac: NON VERIFICATO** (ambiente di lavoro Windows 11 x64 privo di hardware fisico macOS / runtime Darwin ARM64).

---

## 1. Perimetro delle Modifiche Condivise

L'analisi differenziale (`git diff origin/windows-build..HEAD`) ha identificato gli interventi sui seguenti file condivisi o multipiattaforma:

| File | Modifica Applicata | Meccanismo di Isolamento | Impatto macOS |
|---|---|---|---|
| `apps/desktop/src-tauri/Cargo.toml` | Aggiunte dipendenze pure Rust `rtf-parser = "0.3.0"` e `cfb = "0.7.3"`. | Nessun legame con API di sistema; codice Rust safe standard. | Neutro / Compilabile su Mac. |
| `apps/desktop/src-tauri/build.rs` | Verifica risorse native Windows condizionata. | `#[cfg(target_os = "windows")]` | Zero impatto su Mac. |
| `apps/desktop/src-tauri/src/extraction.rs` | Introduzione di `ExtractionOutput { text, is_partial, warnings }`, supporto `is_partial` negli Office e disaccoppiamento `vision_impl()`. | `#[cfg(target_os = "macos")]` per helper `limen-vision-ocr` e `textutil`; `#[cfg(target_os = "windows")]` per `win_ocr`. | Retrocompatibile: arricchisce l'estrazione Office senza alterare l'helper Mac. |
| `apps/desktop/src-tauri/src/llama.rs` | Disaccoppiamento `libggml-metal.so` e refactoring `build_embedding_server_args`. | `#[cfg(target_os = "macos")]` per l'impostazione di `GGML_BACKEND_PATH`. | Piena preservazione della logica Metal su Mac. |
| `apps/desktop/src-tauri/src/catalog.rs` | Introduzione variante `ExtractionStatus::Partial`. | Modifica all'enum Rust serializzata in JSON. | Retrocompatibile. |
| `apps/desktop/src-tauri/src/search.rs` | Inclusione dei documenti con stato `Partial` nell'indice di ricerca. | Logica pure-Rust agnostica rispetto al sistema operativo. | Beneficio condiviso anche su Mac. |
| `apps/desktop/src-tauri/tauri.conf.json` | Separazione config: `tauri.macos.conf.json` e `tauri.windows.conf.json`. | Configurazione Windows applicata in fase di build NSIS via merge JSON. | Configurazione macOS intatta in `tauri.macos.conf.json`. |
| `apps/desktop/src/vault-ipc.ts` | Aggiunta tipo `'partial'` a `ExtractionStatus`. | TypeScript type definition. | Piena compatibilità con l'UI Mac. |
| `apps/desktop/src/App.tsx` & `DocumentReaderModal.tsx` | Badge visivo `Parziale (avviso OCR)` e alert banner per errori di OCR incorporato. | React components. | Esperienza utente migliorata su entrambe le piattaforme. |

---

## 2. Dettaglio Tecnico dell'Isolamento Piattaforma

### 2.1 Motore di Estrazione (`extraction.rs`)
Nel codice macOS originale, `vision()` invocava direttamente il binario `limen-vision-ocr` e i file `.doc` / `.rtf` venivano convertiti tramite l'utility di sistema Darwin `/usr/bin/textutil`.
Con il refactoring:
- Le chiamate specifiche a `limen-vision-ocr` e `textutil` sono state incapsulate sotto `#[cfg(target_os = "macos")]`.
- Su Windows, `#[cfg(target_os = "windows")]` instrada le chiamate verso il nuovo modulo `win_ocr.rs` (PDFium per rasterizzazione/estrazione vettoriale, Tesseract 5.4.0 per OCR, `rtf-parser` e `cfb` per OLE2 DOC).
- Per qualsiasi altro sistema operativo non supportato, è presente un fallback sicuro `#[cfg(not(any(target_os = "macos", target_os = "windows")))]` che restituisce errore esplicito senza causare panic.

### 2.2 Server Llama Locale (`llama.rs`)
La variabile d'ambiente `GGML_BACKEND_PATH` puntata su `libggml-metal.so` causava errori su Windows. L'intervento ha applicato:
```rust
#[cfg(target_os = "macos")]
{
    let metal = parent.join("libggml-metal.so");
    if metal.is_file() {
        cmd.env("GGML_BACKEND_PATH", metal);
    }
}
```
In questo modo su macOS il caricamento del backend Metal Apple Silicon è preservato al 100%, mentre su Windows viene omesso garantendo l'esecuzione CPU nativa deterministica.

### 2.3 Risorse di Packaging (`tauri.conf.json`)
Sono state istituite due configurazioni distinte:
1. `apps/desktop/src-tauri/tauri.macos.conf.json`: dichiara esclusivamente `resources/binaries/darwin-arm64/*` e gli externalBin macOS (`llama-server`, `limen-vision-ocr`).
2. `apps/desktop/src-tauri/tauri.windows.conf.json`: dichiara esclusivamente `resources/native-windows/**` e l'externalBin `llama-server.exe`.

Lo script di packaging Windows (`scripts/package-v6mini-windows.ps1`) esegue il merge su copia temporanea senza sovrascrivere in modo distruttivo la configurazione sorgente macOS.

---

## 3. Dichiarazione Formale dello Stato di Verifica

- **Analisi Statica e Coerenza del Codice**: **SUPERATA**. Le conditional compilation `#[cfg(...)]` e le strutture dati modificate non introducono rotture sintattiche o semantiche nel branch condiviso.
- **Runtime Mac**: **NON VERIFICATO**.
  *Nota*: Non disponendo in questa sessione di macchine macOS / Apple Silicon fisiche o pipeline CI macOS connesse, non è stato possibile eseguire la suite di test runtime su Darwin ARM64. Qualsiasi certificazione di funzionamento effettivo su Mac potrà avvenire solo ed esclusivamente su un ambiente hardware reale macOS.
