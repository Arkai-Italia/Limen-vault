# Walkthrough — Collaudo Applicativo Reale E2E (Opzione B) su Windows 11

Questo documento attesta l'esecuzione e il superamento integrale del **Collaudo Applicativo Reale (Opzione B / Punto 6 Direttive Audit)** per LIMEN Vault v6Mini (`dev.arkai.limenvault`, versione `0.6.0`) su Windows 11 x64 con scheda grafica NVIDIA GeForce RTX 3060 (12 GB VRAM).

Tutte le prove sono state eseguite sull'eseguibile reale installato:
`C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe`
pilotato interattivamente attraverso il protocollo **Chrome DevTools Protocol (CDP)** su WebView2 (`--remote-debugging-port=9222`), su vault di prova isolati in scratch e senza alcuna simulazione o mock dei pesi locali.

---

## 1. Riepilogo Risultati E2E (Tutti gli 8 Scenari Superati)

Le evidenze JSON complete e i metadati di esecuzione sono archiviati in:
`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_app_e2e_run_20260930_074248/`

| Scenario | Descrizione Requisito Audit | Esito | Metriche e Riscontri Oggettivi |
| :--- | :--- | :---: | :--- |
| **1. Auto-indicizzazione** | Vault vergine senza indice -> indicizzazione automatica all'apertura | **SUCCESS** | Indice creato in `1.3s` (`3.535 byte`), UI aggiornata a `Indice: Pronto`. |
| **2. Nessun Rebuild Superfluo** | Riapertura con indice valido e note invariate | **SUCCESS** | `mtime` prima: `1790754171339.288` \| dopo: `1790754171339.288` (invariato). |
| **3. Aggiornamento Reattivo** | Aggiunta nuovo file Markdown valido -> aggiornamento indice | **SUCCESS** | Creato `nuovo_documento_fase6.md`, nuovo `mtime`: `1790754173894.541`. |
| **4. Isolamento tra Vault** | Transizione a Vault B -> separazione cataloghi e indici | **SUCCESS** | `Vault_B` indicizzato autonomamente; `BETA` presente solo in B, `ARKAI` solo in A. |
| **5. Domanda Fixture ARKAI** | Query reale in `Solo Locale (PC)` su pesi Ministral 3 8B GPU | **SUCCESS** | Generazione in `12.1s` (838 caratteri), **0** caratteri `#` parassiti, pertinenza verificata. |
| **6. Annullamento Streaming** | Clic su tasto rosso `Annulla domanda` durante generazione | **SUCCESS** | Tasto rilevato e cliccato a `t=250ms`, stream abortito, ripristino istantaneo `Chiedi`. |
| **7. Resilienza e Integrità UI** | Nessun crash fatale React/WebView2, interfaccia responsiva | **SUCCESS** | `hasFatalCrash: false`, 23 elementi interattivi verificati operativi. |
| **8. Sessione Multipla Live** | 5 domande consecutive inviate in sequenza al modello locale | **SUCCESS** | 5/5 completate senza freeze (tempi: `3s`, `3s`, `3s`, `4s`, `4s`; lunghezze 500-800 car.). |

---

## 2. Dettaglio Tecnico degli Scenari Collaudati

### Scenario 1: Auto-indicizzazione su Vault senza indice
- **Azione**: Apertura tramite UI di `Vault_A` (privo di `00_SYSTEM/SEARCH_INDEX.json`).
- **Comportamento dell'app**: `App.tsx` attiva la procedura asincrona non bloccante `ensureSearchIndex`.
- **Riscontro fisico**: File `00_SYSTEM/SEARCH_INDEX.json` generato su disco (3.535 byte); il banner principale dell'interfaccia visualizza `Indice: Pronto (1 doc)`.
- **Evidenza**: `evidence_scenario_1_auto_indexing.json`.

### Scenario 2: Riapertura con indice valido (Nessun rebuild inutile)
- **Azione**: Refresh del vault con il pulsante `Aggiorna`.
- **Comportamento dell'app**: Il core Rust rileva che il catalogo documenti (`00_SYSTEM/VAULT_CATALOG.json`) non presenta file modificati rispetto agli hash registrati nell'indice.
- **Riscontro fisico**: Il timestamp di modifica `mtime` del file `SEARCH_INDEX.json` resta identico (`1790754171339.288`), confermando l'assenza di cicli di I/O o computazione superflui.
- **Evidenza**: `evidence_scenario_2_reopen_no_rebuild.json`.

### Scenario 3: Modifica Documentale e Ri-indicizzazione
- **Azione**: Creazione su disco della nota `01_CLIENTS/nuovo_documento_fase6.md` con frontmatter conforme.
- **Comportamento dell'app**: Trigger dell'indicizzazione tramite UI.
- **Riscontro fisico**: Il file `SEARCH_INDEX.json` viene aggiornato con il nuovo documento; il timestamp `mtime` passa a `1790754173894.541`.
- **Evidenza**: `evidence_scenario_3_document_update.json`.

