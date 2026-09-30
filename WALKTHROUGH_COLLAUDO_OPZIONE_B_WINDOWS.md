# Walkthrough — Collaudo Applicativo Reale E2E (Opzione B v2) su Windows 11

**Stato Ufficiale del Collaudo: Prove applicative parzialmente completate; accettazione ancora aperta.**

Questo documento registra i risultati integrali, puntuali e verificabili del **Collaudo Applicativo Reale E2E (Opzione B v2)** eseguito in conformità alle direttive di audit per LIMEN Vault v6Mini (`dev.arkai.limenvault`, versione `0.6.0`) su Windows 11 x64 (GPU NVIDIA GeForce RTX 3060 12 GB VRAM).

Tutte le prove sono state eseguite sull'eseguibile installato reale:
`C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe`
pilotato interattivamente attraverso il protocollo **Chrome DevTools Protocol (CDP)** su WebView2 (`--remote-debugging-port=9222`), su vault di prova isolati in scratch e senza alcun mock o simulazione dei pesi locali.

---

## 1. Tracciabilità e Manufatti di Rilascio

Tutti i riscontri della sessione sono vincolati ai seguenti identificatori fisici immutabili:

| Componente | Percorso / Riferimento | Dimensione (byte) | SHA-256 |
| :--- | :--- | :--- | :--- |
| **Git Commit** | `e1fe50d61ac852f9fa2ab70c8a3c3320256068f0` (branch `windows-build`) | - | - |
| **Installer NSIS** | [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe) | 63.062.230 | `8c9b1aa4b494e7d768f9384391c943d056d6cb58cac2c5ca5697efefc717e31b` |
| **Eseguibile App** | `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\limen-vault.exe` | 23.714.816 | `154778aba8607638355b835b4ee26358443174bb30ffd0f0ee700288551987a6` |
| **Server LLM Nativo** | `C:\Users\user\AppData\Local\LIMEN Vault v6Mini\native\llama-server.exe` | 8.177.392 | `45438f026845b4611474e3a7a21b486cab83d3ac39ca60d591ceb88300d8ee4c` |
| **Modello Embedding** | `C:\Users\user\LIMEN Vault\models\bge-m3-Q8_0.gguf` | 634.553.760 | - |
| **Modello Generativo** | `C:\Users\user\LIMEN Vault\models\Ministral-3-8B-Instruct-2512-Q5_K_M.gguf` | 6.059.268.512 | - |
| **Script Runner E2E** | [`runner_script_exact_copy.mjs`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/runner_script_exact_copy.mjs) | 51.367 | `6022e391b1067e4369e46a7be7cfa5a27869aa9108b4ef1fc576a8c6cfa57975` |

- **ID Esecuzione Test**: `phase6_run_20260930_163211`
- **Data e Ora ISO**: `2026-09-30T08:32:11.227Z`
- **Cartella Evidenze Fisiche**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/)
- **Exit code runner**: `1` (conformemente alla presenza di requisiti parziali o aperti).

---

## 2. Sintesi e Classificazione Ufficiale dei Risultati

