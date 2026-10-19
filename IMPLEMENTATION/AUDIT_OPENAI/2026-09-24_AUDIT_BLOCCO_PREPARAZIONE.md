# Audit indipendente — LIMEN Vault v4 Windows: preparazione della domanda

**Stato della consegna: MATRICE NATIVA M01–M16 ED E01–E02 COMPLETATA, 24/09/2026.** Risultati finali della prosecuzione nelle sezioni **11.5–11.9**: 18 casi sull'app Windows reale nelle quattro revisioni richieste, più ripetizioni M03R e M10. Il blocco è riprodotto con una condizione indotta e dump acquisiti; **l'innesco specifico delle 08:33 resta NON VERIFICATO**. Documento unico per AG e Claude. La prima consegna era parziale e aveva omesso il confronto sistematico con piano/handover: le sezioni 1–10 conservano la cronologia dell'audit precedente, con i limiti validi al momento. Le loro matrici NV sono superate dai risultati della sezione 11, non riscritte retroattivamente come prove già eseguite. Residuo operativo: rimozione delle quattro regole firewall, impedita dal token Windows non amministrativo; comando esatto in 11.9.

Data: 24 settembre 2026. Orari nel rapporto in **UTC+8**. Raccolta e prove indipendenti: 09:33–09:45; i registri grezzi conservano i timestamp originali UTC, indicati con `Z`.

## 1. Base, vincoli ed esito

Repository verificato: `E:\Projects\vault_memai_obsi`, branch `windows-build`, HEAD **1037060a5cb0194236cb3c03cc47f6c924dad977**. `git ls-remote origin refs/heads/windows-build` restituisce lo stesso SHA. Remoto: `https://github.com/cesarenegro/vault_memai_obsi`. Tutti i commit richiesti (`d34f222`, `04bd7dd`, `efa0cef`, `ef2532c`, `e0afe10`, `c21cb10`, `67da90f`) risultano antenati di quel commit remoto.

Il diff `67da90f..1037060` contiene esclusivamente l'aggiunta di `IMPLEMENTATION/WINDOWS_BUILD_EVIDENCE/fase-5d.patch` e `diff-efa0cef-ef2532c.patch`. I riferimenti di riga nel rapporto sono al codice di **1037060**, identico a **67da90f**. Le copie numerate negli allegati hanno per questo il nome `source_67da90f_*`.

Nessuna modifica al codice di prodotto, nessun checkout o commit, nessuna chiamata OpenAI dell'auditor. Nessun processo preesistente interrotto. I programmi di diagnosi sono stati compilati con `rustc` in `E:\Projects\MEMAI_V_PRO_WORKSPACE\audit_limen_20260924`, senza ricompilare o lanciare l'app Tauri e senza usare il target di prodotto come destinazione. I piccoli processi HTTP simulati sono usciti autonomamente dopo 5 o 35 secondi. La directory di dipendenze Rust del prodotto è stata usata soltanto in lettura per `regex` e `serde_json`.

**Esito principale:** sono dimostrati due difetti distinti. Il primo causa la mancata adozione di un servizio esterno e il ripiego silenzioso sulla ricerca lessicale. Il secondo può bloccare lo stato del servizio e quindi l'ingresso di `ai_preview`: su Windows `stop_child` attende indefinitamente il figlio mentre conserva il mutex. Quest'ultimo meccanismo è stato riprodotto sulle funzioni estratte da entrambe le revisioni prioritarie, con `status()` in attesa per oltre 33 secondi, `/health` positivo e nessun `SERVICE_START`. **Non è dimostrato che questo sia stato l'innesco storico delle 08:33.** La semplice presenza di un servizio estraneo non basta a dimostrare il blocco.

**La matrice completa di riproduzione nell'app Tauri non è stata eseguita.** Le prove isolate riportate sotto sono prove delle funzioni di prodotto, con dipendenze dichiarate, non prove complete della GUI o della ricerca sul Vault. Il rapporto distingue tali risultati dalle prove di Cesare riscontrate nei log e dai casi NON VERIFICATI. Non è una certificazione di risoluzione del blocco storico.

## 2. Fatti osservati e cronologia

| Data/ora UTC+8 | Provenienza | Risultato |
|---|---|---|
| 24/09 08:33 circa, e0afe10 | Segnalazione di Cesare | Due servizi, PID 39740 dell'installazione e PID 24176 della build di prova; preparazione bloccata, pannello in avvio, server in ascolto. NON riprodotto direttamente nell'app dall'auditor; mancano dump degli stack e log di quella specifica attesa. |
| 24/09 08:43:27 | `ask_timing.snapshot.log`; attribuzione a d34f222 fornita da Cesare | Risposta completata, 5.138 ms backend, 8 fonti, embed 61 ms. |
| 24/09 08:47:23 | Stesso registro; attribuzione a 04bd7dd fornita da Cesare | Completata, 4.839 ms backend, primo chunk 1.420 ms, embed 62 ms, semantica 36 ms, 8 fonti. |
| 24/09 08:47:08 e 08:51:28 | `local_model_timing.updated.log` | `SERVICE_START` porte 53636/PID 35712 e 57647/PID 42280, entrambi 2.830 ms. |
| 24/09 09:08:58.724 | Registro del servizio | `SERVICE_START`, 4.697 ms, porta 62991, PID 40488. L'origine specifica dal comando `test_start_llama` è riferita da Cesare; l'eseguibile debug e il relativo `.d` esistono, ma il sorgente di quel programma non è presente nella copia ispezionata. |
| 24/09 09:26:29.647 | `ask_timing.updated.log`; attribuzione a 67da90f fornita da Cesare | Completata, 5.565 ms UI/backend, primo chunk 2.239 ms; preview 883 ms, parole 801 ms, embed/semantica/fusione 0, 10 fonti, una citata. Il registro non contiene il commit o la porta usata dalla richiesta. |
| 24/09 09:33:24 | Osservazione diretta dell'auditor | App release PID 36736, avviata 09:25:35; unico llama-server PID 40488, percorso `target\debug\native\llama-server.exe`, avviato 09:08:54; file condivisi 40488/62991. |
| 24/09 09:35–09:37 | Cambiamento esterno durante l'audit | La prima raccolta persistente ha trovato temporaneamente assente `llama-server.pid`; la successiva ha rilevato app release PID 20772 e servizio release PID 31524. L'auditor non ha chiuso o riavviato tali processi. Cesare ha comunicato di aver chiuso il servizio debug e avviato quello dell'app. |
| 24/09 09:37:01.462 | `local_model_timing.updated.log` | `SERVICE_START` della porta 52944/PID 31524, 4.331 ms. |
| 24/09 09:37:24.019 | `ask_timing.updated.log` | Completata, **5.023 ms UI / 5.022 ms backend**, primo chunk 1.963 ms; embed 66 ms, semantica 36 ms, parole 755 ms, fusione 3 ms, ammissione 8 ms, 8 fonti. Conferma il ritorno della ricerca semantica; non certifica da sola la pertinenza di tutte le 8 fonti. |
| 24/09 09:45 | Snapshot indipendente | App PID 20772, servizio release PID 31524, file condivisi 31524/52944; HEAD ancora 1037060. |

