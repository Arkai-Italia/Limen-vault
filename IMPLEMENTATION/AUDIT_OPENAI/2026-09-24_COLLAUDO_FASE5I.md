# Collaudo indipendente FASE 5i / 5i-bis — d8ddd86

Destinatari: Cesare, AG e Claude. Data: 24 settembre 2026. Orari del testo UTC+8; i registri con suffisso Z sono UTC.

**Esito: collaudo parziale, senza blocchi osservati nei percorsi effettivamente provati. Non costituisce certificazione completa dei casi richiesti.** C06, C08/N3 e N5 superati; N2 verificato con rallentamento indotto del servizio vero; N7 documentato. C01 incompleto, C07, N4 e D1 NON VERIFICATI sull'app nelle condizioni esatte richieste. Nessuna conclusione nuova sulla causa storica delle 08:33.

## 1. Identità, isolamento e metodo

- Repository reale: `E:\Projects\vault_memai_obsi`, remoto `https://github.com/cesarenegro/vault_memai_obsi`, branch `windows-build`. Il percorso letterale `E:\Projects\vault\_memai\_obsi` non esiste su questa macchina.
- Revisione collaudata: **d8ddd86ec04e3ff17cf13c2e1fb41ee4b29e8eac**, worktree separata `E:\Projects\vault_memai_obsi_collaudo_d8ddd86`, HEAD detached. Il repository principale è rimasto a `56c9bcf175570a8ad961a3dc22fdab6749c2c47d`; i successivi commit rispetto al target contengono documentazione/evidenze, non sono oggetto del collaudo.
- Eseguibile: `E:\Projects\vault_memai_obsi_collaudo_d8ddd86\apps\desktop\src-tauri\target\release\limen-vault.exe`, SHA-256 **6CEDF05E91504CD275B9A9C5C3D81F6CBFA8A1F4523DBC6F442DCB3DB86CB6F3**.
- Build Rust ottimizzata, terminata in 3m29s, mediante `npx pnpm --filter @limen-vault/desktop tauri dev --release`, frontend Vite della medesima worktree. È l'app nativa reale con backend release, **non una verifica del pacchetto installer**. Cache di compilazione separata riutilizzata; eseguibile ricompilato. Registri build e dipendenze allegati.
- `LIMEN_MODELS_DIR` assente negli ambiti Process, User e Machine; verificato anche dai launcher prima degli avvii. Modello bge-m3 reale, nessun mock server e nessuna modifica al codice di prodotto.
- Vault: `E:\VAULT WIN TEST DEV`. Domanda per tutte le sei esecuzioni: **Cosa è il progetto BNXT?**
- Finestra comunicata e registrata: **18:43:35.942–20:43:35.942**. La risposta di Cesare conteneva segnaposto HH:MM: l'inizio è stato esplicitato usando l'orario verificato di ricezione/preflight. App installata chiusa, AG e Cesare in pausa. Prove native terminate alle 19:08 circa.

Le schermate e gli alberi UI provengono dalla finestra nativa. Monitor esterno di processi e catalogo con polling nominale 200 ms: le osservazioni di unicità non escludono processi più brevi dell'intervallo. Le metriche di preparazione provengono dai registri dell'app, non sono tempi di generazione OpenAI.

## 2. Protezione rete e stato iniziale

Regola `LIMEN-COLLAUDO-20260924-d8ddd86`, installata da Cesare alle 18:42:39.587: Block, Outbound, Any, sul solo percorso completo dell'eseguibile sopra indicato. Profili Domain/Private/Public attivi, regola verificata in ActiveStore prima degli avvii. [Installazione](evidenze_collaudo_fase5i/firewall_installed.json), [indirizzi](evidenze_collaudo_fase5i/firewall_address.json), [script esatto](evidenze_collaudo_fase5i/install_collaudo_firewall.ps1).

La protezione per processo impedisce l'uscita verso OpenAI; l'app tenta la fase di invio e registra l'errore rete atteso. La dicitura del registro «Fonti inviate a OpenAI» descrive il payload predisposto, **non prova una consegna di rete**. Non è stata eseguita una cattura pacchetti. I fallimenti di invio non sono FAIL della preparazione.

