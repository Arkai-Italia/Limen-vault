================================================================================
                                LIMEN Vault
   Trasforma i tuoi documenti in conoscenza ricercabile — Ricerca RAG & Wiki
================================================================================

Versione: Pre-release v7Mini (0.7.0)
Privacy: Loopback locale (127.0.0.1)
Stack tecnologico: Tauri v2 | Rust | React
Licenza: Scelta in fase di definizione da parte del maintainer

--------------------------------------------------------------------------------
1. CHE COS'È LIMEN VAULT?
--------------------------------------------------------------------------------

LIMEN Vault è un'applicazione desktop autonoma e locale ("local-first") che
trasforma i tuoi documenti in una base di conoscenza interrogabile.

Importa documenti nei formati supportati: LIMEN ne estrae il testo, lo converte
in formato Markdown e indicizza il contenuto risultante per la ricerca RAG
(Retrieval-Augmented Generation). Quando l'automazione della conoscenza è
abilitata e configurata, genera inoltre wiki tematiche a partire dalle tue fonti.

Non è necessario preparare file Markdown in anticipo né utilizzare Obsidian.
Il Markdown è il formato di archiviazione aperto che LIMEN genera dai tuoi
documenti; la compatibilità con Obsidian è opzionale.


--------------------------------------------------------------------------------
2. DAI DOCUMENTI ALLA CONOSCENZA
--------------------------------------------------------------------------------

1. Importa i tuoi documenti.
   Aggiungi file di testo, PDF, documenti office, fogli di calcolo o immagini.
   I file originali vengono preservati intatti all'interno del vault.

2. Estrai e converti.
   LIMEN estrae il testo leggibile e crea note sorgente in Markdown,
   mantenendo i riferimenti ai file originali. Le scansioni e le immagini
   supportate utilizzano l'OCR nativo su macOS.

3. Indicizza e cerca.
   Il contenuto generato diventa ricercabile tramite il motore lessicale BM25
   e, quando configurato, tramite vettori semantici. La modalità RAG sfrutta i
   passaggi recuperati per ancorare le risposte dell'AI ai tuoi documenti.

4. Genera wiki automaticamente.
   La pipeline di automazione raggruppa le fonti in pagine wiki tematiche
   corredate di citazioni e riferimenti. Puoi verificare in qualsiasi momento
   il contenuto generato confrontandolo con le fonti originali.

Requisiti di automazione:
L'attuale pipeline di classificazione automatica e generazione wiki utilizza
le API di OpenAI e richiede che l'automazione sia abilitata, un modello sia
configurato, sia presente una chiave API valida e vi sia accesso a Internet.
Le fonti elaborate vengono trasmesse a tale provider. Questa funzionalità è
separata dalla ricerca locale e dalle risposte generative locali: la pipeline
completa di automazione non è una funzione esclusivamente offline.


--------------------------------------------------------------------------------
3. FORMATI DI INPUT SUPPORTATI
--------------------------------------------------------------------------------

Tipo di Input               | Formati gestiti dalla pipeline di importazione
----------------------------+---------------------------------------------------
Testo e testo strutturato   | TXT, MD, Markdown, HTML/HTM, CSV, TSV, JSON, XML,
                            | YAML/YML, LOG, EML
Documenti Office            | DOCX, PPTX, ODT; conversione DOC e RTF su macOS
Fogli di calcolo            | XLS, XLSX, XLSB, ODS
PDF e immagini              | PDF, PNG, JPG/JPEG, WEBP, GIF, TIF/TIFF, HEIC —
                            | estrazione nativa / OCR su macOS

Note sull'estrazione:
L'estrazione dipende dalla presenza di testo leggibile, dalle codifiche
supportate, dalle capacità della piattaforma e dai limiti di elaborazione.
Per file non supportati o non leggibili non è garantita la produzione di testo
indicizzato. L'estrazione testuale non preserva ogni singolo dettaglio di layout
del documento originale.


--------------------------------------------------------------------------------
4. A CHI SERVE?
--------------------------------------------------------------------------------

