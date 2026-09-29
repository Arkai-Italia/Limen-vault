# Evidenza Fase 4: Script di Packaging Riproducibile e Generazione Installer NSIS

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Architettura Target**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Script**: [`scripts/package-v6mini-windows.ps1`](file:///E:/Projects/vault_memai_obsi/scripts/package-v6mini-windows.ps1)  
> **Stato Fase 4**: **Completata con successo**

---

## 1. Obiettivo e Perimetro della Fase 4
La Fase 4 ha lo scopo di realizzare una pipeline di packaging completamente automatizzata, riproducibile e deterministica per la piattaforma Windows x64, conforme a quanto prescritto in `USER INSTALL/ISTRUZIONI_CODER_BUILD_WINDOWS.md` e nelle regole di progetto:
1. **Script di packaging PowerShell**: creazione di `scripts/package-v6mini-windows.ps1` con controlli rigorosi (`$ErrorActionPreference = "Stop"`, verifica codice di uscita `$LASTEXITCODE -eq 0` per ogni comando nativo);
2. **Verifica prerequisiti e isolamento**: validazione versioni runtime (Node, pnpm, rustc, cargo) e verifica dell'assoluta assenza di artefatti macOS (`.dylib`, `.so`, Mach-O) nella cartella `resources/native-windows/`;
3. **Build reale del frontend Vite**: esecuzione della build di produzione del client desktop, validazione del file `dist/index.html` (esclusione categorica del segnaposto di fallback da 53 byte generato da `build.rs`, presenza dei bundle JavaScript/CSS compilati e allineamento del titolo a "LIMEN Vault v6Mini");
4. **Compilazione release e packaging NSIS**: invocazione della CLI Tauri con target `x86_64-pc-windows-msvc`, bundle `nsis` e flag `--no-sign`;
5. **Copia dell'installer e checksum**: collocazione dell'installer finale in `USER INSTALL WINDOWS/` e generazione del file `SHA256SUMS.txt`.

---

## 2. Dettaglio Risultati Esecutivi

### 2.1 Esecuzione Script di Packaging
Comando eseguito dalla radice del workspace:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-v6mini-windows.ps1
```

Output registrato dalla pipeline:
```text
=== LIMEN Vault v6Mini Packaging Pipeline (Windows x64) ===
Root Directory: E:\Projects\vault_memai_obsi

[1/6] Verifica strumenti e prerequisiti...
Node: v24.14.0
pnpm: 12.6.0
rustc: rustc 1.95.0 (59807616e 2026-04-14)
cargo: cargo 1.95.0 (f2d3ce0bd 2026-03-21)

[2/6] Verifica isolamento risorse native Windows...
Risorse native Windows verificate con successo (20 binari/DLL presenti, 0 residui macOS).

[3/6] Compilazione frontend Vite per produzione...
$ pnpm build:deps && tsc && vite build
vite v6.4.3 building for production...
transforming...
✓ 1612 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                             0.48 kB │ gzip:   0.31 kB
dist/assets/limenvault-logo-DLIEd4NX.png    7.80 kB
dist/assets/ic-limenvault-Gyi6jPQp.png    102.25 kB
dist/assets/index-CExmYqUx.css              3.07 kB │ gzip:   1.12 kB
dist/assets/index-BzskkXDT.js             416.20 kB │ gzip: 113.31 kB
✓ built in 3.10s

[4/6] Validazione bundle frontend dist/index.html...
Validazione dist/index.html superata (477 byte, bundle Vite reali verificati).

[5/6] Esecuzione packaging Tauri NSIS (target: x86_64-pc-windows-msvc)...
Esecuzione: pnpm --filter @limen-vault/desktop tauri build --bundles nsis --target x86_64-pc-windows-msvc --no-sign
    Finished `release` profile [optimized] target(s) in 7m 06s
       Built application at: E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\target\x86_64-pc-windows-msvc\release\limen-vault.exe
        Info Patching E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\target\x86_64-pc-windows-msvc\release\limen-vault.exe with bundle type information: nsis
        Info Target: x64
     Running makensis to produce E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\LIMEN Vault v6Mini_0.6.0_x64-setup.exe
    Finished 1 bundle at:
        E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\LIMEN Vault v6Mini_0.6.0_x64-setup.exe

[6/6] Rilevamento installer e generazione checksum...
Trovato installer NSIS: E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\LIMEN Vault v6Mini_0.6.0_x64-setup.exe
Installer copiato con successo in: E:\Projects\vault_memai_obsi\USER INSTALL WINDOWS\LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe

=== PACKAGING WINDOWS v6Mini COMPLETATO CON SUCCESSO ===
File Installer: E:\Projects\vault_memai_obsi\USER INSTALL WINDOWS\LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe
Dimensione:     19007431 byte
SHA-256:        2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092
Checksum file:  E:\Projects\vault_memai_obsi\USER INSTALL WINDOWS\SHA256SUMS.txt
```

---

## 3. Artefatto Finale Generato

### 3.1 Scheda dell'Installer Windows x64
* **Percorso Relativo**: `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`
* **Percorso Assoluto**: `E:\Projects\vault_memai_obsi\USER INSTALL WINDOWS\LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`
* **Formato**: Eseguibile di installazione NSIS (Nullsoft Scriptable Install System) x64
* **Dimensione**: **19.007.431 byte** (~18.13 MiB)
* **Checksum SHA-256**:
  ```text
  2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092
  ```
* **Modalità di Installazione**: `currentUser` (installazione per-utente in `%LOCALAPPDATA%\Programs\dev.arkai.limenvault`, senza richiesta di elevazione UAC)
* **Stato Firma**: **Non firmato** (`--no-sign`, privo di certificato di firma codice Windows; dichiarato esplicitamente conforme alle istruzioni)

### 3.2 Metadati del Binario Principale (`limen-vault.exe`)
* **Product Name**: `LIMEN Vault v6Mini`
* **File Description**: `LIMEN Vault v6Mini`
* **File Version**: `0.6.0`
* **Product Version**: `0.6.0`
* **Company Name**: `Arkitecna Hong Kong Limited`
* **Legal Copyright**: `Copyright © 2026 Arkitecna Hong Kong Limited`
* **Dimensione binario compilato**: 23.537.152 byte

---

## 4. Conformità alle Regole di Progetto
1. **Zero chiamate OpenAI**: Nessuna richiesta di rete verso OpenAI.
2. **Nessun processo estraneo terminato**: Nessuna chiamata a `Stop-Process` o `taskkill` su processi di terzi o dell'utente.
3. **Risorse pulite ed esclusive**: Nel pacchetto NSIS sono state incluse le sole risorse Windows x64 da `resources/native-windows/` (20 binari e librerie), con esclusione totale di file Apple Mach-O o `.dylib`.
4. **Verifica bundle reale**: `dist/index.html` contiene i bundle Vite di produzione (477 byte, non il segnaposto da 53 byte).