[SESSION_before/state.json](evidenze_collaudo_fase5i/SESSION_before/state.json) conserva inventario ricorsivo, impronte, dimensioni e date del modello e dei log; le copie dei registri e del catalogo sono nella stessa cartella. Il log legacy a zero byte e i log modificati da AG fra 17:05 e 17:47 erano preesistenti, non prodotti dal collaudo. All'inizio erano presenti 20 log per avvio.

## 3. Matrice dei casi

| Caso | Esito | Osservazione reale e limite |
|---|---|---|
| C01 | **NON VERIFICATO integralmente** | Avvio automatico riuscito: app 37892, unico servizio osservato 26500, porta 64154, BG_SUCCESS in 16553 ms. Prima domanda semantica riuscita, preparazione 1199 ms. La domanda nei primissimi secondi non è stata eseguita: inizialmente il vault non era aperto e, al momento della prima acquisizione UI, il servizio era già pronto. Il ramo iniziale di ripiego non è certificato da questa prova. |
| C06 | **PASS** | Adottato servizio esterno 27124; terminato dall'auditor alle 18:59:05.703. Domanda successiva: ripiego motivato, preparazione 6357 ms, nessun blocco. Nuovo avvio automatico: PID 5760, porta 53117, BG_SUCCESS 6493 ms. Domanda successiva semantica: 1312 ms. |
| C07 | **NON VERIFICATO** | Tentativo con domanda a servizio spento: un processo 6652, porta 57436, avvio riuscito in 4201 ms. Il pannello è stato acquisito dopo la disponibilità del servizio; non è stato prodotto un secondo clic AVVIA durante l'avvio. Le prove N2 mostrano la protezione UI, non dimostrano il percorso backend a due chiamanti. |
| N2 | **PASS funzionale, condizione indotta** | Servizio vero rallentato sospendendo per 12 s soltanto il nuovo processo figlio dell'app. Acquisizione `N2_repeat_during_background`: stato IN AVVIO…, comando ARRESTA disabilitato, nessun AVVIA disponibile. Con un figlio già presente l'interfaccia mostra ARRESTA, non AVVIA disabilitato: questa differenza letterale è esplicita. Ritorno ad ATTIVO dopo ripresa del processo. |
| C08 / N3 | **PASS** | Servizio reale avviato dall'altra cartella `vault_memai_obsi_audit_67da90f`, registrato nei file condivisi prima dell'app. ADOPT_SUCCESS in 138 ms e PANEL_OPEN_STATUS riportano percorso reale, PID 27124 e porta 49192. Pannello ATTIVO; nessun secondo servizio osservato. |
| N4 | **NON VERIFICATO sull'app** | Con servizio sano il pannello espone ARRESTA: non è stata inviata una nuova richiesta AVVIA già sano. Il ramo corretto è presente nel codice, ma la sola lettura non equivale al caso runtime richiesto. |
| N5 | **PASS** | Dopo il primo avvio i 20 log restano 20: eliminato `llama-server_20260924T090904Z_3588.log`, creato `llama-server_20260924T104804Z_26500.log`. Nessun log sintetico introdotto. |
| D1 | **NON VERIFICATO** | Non riprodotto dall'esterno un arresto durante avvio con secondo chiamante in attesa. Durante IN AVVIO il comando di arresto è disabilitato. Non sostituito il caso con test unitari o chiamate backend artificiali. |
| N7 | **PASS della verifica osservativa** | Impronte e monitor registrano due riscritture per apertura vault; nessuna durante domande o attesa passiva di 316 s. Cambiano esclusivamente catalogRevision e lastUpdatedAt. Attribuzione runtime a AutomationScheduler::tick NON VERIFICATA. |

Nessun caso è classificato FAIL sulla base della sola mancata copertura. I NON VERIFICATI impediscono di dichiarare completata l'intera matrice.

## 4. Tempi delle sei domande e fonti