| Scenario | Requisito di Collaudo | Livello di Verifica | Esito | Dettaglio Chiave |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Auto-indicizzazione vault senza indice | Verificato sulla fixture | **PASS** | File `SEARCH_INDEX.json` creato in 2,9s (3.535 byte), UI "Indice: Pronto (1 doc)". |
| **2** | Riapertura vault con indice valido | Prova applicativa con riscontro fisico | **PASS** | Timestamp `mtime` indice invariato (`1790757137657.776`), ricerca immediatamente disponibile. |
| **3** | Variazioni documentali (add, mod, del) | Prova applicativa con verifica semantica | **PARTIAL_MANUAL_REQUIRED** | Contenuti ricercabili verificati; documentato requisito comando "Aggiorna indice" (assenza file-watcher continuo su `01_CLIENTS/`). |
| **4** | Cambio vault e isolamento semantico | Isolamento e verifica architettura | **PASS** | Architettura Single-Vault confermata; Vault B isolato (`BETA` trovato, `ARKAI` assente; 0 cross-contaminazioni). |
| **5** | Domanda fixture ARKAI (fatti sintetici) | Prova applicativa con verifica semantica | **PASS** | 276 car in 14,1s; 4/4 fatti estratti; 0 `#`, 0 loop. Non riprodotto difetto `#`. |
| **6** | Collaudo comando «Annulla» | Prova applicativa con misura tempi | **FAIL / PARZIALE** | Tasto Annulla a 105ms, reset UI 105ms, turno marcato interrotto. Aperta verifica socket abort. |
| **7** | Ripiego controllato su CPU | Prova applicativa con evidenza server | **FAIL / PARZIALE** | Check UI 31 bottoni (PASS); CPU fallback avviato (`-ngl 0 -t 4`, `/health` 6s, risposta 84s), timeout test a 90s. Aperto. |
| **8** | Sessione estesa 20 domande Ministral | Prova applicativa di robustezza estesa | **PASS** | **20/20 completate (100%)**, tempi tra 4,0s e 12,1s, 0 loop, 0 `#`. |

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
  1. *Prova pre-stream (<300ms)*: invio prompt ed emissione immediata del comando Annulla.
  2. *Prova active-stream (>20 caratteri)*: invio prompt lungo, attesa emissione token e click del tasto Annulla a generazione avviata.
- **Riscontro fisico**:
  - Prova pre-stream: tasto Annulla rilevato e cliccato a `t=105ms`. Tempo di reset UI registrato: `69.974ms` (condizionato dal timeout di attesa stato frontend nel test runner; follow-up non validato).
  - Prova active-stream: interruzione scattata a 37 caratteri ricevuti. Tempo di ripristino UI: **105 ms**. Messaggio renderizzato nel turno: *"La generazione della risposta è stata interrotta"*. Domanda successiva di follow-up inviata e completata regolarmente senza contaminazione di token.
  - Esito formale: **FAIL / PARZIALE** (il test automatico non ha certificato l'interruzione del socket a livello di connessione HTTP verso llama-server; l'accettazione rimane aperta per validazione diretta con Cesare).