- Professionisti che lavorano con molti documenti: ricercatori, consulenti e
  team che necessitano di cercare relazioni, note, fogli di calcolo e materiale
  di riferimento senza dover convertire manualmente ogni singolo file.
- Costruttori di basi di conoscenza: chiunque desideri trasformare una raccolta
  eterogenea di fonti in wiki tematiche collegate e generate automaticamente.
- Professionisti attenti alla privacy: team legali, ingegneri e ricercatori i
  cui dati riservati non possono lasciare la workstation locale.
- Sviluppatori e integratori di sistemi: chi cerca un'applicazione desktop
  leggera e verificabile basata su Tauri v2, Rust e React, senza dover ricorrere
  a pesanti runtime containerizzati o stack Electron.


--------------------------------------------------------------------------------
5. MODALITÀ OPERATIVE: LOCALE vs. IBRIDA
--------------------------------------------------------------------------------

LIMEN Vault definisce confini architetturali chiari tra le operazioni locali
e quelle via cloud:

Funzionalità                | Modalità 100% Locale         | Modalità Ibrida (Opzionale)
----------------------------+------------------------------+-----------------------------
Profilo di Rete             | Ambito Loopback Locale:      | Chiamate HTTPS in uscita
                            | le chiamate per gli          | verso API AI esterne
                            | embedding semantici e il     | (OpenAI).
                            | recupero avvengono su        |
                            | 127.0.0.1. Isolamento        |
                            | verificato tramite lsof      |
                            | su build a08e769 (2026-09-20)|
----------------------------+------------------------------+-----------------------------
Prerequisiti (Ricerca)      | Download una tantum del      | BM25 locale o endpoint
                            | modello di embedding GGUF    | vettoriali cloud opzionali.
                            | bge-m3 (~1.2 GB).            |
----------------------------+------------------------------+-----------------------------
Prerequisiti (Chat Gen.)    | Richiede un LLM generativo   | Chiave API fornita dall'utente
                            | locale (es. Ministral 3 3B   | (es. OpenAI) e connessione a
                            | Instruct, ~2.5 GB).          | Internet attiva.
                            | Nota: bge-m3 è solo per      |
                            | embedding vettoriali.        |
----------------------------+------------------------------+-----------------------------
Privacy dei Dati            | Note, passaggi ed embedding  | Gli estratti del contesto
                            | sono elaborati localmente    | selezionato vengono inviati
                            | tramite daemon su loopback.  | all'endpoint API esterno.


--------------------------------------------------------------------------------
6. FUNZIONALITÀ CHIAVE
--------------------------------------------------------------------------------

- Comunicazione su Loopback Locale: in modalità locale, la generazione dei
  vettori e il calcolo delle somiglianze comunicano su 127.0.0.1.
- Ricerca Ibrida: fonde il ranking lessicale BM25 normalizzato per lunghezza
  (ideale per codici, sigle e termini esatti) con vettori semantici densi (bge-m3).
- Fallback Degradato Automatico: se il processo AI locale non è attivo o viene
  arrestato, la ricerca passa immediatamente alla modalità lessicale BM25,
  mostrando un banner informativo e garantendo la continuità operativa.
- Pipeline Document-to-Knowledge: archivia i file originali, ne estrae il testo,
  genera le note Markdown corrispondenti e rende il materiale disponibile per
  l'indicizzazione e il recupero.
- Generazione Wiki Automatica: con l'automazione configurata, sintetizza pagine
  tematiche strutturate aggregando più fonti con citazioni verificabili.
- Risposte RAG: utilizza i passaggi documentali estratti come contesto per le
  risposte fornite dal modello linguistico (locale o cloud).
- Archiviazione Aperta e Compatibilità Obsidian: utilizza file Markdown
  standard (.md), frontmatter YAML e convenzioni wiki-link ([[Nota]]). Nessun
  lock-in all'interno di database proprietari.
- Shell Desktop Leggera: sviluppata con Tauri v2 (backend Rust e webview React)
  per evitare il consumo di risorse dei browser incorporati di tipo Electron.
