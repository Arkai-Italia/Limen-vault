# Glossario Terminologico Ufficiale — LIMEN Vault v7Mini

Il presente glossario definisce i termini tecnici, architetturali e di interfaccia utilizzati in LIMEN Vault (0.7.0), con la relativa corrispondenza bilingue Italiano / Inglese verificata nel codice sorgente.

---

## Termini Architetturali e Tecnologici

| Termine Italiano | Termine Inglese | Definizione Operativa |
| :--- | :--- | :--- |
| **Local-First** | Local-First | Paradigma architetturale in cui tutti i dati risiedono primariamente e permanentemente sul dispositivo locale dell'utente, consentendo piena operatività anche in assenza di rete. |
| **Rete Zero (100% Locale)** | Zero-Network (100% Local) | Vincolo di sicurezza che esclude ogni connessione, telemetria o invio di documenti verso server cloud esterni. |
| **RAG (Generazione con Recupero)** | RAG (Retrieval-Augmented Generation) | Architettura AI che esegue una ricerca semantica preliminare nel vault locale prima di generare la risposta con il modello linguistico. |
| **Embedding Vettoriale** | Vector Embedding | Vettore numerico a 1024 dimensioni calcolato localmente tramite modello `bge-m3` per rappresentare il significato semantico di un frammento di testo. |
| **Frammento Semantico (Chunk)** | Semantic Chunk | Blocco di testo di circa 512 token (~1.500 caratteri) estratto da un documento con sovrapposizione contestuale di 50-100 token. |
| **Formato GGUF** | GGUF Format | Formato binario moderno utilizzato da `llama.cpp` per caricare ed eseguire modelli linguistici quantizzati su CPU e GPU. |
| **Quantizzazione (Q4_K_M / Q5_K_M)** | Quantization (Q4_K_M / Q5_K_M) | Tecnica di compressione dei pesi del modello a 4 o 5 bit che riduce l'impronta di memoria RAM preservando l'accuratezza linguistica. |
| **Reasoning Trace** | Reasoning Trace | Sequenza esplicita di passaggi logici intermedi generata dai modelli della famiglia DeepSeek all'interno dei tag `<think>...</think>`, consultabile dall'utente. |
| **Impronta SHA-256** | SHA-256 Hash | Valore crittografico esadecimale a 64 caratteri calcolato a caldo per rilevare modifiche, discrepanze o corruzioni accidentali del file rispetto al momento dell'ingestione. |
| **Apple Vision OCR** | Apple Vision OCR | Framework di riconoscimento ottico nativo eseguito su macOS per estrarre testo da immagini (.png, .jpg, .webp) o scansioni prive di testo vettoriale. |
| **Accelerazione Hardware (Metal / AVX2)** | Hardware Acceleration (Metal / AVX2) | Ottimizzazioni di calcolo vettoriale a basso livello per GPU Apple Silicon (Metal) e CPU compatibili x86 (AVX2). |

---

## Termini Interfaccia Utente (UI)

| Elemento IT | Elemento EN | Descrizione e Collocazione |
| :--- | :--- | :--- |
| **Chiedi al Vault** | Ask Vault | Schermata principale di conversazione interattiva e ricerca semantica (Sidebar). |
| **Documenti** | Documents | Archivio tabellare dei documenti importati con visualizzazione metadati e stato integrità (Sidebar). |
| **Memoria** | Memory | Navigatore gerarchico strutturato sulle 10 categorie standard del Vault (`01_CLIENTS` a `10_APPROVED_OUTPUTS`) con anteprima note (Sidebar). |
| **Avanzate** | Advanced | Pannello impostazioni, gestione modelli LLM, snapshot e diagnostica (Sidebar). |
| **Carica Documenti** | Upload Documents | Pulsante d'azione primario evidenziato in colore lime (`#c8ff00`) nella barra laterale sinistra per aprire l'UploadDrawer. |
| **Verifica** | Verify | Pulsante centrale nell'header globale con icona RotateCw per avviare il controllo di integrità di sistema. |
| **Apri in Obsidian** | Open in Obsidian | Pulsante nella parte inferiore della sidebar che invia il protocollo `obsidian://open?path=...` per aprire la directory attiva nell'editor Obsidian. |
| **Bozze (90_PROPOSALS)** | Drafts (Proposals) | Sezione di revisione per note e bozze generate; consente l'approvazione con promozione nelle cartelle 01-10 o il rifiuto tracciato nell'audit log. |
| **Compilatore Fonti Testo** | Compile Text Sources | Funzionalità avanzata per trasformare in blocco documenti grezzi in `20_RAW_SOURCES/` in bozze strutturate Markdown in `90_PROPOSALS/`. |
| **Snapshot e Ripristino** | Snapshot & Restore | Modulo per creare archivi integrali del Vault e recuperare file in una directory separata sicura `{vault}_RECUPERO_{snapshot_id}`. |
| **Integrità Verificata** | Integrity Verified | Badge visivo verde indicante che l'hash ricalcolato a caldo su disco coincide con quello registrato all'ingestione. |
| **Discrepanza Hash** | Hash Mismatch | Badge visivo rosso di allarme mostrato nel Lettore Documenti quando il file su disco risulta modificato rispetto all'impronta memorizzata. |
