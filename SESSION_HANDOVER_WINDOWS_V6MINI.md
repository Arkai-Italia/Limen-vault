# Session Handover: LIMEN Vault v6Mini — Stato Release e Rettifica Collaudo Windows

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch Git**: `windows-build`  
> **Stato Complessivo**: **Componenti OCR e alcune operazioni native provati separatamente. Collaudo dell’app installata non dimostrato. Isolamento del profilo non realizzato. Parità e accettazione aperte.**

---

## 1. Deliverables di Release e Documenti di Evidenza

* **Percorso Installer NSIS**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)
* **Dimensione**: **63.063.440 byte** (~58.4 MB)
* **Algoritmo & Checksum SHA-256 (Calcolato)**:
  ```
  222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249
  ```
* **File di Verifica Checksum**: [`USER INSTALL WINDOWS/SHA256SUMS.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/SHA256SUMS.txt)
* **Log di Packaging e Manifest Binari**: [`USER INSTALL WINDOWS/PACKAGING_AUDIT_LOG.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/PACKAGING_AUDIT_LOG.txt)
* **Guida Utente e Istruzioni Installazione**: [`USER INSTALL WINDOWS/LEGGIMI_WINDOWS.md`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LEGGIMI_WINDOWS.md)
* **Evidenze Collaudo Matrice 24 Criteri (Rettificata)**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md)
* **Rettifica Formale Collaudo E2E**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md)
* **Nuovo Censimento Effettivo Prove**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt)
* **Log Storico Precedente (Preservato per Tracciabilità)**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt)
* **Evidenze Spike OCR Reale (7 Fixture)**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-spike-ocr-reale-evidence.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-spike-ocr-reale-evidence.txt)
* **Verifica Condivise macOS**: [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase7-verifica-condivise-macos.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase7-verifica-condivise-macos.md)

---

## 2. Cronologia Commits e Avanzamento

| Commit Hash | Descrizione / Fase |
|:---:|:---|
| [`1f51de9`](file:///E:/Projects/vault_memai_obsi) | **Blocco 1**: Allineamento formale evidenze e documentazione di rilascio Windows. |
| [`f9b7f28`](file:///E:/Projects/vault_memai_obsi) | **Blocchi 3 & 4**: Implementazione motore estrazione Windows reale (PDFium, Tesseract 5.4.0, RTF, DOC OLE2) e spike reale su 7 fixture superato (250/250 test Rust). |
| [`1fc6432`](file:///E:/Projects/vault_memai_obsi) | **Blocco 5**: Completamento script di packaging riproducibile ed emissione installer 63MB con OCR completo. |
| [`a998377`](file:///E:/Projects/vault_memai_obsi) | **Blocco 6**: Esecuzione preliminare script isolato (successivamente sottoposto a rettifica su rilievo audit). |
| [`ebe122b`](file:///E:/Projects/vault_memai_obsi) | **Blocco 7**: Verifica modifiche condivise con macOS e attestazione mandatoria Runtime Mac NON VERIFICATO. |
| [`ea26ae2`](file:///E:/Projects/vault_memai_obsi) | **Blocco 8**: Consegna documentale preliminare (ora integrata con la presente rettifica). |

---

## 3. Riepilogo Tecnico e Limiti Accertati dall'Audit

1. **Libreria Rust e Compilazione Release**:
   - Compilazione release riuscita;
   - 250 unit test della libreria Rust superati con codice 0;
   - Installer NSIS completo da 63.063.440 byte generato con successo, includente binari llama.cpp, Chromium PDFium (build 8066), Tesseract 5.4.0 e modelli linguistici `ita` ed `eng`.

2. **Componenti Nativi Standalone**:
   - Invocazione autonoma da CLI di Tesseract 5.4.0 eseguita con successo su immagine PNG; l'output grezzo presenta imperfezioni ortografiche reali ("Riconescimento", "Aocentt", caratteri accentati omessi) che dimostrano l'esecuzione del motore ma non la correttezza perfetta del riconoscimento;
   - Richiesta HTTP su loopback a server bge-m3 verificata come test di componente.

3. **Collaudo Applicativo End-to-End**:
   - **NON DIMOSTRATO**. Le 16 prove dichiarate in precedenza consistevano prevalentemente in script PowerShell, controlli di presenza file o simulazioni (es. calcolo hash di GUID casuali al posto di query a Ministral, `Copy-Item` al posto dell'ingestion LIMEN, `Compress-Archive` al posto dello snapshot dell'app).
   - L'applicazione installata (`limen-vault.exe` / WebView2) non è stata esercitata in modo interattivo o automatizzato end-to-end.

4. **Isolamento del Profilo Windows**:
   - **NON REALIZZATO**. L'esecuzione è avvenuta interamente sotto l'account `user`; l'uso del parametro `/user:isolated_user` nel comando `cmdkey` imposta solo il target della credenziale ma non esegue il comando come un altro account. Manca un account utente o una VM dedicata.

---

## 4. Stato per Codex e Cesare

* **Per Codex (Auditor Indipendente)**:
  - Il quadro è stato integralmente rettificato in conformità all'audit: rimosse tutte le conclusioni di superamento incondizionato, archiviati i documenti di rettifica e censimento, eliminati i comandi impropri e calcolato dinamicamente l'hash dell'installer.
  - La documentazione rispecchia ora esattamente la distinzione tra test di libreria/componente (verificati) e collaudo applicativo/isolamento profilo (non dimostrati/bloccati).

* **Per Cesare (Project Owner)**:
  - La build release standalone con OCR integrato (63 MB) è fisicamente pronta e scaricabile da `USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`.
  - La certificazione formale della parità funzionale con Mac e l'accettazione rimangono aperte in attesa di un eventuale collaudo applicativo interattivo e della predisposizione dell'ambiente isolato a livello di sistema operativo.
