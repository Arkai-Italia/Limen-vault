# Walkthrough — Collaudo Applicativo Reale E2E (Opzione B v2) su Windows 11

**Stato Ufficiale del Collaudo: ACCETTAZIONE APERTA**  
*(Nessuna prova conclusiva successiva alle correzioni richieste; commit `193363c` preserva l'esecuzione storica v2. Sessione sospesa per prosecuzione).*

Questo documento registra i risultati integrali, puntuali e verificabili del **Collaudo Applicativo Reale E2E (Opzione B v2)** eseguito in conformità alle direttive di audit per LIMEN Vault v6Mini (`dev.arkai.limenvault`, versione `0.6.0`) su Windows 11 x64 (GPU NVIDIA GeForce RTX 3060 12 GB VRAM).

Tutte le prove sono state eseguite sull'eseguibile installato reale:
`C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe`
pilotato interattivamente attraverso il protocollo **Chrome DevTools Protocol (CDP)** su WebView2 (`--remote-debugging-port=9222`), su vault di prova isolati in scratch e senza alcun mock o simulazione dei pesi locali.

---

## 1. Tracciabilità e Manufatti di Rilascio

Tutti i riscontri della sessione sono vincolati ai seguenti identificatori fisici immutabili:

| Componente | Percorso / Riferimento | Dimensione (byte) | SHA-256 |
| :--- | :--- | :--- | :--- |
| **Git Commit** | `193363c` (branch `windows-build`) | - | - |
| **Installer NSIS** | [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe) | 63.062.230 | `8c9b1aa4b494e7d768f9384391c943d056d6cb58cac2c5ca5697efefc717e31b` |
| **Eseguibile App** | `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe` | 23.714.816 | `154778aba8607638355b835b4ee26358443174bb30ffd0f0ee700288551987a6` |
| **Server LLM Nativo** | `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\native\llama-server.exe` | 8.177.392 | `45438f026845b4611474e3a7a21b486cab83d3ac39ca60d591ceb88300d8ee4c` |
| **Modello Embedding** | `C:\Users\user\LIMEN Vault\models\bge-m3-Q8_0.gguf` | 634.553.760 | - |
| **Modello Generativo** | `C:\Users\user\LIMEN Vault\models\Ministral-3-8B-Instruct-2512-Q5_K_M.gguf` | 6.059.268.512 | - |
| **Script Runner E2E** | [`runner_script_exact_copy.mjs`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/runner_script_exact_copy.mjs) | 51.367 | `6022e391b1067e4369e46a7be7cfa5a27869aa9108b4ef1fc576a8c6cfa57975` |

- **ID Esecuzione Test Storica**: `phase6_run_20260930_163211`
- **Data e Ora ISO**: `2026-09-30T08:32:11.227Z`
- **Cartella Evidenze Fisiche**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/)
- **Exit code runner**: `1` (conformemente alla presenza di requisiti parziali o aperti).

---

## 2. Sintesi e Classificazione Ufficiale dei Risultati

