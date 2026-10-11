# Manuale Utente Ufficiale — LIMEN Vault v7Mini

**Versione Applicazione:** `0.7.0 (v7Mini)`  
**Data di Rilascio:** 11 Ottobre 2026  
**Identificativo Bundle:** `dev.arkai.limenvault`  
**Piattaforme Supportate:** macOS (Apple Silicon M1-M4 & Intel) | Windows 10/11 (x64 AVX2)  
**Ambiente Operativo:** Local-First Desktop / Riservatezza Zero-Network  

---

> [!NOTE]
> Il presente manuale costituisce la fonte documentale certificata per l'utilizzo operativo di **LIMEN Vault v7Mini (0.7.0)**.  
> Tutti i comandi, le scorciatoie da tastiera, le etichette bilingue e i flussi tecnici corrispondono fedelmente al codice sorgente dell'applicazione.

---

## Indice Generale dei Contenuti

- [Parte I — Guida di Consultazione Rapida](#parte-i--guida-di-consultazione-rapida)
  - [1. Indice per Menu e Struttura dell'Interfaccia](#1-indice-per-menu-e-struttura-dellinterfaccia)
  - [2. Indice Operativo per Compiti: «COSA TI SERVE?»](#2-indice-operativo-per-compiti-cosa-ti-serve)
- [Parte II — Fondamenti e Avvio del Sistema](#parte-ii--fondamenti-e-avvio-del-sistema)
  - [Capitolo 1: Introduzione a LIMEN Vault v7Mini (0.7.0)](#capitolo-1-introduzione-a-limen-vault-v7mini-070)
  - [Capitolo 2: Architettura e Privacy a Rete Zero (Zero-Network)](#capitolo-2-architettura-e-privacy-a-rete-zero-zero-network)
  - [Capitolo 3: Requisiti di Sistema e Accelerazione Hardware (Metal / AVX2 / RAM)](#capitolo-3-requisiti-di-sistema-e-accelerazione-hardware)
  - [Capitolo 4: Installazione e Primo Avvio](#capitolo-4-installazione-e-primo-avvio)
  - [Capitolo 5: Il Setup Wizard Guidato (Configurazione in 3 Passaggi)](#capitolo-5-il-setup-wizard-guidato)
- [Parte III — Interfaccia Utente e Workflow Primari](#parte-iii--interfaccia-utente-e-workflow-primari)
  - [Capitolo 6: Panoramica dell'Interfaccia e Navigazione a 4 Aree](#capitolo-6-panoramica-dellinterfaccia-e-navigazione-a-4-aree)
  - [Capitolo 7: L'Header Globale e le Funzioni di Stato](#capitolo-7-lheader-globale-e-le-funzioni-di-stato)
  - [Capitolo 8: Area 1 — Chiedi al Vault: Ricerca Semantica RAG e Chat](#capitolo-8-area-1--chiedi-al-vault-ricerca-semantica-rag-e-chat)
  - [Capitolo 9: Comprensione del Reasoning Trace (Modelli DeepSeek-R1)](#capitolo-9-comprensione-del-reasoning-trace)
  - [Capitolo 10: Ispezione delle Fonti e Citazioni Verificate](#capitolo-10-ispezione-delle-fonti-e-citazioni-verificate)
  - [Capitolo 11: Il Lettore Documenti Integrato (DocumentReaderModal)](#capitolo-11-il-lettore-documenti-integrato)
  - [Capitolo 12: Area 2 — Gestione Documenti e Indicizzazione](#capitolo-12-area-2--gestione-documenti-e-indicizzazione)
  - [Capitolo 13: Caricamento File e Cartelle (UploadDrawer)](#capitolo-13-caricamento-file-e-cartelle)
  - [Capitolo 14: Area 3 — Esplorazione della Memoria e Grafo Concettuale](#capitolo-14-area-3--esplorazione-della-memoria-e-grafo-concettuale)
- [Parte IV — Amministrazione e Sezioni Avanzate](#parte-iv--amministrazione-e-sezioni-avanzate)
  - [Capitolo 15: Area 4 — Sezioni Avanzate: Panoramica Generale](#capitolo-15-area-4--sezioni-avanzate-panoramica-generale)
  - [Capitolo 16: Sezione Avanzate A — Approvazione Note e Gestione Bozze (00_INBOX)](#capitolo-16-sezione-avanzate-a--approvazione-note-e-bozze)
  - [Capitolo 17: Sezione Avanzate B — Gestione Snapshot e Ripristino del Vault](#capitolo-17-sezione-avanzate-b--gestione-snapshot-e-ripristino)
  - [Capitolo 18: Sezione Avanzate C — Catalogo Modelli LLM e Gestione llama.cpp](#capitolo-18-sezione-avanzate-c--catalogo-modelli-llm-e-llamacpp)
  - [Capitolo 19: Dimensionamento RAM e Scelta del Modello (3B, 7B, 8B, 14B)](#capitolo-19-dimensionamento-ram-e-scelta-del-modello)
  - [Capitolo 20: Sezione Avanzate D — Sincronizzazione Cloud S3/R2 (Opzionale)](#capitolo-20-sezione-avanzate-d--sincronizzazione-cloud-s3r2)
  - [Capitolo 21: Sezione Avanzate E — Compilazione Manuale Rete Zero da Sorgenti](#capitolo-21-sezione-avanzate-e--compilazione-manuale-rete-zero)
  - [Capitolo 22: Sezione Avanzate F — Configurazione e Preferenze del Sistema](#capitolo-22-sezione-avanzate-f--configurazione-e-preferenze)
  - [Capitolo 23: Sezione Avanzate G — Diagnostica, Log di Sistema e Manutenzione](#capitolo-23-sezione-avanzate-g--diagnostica-log-e-manutenzione)
- [Parte V — Integrazione e Sicurezza](#parte-v--integrazione-e-sicurezza)
  - [Capitolo 24: Integrazione Nativa con Obsidian (obsidian://open)](#capitolo-24-integrazione-nativa-con-obsidian)
  - [Capitolo 25: Sicurezza Crittografica, Integrità SHA-256 e Audit Trail](#capitolo-25-sicurezza-crittografica-integrità-sha-256-e-audit-trail)
- [Appendici](#appendici)
  - [Appendice A: Indice Analitico delle Azioni Rapide («COSA TI SERVE?»)](#appendice-a-indice-analitico-delle-azioni-rapide)
  - [Appendice B: Guida alla Risoluzione dei Problemi (Troubleshooting)](#appendice-b-guida-alla-risoluzione-dei-problemi)
  - [Appendice C: Glossario dei Termini Tecnici e Traduzioni IT/EN](#appendice-c-glossario-dei-termini-tecnici-e-traduzioni-iten)

---

## Parte I — Guida di Consultazione Rapida

### 1. Indice per Menu e Struttura dell'Interfaccia

L'interfaccia si suddivide in un **Header Globale Fisso**, **4 Aree Primarie** e **7 Sezioni Avanzate Secondarie**:

```
+---------------------------------------------------------------------------------------------------+
| [LOGO] LIMEN Vault v7Mini (0.7.0) | ● 100% Locale | [Apri in Obsidian] [ IT | EN ] | [ + CARICA ] |
+---------------------------------------------------------------------------------------------------+
|   [ 1. Chiedi al Vault ]   |   [ 2. Documenti ]   |   [ 3. Memoria ]   |   [ 4. Avanzate ]        |
+---------------------------------------------------------------------------------------------------+
```

- **Header Globale:**
  - Identificatore Versione `0.7.0 (v7Mini)` — [Capitolo 7](#capitolo-7-lheader-globale-e-le-funzioni-di-stato)
  - Indicatore Stato Rete (100% Locale / Ibrida) — [Capitolo 7](#capitolo-7-lheader-globale-e-le-funzioni-di-stato)
  - Pulsante Rapido: `Apri in Obsidian` (`NAV-004`) — [Capitolo 24](#capitolo-24-integrazione-nativa-con-obsidian) / [WF-012](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-012-apri-in-obsidian.md)
  - Selettore Lingua: `IT | EN` (`NAV-005`) — [Capitolo 7](#capitolo-7-lheader-globale-e-le-funzioni-di-stato) / [WF-011](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-011-cambio-lingua.md)
  - Pulsante Primario Globale: `Carica` (`NAV-006`) — [Capitolo 13](#capitolo-13-caricamento-file-e-cartelle) / [WF-004](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-004-carica-documenti.md)

- **Area 1: Chiedi al Vault** (`NAV-001`) — [Capitolo 8](#capitolo-8-area-1--chiedi-al-vault-ricerca-semantica-rag-e-chat) / [WF-002](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-002-chiedi-al-vault.md)
- **Area 2: Documenti** (`NAV-002`) — [Capitolo 12](#capitolo-12-area-2--gestione-documenti-e-indicizzazione)
- **Area 3: Memoria** (`NAV-003`) — [Capitolo 14](#capitolo-14-area-3--esplorazione-della-memoria-e-grafo-concettuale) / [WF-005](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-005-esplora-memoria.md)
- **Area 4: Avanzate** (`NAV-007` a `NAV-013`) — [Capitoli 15-23](#parte-iv--amministrazione-e-sezioni-avanzate)
  - Sezione A: Approvazione Note (Bozze `00_INBOX`) — [WF-006](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-006-approvazione-bozze.md)
  - Sezione B: Snapshot e Ripristino — [WF-007](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-007-snapshot-ripristino.md)
  - Sezione C: Modelli LLM & llama.cpp — [WF-008](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-008-catalogo-modelli-llm.md)
  - Sezione D: Sincronizzazione Cloud S3/R2 — [WF-009](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-009-sincronizzazione-cloud.md)
  - Sezione E: Compilazione Manuale Rete Zero — [WF-010](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-010-compilatore-manuale.md)
  - Sezione F: Configurazione
  - Sezione G: Diagnostica e Log

---

### 2. Indice Operativo per Compiti: «COSA TI SERVE?»

| Cosa ti serve fare adesso? | Dove andare nell'app | Capitolo di Riferimento | Scheda Procedurale |
| :--- | :--- | :--- | :--- |
| **Configurare il Vault al primissimo avvio** | Avvio Applicazione | [Capitolo 5](#capitolo-5-il-setup-wizard-guidato) | [WF-001](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-001-setup-wizard.md) |
| **Interrogare i propri documenti con l'AI offline** | `1. Chiedi al Vault` | [Capitolo 8](#capitolo-8-area-1--chiedi-al-vault-ricerca-semantica-rag-e-chat) | [WF-002](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-002-chiedi-al-vault.md) |
| **Ispezionare la fonte originale e l'hash SHA-256** | Clic su fonte o riga file | [Capitolo 10](#capitolo-10-ispezione-delle-fonti-e-citazioni-verificate) & [11](#capitolo-11-il-lettore-documenti-integrato) | [WF-003](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-003-lettore-documenti.md) |
| **Caricare nuovi documenti (PDF, MD, TXT)** | Header > Pulsante `Carica` | [Capitolo 13](#capitolo-13-caricamento-file-e-cartelle) | [WF-004](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-004-carica-documenti.md) |
| **Navigare tra i concetti e le note del Vault** | `3. Memoria` | [Capitolo 14](#capitolo-14-area-3--esplorazione-della-memoria-e-grafo-concettuale) | [WF-005](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-005-esplora-memoria.md) |
| **Revisionare e approvare bozze dell'AI (`00_INBOX`)** | `Avanzate > Approvazione Note` | [Capitolo 16](#capitolo-16-sezione-avanzate-a--approvazione-note-e-bozze) | [WF-006](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-006-approvazione-bozze.md) |
| **Creare un backup crittografico del Vault** | `Avanzate > Snapshot` | [Capitolo 17](#capitolo-17-sezione-avanzate-b--gestione-snapshot-e-ripristino) | [WF-007](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-007-snapshot-ripristino.md) |
| **Cambiare o scaricare un modello locale (LLM)** | `Avanzate > Modelli LLM` | [Capitolo 18](#capitolo-18-sezione-avanzate-c--catalogo-modelli-llm-e-llamacpp) & [19](#capitolo-19-dimensionamento-ram-e-scelta-del-modello) | [WF-008](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-008-catalogo-modelli-llm.md) |
| **Commutare la lingua tra Italiano e Inglese** | Header > Selettore `IT / EN` | [Capitolo 7](#capitolo-7-lheader-globale-e-le-funzioni-di-stato) | [WF-011](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-011-cambio-lingua.md) |
| **Lavorare sulle note direttamente in Obsidian** | Header > `Apri in Obsidian` | [Capitolo 24](#capitolo-24-integrazione-nativa-con-obsidian) | [WF-012](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-012-apri-in-obsidian.md) |

---

## Parte II — Fondamenti e Avvio del Sistema

### Capitolo 1: Introduzione a LIMEN Vault v7Mini (0.7.0)

**LIMEN Vault v7Mini** è un ambiente desktop ad alte prestazioni progettato per la gestione sovrana della conoscenza. A differenza dei sistemi cloud commerciali, l'applicazione garantisce che ogni documento immesso, ogni indice semantico e ogni inferenza conversazionale rimangano confinati sul computer dell'utente.

La release **0.7.0** consolida l'architettura **v7Mini**:
- Integrazione nativa del runtime C++ `llama.cpp` accelerato via GPU Metal (Apple Silicon) e istruzioni AVX2 (Windows).
- Modello di embedding multilingue ad alta densità `bge-m3` (1024 dimensioni) eseguito in locale.
- Visualizzazione del filo logico di pensiero (**Reasoning Trace**) per i modelli della serie DeepSeek-R1.
- Validazione dell'integrità dei documenti mediante hash crittografico **SHA-256**.

---

### Capitolo 2: Architettura e Privacy a Rete Zero (Zero-Network)

Il principio fondante di LIMEN Vault è la **Riservatezza a Rete Zero**:
1. **Elaborazione Locale Completa:** Nessun testo o metadato viene inviato a server cloud proprietari.
2. **Nessuna Telemetria Nascosta:** Il codice non include tracker, cookie di terze parti o chiamate analitiche.
3. **Loopback Sicuro:** La comunicazione tra il frontend React e il motore LLM avviene esclusivamente su socket di loopback protetto (`127.0.0.1:8080`).
4. **Isolamento Fisico:** L'utente può utilizzare l'applicazione anche con computer scollegato da qualsiasi rete locale o internet.

---

### Capitolo 3: Requisiti di Sistema e Accelerazione Hardware

#### Specifiche Minime e Raccomandate

- **Apple macOS:**
  - Processori Apple Silicon M1, M2, M3 o M4 (architettura `aarch64`).
  - Sistemi Intel 64-bit con macOS 13.0+.
  - Accelerazione GPU: **Metal** (attivata di default).
- **Microsoft Windows:**
  - Processori Intel Core o AMD Ryzen a 64 bit con supporto **AVX2**.
  - Windows 10 (64-bit) o Windows 11.

#### Matrice RAM e Dimensionamento Modelli

| RAM Computer | Modello Consigliato | Nome File GGUF | Quantizzazione | RAM Impegnata |
| :--- | :--- | :--- | :--- | :--- |
| **8 GB RAM** | **Ministral 3B Instruct** | `ministral-3b-instruct-q4_k_m.gguf` | Q4_K_M | ~2.4 GB |
| **16 GB RAM** | **Ministral 8B Instruct** | `ministral-8b-instruct-q4_k_m.gguf` | Q4_K_M | ~5.5 GB |
| **16 GB RAM** | **Qwen 2.5 7B Instruct** | `qwen2.5-7b-instruct-q4_k_m.gguf` | Q4_K_M | ~4.9 GB |
| **16 GB RAM** | **Llama 3.1 8B Instruct** | `meta-llama-3.1-8b-instruct-q4_k_m.gguf` | Q4_K_M | ~5.4 GB |
| **16 GB RAM** | **DeepSeek-R1 Distill 7B** | `deepseek-r1-distill-qwen-7b-q4_k_m.gguf`| Q4_K_M | ~4.9 GB |
| **24-32+ GB** | **DeepSeek-R1 Distill 14B**| `deepseek-r1-distill-qwen-14b-q4_k_m.gguf`| Q4_K_M | ~9.2 GB |

---

### Capitolo 4: Installazione e Primo Avvio

- **macOS:** Aprire l'immagine `.dmg` e trascinare `LIMEN Vault.app` nella cartella `Applicazioni`. Al primo avvio confermare l'apertura tramite Gatekeeper.
- **Windows:** Eseguire il programma di installazione `LIMEN-Vault-Setup-0.7.0.exe`. Se compare la schermata SmartScreen, fare clic su "Ulteriori informazioni" ed "Esegui comunque".

---

### Capitolo 5: Il Setup Wizard Guidato

Al primo avvio, l'applicazione presenta la modale `SetupWizardModal` per guidare l'utente in 3 semplici passaggi:

1. **Step 1/3 — Scelta Modalità:** Selezionare tra **"100% Locale"** (nessuna connessione) oppure **"Ibrida"** (con inserimento opzionale della chiave OpenAI).
2. **Step 2/3 — Configurazione Vault:** Cliccare su **"Sfoglia cartella"** per scegliere la directory in cui archiviare i dati. Il sistema crea automaticamente la struttura:
   - `00_INBOX`
   - `10_KNOWLEDGE`
   - `20_RAW_SOURCES`
3. **Step 3/3 — Modello LLM:** Selezionare il modello consigliato per la propria RAM (es. Ministral 3B o Qwen 7B) e confermare con **"Completa Configurazione"**.

*Riferimento Diagramma:* Vedere [WF-001.mmd](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/04_MERMAID/WF-001.mmd) e [AUTH_LIFECYCLE.mmd](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/04_MERMAID/AUTH_LIFECYCLE.mmd).

---

## Parte III — Interfaccia Utente e Workflow Primari

### Capitolo 6: Panoramica dell'Interfaccia e Navigazione a 4 Aree

L'interfaccia utilizza una combinazione cromatica professionale Dark Slate:
- **Sfondo Principale:** `#0f172a` (Slate 900 scuro profondo)
- **Superficie Card:** `#1e293b` (Slate 800)
- **Accenti ed Evidenziazioni:** `#c8ff00` e `#77f117` (Lime energico)
- **Bordi e Separatori:** `#334155` (Slate 700)

*Riferimento Diagramma:* Vedere [SYSTEM_NAVIGATION.mmd](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/04_MERMAID/SYSTEM_NAVIGATION.mmd).

---

### Capitolo 7: L'Header Globale e le Funzioni di Stato

L'header superiore contiene:
- **Logo e Versione:** `LIMEN Vault v7Mini (0.7.0)`
- **Badge Rete:** Visualizza lo stato di isolamento offline.
- **Pulsante "Apri in Obsidian":** Avvia direttamente il vault locale in Obsidian.
- **Selettore Lingua "IT | EN":** Consente lo switch a caldo tra Italiano e Inglese senza ricaricare la finestra.
- **Pulsante "Carica":** Apre l'UploadDrawer laterale.

---

### Capitolo 8: Area 1 — Chiedi al Vault: Ricerca Semantica RAG e Chat

In questa sezione l'utente dialoga con la knowledge base:
1. Digitare la domanda nel campo prompt (`CTL-007`).
2. Premere `INVIO` o cliccare sull'icona di invio (`CTL-008`).
3. Il motore esegue l'embedding vettoriale della richiesta con `bge-m3`, individua i passaggi più pertinenti e li trasmette al modello locale.
4. La risposta viene generata in streaming continuo Markdown.

*Riferimento Procedurale:* [WF-002](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-002-chiedi-al-vault.md).

---

### Capitolo 9: Comprensione del Reasoning Trace (Modelli DeepSeek-R1)

Quando si utilizzano modelli di ragionamento (es. `DeepSeek-R1 Distill 7B`), l'interfaccia attiva la card **"Pensiero del modello (Reasoning Trace)"**:
- Mostra in tempo reale il ragionamento preliminare formulato dal modello.
- Il testo è visualizzato in corsivo per distinguerlo dalla risposta finale.
- Al completamento dell'inferenza, il box si richiude automaticamente in un pannello fisarmonica espandibile su richiesta.

*Riferimento Diagramma:* [PIPE-003.mmd](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/04_MERMAID/PIPE-003.mmd).

---

### Capitolo 10: Ispezione delle Fonti e Citazioni Verificate

Al termine di ogni risposta, LIMEN Vault elenca le pillole delle fonti citate:
- Nome del file sorgente originario (es. `Contratto_Consulenza.pdf`).
- Pagina o sezione esatta estratta.
- Punteggio di somiglianza semantica (es. `Score: 89%`).
- Cliccando su una pillola si apre istantaneamente il **Lettore Documenti Integrato**.

---

### Capitolo 11: Il Lettore Documenti Integrato (DocumentReaderModal)

Finestra modale dedicata all'esame visivo e alla verifica probatoria:
- **Visualizzazione Nascita:** Renderizza PDF multipagina, file Markdown formattati e file di testo grezzo.
- **Controllo Hash SHA-256 a Caldo:** Ricalcola l'impronta sui byte su disco. Mostra un **badge verde** se il file è integro, o un **allarme rosso** se il file è stato manomesso esternamente.
- **Pulsante "Copia Hash":** Copia la stringa esadecimale di 64 caratteri negli appunti di sistema.

*Riferimento Procedurale:* [WF-003](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-003-lettore-documenti.md).

---

### Capitolo 12: Area 2 — Gestione Documenti e Indicizzazione

La schermata mostra la tabella completa dei documenti archiviati in `20_RAW_SOURCES`:
- Filtro di ricerca per nome o estensione.
- Colonne: Nome file, Estensione, Dimensione, Data Indicizzazione, Hash SHA-256.
- Pulsante **"Leggi"** su ciascuna riga per ispezione diretta.

---

### Capitolo 13: Caricamento File e Cartelle (UploadDrawer)

Accessibile tramite il pulsante **"Carica"** dell'header:
1. Supporta file singoli, cartelle ricorsive e Drag & Drop.
2. Formati ammessi: `.pdf`, `.md`, `.txt`.
3. Cliccando su **"Avvia Indicizzazione"**, la pipeline `PIPE-001` copia i file in `20_RAW_SOURCES`, ne calcola l'hash, divide il testo in chunk di ~512 token e calcola gli embedding vettoriali.

*Riferimento Procedurale:* [WF-004](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-004-carica-documenti.md).

---

### Capitolo 14: Area 3 — Esplorazione della Memoria e Grafo Concettuale

Visualizza le note consolidate in `10_KNOWLEDGE`:
- **Tag Cloud Semantico:** Elenco delle categorie tematiche rilevate.
- **Mappa Concettuale a Grafo:** Rappresentazione nodale delle correlazioni semantiche tra note.
- **Elenco Schede:** Visualizzazione delle note pronte per la consultazione o l'apertura in Obsidian.

*Riferimento Procedurale:* [WF-005](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-005-esplora-memoria.md).

---

## Parte IV — Amministrazione e Sezioni Avanzate

### Capitolo 15: Area 4 — Sezioni Avanzate: Panoramica Generale

Il menu di amministrazione include 7 sezioni operative:
- **A. Approvazione Note (Bozze)**
- **B. Snapshot e Ripristino**
- **C. Catalogo Modelli LLM & llama.cpp**
- **D. Sincronizzazione Cloud S3/R2**
- **E. Compilazione Manuale Rete Zero**
- **F. Configurazione e Impostazioni**
- **G. Diagnostica e Log**

---

### Capitolo 16: Sezione Avanzate A — Approvazione Note e Bozze (00_INBOX)

Le sintesi e le note estratte dall'AI vengono conservate come bozze provvisorie nella cartella `00_INBOX`.  
In questa sezione l'utente può:
- Revisionare il testo proposto e modificare il titolo.
- Fare clic su **"Approva e Promuovi"**: il file viene spostato fisicamente in `10_KNOWLEDGE` come nota consolidata.
- Fare clic su **"Scarta"**: la bozza viene eliminata.

*Riferimento Procedurale:* [WF-006](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-006-approvazione-bozze.md).

---

### Capitolo 17: Sezione Avanzate B — Gestione Snapshot e Ripristino

Permette di creare punti di ripristino istantanei dell'intero Vault:
- **Creazione Snapshot:** Inserire un'etichetta (es. `backup_mensile`) e confermare; il Vault viene compresso e protetto con manifesto SHA-256.
- **Ripristino:** In caso di errore o cancellazioni, ripristina la struttura del Vault all'istante esatto dello snapshot selezionato.

*Riferimento Procedurale:* [WF-007](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-007-snapshot-ripristino.md).

---

### Capitolo 18: Sezione Avanzate C — Catalogo Modelli LLM e llama.cpp

Governa il motore locale `llama-server`:
- Mostra le 6 schede dei modelli supportati con dimensione e RAM richiesta.
- **Pulsante "Scarica":** Scarica il file GGUF da Hugging Face con barra di avanzamento e verifica checksum SHA-256.
- **Pulsante "Attiva Modello":** Avvia `llama-server` sulla porta locale `8080` caricando i pesi in memoria.

*Riferimento Procedurale:* [WF-008](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-008-catalogo-modelli-llm.md).

---

### Capitolo 19: Dimensionamento RAM e Scelta del Modello

- Per computer con **8 GB di RAM**: Utilizzare esclusivamente **Ministral 3B Instruct** (~2.4 GB).
- Per computer con **16 GB di RAM**: Scelta libera tra **Ministral 8B**, **Qwen 2.5 7B**, **Llama 3.1 8B** e **DeepSeek-R1 Distill 7B**.
- Per workstation con **24-32+ GB di RAM**: Attivare **DeepSeek-R1 Distill 14B** (~9.2 GB) per la massima potenza di calcolo logico.

---

### Capitolo 20: Sezione Avanzate D — Sincronizzazione Cloud S3/R2 (Opzionale)

Consente l'archiviazione remota degli snapshot su storage compatibile AWS S3 (Cloudflare R2, MinIO, AWS):
- Configurazione Endpoint, Bucket, Access Key e Secret Key.
- Funzionalità **Push** (caricamento backup cifrato) e **Pull** (ripristino da remoto).

*Riferimento Procedurale:* [WF-009](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-009-sincronizzazione-cloud.md).

---

### Capitolo 21: Sezione Avanzate E — Compilazione Manuale Rete Zero

Espone i comandi ufficiali di compilazione per audit di sicurezza:
```bash
# Compilazione Desktop con preservazione cache di build
npx pnpm --filter @limen-vault/desktop tauri dev --release

# Compilazione llama-server Metal (macOS)
cmake -B build -DGGML_METAL=ON -DLLAMA_BUILD_SERVER=ON
cmake --build build --config Release -j$(sysctl -n hw.ncpu)
```

*Riferimento Procedurale:* [WF-010](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-010-compilatore-manuale.md).

---

### Capitolo 22: Sezione Avanzate F — Configurazione e Preferenze

Gestione delle impostazioni di sistema:
- Modifica del percorso della cartella Vault.
- Commutazione tra modalità Locale e Ibrida.
- Gestione della chiave API OpenAI.
- Reset delle impostazioni di fabbrica.

---

### Capitolo 23: Sezione Avanzate G — Diagnostica, Log e Manutenzione

Strumenti per verificare lo stato di funzionamento:
- PID del processo `llama-server` e porta loopback (8080).
- Monitoraggio della memoria RAM allocata.
- Conteggio dei chunk e dimensione del database SQLite.
- Registro eventi in tempo reale per analisi di anomalie.

---

## Parte V — Integrazione e Sicurezza

### Capitolo 24: Integrazione Nativa con Obsidian (obsidian://open)

Tutti i dati e le note di LIMEN Vault sono file Markdown aperti salvati su filesystem.  
Cliccando su **"Apri in Obsidian"** (`NAV-004`):
- Il sistema lancia l'URI scheme `obsidian://open?path=<percorso_vault>`.
- Obsidian si apre istantaneamente mostrando la gerarchia `00_INBOX`, `10_KNOWLEDGE`, `20_RAW_SOURCES`.

*Riferimento Procedurale:* [WF-012](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/03_WORKFLOWS/WF-012-apri-in-obsidian.md).

---

### Capitolo 25: Sicurezza Crittografica, Integrità SHA-256 e Audit Trail

- **Hashing Immediato:** All'acquisizione, ogni documento riceve la propria impronta crittografica `SHA-256`.
- **Verifica Continua:** Il Lettore Documenti verifica che il file su disco non sia stato manipolato prima di mostrarne il testo.
- **Protezione Modelli:** I pesi dei modelli GGUF scaricati da internet vengono confrontati con i valori certificati prima dell'esecuzione.

*Riferimento Diagramma:* [PIPE-004.mmd](file:///Users/cesare/Documents/MEMAI%20V_FALLBACK%20OBSIDIAN/DOCUMENTATION_SOURCE_PACKAGE/04_MERMAID/PIPE-004.mmd).

---

## Appendici

### Appendice A: Indice Analitico delle Azioni Rapide («COSA TI SERVE?»)

Vedere la [Sezione 2 della Guida Rapida](#2-indice-operativo-per-compiti-cosa-ti-serve) per la consultazione immediata dei flussi.

---

### Appendice B: Guida alla Risoluzione dei Problemi (Troubleshooting)

- **`ERR-001` (llama-server offline):** Riavviare il server dalla schermata `Avanzate > Modelli LLM`.
- **`ERR-002` (Errore Parsing PDF):** Controllare che il file non sia protetto da password o privo di testo vettoriale.
- **`ERR-007` (Checksum Modello Non Valido):** Ripetere il download del file GGUF dopo aver verificato la connessione.
- **`ERR-004` (Obsidian Non Rilevato):** Verificare l'installazione di Obsidian sul proprio sistema operativo.

---

### Appendice C: Glossario dei Termini Tecnici e Traduzioni IT/EN

- **Vault:** La directory locale strutturata (`00_INBOX`, `10_KNOWLEDGE`, `20_RAW_SOURCES`).
- **RAG (Retrieval-Augmented Generation):** Interrogazione basata su frammenti documentali certificati.
- **GGUF:** Formato di file ottimizzato per inferenza locale su CPU/GPU con `llama.cpp`.
- **Reasoning Trace:** Traccia visibile del filo logico formulata da modelli DeepSeek-R1.
- **SHA-256:** Funzione di hashing crittografica per la garanzia di integrità.

---
*Fine del Manuale Utente — LIMEN Vault v7Mini (0.7.0)*
