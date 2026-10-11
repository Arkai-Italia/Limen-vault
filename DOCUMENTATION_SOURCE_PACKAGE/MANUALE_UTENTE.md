# Manuale Utente Ufficiale — LIMEN Vault v7Mini

- **Versione Applicazione:** 0.7.0 (v7Mini)
- **Data di Revisione:** 11 Ottobre 2026
- **Release Commit:** `677745c367d64de7d21eb66d111cac7558300f84`
- **Inspection Commit:** `373e34e7ae3a7a9f41acf2c8eecdaa8131c5d90a`
- **Identificativo:** `dev.arkai.limenvault` (macOS / Windows)

Il presente documento costituisce il manuale operativo ufficiale per LIMEN Vault v7Mini, l'ambiente desktop di knowledge management e intelligenza artificiale ad architettura "Local-First" e riservatezza "Zero-Network". Tutte le procedure, i controlli di interfaccia, i formati di file e le pipeline descritte sono verificate direttamente sul codice sorgente della release 0.7.0.

---

## Indice Generale dei Contenuti

### Parte I — Guida di Consultazione Rapida
1. [Indice per Menu e Struttura dell'Interfaccia](#1-indice-per-menu-e-struttura-dellinterfaccia)
2. [Indice Operativo per Compiti: «Cosa ti serve?»](#2-indice-operativo-per-compiti-cosa-ti-serve)

### Parte II — Fondamenti e Avvio del Sistema
- [Capitolo 1: Introduzione a LIMEN Vault v7Mini (0.7.0)](#capitolo-1-introduzione-a-limen-vault-v7mini-070)
- [Capitolo 2: Architettura e Privacy a Rete Zero (Zero-Network)](#capitolo-2-architettura-e-privacy-a-rete-zero-zero-network)
- [Capitolo 3: Requisiti di Sistema, Piattaforme OS e Dimensionamento Hardware](#capitolo-3-requisiti-di-sistema-piattaforme-os-e-dimensionamento-hardware)
- [Capitolo 4: Installazione e Primo Avvio su macOS e Windows](#capitolo-4-installazione-e-primo-avvio-su-macos-e-windows)
- [Capitolo 5: Il Setup Wizard Guidato (Configurazione in 3 Passaggi)](#capitolo-5-il-setup-wizard-guidato-configurazione-in-3-passaggi)

### Parte III — Interfaccia Utente e Workflow Primari
- [Capitolo 6: Panoramica dell'Interfaccia: Header 52px e Sidebar 240px](#capitolo-6-panoramica-dellinterfaccia-header-52px-e-sidebar-240px)
- [Capitolo 7: L'Header Globale: Pulsante Verifica, Lingua IT/EN e Stato](#capitolo-7-lheader-globale-pulsante-verifica-lingua-iten-e-stato)
- [Capitolo 8: Area 1 — Chiedi al Vault: Ricerca Semantica RAG e Chat](#capitolo-8-area-1--chiedi-al-vault-ricerca-semantica-rag-e-chat)
- [Capitolo 9: Comprensione del Reasoning Trace (Modelli DeepSeek-R1)](#capitolo-9-comprensione-del-reasoning-trace-modelli-deepseek-r1)
- [Capitolo 10: Ispezione delle Fonti e Citazioni Verificate](#capitolo-10-ispezione-delle-fonti-e-citazioni-verificate)
- [Capitolo 11: Il Lettore Documenti Integrato con Calcolo Hash SHA-256](#capitolo-11-il-lettore-documenti-integrato-con-calcolo-hash-sha-256)
- [Capitolo 12: Area 2 — Gestione Documenti e Archivio 20_RAW_SOURCES](#capitolo-12-area-2--gestione-documenti-e-archivio-20_raw_sources)
- [Capitolo 13: Caricamento File e Cartelle (UploadDrawer e Formati Ammessi)](#capitolo-13-caricamento-file-e-cartelle-uploaddrawer-e-formati-ammessi)
- [Capitolo 14: Area 3 — Esplorazione della Memoria (Categorie 01_CLIENTS - 10_APPROVED_OUTPUTS)](#capitolo-14-area-3--esplorazione-della-memoria-categorie-01_clients---10_approved_outputs)

### Parte IV — Amministrazione e Sezioni Avanzate
- [Capitolo 15: Area 4 — Sezioni Avanzate: Panoramica Generale](#capitolo-15-area-4--sezioni-avanzate-panoramica-generale)
- [Capitolo 16: Sezione Avanzate A — Approvazione Note e Gestione Bozze (90_PROPOSALS)](#capitolo-16-sezione-avanzate-a--approvazione-note-e-gestione-bozze-90_proposals)
- [Capitolo 17: Sezione Avanzate B — Gestione Snapshot e Ripristino Sicuro (Cartella RECUPERO)](#capitolo-17-sezione-avanzate-b--gestione-snapshot-e-ripristino-sicuro-cartella-recupero)
- [Capitolo 18: Sezione Avanzate C — Catalogo Modelli LLM e Gestione llama.cpp](#capitolo-18-sezione-avanzate-c--catalogo-modelli-llm-e-gestione-llamacpp)
- [Capitolo 19: Dimensionamento Memoria RAM e Matrice File GGUF (3B, 7B, 8B, 14B)](#capitolo-19-dimensionamento-memoria-ram-e-matrice-file-gguf-3b-7b-8b-14b)
- [Capitolo 20: Sezione Avanzate D — Sincronizzazione Cloud S3/R2 (BYOB)](#capitolo-20-sezione-avanzate-d--sincronizzazione-cloud-s3r2-byob)
- [Capitolo 21: Sezione Avanzate E — Compilatore Fonti Testo da 20_RAW_SOURCES a 90_PROPOSALS](#capitolo-21-sezione-avanzate-e--compilatore-fonti-testo-da-20_raw_sources-a-90_proposals)
- [Capitolo 22: Sezione Avanzate F — Configurazione e Preferenze del Sistema](#capitolo-22-sezione-avanzate-f--configurazione-e-preferenze-del-sistema)
- [Capitolo 23: Sezione Avanzate G — Diagnostica, Log di Sistema e Manutenzione](#capitolo-23-sezione-avanzate-g--diagnostica-log-di-sistema-e-manutenzione)

### Parte V — Integrazione e Sicurezza
- [Capitolo 24: Integrazione Nativa con Obsidian (obsidian://open)](#capitolo-24-integrazione-nativa-con-obsidian-obsidianopen)
- [Capitolo 25: Sicurezza Crittografica, Integrità SHA-256 e Audit Trail](#capitolo-25-sicurezza-crittografica-integrità-sha-256-e-audit-trail)

### Appendici
- [Appendice A: Indice Analitico delle Azioni Rapide («Cosa ti serve?»)](#appendice-a-indice-analitico-delle-azioni-rapide-cosa-ti-serve)
- [Appendice B: Guida alla Risoluzione dei Problemi (Troubleshooting)](#appendice-b-guida-alla-risoluzione-dei-problemi-troubleshooting)
- [Appendice C: Glossario Terminologico Ufficiale IT/EN](#appendice-c-glossario-terminologico-ufficiale-iten)

---

## Parte I — Guida di Consultazione Rapida

### 1. Indice per Menu e Struttura dell'Interfaccia

L'applicazione LIMEN Vault si articola in una Barra Laterale Sinistra fissa (240px), in un Header Superiore fisso (52px) e nell'Area di Lavoro Dinamica Centrale:

```
+------------------------------------------------------------------------------+
| [LOGO] LIMEN Vault            [ VERIFICA (RotateCw) ]     [IT|EN] [● PRONTO] | (Header 52px)
+-------------------+----------------------------------------------------------+
| [+ CARICA DOC]    |                                                          |
|                   |                                                          |
| 1. Chiedi Vault   |                                                          |
| 2. Documenti      |              AREA DI LAVORO CENTRALE                     |
| 3. Memoria        |                    (DINAMICA)                            |
| 4. Avanzate       |                                                          |
|                   |                                                          |
| NOTE RECENTI      |                                                          |
| [Apri in Obsidian]|                                                          |
+-------------------+----------------------------------------------------------+
(Sidebar 240px)
```

- **Barra Laterale Sinistra (240px):**
  - **Pulsante Primario d'Azione:** `Carica Documenti` (`#c8ff00`, `CTL-001`)
  - **Navigazione:** `Chiedi al Vault` (`SCR-002`), `Documenti` (`SCR-003`), `Memoria` (`SCR-004`), `Avanzate` (`SCR-005`)
  - **Sezione Note Recenti:** Cronologia dei documenti consultati di recente
  - **Pulsante Inferiore:** `Apri in Obsidian` (`CTL-007`)
- **Header Globale Superiore (52px):**
  - Logo e Marchio Applicativo: Icona Scudo LIMEN Vault
  - **Pulsante Centrale:** `Verifica` (icona `RotateCw`, `CTL-008`)
  - **Selettore Lingua:** `IT | EN` (`CTL-009`)
  - **Badge di Stato:** `● PRONTO` (verde `#047857`) / `OFFLINE` (grigio `#64748b`)

---

### 2. Indice Operativo per Compiti: «Cosa ti serve?»

- **«Devo configurare l'applicazione al primissimo avvio»**  
  -> Vai al [Capitolo 5: Setup Wizard Guidato](#capitolo-5-il-setup-wizard-guidato-configurazione-in-3-passaggi) e alla scheda `WF-001`.
- **«Voglio porre una domanda ai miei documenti senza che nulla esca dal computer»**  
  -> Vai al [Capitolo 8: Chiedi al Vault](#capitolo-8-area-1--chiedi-al-vault-ricerca-semantica-rag-e-chat) e alla scheda `WF-002`.
- **«Voglio verificare l'esatto paragrafo e l'integrità del file citato dall'AI»**  
  -> Vai al [Capitolo 10](#capitolo-10-ispezione-delle-fonti-e-citazioni-verificate) e [Capitolo 11](#capitolo-11-il-lettore-documenti-integrato-con-calcolo-hash-sha-256) / `WF-003`.
- **«Devo caricare file PDF, Word, Excel, presentazioni o note nel Vault»**  
  -> Vai al [Capitolo 13: Caricamento File e Cartelle](#capitolo-13-caricamento-file-e-cartelle-uploaddrawer-e-formati-ammessi) e alla scheda `WF-004`.
- **«Voglio consultare le note approvate divise per categoria»**  
  -> Vai al [Capitolo 14: Esplorazione della Memoria](#capitolo-14-area-3--esplorazione-della-memoria-categorie-01_clients---10_approved_outputs) e alla scheda `WF-005`.
- **«Devo revisionare, approvare o scartare le bozze generate dall'AI»**  
  -> Vai al [Capitolo 16: Approvazione Note e Bozze](#capitolo-16-sezione-avanzate-a--approvazione-note-e-gestione-bozze-90_proposals) e alla scheda `WF-006`.
- **«Voglio creare una copia di sicurezza certificata del Vault»**  
  -> Vai al [Capitolo 17: Gestione Snapshot e Ripristino](#capitolo-17-sezione-avanzate-b--gestione-snapshot-e-ripristino-sicuro-cartella-recupero) e alla scheda `WF-007`.
- **«Voglio ripristinare file da uno snapshot senza rischiare di sovrascrivere il Vault»**  
  -> Vai al [Capitolo 17.2: Ripristino Sicuro in Directory RECUPERO](#172-ripristino-sicuro-in-directory-recupero-zero-sovrascrittura) e alla scheda `WF-007`.
- **«Voglio cambiare modello LLM locale o attivare il ragionamento DeepSeek-R1»**  
  -> Vai al [Capitolo 18](#capitolo-18-sezione-avanzate-c--catalogo-modelli-llm-e-gestione-llamacpp) e [Capitolo 19](#capitolo-19-dimensionamento-memoria-ram-e-matrice-file-gguf-3b-7b-8b-14b) / `WF-008`.
- **«Voglio trasformare in blocco testi grezzi in bozze Markdown strutturate»**  
  -> Vai al [Capitolo 21: Compilatore Fonti Testo](#capitolo-21-sezione-avanzate-e--compilatore-fonti-testo-da-20_raw_sources-a-90_proposals) e alla scheda `WF-010`.
- **«Voglio passare l'interfaccia in lingua inglese o italiana»**  
  -> Vai al [Capitolo 7: Header Globale](#capitolo-7-lheader-globale-pulsante-verifica-lingua-iten-e-stato) e alla scheda `WF-011`.
- **«Voglio aprire la cartella attiva direttamente dentro Obsidian»**  
  -> Vai al [Capitolo 24: Integrazione con Obsidian](#capitolo-24-integrazione-nativa-con-obsidian-obsidianopen) e alla scheda `WF-012`.
- **«Voglio configurare il backup remoto sul mio bucket S3/Cloudflare R2»**  
  -> Vai al [Capitolo 20: Sincronizzazione Cloud S3/R2](#capitolo-20-sezione-avanzate-d--sincronizzazione-cloud-s3r2-byob) e alla scheda `WF-009`.

---

## Parte II — Fondamenti e Avvio del Sistema

### Capitolo 1: Introduzione a LIMEN Vault v7Mini (0.7.0)

#### 1.1 Che cos'è LIMEN Vault
LIMEN Vault v7Mini è una piattaforma desktop concepita per la gestione della conoscenza personale e aziendale, integrando funzionalità avanzate di Ricerca Vettoriale Semantica (RAG — Retrieval-Augmented Generation) e Sintesi Conversazionale. A differenza dei servizi cloud convenzionali, LIMEN Vault adotta il paradigma **Local-First**: database relazionale e vettoriale, file originali, indici semantici e modelli linguistici risiedono interamente sul disco fisso del dispositivo.

#### 1.2 Caratteristiche Chiave della Versione 0.7.0
- **Inferenza Locale Standalone:** Esecuzione di modelli GGUF all'avanguardia (famiglie Ministral, Qwen 2.5, Llama 3.1 e DeepSeek-R1 Distill) gestiti dal binario nativo `llama-server`.
- **Accelerazione Hardware Dedicata:** Supporto Metal integrato su Apple Silicon (M1/M2/M3/M4) e set di istruzioni AVX2 su sistemi Windows x64.
- **Setup Wizard Guidato a 3 Step:** Configurazione lineare (Cartella -> Motore -> Modello Locale/API Key) con pulsante finale `ENTRA IN LIMEN VAULT`.
- **Ingestione Multi-Formato:** Supporto nativo per PDF, documenti Office (`.docx`, `.pptx`, `.odt`), fogli di calcolo (`.xlsx`, `.xls`, `.ods`, `.csv`, `.tsv`), file di testo (`.txt`, `.md`, `.json`, `.log`, `.html`) e riconoscimento ottico Apple Vision OCR per immagini su macOS.
- **Lettore Documenti con Verifica Crittografica:** Visualizzatore con ricalcolo a caldo dell'hash SHA-256 per rilevare eventuali modifiche o corruzioni dei file.
- **Interoperabilità con Obsidian:** Struttura del Vault conforme su disco suddivisa nelle 10 cartelle standard della conoscenza (`01_CLIENTS` a `10_APPROVED_OUTPUTS`), nell'archivio sorgenti `20_RAW_SOURCES` e nelle bozze `90_PROPOSALS`.

---

### Capitolo 2: Architettura e Privacy a Rete Zero (Zero-Network)

In modalità predefinita "100% Locale", LIMEN Vault garantisce che:
- Nessun dato testuale, prompt o metadato lasci il dispositivo.
- Nessuna connessione di telemetria sia stabilita verso server remoti proprietari.
- Il calcolo dei vettori semantici sia eseguito dal modello locale `bge-m3`.
- L'inferenza linguistica sia affidata all'eseguibile `llama-server` in ascolto sul socket locale `127.0.0.1:8080`.
- Il sistema rimanga pienamente operativo anche con interfacce di rete disconnesse.

---

### Capitolo 3: Requisiti di Sistema, Piattaforme OS e Dimensionamento Hardware

#### 3.1 Requisiti di Sistema Operativo
- **Piattaforma macOS:** macOS 13.0 (Ventura) o superiore (raccomandato macOS 14.0+ Sonoma). Supporto nativo Apple Silicon (Metal) e Intel x86_64.
- **Piattaforma Windows:** Windows 10 a 64-bit (build 19041+) o Windows 11 a 64-bit con supporto AVX2.
- **Spazio su Disco:** Almeno 15-20 GB liberi su SSD NVMe per indici e pesi GGUF.

#### 3.2 Matrice Modelli LLM e Dimensionamento Memoria RAM

| Modello LLM | Formato & Quantizzazione | Dimensione File GGUF | RAM Minima Sistema | RAM Consigliata | Profilo di Utilizzo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ministral 3B Instruct** | GGUF Q5_K_M | **2.47 GB** | 8 GB | 8 GB | Modello leggero e veloce, ideale per 8 GB di RAM |
| **Ministral 8B Instruct** | GGUF Q5_K_M | **6.06 GB** | 12 GB | 16 GB | Elevata precisione di sintesi per macchine da 16 GB |
| **Qwen 2.5 7B Instruct** | GGUF Q4_K_M | **4.68 GB** | 12 GB | 16 GB | Ottimo equilibrio linguistico e accuratezza semantica |
| **Llama 3.1 8B Instruct** | GGUF Q4_K_M | **4.92 GB** | 12 GB | 16 GB | Modello di riferimento generale per sistemi a 16 GB |
| **DeepSeek-R1 Distill 7B**| GGUF Q4_K_M | **4.68 GB** | 12 GB | 16 GB | Ragionamento esplicito con traccia logica `<think>` |
| **DeepSeek-R1 Distill 14B**| GGUF Q4_K_M | **8.99 GB** | 20 GB | 24 - 32 GB | Modello analitico pesante; richiede almeno 24 GB RAM |

---

### Capitolo 4: Installazione e Primo Avvio su macOS e Windows

1. **macOS:** Aprire l'immagine disco `.dmg` della release 0.7.0 e trascinare l'icona in Applicazioni. Al primo avvio, confermare l'apertura tramite Gatekeeper.
2. **Windows:** Avviare l'installer `.exe` per Windows x64 e confermare la schermata di protezione Windows Defender SmartScreen ("Ulteriori informazioni" -> "Esegui comunque").

---

### Capitolo 5: Il Setup Wizard Guidato (Configurazione in 3 Passaggi)

All'avvio iniziale in assenza di un Vault configurato, si apre automaticamente la modale del **Setup Wizard** (`SCR-001`, `WF-001`):

- **Step 1/3 (Selezione Cartella Vault):** L'utente seleziona o crea la directory sul disco locale tramite il pulsante "Sfoglia" (`CTL-004`). Il sistema predispone la topologia standard (`01_CLIENTS` ... `10_APPROVED_OUTPUTS`, `20_RAW_SOURCES/`, `90_PROPOSALS/`, `.limen/`).
- **Step 2/3 (Scelta Motore LLM):** Scelta tra "100% Locale (Zero-Network)" e "Modalità Ibrida" (connessione OpenAI).
- **Step 3/3 (Modello Locale o Chiave API):** Download del modello locale GGUF (con progress bar e verifica hash SHA-256) oppure inserimento della chiave `OPENAI_API_KEY`.
- **Conferma Finale:** Clic sul pulsante **"ENTRA IN LIMEN VAULT"** (`CTL-006`) per sbloccare l'interfaccia principale.

---

## Parte III — Interfaccia Utente e Workflow Primari

### Capitolo 6: Panoramica dell'Interfaccia: Header 52px e Sidebar 240px

L'interfaccia adotta un tema Light Slate ad alta definizione:
- **Sidebar sinistra (240px):** Sfondo `#f1f5f9`, pulsante d'azione primario "Carica Documenti" (`#c8ff00`), navigazione a 4 sezioni, elenco note recenti, pulsante inferiore "Apri in Obsidian" (`CTL-007`).
- **Header globale (52px):** Logo applicazione, pulsante centrale `Verifica` (`RotateCw`), selettore lingua `IT | EN`, badge di stato `● PRONTO`.
- **Superfici di lavoro:** Sfondo card `#ffffff` su tela `#f8fafc`, con testi Slate 900 `#0f172a`.

---

### Capitolo 7: L'Header Globale: Pulsante Verifica, Lingua IT/EN e Stato

1. **Pulsante "Verifica" (`RotateCw`, `CTL-008`):** Avvia il controllo a caldo sullo stato dei database e del processo `llama-server`.
2. **Selettore Lingua "IT | EN" (`CTL-009`):** Commuta all'istante l'interfaccia tra Italiano e Inglese senza riavviare l'app.
3. **Badge di Stato Motore:** Verde `● PRONTO` quando il modello è pronto a rispondere, ambra `● CARICAMENTO` durante i cambi modello, grigio `● OFFLINE` in assenza di motore attivo.

---

### Capitolo 8: Area 1 — Chiedi al Vault: Ricerca Semantica RAG e Chat

L'Area "Chiedi al Vault" (`SCR-002`, `WF-002`) è la schermata principale di consultazione:
1. **Input Domanda:** L'utente immette il quesito nella casella in basso (`CTL-010`) e invia premendo INVIO.
2. **Pipeline RAG:**
   - La domanda viene vettorizzata tramite `bge-m3` (1024 dimensioni).
   - Viene eseguita la ricerca semantica Top-K su `sqlite-vec`.
   - I passaggi più pertinenti vengono iniettati nel prompt di sistema.
   - La risposta viene generata in streaming asincrono a video.

---

### Capitolo 9: Comprensione del Reasoning Trace (Modelli DeepSeek-R1)

Nei modelli `DeepSeek-R1 Distill 7B` e `14B`, i passaggi logici intermedi generati all'interno dei tag `<think>` vengono mostrati in un pannello espandibile "Pensiero del modello (Reasoning Trace)", consentendo all'utente di esaminare la catena di deduzione prima della risposta finale.

---

### Capitolo 10: Ispezione delle Fonti e Citazioni Verificate

In calce a ogni risposta generata compaiono le pillole interattive delle fonti citate (`CTL-012`). Ogni pillola riporta il nome del file, la pagina/paragrafo e la percentuale di pertinenza. Facendo clic sulla pillola si apre il Lettore Documenti focalizzato sul passaggio esatto.

---

### Capitolo 11: Il Lettore Documenti Integrato con Calcolo Hash SHA-256

Il Lettore Documenti (`DocumentReaderModal`, `SCR-003`, `WF-003`) visualizza i documenti originali in `20_RAW_SOURCES`:
- Ricalcolo automatico dell'impronta hash SHA-256 all'apertura.
- Badge verde "Integrità SHA-256 Verificata" se l'impronta coincide con il record dell'ingestione.
- Badge rosso di allarme in caso di discrepanza o modifica esterna del file.
- Pulsante "Copia Hash" per estrarre la stringa esadecimale a 64 caratteri.

---

### Capitolo 12: Area 2 — Gestione Documenti e Archivio 20_RAW_SOURCES

L'Area "Documenti" (`SCR-003`) mostra la tabella completa dei file in `20_RAW_SOURCES/`:
- Barra di ricerca rapida per nome ed estensione.
- Colonne: Nome file, Dimensione (KB/MB), Data di indicizzazione, Hash SHA-256, Azioni ("Leggi").

---

### Capitolo 13: Caricamento File e Cartelle (UploadDrawer e Formati Ammessi)

Facendo clic sul pulsante **"Carica Documenti"** (`#c8ff00`, `CTL-001`) nella barra laterale sinistra, si apre l'UploadDrawer (`SCR-004`, `WF-004`).

#### Formati Supportati:
- **Documenti:** PDF (`.pdf`), Microsoft Word (`.docx`), PowerPoint (`.pptx`), OpenDocument (`.odt`).
- **Dati Tabellari:** Excel (`.xlsx`, `.xls`), OpenDocument Spreadsheet (`.ods`), CSV (`.csv`), TSV (`.tsv`).
- **Testo e Note:** Testo puro (`.txt`), Markdown (`.md`), JSON (`.json`), log (`.log`), HTML (`.html`).
- **Immagini (solo macOS):** PNG (`.png`), JPEG (`.jpg`, `.jpeg`), WebP (`.webp`) con OCR nativo Apple Vision.
- **Limiti:** Massimo **32 MB per singolo file** in ingresso; troncamento di sicurezza a **16 MB di testo estratto**.

---

### Capitolo 14: Area 3 — Esplorazione della Memoria (Categorie 01_CLIENTS - 10_APPROVED_OUTPUTS)

L'Area "Memoria" (`SCR-004`, `WF-005`) permette di navigare la conoscenza consolidata attraverso l'interfaccia gerarchica `KnowledgePanel`:
- Navigazione tra le 10 categorie standard del Vault (`01_CLIENTS` a `10_APPROVED_OUTPUTS`).
- Visualizzazione delle note Markdown con metadati, autore della revisione e collegamenti Obsidian (`[[Nota]]`).

---

## Parte IV — Amministrazione e Sezioni Avanzate

### Capitolo 15: Area 4 — Sezioni Avanzate: Panoramica Generale

L'Area "Avanzate" (`SCR-005`) raccoglie 7 sezioni di manutenzione e controllo del Vault:
- Sezione A: Approvazione Note e Gestione Bozze (`90_PROPOSALS/`)
- Sezione B: Snapshot e Ripristino Vault (Cartella RECUPERO)
- Sezione C: Modelli LLM & llama.cpp
- Sezione D: Sincronizzazione Remota Cloud S3/R2 (BYOB)
- Sezione E: Compilatore Fonti Testo
- Sezione F: Configurazione e Parametri di Sistema
- Sezione G: Diagnostica, Stato Processi e Log

---

### Capitolo 16: Sezione Avanzate A — Approvazione Note e Gestione Bozze (90_PROPOSALS)

I testi generati dall'AI o elaborati dal Compilatore risiedono in `90_PROPOSALS/` (`SCR-006`, `WF-006`):
- **APPROVA REVISIONE MOSTRATA (`CTL-013`):** Sposta fisicamente il file nella categoria appropriata (01-10) e traccia l'azione nell'audit log.
- **SALVA NUOVA REVISIONE (`CTL-014`):** Salva le modifiche redazionali apportate al testo nella bozza.
- **RIFIUTA REVISIONE MOSTRATA (`CTL-015`):** Rifiuto formale archiviato; traccia la decisione nell'audit log con motivazione senza cancellare il file.
- **ELIMINA DEFINITIVAMENTE:** Rimozione fisica del file dal disco su comando esplicito.

---

### Capitolo 17: Sezione Avanzate B — Gestione Snapshot e Ripristino Sicuro (Cartella RECUPERO)

#### 17.1 Creazione Snapshot
Accedere ad `Avanzate > Snapshot e Ripristino` (`SCR-007`, `WF-007`), digitare il nome e fare clic su "Crea Nuovo Snapshot". Il sistema comprime le cartelle in un archivio protetto `.tar.zst` corredato da manifest crittografico SHA-256.

#### 17.2 Ripristino Sicuro in Cartella Separata
A tutela dell'integrità dei dati, il backend estrae i file dello snapshot in una directory separata dedicata:  
`{vault}_RECUPERO_{snapshot_id}`  
È formalmente vietata e impedita la sovrascrittura diretta del Vault attivo. Ciascun file estratto viene convalidato tramite hash SHA-256 prima della consultazione e del reintegro manuale.

---

### Capitolo 18: Sezione Avanzate C — Catalogo Modelli LLM e Gestione llama.cpp

Permette di gestire l'eseguibile locale `llama-server` (`SCR-008`, `WF-008`):
- Monitoraggio stato del processo (PID, porta 8080, modello attivo).
- Download di nuovi modelli GGUF con barra di avanzamento e verifica checksum SHA-256.
- Attivazione modello: arresto istanza precedente, rilascio RAM e avvio nuova istanza con verifica endpoint `/health`.

---

### Capitolo 19: Dimensionamento Memoria RAM e Matrice File GGUF (3B, 7B, 8B, 14B)

- **8 GB RAM:** Utilizzare **Ministral 3B Instruct** (2.47 GB GGUF Q5_K_M).
- **16 GB RAM:** Utilizzare **Ministral 8B** (6.06 GB Q5_K_M), **Qwen 2.5 7B** (4.68 GB Q4_K_M), **Llama 3.1 8B** (4.92 GB Q4_K_M) o **DeepSeek-R1 Distill 7B** (4.68 GB Q4_K_M).
- **24-32 GB RAM:** Disponibile **DeepSeek-R1 Distill 14B** (8.99 GB Q4_K_M).

---

### Capitolo 20: Sezione Avanzate D — Sincronizzazione Cloud S3/R2 (BYOB)

Architettura Bring-Your-Own-Bucket (`SCR-009`, `WF-009`):
- Configurazione parametri S3: Endpoint, Nome Bucket, Access Key, Secret Key e Passphrase crittografica per la cifratura lato client.
- Funzioni "Sincronizza su Cloud (Push)" e "Scarica da Cloud (Pull)".

---

### Capitolo 21: Sezione Avanzate E — Compilatore Fonti Testo da 20_RAW_SOURCES a 90_PROPOSALS

La schermata `Compilatore Fonti Testo` (`SCR-010`, `WF-010`) automatizza la trasformazione di testi grezzi:
- Esegue la funzione backend `batch_compile_sources`.
- Analizza i documenti grezzi in `20_RAW_SOURCES/` e genera note Markdown strutturate con metadati YAML salvandole in `90_PROPOSALS/`.
- Clic su **"COMPILA FONTI TESTO"** (`CTL-016`) per avviare il processo con indicatore di progresso.

---

### Capitolo 22: Sezione Avanzate F — Configurazione e Preferenze del Sistema

Gestione parametri globali (`SCR-011`):
- Percorso attivo del Vault.
- Commutazione modalità (100% Locale / Ibrida).
- Gestione chiave `OPENAI_API_KEY`.
- Parametri di ricerca vettoriale (Top-K, soglia di somiglianza).

---

### Capitolo 23: Sezione Avanzate G — Diagnostica, Log di Sistema e Manutenzione

Monitoraggio e manutenzione (`SCR-012`):
- PID e porta di `llama-server`.
- Monitor RAM occupata e VRAM Metal.
- Conteggio chunk e dimensione database `sqlite-vec`.
- Console dei log in tempo reale.

---

## Parte V — Integrazione e Sicurezza

### Capitolo 24: Integrazione Nativa con Obsidian (obsidian://open)

Nella parte inferiore della barra laterale sinistra (240px), il pulsante **"Apri in Obsidian"** (`CTL-007`) invia al sistema operativo il comando standard:  
`obsidian://open?path=<percorso_vault_url_encoded>`  
Obsidian apre direttamente la cartella del Vault caricando tutte le note delle categorie `01_CLIENTS` - `10_APPROVED_OUTPUTS` e le bozze in `90_PROPOSALS/`.

---

### Capitolo 25: Sicurezza Crittografica, Integrità SHA-256 e Audit Trail

- **Hashing SHA-256:** Calcolato a caldo su disco per rilevare alterazioni fisiche o corruzioni accidentali.
- **Ispezione Documenti:** Confronto istantaneo tra hash su disco e hash all'ingestione.
- **Rifiuto Tracciato:** Registrazione formale della decisione nell'audit log con motivazione, preservando la cronologia.
- **Download Modelli:** Distruzione automatica di qualsiasi file GGUF parziale o con checksum non corrispondente.

---

## Appendici

### Appendice A: Indice Analitico delle Azioni Rapide («Cosa ti serve?»)

| Obiettivo Operativo | Sezione dell'Interfaccia | Controllo o Azione da Eseguire |
| :--- | :--- | :--- |
| **Configurare il Vault al primo avvio** | Avvio dell'app | Completare i 3 step del Setup Wizard e cliccare "ENTRA IN LIMEN VAULT" |
| **Porre una domanda sui documenti** | 1. Chiedi al Vault | Digitare nel box di input in basso e premere INVIO |
| **Verificare la fonte di una risposta** | Sotto la risposta | Cliccare sulla pillola interattiva con il nome del documento |
| **Caricare nuovi documenti o note** | Sidebar sinistra | Cliccare sul pulsante verde lime "Carica Documenti" (`#c8ff00`) |
| **Consultare l'archivio dei file caricati**| 2. Documenti | Esaminare la tabella o filtrare tramite la barra di ricerca |
| **Leggere un documento originale** | 2. Documenti | Cliccare su "Leggi" nella riga del file per aprire la modale |
| **Esplorare le note consolidate** | 3. Memoria | Navigare tra le 10 categorie standard del Vault (01-10) |
| **Revisionare e approvare le bozze** | 4. Avanzate > Approvazione Note | Selezionare la bozza in 90_PROPOSALS e cliccare "Approva Revisione Mostrata" |
| **Salvare una nuova stesura della bozza** | 4. Avanzate > Approvazione Note | Modificare il testo e cliccare "Salva Nuova Revisione" |
| **Rifiutare con traccia di audit** | 4. Avanzate > Approvazione Note | Cliccare "Rifiuta Revisione Mostrata" (registra il motivo senza cancellare) |
| **Trasformare testi grezzi in bozze** | 4. Avanzate > Compilatore Fonti | Selezionare le fonti e cliccare "COMPILA FONTI TESTO" |
| **Creare uno snapshot di backup** | 4. Avanzate > Snapshot | Inserire un nome e cliccare "Crea Nuovo Snapshot" |
| **Ripristinare file da uno snapshot** | 4. Avanzate > Snapshot | Cliccare "Ripristina da Snapshot" (estrae in directory RECUPERO) |
| **Cambiare il modello LLM locale** | 4. Avanzate > Modelli LLM | Cliccare "Attiva Modello" sulla scheda desiderata |
| **Scaricare un nuovo modello GGUF** | 4. Avanzate > Modelli LLM | Cliccare "Scarica Modello" con barra di progresso e check hash |
| **Commutare la lingua (IT/EN)** | Header superiore | Cliccare sul pulsante selettore "IT \| EN" |
| **Avviare il controllo di integrità** | Header superiore | Cliccare sul pulsante centrale "Verifica" (icona RotateCw) |
| **Aprire il Vault dentro Obsidian** | Sidebar sinistra | Cliccare sul pulsante inferiore "Apri in Obsidian" |

---

### Appendice B: Guida alla Risoluzione dei Problemi (Troubleshooting)

- **ERR-001 (llama-server offline):** Accedere ad `Avanzate > Modelli LLM`, verificare la presenza del modello scaricato e fare clic su "Attiva Modello".
- **ERR-002 (File rifiutato):** Verificare che il file non superi 32 MB, appartenga ai formati ammessi (PDF, Office, fogli di calcolo, testo, immagini Vision OCR) e non sia protetto da password.
- **ERR-005 (RAM insufficiente / lentezza):** Selezionare un modello proporzionato alla memoria (Ministral 3B per 8 GB; Qwen 2.5 7B / Ministral 8B per 16 GB).
- **ERR-007 (Download checksum non valido):** Verificare la connessione e ripetere il download del modello GGUF.
- **ERR-004 (Obsidian non rilevato):** Installare ed eseguire Obsidian per registrare il protocollo `obsidian://`.

---

### Appendice C: Glossario Terminologico Ufficiale IT/EN

- **Vault:** La cartella del filesystem locale organizzata nelle 10 categorie di conoscenza (`01_CLIENTS` a `10_APPROVED_OUTPUTS`), in `20_RAW_SOURCES/` e in `90_PROPOSALS/`.
- **RAG (Retrieval-Augmented Generation):** Architettura che recupera frammenti documentali pertinenti dal database locale e li fornisce al modello per formulare la risposta.
- **Chunk Semantico:** Segmento di testo di circa 512 token (~1.500 caratteri) estratto con sovrapposizione contestuale di 50-100 token.
- **Embedding Vettoriale:** Vettore numerico a 1024 dimensioni calcolato localmente tramite `bge-m3`.
- **GGUF:** Formato binario ottimizzato per l'esecuzione di modelli linguistici quantizzati su CPU e GPU mediante `llama.cpp`.
- **Reasoning Trace:** La sequenza esplicita di passaggi logici intermedi generata dai modelli della famiglia DeepSeek nei tag `<think>...</think>`.
- **SHA-256:** Algoritmo crittografico a 64 caratteri esadecimali per la verifica di integrità fisica dei file su disco.
- **Local-First:** Paradigma in cui i dati risiedono primariamente e permanentemente sul dispositivo locale.
- **Zero-Network:** Vincolo che esclude connessioni o trasmissioni dati verso server remoti in modalità 100% Locale.