| Scenario | Requisito di Collaudo | Livello di Verifica | Esito | Dettaglio Chiave |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Auto-indicizzazione vault senza indice | Verificato sulla fixture | **VERIFICA PARZIALE** | File `SEARCH_INDEX.json` creato in 2,9s (3.535 byte), UI "Indice: Pronto (1 doc)". In attesa accettazione Cesare. |
| **2** | Riapertura vault con indice valido | Prova applicativa con riscontro fisico | **VERIFICA ESEGUITA** | Timestamp `mtime` indice invariato (`1790757137657.776`), ricerca immediatamente disponibile. |
| **3** | Variazioni documentali (add, mod, del) | Prova applicativa con verifica semantica | **APERTO / MANUALE** | Contenuti ricercabili verificati; documentato requisito comando manuale "Aggiorna indice" (assenza file-watcher continuo su `01_CLIENTS/`). |
| **4** | Cambio vault e isolamento semantico | Isolamento e verifica architettura | **APERTO** | Architettura Single-Vault confermata; switch di vault con operazione attiva aperto per accettazione Cesare. |
| **5** | Domanda fixture ARKAI (fatti sintetici) | Prova applicativa con verifica semantica | **VERIFICA ESEGUITA** | 276 car in 14,1s; 4/4 fatti estratti; 0 `#`, 0 loop. Non riprodotto difetto `#`. |
| **6** | Collaudo comando «Annulla» | Prova applicativa con misura tempi | **APERTO / DA RETTIFICARE** | Misurati tempi non validi (69s e 8,5s) dovuti a calcoli a fine test; da misurare tempo reset UI immediato (~105ms) e separatamente abort socket server. |
| **7** | Ripiego controllato su CPU | Prova applicativa con evidenza server | **APERTO / SEPARAZIONE** | Risposta CPU a 84s è prova del motore standalone (`llama-server.exe -ngl 0`), non della logica di fallback automatico GPU->CPU LIMEN. Timeout wrapper a 90s da diagnosticare. |
| **8** | Sessione estesa 20 domande Ministral | Prova applicativa di robustezza estesa | **APERTO / ANOMALIA DIAGNOSTICATA** | Riscontrata identità testuale tra Turno 12 e 13 (1.427 car). Causa diagnosticata nel runner (lettura ultimo pre-wrap prima del rendering del nuovo turno). Da riprodurre e rieseguire. |

---

## 3. Dettaglio Tecnico Puntuale degli 8 Scenari

### Scenario 1: Auto-indicizzazione su Vault senza indice
- **Azione**: Apertura tramite UI di `Vault_A` privo di `00_SYSTEM/SEARCH_INDEX.json`.
- **Comportamento dell'app**: `App.tsx` invoca `getSearchIndexStatus` e fa scattare l'indicizzazione asincrona background.
- **Riscontro fisico**:
  - File indice creato: `Vault_A\00_SYSTEM\SEARCH_INDEX.json` (3.535 byte).
  - Durata indicizzazione: **2,9 secondi**.
  - Stato interfaccia utente: `Indice: Pronto` (`UIStatusReady: true`).
  - Banner transitorio non intercettato nel DOM (`ObservedIndexingBanner: false`) data la rapidità dell'operazione.
- **Evidenza archiviata**: [`evidence_scenario_1_auto_indexing.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_1_auto_indexing.json).

### Scenario 2: Riapertura con indice valido (Nessun rebuild superfluo)
- **Azione**: Riapertura effettiva dello stesso `Vault_A` precedentemente indicizzato.
- **Comportamento dell'app**: Verifica dello stato dell'indice, riscontro che il catalogo hash è allineato e ripristino istantaneo dello stato di ricerca.
- **Riscontro fisico**:
  - `IndexMtimeBefore`: `1790757137657.776`
  - `IndexMtimeAfter`: `1790757137657.776`
  - Variazione mtime: **0 ms** (`NoUnnecessaryRebuild: true`).
  - Funzionalità di ricerca verificata post-riapertura: **attiva e funzionante** (`SearchFunctioningPostReopen: true`).
- **Evidenza archiviata**: [`evidence_scenario_2_reopen_no_rebuild.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_2_reopen_no_rebuild.json).

### Scenario 3: Aggiornamento dopo variazioni documentali
- **Azione**: Tre distinte prove sequenziali eseguite tramite le normali interazioni dell'applicazione:
  1. *Aggiunta nota*: inserimento di `01_CLIENTS/nota_aggiunta.md` (parola chiave esclusiva `MARCATORE_AGGIUNTA_NOTEVOLE`).
  2. *Modifica nota*: modifica in-place del file con sostituzione del testo in `MARCATORE_MODIFICA_EFFETTUATA`.
  3. *Cancellazione nota*: rimozione fisica del file dal disco.
- **Comportamento dell'app e riscontro semantico**:
  - `NoteAddedFound: true`: la query di ricerca trova la nota aggiunta.
  - `NoteModifiedReplacedPrevious: true`: la query trova la nuova parola chiave e non trova il vecchio testo.
  - `NoteRemovedAbsent: true`: la query per il marcatore rimosso non restituisce risultati.