- Setup Wizard in 3 Passaggi: configurazione guidata al primo avvio per
  selezionare la cartella del vault, verificare il motore AI locale e scegliere
  la modalità operativa.


--------------------------------------------------------------------------------
7. ARCHITETTURA DEL SISTEMA
--------------------------------------------------------------------------------

  [ Postazione Locale ]
    │
    ├── Interfaccia Utente (React / Shell Tauri v2)
    │     │
    │     ▼
    ├── LIMEN Vault Core (Rust / TypeScript)
    │     ├── Search Orchestrator (Orchestratore della ricerca ibrida)
    │     ├── Indicizzatore Lessicale BM25 (normalizzato)
    │     └── Estrattore Documentale & Ingestione Nativa (OCR macOS)
    │
    ├── Daemon di Inferenza Locale (Modalità Locale)
    │     ├── llama-server (Socket loopback su porta libera su 127.0.0.1)
    │     └── Modello bge-m3 GGUF (vettori densi a 1024 dimensioni)
    │
    └── LIMEN Knowledge Vault (Cartella Documenti)
          ├── 20_RAW_SOURCES (File originali conservati)
          ├── Note di sintesi e fonti convertite in Markdown
          ├── Wiki tematiche automatiche (generate con automazione cloud)
          └── 00_SYSTEM (Manifest di integrità, cache SHA-256 ed embedding)


--------------------------------------------------------------------------------
8. PIATTAFORME DISPONIBILI E STATO
--------------------------------------------------------------------------------

- macOS (Apple Silicon — ARM64): piattaforma principale verificata e supportata.
- Windows 11 (x64): versione di anteprima in sviluppo sul branch windows-build.
- Linux: pianificato per le future milestone di progetto.


--------------------------------------------------------------------------------
9. GUIDA INTRODUTTIVA
--------------------------------------------------------------------------------

OPZIONE A: BUILD PRECOMPILATA (macOS Apple Silicon)
I binari pesanti di release sono esclusi dal branch sorgente main. Un pacchetto
precompilato, firmato e notarizzato con certificato Apple Developer ID per
macOS Apple Silicon (v7Mini 0.7.0, ~49 MB) è ospitato su GitHub ed è scaricabile
direttamente al seguente link verificato:

Download installer DMG:
https://github.com/Arkai-Italia/Limen-vault/raw/windows-build/USER%20INSTALL/LIMEN-Vault-v7Mini.dmg

Installazione e primo avvio:
1. Scarica e apri LIMEN-Vault-v7Mini.dmg, quindi trascina LIMEN Vault nella
   cartella /Applications del tuo Mac.
2. L'applicazione è firmata e notarizzata con Developer ID Apple
   (Arkitecna Hong Kong Limited). Se macOS Gatekeeper lo richiede al primo
   avvio, conferma l'apertura.
3. Completa la procedura guidata in 3 passaggi (Setup Wizard):
   - Passo 1: seleziona la cartella per il tuo vault di conoscenza LIMEN
              (Obsidian non è obbligatorio).
   - Passo 2: verifica lo stato del motore di embedding locale (bge-m3) su 127.0.0.1.
   - Passo 3: scegli la modalità 100% Locale (offline) o Ibrida (con chiave API).


OPZIONE B: COMPILAZIONE ED ESECUZIONE DA SORGENTE

Prerequisiti:
- Node.js (>= 20.0.0) e pnpm (>= 9.0.0)
- Rust e Cargo (ultima versione stabile)
- macOS (14.0+ Apple Silicon) o Windows 11 (anteprima)

Comandi da terminale:
  # 1. Clona il repository
  git clone https://github.com/Arkai-Italia/Limen-vault.git
  cd Limen-vault

  # 2. Installa le dipendenze del monorepo
  pnpm install

  # 3. Esegui i test automatici e i controlli sulle dipendenze
  pnpm test
  pnpm typecheck

  # 4. Avvia l'applicazione Desktop con il backend nativo Tauri
  pnpm --filter @limen-vault/desktop tauri dev

  # Nota: per avviare il solo frontend web per prototipazione grafica UI:
  # pnpm dev:desktop


