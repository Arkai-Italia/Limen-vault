# Collaudo indipendente FASE 5h — LIMEN Vault v4, Windows

Data: 24 settembre 2026. Tutti gli orari narrativi sono UTC+8; i registri originali con suffisso Z sono UTC. Destinatari: Cesare, AG e Claude.

## 1. Verdetto

**FASE 5h NON ACCETTATA (NO-GO).** L'app reale completa le undici preparazioni eseguite, ma l'avvio automatico senza servizio disponibile fallisce: il task di background attende il proprio flag `starting` fino al timeout. L'avvio manuale successivo funziona. Il pannello può mostrare SPENTO mentre il backend è in avvio. I registri non soddisfano la completezza dichiarata.

- **D-A: CHIUSO nel percorso di errore verificato**, con health sano e vettori a tre dimensioni: tre tentativi manuali falliscono senza deadlock, il pannello risponde, il retry avviene, le domande successive ripiegano con motivo visibile. L'iniezione durante l'avvio automatico iniziale non è verificata: il nuovo difetto N1 impedisce di raggiungere quel punto. Non è quindi una certificazione di tutti i percorsi di avvio.
- **D-B: CHIUSO nella condizione richiesta di servizio esterno sano già registrato all'apertura**: adozione in 56 ms, nessun secondo processo proprio, POST reale di embeddings, otto fonti. Il percorso registrato non dimostra che il vecchio comando PowerShell fosse l'unica causa storica.

Nessuna preparazione ha superato 60 secondi: non è scattata la condizione per acquisire un dump. Nessun codice di prodotto modificato, nessun commit effettuato. I limiti e la deviazione relativa al catalogo del vault sono dichiarati nelle sezioni 8–9.

## 2. Base, isolamento e protezione di rete

Base completa: `6b0427122288651bce14051bd9e86fd371656e18`. Repository operativo `E:\Projects\vault_memai_obsi`, branch `windows-build`; worktree detached `E:\Projects\vault_memai_obsi_collaudo_6b04271`, con target separato. Il preflight ha verificato origin/windows-build alla stessa revisione e la coincidenza, normalizzando i fine riga, di `fase-5h.patch` con `git diff 84ed755 6b04271`. Patch 5e–5h e handover conservati negli allegati. Evidenza: [preflight](evidenze_collaudo_fase5h/preflight.json).

Finestra autorizzata: 15:09–17:09. Cesare ha chiuso i processi installati 21516 e 36844 prima delle prove e ha confermato la pausa di AG. I servizi esterni del collaudo provengono da un'altra worktree, non dall'installazione dell'utente.

Build: frontend della worktree servito localmente su 1420; backend nativo release compilato con `cargo build --release --no-default-features --bin limen-vault`. Interazioni sulla vera finestra Windows/WebView2. **Questa prova non certifica il pacchetto installer né una release con frontend incorporato.** Log: [build](evidenze_collaudo_fase5h/build_release.log), [dipendenze](evidenze_collaudo_fase5h/deps_build.log).

Eseguibile provato: `E:\Projects\vault_memai_obsi_collaudo_6b04271\apps\desktop\src-tauri\target\release\limen-vault.exe`.

SHA-256: `3172F6AC4BF9F6D71E0DD2F032EBAF641AD36DB169DE7C54FD4EF4F8E972283A`.

La regola `LIMEN-COLLAUDO-20260924-6b04271`, installata da Cesare e verificata in ActiveStore, blocca tutto l'outbound di questo preciso eseguibile; profili Domain, Private e Public abilitati. I proxy sono rimossi dall'ambiente dei processi di prova. Le vecchie regole del gruppo storico risultano assenti. Il loopback funziona, provato dai POST reali al servizio. L'invio esterno fallisce come previsto dopo la preparazione; non è valutata la risposta del modello. Evidenze: [installazione firewall](evidenze_collaudo_fase5h/firewall_installed.json), [verifica finale](evidenze_collaudo_fase5h/final_checks.json), [script di avvio](evidenze_collaudo_fase5h/start_app.ps1). Il blocco è preventivo per processo, non una deduzione dal solo errore UI.

Domanda invariata in tutte le undici esecuzioni: **Cosa è il progetto BNXT?** Modello gpt-4o, vault `E:\VAULT WIN TEST DEV`.

## 3. Evidenze e misure