Il percorso effettivo verificato è `E:\Projects\vault_memai_obsi`; la variante `E:\Projects\vault\_memai\_obsi` nei messaggi non esiste. Il registro effettivo è sotto `C:\Users\user\.limen-vault\`, con il separatore prima di `.limen-vault`.

## 3. Riproduzioni, metodo e limiti

### 3.1 Prove prioritarie indipendenti

Gli harness estraggono con `git show` il codice esatto della revisione indicata. `status`, `start`, `ensure_running`, `stop`, `stop_child`, `check_health`, `verify_dimensions`, scelta porta e scrittura PID/porta sono estratti senza modifiche logiche. Le sole dipendenze sostituite nel test di avvio sono: modello dichiarato installato, eseguibile HTTP simulato, directory di registrazione separata, logger su stdout e disattivazione del reaping. Il `Drop` del contenitore non è incluso; si attende esplicitamente l'uscita naturale del figlio. Pertanto non si prova il caricamento reale di bge-m3 o il reaping Windows.

Prima di ciascuna prova di avvio sono stati registrati processi reali e file PID/porta. La registrazione del servizio estraneo è stata **copiata in una directory temporanea dell'harness**, non alterata nei file reali dell'utente. Il servizio reale estraneo, porta 52944/PID 31524, rispondeva a `/health` prima e dopo le prove. La build di debug PID 40488 era già stata chiusa esternamente quando queste prove sono iniziate.

| Prova | Revisione | Condizione/azione | Esito misurato | Evidenza |
|---|---|---|---|---|
| R1 | e0afe10 | Servizio estraneo sano registrato; stato applicativo nuovo; poi `start()` con server simulato valido | Stato iniziale `port=0`, `healthy=false`; crea **un altro** servizio sulla porta 50292, sovrascrive la registrazione isolata con il proprio PID 17404; ritorna in 227 ms; servizio estraneo ancora sano | `06_start_e0afe10.txt` |
| R2 | 67da90f | Come R1 | Stato iniziale `port=0`, `healthy=false`; altro servizio porta 62725/PID 16224; 227 ms; estraneo ancora sano | `06_start_67da90f.txt` |
| R3 | e0afe10 | Estraneo registrato; nuovo server simulato `/health=200`, risposta embeddings JSON invalida; uscita autonoma dopo 35 s | Dopo 2 s server sano e mutex occupato; `status()` attende **33.045 ms**; `start()` ritorna errore dopo **35.048 ms**; nessun `SERVICE_START` | `08_start_failure_e0afe10.txt` |
| R4 | 67da90f | Come R3 | `status()` attende **33.074 ms**, `start()` errore dopo **35.077 ms**; server inizialmente sano, nessun `SERVICE_START` | `08_start_failure_67da90f.txt` |
| R5 | Codice lifecycle identico nelle quattro revisioni | `stop_child` su figlio innocuo con uscita autonoma dopo 2,4 s | Mutex ancora occupato dopo 1,2 s; ritorno dopo 2.426 ms | `04_lifecycle_test.txt` |

I tempi R1/R2 riguardano un server simulato e **non misurano l'avvio del modello reale**. R3/R4 dimostrano una catena causale eseguibile, non che il server reale delle 08:33 abbia restituito JSON invalido. L'harness non invoca `ai_preview`: dimostra il blocco di `status()` che `ai_preview` chiama sincronicamente prima della ricerca.

### 3.2 Matrice richiesta nell'app reale — stato della prima consegna, superato da 11.5

NV = **NON VERIFICATO dall'auditor nell'app Tauri**. I casi a/b e c/d sono condizioni combinabili; nessuna loro combinazione viene dichiarata PASS sulla sola base di un harness.

| Revisione | (a) Servizio avviato | (b) Servizio in avvio | (c) Seconda installazione attiva | (d) Seconda installazione chiusa |
|---|---|---|---|---|
| e0afe10 | NV; funzione di avvio R1 provata | Blocco storico riferito; meccanismo isolato R3 provato | Due servizi riferiti da Cesare; replay completo NV | NV |
| ef2532c | NV | NV | NV | NV |
| efa0cef | NV; panic streaming riferito e riprodotto a livello sanitizer | NV | NV | NV |
| 67da90f | Prova di Cesare 09:37 riscontrata nei log; R2 isolata | Meccanismo isolato R4 provato; GUI NV | Seconda installazione NV; servizio debug estraneo osservato alle 09:33 | Unica app rilevata negli snapshot; prova di Cesare 09:37 riscontrata, senza replay auditor |

Non è stata manipolata la sessione reale per forzare questi stati: il mandato vieta la chiusura dei processi preesistenti, non consente chiamate OpenAI dall'app e richiede di preservare il branch. **Rettifica del limite strumentale:** l'accesso alla GUI nativa tramite Computer Use funziona ed è stato verificato sulla V4 (sezione 10). Non è ancora verificato un canale per eseguire esclusivamente `ai_preview` nella sessione reale: il pulsante Chiedi prosegue verso OpenAI. La preview browser di `ai-ipc.ts:107–203` contiene mock e non sarebbe evidenza valida del backend. Il replay completo resta aperto; non va attribuito a un'assenza generale di strumenti GUI.

## 4. Percorso della preparazione, lock e timeout

Tutti i file Rust sotto indicati sono in `apps/desktop/src-tauri/src/`; quelli TS/TSX in `apps/desktop/src/`.

| Passo e righe | Lavoro, lock e attese | Timeout/errore |
|---|---|---|
| `AiPanel.tsx:141–182,273–288` | Controllo concorrenza con stato React, consenso IPC, poi scritta «Selezione passaggi pertinenti dal Vault…» e await preview | Nessun timeout preview; il `finally` viene raggiunto solo quando la Promise termina. La UI non interrompe una preview sospesa. |
| `ai-ipc.ts:107–203,215` | Nell'app reale `invoke('ai_preview', ...)`; nessuna rete diretta | Nessuna deadline o cancellazione aggiunta dal wrapper. |
| `main.rs:498–513` | `llama_state.status()` sul thread async, poi `preview_with_port` con `Some(port)` soltanto se sano | `status()` può attendere il mutex senza timeout. Nessuna chiamata a `find_active_bge_m3_service` o `ensure_running`. |
| `llama.rs:903–928` | Lock `LlamaServerState.0`; `try_wait` figlio; fino a due `check_health` **sotto lock** | Nessuna deadline del lock. Ogni health ha connect 400 ms, write/read 500 ms per operazione; non sono una deadline complessiva garantita. `running=true` per figlio presente non implica sano. |
| `ai.rs:1235–1258` | Seleziona fonti **prima** di prendere `pending`; poi serializza, crea ticket, lock pending, rimuove scaduti, inserisce fino a 8 preview | Lock pending senza timeout, ma non mantenuto durante ricerca o rete. Nessun lock `active` durante preview. Durata reale del lock non strumentata. |
| `ai.rs:1067–1105` | Valida opzioni, costruisce filtro ammissibilità, chiama ricerca ibrida con `use_semantic=true`, limite candidati 200 | Nessuna deadline totale. Filtro include letture `automation::is_current`; lavoro sincrono. |
| `embeddings.rs:1016–1079` | Legge provider/cache/catalogo. Con provider local e porta assente/zero, ricerca lessicale e `degraded=true` | **Ritorno senza tentare il server esterno**. Cache vuota/illeggibile causa un altro ripiego anticipato; per questo i soli tempi zero non identificano univocamente la causa. |
| `embeddings.rs:1096–1147` | Health locale, poi vettore domanda via endpoint scelto; errori fetch assorbiti e degradazione | Porta non sana: nessun vettore. Porta diversa: nessuna riscoperta automatica; errore/servizio sbagliato trattato sul solo endpoint ricevuto. |
| `embeddings.rs:481–544` | `reqwest` async POST `/v1/embeddings` per il testo della domanda | Connect 10 s; timeout richiesta **300 s locale**, 60 s remoto. Quindi un server che risponde a health ma non completa embeddings può lasciare la scritta di preparazione per oltre 30 s senza panic. Non è assenza di timeout HTTP: è timeout troppo lungo per la domanda interattiva. |
| `embeddings.rs:1222–1295` e `search.rs:744–797` | Carica cache, ricerca lessicale BM25, poi decide se proseguire semanticamente | Senza vettore/use_semantic: restituisce classifica lessicale con tempi semantici zero. Letture disco/CPU sincrone senza deadline. |
| `embeddings.rs:1298–1342` e seguito | Catalogo, score dei passaggi, filtri, fusione classifica | Nessuna deadline di scoring. Nessun mutex lifecycle mantenuto durante POST/scoring, una volta uscito da `status()`. |
| `ai.rs:1107–1135,775–797` | `has_semantic = !degraded && presenza similarità`; metodo c filtra soltanto se vero | Senza semantica, `filter_candidates_punto_e` restituisce tutti i candidati. |
| `ai.rs:1141–1227`, `search.rs:1327–1358` | Legge/verifica fonti, estrae passaggi, budget contesto, massimo 10 fonti; restituisce timings | Nessuna deadline totale. Errori di integrità interrompono la preview. Nessun processo modello avviato qui. |

Cache condivise nel processo: `SEARCH_INDEX_CACHE` (`search.rs:220–283`), `EMBEDDINGS_IN_MEMORY_CACHE` (`embeddings.rs:355–410`) e `CATALOG_CACHE` (`catalog.rs:226–285`), più mappe di revisioni/contatori. I mutex proteggono lookup/inserimenti; lettura e parsing JSON avvengono fuori dai relativi mutex principali. La verifica del filesystem `is_high_precision_fs` è però chiamata nel ramo di lookup sotto lock. Attese mutex prive di timeout; durata in millisecondi **NON VERIFICATA**. `load_catalog` clona il catalogo a `catalog.rs:289–290`.

Dimensioni rilevate dei file reali: embeddings 311.247.199 byte, indice ricerca 129.047.124 byte, catalogo 31.605.698 byte. La loro lettura/parsing a freddo può contribuire alla latenza, ma **non è stata dimostrata come causa delle 08:33**. Nessuno di questi dati prova un deadlock tra cache.

Non esiste un evento di inizio/fine della sola preview in questo percorso. `ask_timing.log` viene compilato nel percorso ask, dopo la preview: la sua assenza durante il blocco è compatibile con una preview non terminata e non localizza da sola l'attesa.

## 5. Servizio locale, registrazione e due installazioni

### 5.1 Stato privato e file condivisi

**VERIFICATO nel codice e con R1/R2:** `RunningState` nasce con `port=0` e `child=None` (`llama.rs:42–53`); `main.rs:347` registra `LlamaServerState::default()`. `status()` e `get_port()` non leggono PID/porta da disco. L'app nuova quindi **ignora il servizio già registrato** durante la preview.

`find_active_bge_m3_service` (`llama.rs:619–671`) cerca invece nell'ordine variabile `LIMEN_LOCAL_PORT`, file porta, PID/porta del processo, processi llama-server. Verifica health e dimensioni prima di ritornare la porta. Il diagnostico `bin/diagnose_fase3b2b.rs:20–32,55` lo usa e passa la porta a `select_with_port_timed`; l'app non usa questa funzione nel percorso della domanda. Un esito positivo di quel diagnostico non prova che l'app adotti lo stesso servizio.

La funzione di discovery controlla **1024 dimensioni**, non l'identità crittografica o il modello effettivamente caricato dal processo: il commento «verificando modello» è più forte del controllo implementato. La verifica invia `model=bge-m3`, ma accetta la prima lista di 1024 valori senza verificare il nome restituito. I comandi PowerShell di discovery usano `.output()` senza deadline (`llama.rs:579–590,650–667`). Questi comandi non sono sul percorso diretto `ai_preview`.

`get_models_dir` (`llama.rs:105–117`) deriva la directory da HOME, poi USERPROFILE, poi APPDATA; Windows usa `LIMEN Vault/models`. Per lo stesso ambiente utente installazione e sviluppo convergono sui file `llama-server.pid` e `.port` (`553–575`) e sul log (`1001–1004`). Non c'è namespace per build o istanza, né lock interprocesso per registrare la coppia PID/porta. La coppia viene scritta con due `fs::write` separati (`1011–1016`).

`start()` **non adotta** il servizio dei file condivisi: se il proprio stato non è già sano procede al reaping, trova il binario, prende il mutex, ferma l'eventuale proprio figlio, sceglie porta libera, avvia un nuovo figlio, sovrascrive i file (`930–1021`). R1/R2 riproducono questo comportamento con registrazione isolata. Una seconda istanza può pertanto sovrascrivere la registrazione della prima; il diagnostico può usare il servizio dell'altra, mentre l'app continua a usare la propria porta in memoria.

Il reaping Windows non è una protezione robusta per questo caso: `is_orphan_llama_server` richiede **ppid==1** (`675–677`), e `process_parent_and_command` su Windows legge soltanto il parent PID e costruisce una stringa di comando fittizia (`698–713`). Non verifica il comando reale come Unix. Nessun reaping reale eseguito dall'auditor.

Inoltre `stop_child` elimina i file globali anche quando non possiede alcun figlio (`888–894`). Una istanza può quindi rimuovere la registrazione di un'altra; ciò non equivale a terminare il servizio estraneo. `Drop` dell'ultimo stato invoca `stop()` (`1118–1123`). Le interazioni reali tra due installazioni non sono state forzate durante l'audit.

### 5.2 Perché può restare «IN AVVIO» con server in ascolto

`SemanticEngineSettings.tsx:240–259` mantiene `startingServer=true` fino alla risoluzione di `localServerStart`; il badge a `577–584` dà precedenza a tale flag. `main.rs:897–903` esegue `start` in `spawn_blocking`, ma non impone una deadline.

`start` attende health per una finestra nominale di 25 s (`1023–1059`), poi verifica dimensioni (`1062–1065`) e **solo dopo** registra `SERVICE_START` (`1067–1076`). La finestra di health non include tutte le operazioni precedenti/successive ed è superabile per operazioni bloccanti. Se trova già il proprio servizio sano, esce a `942–944` senza un nuovo `SERVICE_START`: anche questo rende l'assenza del solo evento una prova insufficiente di guasto.

`verify_dimensions` ha connect 5 s, write 5 s, read 10 s, ma `read_to_end` attende EOF e il read timeout è per operazione, non una deadline totale (`802–863`). Non interpreta correttamente il framing HTTP chunked e non verifica esplicitamente lo status HTTP prima del JSON. È quindi possibile che health sia positivo e la verifica embeddings fallisca o attenda. L'ascolto TCP non dimostra né completamento della verifica né funzionamento embeddings.

**Difetto Windows riprodotto:** se verifica dimensioni o health falliscono, `start` chiama `self.stop()` (`1056–1064`). `stop` prende il mutex (`1109–1114`); `stop_child` tenta `try_wait` per circa un secondo, ma entrambe le `kill` sono `#[cfg(unix)]`; poi chiama **`c.wait()` senza timeout** (`866–887`). Su Windows un figlio vivo non viene terminato e il mutex rimane occupato fino alla sua uscita naturale. `status()` e quindi `ai_preview` si fermano sullo stesso mutex. R3/R4 riproducono precisamente questa catena con un errore embeddings simulato.