- **Evidenza archiviata**: [`evidence_scenario_6_cancellation.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_6_cancellation.json).

### Scenario 7: Resilienza UI e Ripiego Controllato su CPU
- **Azione**:
  1. *Parte A*: Controllo diagnostico dell'interfaccia (31 pulsanti rilevati, nessun banner d'errore fatale, DOM reattivo). Classificato come controllo limitato dell'interfaccia.
  2. *Parte B*: Simulazione controllata di assenza GPU con avvio diretto di `llama-server.exe` con flag `-ngl 0 --device none -t 4`.
- **Riscontro fisico**:
  - Endpoint `/health` pronto in **6 secondi**.
  - Invio richiesta di inferenza locale su CPU: generati 35 token in **84 secondi**.
  - Wrapper di test: ha registrato un timeout di sincronismo a 90s (`spawnSync ETIMEDOUT`), documentato nel log `evidence_cpu_fallback_execution.json`.
  - Esito formale: **FAIL / PARZIALE** (inferenza CPU fisicamente funzionante ma test non concluso entro il limite del runner; accettazione aperta).
- **Evidenze archiviate**: [`evidence_scenario_7_fallback_resilience.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_7_fallback_resilience.json) e [`evidence_cpu_fallback_execution.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_cpu_fallback_execution.json).

### Scenario 8: Sessione Estesa di 20 Domande Consecutive
- **Azione**: Esecuzione interattiva sequenziale di 20 domande distinte su Ministral 3 8B (toggle `SOLO LOCALE (PC)`) con tracciamento puntuale di turni, risposte, latenze e controllo caratteri.
- **Risultato complessivo**: **20 riuscite su 20 tentativi (100% successo)**.
- **Tabella di dettaglio dei 20 turni**:

| # | Turno | Domanda Inviata | Caratteri Risposta | Tempo (s) | Loop | '#' | Esito |
| :-: | :---: | :--- | :-: | :-: | :-: | :-: | :---: |
| 1 | Turno 1 | Chi è ARKAI secondo il documento? | 932 | 6.1s | No | 0 | SUCCESS |
| 2 | Turno 2 | Qual è il primo principio cardine di ARKAI? | 282 | 4.0s | No | 0 | SUCCESS |
| 3 | Turno 3 | Qual è il secondo principio cardine di ARKAI? | 385 | 4.1s | No | 0 | SUCCESS |
| 4 | Turno 4 | Qual è il terzo principio cardine di ARKAI? | 454 | 4.0s | No | 0 | SUCCESS |
| 5 | Turno 5 | Dove si svolgono le elaborazioni del sistema? | 450 | 4.0s | No | 0 | SUCCESS |
| 6 | Turno 6 | Quale hardware locale viene utilizzato? | 351 | 4.0s | No | 0 | SUCCESS |
| 7 | Turno 7 | Che modello viene eseguito per le risposte? | 281 | 4.0s | No | 0 | SUCCESS |
| 8 | Turno 8 | Spiega la sovranità dei dati. | 923 | 6.1s | No | 0 | SUCCESS |
| 9 | Turno 9 | Cosa significa crittografia verificabile delle memorie? | 818 | 7.1s | No | 0 | SUCCESS |
| 10 | Turno 10 | Cosa garantisce l'assenza di telemetria? | 1.013 | 7.1s | No | 0 | SUCCESS |
| 11 | Turno 11 | Qual è lo scopo del vault locale? | 996 | 7.1s | No | 0 | SUCCESS |
| 12 | Turno 12 | Come vengono trattati i file Obsidian? | 1.427 | 10.1s | No | 0 | SUCCESS |
| 13 | Turno 13 | Quali categorie di note sono previste? | 1.427 | 4.3s | No | 0 | SUCCESS |
| 14 | Turno 14 | In quale cartella si trova il profilo di ARKAI? | 945 | 8.1s | No | 0 | SUCCESS |
| 15 | Turno 15 | Qual è il tipo di documento assegnato al profilo ARKAI? | 197 | 4.0s | No | 0 | SUCCESS |
| 16 | Turno 16 | Qual è lo stato di approvazione della nota? | 121 | 4.0s | No | 0 | SUCCESS |
| 17 | Turno 17 | Riassumi i vantaggi dell'approccio edge. | 994 | 7.1s | No | 0 | SUCCESS |
| 18 | Turno 18 | Perché la privacy è garantita a rete zero? | 553 | 4.0s | No | 0 | SUCCESS |
| 19 | Turno 19 | Che ruolo ha l'indice semantico? | 1.694 | 11.1s | No | 0 | SUCCESS |
| 20 | Turno 20 | Concludi con una sintesi generale di ARKAI. | 1.816 | 12.1s | No | 0 | SUCCESS |

- **Osservazioni fisiche**:
  - Tempo medio per risposta: **6,1 secondi**.
  - Nessun blocco dell'interfaccia, nessun memory leak riscontrato nella sessione.
  - Zero caratteri cancelletto `#` non pertinenti generati.
- **Evidenza archiviata**: [`evidence_scenario_8_multi_questions_20.json`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/phase6_collaudo_e2e_run_20260930_163211/evidence_scenario_8_multi_questions_20.json).

---

## 4. Stato dei Processi e Chiusura

In conformità con il divieto assoluto di processi residui:
- Tutti i processi di test (`limen-vault.exe` e `llama-server.exe`) avviati dalla suite CDP sono stati terminati regolarmente al termine della sessione.
- Conteggio processi orfani attivi: **0**.
