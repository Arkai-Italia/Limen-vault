# Walkthrough Fase 6: Consegna Finale e Chiusura Release Windows v6Mini

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Stato Fase 6**: **Installer generato — Accettazione release aperta (in attesa di audit)**

---

## 1. Obiettivi e Perimetro di Fase 6
La Fase 6 documenta l'installer generato e la chiusura della pipeline di packaging, mantenendo l'accettazione della release aperta in attesa dell'audit indipendente e dei collaudi applicativi reali:
1. **Documentazione Utente Windows**: redazione completa di [`USER INSTALL WINDOWS/LEGGIMI_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LEGGIMI_WINDOWS.md) con requisiti effettivi, istruzioni di installazione NSIS per-utente, gestione SmartScreen, primo avvio, gestione motori locali e limiti accertati;
2. **Integrità Crittografica della Consegna**: verifica della perfetta corrispondenza tra l'installer rilasciato [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe) e il file di checksum [`USER INSTALL WINDOWS/SHA256SUMS.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/SHA256SUMS.txt);
3. **Allineamento Documentale di Progetto**: sincronizzazione definitiva di `TASK_LIST.md`, `TODO LIST.TXT` e degli artifact del piano di implementazione;
4. **Preservazione Rigorosa degli Asset Preesistenti**: mantenuti inalterati i pacchetti macOS in `USER INSTALL/` e i file storici/patch inventariati in `IMPLEMENTATION/WINDOWS_BUILD_EVIDENCE/`.

---

## 2. Sintesi delle Fasi e Risultati Raggiunti

| Fase | Descrizione | Commit | Stato / Risultati Chiave |
|:----:|:------------|:------:|:------------------------|
| **Fase 0** | **Ricognizione Ambiente** | — | Node v24.14.0, Rust 1.95.0 MSVC, Windows 11 Build 26100, Edge WebView2 153.0.4234.48 censiti. |
| **Fase 1** | **Core Rust & Spike OCR** | `08cdf03` | Rilevamento RAM Win32 reale (`GlobalMemoryStatusEx`), Common Controls 6.0 manifest, contratti estrazione parziale (`is_partial`, warning, badge UI), spike OCR superato su 5 fixture reali. |
| **Fase 2** | **Binari llama.cpp & CPU/GPU** | `0213f6a` | llama.cpp Build 8477 (Clang x64 MSVC), 10 componenti verificati con hash, default sicuro CPU (`-ngl 0`), coesistenza dinamica loopback bge-m3 + Ministral senza collisioni, flag `CREATE_NO_WINDOW`. |
| **Fase 3** | **Configurazione Tauri & Risorse** | `d136bb0` | Disaccoppiamento per piattaforma (`tauri.windows.conf.json` con target `nsis`), creazione `resources/native-windows/` con 20 componenti x64, esclusione totale artefatti Apple (.dylib, Mach-O). |
| **Fase 4** | **Packaging Riproducibile NSIS** | `3f02ae5` | Script [`scripts/package-v6mini-windows.ps1`](file:///E:/Projects/vault_memai_obsi/scripts/package-v6mini-windows.ps1), verifica bundle frontend reale (477 byte, titolo v6Mini), compilazione release e generazione installer NSIS (19.007.431 byte). |
| **Fase 5** | **Collaudo Matrice 24 Criteri** | `48e6022` | Collaudo metodico di tutti i 24 criteri, 243/243 test Rust passati, WinCred roundtrip superato con codice 0, conformità architettura locale garantita. |
| **Fase 6** | **Consegna e Chiusura** | `41f0507` | Redatto `LEGGIMI_WINDOWS.md`, verificato checksum SHA-256 e finalizzata la consegna. |

---

## 3. Scheda della Consegna Attuale (Bundle Completo con Motori OCR e Runtime)

* **Directory di Consegna**: [`USER INSTALL WINDOWS/`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/)
* **Setup Installer**: `LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`
  - **Dimensione**: **63.063.440 byte** (58.4 MB)
  - **Checksum SHA-256**: `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249`
* **File Checksum**: `SHA256SUMS.txt`
* **Istruzioni Utente**: `LEGGIMI_WINDOWS.md`
* **Stato Firma**: non firmato (`NotSigned`, SmartScreen previsto e documentato).
* **Stato Collaudo e Accettazione**:  
  **Componenti OCR e alcune operazioni native provati separatamente. Collaudo dell’app installata non dimostrato. Isolamento del profilo non realizzato. Parità e accettazione aperte.**
* **Ricognizione Tecnica Ambiente**: Documentata in [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/ricognizione_ambiente_collaudo.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/ricognizione_ambiente_collaudo.md).