La stessa attesa può comparire nel riavvio di un figlio già posseduto ma momentaneamente non sano: `start:956–957` chiama `stop_child` sotto lock. `ensure_running:1081–1106` prova fino a tre avvii, ma il numero di tentativi non limita la durata di un singolo `start`; non scopre o adotta un servizio esterno. In `main.rs:939` viene chiamato sincronicamente dal comando async di sincronizzazione, mentre `ai_preview` non lo chiama.

**Attribuzione storica:** la coesistenza di due server può introdurre contesa o esposizione alle condizioni di errore, ma non prova quale operazione abbia fallito. Il blocco R3/R4 è possibile anche senza un server estraneo. Non sono disponibili dump del mutex, risposta di `verify_dimensions` o stack del PID 24176 relativi alle 08:33: causa di quella singola occorrenza **NON VERIFICATA**.

## 6. Panic UTF-8 e rilascio della richiesta

Le classi e `sanitize_answer_prose` sono state estratte da ciascuna revisione e compilate separatamente. Tre testi con italiano, accenti, emoji e markup sono stati frammentati a tutte le dimensioni da 1 a 80 byte; ulteriori due JSON sono stati provati con le stesse 80 dimensioni. Nessuna rete o risposta OpenAI usata.

| Revisione | Decoder + sanitizer: 240 casi | Parser emoji letterali: 80 casi | Parser emoji con surrogate JSON: 80 casi |
|---|---|---|---|
| efa0cef | 170 panic catturati | 0 panic, testo corretto | 0 panic, 80 output incompleti |
| ef2532c | 0 panic | 0 panic, testo corretto | 0 panic, 80 output incompleti |
| e0afe10 | 0 panic | 0 panic, testo corretto | 0 panic, 80 output incompleti |
| 67da90f | 0 panic | 0 panic, testo corretto | 0 panic, 80 output incompleti |

Evidenze: `05_stream_*.txt`, sorgenti generati `stream_*.rs`, script di estrazione. In 67da90f, `ambiguous_suffix_len` arretra a confini UTF-8 validi (`ai.rs:1811–1844`); `feed` usa confini validi e prefissi di caratteri (`1865–1891`); `flush` usa un prefisso espresso in byte dei caratteri comuni (`1902–1920`). Decoder a `2053–2093`: lunghezza valida derivata da `from_utf8`, residui trattenuti; i testi validi testati vengono ricostruiti senza perdita dal decoder.

**VERIFICATO:** il panic da slicing è riprodotto nella versione vecchia e non si manifesta nel corpus provato nelle versioni corrette; i confini problematici sono protetti nel codice. **Non si dichiara una prova universale su tutti gli input o su tutto `ask_stream`.**

Difetto ulteriore circoscritto: `JsonStreamAnswerParser` converte ciascun `\uXXXX` separatamente con `char::from_u32` (`1987–1998`); le surrogate `\ud83d\ude00` non sono scalari Unicode singoli e vengono scartate. Il JSON con `È già città 😀` produce `È già città ` se l'emoji è escaped. È perdita di contenuto, non panic e non causa della preview bloccata.

**Garanzia di rilascio assente in 67da90f:** `main.rs:543` chiama `begin`, `550` attende `ask_stream` e `553` chiama `finish` soltanto sul ritorno normale. Un unwind salta quella riga. `ActiveGuard` presente in ef2532c/e0afe10 è stato rimosso dal ripristino. `AiState::begin` rifiuta qualunque richiesta se `active` è non vuoto (`ai.rs:1271–1294`); `cancel` marca il flag, non elimina la voce attiva (`1261–1269`); `finish` la elimina (`1296–1300`). Non c'è una scadenza automatica delle richieste attive: i 300 secondi si riferiscono alle preview pendenti.

La prova isolata `09_active_test.txt` usa gli esatti metodi begin/cancel/finish, con Pending ridotto ai campi letti e logger senza I/O. Panic iniettato dopo begin: `active_after_panic=1`; dopo cancel resta 1; richiesta successiva rifiutata; `finish` esplicito ripristina il funzionamento. Non è stato provocato un panic nell'app reale. La conseguenza sul flusso main è verificabile direttamente nel codice; la UI/eventistica Tauri del panic non è stata collaudata.

## 7. Problemi, correzioni minime proposte e test di accettazione

Nessuna correzione qui descritta è stata applicata.

| Problema | Stato/evidenza | Correzione minima proposta | Test che la dimostri |
|---|---|---|---|
| P1 — Attesa senza limite di `stop_child` su Windows sotto mutex | VERIFICATO nel codice e R3/R4; attribuzione alle 08:33 NON VERIFICATA | Separare dal mutex la gestione del `Child`, terminare esplicitamente soltanto il figlio posseduto su Windows, attesa con limite reale, poi aggiornare lo stato. Non considerare risolutivo un semplice timeout attorno a `spawn_blocking`, che non interrompe l'attesa interna. | Server controllato sano su health ma embeddings invalido/non rispondente; start deve fallire entro limite dichiarato, status/preview devono restare disponibili; nessun processo estraneo terminato. |
| P2 — Servizio esterno ignorato; ripiego lessicale silenzioso | VERIFICATO codice, R1/R2 e log delle 09:26/09:37; porta privata dell'app alle 09:26 non direttamente loggata | Risolvere una porta esterna validata quando lo stato locale è vuoto, distinguendo possesso da adozione; rendere espliciti provider, porta e motivo della degradazione nella preview/UI. Non avviare ciecamente un altro modello. | Registrare servizio A, creare stato B: preview deve usare A o dichiarare chiaramente il fallback scelto; verificare richiesta embeddings ricevuta, semantica eseguita e metodo c applicato. Non affidarsi solo a tempi >0, soggetti ad arrotondamento. |
| P3 — Registrazione condivisa senza ownership | VERIFICATO nel codice; sovrascrittura dimostrata in directory isolata | Registrazione per istanza/ownership o adozione esplicita; scrittura coerente PID/porta; rimuovere solo la propria registrazione; controllo reale processo/genitore su Windows. | Due istanze isolate: avvio/arresto dell'una non corrompe i riferimenti dell'altra; PID riusato e parent terminato non provocano azioni su processi diversi. |
| P4 — Timeout query locale di 300 s e telemetria preview insufficiente | VERIFICATO staticamente; attesa HTTP reale di 300 s non provocata | Separare timeout della singola domanda da quello dei batch di indicizzazione; deadline/cancellazione end-to-end e log di inizio, fase, porta, esito della preview. Spostare I/O bloccante fuori dai worker async. | Health OK, endpoint embeddings lento; query termina con errore/fallback esplicito entro soglia concordata, UI si sblocca, log indica fase e causa. |
| P5 — ActiveGuard rimosso | VERIFICATO staticamente e con panic iniettato sui metodi di stato | Ripristinare guard RAII subito dopo begin e gestione del panic/errore Tauri senza rimuovere la correzione UTF-8 | Panic iniettato dentro task di streaming, cancellazione e errore keychain: active torna vuoto, errore/evento finale presente, richiesta seguente ammessa. |
| P6 — Emoji escaped perse | VERIFICATO su tutte le revisioni provate | Accumulare high/low surrogate correttamente o usare decoder JSON incrementale conforme | `\ud83d\ude00` e testo letterale equivalenti per split 1–80; input troncato/malformato gestito esplicitamente; nessun panic. |

