# Session Handover — Setup Wizard, Catalogo Multi-Modello, Script di Sanitizzazione & Manuali Aggiornati
Data: 10 Ottobre 2026 · Branch: `windows-build` · Workspace: `/Users/cesare/Documents/MEMAI V_FALLBACK OBSIDIAN`

---

## 1. Sintesi degli Interventi Realizzati

### A. Pop-up di Avvio Guidato (Setup Wizard Onboarding)
- **Controllo automatico all'avvio in `App.tsx`**:
  Verifica se:
  1. È aperto un Vault valido (`vaultPath && vaultLoaded`).
  2. È presente almeno un modello LLM locale integro su disco (`catalog.models.some(m => m.installed && m.sha256Ok)`).
  3. È configurata la chiave API OpenAI nel Portachiavi di sistema OPPURE è attiva la modalità *Solo Locale (Rete Zero)*.
- **Componente `SetupWizardModal.tsx`**:
  - Grafica dark-glass minimal & premium, sfocatura di fondo (`backdrop-filter: blur(16px)`), accenti verde lime (`#77f117`).
  - Stepper a 3 passaggi guidati con badge dinamici `✓` in tempo reale:
    - **Step 1 — Cartella Vault**: Sfoglia con file dialog nativo del sistema o creazione immediata.
    - **Step 2 — Motore AI Locale**: Rilevamento RAM di sistema (warning sotto i 16 GB), catalogo modelli con download in streaming e verifica crittografica SHA-256.
    - **Step 3 — Modalità AI & Chiave API**: Scelta tra "Modalità 100% Solo Locale" e "Modalità Ibrida OpenAI".
  - Pulsante **"CONFIGURAZIONE GUIDATA"** con icona Bussola sempre accessibile nella schermata iniziale e nelle impostazioni per riaprire il wizard in ogni momento.

### B. Catalogo Multi-Modello Locale Aperto (6 Modelli Supportati)
- Espansione del backend Rust in `llama_llm.rs` e dell'interfaccia in `SemanticEngineSettings.tsx`:
  1. **Ministral 3 3B Instruct** (`ministral-3b`): ~2,06 GB — RAM Minima: 8 GB (consigliata: 8–16 GB).
  2. **Ministral 3 8B Instruct** (`ministral-8b`): ~4,92 GB — RAM Minima: 16 GB (consigliata: 16–24 GB).
  3. **Qwen 2.5 7B Instruct** (`qwen-2.5-7b`): ~4,68 GB — RAM Minima: 16 GB (consigliata: 16–24 GB).
  4. **Llama 3.1 8B Instruct (Meta)** (`llama-3.1-8b`): ~4,92 GB — RAM Minima: 16 GB (consigliata: 16–24 GB).
  5. **DeepSeek-R1-Distill-Qwen-7B** (`deepseek-r1-7b`): ~4,68 GB — RAM Minima: 16 GB (consigliata: 16–24 GB, modello di ragionamento con catena di pensiero CoT).
  6. **DeepSeek-R1-Distill-Qwen-14B** (`deepseek-r1-14b`): ~8,99 GB — RAM Minima: 24 GB (consigliata: 32 GB+).
- Gestione della commutazione a caldo del modello attivo con comando Tauri `local_llm_set_active` e riavvio controllato di `llama-server`.

### C. Script Unico di Sanitizzazione Diretta (Zero Backup)
- Creato e arricchito `scripts/sanitize_vault.mjs`:
  - **Unico script autonomo**: trova automaticamente tutti i Vault su disco oppure accetta un percorso specifico come argomento.
  - **Zero file di backup**: nessun file o cartella `.bak` o copia transitoria creata, modifica in-place diretta.
  - **Sostituzione istantanea multi-regola**:
    1. "Michele Bondani" (e varianti con underscore) → `[RIFERIMENTO_RISERVATO]`
    2. "Packaging in Italy" (e varianti con srl, underscore o compatte) → `[AZIENDA_RISERVATA]`
  - Eseguito con successo su tutti i 6 Vault del sistema (`real_vault_v1`, `vault_collaudo_badge`, `vault_collaudo_local_rag`, `vault_collaudo_local_rag_v2`, `vault_collaudo_ricalcolo_cache`, `vault_timing` e `vault-template`):
    - **331 file modificati**
    - **5.498 occorrenze corrette**
    - **0 file di backup generati**
    - **0 residui trovati da verifica globale case-insensitive**