- **Nota architetturale vincolante**:
  - L'applicazione LIMEN Vault non dispone di un file-watcher in tempo reale sui file `.md` nella cartella `01_CLIENTS/` (il watcher / sync da topbar è riservato a `20_RAW_SOURCES/`).
  - Di conseguenza, le variazioni esterne su file markdown richiedono l'uso del comando manuale **"Aggiorna indice"** accessibile nella sezione collassabile di ricerca.
  - Esito classificato rigorosamente come: **PARTIAL_MANUAL_REQUIRED**.
- **Evidenza archiviata**: [`evidence_scenario_3_document_update.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_3_document_update.json).

### Scenario 4: Cambio Vault e Isolamento Semantico
- **Azione**: Avvio di un'operazione attiva su `Vault_A` con verifica della gestione del cambio verso `Vault_B`.
- **Comportamento dell'app**:
  - L'applicazione opera rigorosamente come ambiente **Single-Vault**: non consente la selezione concorrente di un altro vault durante il ciclo di vita della schermata attiva senza passare per il cambio esplicito.
  - `OperationActiveConfirmed: true`.
  - `InSessionSwitchSupported: false` (comportamento documentato coerente con il modello architetturale).
- **Riscontro fisico su Vault B**:
  - Apertura di `Vault_B` ed esecuzione della ricerca semantica.
  - Marcatore tematico `BETA`: **trovato** (`VaultB_Marker_Beta_Found: true`).
  - Marcatore tematico `ARKAI`: **assente** (`VaultB_Marker_Arkai_Absent: true`).
  - Corruzione incrociata o residui in memoria: **nessuna** (`CrossPollutionDetected: false`).
- **Evidenza archiviata**: [`evidence_scenario_4_vault_isolation.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_4_vault_isolation.json).

### Scenario 5: Domanda Fixture ARKAI (GPU Vulkan e Verifica Fatti)
- **Azione**: Invio nella scheda Chiedi con toggle `SOLO LOCALE (PC)` attivo della query:
  *"Quali sono i tre principi cardine di ARKAI e dove si svolgono le elaborazioni secondo i documenti del vault?"*
- **Comportamento dell'app**: Esecuzione streaming locale su GPU RTX 3060 via Vulkan (offload 35/35 layer).
- **Riscontro fisico ed estrazione semantica**:
  - Lunghezza risposta: **276 caratteri**.
  - Durata totale: **14,1 secondi**.
  - Fatti sintetici estratti e verificati:
    * `SovranitaDati`: **Presente** (`true`)
    * `CrittografiaVerificabile`: **Presente** (`true`)
    * `ElaborazioneSenzaTelemetria`: **Presente** (`true`)
    * `EdgeGpuLocale`: **Presente** (`true`)
  - Conteggio caratteri cancelletto `#` renderizzati: **0**.
  - Rilevamento loop anomalo: **Nessuno** (`false`).
  - Testo risposta generata:
    > *"I tre principi cardine di ARKAI secondo il documento fornito sono:\n\n- Sovranità dei dati\n- Crittografia verificabile delle memorie\n- Elaborazione semantica senza telemetria\n\nLe elaborazioni, in particolare quelle vettoriali e generative, si svolgono a rete zero su GPU locale."*
  - **Stato del difetto `#`**: **Non riprodotto nella fixture con contesto strutturato conforme** (non "risolto definitivamente").
