# Registro di avanzamento — non rapporto finale

Base d8ddd86ec04e3ff17cf13c2e1fb41ee4b29e8eac. Finestra 18:43:35–20:43:35 UTC+8.

## Prima app

- Build Tauri dev release riuscita in 3m29s, 12 warning libreria + 1 binario; frontend Vite locale, nessuna modifica prodotto.
- Eseguibile SHA256 6CEDF05E91504CD275B9A9C5C3D81F6CBFA8A1F4523DBC6F442DCB3DB86CB6F3.
- App PID37892, padre cargo10892, creata18:48:01.712; servizio26500, padre37892, creata18:48:03.953, porta64154, nuova worktree/native/llama-server.exe.
- BACKGROUND_START_BEGIN18:48:02.188; SERVICE_START18:48:18.740 elapsed16127; BACKGROUND_START_SUCCESS18:48:18.741 elapsed16553. Nessun secondo processo osservato dal monitor.
- Primo snapshot finestra precede apertura vault, quindi la domanda nei primissimi secondi NON è stata eseguita in questa istanza. Non etichettare la prima domanda come precoce.
- Apertura vault click18:48:38.269–42.832; catalogo modificato18:48:45.207 e18:48:52.356. Delta soltanto revision121→122→123 e lastUpdatedAt.
- Domanda pronta click18:49:22.469, risposta/log18:49:24.009; preview1199ms, servizio1ms, embed111ms, sem37ms, ammissione7ms; UI1286ms;8fonti. POST embeddings200 documentato nel log perrun righe182 e190 (validazione + domanda).
- Catalogo hash3024CD91085641729BAA1618CBD7DA7E5F8C8B1D88DD6AD0644E7689C39DFE08 identico prima/dopo domanda.
- N5 20→20, rimosso llama-server_20260924T090904Z_3588.log, aggiunto llama-server_20260924T104804Z_26500.log.
- N7 idle senza input UI iniziato18:50:21.041: non terminare prima18:55:21.041.
- Snapshot C01_N5_after incompleto: Get-FileHash non poteva aprire log in scrittura. capture_case.ps1 corretto con FileShare.ReadWrite|Delete; snapshot completo C01_N5_after_retry. Nessuna interruzione del servizio per leggere i log.

## Correlazione N7 da includere

App.tsx handleOpenExistingVault invoca ipc.open (open_vault in main.rs:95–110), poi refreshCatalog (App.tsx:462), che invoca syncCatalog (232), corrispondente a main.rs catalog_sync:635–642 → sync_catalog_from_vault. Entrambe le sincronizzazioni portano a catalog.rs:875 save_catalog. Il delta osservato è coerente con questi due salvataggi. Mancando stack trace della scrittura, attribuzione per singola chiamata è inferenza dal flusso e dagli orari.

AutomationScheduler::tick ha chiamanti trovati solo nei test. Frontend useAutomation usa un proprio tick/setTimeout15000ms in AutomationPanel.tsx:11–14, che chiama automation_status e, se config.enabled, automation_run. Non confondere i due tick.
