# Audit indipendente — LIMEN Vault v4 Windows: preparazione della domanda

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

### 3.2 Matrice richiesta nell'app reale

NV = **NON VERIFICATO dall'auditor nell'app Tauri**. I casi a/b e c/d sono condizioni combinabili; nessuna loro combinazione viene dichiarata PASS sulla sola base di un harness.

| Revisione | (a) Servizio avviato | (b) Servizio in avvio | (c) Seconda installazione attiva | (d) Seconda installazione chiusa |
|---|---|---|---|---|
| e0afe10 | NV; funzione di avvio R1 provata | Blocco storico riferito; meccanismo isolato R3 provato | Due servizi riferiti da Cesare; replay completo NV | NV |
| ef2532c | NV | NV | NV | NV |
| efa0cef | NV; panic streaming riferito e riprodotto a livello sanitizer | NV | NV | NV |
| 67da90f | Prova di Cesare 09:37 riscontrata nei log; R2 isolata | Meccanismo isolato R4 provato; GUI NV | Seconda installazione NV; servizio debug estraneo osservato alle 09:33 | Unica app rilevata negli snapshot; prova di Cesare 09:37 riscontrata, senza replay auditor |

Non è stata manipolata la sessione reale per forzare questi stati: il mandato vieta la chiusura dei processi preesistenti, non consente chiamate OpenAI dall'app e richiede di preservare il branch. L'accesso disponibile alla GUI nativa non consente un collaudo strumentato del comando Tauri; la preview browser di `ai-ipc.ts:107–203` contiene mock e non sarebbe evidenza valida del backend. Il replay completo rimane una verifica da eseguire in un ambiente Windows separato o con sessioni di prova predisposte dall'utente.

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