| Completamento UTC+8 | Scenario | Preparazione ms | Preparazione servizio ms | Embedding ms | Semantica ms | Totale UI ms | Fonti |
|---|---|---:|---:|---:|---:|---:|---:|
| 18:49:24.009 | C01, servizio pronto | 1199 | 1 | 111 | 37 | 1286 | 8 |
| 18:59:21.893 | C06, esterno chiuso | 6357 | 5041 | 0 | 0 | 6421 | 10 |
| 19:00:27.937 | C06, nuovo servizio pronto | 1312 | 0 | 52 | 42 | 1348 | 8 |
| 19:01:46.784 | Tentativo C07 naturale | 5731 | 4664 | 23 | 40 | 6823 | 8 |
| 19:05:23.978 | Primo rallentamento N2 | 6403 | 5400 | 0 | 0 | 6442 | 10 |
| 19:07:10.536 | Ripetizione N2 | 5974 | 5063 | 0 | 0 | 7058 | 10 |

Nei tre ripieghi il motivo registrato è «Servizio locale in avvio: ripiego temporaneo sulla ricerca per parole per questa domanda.» La terminazione della preparazione è verificata, senza attese superiori a 60 s. Non è quindi stato necessario acquisire dump per blocco. La pertinenza di tutte le fonti non è certificata; restano fonti estranee nella selezione per parole.

Elenco integrale delle fonti, locator, byte, PID/porta disponibili e dettagli delle metriche: [queries.json](evidenze_collaudo_fase5i/queries.json), [sole righe nuove ask_timing.log](evidenze_collaudo_fase5i/delta_ask_timing.log). Il JSON contiene sia gli eventi preview sia i sei riepiloghi finali, non dodici domande.

## 5. Processi, pannello e condizioni indotte

App 37892 creata alle 18:48:01.712, app 29636 alle 18:57:12.606, entrambe dall'eseguibile identificato in sezione 1. Servizi osservati:

| PID | Porta | Provenienza / risultato |
|---:|---:|---|
| 26500 | 64154 | Figlio della prima app, creato 18:48:03.953; SERVICE_START 18:48:18.740, 16127 ms; terminato con chiusura app. |
| 27124 | 49192 | Esterno avviato dall'auditor 18:56:07.605; adottato 18:57:13.375; chiuso dall'auditor per C06. |
| 5760 | 53117 | Nuovo figlio della seconda app dopo C06; SERVICE_START 18:59:25.244, 4364 ms; arrestato dal pannello. |
| 6652 | 57436 | Tentativo C07; creato 19:01:40.809, SERVICE_START 19:01:44.688, 3884 ms; arrestato dal pannello. |
| 38072 | 52511 | Primo N2 indotto; creato 19:05:18.382, sospeso 19:05:18.591, ripreso 19:05:30.604; SERVICE_START 19:05:34.395, 16014 ms; arrestato dal pannello. |
| 12428 | 56406 | N2 ripetuto; creato 19:07:04.416, sospeso 19:07:04.684, ripreso 19:07:16.707; SERVICE_START 19:07:20.784, 16370 ms; terminato con chiusura app. |

Il processo esterno usa `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\native\llama-server.exe`; tutti gli altri il `native\llama-server.exe` della worktree d8ddd86. SHA-256 del server usato: `45438F026845B4611474E3A7A21B486CAB83D3AC39CA60D591CEB88300D8EE4C`. Inventario completo con path, creazione e genitore: [snapshot_inventory.json](evidenze_collaudo_fase5i/snapshot_inventory.json) e [monitor processi](evidenze_collaudo_fase5i/monitor/process_changes.jsonl). Le copie di pid e port prima/dopo sono nelle singole cartelle snapshot.

La sospensione N2 usa `NtSuspendProcess`/`NtResumeProcess`, con controllo PID, percorso e genitore e ripresa in finally; entrambi restituiscono 0. [Script](evidenze_collaudo_fase5i/delay_owned_start.ps1), [prima esecuzione](evidenze_collaudo_fase5i/N2_induced_delay.json), [ripetizione](evidenze_collaudo_fase5i/N2_repeat_delay.json). È una condizione indotta, non un avvio lento naturale. Il primo tentativo non ha catturato tempestivamente IN AVVIO; la ripetizione sì. Il file denominato `C07_N2_during_background` è stato acquisito dopo l'avvio riuscito e non viene usato per dimostrare N2.

