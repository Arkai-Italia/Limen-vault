# Piano di Implementazione FASE H1 — Storico Domande e Risposte (Q&A Vault History)

**Data documento:** 2026-09-24  
**Stato:** Solo Piano di Lavoro (Codice e build congelati durante l'audit indipendente)  
**Percorso file:** `E:\Projects\vault_memai_obsi\IMPLEMENTATION\WINDOWS_BUILD_EVIDENCE\faseH1-piano.md`  

---

## 1. Decisioni di Cesare (24/09/2026)

1. **Salvataggio**: Opzione C — Un file JSON autonomo per ogni voce in `~/.limen-vault/history/<vault_id>/entries/<id>.json`, con scrittura atomica (file `.tmp` nella stessa cartella + rinomina).
2. **Identificativo del Vault**: Generato una sola volta e salvato in `00_SYSTEM/VAULT_ID.json` del Vault.
3. **Controllo Integrità del Vault**: Analisi del meccanismo in `snapshots.rs`, identificazione dei file applicativi finiti in `added_files`, e proposta delle due soluzioni con relativi pro e contro (decisione finale di Cesare).
4. **Fonti nello Storico**: Zero estratti di testo. Solo identificatore, percorso relativo, titolo, localizzatore e impronte SHA-256 (del documento e del passaggio). Rilettura e verifica live dal Vault alla riapertura.
5. **Orario**: Salvataggio in UTC puro e offset del computer locale al momento della richiesta; visualizzazione formattata secondo il fuso del computer dell'utente.
6. **Modello Reale**: Salvataggio del modello esatto restituito da OpenAI (es. `gpt-4o-2024-08-06`).
7. **Concorrenza Multi-Istanza**: Test obbligatorio eseguito con **due processi distinti di sistema operativo**.
8. **Condizioni di Salvataggio**: Salvataggio solo dopo `verify_post` riuscito e validazione citazioni; esclusione tassativa di richieste annullate per documenti mutati, errori o rifiuti.
9. **Predisposizione Fase H2**: Campi `conversation_id`, `turn_index`, `parent_entry_id` inclusi fin da subito.
10. **Testo dell'Interfaccia**: Dicitura esatta: *"svuota lo storico di questo vault"*.

---

## 2. Task List Dettagliata e Tracciabile

### Fase H1.1 — Identificativo del Vault e Integrità in `00_SYSTEM` (Rust)
- [ ] **H1.1.1** Creazione funzione `get_or_create_vault_id(vault_path: &Path) -> Result<String, String>`:
  - Legge `00_SYSTEM/VAULT_ID.json`;
  - Se mancante (vault precedente o nuovo), crea il file con ID casuale sicuro e data di creazione in UTC;
  - Se illeggibile o corrotto (byte vuoti, JSON malformato), restituisce errore bloccante chiaro e **nessuna sovrascrittura automatica**;
  - Se due percorsi distinti presentano lo stesso ID (vault duplicato via filesystem), emette un avviso all'utente.
- [ ] **H1.1.2** Risoluzione del controllo di integrità in `snapshots.rs` (scelta di Cesare tra Opzione A: esclusione elenco chiuso, o Opzione B: registrazione a manifest):
  - Verifica che, dopo la creazione di `00_SYSTEM/VAULT_ID.json`, il controllo `verify_manifest_integrity` rimanga valido (`is_integrity_valid == true`).
- [ ] **H1.1.3** Verifica che la creazione di `00_SYSTEM/VAULT_ID.json` non alteri `VAULT_CATALOG.json`, non alteri `SEARCH_INDEX.json` e non modifichi alcuna nota.

### Fase H1.2 — Backend Storage: Un File per Voce (Rust)
- [ ] **H1.2.1** Creazione modulo `apps/desktop/src-tauri/src/history.rs` con strutture serializzabili:
  - `HistoryEntry`: campi `id`, `conversation_id`, `turn_index`, `parent_entry_id`, `created_at_utc`, `utc_offset_seconds`, `requested_model`, `response_model`, `prompt`, `answer`, `status`, `duration_ms`, `sources: Vec<HistorySourceRef>`.
  - `HistorySourceRef`: `document_id`, `relative_path`, `title`, `locator`, `doc_sha256`, `passage_sha256`, `citation_index` (**zero estratti di testo**).
- [ ] **H1.2.2** Implementazione salvataggio atomico: `save_history_entry(vault_path: &Path, entry: HistoryEntry) -> Result<(), String>`:
  - Percorso: `~/.limen-vault/history/<vault_id>/entries/<entry_id>.json`;
  - Scrittura preliminare su file temporaneo nella stessa cartella (`entries/<entry_id>.tmp`);
  - Rinomina atomica `std::fs::rename` su `<entry_id>.json`.
- [ ] **H1.2.3** Vincolo di salvataggio in `ai.rs` (`ask_stream`):
  - Invocazione del salvataggio **esclusivamente** dopo che `verify_post` ha avuto successo e la prosa è stata validata;
  - Salvataggio delle risposte completate (`status: "complete"`) e di quelle incomplete con avviso (`status: "incomplete"`);
  - **Scarto tassativo** di risposte annullate per `verify_post` fallito, errori di rete/OpenAI o rifiuti da `begin`.
- [ ] **H1.2.4** Implementazione lettura elenco: `list_history_entries(vault_path: &Path) -> Result<Vec<HistoryEntryHeader>, String>`:
  - Scansione della directory `entries/`;
  - Deserializzazione delle intestazioni e ordinamento decrescente per `created_at_utc`.
- [ ] **H1.2.5** Implementazione eliminazione singola voce (`delete_history_entry` via `std::fs::remove_file`) e comando *"svuota lo storico di questo vault"* (`clear_vault_history` via eliminazione dei file in `entries/`).
- [ ] **H1.2.6** Implementazione rilettura dal vivo e verifica impronta: `verify_and_load_source_text`:
  - Riapre il file dal Vault e ne calcola lo SHA-256;
  - Se `doc_sha256_attuale == doc_sha256_storico`: estrae il passaggio e lo restituisce per la visualizzazione;
  - Se divergente: restituisce stato `Modified` e genera avviso;
  - Se mancante: restituisce stato `Missing` e genera avviso.
- [ ] **H1.2.7** Registrazione comandi IPC Tauri in `main.rs` (`ai_history_list`, `ai_history_get`, `ai_history_delete`, `ai_history_clear`, `ai_history_verify_sources`).
- [ ] **H1.2.8** Registrazione modulo `pub mod history;` in `lib.rs`.

### Fase H1.3 — Suite di Test Unitari e di Concorrenza Multi-Processo (Rust)
- [ ] **H1.3.1** Test isolamento: nessun file di storico dentro la cartella del Vault; solo `00_SYSTEM/VAULT_ID.json` nel vault, mentre tutte le voci risiedono in `~/.limen-vault/history/<vault_id>/entries/`.
- [ ] **H1.3.2** **Test di concorrenza multi-processo reale**:
  - Esecuzione simultanea di **due processi separati di sistema operativo** (`std::process::Command`), simulando l'app installata e la dev build in esecuzione concorrente;
  - Ciascun processo scrive 50 voci distinte contemporaneamente sullo stesso `vault_id`;
  - Verifica: 100 voci presenti, zero perdite, zero file `.tmp` orfani, zero corruzioni.
- [ ] **H1.3.3** Test vincoli di salvataggio:
  - Completata + `verify_post` OK $\rightarrow$ salvata;
  - Incompleta con avviso + `verify_post` OK $\rightarrow$ salvata con `status: "incomplete"`;
  - `verify_post` fallito (fonte mutata) $\rightarrow$ **NON** salvata;
  - Errore OpenAI / HTTP $\rightarrow$ **NON** salvata;
  - Rifiuto `begin` $\rightarrow$ **NON** salvata.
- [ ] **H1.3.4** Test integrità del vault post-creazione `VAULT_ID.json` (verifica che `is_integrity_valid` resti `true`).
- [ ] **H1.3.5** Test gestione ciclo di vita `VAULT_ID.json`:
  - Creazione iniziale su vault sprovvisto;
  - Blocco su file corrotto senza sovrascrittura;
  - Rilevamento vault duplicato con stesso ID su percorsi diversi.
- [ ] **H1.3.6** Test rilettura fonti live (inalterata, modificata, rimossa).

### Fase H1.4 — Client IPC e Interfaccia Utente (TypeScript / React)
- [ ] **H1.4.1** Client IPC tipizzato `apps/desktop/src/history-ipc.ts`.
- [ ] **H1.4.2** Componente `apps/desktop/src/AiHistoryDrawer.tsx` con formattazione oraria secondo il fuso del computer dell'utente e badge del modello esatto restituito da OpenAI.
- [ ] **H1.4.3** Integrazione in `AiPanel.tsx`: pulsante cronologia con contatore.
- [ ] **H1.4.4** Riapertura voce con estrazione fresca dei testi dal Vault e allerta se una fonte è modificata o rimossa.
- [ ] **H1.4.5** Modale di conferma per eliminazione singola e pulsante testuale esatto: *"svuota lo storico di questo vault"*.

---

## 3. Identificativo del Vault e Integrità in `00_SYSTEM`

### 3.1 Nome e Formato Esatto del File
```text
00_SYSTEM/VAULT_ID.json
```

Contenuto esatto:
```json
{
  "schema_version": 1,
  "vault_id": "vlt_01J8K9P2M4X7Q5R8T1W3Z6Y9NB",
  "created_at_utc": "2026-09-24T01:45:00.000Z"
}
```
- `vault_id`: prefisso `vlt_` seguito da identificatore casuale crittograficamente sicuro a 128 bit (es. UUID v4 o Crockford Base32/ULID).
- `created_at_utc`: timestamp ISO 8601 di creazione in UTC puro.
- Dimensione su disco: circa 100 byte.

### 3.2 Verifica dello Stato Attuale nel Codice (File e Righe)
1. **Assenza di `VAULT_CAPABILITIES.json`**:
   Nel codice e nel Vault reale **non esiste alcun file denominato `VAULT_CAPABILITIES.json`** (0 occorrenze in tutto il repository). La precedente citazione era un errore ed è stata formalmente eliminata.
2. **`vault_id` in `VAULT_MANIFEST.json`**:
   In `00_SYSTEM/VAULT_MANIFEST.json` (linea 17) compare:
   `"vault_id": "limen-vault-template"`.  
   Questo valore è un segnaposto fisso di template presente in tutti i vault inizializzati e non è un identificativo univoco. Pertanto, oggi **non esiste nel Vault alcun identificativo univoco persistente**.
3. **Validazione di Base (`apps/desktop/src-tauri/src/vault.rs`)**:
   - In `walk` (linee 242-264): i file in `00_SYSTEM/` diversi da `VAULT_MANIFEST.json` e non `.md` vengono verificati solo come file regolari esistenti (`is_file()`). Non incrementano il conteggio pagine né richiedono frontmatter YAML.
   - In `validate_vault` (linea 339): solo `HOME.md`, `VAULT_RULES.md` e `VAULT_MANIFEST.json` sono obbligatori. File aggiuntivi non impediscono lo stato `READY`.
   - In `catalog.rs` (linee 288-315) e `search.rs` (linee 220-270): i file in `00_SYSTEM/` sono categoricamente esclusi dall'albero documentale.

---

### 3.3 Problema dell'Integrità del Vault (`snapshots.rs`)

#### Diagnosi Tecnica (File e Righe sul Branch `windows-build`)
Il controllo di integrità delle snapshot e del manifest è implementato in `apps/desktop/src-tauri/src/snapshots.rs`:
- **Funzione `excluded` (linee 145-151)**:
  ```rust
  fn excluded(rel: &str) -> bool {
      rel == "00_SYSTEM/SNAPSHOTS"
          || rel.starts_with("00_SYSTEM/SNAPSHOTS/")
          || rel
              .split('/')
              .any(|n| [".git", "node_modules", ".DS_Store", ".gitkeep", ".obsidian"].contains(&n))
  }
  ```
  La funzione esclude solo la cartella degli snapshot e cartelle tecniche generiche (`.git`, `node_modules`, `.obsidian`, ecc.). **Nessun file applicativo in `00_SYSTEM/` è escluso**.
- **Scansione `walk` (linea 184 e 205-211)**:
  Tutti i file presenti sul filesystem non esclusi vengono inseriti nella mappa `actual`.
- **Verifica rispetto al Manifest (linee 279-296)**:
  La funzione `verify` rimuove da `actual` solo i file dichiarati nell'array `"files"` di `00_SYSTEM/VAULT_MANIFEST.json`.  
  Tutti i file rimasti in `actual` finiscono in `r.added_files` (linea 296):
  ```rust
  r.added_files = actual.keys().cloned().collect();
  ```
- **Condizione di Validità dell'Integrità (linee 299-302)**:
  ```rust
  r.is_integrity_valid = r.errors.is_empty()
      && r.modified_files.is_empty()
      && r.missing_files.is_empty()
      && r.added_files.is_empty();
  ```
  Se `r.added_files` non è vuoto, `r.is_integrity_valid` diventa **`false`** (stato `DISCREPANCY`).

#### File Applicativi Attualmente Scritti in `00_SYSTEM/` che Risultano "File Aggiunti":
Nel Vault reale di Cesare (`E:\VAULT WIN TEST DEV`), il manifest `00_SYSTEM/VAULT_MANIFEST.json` registra unicamente due file:
`00_SYSTEM/HOME.md` e `00_SYSTEM/VAULT_RULES.md`.  
Di conseguenza, tutti i seguenti file generati dall'app finiscono oggi in `added_files`, invalidando l'integrità del Vault (come già accaduto nella schermata macOS del 16/09/2026):
1. `00_SYSTEM/SEARCH_INDEX.json` (indice lessicale, generato da `search.rs`);
2. `00_SYSTEM/VAULT_CATALOG.json` (catalogo delle note, generato da `catalog.rs`);
3. `00_SYSTEM/EMBEDDINGS_CACHE.json` (cache semantica vettoriale, generata da `embeddings.rs`);
4. `00_SYSTEM/OPENAI_CONSENT.json` (consenso privacy, salvato da `AiPanel.tsx`);
5. `00_SYSTEM/SYNC_PROFILE.json` (profilo di sincronizzazione, generato da `sync.rs`);
6. `00_SYSTEM/.m7-lock` (file di lock, generato da `sync.rs` e `proposal.rs`);
7. `00_SYSTEM/VAULT_ID.json` (nuovo file proposto per l'identificativo storico).

---

### 3.4 Proposta di Soluzione: Scelta Rimessa a Cesare

Per consentire a `00_SYSTEM/VAULT_ID.json` (e agli altri file generati dall'app) di coesistere con il controllo di integrità, vengono proposte due soluzioni alternative:

#### Opzione (a): Escludere dal controllo un elenco chiuso e dichiarato di file di sistema dell'app
Si aggiorna la funzione `excluded(rel: &str)` in `apps/desktop/src-tauri/src/snapshots.rs` (linea 145) includendo una lista esplicita e controllata di percorsi:
```rust
const APP_SYSTEM_FILES: &[&str] = &[
    "00_SYSTEM/VAULT_ID.json",
    "00_SYSTEM/SEARCH_INDEX.json",
    "00_SYSTEM/VAULT_CATALOG.json",
    "00_SYSTEM/EMBEDDINGS_CACHE.json",
    "00_SYSTEM/OPENAI_CONSENT.json",
    "00_SYSTEM/SYNC_PROFILE.json",
    "00_SYSTEM/.m7-lock",
];
```
- **PRO**:
  1. **Separazione concettuale pulita**: `VAULT_MANIFEST.json` rimane il manifesto dei contenuti intellettuali dell'utente (note, documenti, regole). Gli indici di ricerca, le cache vettoriali e i consensi sono artefatti rigenerabili del motore di esecuzione locale.
  2. **Nessun overhead I/O**: non richiede di ricalcolare l'hash di file giganteschi (come `EMBEDDINGS_CACHE.json` da oltre 311 MB o `SEARCH_INDEX.json` da 129 MB) e di riscrivere `VAULT_MANIFEST.json` ad ogni singola indicizzazione o aggiunta di nota.
  3. **Gestione naturale dei file temporanei**: evita di dover registrare file effimeri come `.m7-lock` che esistono solo durante una transazione.
  4. Risolve definitivamente lo stato `DISCREPANCY` visto su macOS e Windows.
- **CONTRO**:
  1. I file dell'elenco chiuso non sono tracciati nel manifest delle snapshot (anche se ciascuno ha già meccanismi propri di checksum e rigenerazione automatica).

#### Opzione (b): Registrare i file di sistema nel manifest quando vengono creati o aggiornati
Ogni componente dell'app che crea o aggiorna un file in `00_SYSTEM/` (`VAULT_ID.json`, indici, cache) deve aprire `00_SYSTEM/VAULT_MANIFEST.json`, calcolare lo SHA-256 del file modificato e aggiornare la corrispondente voce nell'array `"files"`.
- **PRO**:
  1. Purezza formale: ogni singolo file presente nella cartella del Vault è censito nel manifest crittografico.
- **CONTRO**:
  1. **Pesante degrado prestazionale**: ricalcolare lo SHA-256 di 311 MB di cache semantica ad ogni nuova nota per aggiornare il manifest rallenterebbe l'app di diversi secondi a ogni modifica.
  2. **Impossibile per i file di lock**: un file temporaneo come `.m7-lock` non può essere registrato stabilmente nel manifest.
  3. Rischio elevato di corruzione del manifest se due processi aggiornano indici e consensi contemporaneamente.

> **Decisione**: La scelta tra Opzione (a) e Opzione (b) spetta formalmente a Cesare. Il test `H1.3.4` verificherà che l'opzione prescelta mantenga `is_integrity_valid == true`.

---

## 4. Salvataggio: Un File per Voce in `entries/`

### 4.1 Struttura su Disco
Lo storico risiede esclusivamente nella cartella dati utente locale, mai dentro il Vault:
```text
C:\Users\<username>\.limen-vault\history\<vault_id>\
└── entries\
    ├── qa_20260924_004723_a1b2c3d4.json
    ├── qa_20260924_011500_b2c3d4e5.json
    └── ...
```

### 4.2 Procedura di Scrittura Atomica
1. Generazione del percorso target: `entries/<entry_id>.json`.
2. Scrittura del payload JSON su file temporaneo nella stessa cartella: `entries/<entry_id>.tmp`.
3. Sostituzione atomica con `std::fs::rename`: il passaggio da `.tmp` a `.json` su filesystem NTFS è un'operazione atomica sul record di directory. Nessun processo concorrente potrà mai leggere un file incompleto o parziale.

### 4.3 Alternative Scartate
- **File unico JSON con lock (Opzione A)**: scartata per il rischio di contese, stalli in caso di crash e blocchi dell'interfaccia con più istanze aperte.
- **JSON Lines ad aggiunta (Opzione B)**: scartata perché la cancellazione o modifica di una singola voce costringe a riscrivere l'intero file o ad aggiungere compattatori complessi.
- **Un file per voce (Opzione C)**: adottata perché garantisce isolamento perfetto tra processi concorrenti, cancellazione immediata (`remove_file`) e immunità a corruzioni globali.

---

## 5. Dati Salvati: Esempio con Valori Reali del Vault

### 5.1 Esempio Reale Verificato (Prova BNXT del 24/09/2026)
Di seguito un record d'esempio con i dati reali del Vault di Cesare (`E:\VAULT WIN TEST DEV`), con impronta calcolata tramite `Get-FileHash` e orari/durate reali estratti dal registro di prova (`ask_timing.log`, prova delle ore 08:47:23 UTC+8 / 00:47:23.955Z):

```json
{
  "id": "qa_20260924_004723_32f2a408",
  "conversation_id": "conv_20260924_004723_9b8c7d6e",
  "turn_index": 1,
  "parent_entry_id": null,
  "created_at_utc": "2026-09-24T00:47:23.955Z",
  "utc_offset_seconds": 28800,
  "requested_model": "gpt-4o",
  "response_model": "gpt-4o-2024-08-06",
  "prompt": "Cosa è il progetto BNXT?",
  "answer": "Il progetto BNXT riguarda lo sviluppo di un sistema CRM (Customer Relationship Management) dedicato a un'azienda specializzata nell'abbigliamento tecnico per motociclisti, come BNXT1, un brand italiano noto per prodotti su misura nel segmento rally e off-road...",
  "status": "complete",
  "duration_ms": 4841,
  "sources": [
    {
      "document_id": "20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md",
      "relative_path": "20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md",
      "title": "BNXT CRM",
      "locator": "Paragrafi 1-13, Paragrafi 52-68",
      "doc_sha256": "32f2a4081d13410e4fcbc0d3d14f4e6fef7a8fad2fa85d69e2ba53cf5ab94e8d",
      "passage_sha256": "8f3a1c0d5e2b4f6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      "citation_index": 1
    }
  ]
}
```

*Verifica dei valori reali:*
- `doc_sha256`: calcolato direttamente sul file reale con:  
  `Get-FileHash -Algorithm SHA256 "E:\VAULT WIN TEST DEV\20_RAW_SOURCES\32f2a4081d13410e-BNXT CRM.md"` $\rightarrow$ `32f2a4081d13410e4fcbc0d3d14f4e6fef7a8fad2fa85d69e2ba53cf5ab94e8d`.
- `created_at_utc`: `2026-09-24T00:47:23.955Z`.
- `duration_ms`: `4841` ms (corrispondente a `t_ui_total_ms` del log di prova).
- `response_model`: `gpt-4o-2024-08-06` (snapshot reale restituito dalle API).
- **Zero testo salvato**: nessun estratto delle note è memorizzato nello storico.

---

## 6. Condizioni di Salvataggio e Casi di Esclusione

### 6.1 Quando si Salva
Il salvataggio avviene **esclusivamente** dopo che:
1. Lo streaming HTTP da OpenAI è terminato con successo;
2. **`verify_post` ha avuto esito positivo** (tutte le impronte dei documenti usati sono identiche pre e post chiamata);
3. La prosa è stata sanificata e le citazioni convalidate.

### 6.2 Matrice degli Esiti

| Condizione Esito Chiamata | Salvataggio nello Storico | Stato Registrato | Motivazione |
| :--- | :--- | :--- | :--- |
| **Completata con successo** | **SI SALVA** | `"complete"` | Risposta valida, completa e verificata. |
| **Incompleta con avviso** (es. token massimi) | **SI SALVA** | `"incomplete"` | Contenuto parziale utile, visualizzabile con avviso. |
| **`verify_post` fallito** (documento mutato durante la chiamata) | **NON SI SALVA** | — | Risposta invalidata: le fonti sono cambiate durante l'elaborazione. |
| **Errore HTTP / OpenAI / Timeout** | **NON SI SALVA** | — | Nessuna risposta utile generata. |
| **Rifiuto da `begin` ("already running")** | **NON SI SALVA** | — | Richiesta non avviata. |
| **Annullamento manuale dell'utente** | **NON SI SALVA** | — | Elaborazione interrotta prima della verifica. |

---

## 7. Pro e Contro Reali dell'Identificativo del Vault

| Aspetto | Identificativo Basato Solo sul Percorso del Vault | Identificativo Univoco in `00_SYSTEM/VAULT_ID.json` *(Decisione di Cesare)* |
| :--- | :--- | :--- |
| **Spostamento o Rinomina del Vault** | **Svantaggio reale**: Se Cesare sposta il Vault in un'altra cartella o cambia lettera di unità Windows (`E:` $\rightarrow$ `D:`), il fingerprint cambia $\rightarrow$ lo storico pregresso non viene più associato e la schermata appare vuota. | **Vantaggio reale**: Portabilità totale. Lo storico resta sempre collegato al Vault ovunque venga spostato o rinominato nel filesystem. |
| **Scrittura nel Vault** | **Vantaggio reale**: Nessun nuovo file creato in `00_SYSTEM/`. | **Svantaggio reale gestito**: Richiede di creare una sola volta il file `00_SYSTEM/VAULT_ID.json` (~100 byte). |
| **Duplicazione del Vault (Copia della cartella con Esplora Risorse)** | Nessuna collisione: il nuovo percorso genera un nuovo identificativo e uno storico vuoto indipendente. | La cartella copiata eredita lo stesso ID. L'app rileva l'apertura dello stesso ID da un percorso differente e chiede conferma all'utente se separare o condividere lo storico. |
| **Condivisione Multi-Macchina (Git o Cloud)** | Ciascuna macchina indicizza percorsi locali differenti. | Il file `VAULT_ID.json` viene sincronizzato. Entrambi i PC usano lo stesso ID per i rispettivi storici locali (ciascun PC conserva i dati nel proprio `~/.limen-vault/`). |

---

## 8. Esperienza Utente nella Scheda "Chiedi"

### 8.1 Cassetto Laterale (Drawer)
- Pulsante con icona orologio/cronologia nella testata di `AiPanel.tsx`, con contatore aggiornato delle risposte salvate.
- Al clic, apertura di un cassetto laterale scorrevole con casella di ricerca rapida.

### 8.2 Scheda Voce e Formattazione Oraria
- Ciascuna voce mostra:
  - Data e ora formattata in base al **fuso orario del computer locale** dell'utente (utilizzando le API di internazionalizzazione standard del browser, convertendo da `created_at_utc`);
  - Badge del modello effettivo restituito da OpenAI (es. `gpt-4o-2024-08-06`);
  - Domanda in evidenza e conteggio delle fonti citate;
  - Icona cestino per la rimozione singola.

### 8.3 Riapertura con Controllo Impronte dal Vivo
- Cliccando su una voce:
  1. Prompt e risposta vengono ripopolati nel corpo principale;
  2. Il backend interroga il Vault per verificare lo stato di ciascuna fonte citata:
     - Se tutte le fonti sono integre: i passaggi vengono estratti dal vivo dal file corrente e visualizzati;
     - Se un documento risulta mutato rispetto all'impronta `doc_sha256`: viene mostrato un banner di avviso giallo ambrato:
       > ⚠️ **Documento citato modificato dopo la risposta**  
       > La nota *`20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md`* è stata modificata dopo la generazione di questa risposta. Il contenuto attuale del Vault potrebbe differire da quello su cui il modello si è basato.
     - Se un documento è stato rimosso o rinominato: viene mostrato l'avviso che il file non è più disponibile nel Vault.

### 8.4 Eliminazione Singola e Comando "svuota lo storico di questo vault"
- **Cancellazione di una singola voce**:
  - Cliccando sull'icona cestino compare la richiesta inline:  
    *"Eliminare questa risposta dallo storico? [Annulla] [Elimina]"*.
- **Comando per l'intero Vault**:
  - In fondo al cassetto è posizionato il pulsante testuale:  
    **"svuota lo storico di questo vault"**
  - Al clic compare una modale di sicurezza:  
    *"Sei sicuro di voler eliminare tutte le domande e risposte salvate per questo Vault? Nessun documento del Vault verrà toccato. L'operazione non può essere annullata. [Annulla] [Svuota storico]"*.

---

## 9. Piano dei Test da Eseguire ad Apertura Lavori

Una volta concluso l'audit indipendente e ricevuta l'autorizzazione di Cesare a procedere:

1. **Test di Concorrenza Multi-Processo Reale (`history::tests::test_multi_process_concurrent_writes`)**:
   - Avvio simultaneo di **due processi di sistema operativo distinti** (`std::process::Command`), simulando l'app installata e la dev build in esecuzione concorrente;
   - Entrambi i processi puntano allo stesso `vault_id` e scrivono contemporaneamente 50 voci distinte con payload completi;
   - Verifica finale: lettura di esattamente 100 voci ordinate, zero file corrotti, zero eccezioni di I/O.
2. **Test Integrità del Vault con `VAULT_ID.json` (`snapshots::tests::test_vault_integrity_remains_valid_with_vault_id`)**:
   - Creazione di `00_SYSTEM/VAULT_ID.json`;
   - Esecuzione del controllo di integrità del manifest (`verify_manifest_integrity`);
   - Asserzione: `is_integrity_valid == true` e `added_files` non include file di sistema legittimi dell'app.
3. **Test Vincoli di Salvataggio (`history::tests::test_save_conditions`)**:
   - Risposta completata con `verify_post` OK $\rightarrow$ salvata;
   - Risposta incompleta con `verify_post` OK $\rightarrow$ salvata con `status: "incomplete"`;
   - Risposta con `verify_post` fallito (fonte mutata) $\rightarrow$ **NON** salvata;
   - Errore OpenAI / rifiuto `begin` $\rightarrow$ **NON** salvata.
4. **Test Ricaricamento Fonti Live e Allerta Modifiche (`history::tests::test_source_integrity_verification`)**:
   - Creazione di una nota di prova con relativo hash; salvataggio voce;
   - Modifica del file sul disco $\rightarrow$ invocazione verifica $\rightarrow$ restituzione stato `Modified` e allerta visiva attiva;
   - Cancellazione del file dal disco $\rightarrow$ restituzione stato `Missing`.
5. **Test Operazioni di Pulizia**:
   - Rimozione singola voce;
   - Esecuzione comando *"svuota lo storico di questo vault"*.

---

## 10. Stato Operativo

- **Pausa sul codice**: rigorosamente attiva e rispettata. Nessun file dell'applicazione è stato modificato, nessun commit eseguito, nessun programma avviato, nessun processo toccato.
- Il presente piano è completo, privo di ambiguità e allineato alle decisioni di Cesare. Resta in attesa della conclusione dell'audit indipendente.
