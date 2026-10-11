# Percorsi Utente End-to-End (User Journeys) — LIMEN Vault v7Mini

Il presente documento descrive i percorsi operativi completi (*End-to-End User Journeys*) per i tre profili utente definiti in `01_PRODUCT_DISCOVERY/AUDIENCES_AND_PERSONAS.md`. Ogni percorso illustra la sequenza temporale delle interazioni, i punti di contatto con l'interfaccia, le modalità di rete adottate e i risultati ottenuti.

---

## Mappa Sintetica dei Percorsi

| Journey ID | Profilo Archetipo | Obiettivo Primario | Modalità Operativa | Workflow Coinvolti |
| :--- | :--- | :--- | :--- | :--- |
| **`JRN-001`** | **Marco (Consulente / Privacy Totale)** | Analisi fascicoli riservati a rete zero | 100% Locale (Offline) | `WF-001`, `WF-008`, `WF-004`, `WF-002`, `WF-003` |
| **`JRN-002`** | **Elena (Knowledge Manager)** | Ingestione massiva e consolidamento memoria | Ibrido / Locale | `WF-004`, `WF-006`, `WF-005`, `WF-007`, `WF-010` |
| **`JRN-003`** | **Davide (Analista Ibrido)** | Sintesi complessa con LLM cloud e locale | Ibrido Cloud / Offline | `WF-001`, `WF-002`, `WF-008`, `WF-012`, `WF-011` |

---

## 1. JRN-001: Marco — Consulente con Vincoli di Riservatezza Assoluta

### 1.1 Contesto e Missione
Marco deve analizzare una serie di contratti societari e audit finanziari strettamente confidenziali. Non può consentire che alcun dato lasci la memoria fisica del suo MacBook Pro M3 (18 GB RAM). La connessione internet può essere disattivata durante l'intera sessione di lavoro.

### 1.2 Sequenza Temporale e Passaggi Operativi
```
[Avvio LIMEN Vault]
       │
       ▼ (WF-001: Setup Wizard)
[Scelta "Locale (GGUF)", Creazione Vault in cartella locale cifrata]
       │
       ▼ (WF-008: Catalogo Modelli)
[Download una tantum del modello "Ministral 3B Instruct" (2.2 GB)]
       │
       ▼ (Connessione Internet Disattivata)
[Caricamento 15 file PDF contrattuali tramite "Carica" (WF-004)]
       │
       ▼ (PIPE-001: Estrazione testo, chunking ed embedding bge-m3 su Metal)
[Tutti i documenti indicizzati in 18 secondi]
       │
       ▼ (WF-002: Chiedi al Vault)
[Query: "Quali clausole di non concorrenza superano i 24 mesi?"]
       │
       ▼ (PIPE-002 & PIPE-003: llama-server locale esegue inferenza)
[Risposta formulata con citazioni a Contratto_A.pdf (p. 14) e Contratto_C.pdf (p. 2)]
       │
       ▼ (WF-003: Ispezione Fonte con Lettore Documenti)
[Apertura modale: verifica SHA-256 e visualizzazione del paragrafo originale]
```

### 1.3 Risultato Finale
Marco ottiene una sintesi completa e verificata al 100% sulle fonti contrattuali. L'hash SHA-256 garantisce la tracciabilità delle evidenze legali. Nessun byte ha lasciato la macchina.

---

## 2. JRN-002: Elena — Knowledge Manager & Vault Curator

### 2.1 Contesto e Missione
Elena gestisce la knowledge base di un team di ricerca. Riceve periodicamente decine di report, dispense e minute di riunione. Il suo obiettivo è mantenere il Vault pulito, approvare le sintesi generate dall'AI in note definitive ed eseguire backup certificati prima di ogni rilascio.

### 2.2 Sequenza Temporale e Passaggi Operativi
```
[Accesso a LIMEN Vault]
       │
       ▼ (WF-004: Caricamento Massivo Documenti)
[Selezione di una cartella contenente 40 file PDF/Markdown]
       │
       ▼ (PIPE-001: Ingestione batch ed embedding locale)
[I file confluiscono in 20_RAW_SOURCES; l'AI propone bozze di sintesi in 90_PROPOSALS]
       │
       ▼ (WF-006: Approvazione Bozze e Note di Memoria)
[Elena accede ad "Avanzate > Approvazione Note (Bozze in 90_PROPOSALS)"]
[Revisiona 8 note: ne accetta 6 con modifiche al titolo e ne rifiuta 2 con traccia di audit]
[Le note approvate vengono promosse nelle cartelle di memoria 01-10 con registrazione]
       │
       ▼ (WF-005: Esplorazione Memoria del Vault)
[Navigazione tra le 10 categorie aziendali 01_CLIENTS - 10_APPROVED_OUTPUTS tramite KnowledgePanel]
       │
       ▼ (WF-007: Creazione Snapshot di Backup)
[Elena accede ad "Avanzate > Snapshot e Ripristino"]
[Fa clic su "Crea Nuovo Snapshot", nominato "release_kb_q3_2026"]
[Generato archivio compresso con albero crittografico delle note]
```

### 2.3 Risultato Finale
La knowledge base è strutturata, verificata e ancorata a documenti reali. Lo snapshot garantisce un archivio di sicurezza estraibile in cartella separata di recupero in caso di necessità.

---

## 3. JRN-003: Davide — Analista Dati con Approccio Ibrido

### 3.1 Contesto e Missione
Davide elabora grandi volumi di letteratura tecnica e policy aperte. Desidera la massima potenza analitica fornita da modelli cloud avanzati (GPT-4o), ma vuole anche poter passare istantaneamente al motore locale DeepSeek-R1 7B per analizzare dati protetti da NDA, per poi continuare l'elaborazione su Obsidian.

### 3.2 Sequenza Temporale e Passaggi Operativi
```
[Avvio LIMEN Vault]
       │
       ▼ (WF-001: Setup Wizard)
[Scelta "Modalità Ibrida" e inserimento chiave OPENAI_API_KEY]
       │
       ▼ (WF-011: Internazionalizzazione)
[Davide seleziona "EN" nell'header per interfaccia in inglese per il team estero]
       │
       ▼ (WF-002: Query Complesse su Letteratura Pubblica)
[Interrogazione ad alta capacità via OpenAI API: sintesi multilingue veloce]
       │
       ▼ (Arrivo di un documento riservato confidenziale)
[Caricamento in cartella protetta]
       │
       ▼ (WF-008: Attivazione DeepSeek-R1 7B da Catalogo Modelli)
[Davide avvia llama-server locale con DeepSeek-R1 7B]
[Esecuzione query con reasoning trace locale (<think> visibile e privato)]
       │
       ▼ (WF-012: Apertura e Rifinitura in Obsidian)
[Davide fa clic su "Apri in Obsidian" nell'header]
[Il vault locale si apre in Obsidian per stesura finale con plugin e canvas]
```

### 3.3 Risultato Finale
Davide beneficia della flessibilità del cloud per task pubblici e della sicurezza insuperabile dell'inferenza locale per informazioni riservate, mantenendo la compatibilità al 100% con Obsidian.
