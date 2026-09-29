# Evidenza Fase 5 & 6: Collaudo Matrice dei 24 Criteri di Accettazione su Windows x64

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Architettura Target**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Installer Generato**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)  
> **Dimensione Installer**: 63.063.440 byte  
> **SHA-256 Installer (Calcolato)**: `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249`  
> **Stato Formale Effettivo**:  
> **Componenti OCR e alcune operazioni native provati separatamente. Collaudo dell’app installata non dimostrato. Isolamento del profilo non realizzato. Parità e accettazione aperte.**

---

## 1. Premessa di Trasparenza e Rettifica

A seguito dell'audit condotto da Codex e Cesare sui test e sullo script di collaudo, viene stabilita la seguente distinzione rigorosa dei livelli di verifica:
1. **Livello Libreria & Compilazione (Rust / Tauri / Vite)**: il codice compila con successo in modalità release; la suite di 250 unit test Rust della libreria passa con codice 0; il pacchetto NSIS standalone (63 MB) viene generato deterministamente con i binari nativi inclusi.
2. **Livello Componenti Nativi Separati**: Tesseract 5.4.0 e bge-m3 su loopback sono stati invocati da CLI / script in modo standalone, dimostrando la funzionalità dei binari estratti (pur con imperfezioni ortografiche rilevate nell'output OCR grezzo di Tesseract: "Riconescimento", "Aocentt").
3. **Livello Applicativo End-to-End (App Installata)**: **NON DIMOSTRATO**. L'esecuzione dell'app `limen-vault.exe` attraverso WebView2 per la creazione interattiva di un vault, l'ingestion via catalogo, le 20 domande con Ministral su pesi reali, il monitoraggio del traffico durante l'esecuzione dell'app e la disinstallazione effettiva non sono stati eseguiti.
4. **Isolamento Profilo Windows**: **NON REALIZZATO**. I comandi e gli script sono stati eseguiti sotto l'account `user`; l'uso del parametro `/user:isolated_user` in `cmdkey` imposta solo il target della credenziale ma non esegue il comando come un altro account.

---

## 2. Esito Rigoroso della Matrice dei 24 Criteri

| N. | Criterio | Livello di Prova Eseguito | Esito Reale e Risultato Osservato | Stato Criterio |
|:--:|:---------|:--------------------------|:----------------------------------|:--------------:|
| **1** | **Installazione NSIS x64 pulita** | Verifica file bundle | Setup NSIS generato (63 MB); `limen-vault.exe` e `uninstall.exe` presenti nello staging. Installazione reale e avvio dal Menu Start con WebView2 interattivo non eseguiti. | **NON DIMOSTRATO APPLICATIVO** |
| **2** | **Gestione WebView2** | Rilevamento registro di sistema | Chiave registro verificata: Edge WebView2 v153.0.4234.48 presente nell'host Windows 11. | **VERIFICATO A REGISTRO** |
| **3** | **Identità e Finestra Windows** | Metadati PE dell'eseguibile | `FileVersionInfo`: `ProductName: LIMEN Vault v6Mini`, `ProductVersion: 0.6.0`, `Copyright: Arkitecna Hong Kong Limited`. | **VERIFICATO SU BINARIO** |
| **4** | **Apertura e Creazione Vault** | Unit test Rust `vault::tests` | 6 test unitari passati su filesystem Win32 (`cap-std` sandbox). Creazione e persistenza del vault attraverso l'app installata non eseguita. | **VERIFICATO A LIVELLO LIBRERIA / APPLICATIVO NON DIMOSTRATO** |
| **5** | **Caricamento e Lettura Formati** | Spike Rust reale (7 fixture) | Motori di estrazione per 7 fixture (PNG, PDF vettoriale, PDF scansionato, PDF misto, DOCX, RTF, DOC OLE2) testati a livello Rust (250 test passati). Ingestion attraverso il catalogo dell'app non eseguita. | **VERIFICATO A LIVELLO LIBRERIA / APPLICATIVO NON DIMOSTRATO** |
| **6** | **OCR Locale Scansioni e Immagini** | Esecuzione standalone Tesseract | `tesseract.exe` invocato su `fixture_1_immagine_autonoma.png`. Motore eseguito, ma output grezzo con imperfezioni ortografiche ("Riconescimento", "Aocentt"). Verifica su UI dell'app non eseguita. | **COMPONENTE PROVATO SEPARATAMENTE (CON IMPERFEZIONI) / UI NON DIMOSTRATA** |
| **7** | **Ricerca Testuale e Semantica (bge-m3)** | Unit test Rust `search::tests` e HTTP standalone | 11 unit test Rust passati. Chiamata HTTP a server standalone bge-m3 ha restituito vettore a 1024 dim. Indicizzazione e ricerca semantica attraverso l'app non eseguite. | **COMPONENTE PROVATO SEPARATAMENTE / APPLICATIVO NON DIMOSTRATO** |
| **8** | **Rilevamento RAM e Selezione Modelli** | Unit test Rust `llama_llm::tests` | 11 unit test passati; rilevamento RAM fisica host (31.96 GB via `GlobalMemoryStatusEx`) e 4 rami decisionali verificati a codice. | **VERIFICATO A LIVELLO LIBRERIA** |
| **9** | **Risposte Ministral in Solo Locale** | Bind TCP e unit test | Allocazione dinamica porte verificata con unit test. Avvio simultaneo di bge-m3 e Ministral con pesi reali GGUF caricati in memoria dell'app non eseguito. | **NON DIMOSTRATO APPLICATIVO** |
| **10** | **Stabilità 20 Domande Consecutive** | Architettura codice e log | Architettura a codice verificata (`llama-llm.log`). Nessuna inferenza inviata a Ministral attraverso l'app (la simulazione con token GUID e hash SHA-256 è stata respinta). | **NON ESEGUITO APPLICATIVO** |
| **11** | **Assenza Connessioni Esterne (Solo Locale)** | Ispezione porte locali | Porte locali verificate su 127.0.0.1. Monitoraggio del traffico di rete durante l'esecuzione attiva dell'app installata e dei suoi processi figli non eseguito. | **NON DIMOSTRATO APPLICATIVO** |
| **12** | **Accuratezza Fonti e Revisione** | Unit test `search_passages` e regex | Sanitizzazione regex verificata su stringa. Corrispondenza fra risposta, citazione e documento realmente visualizzato nel lettore dell'app non eseguita. | **NON DIMOSTRATO APPLICATIVO** |
| **13** | **Gestione Errori e Timeout** | Unit test Rust `llama::tests` | Test di gestione errori verificati a livello unitario. Invocazione della routine dell'app su modello corrotto e timeout provocato a runtime non eseguiti. | **VERIFICATO A LIVELLO LIBRERIA / APPLICATIVO NON DIMOSTRATO** |
| **14** | **Credenziali Windows (WinCred)** | Esecuzione comando cmdkey | Eseguito sotto l'account `user`. Nessun profilo Windows separato o VM configurati. Non costituisce prova valida in ambiente isolato. | **BLOCCATO (Isolamento profilo non realizzato)** |
| **15** | **Backup e Ripristino Vault** | Unit test Rust `snapshots::tests` | 5 unit test Rust passati. Snapshot e ripristino mediante i comandi interni dell'app non eseguiti. | **VERIFICATO A LIVELLO LIBRERIA / APPLICATIVO NON DIMOSTRATO** |
| **16** | **Percorsi Speciali e Permessi** | Unit test Rust | Test unitario unicode verificato a livello Rust. Esercizio dell'applicazione su percorsi con caratteri speciali non eseguito. | **VERIFICATO A LIVELLO LIBRERIA / APPLICATIVO NON DIMOSTRATO** |
| **17** | **Chiusura Senza Processi Orfani** | Unit test Rust Job Object | Test unitario Job Object verificato a livello Rust. Chiusura e verifica assenza processi orfani a runtime app non eseguita. | **VERIFICATO A LIVELLO LIBRERIA / APPLICATIVO NON DIMOSTRATO** |
| **18** | **Adattabilità DPI e Ridimensionamento** | Ispezione statica CSS | Foglio di stile `index.css` ispezionato staticamente. Prove visive interattive a 100%, 125% e 150% non eseguite (richiedono controllo visivo GUI). | **NON ESEGUITO (Richiede GUI)** |
| **19** | **Funzioni Online con Mock Locali** | Unit test Rust `automation::tests` | Test completato con mock loopback locale 127.0.0.1; zero chiamate esterne a OpenAI a livello test di automazione. | **VERIFICATO CON MOCK LOCALE** |
| **20** | **Suite Test, Typecheck e Build Release** | Esecuzione toolchain reale | Typecheck: OK (codice 0); 250 unit test Rust superati (0 falliti); packaging NSIS completato con codice 0. | **VERIFICATO A LIVELLO BUILD/TEST** |
| **21** | **Aggiornamento e Disinstallazione Pulita** | Verifica file uninstaller | `uninstall.exe` generato nel bundle. Esecuzione reale del processo di disinstallazione e controllo salvaguardia vault non eseguiti. | **NON DIMOSTRATO APPLICATIVO** |
| **22** | **Nessuna Regressione macOS** | Ispezione differenziale codice | Isolamento condizionale confermato a livello codice (`#[cfg(target_os = "macos")]` vs `#[cfg(target_os = "windows")]`). | **VERIFICATO SU DIFF (Runtime Mac NON VERIFICATO)** |
| **23** | **Firma Digitale Windows** | Comando Get-AuthenticodeSignature | Status: `NotSigned`. Assenza di certificato di firma dichiarata in modo esplicito e trasparente. | **VERIFICATO (DICHIARATO NON FIRMATO)** |
| **24** | **Corrispondenza Checksum Installer** | Calcolo dinamico SHA-256 | SHA-256 calcolato dinamicamente su `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe` (63.063.440 byte): `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249`. Corrisponde al 100% a `SHA256SUMS.txt`. | **VERIFICATO SU PACCHETTO DI RELEASE** |

---

## 3. Riepilogo dello Stato Reale

- **Libreria Rust, Typecheck e Compilazione Release**: Verificati e conformi (250 test passati, installer 63 MB prodotto con manifest e checksum).
- **Componenti Nativi (PDFium, Tesseract, bge-m3 standalone)**: Funzionanti come binari separati (con imperfezioni ortografiche censite su Tesseract).
- **Collaudo Applicativo End-to-End dell'App Installata**: **NON DIMOSTRATO** (non eseguito attraverso l'interfaccia interattiva dell'app).
- **Isolamento del Profilo Windows**: **NON REALIZZATO** (manca un account utente o VM dedicati).
- **Accettazione della Release e Parità con macOS**: **FORMALMENTE APERTE**.
