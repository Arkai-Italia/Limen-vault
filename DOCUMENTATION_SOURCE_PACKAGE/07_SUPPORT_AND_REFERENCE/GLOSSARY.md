# Glossario Terminologico Ufficiale — LIMEN Vault v7Mini

Il presente glossario definisce i termini tecnici, architetturali e di interfaccia utilizzati in LIMEN Vault (0.7.0), con la relativa corrispondenza bilingue Italiano / Inglese.

---

## Termini Architetturali e Tecnologici

| Termine Italiano | Termine Inglese | Definizione Operativa |
| :--- | :--- | :--- |
| **Local-First** | Local-First | Paradigma di sviluppo in cui i dati risiedono primariamente e permanentemente sul dispositivo locale dell'utente, garantendo piena operatività anche senza rete. |
| **Rete Zero** | Zero-Network | Vincolo architetturale che garantisce l'assenza totale di trasmissione di dati, query o telemetria verso server cloud esterni. |
| **RAG (Generazione con Recupero)** | RAG (Retrieval-Augmented Generation) | Architettura AI che interroga preliminarmente la knowledge base locale estraendo fonti pertinenti prima di generare la risposta con il modello linguistico. |
| **Embedding Vettoriale** | Vector Embedding | Vettore matematico a 1024 dimensioni calcolato dal modello `bge-m3` locale per rappresentare il significato semantico di un testo. |
| **Frammento Semantico (Chunk)** | Semantic Chunk | Blocco di testo di circa 512 token (~1.500 caratteri) estratto da un documento con sovrapposizione contestuale di 50-100 token. |
| **Formato GGUF** | GGUF Format | Formato binario moderno sviluppato per `llama.cpp` che consente il caricamento rapido e l'esecuzione ottimizzata di modelli quantizzati su CPU e GPU. |
| **Quantizzazione (Q4_K_M)** | Quantization (Q4_K_M) | Tecnica di compressione dei pesi del modello a 4 bit con schema K-quants medium per minimizzare l'uso di memoria senza perdita percepibile di intelligenza. |
| **Reasoning Trace** | Reasoning Trace | La sequenza esplicita di passaggi logici intermedi generata dai modelli DeepSeek-R1 all'interno dei tag `<think>...</think>`, visibile all'utente. |
| **Impronta SHA-256** | SHA-256 Hash | Algoritmo crittografico a senso unico che genera una stringa esadecimale di 64 caratteri, utilizzata per certificare l'integrità anti-manomissione dei file. |
| **Metal** | Metal | API grafica e di calcolo a basso livello sviluppata da Apple per sfruttare al massimo l'accelerazione della GPU integrata su chip Apple Silicon M1-M4. |
| **AVX2** | AVX2 (Advanced Vector Extensions) | Set di istruzioni vettoriali x86 per accelerare il calcolo parallelo delle operazioni matriciali dell'AI su CPU Intel e AMD su sistemi Windows. |

---

## Termini Interfaccia Utente (UI)

| Elemento IT | Elemento EN | Descrizione e Collocazione |
| :--- | :--- | :--- |
| **Chiedi al Vault** | Ask Vault | Schermata principale di conversazione e ricerca semantica (Area 1). |
| **Documenti** | Documents | Archivio tabellare dei file caricati e delle evidenze (Area 2). |
| **Memoria** | Memory | Mappa concettuale a grafo e catalogo delle note consolidate (Area 3). |
| **Avanzate** | Advanced | Pannello di amministrazione per bozze, modelli e snapshot (Area 4). |
| **Carica** | Upload | Pulsante globale nell'header per l'apertura del cassetto di acquisizione. |
| **Leggi** | Read | Pulsante azione nella tabella documenti per aprire il visualizzatore modale. |
| **Integrità Verificata** | Integrity Verified | Badge verde visualizzato quando l'hash ricalcolato su disco coincide con il record. |
| **Allarme Manomissione**| Tampering Detected | Badge rosso visualizzato quando il file locale differisce dall'impronta originale. |
| **Bozze (Inbox)** | Drafts (Inbox) | Sezione dedicata alla revisione dei testi generati prima della promozione. |
| **Snapshot e Ripristino**| Snapshot & Restore | Strumento per creare e recuperare copie di sicurezza integrali del Vault. |
| **Apri in Obsidian** | Open in Obsidian | Collegamento diretto per lanciare la cartella attiva nell'editor Obsidian. |