Sono conservati 37 snapshot prima/dopo/intermedi dei file condivisi e della cartella logs. [Inventario snapshot](evidenze_collaudo_fase5h/snapshot_inventory.json) contiene SHA, hash eseguibile, processi con PID/PPID/percorso/ora, contenuto PID/porta e conteggio log. Le sottocartelle contengono gli originali; i casi che condividono un'app mantengono lo stesso PID.

[QUERY_LEDGER](evidenze_collaudo_fase5h/QUERY_LEDGER.md) riporta integralmente le fonti di ogni domanda con percorsi e localizzatori. [Dati completi](evidenze_collaudo_fase5h/queries_full.json), [metriche CSV](evidenze_collaudo_fase5h/query_metrics.csv), [nuove righe ask](evidenze_collaudo_fase5h/SESSION_new_ask_timing.log), [nuove righe servizio](evidenze_collaudo_fase5h/SESSION_new_local_model_timing.log) rendono verificabili i risultati senza dover ricostruire i registri storici.

`UI` nelle tabelle indica la telemetria frontend registrata, **non un cronometro numerico letto sullo schermo**. L'osservazione esterna continua è stata acquisita per C08. Nei dettagli tecnici dopo l'errore di rete non compare un valore numerico di tempo: non si può affermare una corrispondenza con un contatore visibile per tutti i casi.

| Domanda | Preparazione ms | Servizio ms | UI ms | Embed / ricerca semantica ms | Fonti |
|---|---:|---:|---:|---:|---:|
| C01 ripiego | 1010 | 0 | 1087 | 0 / 0 | 10 |
| C01 pronto manualmente | 1315 | 1 | 1435 | 128 / 39 | 8 |
| C02 | 1450 | 3 | 1508 | 44 / 41 | 8 |
| C05 | 1478 | 0 | 1542 | 55 / 49 | 8 |
| C06 | 6521 | 5195 | 6577 | 403 / 0 | 10 |
| C03 | 1396 | 0 | 1458 | 0 / 0 | 10 |
| C04 | 1388 | 0 | 1440 | 0 / 0 | 10 |
| C01R | 1410 | 0 | 1479 | 0 / 0 | 10 |
| C01R2 | 1306 | 0 | 1373 | 0 / 0 | 10 |
| C07R | 5960 | 5035 | 7080 | 0 / 0 | 10 |
| C08 | 5964 | 5003 | 6016 | 0 / 0 | 10 |

In C06 embed_ms > 0 misura un tentativo fallito: non prova l'uso della ricerca semantica. Per C01 pronto, C02 e C05 sono invece presenti POST `/v1/embeddings` riusciti nei log reali del servizio e ricerca semantica effettiva. Il filtro del metodo c è eseguito nel ramo semantico (`ai.rs:1322–1326,1365–1367`), con ammissione rispettivamente 11, 8 e 9 ms. Ciò non certifica la pertinenza di ogni fonte restituita.

## 4. Matrice C01–C11

PASS indica il comportamento specificamente provato; le coperture incomplete sono esplicitate nella stessa riga e nella sezione 8.

