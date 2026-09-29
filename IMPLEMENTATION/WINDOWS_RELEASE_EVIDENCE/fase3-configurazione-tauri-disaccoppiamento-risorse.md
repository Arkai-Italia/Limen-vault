# Configurazione Tauri Windows e Disaccoppiamento Risorse Native

> **Data**: 29 settembre 2026  
> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Obiettivo Fase 3**: Separare rigorosamente la configurazione di packaging e le risorse native per piattaforma (Windows vs macOS), garantendo che l'installer NSIS includa solo i file Windows x64 necessari senza artefatti macOS superflui.

---

## 1. Disaccoppiamento della Configurazione Tauri

La configurazione monolitica di `tauri.conf.json` è stata suddivisa secondo le specifiche ufficiali Tauri v2:

### 1.1 Configurazione Comune Condivisa (`tauri.conf.json`)
* **Identificativo Prodotto**: `dev.arkai.limenvault`
* **Nome Prodotto**: `LIMEN Vault v6Mini`
* **Versione**: `0.6.0`
* **Build Frontend**: `dist/` compilato da Vite (`pnpm build`)
* **Finestra Base**: 1280x840, resizable, title nativo standard (rimosso `titleBarStyle: "Overlay"` specifico di macOS)
* **Risorse Comuni Condivise**:
  - `../../../vault-template/` -> `vault-template/`
  - `resources/mcp/` -> `mcp/`
  - `../../../HELP/` -> `documentation/HELP/`
  - `../../../docs/GUIDA_UTENTE_LIMEN.md` -> `documentation/GUIDA_UTENTE_LIMEN.md`
  - `../../../manuale UI utente.txt` -> `documentation/manuale UI utente.txt`
  *(Rimossa la mappatura generica di `resources/native/` dalla configurazione comune)*.

### 1.2 Override macOS (`tauri.macos.conf.json`)
* **Target Bundle**: `["app", "dmg"]`
* **Stile Finestra**: `titleBarStyle: "Overlay"`
* **Risorse Native macOS**: `"resources/native/": "native/"` (inclusi helper Swift, librerie Metal e `.dylib`)
* **Requisiti macOS**: `minimumSystemVersion: "26.0"`, `entitlements: "Entitlements.plist"`

### 1.3 Override Windows (`tauri.windows.conf.json`)
* **Target Bundle**: `["nsis"]`
* **Modalità Installatore NSIS**: `"installMode": "currentUser"` (installazione per-utente senza UAC/privilegi amministrativi)
* **Risorse Native Windows**: `"resources/native-windows/": "native/"` (inclusi esclusivamente eseguibili e DLL Win32)
* **Finestra**: Controlli standard nativi Windows (riduci a icona, ingrandisci, chiudi) senza overlay

---

## 2. Disaccoppiamento Risorse Native (`resources/native-windows/`)

### 2.1 Isolamento Binari
Creata la cartella isolata `apps/desktop/src-tauri/resources/native-windows/` popolata unicamente con:
* `llama-server.exe` (server HTTP locale Win32 x64, 8.177.392 byte)
* `llama.dll` (libreria core llama.cpp x64)
* `ggml.dll`, `ggml-base.dll`, `mtmd.dll` (primitive GGML x64)
* `ggml-vulkan.dll` (backend GPU Vulkan standard, 56.944.368 byte)
* 14 DLL backend CPU ottimizzate: `ggml-cpu-haswell.dll`, `ggml-cpu-alderlake.dll`, `ggml-cpu-zen4.dll`, `ggml-cpu-sse42.dll`, `ggml-cpu-x64.dll`, `ggml-cpu-cannonlake.dll`, `ggml-cpu-cascadelake.dll`, `ggml-cpu-cooperlake.dll`, `ggml-cpu-icelake.dll`, `ggml-cpu-ivybridge.dll`, `ggml-cpu-piledriver.dll`, `ggml-cpu-sandybridge.dll`, `ggml-cpu-sapphirerapids.dll`, `ggml-cpu-skylakex.dll`
* `README-native-windows.md` e `.gitkeep`

### 2.2 Esclusione Rigorosa Binari macOS
Tutti i componenti Apple/macOS:
- `llama-server` (Mach-O binario a 64 bit)
- `libggml-metal.so`
- `.dylib` (`libcrypto.3.dylib`, `libggml.0.dylib`, `libllama.0.dylib`, `libomp.dylib`, ecc.)
vengono rigorosamente esclusi dal pacchetto Windows NSIS, eliminando 30 MB di file inutili e prevenendo falsi positivi antivirus.

### 2.3 Aggiornamento `.gitignore`
Aggiunte le regole per escludere i binari pesanti e preservare la struttura:
```gitignore
apps/desktop/src-tauri/resources/native-windows/*
!apps/desktop/src-tauri/resources/native-windows/.gitkeep
!apps/desktop/src-tauri/resources/native-windows/README-native-windows.md
```

### 2.4 Aggiornamento Percorsi di Ricerca in `llama.rs`
In `detect_llama_server_binary_from_exe_opt` (linee 775-785 di `llama.rs`), l'elenco dei candidati di sviluppo `cand_dev` include ora sia `resources/native-windows/llama-server.exe` sia `resources/native/llama-server.exe`.

---

## 3. Validazione Esecutiva
1. **Fusione automatica configurazione Tauri**:
   - Eseguito `cargo check` in `apps/desktop/src-tauri`:
     ```text
     cargo:rerun-if-changed=E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\tauri.conf.json
     cargo:rerun-if-changed=E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\tauri.windows.conf.json
     Finished `dev` profile in 7.25s (Exit code: 0)
     ```
   - Confermato che Tauri v2 rileva e fonde automaticamente `tauri.windows.conf.json` su target Windows.
2. **Typecheck Frontend**:
   - Eseguito `npx pnpm --filter @limen-vault/desktop typecheck`:
     ```text
     Exit code: 0 (Nessun errore di tipo o configurazione)
     ```
3. **Test Unitari Rilevamento Binari**:
   - Eseguito `cargo test --lib llama::tests::test_detect_llama_server_binary`:
     ```text
     running 2 tests
     test llama::tests::test_detect_llama_server_binary ... ok
     test llama::tests::test_detect_llama_server_binary_macos_bundle ... ok
     test result: ok. 2 passed; 0 failed; finished in 0.04s (Exit code: 0)
     ```
