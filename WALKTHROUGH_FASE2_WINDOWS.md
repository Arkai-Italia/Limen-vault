# Walkthrough Fase 2: Selezione Binari `llama-server.exe` e Politica CPU/GPU Windows 11

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Branch**: `windows-build`  
> **Stato Fase 2**: **Completata e committata (commit `e8acc71`)**

---

## 1. Obiettivi e Perimetro di Fase 2
Garantire l'esecuzione locale e offline al 100% dei motori di inferenza e embedding:
1. `bge-m3` (embeddings semantici del Vault);
2. `Ministral 3 8B / 3B Instruct` (generazione risposte Solo Locale);
con garanzia assoluta di stabilità su qualsiasi hardware Windows 11 x64 (CPU base, CPU con AVX2/AVX-512, o GPU dedicata Vulkan), prevenendo crash fatali dovuti a esaurimento memoria video (VRAM OOM) o dipendenze da percorsi macOS.

---

## 2. Selezione ed Inventario Binari `llama.cpp` x64

### 2.1 Release e Compilazione
* **Sorgente**: `ggerganov/llama.cpp`
* **Release / Build**: `8477` — Commit esatto: `ec2b787`
* **Compilatore**: Clang 19.1.5 per Windows x86_64 (`x86_64-pc-windows-msvc`)
* **Licenza**: MIT License (`Copyright (c) 2023 Georgi Gerganov`)
* **Verifica Esecutiva a riga di comando** (`llama-server.exe --version`):
  ```text
  ggml_vulkan: Found 1 Vulkan devices:
  ggml_vulkan: 0 = NVIDIA GeForce RTX 3060 (NVIDIA) | uma: 0 | fp16: 1 | bf16: 1 | warp size: 32 | shared memory: 49152 | int dot: 1 | matrix cores: NV_coopmat2
  load_backend: loaded Vulkan backend from E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\resources\native\ggml-vulkan.dll
  load_backend: loaded CPU backend from E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\resources\native\ggml-cpu-haswell.dll
  version: 1 (ec2b787)
  built with Clang 19.1.5 for Windows x86_64
  ```

### 2.2 Tabella Componenti Nativi e Checksum SHA-256
Tutti i componenti sono allocati in `apps/desktop/src-tauri/resources/native/`:

| Componente Binario / DLL | Dimensione (byte) | Impronta SHA-256 | Ruolo Architetturale |
|---|---|---|---|
| `llama-server.exe` | 8.177.392 | `45438f026845b4611474e3a7a21b486cab83d3ac39ca60d591ceb88300d8ee4c` | Processo server HTTP OpenAI-compatible loopback (127.0.0.1) |
| `llama.dll` | 3.068.656 | `612bba021a0f3abb0a41caf32694a4667fa95f0c0ec074b90107577e41693351` | Libreria core inferenza `llama.cpp` |
| `ggml.dll` | 107.248 | `2adffd006dc4161dc4c3939a18bcecde2063ac7e831cda8a548e6276af65ef87` | Tensor library interface |
| `ggml-base.dll` | 695.536 | `203980aef7247b16710244ee8e369201d64f5f66d442be47141a81de99cdebbb` | Primitive di base GGML e gestione memorie |
| `mtmd.dll` | 909.552 | `3587dcbf8e72adf437de8e4f3e8a635095d9d33159c920a3bc6871c660877ad7` | Multi-threading memory dispatch |
| `ggml-vulkan.dll` | 56.944.368 | `f5c28869e9d350a49c1a41728f654db3098dbc542e39803fc7b55dbf141ae78e` | Backend accelerato GPU via Vulkan standard (cross-GPU) |
| `ggml-cpu-haswell.dll` | 1.143.024 | `54936551c2b04c2cd0d39a9fc2a637c50262f5a4cab8e73371035d684e4b8dfe` | Backend CPU ottimizzato AVX2 + FMA |
| `ggml-cpu-alderlake.dll` | 1.138.416 | `6c01fd6d3ba593b7e95d6dc3e8b35e2a3b7a492ed9a4a76e0e18b4e2970b8cd4` | Backend CPU per architetture Intel ibride P/E |
| `ggml-cpu-zen4.dll` | 1.370.864 | `7f965061d15743e5488facf02f6167c301a40652da9273bde731c9b295d7539c` | Backend CPU AMD Zen 4 (AVX-512) |
| `ggml-cpu-sse42.dll` | 856.304 | `28257189f5f2e1e19babc2dce8fde3c8a9df3f612c9fe3b47547c4d00187dd2c` | Backend CPU baseline SSE4.2 per processori legacy |
| `ggml-cpu-x64.dll` | 848.624 | `2acef46f48619218f87ab2126eaaaffa7d6a355275adcf5b611e76dd554c0759` | Backend CPU generico a 64 bit |