| Caso | Esito | Risultato reale ed evidenza |
|---|---|---|
| C01 | **FAIL** | App 11228 aperta 15:17:52.763, nessun servizio vivo. Background fallito dopo 26361 ms, nessun figlio. Domanda dopo il fallimento: 1010 ms, ripiego esplicito. AVVIA manuale: 4448 ms, PID 40000 porta 49928, pannello ATTIVO; seconda domanda semantica 1315 ms. Ripetizioni C01R e C01R2 confermano il fallimento automatico in 26756 e 27087 ms. La domanda nei primissimi secondi dall'apertura NON è stata ottenuta. [Pannello fallito](evidenze_collaudo_fase5h/C01_panel_failed-0.jpg), [pronto](evidenze_collaudo_fase5h/C01_manual_ready-0.jpg), [risposta pronta](evidenze_collaudo_fase5h/C01_ready_query_result-0.jpg). |
| C02 | **PASS** | Servizio proprio 40000:49928 più esterno reale 27004:62362 sano, non ancora registrato. Domanda 1450 ms, POST al proprio servizio, otto fonti; esterno resta vivo. [Risultato](evidenze_collaudo_fase5h/C02_query_result-0.jpg), [salute esterno](evidenze_collaudo_fase5h/C02_foreign_health.json), snapshot C02_before/after. |
| C03 | **PASS, percorso indotto manuale** | App 38820, nessun esterno. Fixture health 200/vettore 3D: PID 20600 porta 57964, fallimento in 1214 ms; retry PID 35704 porta 58015, fallimento in 184 ms. Pannello ERRORE, AGGIORNA STATO risponde, entrambi i figli eliminati. Domanda successiva 1396 ms con motivo vettoriale e dieci fonti. Non è una domanda simultanea ai pochi millisecondi della validazione. [Pannello](evidenze_collaudo_fase5h/C03_fixture_failed_panel-0.jpg), [risultato](evidenze_collaudo_fase5h/C03_query_result-0.jpg), [monitor](evidenze_collaudo_fase5h/C03_process_monitor.jsonl). |
| C04 | **PASS, percorso indotto manuale** | Stessa app, esterno sano 37568:54658 registrato. Fixture proprio 40840:52616 fallisce in 1493 ms; esterno resta vivo e registrazione 37568/54658 conservata. Stato risponde; domanda successiva 1388 ms con ripiego motivato. Un tentativo fixture in questo caso; retry separatamente provato in C03. [Pannello](evidenze_collaudo_fase5h/C04_fixture_failed_panel-0.jpg), [risultato](evidenze_collaudo_fase5h/C04_query_result-0.jpg), snapshot C04_registered_before_attempt/C04_fixture_failed/C04_after. |
| C05 | **PASS** | App nuova 15492 alle 15:23:56.371, esterno 27004:62362 già sano e registrato. BACKGROUND_ADOPT_SUCCESS in 56 ms; registro domanda «esterno adottato», pannello ATTIVO, nessun secondo servizio proprio. Domanda 1478 ms, POST reale, otto fonti. Comando PowerShell eseguito direttamente, vedi §6. [Pannello](evidenze_collaudo_fase5h/C05_adopted_panel-0.jpg), [risultato](evidenze_collaudo_fase5h/C05_query_result-0.jpg), [stderr servizio](evidenze_collaudo_fase5h/C02_foreign_stderr.log). |
| C06 | **PASS per assenza di blocco e ripiego** | App 38820 adotta l'esterno in 46 ms; auditor chiude il proprio PID 27004 alle 15:27:28.831. Domanda 6521 ms, attesa servizio 5195 ms, ripiego esplicito, nessun blocco. Il tentativo di riavvio automatico fallisce dopo 27552 ms per N1: non è verificato un recupero funzionante. [Chiusura](evidenze_collaudo_fase5h/C06_stop_external.json), [risultato](evidenze_collaudo_fase5h/C06_query_result-0.jpg). |
| C07 | **FAIL** | Sovrapposizione reale C07R: background attivato dalla domanda alle 15:45:11.130; click AVVIA alle 15:45:32.127, prima del fallimento alle 15:45:36.482. Nessun figlio viene creato: zero processi invece dell'unico avvio funzionante richiesto. Il manuale termina dopo circa 4367 ms. Pannello SPENTO durante background. La sovrapposizione è sul background riattivato dalla domanda, non su quello iniziale. [Prima del click](evidenze_collaudo_fase5h/C07R_before_concurrent_click.json), [click](evidenze_collaudo_fase5h/C07R_concurrent_click.json), [pannello successivo](evidenze_collaudo_fase5h/C07R_concurrent_panel-0.jpg). |
| C08 | **FAIL complessivo** | Tempo preparazione include l'attesa: 5964 ms di cui servizio 5003; telemetria UI 6016. Osservazione esterna: ancora preparazione a 6199 ms, fonti visibili a 6518 ms dal click. Sei avvii propri effettivi hanno sei nuovi file distinti non vuoti. Metadati eventi incompleti/errati (N3); soglia di rotazione non raggiunta. [Osservazioni](evidenze_collaudo_fase5h/C08_observation_summary.json), [fonti visibili](evidenze_collaudo_fase5h/C08_visible_fallback_sources-0.jpg), [dettagli senza tempo numerico](evidenze_collaudo_fase5h/C08_technical_details_visible-0.jpg). |
| C09 | **PASS** | Chiusura normale app 11228: proprio 40000 terminato, registrazione propria rimossa, esterno 27004 vivo. Chiusura normale app 15492 che aveva adottato 27004: esterno vivo/sano e file 27004/62362 conservati. Snapshot C09_owned_before/after e C09_adopted_before/after nell'[inventario](evidenze_collaudo_fase5h/snapshot_inventory.json). |
| C10 | **PASS** | Titolo finestra nativa «LIMEN Vault v4» nelle acquisizioni UI e `apps/desktop/index.html:6` coincidente. [Sorgente numerato](evidenze_collaudo_fase5h/source_6b04271_index.html.txt), [UI](evidenze_collaudo_fase5h/C01_initial.json). |
| C11 | **FAIL qualità del test; verifica statica** | Il test dipende da percorso assoluto fuori repository. Se mancano sia exe sia rs termina normalmente prima delle asserzioni: passa senza provare il comportamento. Non è stato eseguito un cargo test simulando l'assenza. `llama.rs:2714–2733`; [sorgente](evidenze_collaudo_fase5h/source_6b04271_llama.rs.txt). |

