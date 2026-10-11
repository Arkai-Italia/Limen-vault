# Release & Environment Specifications — LIMEN Vault v7Mini

## 1. Identificativi della Release e Tracciabilità del Repository
- **Nome Prodotto Ufficiale:** `LIMEN Vault v7Mini`
- **Versione Software Documentata:** `0.7.0 (v7Mini)`
- **Identificativo Bundle Applicativo:** `dev.arkai.limenvault`
- **Branch Git di Riferimento:** `windows-build`
- **Commit di Rilascio Software:** `677745c367d64de7d21eb66d111cac7558300f84` (Build LIMEN Vault v7Mini 0.7.0, DMG firmato e notarizzato Apple)
- **Commit di Ispezione Documentazione:** `373e34e7ae3a7a9f41acf2c8eecdaa8131c5d90a` (Allineamento corpus documentale e package handoff)
- **Data di Rilascio e Verifica:** 11 Ottobre 2026
- **Proprietario / Maintainer:** Arkitecna Hong Kong Limited / Cesare Negro

---

## 2. Architettura di Distribuzione & Ambienti

### A. Ambiente macOS Desktop (Verificato & Notarizzato Apple)
- **Architettura Hardware:** Apple Silicon (processori ARM64: M1, M2, M3, M4) e Intel x86_64.
- **Versione OS Minima:** macOS 13.0+ (Ventura, Sonoma, Sequoia).
- **Accelerazione Hardware:** GPU Metal nativa per calcolo tensoriale e inferenza llama-server.
- **Firma di Sicurezza:** Developer ID Application (`Arkitecna Hong Kong Limited`, ID `ZVGX4HFZC3`, SHA-1 `E01892F9C136DA67B393B9CD29AF97E369956968`).
- **Autenticazione Apple (Notarization):**
  - Notarytool App Ticket ID: `0a7df268-0801-4537-9fe4-390652c66766` (`Accepted`).
  - Notarytool DMG Ticket ID: `626432c1-1f18-44c0-8132-4fdaa8e454ae` (`Accepted`).
  - Gatekeeper Assessment: `spctl --assess` $\rightarrow$ `accepted, source=Notarized Developer ID`.
- **Artefatto Distribuito:** `USER INSTALL/LIMEN-Vault-v7Mini.dmg` (51.113.656 byte, SHA-256 `4d11ba254877762ece89cb334717164d8418b0e2181444b8363994f6134d6c38`).

### B. Ambiente Windows Desktop (Piattaforma di Sviluppo & Parità Nativa)
- **Architettura Hardware:** Windows x64 (processori Intel / AMD x86_64).
- **Versione OS:** Windows 10 / Windows 11 a 64 bit.
- **Accelerazione:** CPU con istruzioni AVX2, supporto opzionale runtime CUDA.
- **Packaging:** Installer eseguibile NSIS (`LIMEN-Vault-v7Mini-setup.exe`).
- **Integrazione Portachiavi:** Windows DPAPI (Data Protection API) per la memorizzazione protetta delle chiavi API.

---

## 3. Topologia del Runtime Monorepo
- **Gestore Pacchetti:** `pnpm` v10 (workspace coordinati).
- **Backend Rust / Tauri:** `apps/desktop/src-tauri` (Tauri v2.1.1 con IPC asincrono tipizzato).
- **Frontend Applicativo:** React 18.3.1, TypeScript 5.7.2, bundler Vite 6.0.3.
- **Motore Vettoriale Locale:** Binario nativo `llama-server` operante esclusivamente su loopback locale `127.0.0.1` con modello embedding `bge-m3-Q8_0.gguf`.
- **Catalogo Generativo Locale:** 6 modelli GGUF supportati:
  - `Ministral 3 3B Instruct` (quantizzazione `Q5_K_M`, 2.47 GB, 8 GB RAM min)
  - `Ministral 3 8B Instruct` (quantizzazione `Q5_K_M`, 6.06 GB, 16 GB RAM min)
  - `Qwen 2.5 7B Instruct` (quantizzazione `Q4_K_M`, 4.68 GB, 16 GB RAM min)
  - `Meta Llama 3.1 8B Instruct` (quantizzazione `Q4_K_M`, 4.92 GB, 16 GB RAM min)
  - `DeepSeek-R1-Distill-Qwen-7B` (quantizzazione `Q4_K_M`, 4.68 GB, 16 GB RAM min, reasoning trace `<think>`)
  - `DeepSeek-R1-Distill-Qwen-14B` (quantizzazione `Q4_K_M`, 8.99 GB, 24 GB RAM min, reasoning trace `<think>`)
- **Gestione Frontmatter & Note Markdown:** Motore bidirezionale compatibile con Obsidian.
