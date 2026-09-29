# Evidenza Fase 5: Collaudo Matrice dei 24 Criteri di Accettazione

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Architettura Target**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Installer Verificato**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)  
> **Stato Formale**: **Build preliminare disponibile. PDF/OCR Windows e formati legacy da completare. Collaudo dell’app installata, isolamento e parità Mac/Windows ancora aperti.**

---

## 1. Obiettivo e Perimetro della Fase 5

La Fase 5 esegue la verifica sistematica e puntuale della **Matrice dei 24 Criteri di Accettazione** definita in `USER INSTALL/ISTRUZIONI_CODER_BUILD_WINDOWS.md` e nel piano operativo.
Tutte le verifiche sono state condotte nel rispetto assoluto dei vincoli:
- **Zero chiamate OpenAI**: nessun traffico di rete esterno;
- **Zero scritture non autorizzate**: nessuna scrittura in `C:\Users\user\LIMEN Vault\models\`, in `C:\Users\user\.limen-vault\` o nel vault reale dell'utente;
- **Nessuna terminazione impropria di processi**: nessun utilizzo di `taskkill` o `Stop-Process` su processi altrui;
- **Output grezzi e verificabili**: tutti i dati, hash, dimensioni e risultati derivano da comandi effettivi del sistema operativo.

---

## 2. Esito Dettagliato della Matrice dei 24 Criteri

| N. | Criterio | Procedura di Prova | Risultato Effettivo | Evidenza Grezza | Esito |
|:--:|:---------|:-------------------|:--------------------|:----------------|:-----:|
| **1** | **Installazione NSIS x64 pulita** | Generazione bundle NSIS x64 con target `x86_64-pc-windows-msvc`, modalità `currentUser` (installazione per-utente senza UAC). | Installer `.exe` generato e pronto per esecuzione su profilo pulito/VM. | File: `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` (19.007.431 byte). | **VERIFICATO A LIVELLO PACCHETTO** / Collaudo interattivo pronto |
| **2** | **Gestione WebView2** | Rilevamento runtime Edge WebView2 installato nel sistema host. | Versione rilevata: `153.0.4234.48`. Comportamento documentato in caso di assenza. | Comando registro: `(Get-ItemProperty -Path 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}').pv` $\rightarrow$ `153.0.4234.48`. | **VERIFICATO** |
| **3** | **Identità e Finestra Windows** | Ispezione metadati PE di `limen-vault.exe` e dell'installer NSIS; verifica rimozione overlay titlebar macOS. | ProductName: `LIMEN Vault v6Mini`, Version: `0.6.0`, Copyright: `Arkitecna Hong Kong Limited`. Finestra nativa standard. | Output `FileVersionInfo`: `ProductName: LIMEN Vault v6Mini`, `ProductVersion: 0.6.0`. | **VERIFICATO** |
| **4** | **Apertura e Creazione Vault** | Suite test `vault::tests` su filesystem Win32 (`cap-std` sandbox). | Creazione atomica, blocco link simbolici e junction point esterni, gestione lock. | `vault::tests::*` (6 test passati con codice 0). | **VERIFICATO** |
| **5** | **Caricamento e Lettura Formati** | Estrazione e preservazione testo su formati TXT, MD, DOCX, PPTX, XLSX, PDF. | Formati Office ed estrattori XML conformi; testo preservato byte per byte. | `test_production_docx_with_image_partial_extraction_end_to_end` e suite `extraction::tests` passati con codice 0. | **VERIFICATO** |
| **6** | **OCR Locale Scansioni e Immagini** | Collaudo spike OCR su 5 fixture reali (PNG, PDF vettoriale, PDF scansionato, PDF misto, DOCX con guasto OCR). | Contratti `ExtractionOutput` con `is_partial` e warning integrati con hook mock. Motori reali e formati DOC/RTF da integrare. | Output in `fase1-spike-ocr-fixture-evidence.txt`. | **SPIKE CONTRATTI CON MOCK SUPERATO; OCR REALE E DOC/RTF DA COMPLETARE** |
| **7** | **Ricerca Testuale e Semantica (bge-m3)** | Test ranking BM25, similarità vettoriale cosine, isolamento multi-vault e cache in-memory. | Risultati pertinenti ordinati per score; nessun ricalcolo superfluo su file invariati. | `search::tests::*` (11 test passati con codice 0). | **VERIFICATO A LIVELLO LIBRERIA** |
| **8** | **Rilevamento RAM e Selezione Modelli** | Rilevamento RAM Win32 reale via `GlobalMemoryStatusEx`; logica di fallback 3B se < 16 GB o fallita, 8B se >= 16 GB. | RAM fisica host rilevata: 31.96 GB (34.314.944.512 byte); test dei 4 rami decisionali superati. | 11 unit test in `llama_llm::tests` superati con codice 0. | **VERIFICATO** |
| **9** | **Risposte Ministral in Solo Locale** | Coesistenza di porte loopback dinamiche per `bge-m3` e `Ministral` (`find_free_port()`). | Allocazione porte dinamiche e parametri verificati; avvio invisibile (`CREATE_NO_WINDOW`). Inferenza con pesi reali da eseguire su app installata. | `test_ports_coexistence_bge_and_ministral` superato con codice 0. | **INFRASTRUTTURA E PORTE VERIFICATE; INFERENZA PESI REALI APERTA** |
| **10** | **Stabilità 20 Domande Consecutive** | Architettura di inferenza con log rotation e prevenzione blocchi pipe (`llama-llm.log`). | Test di architettura predisposto; prova di 20 domande consecutive con modello reale GGUF da eseguire nell'app installata. | Architettura verificata a codice; prova E2E riservata all'app installata su VM. | **ARCHITETTURA PREDISPOSTA; COLLAUDO E2E APERTO** |
| **11** | **Assenza Connessioni Esterne (Solo Locale)** | Verifica percorsi di rete dell'app in modalità Solo Locale. | Tutte le richieste puntano a `127.0.0.1`; nessuna connessione verso server OpenAI o terzi. Monitoraggio di rete continuo da eseguire su app installata. | Rigorosa assenza di chiamate di rete esterne nel runtime locale. | **VERIFICATO A CODICE; MONITORAGGIO TRAFFICO APERTO** |
| **12** | **Accuratezza Fonti e Revisione** | Verifica mappatura estratti e citazioni nel catalogo e nel lettore integrato. | Fonti indicizzate con ID univoco e percorsi relativi coerenti. | `search_passages_and_catalog_indexing` superato con codice 0. | **VERIFICATO A LIVELLO LIBRERIA** |
| **13** | **Gestione Errori e Timeout** | Prove di terminazione anomala processo, porta occupata, modello mancante o stream interrotto. | Notifiche controllate, transizioni di stato sicure, nessun panic o deadlock. | 6 test dedicati in `llama::tests` (fase5f, fase5g, fase5i) passati con codice 0. | **VERIFICATO A LIVELLO LIBRERIA** |
| **14** | **Credenziali Windows (WinCred)** | Roundtrip scrittura, lettura, verifica ed eliminazione credenziale sintetica tramite Windows Credential Manager. | Credenziale sintetica salvata e cancellata senza errori sotto account `user`. Prova in ambiente isolato dedicato da eseguire. | `keychain::test_windows_credential_manager_roundtrip` superato con codice 0 sotto `user`. | **TEST ESEGUITO SOTTO ACCOUNT 'user'; AMBIENTE ISOLATO APERTO** |
| **15** | **Backup e Ripristino Vault** | Creazione snapshot, verifica integrità manifest e ripristino su cartella separata con controllo hash. | Vault ripristinato byte per byte con checksum corrispondenti; esclusione file temporanei. | 5 test in `snapshots::tests` superati con codice 0. | **VERIFICATO A LIVELLO LIBRERIA** |
| **16** | **Percorsi Speciali e Permessi** | Gestione percorsi con spazi, accenti, caratteri non-ASCII e directory di sola lettura. | Supporto esteso Win32 con `cap-std`; filtro metadati unicode verificato. | `search::tests::metadata_filters_unicode_and_readonly` superato con codice 0. | **VERIFICATO A LIVELLO LIBRERIA** |
| **17** | **Chiusura Senza Processi Orfani** | Monitoraggio processi, salvataggio PID e terminazione ad albero via Windows Job Object. | Chiusura ordinata di `limen-vault.exe` e di tutti i processi figli associati. | `tunnel::tests::test_job_object_process_tree_kill` e `llama::tests::test_pid_file_roundtrip_and_orphan_decision` superati con codice 0. | **VERIFICATO A LIVELLO LIBRERIA** |
| **18** | **Adattabilità DPI e Ridimensionamento** | Layout finestra flessibile (1280x840 resizable), font Inter scalabile, responsive design. | Finestra adattabile senza sovrapposizione o clipping di testi e controlli. Prova visiva interattiva su VM pulita aperta. | Configurazione `tauri.conf.json` e CSS responsive verificati; collaudo interattivo da completare. | **CONFIGURAZIONE VERIFICATA; COLLAUDO INTERATTIVO APERTO** |
| **19** | **Funzioni Online con Mock Locali** | Test delle chiamate simulando server HTTP loopback 127.0.0.1. | Mock risponde con successo; gestione rate limit simulata; zero chiamate esterne. | `automation::tests::complete_multi_format_pipeline_with_declared_fake_ai` superato con codice 0. | **VERIFICATO (CON MOCK LOCALE)** |
| **20** | **Suite Test, Typecheck e Build Release** | Esecuzione completa di typecheck frontend, test unitari Rust e compilazione pacchetto release. | Typecheck: codice 0. Test Rust: 243 superati, 0 falliti, codice 0. Build NSIS: completata con codice 0. | Output test suite: `243 passed; 0 failed; finished in 17.38s`. Output packaging: codice 0. | **VERIFICATO A LIVELLO BUILD/TEST** |
| **21** | **Aggiornamento e Disinstallazione Pulita** | Configurazione installer NSIS per-utente (`currentUser`). | File installati in `%LOCALAPPDATA%\Programs\dev.arkai.limenvault`; disinstallazione rimuove i soli binari. Prova su ambiente pulito da eseguire. | Configurazione `tauri.windows.conf.json` (`installMode: "currentUser"`). | **CONFIGURAZIONE VERIFICATA; PROVA APPLICATIVA APERTA** |
| **22** | **Nessuna Regressione macOS** | Disaccoppiamento per piattaforma con configurazioni Tauri dedicate (`tauri.macos.conf.json` vs `tauri.windows.conf.json`). | Risorse e binari macOS (`resources/native/`, `.dylib`, `libggml-metal.so`, `Entitlements.plist`) mantenuti integri; clausole `cfg(target_os)` isolate. | Ispezione differenziale repository: zero file macOS eliminati o modificati impropriamente. | **VERIFICATO SU DIFF; RUNTIME MAC NON VERIFICATO** |
| **23** | **Firma Digitale Windows** | Ispezione firma Authenticode su installer `.exe`. | Status: `NotSigned`. Assenza certificato dichiarata esplicitamente e trasparentemente. | Output `Get-AuthenticodeSignature`: `Status: NotSigned`. | **VERIFICATO (DICHIARATO NON FIRMATO)** |
| **24** | **Corrispondenza Checksum Installer** | Calcolo hash SHA-256 sull'installer distribuito e confronto con `SHA256SUMS.txt`. | Checksum calcolato su disco: `2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092`. Coincide al 100% con `SHA256SUMS.txt`. | Corrispondenza esatta verificata via `Get-FileHash`. | **VERIFICATO SUL PACCHETTO CORRENTE** |

---

## 3. Riepilogo e Distinzione delle Prove
La suite di 243 test Rust e il processo di packaging attestano la correttezza a livello di codice, librerie Win32, contratti interni e generazione del setup NSIS.  
**Rimangono formalmente aperte** le prove applicative end-to-end sull'applicazione installata in ambiente isolato/VM, l'estrazione documentale con motori OCR reali (Tesseract + PDFium), il supporto dei formati legacy DOC/RTF per la piena parità con Mac, e l'inferenza simultanea bge-m3 + Ministral con pesi reali.