Il ripristino di `main.rs`/`AiPanel.tsx` non dimostra che ef2532c causasse il blocco: `ai_preview` è invariato; `llama.rs`, `embeddings.rs`, `search.rs`, `catalog.rs`, `ai-ipc.ts` e `SemanticEngineSettings.tsx` hanno gli stessi blob nelle quattro revisioni. ef2532c ed e0afe10 hanno inoltre gli stessi blob dei file di prodotto qui esaminati. L'asserzione «blocco risolto dal rollback» non è sostenuta dalle prove disponibili.

## 8. NON VERIFICATO e consegna delle evidenze

- Riproduzione completa delle combinazioni richieste nelle quattro GUI Tauri e relativi tempi end-to-end.
- Stack/lock effettivo del blocco storico e risposta HTTP che potrebbe aver fatto fallire `verify_dimensions` alle 08:33.
- Stato in memoria della porta dell'app delle 09:26; il meccanismo di porta zero è dimostrato, ma manca il relativo evento per quella richiesta. Una cache vuota/illeggibile può anch'essa anticipare il fallback.
- Corrispondenza crittografica dei binari eseguiti da Cesare con il commit dichiarato: i log esaminati non registrano lo SHA di build. Le attribuzioni storiche di commit sono di Cesare.
- Pertinenza semantica di ogni fonte e comportamento della seconda installazione storica su quel corpus: numero di fonti e citazioni non equivalgono a correttezza della selezione.
- Durata dei lock di cache e contributo di parsing/CPU durante l'episodio storico; nessun profiler o dump retroattivo disponibile.
- Esecuzione del sorgente originale di `test_start_llama`, assente dalla copia ispezionata, e ownership del PID 40488 al momento dell'avvio. Osservati binario/debug e timestamp compatibili, non la sua esecuzione originale.
- Robustezza completa del framing HTTP in `verify_dimensions`, tutti gli input del parser e tutti i percorsi di errore di `ask_stream`.

Evidenze in `evidenze/`: preflight, processi/config, snapshot log, copie numerate dei sorgenti, hash blob e diff tra revisioni, output compilatori, harness e risultati R1–R5/stream/panic, stato finale. Gli script di raccolta/estrazione e gli input Rust sono allegati per ripetibilità. I mock sono confinati alla directory della diagnosi; **non** modificano i file condivisi o il modello dell'utente.

Il branch e il codice tracciato sono rimasti invariati durante le prove. Le patch/screenshot non tracciati preesistenti sono stati preservati; durante l'audit è comparso anche `faseH1-piano.md` per attività esterna, non creato dall'auditor. La consegna aggiunge soltanto questo rapporto e la cartella di evidenze richiesta.

## 9. Integrazione documentale e consegna verificabile ad AG e Claude

### 9.1 Documenti di riferimento, fissati a 1037060

L'incarico originale è allegato integralmente in [incarico_originale.txt](evidenze/incarico_originale.txt). Le successive integrazioni di Cesare sono riportate nella cronologia del rapporto. Le dichiarazioni dei documenti di implementazione sono oggetto di verifica, non sostituiscono una prova indipendente.

| Documento | Righe pertinenti e ruolo nell'audit | Copia numerata alla base |
|---|---|---|
| `SESSION_HANDOVER_WINDOWS_BUILD.md` | 282–306: protezione panic e concorrenza; 309–349: rollback 5d, attribuzione della causa, diagnostica e dichiarazione di chiusura | [Handover](evidenze/doc_1037060_SESSION_HANDOVER_WINDOWS_BUILD.md.txt) |
| `IMPLEMENTATION/WINDOWS_BUILD_EVIDENCE/fase5-piano.md` | 23–25: TTFT; 31–38: misure e preservazione fonti; 53–67: sanitizer/interruzioni; 119–123: parser; 139–154: test e consegna; 158–160: vincoli operativi | [Piano FASE 5](evidenze/doc_1037060_fase5-piano.md.txt) |
| `IMPLEMENTATION/WINDOWS_BUILD_EVIDENCE/fase2-modello-locale.md` | 56–69: avvio e feedback UI; 73–92: eventi temporali e isolamento test | [Modello locale](evidenze/doc_1037060_fase2-modello-locale.md.txt) |
| `IMPLEMENTATION/WINDOWS_BUILD_EVIDENCE/fase3a-misure.md` | 30–39: metodo c e fallback esplicitamente deliberato | [Metodo c](evidenze/doc_1037060_fase3a-misure.md.txt) |
| `HELP/04_WORKFLOW.md` | 325–359: avvio e ricerca ibrida; W18 si riferisce esplicitamente alla **Schermata Ricerca** | [Workflow](evidenze/doc_1037060_04_WORKFLOW.md.txt) |
| `HELP/05_PROBLEMI_E_GLOSSARIO.md` | 21–23,40–41,71: avviso degrado e gestione servizio; testo con riferimenti macOS da non assumere come collaudo Windows | [Troubleshooting](evidenze/doc_1037060_05_PROBLEMI_E_GLOSSARIO.md.txt) |
| `cargo-test-fase-5-parallel.log` e `cargo-test-fase-5-single.log` | Log del coder: 158 test lib + 18 main, inclusa la prova denominata `test_active_guard_releases_ticket_on_panic` | [Parallelo](evidenze/doc_1037060_cargo-test-fase-5-parallel.log.txt), [sequenziale](evidenze/doc_1037060_cargo-test-fase-5-single.log.txt) |
| `fase-5d.patch` e `diff-efa0cef-ef2532c.patch` | Evidenze del rollback e delle modifiche precedenti, conservate nella stessa base | [Patch 5d](evidenze/doc_1037060_fase-5d.patch.txt), [diff precedente](evidenze/doc_1037060_diff-efa0cef-ef2532c.patch.txt) |

### 9.2 Matrice documentazione → implementazione → evidenza → giudizio

| ID | Requisito o dichiarazione documentata | Riscontro indipendente | Giudizio e conseguenza |
|---|---|---|---|
| D1 | Handover 320–325: ef2532c «causava il blocco»; rollback risolutivo | `ai_preview` invariato; lifecycle e ricerca identici; R3/R4 riproducono il meccanismo anche dopo rollback | **Attribuzione NON DIMOSTRATA.** La rettifica da proporre all'autore è «ripristino eseguito; causa del blocco ancora da individuare». Non ho modificato l'handover del coder. |
| D2 | Handover 291–295: rilascio garantito da ActiveGuard; test dedicato verde | Guardia rimossa dal main; prova indipendente 09_active_test lascia active=1; il test del coder usa un'altra guardia definita soltanto nel test | **Garanzia assente nel comando reale.** Il test verde non copre la regressione. Dettaglio nella sezione 9.3. |
| D3 | Handover 328–333: diagnostico collegato alla porta «del servizio dell'app», 62991 | Alle 09:33 tale porta è del PID 40488/debug. Il diagnostico usa discovery globale, l'app status privato | **Equivalenza diagnostico/app non dimostrata.** Il successo del diagnostico non certifica il passaggio della porta attraverso IPC nella build release. |
| D4 | `fase3a-misure.md:37–39`: senza semantica il metodo c non si applica | `ai.rs:775–782,1111–1130` implementa esattamente questa regola | **Comportamento conforme al fallback documentato.** La disattivazione del metodo c non è, da sola, una regressione della formula. Il problema è perché si entra nel fallback con servizio disponibile e come lo si comunica. Non propongo di modificare soglie o ranking senza nuova autorizzazione. |
| D5 | HELP W18/glossario: degrado lessicale accompagnato da banner | W18 riguarda `search_vault_hybrid`; `ai_preview` restituisce una Preview priva di provider/porta/degraded (`ai.rs:40`, `ai-ipc.ts:4`) | **Copertura UX diversa tra Ricerca e Chiedi.** Il banner documentato non va dato per presente nella domanda. Estenderlo a Chiedi è una proposta correttiva esplicita, non una funzione già verificata. |
| D6 | `fase2-modello-locale.md:66–81`: riscontro di avvio e `SERVICE_START` | Il flag UI resta attivo fino al ritorno IPC; l'evento è successivo alla verifica dimensioni | **Distinguere riscontro visivo da completamento.** «IN AVVIO» e socket in ascolto non certificano il completamento dell'avvio; manca telemetria sulle fasi precedenti all'evento. |
| D7 | Piano FASE 5, 119–123: decoder degli escape JSON, test dedicati | Le surrogate di emoji vengono scartate in 80/80 frammentazioni del caso escaped, pur senza panic | **Copertura incompleta del parser.** Separare correttezza Unicode da sola assenza di panic. |
| D8 | Piano FASE 5, 31–38: misurare prima di ottimizzare e conservare le fonti | Non sono state applicate ottimizzazioni; confronto 09:26/09:37 coinvolge modalità di ricerca diverse | **Le due latenze non sono un benchmark a parità di risultati.** Ripristino semantica e qualità vanno verificati separatamente dalle prestazioni. |
| D9 | Handover 339–347: fase completata, 176 test verdi e pronta al collaudo | I due log attestano effettivamente 158+18 test passati; nessuna prova dei log documenta la matrice multi-istanza o il comando reale dopo panic | **Test del coder riscontrati, accettazione completa NON dimostrata.** Non ho rieseguito quella suite né trasformato i suoi risultati in un mio PASS. |