Nota di tracciabilità: `C07_panel_during_background.json` ha un nome impreciso: il timestamp è successivo al timeout iniziale e non prova la sovrapposizione. La prova temporale valida è C07R_before_concurrent_click insieme al registro. Anche la schermata C07R_concurrent_panel è successiva al fallimento; non viene usata per retrodatare lo stato.

## 5. Difetti e riferimenti al codice 6b04271

I riferimenti seguenti sono relativi alla worktree verificata; copie numerate e immutabili sono negli allegati [llama.rs](evidenze_collaudo_fase5h/source_6b04271_llama.rs.txt), [main.rs](evidenze_collaudo_fase5h/source_6b04271_main.rs.txt), [UI semantica](evidenze_collaudo_fase5h/source_6b04271_SemanticEngineSettings.tsx.txt).

**N1 — Avvio automatico attende se stesso: VERIFICATO, bloccante.** `apps/desktop/src-tauri/src/llama.rs:1249` imposta starting=true; 1284 disarma il guard di background e 1285 chiama start_internal senza azzerare il flag. `start_internal:1476–1501` interpreta quel flag come un altro avvio e attende fino al timeout. Ripetuto senza servizi sani e dopo perdita dell'esterno. Il log dichiara BACKGROUND_START_BEGIN ma non segue alcuno spawn. Il manuale, dopo il timeout, parte regolarmente.

**N2 — Stato del pannello incoerente: VERIFICATO.** `llama.rs:1154–1188` non espone starting nello status. `apps/desktop/src/SemanticEngineSettings.tsx:577–584,629–632` decide etichetta e pulsante sullo stato locale dell'interfaccia. C07R mostra SPENTO e AVVIA disponibile durante l'avvio backend, documentato temporalmente alle 15:45:19 e prima del click 15:45:32.

**N3 — Metadati del servizio errati/incompleti: VERIFICATO.** Il logger `llama.rs:98–134` quando manca l'eseguibile usa il binario rilevato localmente. BACKGROUND_ADOPT_SUCCESS a 1267–1279 non passa il percorso del processo esterno: per PID 27004 registra il percorso della nuova worktree, mentre il processo reale appartiene a `vault_memai_obsi_audit_67da90f`. PANEL_OPEN_STATUS registra service_pid=none e service_port=none anche dopo un SERVICE_START riuscito (es. 15:43:46.864). Non tutti i campi mancanti sono errori: prima dello spawn il PID può legittimamente non esistere; qui mancano anche quando esiste.

**N4 — Possibile ulteriore deadlock nel ramo già sano: STATICO, NON VERIFICATO sull'app.** `llama.rs:1522–1526` mantiene il guard della mutex e valuta `self.status()` prima del rilascio; status a 1157 riacquisisce la stessa mutex non ricorsiva. Non attribuire a questo ramo un blocco osservato durante il collaudo: non ne è stato raggiunto un caso nativo dimostrato.

**N5 — Rotazione può lasciare 21 file: STATICO, NON VERIFICATO alla soglia.** `llama.rs:137–159` limita gli esistenti a 20, ma viene chiamata prima di creare il nuovo log (1610–1621). Con 20 file preesistenti il nuovo porta il totale a 21. Durante la sessione si passa da 10 a 16, quindi il limite non è stato esercitato.

**N6 — Test verde senza prova: VERIFICATO nel sorgente.** `llama.rs:2719` usa `E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\session_1215\invalid_embeddings.exe`; 2721 prova il corrispondente .rs. Se entrambi mancano, 2730 esegue `return` da un normale `#[test]`, senza fallimento né attributo ignore. Il ramo può produrre un PASS privo di collaudo; non è un risultato ottenuto eseguendo quel test in questa sessione.