---

## 3. Politica CPU/GPU e Modifiche al Codice

### 3.1 Risoluzione Problema GPU Blind Offload (`-ngl 99`)
* Su macOS Metal, `-ngl 99` sfrutta l'architettura a memoria unificata UMA (la RAM è condivisa nativamente con la GPU senza duplicazioni).
* Su Windows, la memoria VRAM della GPU è separata e variabile (schede integrate con 128 MB di VRAM, schede dedicate con 4/6/8 GB). Impostare `-ngl 99` cieco causa crash fatali (`out of memory`) su macchine prive di VRAM sufficiente per contenere 27 layer + KV cache a 8192 token.
* **Soluzione Implementata** in [`apps/desktop/src-tauri/src/llama_llm.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/llama_llm.rs):
  - Creata funzione `get_default_ngl()`:
    - Su Windows/non-macOS: restituisce `"0"` (default di massima sicurezza: inferenza su CPU locale con backend AVX2/haswell, 100% stabile su qualsiasi PC);
    - Su macOS: restituisce `"99"` (mantiene piena accelerazione Metal UMA);
    - Supporto variabile d'ambiente `LIMEN_GPU_NGL`: consente l'offload controllato su GPU con VRAM idonea (es. `set LIMEN_GPU_NGL=27`).
  - Creata funzione deterministica `build_llama_server_args(model_path: &Path, port: u16) -> Vec<String>`.

### 3.2 Disaccoppiamento Percorsi Metal macOS
* In [`apps/desktop/src-tauri/src/llama_llm.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/llama_llm.rs) e [`apps/desktop/src-tauri/src/llama.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/llama.rs), l'assegnazione di `cmd.env("GGML_BACKEND_PATH", metal)` verso `libggml-metal.so` è stata isolata e racchiusa sotto `#[cfg(target_os = "macos")]`.
* Su Windows, l'impostazione della cartella corrente (`cmd.current_dir(parent)`) garantisce il corretto caricamento dinamico Win32 di `llama.dll`, `ggml-vulkan.dll` e dei backend `ggml-cpu-*.dll` posizionati nella cartella nativa senza variabili d'ambiente spurie.

### 3.3 Coesistenza Porte e Isolamento Finestre
* Entrambi i servizi utilizzano `find_free_port()` per selezionare porte loopback libere (intervallo > 1024 su `127.0.0.1`).
* Verificata la coesistenza simultanea priva di conflitti di `bge-m3` e `Ministral`.
* Confermata l'applicazione della costante Win32 `CREATE_NO_WINDOW: u32 = 0x08000000` sia per `llama.rs` che per `llama_llm.rs`, garantendo l'assenza totale di finestre o terminali console neri all'avvio dei processi ausiliari.

---

## 4. Risultati della Validazione Test Rust
Comando eseguito:
```cmd
cargo test --lib llama
```
Esito grezzo registrato (57 passati, 0 falliti, 1 ignorato test manuale con modello reale):
```text
test result: ok. 57 passed; 0 failed; 1 ignored; 0 measured; 187 filtered out; finished in 15.36s
```
Tra cui i nuovi test dedicati:
* `llama_llm::tests::test_get_default_ngl_and_override`: PASS (verifica 0 su Windows, 99 su macOS, override dinamico tramite `LIMEN_GPU_NGL`).
* `llama_llm::tests::test_build_llama_server_args`: PASS (verifica composizione parametri `-ngl`, porte e contesto).
* `llama_llm::tests::test_ports_coexistence_no_collision`: PASS (verifica binding simultaneo indipendente).
* `llama::tests::test_build_embedding_server_args`: PASS (verifica composizione parametri `--embedding`).
* `llama::tests::test_ports_coexistence_bge_and_ministral`: PASS (verifica coesistenza porte loopback).

Evidenze complete archiviate in:
* [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase2-selezione-binari-llama.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase2-selezione-binari-llama.md)
* [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase2-llama-server-cpu-gpu.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase2-llama-server-cpu-gpu.txt)

---

## 5. Stato di Consegna e Prossimi Passi (Fase 3)
* **Commit Fase 2 eseguito**: `e8acc71` ("Fase 2: Selezione binari llama.cpp x64, disaccoppiamento Metal e politica deterministica CPU/GPU Windows").
* **Apertura Fase 3**: Configurazione Tauri Windows (`tauri.windows.conf.json`), target NSIS ed esclusione esplicita di bundle/risorse macOS.
