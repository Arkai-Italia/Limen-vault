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
- Creato `scripts/sanitize_vault.mjs`:
  - **Unico script autonomo**: trova automaticamente tutti i Vault su disco oppure accetta un percorso specifico come argomento.
  - **Zero file di backup**: nessun file o cartella `.bak` o copia transitoria creata.
  - **Sostituzione istantanea**: rimpiazza tutte le occorrenze di "Michele Bondani" con `[RIFERIMENTO_RISERVATO]` su Markdown, TXT, JSON, YAML senza cancellare i file.
  - Eseguito con successo su tutti i 5 Vault di test in `tests/scratch/` (96 file sanificati, 512 occorrenze corrette, 0 residui trovati dalla verifica).

### D. Manuali Utente Verificati e Aggiornati
- [manuale UI utente.txt](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/manuale%20UI%20utente.txt):
  - Inserito il **diagramma Mermaid della Mappa dei Menu e Flussi di Navigazione** (Barra Sinistra -> Chiedi / Documenti / Memoria / Avanzate, Sottomenu, Cassetto Fonti e Document Reader).
  - Guida operativa click-by-click su come muoversi nei menu.
  - Diagrammi Mermaid per i 4 workflow operativi (Setup Wizard, Chiedi con Fonti e Lettore, Carica Documenti, Snapshot).
  - Tabella comparativa dei 6 modelli del catalogo con RAM minima e consigliata.
- [MANUALE UTENTE.MD](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/MANUALE%20UTENTE.MD):
  - Inseriti i diagrammi Mermaid completi della mappa dei menu, della sequenza di interazione e dei workflow operativi, rendendolo un documento visivo pronto per presentazioni in Markdown e Obsidian.

---

## 2. Stato della Compilazione e Collaudo
- `pnpm typecheck`: Superato con successo su tutti gli 11 package del monorepo (Exit Code 0).
- `cargo test llama_llm --lib`: 10/10 test unitari superati con successo (Exit Code 0).
- Git status: Albero di lavoro pulito, ogni fase committata atomica su branch `windows-build`.