Per D-A, il ramo di errore della verifica dimensionale (`llama.rs:1719–1738`) chiama stop prima di acquisire il guard successivo; stop (1793–1844) estrae il figlio posseduto, rilascia la mutex e poi termina/attende il processo. Le tre prove fixture attraversano questo errore senza blocco. La registrazione altrui è protetta a 739–777, in particolare 753–760; la rimozione a 780–802 richiede il PID proprio. C04 e C09 ne confermano il comportamento nei casi provati.

## 6. Cinque dichiarazioni del coder

| Dichiarazione | Verifica |
|---|---|
| 1. PowerShell corretto risolve l'adozione | **Correzione e comando verificati; adozione registrata PASS. Causalità esclusiva NON VERIFICATA.** La scoperta da file registrati precede il fallback PowerShell (`llama.rs:843–886`): C05 non isola il quarto metodo. |
| 2. StartingGuard impedisce avvii concorrenti | **Non accettata come garanzia funzionale.** Il guard introduce N1; nel vero overlap C07R non nasce alcun servizio. Non osservare duplicati in un avvio che non parte non prova la correttezza di tutte le corse. |
| 3. Log per avvio, ultimi 20, metadati completi | **Parziale / FAIL.** Sei file propri nuovi distinti verificati; N3 contraddice i metadati completi; N5 contraddice staticamente il limite rigoroso di 20. |
| 4. Tempo dall'ingresso di ai_preview, servizio incluso | **PASS per misura backend e caso C08.** `main.rs:510–560`, timer a 516, attesa servizio compresa. Il limite di circa 5 s riguarda l'attesa servizio (wrapper 5 s + 500 ms); non è una scadenza globale di tutta la ricerca, che continua dopo. Preparazione reale C06 6521 ms. Confronto con contatore numerico visibile per ogni caso NON VERIFICATO. |
| 5. Titolo v4 | **PASS**, sorgente e finestra nativa coincidono. |

Comando corretto eseguito anche direttamente con **Windows powershell.exe**, non solo con PowerShell 7:

```powershell
Get-Process -Name 'llama-server' -ErrorAction SilentlyContinue | ForEach-Object { $p = $_.Id; Get-NetTCPConnection -OwningProcess $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { [string]$p + ':' + [string]$_.LocalPort } }
```

Output diretto finale: `30600:50958`, exit code 0, 1883 ms. Servizio reale esterno avviato dall'auditor 15:51:23.242 e chiuso 15:51:58. [Evidenza Windows PowerShell](evidenze_collaudo_fase5h/C05_windows_powershell_direct.json). Prima esecuzione con due servizi: `27004:62362` e `40000:49928`, [output](evidenze_collaudo_fase5h/C05_corrected_powershell_output.txt).

## 7. Processi e condizione indotta

App native: PID 11228, 15492, 38820, 36580, 30928, 10820, 26684. Percorsi, genitori e orari misurati sono nell'inventario snapshot e nei file *_launch.json. I processi reali propri sono 40000:49928, 40236:63321 e 35756:50628; gli ultimi due sono avvii manuali preparatori di C07R/C08, riusciti in 3478 e 4280 ms e poi arrestati dal pannello.

Servizi reali esterni avviati dall'auditor: 27004:62362 (15:21:57.614, padre 15976), 37568:54658 (15:31:34.600, padre 39180), 30600:50958 (15:51:23.242, padre 42536). Percorso comune: `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\native\llama-server.exe`. Tutti chiusi dall'auditor dopo la rispettiva prova; nessun servizio dell'utente terminato.

Fixture: eseguibile temporaneo `target\release\llama-server.exe` nella sola worktree, senza cambiare sorgenti prodotto. Health HTTP 200 e embedding a tre dimensioni, a fronte delle 1024 attese. SHA-256 `8C14F9A87197A3A10BCC0794564D08CA21375E0F1AC9C7987A74FAA2F9533451`; [sorgente conservato](evidenze_collaudo_fase5h/invalid_embeddings.rs). PID osservati 20600, 35704, 40840; processi molto brevi. **Il PPID di ogni fixture non è stato catturato indipendentemente con CIM**: il campo ParentAppExpected del monitor indica il genitore atteso, non una misurazione. Log e flusso di avvio dimostrano la chiamata dall'app, ma non colmano quel campo richiesto.

