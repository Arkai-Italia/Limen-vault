# Rettifica Formale Collaudo E2E (Fase 6)

> **Riferimento Log Storico**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt)  
> **Nuovo Censimento Veritiero**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt)  
> **Data Rettifica**: 29 settembre 2026  
> **Stato Formale Effettivo**:  
> **Componenti OCR e alcune operazioni native provati separatamente. Collaudo dell’app installata non dimostrato. Isolamento del profilo non realizzato. Parità e accettazione aperte.**

---

## 1. Motivazione e Oggetto della Rettifica

A seguito dell'audit indipendente condotto da Codex e Cesare, viene formalmente respinta la conclusione "16 prove applicative reali superate" e l'attestazione "100% PASS" precedentemente registrata nel file `fase6-collaudo-e2e-16-prove.txt`.

Lo script `scripts/collaudo_e2e_isolated.ps1` conteneva:
1. Un riepilogo finale fisso (`ESITO COMPLESSIVO COLLAUDO E2E: 16 PROVE SUPERATE SU 16 (0 FAIL)`) aggiunto incondizionatamente;
2. Un hash dell'installer hardcoded anziché calcolato dinamicamente;
3. Simulazioni via script PowerShell (es. generazione token GUID e calcolo hash SHA-256 scambiati per inferenza di 20 domande con Ministral; creazione manuale di cartelle scambiata per creazione vault via app; `Copy-Item` scambiato per importazione LIMEN);
4. Una falsa dichiarazione di isolamento di profilo (l'esecuzione è avvenuta interamente sotto l'account `user`; l'uso del parametro `/user:isolated_user` nel comando `cmdkey` imposta solo il target della credenziale ma non esegue il comando come un altro account);
5. L'uso indebito di `Stop-Process` su processi figli, in contrasto con le regole di progetto;
6. Una rappresentazione ottimistica dell'output OCR, il quale riporta invece difetti ortografici reali ("Riconescimento", "Aocentt", assenza di accenti).

Il file storico `fase6-collaudo-e2e-16-prove.txt` viene **preservato integralmente** come traccia storica dell'esecuzione e non viene cancellato retroattivamente. La presente rettifica ne ridefinisce il valore probatorio.

---

## 2. Quadro Comparativo: Dichiarato vs Reale Eseguito

| Prova | Dichiarazione Precedente (Respinta) | Cosa Esegue Realmente | Stato Corretto |
|---|---|---|:---:|
| **01 — Installazione & WebView2** | Applicazione installata e avviata dal Menu Start con WebView2 | Controlla la presenza dei binari nello staging e legge la chiave di registro WebView2. Nessun avvio interattivo. | **NON ESEGUITO APPLICATIVO** |
| **02 — Creazione Vault** | Vault creato, chiuso e riaperto nell'applicazione | Crea cartelle e file JSON con PowerShell, poi li rilegge. L'app non viene esercitata. | **NON ESEGUITO APPLICATIVO** |
| **03 — Importazione Formati** | 8 formati importati attraverso LIMEN con byte-identità | Copia file dalle fixture con `Copy-Item` e ne confronta l'hash. Nessuna ingestion applicativa. | **NON ESEGUITO APPLICATIVO** |
| **04 — OCR Reale** | Riconoscimento perfetto di testo italiano con accenti e gestione DOCX degradato | Esegue `tesseract.exe` da CLI su PNG. L'output reale grezzo presenta imperfezioni ("Riconescimento", "Aocentt"). Nessun test su UI. | **PASS_COMPONENTE** (con imperfezioni censite) |
| **05 — Ricerca Semantica** | Ricerca semantica integrata in LIMEN | Richiesta HTTP standalone a bge-m3 su porta loopback. Nessuna indicizzazione o ricerca via app. | **NON ESEGUITO APPLICATIVO** |
| **06 — Coesistenza Porte** | Avvio simultaneo bge-m3 e Ministral con pesi reali | Apre due `TcpListener` su loopback. Nessun modello LLM o server avviato simultaneamente. | **NON ESEGUITO APPLICATIVO** |
| **07 — 20 Domande Consecutive** | 20 domande risposte da Ministral con RAM stabile e 0 errori | Genera GUID casuali e ne calcola l'hash SHA-256. Nessuna domanda inviata a Ministral. | **NON ESEGUITO APPLICATIVO** |
| **08 — Monitoraggio Rete** | 0 pacchetti esterni durante l'uso di LIMEN e figli | Ispeziona le porte in ascolto locali. Nessun monitoraggio del traffico durante l'esecuzione attiva dell'app. | **NON ESEGUITO APPLICATIVO** |
| **09 — Modello Corrotto** | Modello corrotto rifiutato con codice di errore dall'app | Crea un file fittizio e verifica che sia < 1 MB. Nessuna routine di validazione dell'app invocata. | **NON ESEGUITO APPLICATIVO** |
| **10 — Timeout e Orfani** | Chiusura controllata e assenza processi orfani via Job Object | Verifica se vi sono processi `llama-server` attivi in quel momento. Nessun timeout provocato. | **NON ESEGUITO APPLICATIVO** |
| **11 — Credenziali WinCred** | Roundtrip credenziale sintetica in ambiente isolato | Esegue `cmdkey` sotto l'account `user`. Nessun profilo OS Windows isolato o VM configurati. | **BLOCCATO** (Manca profilo/VM) |
| **12 — Fonti & Citazioni** | Citazioni conformi e consultabili nel lettore | Rimuove riferimenti da una stringa tramite regex. Nessuna verifica nel visualizzatore dell'app. | **NON ESEGUITO APPLICATIVO** |
| **13 — Snapshot Vault** | Snapshot e restore eseguiti con le funzioni dell'app | Esegue `Compress-Archive` ed `Expand-Archive`. Nessuna chiamata alle funzioni LIMEN. | **NON ESEGUITO APPLICATIVO** |
| **14 — Percorsi Speciali** | App testata su percorsi con spazi e accenti | Scrive e legge un file con PowerShell. Nessun esercizio dell'applicazione. | **NON ESEGUITO APPLICATIVO** |
| **15 — Adattabilità DPI** | Test visivo a 100%, 125%, 150% superato | Verifica statica di `index.css` via regex; nessun test visivo interattivo. | **NON ESEGUITO** (Richiede GUI) |
| **16 — Ciclo di Vita** | Disinstallazione e conservazione dati verificata | Verifica l'esistenza del file `uninstall.exe`. Nessuna disinstallazione reale eseguita. | **NON ESEGUITO APPLICATIVO** |

---

## 3. Riepilogo Dinamico del Censimento Effettivo

- **Prove di Componente Eseguite con Successo (PASS_COMPONENTE)**: 1 (Invocazione autonoma Tesseract 5.4.0 da linea di comando)
- **Prove Applicative E2E Non Eseguite (NON_ESEGUITO_APPLICATIVO)**: 14
- **Prove Bloccate per Assenza Prerequisiti OS (BLOCCATO)**: 1 (Profilo utente Windows isolato per WinCred non configurato)
- **Prove Fallite (FAIL)**: 0

### Conclusione
Il collaudo dell'applicazione installata **NON È DIMOSTRATO**.  
L'isolamento del profilo Windows **NON È STATO REALIZZATO**.  
I test a livello di codice Rust (250 unit test superati), i binari nativi (Chromium PDFium e Tesseract 5.4.0) e l'installer NSIS (63 MB, SHA-256 `222472...85249`) costituiscono la base tecnica reale, ma la parità funzionale certificata e l'accettazione rimangono **formalmente aperte**.
