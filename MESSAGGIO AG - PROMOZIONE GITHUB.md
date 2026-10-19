# Incarico per AG — Preparare la promozione GitHub in 6 passaggi

## Obiettivo e perimetro

Prepara un pacchetto locale, concreto e pronto da revisionare per aumentare la visibilità della repository di questo progetto. Crea nella root la cartella `PROMO_GITHUB_LOCAL/` e aggiungi a `.gitignore` la regola ancorata `/PROMO_GITHUB_LOCAL/`, preservando tutte le regole esistenti.

L'incarico autorizza la preparazione dei materiali e la sola modifica necessaria a `.gitignore`. Tutte le proposte per README pubblico, descrizione, topics, issue e post devono rimanere nella cartella locale. Non modificare codice applicativo o documentazione pubblica. Non eseguire commit, push, deploy, pubblicazioni, invii o modifiche su GitHub o account esterni. Non acquistare servizi.

## Prima di iniziare

- Leggi le regole del progetto applicabili.
- Verifica root Git, branch, HEAD, remote e stato del checkout. Conserva le modifiche preesistenti; non fare reset, checkout distruttivi o aggiornamenti del branch.
- Leggi il README e il minimo insieme di manifest, documenti e file necessario a verificare nome, scopo, pubblico, installazione, licenza e funzionalità da presentare. Leggi per intero i file pertinenti prima di proporne una riscrittura.
- Verifica l'URL pubblico della repo dal remote e, se accessibile, confronta la versione pubblicata con quella locale. Distingui funzionalità pubblicate, presenti solo in locale e non verificate.
- Non dedurre che una funzione sia operativa da un pulsante, una roadmap o una build riuscita. Non inventare utenti, metriche, benchmark, compatibilità, sicurezza o disponibilità di release.
- Se la cartella esiste, ispezionala e conserva i materiali preesistenti; usa una sottocartella datata per questa consegna se necessario. Non usare `git rm` per file già tracciati: segnala l'eventuale conflitto e prosegui con gli altri materiali.
- Usa `apply_patch` per gli interventi manuali. Non includere segreti, dati personali, percorsi privati o contenuti di vault reali nei materiali promozionali.

## Cartella da consegnare

```text
PROMO_GITHUB_LOCAL/
  00_INDICE_E_STATO.md
  01_PAGINA_GITHUB.md
  02_PAROLE_CHIAVE_E_TOPICS.md
  03_DEMO_E_RISULTATO.md
  04_COMMUNITY_E_DISTRIBUZIONE.md
  05_CONTENUTI_E_LANCIO.md
  06_FEEDBACK_E_CONTINUITA.md
  FONTI_E_VERIFICHE.md
  assets/
```

Mantieni questi sei passaggi distinti. I testi devono essere specifici per il progetto, utilizzabili e basati su evidenze. Prepara le spiegazioni operative in italiano e i testi destinati al pubblico internazionale in inglese; mantieni i nomi ufficiali del prodotto.

## 1. Preparare bene la pagina GitHub

In `01_PAGINA_GITHUB.md` prepara:

- Una valutazione sintetica della presentazione attuale e degli ostacoli per un nuovo visitatore.
- Una bozza completa di README pubblico: proposta di valore iniziale, destinatari, caso d'uso concreto, funzionalità verificate, installazione, primo utilizzo, limiti noti, licenza e modalità di contributo, solo dove supportati dalle fonti.
- Una descrizione breve per il campo About e i collegamenti esistenti verificati.
- Indicazioni per screenshot, GIF e anteprima social coerenti con l'identità attuale.

Verifica i comandi di installazione con manifest e documentazione. Esegui prove solo se proporzionate e in un ambiente isolato; se non li esegui, dichiaralo. Se manca una licenza, segnala la decisione necessaria senza sceglierne una autonomamente. Non presentare una demo, release o documentazione inesistente come disponibile.

## 2. Aggiungere parole chiave pertinenti

In `02_PAROLE_CHIAVE_E_TOPICS.md` prepara una selezione motivata di topics, parole chiave per descrizione e README, e termini con cui il pubblico potrebbe cercare il progetto. Collega ogni proposta a una funzione o un caso d'uso verificato. Evita etichette popolari ma non pertinenti. Verifica nella documentazione GitHub corrente eventuali limiti tecnici prima di proporre la lista finale.

## 3. Mostrare un risultato concreto

In `03_DEMO_E_RISULTATO.md` prepara uno storyboard di 30–60 secondi con sequenza problema → utilizzo → risultato, didascalie, azioni visibili e asset necessari. Usa un caso d'uso riproducibile con dati sintetici.