Il fixture è stato rimosso dalla worktree dopo C04, verificandone l'hash. Il binario reale llama-server ha SHA-256 `45438F026845B4611474E3A7A21B486CAB83D3AC39CA60D591CEB88300D8EE4C`.

## 8. NON VERIFICATO e limiti

- Domanda entro i primissimi secondi dall'apertura: le tre acquisizioni C01/C01R/C01R2 sono arrivate dopo il timeout. L'attesa su un avvio realmente in corso è provata in C06/C07R/C08, ma non sostituisce quella precisa sequenza iniziale.
- D-A simultaneo all'avvio automatico iniziale e click durante i circa 77 ms di verifica del primo fixture; C03/C04 provano errore manuale, stato reattivo e domanda successiva. Retry con secondo esterno non ripetuto separatamente.
- Unico avvio concorrente funzionante: C07R fallisce prima dello spawn. Assenza universale di race, ramo N4 e rotazione oltre 20 file non provati nativamente.
- Numero di tempo visibile nell'interfaccia per ogni caso: non disponibile nel percorso di errore di invio; distinte telemetria UI, timer backend e osservazione esterna C08. PPID delle istanze fixture non misurato individualmente.
- Test C11 eseguito in ambiente senza i file esterni; qui il falso verde è dimostrato dal ramo sorgente, senza alterare le vecchie evidenze dell'utente.
- Qualità semantica di ogni singola fonte, risposta OpenAI e installer distribuito. Nessuna conclusione nuova sulla causa esatta della sessione storica delle 08:33: questo incarico collauda 6b04271.

## 9. Chiusura, integrità e deviazione sul vault

Controllo finale alle **15:55:42.575**: nessun processo limen-vault/llama-server, nessun listener Vite 1420, fixture assente dalla worktree, registrazione condivisa PID e porta assente. Il server frontend PID 16396 è stato chiuso dopo verifica del percorso. Repository principale e worktree hanno SHA atteso e nessuna modifica tracciata. Nessun checkout/reset sul branch operativo e nessun commit.

Il modello GGUF conserva SHA-256 `950F4A8E5E19477A6D3C26D2F162233C20002C601F75E4B002E3239997821167`; ai_settings.json coincide con la copia iniziale.

**Deviazione dal vincolo «non modificare il vault»:** la scansione finale rileva `E:\VAULT WIN TEST DEV\00_SYSTEM\VAULT_CATALOG.json` (31605699 byte) con LastWriteTime **15:42:59.192**, dentro la finestra. Non sono state eseguite modifiche manuali al vault, ma non posso certificare che sia rimasto immutato. Il prodotto ha percorsi di salvataggio catalogo (`catalog.rs:294–307,1037–1038`); senza tracciamento della scrittura o hash iniziale completo, l'attribuzione precisa e il delta di contenuto sono **NON VERIFICATI**. Non ho ripristinato alla cieca il catalogo. La verifica finale riporta questo file esplicitamente; non viene nascosto dietro una dichiarazione di integrità generale.

La regola firewall di collaudo è **ancora attiva**, come previsto dalla rimozione affidata a Cesare. Eseguire in PowerShell amministratore:

```powershell
& 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5h\remove_collaudo_firewall.ps1'
```

Lo script verifica che l'app sia chiusa e che il percorso sia quello di collaudo, rimuove solo questa regola e salva l'esito. Nessuna rimozione già avvenuta viene dichiarata.

## 10. Consegna verificabile

Evidenze: `E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5h\`.

[Manifest SHA-256](evidenze_collaudo_fase5h/SHA256SUMS.txt) include gli allegati e questo rapporto, escluso il manifest stesso. I file preliminary/static_findings sono appunti di lavoro: il presente rapporto prevale per verdetti e limiti. Gli originali dei log sono mantenuti; i delta e il ledger forniscono l'indice delle undici domande.

Per AG: priorità N1 e N2; correggere N3 e rendere C11 riproducibile senza evidenze esterne; verificare N4 e N5. Per Claude: distinguere i due difetti specifici chiusi nei percorsi provati dal **NO-GO complessivo**, e mantenere esplicite le coperture mancanti. Nessuna correzione di prodotto è stata applicata dall'auditor.