### 9.3 Nuovo rilievo: il test della guardia non prova la guardia di prodotto

In `apps/desktop/src-tauri/src/ai.rs:4622–4679`, `test_active_guard_releases_ticket_on_panic` chiama begin e poi definisce al proprio interno `struct TestGuard` (4662), `impl Drop` (4666–4670) e `_guard` (4671–4674). Dopo il panic controlla che active sia vuoto. È quindi una prova del comportamento di **quella TestGuard**, non della presenza di ActiveGuard nel comando `main.rs::ai_ask_stream`.

Il rollback può rimuovere la guardia di prodotto senza far fallire questo test; i log allegati mostrano proprio il test verde mentre `main.rs:536–554` non contiene più una guardia. Questo spiega perché «176 test passati» non smentisce la regressione di rilascio trovata dall'auditor. **VERIFICATO mediante lettura del test, confronto del main e log fissati al commit.** Non si attribuisce ai log una falsificazione: è un difetto di copertura.

Correzione proposta, non applicata: esercitare la gestione reale del ticket mediante una funzione condivisa dal comando, con worker iniettabile; iniettare panic/errore/cancellazione nel worker e verificare che una seconda richiesta sia ammessa. Non definire nel test una guardia alternativa assente dal percorso produttivo.

### 9.4 Copertura dell'incarico e passaggio ad AG / Claude

| Compito dell'incarico | Copertura consegnata | Stato |
|---|---|---|
| 1. Matrice di riproduzione sulle quattro revisioni | Log di Cesare, snapshot e prove isolate; matrice GUI non eseguita | **PARZIALE / APERTO** |
| 2. Percorso completo preparazione | File/righe, lock, rete e timeout in sezione 4 | **TRACCIATO STATICAMENTE**; durate reali dei lock e replay IPC aperti |
| 3. Stato servizio e relazione con blocco | Sezione 5 e riproduzione R3/R4 | **MECCANISMO RIPRODOTTO**; innesco storico aperto |
| 4. Due installazioni/file condivisi | Codice e prove di registrazione isolate | **VERIFICATO A LIVELLO COMPONENTE**; due app native reali non collaudate |
| 5. Panic e rilascio | Corpus UTF-8, surrogate, begin/finish e test del coder | **RISULTATI DOCUMENTATI**; test completo nel comando Tauri ancora necessario |
| 6. Cause, correzioni e prove | Sezioni 7–9; nessuna modifica applicata | **PROPOSTE DISPONIBILI**, nessuna autorizzazione implicita a implementare |

**Per AG:** leggere prima questa matrice e D1–D9; non considerare il rollback una dimostrazione della causa. Le correzioni P1–P6 sono proposte da sottoporre al perimetro autorizzato da Cesare. La prova del rilascio deve raggiungere il comando effettivo; quella del servizio deve passare da status/porta fino alla preview, registrando build, PID, porta, modalità e motivo del fallback. Non alterare il metodo c, le soglie o la selezione approvata per compensare un problema di lifecycle.

**Per Claude:** verificare separatamente i fatti statici, gli harness con le dipendenze simulate dichiarate e i log applicativi. Contestare le dichiarazioni di chiusura non coperte; controllare la nuova lacuna di TestGuard e conservare aperta l'attribuzione delle 08:33. Gli harness non sostituiscono il collaudo completo richiesto al punto 1. L'ordine di lettura è: incarico → sezione 9 → handover/piano allegati → sezioni 3–7 → output grezzi citati.

**Criterio di chiusura:** la documentazione ora accompagna le conclusioni, ma non sostituisce le prove mancanti. L'audit resta aperto fino alla verifica applicativa delle condizioni prioritarie e alla distinzione dimostrata tra causa dell'episodio storico e difetti soltanto riproducibili in isolamento.

## 10. Osservazione della V4 reale e variazione dell'ambiente

### 10.1 Identità della finestra e rettifica sull'accesso GUI

Il 24/09/2026, circa 10:18 UTC+8, Computer Use ha acquisito la finestra nativa `LIMEN Vault v4` del processo `E:\Projects\vault_memai_obsi\apps\desktop\src-tauri\target\release\limen-vault.exe`. L'albero accessibile e lo screenshot sono conservati in [11_v4_native_ui.txt](evidenze/11_v4_native_ui.txt) e [11_v4_native_ui.png](evidenze/11_v4_native_ui.png). La schermata osservata è «Chiedi al Vault», con Vault `VAULT WIN TEST DEV`, domanda BNXT già presente e otto fonti della risposta preesistente. **Non è una nuova esecuzione della domanda da parte dell'auditor.**

La finestra nativa e i metadati dell'eseguibile dichiarano **LIMEN Vault v4, versione 0.4.0**. La voce interna «LIMEN Vault v3» proviene dal titolo HTML rimasto in `apps/desktop/index.html:6`, verificato a `1037060`. Quel titolo non dimostra che sia stata aperta una V3; il percorso del processo, il titolo della finestra e i metadati indicano V4. Il sorgente non è stato modificato per correggere l'etichetta. La corrispondenza binario/commit resta soggetta al limite già dichiarato nella sezione 8.

La precedente affermazione generale di indisponibilità dell'interfaccia nativa era errata. È disponibile il controllo della finestra. Resta **NON VERIFICATA** la possibilità di invocare solo `ai_preview` nella sessione reale attraverso strumenti di sviluppo: nessuna console è stata aperta e nessuna chiamata IPC è stata eseguita in questa integrazione. Il normale pulsante «Chiedi» non è stato premuto perché `AiPanel.tsx::executeAsk` prosegue automaticamente alla generazione OpenAI, vietata dall'incarico.

### 10.2 Cambiamento esterno verificato prima del replay

Alla ripresa del controllo, la finestra non era più presente. Il censimento Windows delle **10:24:55 UTC+8** restituisce zero processi `limen-vault.exe` e `llama-server.exe`; i file condivisi PID/porta sono assenti. HEAD è passato a **02747c3820d8494dbe3a20180c65f66b855e089c**, commit `fix(P1): stop_child terminazione esplicita su Windows senza blocco del mutex dello stato e attesa limitata`. Rispetto alla base cambia `llama.rs` oltre all'handover, con 200 inserimenti e 36 rimozioni complessive. Evidenza: [12_environment_changed.txt](evidenze/12_environment_changed.txt).

L'auditor non ha effettuato quel commit e non ha chiuso i processi. La base del presente audit rimane **1037060**; il nuovo commit non viene né validato né usato come sostituto delle revisioni richieste. Il normale comando di avvio dalla copia corrente ricompilerebbe il codice modificato: i risultati non potrebbero essere attribuiti al vecchio lifecycle. È stato richiesto a Cesare il coordinamento con AG per rendere nuovamente disponibile la build precedente, lasciandola aperta. Non è stato eseguito alcun reset/checkout del lavoro concorrente.

### 10.3 Matrice applicativa esplicita — piano iniziale, esiti finali in 11.5

Questa tabella espande le combinazioni richieste; **NV = NON VERIFICATO nell'app nativa dall'auditor**, non un esito negativo della prova. «In avvio» deve essere osservato e correlato al backend; non basta riprodurre un'etichetta UI. I risultati degli harness e i log storici restano separati nelle sezioni 2–3.

| ID | Revisione | Servizio della build provata | Seconda installazione con servizio | Esito nativo | Tempo preview |
|---|---|---|---|---|---|
| M01 | e0afe10 | Avviato | Assente | NV | Non misurato |
| M02 | e0afe10 | Avviato | Presente | NV | Non misurato |
| M03 | e0afe10 | In avvio | Assente | NV | Non misurato |
| M04 | e0afe10 | In avvio | Presente | NV; episodio storico riferito da Cesare | Non misurato dall'auditor |
| M05 | ef2532c | Avviato | Assente | NV | Non misurato |
| M06 | ef2532c | Avviato | Presente | NV | Non misurato |
| M07 | ef2532c | In avvio | Assente | NV | Non misurato |
| M08 | ef2532c | In avvio | Presente | NV | Non misurato |
| M09 | efa0cef | Avviato | Assente | NV | Non misurato |
| M10 | efa0cef | Avviato | Presente | NV | Non misurato |
| M11 | efa0cef | In avvio | Assente | NV | Non misurato |
| M12 | efa0cef | In avvio | Presente | NV | Non misurato |
| M13 | 67da90f | Avviato | Assente | NV; log di Cesare 09:37 disponibili | Nessun nuovo replay |
| M14 | 67da90f | Avviato | Presente | NV | Non misurato |
| M15 | 67da90f | In avvio | Assente | NV | Non misurato |
| M16 | 67da90f | In avvio | Presente | NV | Non misurato |