Se puoi acquisire screenshot o una GIF reali in sicurezza, salvali in `assets/` e verifica che non mostrino dati privati. Non alterare l'interfaccia né simulare risultati per farli sembrare reali. Se l'app non è eseguibile o la funzione non è verificabile, consegna lo storyboard completo e indica esattamente quali acquisizioni mancano e perché. Valuta la fattibilità di una demo senza installazione in base all'architettura reale; non creare o pubblicare un sito per questo incarico.

## 4. Scegliere due o tre community adatte

In `04_COMMUNITY_E_DISTRIBUZIONE.md` seleziona 2–3 community o canali specifici sulla base del pubblico effettivo del progetto. Cerca e verifica online URL, pertinenza, regole di autopromozione e formato accettato; registra fonte e data. Non limitarti a nominare piattaforme generiche.

Per ogni canale indica destinatari, motivo della scelta, taglio del messaggio, collegamento alle regole e una bozza adattata pronta da revisionare. Se le regole non sono accessibili, scrivi `NON VERIFICATO` e rendi esplicito il controllo necessario prima della pubblicazione. Non pubblicare né contattare moderatori o utenti.

## 5. Pubblicare contenuti utili attorno al progetto

In `05_CONTENUTI_E_LANCIO.md` prepara:

- Un post principale di lancio con problema, risultato, prova disponibile, URL verificato della repo e invito a provarla o dare feedback.
- Un tutorial breve ma completo su un caso d'uso verificato, con prerequisiti, passaggi e risultato atteso.
- Un contenuto di approfondimento su una scelta tecnica o un problema risolto realmente dal progetto.
- Un calendario proposto per le prime due settimane, con contenuto, canale, obiettivo e prerequisiti. È un piano locale, non una programmazione di pubblicazioni.

Riusa i testi del punto 4 mediante rimandi quando appropriato. Evita promesse assolute, confronti non dimostrati e richieste ripetitive di stelle. Se un contenuto dipende da prove mancanti, evidenzia la dipendenza nel testo di lavoro.

## 6. Seguire chi lo prova

In `06_FEEDBACK_E_CONTINUITA.md` prepara un processo leggero per raccogliere feedback, rispondere alle issue, distinguere bug e richieste, individuare ostacoli all'installazione e comunicare gli aggiornamenti.

Includi modelli di risposta e proposte di issue accessibili ai nuovi contributori, basate su necessità effettivamente riscontrate. Se non hai verificato il codice necessario, indica le proposte come da validare. Non creare issue online e non modificare template pubblici.

Definisci una tabella locale per misurare visite e provenienza se disponibili, prove/download se misurabili, feedback, issue utili, contributi e stelle. Specifica fonte e modalità di raccolta; lascia vuoti i valori non rilevati. Non introdurre sistemi di tracciamento e non inventare obiettivi di crescita garantiti.

## Evidenze e verifiche finali

In `FONTI_E_VERIFICHE.md` registra i file e le sezioni usati per le affermazioni sul prodotto, gli URL esterni consultati con data, i controlli eseguiti e i loro esiti. Usa gli stati `VERIFICATO`, `NON VERIFICATO` e `PROPOSTA` in modo coerente, distinguendo locale e pubblico.

Verifica almeno:

1. Esistenza e leggibilità di tutti i file previsti, con sei passaggi realmente sviluppati.
2. Coerenza tra promesse promozionali e funzionalità provate; correttezza degli URL e assenza di segreti o dati privati.
3. Esclusione della cartella tramite `git check-ignore -v --no-index -- PROMO_GITHUB_LOCAL/00_INDICE_E_STATO.md` e di un file in `assets/`.
4. Assenza di file della cartella già tracciati tramite `git ls-files -- PROMO_GITHUB_LOCAL/`. Se presenti, segnala il residuo senza rimuoverli dall'indice autonomamente.
5. Diff di `.gitignore` limitato alla regola richiesta, senza modifiche al codice o ai materiali pubblici e senza alterazioni delle modifiche preesistenti.

In `00_INDICE_E_STATO.md` inserisci indice, ordine d'uso, checklist dei sei passaggi e dipendenze residue. Se mancano accessi o prove, completa tutto ciò che è indipendente e indica il solo elemento concreto necessario per chiudere il resto.

Consegna un resoconto breve con percorso assoluto della cartella, file creati/modificati, prova dell'esclusione da Git e limiti effettivi. Distingui preparazione locale completata da pubblicazione: questo incarico termina con i materiali locali pronti da revisionare.