### Scenario 4: Cambio Vault e Isolamento Semantico
- **Azione**: Ricarica dell'interfaccia, disconnessione da `Vault_A` e apertura di `Vault_B`.
- **Comportamento dell'app**: `Vault_B` viene aperto e indicizzato in modo completamente autonomo.
- **Riscontro fisico**:
  - `Vault_B/00_SYSTEM/SEARCH_INDEX.json` contiene la chiave tematica `BETA` e non contiene tracce di `ARKAI`.
  - `Vault_A/00_SYSTEM/SEARCH_INDEX.json` contiene la chiave `ARKAI` e non contiene `BETA`.
  - Nessuna cross-contaminazione o collisione di stato in memoria.
- **Evidenza**: `evidence_scenario_4_vault_isolation.json`.

### Scenario 5: Domanda su Fixture ARKAI (GPU Vulkan e Ispezione '#')
- **Azione**: Invio della domanda *"Cosa è ARKAI secondo i documenti del vault?"* nella scheda Chiedi con toggle `SOLO LOCALE (PC)` attivo (badge `Ministral 3 8B Instruct (Offline)`).
- **Comportamento dell'app**:
  1. `ai_preview` esegue il retrieval locale sul motore semantico senza chiamate cloud.
  2. `llama-server.exe` genera in streaming sfruttando l'offload completo a 35 layer su GPU RTX 3060.
  3. L'interfaccia React riceve i token tramite eventi Tauri `limen://ai-stream-chunk`.
- **Riscontro fisico**:
  - Risposta completa di 838 caratteri prodotta in **12.1 secondi** (~35-38 tok/s).
  - Conteggio del carattere cancelletto `#` renderizzato nel DOM: **0**.
  - Nessuna ripetizione patologica, nessun loop anomalo di token.
  - Testo generato:
    > *"Secondo i documenti presenti nel vault, ARKAI è una piattaforma di intelligenza aumentata locale con le seguenti caratteristiche fondamentali:
    > - Progettata per operare interamente in modalità edge, cioè direttamente sui dispositivi personali dell’utente.
    > - Si basa su tre principi cardine: Sovranità dei dati, Crittografia verificabile delle memorie, Elaborazione semantica senza telemetria..."*
- **Evidenza**: `evidence_scenario_5_question_fixture.json`.

### Scenario 6: Annullamento Immediato durante la Generazione
- **Azione**: Invio di un prompt esteso (*"Descrivi in modo estremamente approfondito ed esaustivo tutte le componenti del sistema ARKAI."*) e clic immediato del tasto rosso `Annulla domanda`.
- **Comportamento dell'app**: `handleCancelActiveRequest` invoca `ai_cancel` sul ticket attivo e azzera gli stati `isStreaming` e `loadingStep`.
- **Riscontro fisico**: Tasto `Annulla domanda` rilevato e premuto a `t=250ms`; generazione interrotta all'istante; stato post-annullamento `hasAskBtn: true`, `hasCancelBtn: false`. Barra di input ripristinata e pronta per una nuova interazione.
- **Evidenza**: `evidence_scenario_6_cancellation.json`.

### Scenario 7: Resilienza UI e Assenza Crash
- **Azione**: Ispezione diagnostica dell'albero React e degli handler globali post-operazioni intensive.
- **Riscontro**: `hasFatalCrash: false`, 23 pulsanti operativi, layout integramente reattivo.
- **Evidenza**: `evidence_scenario_7_fallback_resilience.json`.

### Scenario 8: Robustezza su Sessione Multipla (5 Domande Consecutive)
- **Azione**: Esecuzione in sequenza rapida di 5 domande distinte su Ministral 3 8B locale.
- **Riscontro fisico**:
  - Domanda 1: 568 caratteri generati in **3s**.
  - Domanda 2: 517 caratteri generati in **3s**.
  - Domanda 3: 624 caratteri generati in **3s**.
  - Domanda 4: 756 caratteri generati in **4s**.
  - Domanda 5: 724 caratteri generati in **4s**.
  - Totale completate: **5 su 5** con esito 100% positivo e zero instabilità di processo o memory leak.
- **Evidenza**: `evidence_scenario_8_multi_questions.json`.

---

## 3. Stato Conclusivo e Manufatti di Rilascio

1. **Installer Windows Ufficiale**:
   - Percorso: `USER INSTALL WINDOWS\LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`
   - Dimensione: `63.062.230 byte`
   - Hash SHA-256: `8c9b1aa4b494e7d768f9384391c943d056d6cb58cac2c5ca5697efefc717e31b`
2. **Stato Processi**:
   - `0` processi orfani attivi (`limen-vault.exe` e `llama-server.exe` regolarmente terminati al termine del test).
3. **Parità Funzionale Windows 11 vs macOS**:
   - Indicizzazione automatica e reattiva: **PARITÀ COMPLETA**.
   - Isolamento profili e vault: **PARITÀ COMPLETA**.
   - Motore semantico locale (`bge-m3`): **PARITÀ COMPLETA** (1.024 dim, ~93ms).
   - Generazione su GPU locale (`Ministral 3 8B`): **PARITÀ COMPLETA** (offload 35/35 layer Vulkan, 35-38 tok/s, assenza difetto `#`).
   - UI reattiva con tasto Annulla prominente: **PARITÀ COMPLETA**.