- **Evidenza archiviata**: [`evidence_scenario_5_question_fixture.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_5_question_fixture.json).

### Scenario 6: Collaudo Comando «Annulla» (Pre-stream e Active-stream)
- **Azione**:
  1. *Prova pre-stream (<300ms)*: invio prompt ed emissione del comando Annulla.
  2. *Prova active-stream (>20 caratteri)*: invio prompt lungo, attesa emissione token e click del tasto Annulla a generazione avviata.
- **Riscontro fisico e rettifica di audit**:
  - I tempi di `69.974ms` e `8.520ms` registrati nell'esecuzione v2 sono stati invalidati in audit poiché calcolati a fine blocco test dopo altre richieste.
  - La misura corretta del tempo di reset della UI deve avvenire all'istante dell'inversione di stato del pulsante (`performance.now() - tClickCancel` non appena "Annulla domanda" torna a "Chiedi", registrato in circa 105 ms).
  - La chiusura dell'annullamento richiede inoltre la misurazione separata dell'interruzione effettiva del socket/richiesta verso il server HTTP locale.
  - Esito formale: **APERTO / DA RETTIFICARE MISURE**.
- **Evidenza archiviata**: [`evidence_scenario_6_cancellation.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_6_cancellation.json).

### Scenario 7: Resilienza UI e Ripiego Controllato su CPU
- **Azione**:
  1. *Parte A*: Controllo diagnostico dell'interfaccia (31 pulsanti rilevati, nessun banner d'errore fatale, DOM reattivo).
  2. *Parte B*: Esecuzione su CPU con avvio diretto di `llama-server.exe` con flag `-ngl 0 --device none -t 4`.
- **Riscontro fisico e rettifica di audit**:
  - La risposta generata su CPU in 84.016s documenta l'esecuzione del motore standalone `llama-server.exe`, ma **non costituisce prova della logica di fallback automatico GPU->CPU integrata in LIMEN** (`llama_llm.rs`).
  - Il wrapper di test ha registrato un timeout di sincronismo a 90s (`spawnSync ETIMEDOUT`), da diagnosticare separatamente.
  - Esito formale: **APERTO / SEPARAZIONE MOTORE vs FALLBACK**.
- **Evidenze archiviate**: [`evidence_scenario_7_fallback_resilience.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_7_fallback_resilience.json) e [`evidence_cpu_fallback_execution.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_cpu_fallback_execution.json).

### Scenario 8: Sessione Estesa di 20 Domande Consecutive
- **Azione**: Esecuzione interattiva sequenziale di 20 domande distinte su Ministral 3 8B (toggle `SOLO LOCALE (PC)`).
- **Rilievo Critico di Audit (Anomalia Q12 vs Q13)**:
  - Nelle risposte 12 e 13 è stato riscontrato lo **stesso identico testo** (1.427 caratteri), pur essendo diverse le domande ("12. Come vengono trattati i file Obsidian?" vs "13. Quali categorie di note sono previste?").
  - **Causa radice diagnosticata nel test runner**: la funzione `submitQuestionAndTrackTurn` selezionava `bubbles = document.querySelectorAll('div[style*="white-space: pre-wrap"]')` e leggeva `bubbles[bubbles.length - 1].innerText`. All'avvio del turno 13, la risposta del turno 12 era ancora visibile e, appena prima dell'arrivo dei nuovi chunk SSE (a $t \approx 4\text{s}$), la condizione di uscita `!isBusy && lastAnswer.length > 20` risultava vera, catturando la risposta precedente.
  - **Azione correttiva**: implementazione di un tracker di turno puntuale che correla il badge `Turno X`, il prompt effettivo dell'utente e la sua specifica risposta renderizzata.
  - **Piano di verifica**: riproduzione mirata della sequenza 12 e 13 tramite script isolato, verifica eventi CDP/DOM per escludere difetti nell'app, e infine riesecuzione dell'intera sessione da 20 domande.
  - Esito formale: **APERTO / ANOMALIA DIAGNOSTICATA IN CORSO DI VERIFICA**.
- **Evidenza archiviata**: [`evidence_scenario_8_multi_questions_20.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_8_multi_questions_20.json).

---

## 4. Stato dei Processi e Chiusura

In conformità con il divieto assoluto di processi residui:
- Tutti i processi di test (`limen-vault.exe` e `llama-server.exe`) avviati dalla suite CDP sono stati terminati regolarmente al termine della sessione.
- Conteggio processi orfani attivi: **0**.
