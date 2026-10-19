# Indicizzazione immagini e memoria visiva dei progetti

Stato: proposta architetturale da conservare per uno sviluppo futuro. Nessuna implementazione autorizzata o completata con questo documento.

## Obiettivo

Limen deve riconoscere tipo e soggetto delle immagini, associarle ai progetti e riutilizzarle come riferimenti per generare nuove immagini in chat.

Esempio: «Verifica cosa abbiamo su Casa Aurora e generami immagini del floorplan e rendering degli esterni».

Il sistema deve recuperare documenti e immagini pertinenti, distinguere versioni e materiali approvati dalle semplici ispirazioni, quindi fornire al generatore sia le informazioni scritte sia le immagini originali selezionate. Le descrizioni testuali delle immagini, da sole, non bastano.

## Architettura proposta

| Componente | Funzione |
|---|---|
| Acquisizione | Importare immagini ed estrarre pagine e figure dai PDF, conservando il collegamento al documento sorgente. Riutilizzare l’OCR esistente per le scritte. |
| Catalogo visivo | Registrare identità stabile, hash, originale, anteprima, documento/pagina, progetto, versione, stato di approvazione e ruolo: pianta, prospetto, fotografia, rendering, materiale o ispirazione. |
| Analisi visiva AI | Riconoscere soggetto, ambienti, materiali e stile; produrre descrizioni e attributi strutturati. Separare osservazioni, interpretazioni e dati confermati; chiedere conferma quando progetto o ruolo sono incerti. |
| Indicizzazione | Combinare ricerca testuale sulle descrizioni, filtri per progetto/versione/stato e, in una fase successiva, embedding multimodali per somiglianza visiva. |
| Recupero in chat | Selezionare testi e immagini pertinenti alla richiesta, gestire versioni discordanti e costruire il pacchetto di riferimenti per la generazione. |
| Generazione | Inviare al modello istruzioni e immagini originali selezionate, conservando provenienza e vincoli. Salvare il risultato come nuova proposta del progetto, senza sostituire gli originali. |

Analisi e indicizzazione devono avvenire all’importazione o quando il contenuto cambia, con cache per hash e versione del modello. Non rianalizzare l’intero archivio a ogni domanda. Conservare separatamente il contenuto originale e i metadati prodotti dall’AI.

## Modelli AI da valutare

- **Analisi visiva:** Qwen3-VL-4B-Instruct è un candidato locale. Una variante quantizzata richiede verifica del runtime, della qualità e del consumo di memoria sul Mac da 8 GB; prestazioni non ancora misurate. Fonte: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- **Ricerca visiva:** modello di embedding multimodale da selezionare con prove sui materiali reali del progetto. L’indice testuale esistente può cercare le descrizioni, ma non sostituisce un indice visivo.
- **Conversazione:** riutilizzare il modello della chat per coordinare il recupero e preparare le istruzioni; la comprensione diretta delle immagini richiede un componente visivo.
- **Generazione:** valutare un servizio come GPT Image, con supporto a immagini di riferimento. La scelta del modello e i costi vanno verificati al momento dell’implementazione. Fonte: https://developers.openai.com/api/docs/guides/image-generation

L’invio di immagini a servizi esterni deve essere esplicito. La modalità Solo Locale deve impedirlo. Un generatore interamente locale è un’opzione distinta, da valutare su hardware, memoria, qualità e tempi; non è garantito su questo Mac.

## Prima versione proposta

1. Acquisire immagini e pagine PDF con identità e provenienza tracciabili.
2. Analizzarle e associarle al progetto, con revisione dei casi incerti.
3. Indicizzare descrizioni e attributi nella ricerca esistente.
4. Recuperare dalla chat documenti e immagini originali pertinenti.
5. Generare nuove immagini dai riferimenti selezionati e salvarle come proposte collegate alle fonti.
6. Aggiungere successivamente ricerca per somiglianza visiva e selezione più avanzata dei riferimenti.

## Limiti da gestire

- Una foto d’ispirazione non deve essere interpretata come geometria o materiale approvato del progetto.
- Le descrizioni AI possono essere errate: non trasformarle automaticamente in fatti progettuali.
- Per floorplan dimensionalmente affidabili serve una base geometrica strutturata, per esempio CAD/SVG con misure e vincoli. La generazione di immagini da sola non garantisce muri, aperture, proporzioni o distribuzioni corrette.
- Tempi, precisione e memoria devono essere misurati su fotografie, piante, rendering e PDF rappresentativi. Nessuna stima prestazionale è stata validata.

## Checklist futura

- [ ] Definire schema del catalogo visivo e associazione a progetti/versioni.
- [ ] Collaudare acquisizione di immagini e figure/pagine PDF.
- [ ] Valutare modello visivo locale su Mac da 8 GB.
- [ ] Implementare analisi con cache e revisione delle attribuzioni incerte.
- [ ] Integrare descrizioni e filtri nella ricerca esistente.
- [ ] Collegare recupero delle immagini originali e generazione in chat.
- [ ] Verificare consenso all’invio esterno e blocco in Solo Locale.
- [ ] Salvare risultati, riferimenti utilizzati e stato di proposta.
- [ ] Collaudare il flusso completo Casa Aurora su un progetto di prova.
- [ ] Valutare embedding visivi e gestione geometrica come estensioni successive.
