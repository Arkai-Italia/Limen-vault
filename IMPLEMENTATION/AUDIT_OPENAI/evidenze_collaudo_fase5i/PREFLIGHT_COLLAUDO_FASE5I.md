# Preflight collaudo FASE 5i / 5i-bis

24 settembre 2026, UTC+8. Stato: preparazione completata; prove native non ancora avviate. In attesa di conferma installazione firewall e nuova finestra esclusiva di due ore.

- Repository effettivamente esistente: E:\Projects\vault_memai_obsi. Il percorso E:\Projects\vault\_memai\_obsi del messaggio non esiste su questo host.
- Branch windows-build, HEAD e remoto verificati: 56c9bcf175570a8ad961a3dc22fdab6749c2c47d. Delta da d8ddd86 limitato a documentazione/evidenze; il target resta d8ddd86ec04e3ff17cf13c2e1fb41ee4b29e8eac.
- Worktree detached creata: E:\Projects\vault_memai_obsi_collaudo_d8ddd86. Target separato; copiata cache release 5h, escluso l'eseguibile dell'app. Dipendenze offline e build pacchetti completate.
- Nessuna modifica tracciata al repository operativo. File di audit e patch locali preesistenti non tracciati conservati.
- LIMEN_MODELS_DIR assente in Process/User/Machine, verificato anche fuori sandbox con identità reale; ricontrollo obbligatorio nel launcher prima dell'avvio.
- PREFLIGHT_before: inventario ricorsivo modelli con SHA-256/date/dimensioni, copie log e catalogo. llama-server.log già vuoto, ultima modifica 17:46:59.621: precedente al collaudo. Logs contiene 20 file, condizione N5 già disponibile senza creare file artificiali.
- Regola da installare: LIMEN-COLLAUDO-20260924-d8ddd86, tutto outbound del solo eseguibile release della worktree. Script install/remove pronti nella cartella evidenze_collaudo_fase5i.

## Sequenza e task list

- [x] Identità repository/target/remoto e delta documentale.
- [x] Worktree e dipendenze separate.
- [x] Snapshot preliminare con impronte e date.
- [x] Script firewall installazione/rimozione e controllo ambiente.
- [ ] Conferma di Cesare: firewall amministratore, app installata chiusa, pausa AG, intervallo esclusivo.
- [ ] Snapshot SESSION_before, verifica firewall ActiveStore e avvio monitor catalogo/processi.
- [ ] Build tramite `npx pnpm --filter @limen-vault/desktop tauri dev --release` nella worktree; primo avvio protetto.
- [ ] C01 automatico + domanda precoce se raggiungibile; successiva domanda semantica; N5 conteggio prima/dopo.
- [ ] N7 impronte prima/dopo apertura vault, domanda, attesa passiva almeno cinque minuti; copie di ogni riscrittura.
- [ ] C06/N3 servizio esterno reale da altra cartella, adozione, metadati pannello, chiusura esterno proprio, domanda e recupero.
- [ ] N2/C07 stato transitorio e pulsante; distinguere click disabilitato da effettivo secondo chiamante.
- [ ] N4 avvio già sano e D1 arresto con concorrente se raggiungibili dalla UI; altrimenti NON VERIFICATO.
- [ ] Snapshot finale, nessun processo proprio residuo, rimozione firewall verificata, rapporto e manifest.

## Osservazioni statiche da confrontare con l'app

Non sono esiti del collaudo nativo.

1. llama.rs ora associa start_owner a un token e passa lo stesso token al percorso di avvio background: corregge strutturalmente l'auto-attesa 5h. Il ramo concorrente estrae dati e rilascia il lock prima delle verifiche di salute e di status.
2. SemanticEngineSettings usa isStarting e disabilita AVVIA/ARRESTA mentre starting è vero. C07 e D1 possono non essere provocabili da questi pulsanti; non aggirare la disabilitazione né spacciare un test unitario per un click reale.
3. Rotazione prima dello spawn-log limita gli esistenti a 19: il nuovo file dovrebbe riportare il totale a 20.
4. get_binary_path e log_panel_open_status usano PID/percorso del processo reale. Verificare il caso adottato.
5. N7: sync_catalog termina con save_catalog in catalog.rs:875, senza subordinare quel salvataggio al numero di estrazioni. open_vault richiama sync_catalog in main.rs:102 e process_pending_extractions alla riga successiva.
6. AutomationScheduler::tick chiama sync_catalog/process_pending_extractions (automation.rs:464–465), ma la ricerca nei sorgenti desktop trova chiamate a tick e set_vault solo nel test della stessa unità. main.rs:360 registra un'istanza default; non è emerso un collegamento al ciclo periodico di produzione. Perciò non attribuire una scrittura a tick solo perché il corpo di tick contiene save_catalog indirettamente. Attesa passiva e confronto contenuti serviranno a verificare il comportamento effettivo.

Le regole generali .agents/AGENTS.md sul checkout operativo non prevalgono sull'incarico specifico: il collaudo deve avviare e chiudere i propri processi nella worktree. Si usa il comando release prescritto adattandone soltanto la directory alla worktree richiesta; non si avvia nulla prima della finestra/firewall.