Priorità aggiuntiva dell'integrazione di Cesare: **E01/e0afe10 ed E02/67da90f**, app appena avviata con servizio estraneo già sano e registrato nei file condivisi, prima di avviare il servizio dall'app. Entrambi **NV nel backend dell'app reale**; il comportamento delle funzioni estratte è invece documentato nelle prove isolate. Per ogni caso vanno registrati prima e dopo: SHA sorgente e hash binario, PID/percorso/ora di avvio di app e servizi, contenuto PID/porta, stato locale, durata preview, fonti restituite, errori, modifiche ai registri. Senza una sola preview eseguita via IPC reale non si assegna PASS a nessuna riga.

## 11. Prosecuzione autorizzata: matrice reale delle revisioni storiche

**Stato finale:** prove native eseguite nella finestra autorizzata dalle 12:15; ultimo caso e cleanup dei processi completati alle 13:31 UTC+8. La matrice finale è in 11.5. Le sottosezioni 11.1–11.3 riportano il preflight delle 11:32, quando le prove non erano ancora iniziate; 11.4 conserva i primi risultati progressivi. Il nuovo incarico autorizza la chiusura dei soli processi creati dall'auditor e prescrive isolamento, copia dei file condivisi, blocco OpenAI e finestra concordata.

### 11.1 Isolamento predisposto

Create con `git -C E:\Projects\vault_memai_obsi worktree add --detach <percorso> <revisione>` le quattro worktree seguenti. Nessun checkout/reset o commit nella copia operativa di AG. Ciascuna userà il proprio `apps\desktop\src-tauri\target`; compilazioni non ancora avviate, quindi impronte degli eseguibili storici ancora non disponibili. Evidenza: [13_worktree_preflight.json](evidenze/13_worktree_preflight.json).

| Worktree | SHA verificato |
|---|---|
| `E:\Projects\vault_memai_obsi_audit_e0afe10` | `e0afe105507b592b6eb34c5c0eac24b77ba14264` |
| `E:\Projects\vault_memai_obsi_audit_ef2532c` | `ef2532ca700c712b4c68d25fd26324702dce0782` |
| `E:\Projects\vault_memai_obsi_audit_efa0cef` | `efa0cefab5da83e8de3b3418a92285438c63fb36` |
| `E:\Projects\vault_memai_obsi_audit_67da90f` | `67da90f5aeb4af6817f20b8e7f64a1de1daa3662` |

Tutte e quattro risultano pulite. I commit successivi a 1037060 non sono valutati in questa prosecuzione.

### 11.2 Preflight delle 11:32: protezione OpenAI predisposta, non ancora attiva

Metodo scelto: quattro regole Windows Defender Firewall in uscita, azione Block, tutti i profili/protocolli/destinazioni, ciascuna vincolata al percorso completo dell'eseguibile `limen-vault.exe` della relativa worktree. Il terminale dell'auditor non è amministrativo (`ElevatedAdmin=false`), anche fuori sandbox; non è stato tentato alcun avvio della prova senza protezione. Sono pronti gli script [install_audit_firewall.ps1](evidenze/install_audit_firewall.ps1) e [remove_audit_firewall.ps1](evidenze/remove_audit_firewall.ps1). La sintassi è stata controllata; **installazione ed efficacia runtime NON VERIFICATE**.

Comando da eseguire da Cesare in PowerShell amministratore prima delle prove:

```powershell
& 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\install_audit_firewall.ps1'
```

L'istruzione di creazione contenuta nello script, eseguita per ciascuna revisione con nome e percorso espliciti costruiti dalla lista chiusa, è:

```powershell
New-NetFirewallRule -Name $auditName -DisplayName $auditName -Group 'LIMEN historical audit 20260924' -Program $auditProgram -Direction Outbound -Action Block -Enabled True -Profile Any -Protocol Any -RemoteAddress Any -PolicyStore PersistentStore
```

Lo script controlla le regole in ActiveStore, programma, destinazioni e porte e salva `13_firewall_installed.json`. Prima di una prova bisogna verificare che la protezione effettiva sia attiva e che consenta ancora la comunicazione locale necessaria al test: se impedisse anche quella, non si interpreterebbe il degrado indotto dal firewall come difetto storico dell'app. Nessuna richiesta di prova a OpenAI è necessaria per questa verifica. Lo script non avvia programmi o servizi.

Rimozione finale, da eseguire dopo le prove in PowerShell amministratore:

```powershell
& 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\remove_audit_firewall.ps1'
```

La rimozione è limitata ai quattro nomi di regola previsti, verifica i percorsi e rifiuta di rimuovere la protezione di una worktree il cui eseguibile sia ancora attivo. L'auditor dovrà verificarne l'esito; in questa fase nessuna regola è stata ancora creata né rimossa.

### 11.3 Coordinamento prima della sessione

Richiesta a Cesare una finestra di **due ore dalla sua conferma**, senza avvii concorrenti da Cesare o AG; se insufficiente sarà necessaria una nuova finestra concordata. Al preflight è attivo un processo preesistente della copia operativa, PID **30548**, avviato alle **11:24:35 UTC+8**: non è stato chiuso dall'auditor e deve essere gestito dal proprietario prima della sessione isolata.

Le copie dei file condivisi prima/dopo e le prove con servizio vero/condizione indotta devono avvenire nella finestra concordata, non durante questa preparazione mentre l'app operativa è ancora in uso. Nessun file condiviso o modello è stato modificato in questa fase. Nessun processo applicativo o servizio è stato avviato dall'auditor. La prossima attività dipende dall'installazione amministrativa delle regole e dalla conferma della finestra; in conformità all'incarico non si procede alle prove senza garanzia del blocco delle chiamate esterne.

### 11.4 Sessione nativa iniziata alle 12:15 UTC+8 — risultati progressivi

Cesare ha confermato la pausa di AG e autorizzato la prosecuzione autonoma. Verificate in ActiveStore le quattro regole firewall abilitate, Block/Outbound/Any, con i percorsi esatti delle worktree; tutti i profili firewall risultano attivi. Nel preflight non risultavano app, llama-server o cargo preesistenti, né listener sulla porta Vite 1420. La cartella [session_1215](evidenze/session_1215/) contiene copie preliminari dei file condivisi e del modello GGUF, log build, snapshot per caso, screenshot/alberi UI e dump. I proxy HTTP/HTTPS/ALL_PROXY sono stati rimossi dall'ambiente dei processi di audit, con NO_PROXY=*.

Il frontend e il backend sono quelli delle revisioni richieste: `npx pnpm --filter @limen-vault/desktop tauri dev --release` dalla relativa worktree, CARGO_TARGET_DIR fissato alla sua cartella target. Dipendenze pnpm installate offline e dipendenze workspace compilate; cache Rust copiata separatamente, con ricompilazione di limen-vault dalla worktree documentata nel log. I binari nativi Windows non tracciati dal repository sono stati copiati nelle risorse di ciascuna worktree dalla copia operativa; la loro provenienza non certifica retroattivamente gli hash dei binari delle 08:33. Nessun sorgente di prodotto è stato modificato.

| Caso | Condizione effettiva | Risultato progressivo | Misure |
|---|---|---|---|
| E01 / e0afe10 | App PID 35380 appena avviata; servizio estraneo reale PID 41760/porta 62361 già sano, 1024 dimensioni e registrato | Preparazione completata; pannello SPENTO; 10 fonti, sola ricerca lessicale | Preview 1251 ms; UI 1385 ms; embed/semantica 0 |
| M02 / e0afe10 | Servizio reale avviato dall'app PID 28060/porta 57500; servizio estraneo 41760 ancora presente | Pannello ATTIVO; preparazione completata, 8 fonti | Preview 1553 ms; UI 1624 ms; embed 61 ms |
| M01 / e0afe10 | Stesso servizio dell'app; servizio estraneo 41760 chiuso dall'auditor | Preparazione completata, 8 fonti | Preview 1554 ms; UI 1648 ms; embed 57 ms |
| M03 / e0afe10 | Condizione indotta, servizio diagnostico PID 43216/porta 57446; nessun secondo servizio | IN AVVIO e preparazione bloccata almeno 72657 ms; dump acquisito prima del rilascio | Dopo chiusura del solo figlio, UI 128560 ms contro backend 2292 ms e preview interna 1179 ms; 10 fonti dopo sblocco |
| M04 / e0afe10 | Condizione indotta PID 39204/porta 54511; servizio estraneo reale 13260/porta 51103 presente | /health sano, vettore a 3 dimensioni, IN AVVIO e preparazione bloccata almeno 87600 ms; dump acquisito | Dopo chiusura del solo figlio, UI 96642 ms contro backend 1633 ms e preview interna 1534 ms; 10 fonti dopo sblocco |

Le righe sopra sono prove native effettive, non gli harness delle sezioni precedenti. In ogni caso arrivato all'invio, il firewall ha prodotto l'errore di rete atteso: la dicitura automatica del registro «Fonti inviate a OpenAI» non dimostra una trasmissione riuscita; status=errore (rete), nessuna risposta e token null. Il successo della semantica in M01/M02 verifica che il blocco non impedisce le necessarie connessioni loopback.

