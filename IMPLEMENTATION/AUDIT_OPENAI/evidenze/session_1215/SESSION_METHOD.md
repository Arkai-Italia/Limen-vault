# Sessione nativa 24 settembre 2026 — metodo riproducibile

Finestra autorizzata: dalle 12:15 UTC+8, due ore; AG fermo, prosecuzione autonoma autorizzata da Cesare. Nessun processo preesistente è stato chiuso. Tutti gli avvii e le terminazioni sono limitati alle worktree di audit e ai loro figli identificati per PID/percorso/parent.

## Protezione di rete

Installazione eseguita da Cesare in PowerShell amministratore prima della sessione:

```powershell
& 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\install_audit_firewall.ps1'
```

Lo script contiene la lista chiusa e i quattro percorsi, verificati anche in ActiveStore. Il comando di creazione è:

```powershell
New-NetFirewallRule -Name $auditName -DisplayName $auditName -Group 'LIMEN historical audit 20260924' -Program $auditProgram -Direction Outbound -Action Block -Enabled True -Profile Any -Protocol Any -RemoteAddress Any -PolicyStore PersistentStore
```

Per ogni build avviata è stato rimosso l'uso di proxy dall'ambiente:

```powershell
foreach($proxyAudit in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY')) {
    Remove-Item -LiteralPath ('Env:\'+$proxyAudit) -ErrorAction SilentlyContinue
}
$env:NO_PROXY='*'
```

Le connessioni locali sono state verificate con il server reale e la ricerca semantica dell'app. Il fallimento immediato dell'invio OpenAI è atteso: il criterio della prova è la conclusione della preparazione, non una risposta generata. Il registro contiene la dicitura storica «Fonti inviate» anche quando l'invio fallisce; non usarla per inferire una trasmissione riuscita.

Rimozione prevista, soltanto dopo chiusura delle app di audit, con PowerShell amministratore:

```powershell
& 'E:\Projects\vault_memai_obsi\IMPLEMENTATION\AUDIT_OPENAI\evidenze\remove_audit_firewall.ps1'
```

## Build e identificazione

In ciascuna worktree storica separata, con directory target propria:

```powershell
npx pnpm install --offline --frozen-lockfile --ignore-scripts
npx pnpm --filter '@limen-vault/desktop^...' build
$env:CARGO_TARGET_DIR='<worktree>\apps\desktop\src-tauri\target'
$env:CARGO_NET_OFFLINE='true'
npx pnpm --filter @limen-vault/desktop tauri dev --release
```

Il log `build_<revisione>.log` prova la compilazione dalla worktree. `state.json` in ogni caso registra SHA Git, SHA256 dell'eseguibile, PID, percorso, parent e CreationDate. Dipendenze Rust già disponibili copiate in target separati; il prodotto è ricompilato. I binari nativi non tracciati dal repository provengono dalle risorse della copia operativa: gli hash storici delle 08:33 non sono disponibili. Non confondere i numeri di versione rimasti nei metadati storici con la finestra nativa effettiva «LIMEN Vault v4».

## Operazioni nell'app reale

GUI nativa controllata con Computer Use. Apertura del Vault esistente `E:\VAULT WIN TEST DEV`, nessuna importazione, reindicizzazione o modifica documenti. Modello gpt-4o; domanda esatta: `Cosa è il progetto BNXT?`. Il pulsante Chiedi invoca il backend Tauri della build storica. Non sono stati usati i mock del frontend browser.

Servizio avviato: pulsante AVVIA SERVIZIO LOCALE e successivo pannello ATTIVO, corroborati da processo reale, health, embeddings e SERVICE_START. Seconda installazione presente: opzione autorizzata del secondo servizio reale avviato separatamente e registrato nei file condivisi, non seconda GUI installata. Dopo l'avvio del servizio dell'app, i file condivisi vengono sovrascritti dal suo PID/porta mentre il servizio estraneo rimane attivo.

Condizione «in avvio»: indotta. Non è stata riprodotta spontaneamente con il server reale sano. `invalid_embeddings.rs` è un server diagnostico esterno al prodotto, compilato con rustc e copiato in `target/release/llama-server.exe`, percorso già previsto dal discovery storico. Risponde health 200 e vettori a tre dimensioni; il validatore ne attende 1024. Rimane vivo per 1800 secondi o fino alla terminazione controllata. Nessun sorgente di prodotto modificato. I file `Mxx_backend.json`, pannelli UI e log del fixture documentano la condizione. La prima versione usata in M03 aveva un limite nelle sonde esterne su socket non bloccante; sorgente corretto solo nel fixture, conservando il primo binario.

## Cattura e rilascio del blocco

`capture_case.ps1` salva copie e hash dei sei file condivisi, insieme a metadati Git/processi/binario. Esempio:

```powershell
& '.\capture_case.ps1' -Case M07 -Phase before -Revision ef2532c
& '.\dump_case.ps1' -AppPid 42180 -Case M07
& '.\capture_case.ps1' -Case M07 -Phase blocked -Revision ef2532c
```

Il dump usa MiniDumpWriteDump con full memory e thread info (0x1002), dopo osservazione UI oltre 60 secondi e prima di chiudere il figlio. Sono allegati gli stati dei thread; non viene dichiarata un'analisi simbolica degli stack. La terminazione del solo fixture viene verificata contro percorso/parent e poi eseguita con `Stop-Process -Id <PID verificato>`. L'app resta aperta per osservare la preparazione che si libera e l'errore di invio atteso; seguono screenshot e snapshot `after`.

Il cronometro `preview.total_ms` comincia dopo la chiamata a status e non comprende l'attesa iniziale del mutex. Per il blocco usare il tempo osservato della UI e `t_ui_total_ms`, non la sola preview interna dopo il rilascio. Gli screenshot sono osservazioni discrete: il tempo di cattura dopo una prova sana non è la durata della preparazione.

`consolidate.ps1` produce `results_native.json` con metriche/fonti complete e i delta dei registri per ciascun caso. I dump possono contenere dati applicativi in memoria: sono conservati localmente nelle evidenze, senza caricamento esterno.

Eccezione di strumentazione verificata: efa0cef, `ai.rs:2078-2098`, emette l'evento di errore rete e ritorna senza scrivere ask_timing.log. Per M09-M12 il delta ask resta vuoto e le metriche interne sono nulle nel consolidato. Le fonti sono documentate nell'albero UI e il tempo viene espresso come limite osservato dalla GUI; non si riutilizza l'ultima riga storica del registro. M10 ha una seconda esecuzione, documentata come `M10_repeat_ui`, per restringere il limite temporale. Il primo tentativo è conservato.

Gli screenshot restituiti dal runtime sono JPEG. Le prime copie erano state salvate con estensione `.png`; sono conservate e affiancate da copie `.jpg` identiche nei byte, collegate nell'indice. Non è stata effettuata alcuna modifica o ricodifica delle immagini. La verifica finale controlla formato reale e dimensioni.
