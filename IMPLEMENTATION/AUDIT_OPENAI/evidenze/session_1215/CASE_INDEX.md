# Indice delle prove native — 24 settembre 2026

18 casi della matrice, ripetizione M03R e seconda esecuzione M10. Orari ISO con offset o UTC Z. I contenuti condivisi sono copie reali; i dump sono locali, acquisiti prima della terminazione del figlio. Le fonti dopo il rilascio di un blocco non erano visibili durante il blocco.

[Metodo e comandi](SESSION_METHOD.md) · [Metriche JSON](results_native.json) · [Postflight](postflight.json)

## E01 — e0afe10

SHA Git: `e0afe105507b592b6eb34c5c0eac24b77ba14264`; SHA256 exe: `4744963EE3895A5D14FBDB66BD20912317F4CC13001FDDF07C8C786021025145`.

[Stato prima](E01_before/state.json) · [Stato dopo](E01_after/state.json) · [UI testo](E01_ui.txt) · [UI immagine](E01_ui.jpg)
[E01_panel.txt](E01_panel.txt)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 41760 | 41656 | 2026-09-24T12:18:25.6639620+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 35380 | 12500 | 2026-09-24T12:20:48.2440400+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\limen-vault.exe` |

- `llama-server.pid`: prima `41760`; dopo `41760`.
- `llama-server.port`: prima `62361`; dopo `62361`.
- [Delta ask_timing](E01_ask_timing.log.delta.txt) · [Delta local_model_timing](E01_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M01 — e0afe10

SHA Git: `e0afe105507b592b6eb34c5c0eac24b77ba14264`; SHA256 exe: `4744963EE3895A5D14FBDB66BD20912317F4CC13001FDDF07C8C786021025145`.

[Stato prima](M01_before/state.json) · [Stato dopo](M01_after/state.json) · [UI testo](M01_ui.txt) · [UI immagine](M01_ui.jpg)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 35380 | 12500 | 2026-09-24T12:20:48.2440400+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 28060 | 35380 | 2026-09-24T12:24:09.6825270+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `28060`; dopo `28060`.
- `llama-server.port`: prima `57500`; dopo `57500`.
- [Delta ask_timing](M01_ask_timing.log.delta.txt) · [Delta local_model_timing](M01_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/d70f1c7b1d36f912-STEFANO APP.md` — Paragrafi 224-234, Paragrafi 235-243
- `20_RAW_SOURCES/4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode.md` — Paragrafi 6-11, Paragrafi 12-25
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4

## M02 — e0afe10

SHA Git: `e0afe105507b592b6eb34c5c0eac24b77ba14264`; SHA256 exe: `4744963EE3895A5D14FBDB66BD20912317F4CC13001FDDF07C8C786021025145`.

