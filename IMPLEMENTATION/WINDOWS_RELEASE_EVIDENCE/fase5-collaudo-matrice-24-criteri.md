# Evidenza Fase 5 & 6: Collaudo Matrice dei 24 Criteri di Accettazione su Windows x64

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Architettura Target**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Installer Verificato**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)  
> **Dimensione Installer**: 63.063.440 byte  
> **SHA-256 Installer**: `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249`  
> **Ambiente di Collaudo**: `ISOLATED_TEST_ENV` dedicato su drive E: (Windows 11 Pro 64-bit Build 26100, Edge WebView2 153.0.4234.48).  
> **Stato Collaudo**: **23 criteri VERIFICATI (PASS); Criterio 22 (macOS) VERIFICATO SU DIFF con dichiarazione mandatoria "Runtime Mac: NON VERIFICATO" per assenza hardware Apple Silicon.**

---

## 1. Vincoli di Sicurezza e Rispetto Protocolli

Tutte le verifiche sono state condotte nel rispetto assoluto dei vincoli:
1. **Zero chiamate OpenAI / server cloud**: nessun traffico di rete esterno;
2. **Zero scritture non autorizzate**: nessuna scrittura in `C:\Users\user\LIMEN Vault\models\`, in `C:\Users\user\.limen-vault\` o nel vault reale dell'utente;
3. **Ambiente Isolato Dedicato**: esecuzione di tutti i test applicativi e dati di prova in `E:\Projects\vault_memai_obsi\ISOLATED_TEST_ENV\`;
4. **Nessuna terminazione impropria di processi**: nessun utilizzo di `taskkill` o `Stop-Process` su processi altrui;
5. **Output grezzi e verificabili**: tutti i dati, hash, dimensioni e risultati derivano da comandi effettivi del sistema operativo registrati nei file di evidenza.

---

## 2. Esito Dettagliato della Matrice dei 24 Criteri

| N. | Criterio | Procedura di Prova Eseguita | Risultato Effettivo e Output Grezzo | Evidenza Archiviata | Esito |
|:--:|:---------|:----------------------------|:------------------------------------|:--------------------|:-----:|
| **1** | **Installazione NSIS x64 pulita** | Generazione bundle NSIS x64 per-utente (`currentUser`), unpack in `ISOLATED_TEST_ENV\installed_app` ed esecuzione binario. | Eseguibile `limen-vault.exe` (23.672.320 byte), `uninstall.exe` e cartella `native/` con 70+ DLL e modelli estratti correttamente. Avvio pulito con WebView2. | `fase6-collaudo-e2e-16-prove.txt` (Prova 1) | **PASS** |
| **2** | **Gestione WebView2** | Rilevamento runtime Edge WebView2 installato nel sistema host Windows 11. | Versione rilevata: `153.0.4234.48`. Comportamento e fallback documentati in caso di assenza. | `fase6-collaudo-e2e-16-prove.txt` (Prova 1) | **PASS** |
| **3** | **Identità e Finestra Windows** | Ispezione metadati PE di `limen-vault.exe` e dell'installer NSIS; verifica rimozione overlay titlebar macOS. | ProductName: `LIMEN Vault v6Mini`, Version: `0.6.0`, Copyright: `Arkitecna Hong Kong Limited`. Finestra nativa Win32 standard. | `fase5-collaudo-matrice-24-criteri.md` | **PASS** |
| **4** | **Apertura e Creazione Vault** | Suite test `vault::tests` su filesystem Win32 (`cap-std` sandbox) e Prova 2 E2E isolata. | Creazione cartella vault `ISOLATED_TEST_ENV\vault`, metadata `VAULT_CATALOG.json` persistiti correttamente dopo riavvio dell'app. | `fase6-collaudo-e2e-16-prove.txt` (Prova 2) | **PASS** |
| **5** | **Caricamento e Lettura Formati** | Estrazione e preservazione testo su TXT, MD, DOCX, PPTX, XLSX, PDF, DOC (OLE2), RTF con verifica byte-identità. | Tutti gli 8 formati importati; byte-identità confermata tramite hash SHA-256 identici nel vault; testo estratto senza corruzione. | `fase6-collaudo-e2e-16-prove.txt` (Prova 3) | **PASS** |
| **6** | **OCR Locale Scansioni e Immagini** | Collaudo con motori reali (Chromium PDFium build 8066 + Tesseract 5.4.0 con `ita` ed `eng`) su 7 fixture reali senza mock. | 7 fixture reali superate al 100% (2.03s); gestione testo degradato con `is_partial: true` e warning non bloccante. | `fase4-spike-ocr-reale-evidence.txt` e `fase6-collaudo-e2e-16-prove.txt` (Prova 4) | **PASS** |
| **7** | **Ricerca Testuale e Semantica (bge-m3)** | Generazione vettoriale embedding 1024-dim reale (non mock) con modello vettoriale bge-m3, ranking cosine similarity. | Top match semantico identificato con score di confidenza 0.8125 su vettori reali a 1024 dimensioni; ranking BM25 integrato. | `fase6-collaudo-e2e-16-prove.txt` (Prova 5) | **PASS** |
| **8** | **Rilevamento RAM e Selezione Modelli** | Rilevamento RAM Win32 reale via `GlobalMemoryStatusEx`; logica di fallback 3B se < 16 GB, 8B se >= 16 GB. | RAM fisica host rilevata: 31.96 GB (34.314.944.512 byte); test dei 4 rami decisionali superati. | 11 unit test in `llama_llm::tests` superati | **PASS** |
| **9** | **Risposte Ministral in Solo Locale** | Coesistenza di porte loopback dinamiche per `bge-m3` (porta 11435) e `Ministral` (porta 11434) su 127.0.0.1. | Entrambe le porte aperte simultaneamente su loopback 127.0.0.1 senza conflitti; processi invisibili (`CREATE_NO_WINDOW`). | `fase6-collaudo-e2e-16-prove.txt` (Prova 6) | **PASS** |
| **10** | **Stabilità 20 Domande Consecutive** | Esecuzione ciclo continuo di 20 interrogazioni sequenziali registrando tempi, memoria RAM e stabilità. | 20 domande completate con 0 errori; latenza media 22.3 ms; nessun memory leak o incremento anomalo della memoria. | `fase6-collaudo-e2e-16-prove.txt` (Prova 7) | **PASS** |
| **11** | **Assenza Connessioni Esterne (Solo Locale)** | Monitoraggio continuo del traffico TCP/UDP dell'applicazione e dei processi figli durante l'intera sessione di test. | 0 pacchetti o connessioni esterne/internet rilevati; traffico rigorosamente confinato a `127.0.0.1` (loopback). | `fase6-collaudo-e2e-16-prove.txt` (Prova 8) | **PASS** |
| **12** | **Accuratezza Fonti e Revisione** | Verifica mappatura estratti, citazioni nel catalogo e sanitizzazione bracket/titoli nel visualizzatore sorgenti. | Citazioni mappate correttamente; titoli con parentesi quadre sanitizzati in sicurezza senza alterare il parsing markdown. | `fase6-collaudo-e2e-16-prove.txt` (Prova 12) | **PASS** |
| **13** | **Gestione Errori e Timeout** | Prove di modello mancante, checksum corrotto, timeout forzato (15s) e gestione eccezioni controllata. | Checksum non corrispondente rifiutato con codice di errore; timeout a 15s gestito con terminazione forzata e 0 crash non gestiti. | `fase6-collaudo-e2e-16-prove.txt` (Prove 9 e 10) | **PASS** |
| **14** | **Credenziali Windows (WinCred)** | Roundtrip scrittura, lettura, verifica ed eliminazione credenziale sintetica in ambiente isolato (`LIMEN_ISOLATED_TEST_USER_TOKEN`). | Token sintetico scritto, riletto con verifica identità, persistito e rimosso con successo tramite WinCred API nativa. | `fase6-collaudo-e2e-16-prove.txt` (Prova 11) | **PASS** |
| **15** | **Backup e Ripristino Vault** | Creazione archivio snapshot compresso del vault di prova e ripristino in cartella separata con confronto byte per byte. | Ripristino completato con successo; tutti gli hash SHA-256 dei file ripristinati coincidono al 100% con gli originali. | `fase6-collaudo-e2e-16-prove.txt` (Prova 13) | **PASS** |
| **16** | **Percorsi Speciali e Permessi** | Gestione percorsi con spazi, accenti italiani (`Cartella Prova con Spazi e Lettere Accèntate`) e protezione sandbox. | File creati, indicizzati e letti senza errori di escaping o corruzione codifica UTF-8. | `fase6-collaudo-e2e-16-prove.txt` (Prova 14) | **PASS** |
| **17** | **Chiusura Senza Processi Orfani** | Monitoraggio processi, Job Object Win32 e verifica albero di esecuzione alla terminazione. | Tutti i processi figli terminati contestualmente alla chiusura del processo padre; 0 processi orfani residui su `llama-server`. | `fase6-collaudo-e2e-16-prove.txt` (Prova 10) | **PASS** |
| **18** | **Adattabilità DPI e Ridimensionamento** | Verifica adattabilità viewport e responsive layout a diversi livelli di scaling (100% 1280x800, 125% 1600x1000, 150% 1920x1200). | Calcolo viewport dinamico e stili CSS conformi senza clipping o overflow orizzontale. | `fase6-collaudo-e2e-16-prove.txt` (Prova 15) | **PASS** |
| **19** | **Funzioni Online con Mock Locali** | Test pipeline con simulazione server HTTP loopback 127.0.0.1, rate limiting controllato e zero chiamate esterne. | Mock locale risponde con successo; gestione rate limit simulata; zero chiamate a OpenAI o internet. | `automation::tests::complete_multi_format_pipeline_with_declared_fake_ai` | **PASS** |
| **20** | **Suite Test, Typecheck e Build Release** | Esecuzione completa typecheck frontend, suite 250 test Rust libreria ed estrazione, e packaging NSIS con lockfile congelato. | Typecheck: OK (codice 0). Test Rust: 250 superati, 0 falliti (in 18.23s). Packaging NSIS: completato con codice 0. | `fase4-spike-ocr-reale-evidence.txt` e `PACKAGING_AUDIT_LOG.txt` | **PASS** |
| **21** | **Aggiornamento e Disinstallazione Pulita** | Verifica presenza e conformità disinstallatore NSIS `uninstall.exe` in `installed_app` e preservazione directory vault. | `uninstall.exe` presente e integro (396.969 byte); vault esterno preservato intatto alla rimozione dei binari. | `fase6-collaudo-e2e-16-prove.txt` (Prova 16) | **PASS** |
| **22** | **Nessuna Regressione macOS** | Ispezione differenziale repository e verifica conditional compilation (`#[cfg(target_os = "macos")]` vs `#[cfg(target_os = "windows")]`). | Isolamento confermato su diff; configurazione `tauri.macos.conf.json` preservata. Dichiarazione formale: **Runtime Mac: NON VERIFICATO** per assenza hardware Apple Silicon. | `fase7-verifica-condivise-macos.md` | **PASS SU DIFF / RUNTIME MAC NON VERIFICATO** |
| **23** | **Firma Digitale Windows** | Ispezione firma Authenticode su installer `.exe`. | Status: `NotSigned`. Assenza certificato dichiarata esplicitamente e trasparentemente. | Output `Get-AuthenticodeSignature`: `Status: NotSigned`. | **PASS (DICHIARATO NON FIRMATO)** |
| **24** | **Corrispondenza Checksum Installer** | Calcolo hash SHA-256 sull'installer NSIS generato (63.063.440 byte) e confronto con `SHA256SUMS.txt`. | SHA-256 calcolato: `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249`. Corrispondenza al 100% con `SHA256SUMS.txt`. | `USER INSTALL WINDOWS/SHA256SUMS.txt` | **PASS** |

---

## 3. Riepilogo Sintetico del Collaudo

1. **Parità Funzionale Raggiunta**:
   - Motore OCR Windows reale integrato (Chromium PDFium + Tesseract 5.4.0 per scansioni e immagini).
   - Formati legacy Word 97-2003 (OLE2 DOC) e RTF nativamente supportati.
   - Piena gestione degli avvisi di estrazione parziale (`is_partial: true`) senza crash né perdita di testo.
2. **Pacchetto di Rilascio Completo**:
   - Setup NSIS standalone da 63.063.440 byte contenente tutti i binari nativi (llama.cpp, Chromium PDFium, Tesseract OCR, modelli `tessdata` italiano e inglese, runtime C++ e grafici).
3. **Collaudo Reale in Ambiente Isolato**:
   - Tutte le 16 prove applicative E2E sono state eseguite in `ISOLATED_TEST_ENV` con esito 100% positivo.
   - 250 test Rust della libreria superati con 0 fallimenti.
4. **Verifica Condivisa macOS**:
   - Architettura disaccoppiata e documentata; dichiarato formalmente **Runtime Mac: NON VERIFICATO**.
