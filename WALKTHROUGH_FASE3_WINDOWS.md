# Walkthrough Fase 3: Configurazione Tauri Windows e Disaccoppiamento Risorse

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Stato Fase 3**: **Chiusa e committata** (`d136bb0`)

---

## 1. Obiettivi e Perimetro di Fase 3
La Fase 3 ha implementato il disaccoppiamento architetturale per piattaforma sia a livello di configurazione Tauri v2 che di risorse native distribuite nel pacchetto:
1. **Configurazione Tauri per piattaforma**: separare le opzioni comuni condivise da quelle esclusive per macOS e per Windows;
2. **Disaccoppiamento risorse native**: isolare i binari x64 Win32 in una directory dedicata (`resources/native-windows/`), impedendo che librerie ed eseguibili Apple (`.dylib`, `.so`, Mach-O) finiscano nell'installer NSIS;
3. **Verifica automatica di merge**: confermare che il compilatore `tauri-build` rileva e applica correttamente la configurazione Windows specifica senza errori di sintassi o conflitti.

---

## 2. Modifiche di Configurazione Tauri

### 2.1 Configurazione Comune (`apps/desktop/src-tauri/tauri.conf.json`)
* **Ruolo**: Contiene metadati identitari e impostazioni multipiattaforma condivise:
  - `productName`: `"LIMEN Vault v6Mini"`;
  - `version`: `"0.6.0"`;
  - `identifier`: `"dev.arkai.limenvault"`;
  - `build`: comandi di build frontend Vite (`pnpm dev` / `pnpm build`);
  - `app.windows`: dimensioni finestra (1280x840), controlli nativi standard (rimosso `titleBarStyle: "Overlay"` che su Windows provocava comportamenti grafici anomali);
  - `bundle.resources`: mappatura delle sole risorse comuni documentali e di template (`vault-template/`, `mcp/`, `documentation/HELP/`, manuali utente).

### 2.2 Configurazione Specifica macOS (`apps/desktop/src-tauri/tauri.macos.conf.json`)
* **Ruolo**: Preserva inalterata la pipeline di rilascio Mac:
  - `app.windows[0].titleBarStyle`: `"Overlay"`;
  - `bundle.targets`: `["app", "dmg"]`;
  - `bundle.resources`: `"resources/native/": "native/"`;
  - `bundle.macOS`: `minimumSystemVersion: "26.0"`, `entitlements: "Entitlements.plist"`.

### 2.3 Configurazione Specifica Windows (`apps/desktop/src-tauri/tauri.windows.conf.json`)
* **Ruolo**: Configurazione dedicata per Windows 11 x64:
  - `bundle.targets`: `["nsis"]`;
  - `bundle.windows.nsis.installMode`: `"currentUser"` (installazione per-utente senza privilegi amministrativi UAC);
  - `bundle.resources`: `"resources/native-windows/": "native/"` (mappa nel target `native/` esclusivamente i componenti Win32 x64).

---

## 3. Disaccoppiamento Risorse Native

### 3.1 Cartella Dedicata `resources/native-windows/`
Creata la cartella isolata `apps/desktop/src-tauri/resources/native-windows/` popolata con:
- `llama-server.exe` (server HTTP inferenza x64);
- `llama.dll`, `ggml.dll`, `ggml-base.dll`, `mtmd.dll`;
- `ggml-vulkan.dll` (accelerazione cross-GPU Vulkan);
- 14 DLL backend CPU ottimizzate (haswell, alderlake, zen4, sse42, x64, cannonlake, cascadelake, cooperlake, icelake, ivybridge, piledriver, sandybridge, sapphirerapids, skylakex);
- `README-native-windows.md` e `.gitkeep`.

### 3.2 Esclusione Totale Componenti macOS
I componenti Apple:
- `llama-server` (Mach-O 64-bit);
- `libggml-metal.so`;
- `*.dylib` (`libcrypto.3.dylib`, `libllama.0.dylib`, `libggml.0.dylib`, `libomp.dylib`, ecc.);
sono stati totalmente esclusi dal flusso di packaging Windows, riducendo le dimensioni del pacchetto di circa 30 MB ed eliminando il rischio di falsi positivi da parte di Windows Defender o SmartScreen su binari Mach-O estranei.

### 3.3 Regole `.gitignore`
Aggiornato `.gitignore` con le regole speculari a `resources/native/`:
```gitignore
apps/desktop/src-tauri/resources/native-windows/*
!apps/desktop/src-tauri/resources/native-windows/.gitkeep
!apps/desktop/src-tauri/resources/native-windows/README-native-windows.md
```

### 3.4 Percorsi di Rilevamento in `llama.rs`
In [`apps/desktop/src-tauri/src/llama.rs`](file:///E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/src/llama.rs), l'elenco dei candidati di sviluppo `cand_dev` include ora `resources/native-windows/llama-server.exe`, garantendo il funzionamento sia in modalità dev locale che nel bundle installato.

---

## 4. Validazione Esecutiva
1. **Verifica Compilazione e Merge Tauri**:
   - Comando: `cargo check` in `apps/desktop/src-tauri`.
   - Risultato: `Exit code: 0`. Confermato merge automatico di `tauri.windows.conf.json` da parte di `tauri-build`.
2. **Verifica Typecheck Frontend**:
   - Comando: `npx pnpm --filter @limen-vault/desktop typecheck`.
   - Risultato: `Exit code: 0`.
3. **Test Unitari Rilevamento Binario**:
   - Comando: `cargo test --lib llama::tests::test_detect_llama_server_binary`.
   - Risultato: `2 passed; 0 failed; finished in 0.04s` (`Exit code: 0`).

Evidenze complete archiviate in:
* [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase3-configurazione-tauri-disaccoppiamento-risorse.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase3-configurazione-tauri-disaccoppiamento-risorse.md)

---

## 5. Prossimi Passi (Fase 4)
* Commit atomico di Fase 3 eseguito (`d136bb0`).
* Avviata la **Fase 4**: Scrittura e validazione dello script di packaging riproducibile (`scripts/package-v6mini-windows.ps1`).