Schermate principali: [domanda semantica C01](evidenze_collaudo_fase5i/C01_query_result-0.jpg), [adozione N3](evidenze_collaudo_fase5i/N3_adopted_panel-0.jpg), [ripiego C06](evidenze_collaudo_fase5i/C06_query_result-0.jpg), [recupero semantico C06](evidenze_collaudo_fase5i/C06_ready_query_result-0.jpg), [IN AVVIO N2](evidenze_collaudo_fase5i/N2_repeat_during_background-0.jpg), [ATTIVO dopo ripresa](evidenze_collaudo_fase5i/N2_repeat_recovered-0.jpg). Ogni schermata ha JSON UI omonimo con timestamp.

## 6. Catalogo N7: fatti e attribuzione

Tutte le versioni sono lunghe 31.605.699 byte. Impronte complete in [catalog_changes.jsonl](evidenze_collaudo_fase5i/monitor/catalog_changes.jsonl), copie catalog_001–005 nella medesima cartella, confronto strutturale in [catalog_deltas.json](evidenze_collaudo_fase5i/catalog_deltas.json).

| Operazione / modifica file UTC+8 | Revisione | SHA-256 |
|---|---:|---|
| Stato iniziale, mtime 15:42:59.192 | 121 | BC1F964216C18FDD364A8B8F5930BEE53C4F4705F050C7E36BFF88EF47A6F37E |
| Prima apertura, 18:48:45.207 | 122 | 12161391F310DB2C4416274D1AFEA543A97CF550820F703A4596053ED516DC6A |
| Prima apertura, 18:48:52.356 | 123 | 3024CD91085641729BAA1618CBD7DA7E5F8C8B1D88DD6AD0644E7689C39DFE08 |
| Seconda apertura, 18:57:40.744 | 124 | 590649B4E42F9CCE437BE7A50FAA50B5F4227B9563CC94AAF85CB051D4F7CEE6 |
| Seconda apertura, 18:57:45.840 | 125 | 764A1603374373DA41E45CFE62375BD7D34FA1FE74216026E0B5E59E2E63D4AE |

Attesa senza azioni UI: **18:50:21.041–18:55:37.187, 316.146 s** fra marcatori: hash e mtime identici. Le domande non producono variazioni osservate; [operation_marks.jsonl](evidenze_collaudo_fase5i/operation_marks.jsonl) contiene i marcatori prima/dopo disponibili, integrati dal monitor continuo. Non sono presenti coppie di marcatori immediati per ogni singola domanda tardiva: per queste vale il monitor, non una coppia manuale inventata.

**VERIFICATO nel codice target:** `main.rs:102` chiama sync_catalog all'apertura; `App.tsx:440` apre il vault e `:462` richiama refreshCatalog; `App.tsx:232` definisce refreshCatalog, che invoca syncCatalog; `main.rs:637` richiama sync_catalog_from_vault; `catalog.rs:875` salva senza condizionare il salvataggio alla presenza di modifiche; `save_catalog`, da `catalog.rs:294`, aggiorna revisione e data. La doppia riscrittura osservata è coerente con questi due passaggi.

**NON VERIFICATO come stack runtime:** non acquisito lo stack di ciascun save. `AutomationScheduler::tick`, `automation.rs:451` e seguenti, contiene sync_catalog a :464 e process_pending_extractions a :465, ma la ricerca dei chiamanti di tick/set_vault nel codice desktop trova chiamate nei test, non dimostra un ciclo produttivo attivo. `AutomationPanel.tsx:11–14` usa invece il timer frontend per automation_status/automation_run. Non attribuisco le riscritture a tick e non estendo i cinque minuti osservati a un'assenza universale di riscritture periodiche.

## 7. Riscontri statici, distinti dalle prove native

Fonti numerate archiviate `source_d8ddd86_*.txt`, indipendenti da successive modifiche di AG:

- `llama.rs:1531–1536`: invalidazione dello stato adottato non sano; `:1617` innesca avvio; `:1620` e seguenti attendono entro il limite della preparazione. Riscontro coerente con C06.
- `llama.rs:1297–1301` e `:1424`: percorso reale del PID adottato; `:168` evento PANEL_OPEN_STATUS. Riscontro coerente con N3 e registri.
- `SemanticEngineSettings.tsx:52`, `:162–167`, `:587`, `:628`, `:642`: stato di avvio backend, aggiornamento e protezione pulsanti. Riscontro coerente con N2.
- `llama.rs:1697–1755`: controllo proprietario dell'avvio e attesa del secondo chiamante. Presenza del codice verificata, esecuzione concorrente C07/D1 non verificata.
- `llama.rs:1759–1770`: check salute fuori dal mutex e ritorno di status dopo rilascio della guardia. Presenza verificata, richiesta N4 da app non eseguita.
- `llama.rs:1871–1872`: riduzione a 19 log prima del nuovo file. N5 verificato anche realmente; [rotazione](evidenze_collaudo_fase5i/N5_rotation.json).

## 8. Integrità, errori di acquisizione e chiusura

Modello invariato per hash, dimensione e mtime: SHA-256 `950F4A8E5E19477A6D3C26D2F162233C20002C601F75E4B002E3239997821167`. ai_settings.json mantiene lo stesso hash, con mtime aggiornato dall'app. Catalogo conservato nello stato prodotto dall'app, senza ripristino manuale. [Confronto](evidenze_collaudo_fase5i/integrity_comparison.json).

Nessun commit, checkout o reset nel repository principale e nessuna modifica al codice di prodotto. La worktree segnala Cargo.toml M dopo Tauri: `git diff --exit-code` restituisce 0 e blob corrente/HEAD coincidono (`0bca563a0150ae3c2585c2292dfac76289f674ab`); si conserva questo dettaglio anziché dichiarare falsamente uno status vuoto. [Integrità worktree](evidenze_collaudo_fase5i/worktree_integrity.json).

L'acquisizione `C01_N5_after` è incompleta: lettura del log aperto negata. Lo script è stato corretto per lettura condivisa e la copia valida è `C01_N5_after_retry`; la cartella incompleta è preservata. I registri terminale `build_and_run_release.log`, `C06_N3_stdout.log`, `C06_N3_stderr.log` e i registri del server sono allegati. La build ha prodotto warning, non errori bloccanti. Gli errori OpenAI di rete sono attesi per il firewall.

Alle **19:09:19** nessuna app o llama-server risultava attivo; pid/port condivisi assenti. Chiusi anche Vite PID 42376, relativo helper 43680 e monitor 9212. [Chiusura processi](evidenze_collaudo_fase5i/cleanup_before_firewall.json), [frontend](evidenze_collaudo_fase5i/frontend_cleanup.json), [SESSION_after](evidenze_collaudo_fase5i/SESSION_after/state.json).

**Rimozione firewall ancora da verificare al momento della redazione.** La sessione dell'auditor non è amministratore; chiesto a Cesare di eseguire:

```powershell
& 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze_collaudo_fase5i\remove_collaudo_firewall.ps1'
```

Lo script controlla percorso e assenza dell'app, rimuove esclusivamente la regola del collaudo, verifica ActiveStore e scrive firewall_removed.json. La chiusura operativa completa richiede verifica della rimozione. Le evidenze grezze e questo rapporto sono inventariati in `evidenze_collaudo_fase5i/SHA256SUMS.json`.

## 9. Consegna ad AG e Claude

I fatti riproducibili consegnati sono: adozione con percorso reale, recupero dopo morte del servizio esterno, ripiego motivato senza blocco, limite di 20 log, stato UI durante avvio indotto e riscritture del catalogo all'apertura. Non è autorizzata da questi risultati una dichiarazione di copertura completa di C01/C07/N4/D1. Per completarla servono esecuzioni native delle condizioni mancanti, con nuova finestra coordinata se si riprendono le prove dopo questa chiusura. Nessuna modifica correttiva proposta è stata applicata durante il collaudo.