### D. Manuali Utente Verificati e Aggiornati
- [manuale UI utente.txt](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/manuale%20UI%20utente.txt):
  - Inserito il **diagramma Mermaid della Mappa dei Menu e Flussi di Navigazione** (Barra Sinistra -> Chiedi / Documenti / Memoria / Avanzate, Sottomenu, Cassetto Fonti e Document Reader).
  - Guida operativa click-by-click su come muoversi nei menu.
  - Diagrammi Mermaid per i 4 workflow operativi (Setup Wizard, Chiedi con Fonti e Lettore, Carica Documenti, Snapshot).
  - Tabella comparativa dei 6 modelli del catalogo con RAM minima e consigliata.
- [MANUALE UTENTE.MD](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/MANUALE%20UTENTE.MD):
  - Inseriti i diagrammi Mermaid completi della mappa dei menu, della sequenza di interazione e dei workflow operativi, rendendolo un documento visivo pronto per presentazioni in Markdown e Obsidian.

### E. Supporto Bilingue macOS (Italiano / Inglese) & Snellimento Testi (Minimal & Premium)
- **Motore di Internazionalizzazione Reattivo zero-dipendenze (`i18n.tsx`)**:
  - Creato `LanguageContext`, `LanguageProvider`, hook `useTranslation()` e componente compatto `LanguageToggle` (`IT | EN`) integrato nell'header.
  - Rilevamento automatico della lingua del sistema macOS (`navigator.language`) e persistenza della scelta in `localStorage.getItem('limen_language')`.
  - Esteso [`locale.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/locale.tsx) con supporto dizionari bilingue per stati e categorie.
- **Snellimento e Pulizia Testi Ridondanti**:
  - Rimossi tutti i testi didascalici prolissi e ripetitivi nelle schermate operative.
  - Semplificate le intestazioni e breadcrumbs: *Chiedi*, *Documenti*, *Memoria*, *Avanzate*.
  - Aggiornate tutte le schermate principali ([`App.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/App.tsx), [`AiPanel.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/AiPanel.tsx), [`KnowledgePanel.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/KnowledgePanel.tsx), [`SemanticEngineSettings.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/SemanticEngineSettings.tsx), [`SetupWizardModal.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/SetupWizardModal.tsx), [`DocumentReaderModal.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/DocumentReaderModal.tsx), [`SourceDetailsModal.tsx`](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/apps/desktop/src/SourceDetailsModal.tsx)) con rendering bilingue istantaneo.

### F. Rilascio Ufficiale macOS LIMEN Vault v7Mini (0.7.0)
- **Allineamento Versioning**: Impostato `LIMEN Vault v7Mini` e versione `0.7.0` in `tauri.conf.json`, `package.json`, `HelpPanel.tsx` e nella documentazione.
- **Pipeline di Packaging e Notarizzazione (`scripts/package-v7mini-macos.sh`)**:
  - Compilazione frontend Vite/React reale da worktree pulito con verifica anti-segnaposto.
  - Compilazione release bundle con Tauri (`--bundles app --no-sign`).
  - Firma profonda Developer ID (`E01892F9C136DA67B393B9CD29AF97E369956968`) con Hardened Runtime ed Entitlements per librerie native (`native/`), helper MCP (`mcp/`) e bundle applicativo.
  - **Notarizzazione Apple App**: Accettata ufficialmente (`status: Accepted`, id: `0a7df268-0801-4537-9fe4-390652c66766`), ticket graffettato con `xcrun stapler staple`.
  - Creazione DMG compresso UDZO e firma Developer ID.
  - **Notarizzazione Apple DMG**: Accettata ufficialmente (`status: Accepted`, id: `626432c1-1f18-44c0-8132-4fdaa8e454ae`), ticket graffettato con `xcrun stapler staple`.
  - **Validazione Gatekeeper**: `spctl --assess --type execute` e `--type open` superati con esito `accepted, source=Notarized Developer ID`.
- **Artefatto Finale Distribuito**:
  - Percorso: `USER INSTALL/LIMEN-Vault-v7Mini.dmg`
  - Dimensione: `51113656 byte` (~51,1 MB)
  - Hash SHA-256: `4d11ba254877762ece89cb334717164d8418b0e2181444b8363994f6134d6c38`

---

## 2. Stato della Compilazione e Collaudo
- `pnpm typecheck`: Superato con successo su tutti gli 11 package del monorepo (Exit Code 0).
- `pnpm test` desktop: 6 suite e tutti i test di integrità e contratti IPC superati (Exit Code 0).
- `cargo test llama_llm --lib`: 10/10 test unitari superati con successo (Exit Code 0).
- `scripts/package-v7mini-macos.sh`: Eseguito con successo (Exit Code 0).
- DMG installatore pronto: `USER INSTALL/LIMEN-Vault-v7Mini.dmg` (firmato e notarizzato Apple).
- Git status: Albero di lavoro pulito, ogni fase committata atomicamente su branch `windows-build`.