NOTE SU BINARI NATIVI E LIMITI DEL SORGENTE PER GLI SVILUPPATORI:
- Binari nativi e limiti del packaging standalone: la creazione del pacchetto
  autonomo notarizzato per macOS Apple Silicon (v7Mini) impiega binari nativi
  precompilati (come llama-server ottimizzato Metal) e pipeline di firma Apple
  non incluse nel branch pubblico main. La compilazione del file .dmg completo
  non è riproducibile direttamente dal solo albero open-source; gli utenti
  possono usare il DMG precompilato (Opzione A) oppure avviare l'app in sviluppo
  con tauri dev.
- Ciclo di vita del motore AI locale: quando la ricerca semantica locale è
  abilitata, il backend Rust gestisce direttamente il proprio sottoprocesso
  llama-server con il modello bge-m3-Q8_0.gguf (1024 dimensioni). Il binario
  viene rilevato automaticamente dai percorsi standard di sistema o tramite la
  variabile d'ambiente LLAMA_SERVER_PATH. Il backend assegna dinamicamente una
  porta libera di loopback su 127.0.0.1 (find_free_port) anziché vincolarsi a
  una porta fissa, e non supporta la connessione a endpoint terzi arbitrari.
- Motore lessicale BM25 e runtime desktop: l'indicizzazione e la ricerca lessicale
  BM25 sono implementate in Rust all'interno dell'applicazione desktop Tauri.
  Nell'app desktop, BM25 funge da solido fallback locale quando gli embedding
  semantici sono disattivi o non configurati. L'esecuzione del solo frontend
  (pnpm dev:desktop) nel browser serve unicamente gli asset web e non può
  accedere al filesystem locale né inviare query IPC al backend.


--------------------------------------------------------------------------------
10. STRUTTURA DEL MONOREPO
--------------------------------------------------------------------------------

├── apps/
│   ├── desktop/          # App desktop nativa Tauri v2 (React + TS + Rust)
│   └── web/              # Shell web Next.js
├── packages/
│   ├── ui/               # Design system condiviso
│   ├── vault-core/       # Interfacce core e protezioni di sicurezza filesystem
│   ├── vault-schema/     # Schemi Zod e contratti di dominio TypeScript
│   ├── search-engine/    # Motore di recupero BM25 e ibrido
│   └── snapshot-engine/  # Snapshot versionati e verifica integrità SHA-256
├── vault-template/       # Modello cartelle per fonti importate e note generate
├── docs/assets/          # Anteprime pubbliche, screenshot e social repo card
└── scripts/              # Strumenti di build e collaudo del monorepo


--------------------------------------------------------------------------------
11. LIMITI NOTI
--------------------------------------------------------------------------------

- Wiki automatiche: l'attuale pipeline di automazione richiede la configurazione
  di OpenAI e connettività Internet; la disponibilità della ricerca locale non
  implica la generazione offline delle wiki.
- Estrazione documenti: il supporto dipende dal formato e dal sistema operativo.
  L'estrazione avanzata da PDF/immagini e la conversione DOC/RTF legacy richiedono
  attualmente macOS.
- Prerequisito modello vettoriale: la ricerca semantica vettoriale richiede la
  presenza del file bge-m3 in formato GGUF nella cache locale dei modelli prima
  che il calcolo delle somiglianze sia operativo.
- Piattaforma Windows: la versione per Windows è in fase di anteprima e collaudo.
- Licenza open source: la scelta della licenza formale è in fase di definizione.


--------------------------------------------------------------------------------
12. COME CONTRIBUIRE
--------------------------------------------------------------------------------

I contributi della community, le segnalazioni di bug e le proposte sono benvenuti:
1. Apri una Issue su GitHub descrivendo i passi per riprodurre un eventuale bug
   o specificando la proposta di miglioramento.
2. Assicurati che tutti i test automatici (pnpm test) vengano superati prima di
   sottomettere una Pull Request.


--------------------------------------------------------------------------------
13. LICENZA
--------------------------------------------------------------------------------

Scelta della licenza in corso: la licenza software formale del progetto è in
fase di definizione finale da parte del maintainer.