[Stato prima](M02_before/state.json) · [Stato dopo](M02_after/state.json) · [UI testo](M02_ui.txt) · [UI immagine](M02_ui.jpg)
[M02_panel.txt](M02_panel.txt)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 41760 | 41656 | 2026-09-24T12:18:25.6639620+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 35380 | 12500 | 2026-09-24T12:20:48.2440400+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 28060 | 35380 | 2026-09-24T12:24:09.6825270+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `28060`; dopo `28060`.
- `llama-server.port`: prima `57500`; dopo `57500`.
- [Delta ask_timing](M02_ask_timing.log.delta.txt) · [Delta local_model_timing](M02_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/d70f1c7b1d36f912-STEFANO APP.md` — Paragrafi 224-234, Paragrafi 235-243
- `20_RAW_SOURCES/4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode.md` — Paragrafi 6-11, Paragrafi 12-25
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4

## M03 — e0afe10

SHA Git: `e0afe105507b592b6eb34c5c0eac24b77ba14264`; SHA256 exe: `4744963EE3895A5D14FBDB66BD20912317F4CC13001FDDF07C8C786021025145`.

[Stato prima](M03_before/state.json) · [Stato dopo](M03_after/state.json) · [UI testo](M03_ui.txt) · [UI immagine](M03_ui.jpg)
[M03_panel.txt](M03_panel.txt)
[M03_recovered_ui.txt](M03_recovered_ui.txt)
[M03_threads.json](M03_threads.json)
[M03_process.dmp](M03_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 35380 | 12500 | 2026-09-24T12:20:48.2440400+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 43216 | 35380 | 2026-09-24T12:28:52.9725410+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `43216`; dopo `ASSENTE`.
- `llama-server.port`: prima `57446`; dopo `ASSENTE`.
- [Delta ask_timing](M03_ask_timing.log.delta.txt) · [Delta local_model_timing](M03_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M03R — e0afe10

SHA Git: `e0afe105507b592b6eb34c5c0eac24b77ba14264`; SHA256 exe: `4744963EE3895A5D14FBDB66BD20912317F4CC13001FDDF07C8C786021025145`.

[Stato prima](M03R_before/state.json) · [Stato dopo](M03R_after/state.json) · [UI testo](M03R_ui.txt) · [UI immagine](M03R_ui.jpg)
[M03R_panel.txt](M03R_panel.txt)
[M03R_recovered_ui.txt](M03R_recovered_ui.txt)
[M03R_backend.json](M03R_backend.json)
[M03R_threads.json](M03R_threads.json)
[M03R_process.dmp](M03R_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 34592 | 20092 | 2026-09-24T13:26:17.8233800+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 27016 | 34592 | 2026-09-24T13:27:16.2305370+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `27016`; dopo `ASSENTE`.
- `llama-server.port`: prima `61482`; dopo `ASSENTE`.
- [Delta ask_timing](M03R_ask_timing.log.delta.txt) · [Delta local_model_timing](M03R_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M04 — e0afe10

SHA Git: `e0afe105507b592b6eb34c5c0eac24b77ba14264`; SHA256 exe: `4744963EE3895A5D14FBDB66BD20912317F4CC13001FDDF07C8C786021025145`.

[Stato prima](M04_before/state.json) · [Stato dopo](M04_after/state.json) · [UI testo](M04_ui.txt) · [UI immagine](M04_ui.jpg)
[M04_panel.txt](M04_panel.txt)
[M04_recovered_ui.txt](M04_recovered_ui.txt)
[M04_backend.json](M04_backend.json)
[M04_threads.json](M04_threads.json)
[M04_process.dmp](M04_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 35380 | 12500 | 2026-09-24T12:20:48.2440400+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 13260 | 21896 | 2026-09-24T12:33:38.8296620+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 39204 | 35380 | 2026-09-24T12:34:56.6560440+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `39204`; dopo `ASSENTE`.
- `llama-server.port`: prima `54511`; dopo `ASSENTE`.
- [Delta ask_timing](M04_ask_timing.log.delta.txt) · [Delta local_model_timing](M04_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M05 — ef2532c

SHA Git: `ef2532ca700c712b4c68d25fd26324702dce0782`; SHA256 exe: `CA24FE5B2AB1C7DF4C1F23BC831F90086CE2CC94F1AFF930CABE74C8976C73A1`.

[Stato prima](M05_before/state.json) · [Stato dopo](M05_after/state.json) · [UI testo](M05_ui.txt) · [UI immagine](M05_ui.jpg)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 42180 | 36812 | 2026-09-24T12:55:56.8740760+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 30500 | 42180 | 2026-09-24T12:57:32.7008960+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `30500`; dopo `30500`.
- `llama-server.port`: prima `57558`; dopo `57558`.
- [Delta ask_timing](M05_ask_timing.log.delta.txt) · [Delta local_model_timing](M05_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/d70f1c7b1d36f912-STEFANO APP.md` — Paragrafi 224-234, Paragrafi 235-243
- `20_RAW_SOURCES/4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode.md` — Paragrafi 6-11, Paragrafi 12-25
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4

## M06 — ef2532c

SHA Git: `ef2532ca700c712b4c68d25fd26324702dce0782`; SHA256 exe: `CA24FE5B2AB1C7DF4C1F23BC831F90086CE2CC94F1AFF930CABE74C8976C73A1`.

[Stato prima](M06_before/state.json) · [Stato dopo](M06_after/state.json) · [UI testo](M06_ui.txt) · [UI immagine](M06_ui.jpg)
[M06_panel.txt](M06_panel.txt)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 19976 | 42304 | 2026-09-24T12:48:54.7332030+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 42180 | 36812 | 2026-09-24T12:55:56.8740760+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 30500 | 42180 | 2026-09-24T12:57:32.7008960+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `30500`; dopo `30500`.
- `llama-server.port`: prima `57558`; dopo `57558`.
- [Delta ask_timing](M06_ask_timing.log.delta.txt) · [Delta local_model_timing](M06_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/d70f1c7b1d36f912-STEFANO APP.md` — Paragrafi 224-234, Paragrafi 235-243
- `20_RAW_SOURCES/4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode.md` — Paragrafi 6-11, Paragrafi 12-25
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4

## M07 — ef2532c

SHA Git: `ef2532ca700c712b4c68d25fd26324702dce0782`; SHA256 exe: `CA24FE5B2AB1C7DF4C1F23BC831F90086CE2CC94F1AFF930CABE74C8976C73A1`.

[Stato prima](M07_before/state.json) · [Stato dopo](M07_after/state.json) · [UI testo](M07_ui.txt) · [UI immagine](M07_ui.jpg)
[M07_panel.txt](M07_panel.txt)
[M07_recovered_ui.txt](M07_recovered_ui.txt)
[M07_backend.json](M07_backend.json)
[M07_threads.json](M07_threads.json)
[M07_process.dmp](M07_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 42180 | 36812 | 2026-09-24T12:55:56.8740760+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 11952 | 42180 | 2026-09-24T13:00:28.7838270+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `11952`; dopo `ASSENTE`.
- `llama-server.port`: prima `61138`; dopo `ASSENTE`.
- [Delta ask_timing](M07_ask_timing.log.delta.txt) · [Delta local_model_timing](M07_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M08 — ef2532c

SHA Git: `ef2532ca700c712b4c68d25fd26324702dce0782`; SHA256 exe: `CA24FE5B2AB1C7DF4C1F23BC831F90086CE2CC94F1AFF930CABE74C8976C73A1`.

[Stato prima](M08_before/state.json) · [Stato dopo](M08_after/state.json) · [UI testo](M08_ui.txt) · [UI immagine](M08_ui.jpg)
[M08_panel.txt](M08_panel.txt)
[M08_recovered_ui.txt](M08_recovered_ui.txt)
[M08_backend.json](M08_backend.json)
[M08_threads.json](M08_threads.json)
[M08_process.dmp](M08_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 42180 | 36812 | 2026-09-24T12:55:56.8740760+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 33100 | 22036 | 2026-09-24T13:07:15.9713950+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 6904 | 42180 | 2026-09-24T13:07:57.3376160+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `6904`; dopo `ASSENTE`.
- `llama-server.port`: prima `60935`; dopo `ASSENTE`.
- [Delta ask_timing](M08_ask_timing.log.delta.txt) · [Delta local_model_timing](M08_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M09 — efa0cef

SHA Git: `efa0cefab5da83e8de3b3418a92285438c63fb36`; SHA256 exe: `F34A5D97F13E2651239BB2E38B094427423645CAB4F0EF8C03AA60F8FEC3A712`.

[Stato prima](M09_before/state.json) · [Stato dopo](M09_after/state.json) · [UI testo](M09_ui.txt) · [UI immagine](M09_ui.jpg)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 41388 | 20716 | 2026-09-24T13:13:52.7304100+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 19044 | 41388 | 2026-09-24T13:15:36.8507240+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `19044`; dopo `19044`.
- `llama-server.port`: prima `61890`; dopo `61890`.
- [Delta ask_timing](M09_ask_timing.log.delta.txt) · [Delta local_model_timing](M09_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- 32f2a4081d13410e-BNXT CRM
- a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA
- d70f1c7b1d36f912-STEFANO APP
- 4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode
- 5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10
- 957b10627e45aa38-_INDICE
- abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8
- 1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10

Metriche interne ND: il ramo di errore rete di efa0cef non aggiunge righe al registro. Non usare la precedente riga storica come risultato di questo caso.

## M10 — efa0cef

SHA Git: `efa0cefab5da83e8de3b3418a92285438c63fb36`; SHA256 exe: `F34A5D97F13E2651239BB2E38B094427423645CAB4F0EF8C03AA60F8FEC3A712`.

[Stato prima](M10_before/state.json) · [Stato dopo](M10_after/state.json) · [UI testo](M10_ui.txt) · [UI immagine](M10_ui.jpg)
[M10_panel.txt](M10_panel.txt)
[Seconda esecuzione UI](M10_repeat_ui.txt) · [Errore tecnico](M10_error_ui.txt)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 33100 | 22036 | 2026-09-24T13:07:15.9713950+08:00 | `E:\Projects\vault_memai_obsi_audit_ef2532c\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 41388 | 20716 | 2026-09-24T13:13:52.7304100+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 19044 | 41388 | 2026-09-24T13:15:36.8507240+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `19044`; dopo `19044`.
- `llama-server.port`: prima `61890`; dopo `61890`.
- [Delta ask_timing](M10_ask_timing.log.delta.txt) · [Delta local_model_timing](M10_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- 32f2a4081d13410e-BNXT CRM
- a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA
- d70f1c7b1d36f912-STEFANO APP
- 4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode
- 5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10
- 957b10627e45aa38-_INDICE
- abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8
- 1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10

Metriche interne ND: il ramo di errore rete di efa0cef non aggiunge righe al registro. Non usare la precedente riga storica come risultato di questo caso.

## M11 — efa0cef

SHA Git: `efa0cefab5da83e8de3b3418a92285438c63fb36`; SHA256 exe: `F34A5D97F13E2651239BB2E38B094427423645CAB4F0EF8C03AA60F8FEC3A712`.

[Stato prima](M11_before/state.json) · [Stato dopo](M11_after/state.json) · [UI testo](M11_ui.txt) · [UI immagine](M11_ui.jpg)
[M11_panel.txt](M11_panel.txt)
[M11_recovered_ui.txt](M11_recovered_ui.txt)
[M11_backend.json](M11_backend.json)
[M11_threads.json](M11_threads.json)
[M11_process.dmp](M11_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 41388 | 20716 | 2026-09-24T13:13:52.7304100+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 34716 | 41388 | 2026-09-24T13:19:12.9426550+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `34716`; dopo `ASSENTE`.
- `llama-server.port`: prima `49932`; dopo `ASSENTE`.
- [Delta ask_timing](M11_ask_timing.log.delta.txt) · [Delta local_model_timing](M11_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- 32f2a4081d13410e-BNXT CRM
- a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA
- 957b10627e45aa38-_INDICE
- 5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10
- 1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10
- abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8
- cb67beeece396682-2026-02-13 - Redesign UI home page macOS app
- c428eb949fc0201f-areas - packaging-in-italy
- 966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS
- e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026

Metriche interne ND: il ramo di errore rete di efa0cef non aggiunge righe al registro. Non usare la precedente riga storica come risultato di questo caso.

## M12 — efa0cef

SHA Git: `efa0cefab5da83e8de3b3418a92285438c63fb36`; SHA256 exe: `F34A5D97F13E2651239BB2E38B094427423645CAB4F0EF8C03AA60F8FEC3A712`.

[Stato prima](M12_before/state.json) · [Stato dopo](M12_after/state.json) · [UI testo](M12_ui.txt) · [UI immagine](M12_ui.jpg)
[M12_panel.txt](M12_panel.txt)
[M12_recovered_ui.txt](M12_recovered_ui.txt)
[M12_backend.json](M12_backend.json)
[M12_threads.json](M12_threads.json)
[M12_process.dmp](M12_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 41388 | 20716 | 2026-09-24T13:13:52.7304100+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 4736 | 16304 | 2026-09-24T13:22:04.8629650+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 28108 | 41388 | 2026-09-24T13:22:47.9855960+08:00 | `E:\Projects\vault_memai_obsi_audit_efa0cef\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `28108`; dopo `ASSENTE`.
- `llama-server.port`: prima `56224`; dopo `ASSENTE`.
- [Delta ask_timing](M12_ask_timing.log.delta.txt) · [Delta local_model_timing](M12_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- 32f2a4081d13410e-BNXT CRM
- a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA
- 957b10627e45aa38-_INDICE
- 5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10
- 1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10
- abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8
- cb67beeece396682-2026-02-13 - Redesign UI home page macOS app
- c428eb949fc0201f-areas - packaging-in-italy
- 966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS
- e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026

Metriche interne ND: il ramo di errore rete di efa0cef non aggiunge righe al registro. Non usare la precedente riga storica come risultato di questo caso.

## E02 — 67da90f

SHA Git: `67da90f5aeb4af6817f20b8e7f64a1de1daa3662`; SHA256 exe: `2FC44CC3722DA7B1472515D456F253AE5AAC1FCB17ACF37DC47CEF84ACB2EFEC`.

[Stato prima](E02_before/state.json) · [Stato dopo](E02_after/state.json) · [UI testo](E02_ui.txt) · [UI immagine](E02_ui.jpg)
[E02_panel.txt](E02_panel.txt)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 13260 | 21896 | 2026-09-24T12:33:38.8296620+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 7112 | 10956 | 2026-09-24T12:41:50.2161550+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\limen-vault.exe` |

- `llama-server.pid`: prima `13260`; dopo `13260`.
- `llama-server.port`: prima `51103`; dopo `51103`.
- [Delta ask_timing](E02_ask_timing.log.delta.txt) · [Delta local_model_timing](E02_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M13 — 67da90f

SHA Git: `67da90f5aeb4af6817f20b8e7f64a1de1daa3662`; SHA256 exe: `2FC44CC3722DA7B1472515D456F253AE5AAC1FCB17ACF37DC47CEF84ACB2EFEC`.

[Stato prima](M13_before/state.json) · [Stato dopo](M13_after/state.json) · [UI testo](M13_ui.txt) · [UI immagine](M13_ui.jpg)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 7112 | 10956 | 2026-09-24T12:41:50.2161550+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 26916 | 7112 | 2026-09-24T12:43:44.7808620+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `26916`; dopo `26916`.
- `llama-server.port`: prima `51018`; dopo `51018`.
- [Delta ask_timing](M13_ask_timing.log.delta.txt) · [Delta local_model_timing](M13_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/d70f1c7b1d36f912-STEFANO APP.md` — Paragrafi 224-234, Paragrafi 235-243
- `20_RAW_SOURCES/4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode.md` — Paragrafi 6-11, Paragrafi 12-25
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4

## M14 — 67da90f

SHA Git: `67da90f5aeb4af6817f20b8e7f64a1de1daa3662`; SHA256 exe: `2FC44CC3722DA7B1472515D456F253AE5AAC1FCB17ACF37DC47CEF84ACB2EFEC`.

[Stato prima](M14_before/state.json) · [Stato dopo](M14_after/state.json) · [UI testo](M14_ui.txt) · [UI immagine](M14_ui.jpg)
[M14_panel.txt](M14_panel.txt)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 13260 | 21896 | 2026-09-24T12:33:38.8296620+08:00 | `E:\Projects\vault_memai_obsi_audit_e0afe10\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 7112 | 10956 | 2026-09-24T12:41:50.2161550+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 26916 | 7112 | 2026-09-24T12:43:44.7808620+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\native\llama-server.exe` |

- `llama-server.pid`: prima `26916`; dopo `26916`.
- `llama-server.port`: prima `51018`; dopo `51018`.
- [Delta ask_timing](M14_ask_timing.log.delta.txt) · [Delta local_model_timing](M14_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 8. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/d70f1c7b1d36f912-STEFANO APP.md` — Paragrafi 224-234, Paragrafi 235-243
- `20_RAW_SOURCES/4245a51312c5c1f2-2026-04-07 - Workflow app iPhone nativa con Xcode.md` — Paragrafi 6-11, Paragrafi 12-25
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4

## M15 — 67da90f

SHA Git: `67da90f5aeb4af6817f20b8e7f64a1de1daa3662`; SHA256 exe: `2FC44CC3722DA7B1472515D456F253AE5AAC1FCB17ACF37DC47CEF84ACB2EFEC`.

[Stato prima](M15_before/state.json) · [Stato dopo](M15_after/state.json) · [UI testo](M15_ui.txt) · [UI immagine](M15_ui.jpg)
[M15_panel.txt](M15_panel.txt)
[M15_recovered_ui.txt](M15_recovered_ui.txt)
[M15_backend.json](M15_backend.json)
[M15_threads.json](M15_threads.json)
[M15_process.dmp](M15_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 7112 | 10956 | 2026-09-24T12:41:50.2161550+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 8776 | 7112 | 2026-09-24T12:46:18.2015790+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `8776`; dopo `ASSENTE`.
- `llama-server.port`: prima `65478`; dopo `ASSENTE`.
- [Delta ask_timing](M15_ask_timing.log.delta.txt) · [Delta local_model_timing](M15_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## M16 — 67da90f

SHA Git: `67da90f5aeb4af6817f20b8e7f64a1de1daa3662`; SHA256 exe: `2FC44CC3722DA7B1472515D456F253AE5AAC1FCB17ACF37DC47CEF84ACB2EFEC`.

[Stato prima](M16_before/state.json) · [Stato dopo](M16_after/state.json) · [UI testo](M16_ui.txt) · [UI immagine](M16_ui.jpg)
[M16_panel.txt](M16_panel.txt)
[M16_recovered_ui.txt](M16_recovered_ui.txt)
[M16_backend.json](M16_backend.json)
[M16_threads.json](M16_threads.json)
[M16_process.dmp](M16_process.dmp)

| PID | Parent | Avvio | Percorso |
|---|---|---|---|
| 7112 | 10956 | 2026-09-24T12:41:50.2161550+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\limen-vault.exe` |
| 19976 | 42304 | 2026-09-24T12:48:54.7332030+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\resources\native\llama-server.exe` |
| 41744 | 7112 | 2026-09-24T12:49:58.9272730+08:00 | `E:\Projects\vault_memai_obsi_audit_67da90f\apps\desktop\src-tauri\target\release\llama-server.exe` |

- `llama-server.pid`: prima `41744`; dopo `ASSENTE`.
- `llama-server.port`: prima `50981`; dopo `ASSENTE`.
- [Delta ask_timing](M16_ask_timing.log.delta.txt) · [Delta local_model_timing](M16_local_model_timing.log.delta.txt). Delta vuoto = nessuna nuova riga, non una misura a zero.

Fonti osservate: 10. Elenco dai metadati del registro o, per efa0cef, dai titoli presenti in UI:

- `20_RAW_SOURCES/32f2a4081d13410e-BNXT CRM.md` — Paragrafi 1-13, Paragrafi 52-68
- `20_RAW_SOURCES/a86061ba2701d614-_Progetto - BNXT AUDIT VICENZA.md` — Paragrafi 1-8
- `20_RAW_SOURCES/957b10627e45aa38-_INDICE.md` — Paragrafi 1-2
- `20_RAW_SOURCES/5a54c2ce2f581cf2-verifica-walkthrough-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/1e755ab82023a095-verifica-impl-plan-ux-email-whatsapp-2026-09-10.md` — Paragrafi 1-3, Paragrafo 4
- `20_RAW_SOURCES/abaef2b48c6e5b70-audit-localizzazione-EN-baseline-6f2f2b8.md` — Paragrafi 1-4, Paragrafo 5, Paragrafo 6
- `20_RAW_SOURCES/cb67beeece396682-2026-02-13 - Redesign UI home page macOS app.md` — Paragrafi 18-28, Paragrafi 29-42
- `20_RAW_SOURCES/c428eb949fc0201f-areas - packaging-in-italy.md` — Paragrafi 1-3
- `20_RAW_SOURCES/966ef623917316c7-2026-02-16 - Creazione file Localizable.strings per iOS.md` — Paragrafi 13-25, Paragrafo 133
- `20_RAW_SOURCES/e86a061e0f5becb0-_Progetto - Progetto senza nome 19-08-2026.md` — Paragrafi 1-8

## Dump e integrità

Nove dump: M03, M03R, M04, M07, M08, M11, M12, M15, M16. MiniDumpWriteDump 0x1002; nessuna analisi simbolica degli stack dichiarata. Gli hash di tutti gli allegati sono nel manifest ../SHA256SUMS.txt.
