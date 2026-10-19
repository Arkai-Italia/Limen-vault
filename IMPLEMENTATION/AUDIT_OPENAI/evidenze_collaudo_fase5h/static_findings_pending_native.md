# Riscontri statici preliminari — 6b0427122288651bce14051bd9e86fd371656e18

Questi riscontri non sostituiscono i casi sull'app reale, ancora subordinati al firewall e alla finestra concordata.

- `llama.rs:1231-1285,1470-1505`: trigger_background_start imposta starting=true, quindi chiama start_internal; quest'ultimo entra nel ramo already_starting e attende che il flag cambi. Nel percorso senza servizio adottabile lo stesso worker non raggiunge lo spawn prima di questa attesa. Da verificare nativamente C01/C07.
- `llama.rs:1522-1526`: il ramo already_port sano mantiene una guardia del mutex e chiama self.status(), che acquisisce lo stesso mutex. Possibile deadlock da verificare con percorso raggiungibile, senza modificare prodotto.
- `llama.rs:98-131,1267-1279`: BACKGROUND_ADOPT_SUCCESS passa service_binary=None; il logger usa detect_llama_server_binary della build chiamante, non il percorso del PID adottato. Da confrontare con processo esterno effettivo in C05/C08.
- `llama.rs:137-159,1610-1621`: rotazione invocata prima della creazione del file del nuovo avvio; con venti log esistenti ne possono restare ventuno. Verifica statica, comportamento oltre soglia non ancora provato nell'app.
- `llama.rs:2714-2734`: test_fase5h_codex_fixture_acceptance usa percorso assoluto esterno al Git. Se non esistono exe e sorgente, esegue return prima delle asserzioni. Rust #[test] con ritorno normale non segnala ignored né fallimento. Non è stato rimosso o rinominato alcun allegato dell'audit precedente per simulare l'assenza.
- `main.rs:510-560`: la deadline di 5 secondi (+500ms wrapper) riguarda preparazione del servizio; la successiva selezione fonti è fuori da quel timeout. Non confondere tale limite con una deadline complessiva dell'intera preview.

Confronto patch 5h con git diff 84ed755 6b04271: coincidente normalizzando soltanto CRLF/LF e newline finale; prova in preflight.json.