Il fixture indotto è un eseguibile diagnostico autonomo collocato in `target/release/llama-server.exe`, posizione già cercata da `detect_llama_server_binary` prima di `native/llama-server.exe`. L'app di prodotto non è modificata. Risponde health=200 e JSON embeddings di 3 dimensioni, anziché 1024; resta vivo fino a chiusura esplicita o 1800 secondi. In M03 la prima versione ha risposto alle due richieste dell'app, registrate nel log, ma alcune sonde esterne successive hanno fallito perché il socket accettato rimaneva non bloccante. Il fixture è stato corretto impostando il socket accettato in modalità bloccante, senza cambiare prodotto. M04 include la verifica esterna riuscita sia di health sia delle dimensioni, in `M04_backend.json`. Il binario della prima versione è conservato come `M03_fixture.exe`; sorgente aggiornato e script dump/cattura sono allegati. Non confondere questo errore del fixture con un difetto di llama-server reale.

I dump `M03_process.dmp` e `M04_process.dmp` sono stati acquisiti con MiniDumpWriteDump (full memory + thread info), insieme agli stati dei thread. Non sono ancora presentati come analisi simbolica degli stack. La terminazione del solo figlio diagnostico ha liberato la preparazione in entrambe le prove: riscontro causale coerente con `stop_child` che conserva il mutex durante `Child::wait`. **L'attesa sullo stato avviene prima del cronometro della preview interna**, spiegando la forte divergenza tra tempo UI e backend. Il difetto è riprodotto nell'app reale; **l'innesco storico specifico delle 08:33 resta NON VERIFICATO**.

Completate le prove su questa prima revisione, chiusi solo processi dell'auditor: servizi 41760, 28060, 43216, 39204; app 35380; processi dev 20152/5360. Il servizio estraneo 13260 era mantenuto per E02. Questo era lo stato progressivo; gli esiti conclusivi di tutti i casi seguono.

### 11.5 Matrice completata sull'app Windows reale

**Perimetro eseguito:** M01–M16 ed E01–E02 sulle quattro revisioni storiche; 18 casi, con due ripetizioni aggiuntive (M03R e M10). Domanda sempre **«Cosa è il progetto BNXT?»**, modello gpt-4o, Vault **`E:\VAULT WIN TEST DEV`**. Apertura del Vault esistente, nessuna importazione/reindicizzazione o modifica manuale dei documenti. GUI nativa «LIMEN Vault v4», backend IPC effettivo delle worktree; nessuna sostituzione con mock browser.

**Condizioni:** A = servizio reale avviato dal pannello dell'app e stato ATTIVO; I = condizione **indotta** con health 200 e vettore a 3 dimensioni invece di 1024, stato IN AVVIO verificato anche nel backend. «Secondo presente» indica l'opzione autorizzata del secondo servizio reale separato, inizialmente registrato nei file condivisi; non è stata avviata la GUI dell'installazione in AppData. Il servizio dell'app sovrascrive poi PID/porta condivisi mentre l'altro rimane attivo. E01/E02 sono eseguiti prima di avviare il servizio dall'app appena aperta.

**Lettura dei tempi:** tutti i valori numerici sono millisecondi. Nei casi conclusi, preview = cronometro backend disponibile nel registro; UI = tempo registrato dell'intera operazione fino all'errore di rete previsto. Nei casi bloccati, `> N` è il limite inferiore osservato prima del dump; le metriche dopo la chiusura del figlio non descrivono una conclusione autonoma. Su efa0cef il ramo di errore rete non registra ask_timing: i tempi sono limiti superiori UI osservati, marcati `≤`, senza inventare metriche interne.

| Caso | Revisione | Stato / secondo servizio | Esito preparazione | Tempo misurato | Embed / sem | Fonti | Evidenza UI |
|---|---|---|---|---|---|---|---|
| M01 | e0afe10 | A / assente | Conclusa | Preview 1554; UI 1648 | 57 / 46 | 8 | [M01](evidenze/session_1215/M01_ui.txt) |
| M02 | e0afe10 | A / presente | Conclusa | Preview 1553; UI 1624 | 61 / 61 | 8 | [M02](evidenze/session_1215/M02_ui.txt) |
| M03 | e0afe10 | I / assente | Bloccata; ripetuta con fixture corretto | Prima >72657; M03R >73285 | 0 / 0 dopo rilascio | 0 durante; 10 dopo rilascio | [M03](evidenze/session_1215/M03_ui.txt), [M03R](evidenze/session_1215/M03R_ui.txt) |
| M04 | e0afe10 | I / presente | Bloccata | >87600 | 0 / 0 dopo rilascio | 0 durante; 10 dopo rilascio | [M04](evidenze/session_1215/M04_ui.txt) |
| M05 | ef2532c | A / assente | Conclusa | Preview 1503; UI 1554 | 74 / 48 | 8 | [M05](evidenze/session_1215/M05_ui.txt) |
| M06 | ef2532c | A / presente | Conclusa | Preview 1149; UI 1220 | 60 / 39 | 8 | [M06](evidenze/session_1215/M06_ui.txt) |
| M07 | ef2532c | I / assente | Bloccata | >79659 | 0 / 0 dopo rilascio | 0 durante; 10 dopo rilascio | [M07](evidenze/session_1215/M07_ui.txt) |
| M08 | ef2532c | I / presente | Bloccata | >79746 | 0 / 0 dopo rilascio | 0 durante; 10 dopo rilascio | [M08](evidenze/session_1215/M08_ui.txt) |
| M09 | efa0cef | A / assente | Conclusa | UI osservata ≤5069; preview interna ND | ND; POST locale 200 nel log | 8 | [M09](evidenze/session_1215/M09_ui.txt) |
| M10 | efa0cef | A / presente | Conclusa, anche alla ripetizione | Prima osservazione ≤17606; ripetizione ≤6969 | ND; POST locale 200 nel log | 8 | [M10](evidenze/session_1215/M10_ui.txt), [ripetizione](evidenze/session_1215/M10_repeat_ui.txt) |
| M11 | efa0cef | I / assente | Bloccata | >83849; liberata e osservata conclusa entro 120870 complessivi | ND | 0 durante; 10 dopo rilascio | [M11](evidenze/session_1215/M11_ui.txt) |
| M12 | efa0cef | I / presente | Bloccata | >81899; liberata e osservata conclusa entro 122555 complessivi | ND | 0 durante; 10 dopo rilascio | [M12](evidenze/session_1215/M12_ui.txt) |
| M13 | 67da90f | A / assente | Conclusa | Preview 1344; UI 1399 | 45 / 46 | 8 | [M13](evidenze/session_1215/M13_ui.txt) |
| M14 | 67da90f | A / presente | Conclusa | Preview 1336; UI 1385 | 58 / 41 | 8 | [M14](evidenze/session_1215/M14_ui.txt) |
| M15 | 67da90f | I / assente | Bloccata | >70295 | 0 / 0 dopo rilascio | 0 durante; 10 dopo rilascio | [M15](evidenze/session_1215/M15_ui.txt) |
| M16 | 67da90f | I / presente | Bloccata | >88330 | 0 / 0 dopo rilascio | 0 durante; 10 dopo rilascio | [M16](evidenze/session_1215/M16_ui.txt) |
| E01 | e0afe10 | App nuova SPENTO / estraneo sano registrato | Conclusa in sola ricerca lessicale | Preview 1251; UI 1385 | 0 / 0 | 10 | [E01](evidenze/session_1215/E01_ui.txt), [pannello](evidenze/session_1215/E01_panel.txt) |
| E02 | 67da90f | App nuova SPENTO / estraneo sano registrato | Conclusa in sola ricerca lessicale | Preview 1191; UI 1277 | 0 / 0 | 10 | [E02](evidenze/session_1215/E02_ui.txt), [pannello](evidenze/session_1215/E02_panel.txt) |

Per tutte le righe bloccate sono presenti dump full-memory/thread-info **prima** di terminare il figlio. Il rilascio è stato ottenuto chiudendo soltanto quel figlio, mantenendo aperta l'app: la preparazione si è liberata in tutti i casi. Tempi UI finali registrati dopo l'intervento: M03 128560, M03R 102169, M04 96642, M07 109608, M08 104245, M15 79475, M16 99951. Non rappresentano timeout autonomi dell'app. I dump sono nove perché M03 è stata ripetuta.

Il dettaglio completo di PID, parent, percorsi, CreationDate, SHA, hash exe, file condivisi prima/dopo, log e screenshot è navigabile da [CASE_INDEX.md](evidenze/session_1215/CASE_INDEX.md). Le metriche grezze e le fonti dei casi registrati sono in [results_native.json](evidenze/session_1215/results_native.json). Gli alberi UI conservano i titoli delle fonti anche per efa0cef. Le 8 fonti della ricerca semantica non vengono certificate tutte pertinenti: fra esse restano documenti sul workflow iPhone e verifiche UX. Nei 10 risultati lessicali figurano inoltre titoli su redesign macOS, packaging e Localizable.strings iOS.

### 11.6 Tracciabilità delle build, condizioni e registri

| Revisione | SHA-256 dell'eseguibile effettivamente eseguito |
|---|---|
| e0afe10, anche M03R | `4744963EE3895A5D14FBDB66BD20912317F4CC13001FDDF07C8C786021025145` |
| ef2532c | `CA24FE5B2AB1C7DF4C1F23BC831F90086CE2CC94F1AFF930CABE74C8976C73A1` |
| efa0cef | `F34A5D97F13E2651239BB2E38B094427423645CAB4F0EF8C03AA60F8FEC3A712` |
| 67da90f | `2FC44CC3722DA7B1472515D456F253AE5AAC1FCB17ACF37DC47CEF84ACB2EFEC` |

