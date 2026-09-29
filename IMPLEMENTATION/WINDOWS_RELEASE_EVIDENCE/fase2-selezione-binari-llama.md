# Selezione Binari llama.cpp x64, Dipendenze Native e Politica CPU/GPU Windows 11

> **Data**: 29 settembre 2026  
> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Obiettivo**: Garantire l'esecuzione locale al 100% dei modelli `bge-m3` (embeddings) e `Ministral` (risposte Solo Locale) con stabilità garantita su qualsiasi configurazione hardware Windows (CPU generica, CPU avanzata AVX2, o GPU dedicata Vulkan).

---

## 1. Identificazione e Verifica della Release `llama.cpp`

### 1.1 Metadati della Release
* **Sorgente / Progetto**: `ggerganov/llama.cpp`
* **Release / Build**: Build `8477` — Commit esatto: `ec2b787`
* **Compilatore e Toolchain**: Clang 19.1.5 per Windows x86_64 (`x86_64-pc-windows-msvc`)
* **Licenza**: MIT License (`Copyright (c) 2023 Georgi Gerganov`)

### 1.2 Ispezione Esecutiva a Riga di Comando
Comando eseguito direttamente sul binario Windows:
```cmd
apps\desktop\src-tauri\resources\native\llama-server.exe --version
```

Output grezzo registrato:
```text
ggml_vulkan: Found 1 Vulkan devices:
ggml_vulkan: 0 = NVIDIA GeForce RTX 3060 (NVIDIA) | uma: 0 | fp16: 1 | bf16: 1 | warp size: 32 | shared memory: 49152 | int dot: 1 | matrix cores: NV_coopmat2
load_backend: loaded Vulkan backend from E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\resources\native\ggml-vulkan.dll
load_backend: loaded CPU backend from E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\resources\native\ggml-cpu-haswell.dll
version: 1 (ec2b787)
built with Clang 19.1.5 for Windows x86_64
```

### 1.3 Inventario Componenti Binari e Impronte SHA-256
Tutti i componenti sono collocati nella directory di risorse native dell'applicazione (`resources/native/`):

| File Binario / DLL | Dimensione (byte) | SHA-256 Checksum | Ruolo Architetturale |
|---|---|---|---|
| `llama-server.exe` | 8.177.392 | `45438f026845b4611474e3a7a21b486cab83d3ac39ca60d591ceb88300d8ee4c` | Processo server HTTP OpenAI-compatible loopback (127.0.0.1) |
| `llama.dll` | 3.068.656 | `612bba021a0f3abb0a41caf32694a4667fa95f0c0ec074b90107577e41693351` | Libreria core inferenza `llama.cpp` |
| `ggml.dll` | 107.248 | `2adffd006dc4161dc4c3939a18bcecde2063ac7e831cda8a548e6276af65ef87` | Tensor library interface |
| `ggml-base.dll` | 695.536 | `203980aef7247b16710244ee8e369201d64f5f66d442be47141a81de99cdebbb` | Primitive di base GGML e gestione memorie |
| `mtmd.dll` | 909.552 | `3587dcbf8e72adf437de8e4f3e8a635095d9d33159c920a3bc6871c660877ad7` | Multi-threading memory dispatch |
| `ggml-vulkan.dll` | 56.944.368 | `f5c28869e9d350a49c1a41728f654db3098dbc542e39803fc7b55dbf141ae78e` | Backend accelerato GPU via API Vulkan standard (cross-GPU: NVIDIA, AMD, Intel) |
| `ggml-cpu-haswell.dll` | 1.143.024 | `54936551c2b04c2cd0d39a9fc2a637c50262f5a4cab8e73371035d684e4b8dfe` | Backend CPU ottimizzato AVX2 + FMA |
| `ggml-cpu-alderlake.dll` | 1.138.416 | `6c01fd6d3ba593b7e95d6dc3e8b35e2a3b7a492ed9a4a76e0e18b4e2970b8cd4` | Backend CPU ibrido P/E core Intel |
| `ggml-cpu-zen4.dll` | 1.370.864 | `7f965061d15743e5488facf02f6167c301a40652da9273bde731c9b295d7539c` | Backend CPU AMD Zen 4 (AVX-512) |
| `ggml-cpu-sse42.dll` | 856.304 | `28257189f5f2e1e19babc2dce8fde3c8a9df3f612c9fe3b47547c4d00187dd2c` | Backend fallback baseline per CPU legacy |
| `ggml-cpu-x64.dll` | 848.624 | `2acef46f48619218f87ab2126eaaaffa7d6a355275adcf5b611e76dd554c0759` | Backend generico universale a 64 bit |

---

## 2. Politica Architetturale CPU / GPU Windows vs macOS

### 2.1 Differenze Fondamentali di Gestione Memoria
1. **Su macOS (Apple Silicon)**:
   - Architettura UMA (*Unified Memory Architecture*): la RAM di sistema è condivisa nativamente con la GPU Metal.
   - `-ngl 99` carica tutti i layer del modello nella memoria unificata senza duplicazioni o trasferimenti su bus PCIe.
2. **Su Windows**:
   - La VRAM della GPU dedicata (es. 4 GB, 6 GB, 8 GB o 12 GB) è separata dalla RAM di sistema.
   - Molti PC aziendali o portatili montano GPU integrate Intel Iris Xe / AMD Radeon Graphics con memoria VRAM dedicata minima o dinamica.
   - L'impostazione cieca di `-ngl 99` causerebbe crash fatali (`CUDA out of memory` o `VK_ERROR_OUT_OF_DEVICE_MEMORY`) o instabilità dei driver video in presenza di VRAM insufficiente per contenere sia i layer del modello (Ministral ~2.47 GB o 8B ~5.8 GB) sia il context buffer di 8192 token con KV cache.

### 2.2 Politica Implementata per Windows
* **Isolamento Parametri per Piattaforma**:
  - `#[cfg(target_os = "macos")]`: mantiene `-ngl 99` e `GGML_BACKEND_PATH` verso `libggml-metal.so`.
  - `#[cfg(not(target_os = "macos"))]`:
    - **Default Prudenziale di Sicurezza**: `-ngl 0` (esecuzione su CPU locale), garantendo che l'applicazione funzioni su qualsiasi PC Windows a 64 bit senza crashare.
    - **Configurabilità Dinamica**: supporto alla variabile d'ambiente `LIMEN_GPU_NGL` per consentire l'offload GPU su sistemi dotati di VRAM sufficiente (es. `-ngl 27` per offload completo su GPU >= 6 GB).
    - **Rimozione path macOS**: rimossa l'assegnazione di `GGML_BACKEND_PATH` a `libggml-metal.so` su Windows, consentendo il caricamento automatico delle DLL native Win32 (`ggml-vulkan.dll` e backend CPU) dalla cartella dell'eseguibile.
* **Garanzia Finestra Silenziosa**:
  - `CREATE_NO_WINDOW: u32 = 0x08000000;` applicato sistematicamente in tutti i rami di avvio Win32.
* **Separazione Porte e Carico Simultaneo**:
  - `bge-m3` (embeddings): porta dinamica libera (es. 127.0.0.1:50123), parametri dedicati per embedding context.
  - `Ministral` (testo locale): porta dinamica libera differente (es. 127.0.0.1:50124), log dedicato `llama-llm.log`.