SHA Git completi in 11.1 e in ogni snapshot. Percorso di ogni exe: `E:\Projects\vault_memai_obsi_audit_<revisione>\apps\desktop\src-tauri\target\release\limen-vault.exe`. Compilazioni da sorgente storico in target distinti; log `build_<revisione>.log`. È una build Tauri nativa `dev --release`: backend Rust release e frontend storico Vite, non il pacchetto installer distribuito alle 08:33. DLL/llama-server nativi non tracciati dal Git provengono dalle risorse già disponibili: [hash dipendenze](evidenze/session_1215/native_dependency_hashes.json). Questo limita l'identità binaria retrospettiva, non trasforma la prova in un mock.

Nessun sorgente di prodotto modificato dall'auditor. Nel controllo finale Git segnala `Cargo.toml` come modificato dopo il tooling Tauri/normalizzazione LF–CRLF, ma il diff di contenuto è vuoto in tutte e quattro le worktree; non è stato fatto reset per nasconderlo. Nessun checkout/reset/commit sul branch operativo. Il suo HEAD finale `84ed755254d39732b981f9742eb1f5b019dfbbec` è solo censito, **non valutato**; tutti i commit da 02747c3 in poi restano fuori perimetro.

La condizione I non è stata ottenuta spontaneamente con llama-server reale sano: è dichiaratamente indotta. Il fixture è esterno ai sorgenti e sfrutta un percorso di ricerca già presente nel prodotto. In M03R entrambe le sonde esterne riescono: [backend](evidenze/session_1215/M03R_backend.json); il difetto del primo fixture descritto in 11.4 non è necessario per riprodurre il blocco. Il binario iniziale rimane conservato per trasparenza.

La lacuna di logging di efa0cef è verificata nel suo `apps/desktop/src-tauri/src/ai.rs:2078–2098`: il ramo `Err` emette l'evento e ritorna senza log dei tempi. In M09–M12 `ask_timing.log` resta invariato; il consolidatore usa soltanto il delta rispetto al `before`, quindi **non assegna a questi casi la precedente riga di ef2532c**. Le richieste embeddings reali di M09/M10 sono riscontrabili in `llama-server.log`, e il pannello ATTIVO nella cattura M10. Tempi embed/sem interni rimangono ND. I log di build conservano warning di compilazione; gli errori mostrati dopo ogni domanda sono quelli di invio bloccato, non fallimenti della preparazione. Il messaggio di uscita `0xffffffff` del servizio precedente nei pannelli successivi deriva dalla terminazione controllata dell'auditor.

Metodo, comandi di compilazione, firewall, sonde, snapshot e dump: [SESSION_METHOD.md](evidenze/session_1215/SESSION_METHOD.md). Il modello originale è stato anche copiato prima della sessione; i file condivisi risultanti sono preservati nei singoli `after` e in `SESSION_after`. All'inizio i file PID/porta contenevano una registrazione residua 14156/59051, senza processo corrispondente attivo; non vengono scambiati per un servizio sano delle prove E.

### 11.7 Conclusione causale — VERIFICATO

1. **Un servizio estraneo sano e registrato non viene adottato dall'app appena aperta.** E01/E02 mostrano SPENTO e sola ricerca lessicale con 10 fonti. `main.rs:498–513` legge esclusivamente `llama_state.status()`; lo stato nuovo ha port=0 e child=None (`llama.rs:42–53`). La discovery dei file condivisi (`619–671`) non è invocata in questo percorso. La ricerca riceve porta assente e degrada; metodo c non si applica. Avviando il servizio dall'app viene creato un altro processo e viene sovrascritta la registrazione condivisa. Questo spiega concretamente il comportamento di mancata semantica descritto per le 09:26, distinto dal blocco.
2. **Il secondo servizio sano, da solo, non ha prodotto il blocco nei casi eseguiti.** Tutte le otto combinazioni con servizio proprio avviato, presente/assente secondo servizio, terminano con 8 fonti. Non è prova di impossibilità di ogni race, ma esclude la deduzione «due servizi ⇒ blocco» sulla base della sola contemporaneità.
3. **La catena di blocco è riprodotta nelle quattro app storiche.** Health sano + validazione embeddings fallita porta `start()` a `self.stop()` (`llama.rs:1062–1064`). `stop_child`, sotto mutex dello stato, tenta la terminazione soltanto nei blocchi `cfg(unix)` e poi esegue `Child::wait()` senza limite (`866–895`, attesa a `886`). Su Windows il figlio ancora vivo lascia lo stato occupato. `status()` (`903–928`) e l'ingresso di `ai_preview` restano in attesa. Nessun SERVICE_START di avvio riuscito; UI IN AVVIO e «Selezione passaggi pertinenti dal Vault…» oltre 60 secondi. La chiusura del solo figlio libera la preview in tutte le prove indotte.
4. **I tempi interni possono nascondere il blocco.** `ai_preview` chiama status prima di `preview_with_port` (`main.rs:506–513`): il cronometro interno non include quell'attesa. M03R registra UI 102169 ms ma preview 1371 ms dopo il rilascio. Questo rende insufficienti i soli `preview.total_ms` per escludere una lunga preparazione pendente.

Riferimenti numerati della base 1037060/67da90f: [llama.rs](evidenze/source_67da90f_llama.rs.txt), [main.rs](evidenze/source_67da90f_main.rs.txt), [AiPanel.tsx](evidenze/source_67da90f_AiPanel.tsx.txt). Il difetto lifecycle comune alle revisioni è documentato anche dal confronto sorgenti precedente e ora dai replay nativi. Il rapporto non attribuisce ai dump un'analisi simbolica degli stack che non è stata eseguita: sono raccolti per l'analisi, mentre la causalità della condizione indotta è sostenuta dal codice, dal backend controllato e dall'intervento sul solo figlio.

### 11.8 Conclusione sulle 08:33 — NON VERIFICATO

**Non è provato quale evento abbia portato il servizio reale delle 08:33 nel ramo di arresto o in un'altra attesa.** Mancano dump di quella sessione, corpo della risposta embeddings di avvio e una traccia temporale completa dei due processi storici. Non è verificato che il server reale abbia restituito un vettore invalido, JSON invalido, una risposta incompleta, oppure che abbia incontrato un'altra condizione di errore. La prova indotta dimostra un meccanismo sufficiente a produrre gli stessi sintomi, non identifica retroattivamente l'innesco.

Restano non verificati l'identità dei binari nativi installati alle 08:33 rispetto a quelli oggi disponibili, le specifiche race dei file PID/porta di quell'episodio e altri possibili contributi (timeout HTTP, letture/cache). La semplice presenza contemporanea dei PID 39740 e 24176 non consente di concludere che il secondo processo sia la causa. **Esito per AG e Claude:** difetto Windows del lifecycle dimostrato nell'app reale; mancata adozione del servizio estraneo dimostrata separatamente; attribuzione storica puntuale ancora aperta. Nessuna validazione dei fix successivi richiesta o eseguita in questa consegna.

### 11.9 Chiusura della sessione e consegna delle evidenze

Il [postflight](evidenze/session_1215/postflight.json), alle 13:31:45 UTC+8, registra zero processi limen-vault/llama-server. I soli processi dell'auditor sono stati terminati previa verifica PID/percorso/parent; le identità sono negli snapshot e nel registro di sessione. I quattro fixture in `target/release/llama-server.exe` sono rimossi dopo confronto hash, conservandone sorgente e binario nelle evidenze. Le worktree e i target restano disponibili per revisione, senza commit.

Il modello GGUF è invariato: SHA-256 `950F4A8E5E19477A6D3C26D2F162233C20002C601F75E4B002E3239997821167`; anche `ai_settings.json` è invariato. Dopo il rilascio finale i file PID/porta sono assenti, come registrato in `SESSION_after/state.json`; i contenuti intermedi sono preservati. I registri sono conservati con le nuove righe, non ripristinati cancellando le prove. Nessun documento del Vault è stato modificato dall'auditor; l'inventario del Vault raccolto durante la sessione non è presentato come confronto hash completo pre/post.

**Nessuna richiesta OpenAI ha potuto uscire dagli eseguibili di audit:** regole Block/Outbound sui quattro percorsi, tutti i profili attivi, proxy rimossi, loopback verificato separatamente. Snapshot [iniziale](evidenze/session_1215/firewall.json), [prima di efa0cef](evidenze/session_1215/firewall_pre_efa0cef.json), [profili](evidenze/session_1215/firewall_profiles_pre_efa0cef.json). Il fallimento di invio è atteso e non altera il giudizio sulla conclusione della preparazione.

**Residuo operativo dichiarato:** tentata la rimozione delle quattro regole dopo la chiusura delle app; lo script si ferma al requisito `#Requires -RunAsAdministrator`, perché `ElevatedAdmin=false`. Non è un rifiuto dell'auto-review né una nuova richiesta di consenso: manca il token amministrativo Windows. Le quattro regole restano abilitate e limitate ai soli eseguibili delle worktree. Comando esatto da eseguire in PowerShell amministratore al rientro:

```powershell
& 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\remove_audit_firewall.ps1'
```

Consegna: questo stesso rapporto, [indice delle evidenze per caso](evidenze/session_1215/CASE_INDEX.md), [risultati strutturati](evidenze/session_1215/results_native.json), nove dump, 39 screenshot JPEG con alberi UI, log build, copie prima/dopo e [manifest SHA-256](evidenze/SHA256SUMS.txt). [Verifica finale degli allegati](evidenze/session_1215/delivery_checks.json): presenti tutti i 18 casi, nove dump, screenshot decodificabili e nessun collegamento locale mancante. Le copie iniziali degli screenshot con estensione `.png` sono mantenute; l'indice collega le copie `.jpg` con byte identici, senza ricodifica. L'ultima operazione amministrativa sopra indicata rimane pendente; non viene dichiarata eseguita.
