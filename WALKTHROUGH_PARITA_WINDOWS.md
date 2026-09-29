# Walkthrough: Rettifica e Stato Effettivo Release Windows v6Mini

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Architettura Target**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Data**: 29 settembre 2026  
> **Installer Generato**: [`USER INSTALL WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe)  
> **Dimensione**: 63.063.440 byte (58.4 MB)  
> **SHA-256 (Calcolato)**: `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249`  
> **Stato Formale Effettivo**:  
> **Componenti OCR e alcune operazioni native provati separatamente. Collaudo dell’app installata non dimostrato. Isolamento del profilo non realizzato. Parità e accettazione aperte.**

---

## 1. Azioni Eseguite e Rettifica dei Risultati

A seguito dell'audit indipendente di Codex e Cesare sul codice e sullo script di collaudo `scripts/collaudo_e2e_isolated.ps1`, sono state completate le seguenti azioni correttive:

1. **Eliminazione Conclusioni Invalidate**:
   - Rimosse da tutti i documenti le attestazioni "100%", "23 PASS" e "16 prove applicative reali superate".
   - Rimosso dallo script di collaudo il messaggio fisso `ESITO COMPLESSIVO COLLAUDO E2E: 16 PROVE SUPERATE SU 16 (0 FAIL)`.
   - Rimosso qualsiasi comando `Stop-Process` su processi altrui o llama-server.
   - Eliminati fallback arbitrari/inventati sulla presenza di WebView2.

2. **Rettifica Formale del Log Storico di Collaudo**:
   - Il log originale [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove.txt) è stato **preservato come traccia storica**.
   - È stato redatto il documento di rettifica formale [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md) che ne ridimensiona puntualmente il valore probatorio.
   - È stato generato il nuovo censimento dinamico ed effettivo in [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt).

3. **Censimento Reale delle 16 Prove**:
   - **Prove di Componente Eseguite (1)**: Invocazione autonoma da CLI di `tesseract.exe` 5.4.0 su immagine PNG (output grezzo: `LIMEN Vault Sistema di Memoria Locale con Riconescimento Ottico ed Aocentt caffe, perche, citta virtu` con imperfezioni ortografiche rilevate).
   - **Prove Applicative Non Dimostrate (14)**: Installazione pulita, creazione vault, importazione catalogo, ricerca semantica in app, coesistenza bge-m3 + Ministral con pesi reali caricati in app, 20 domande con Ministral, monitoraggio rete durante esecuzione app, rifiuto modello corrotto, timeout/orfani Job Object, visualizzazione citazioni, snapshot/restore funzioni interne LIMEN, percorsi con spazi/accenti su app, prova visiva DPI, disinstallazione effettiva.
   - **Prove Bloccate per Assenza Prerequisiti (1)**: Prova credenziali WinCred in profilo isolato (il profilo Windows dedicato o VM non è stato configurato; l'esecuzione sotto `user` non costituisce isolamento).

4. **Matrice dei 24 Criteri Rettificata**:
   - Aggiornato [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md) dettagliando con trasparenza cosa è verificato a livello libreria/build e cosa non è dimostrato a livello applicativo.

---

## 2. Quadro Sinottico delle Evidenze di Progetto

| Ambito di Verifica | Livello Effettivo Raggiunto | Riferimento Evidenza |
|---|---|---|
| **Core Rust & Libreria** | 250 unit test passati (0 falliti) con codice 0 | `win_ocr::tests`, `vault::tests`, `search::tests` |
| **Componenti Nativi OCR** | `pdfium.dll` (build 8066) e `tesseract.exe` 5.4.0 inclusi nel bundle; invocazione standalone riuscita con imperfezioni ortografiche rilevate | [`fase4-spike-ocr-reale-evidence.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase4-spike-ocr-reale-evidence.txt) |
| **Packaging Release NSIS** | Installer da 63.063.440 byte generato con successo e SHA-256 `222472363b76f1dc9db67bd4d282ba25c2581312c40d38048742ebbc47085249` verificato | [`USER INSTALL WINDOWS/PACKAGING_AUDIT_LOG.txt`](file:///E:/Projects/vault_memai_obsi/USER%20INSTALL%20WINDOWS/PACKAGING_AUDIT_LOG.txt) |
| **Collaudo E2E App Installata** | **NON DIMOSTRATO** (non eseguito attraverso l'app `limen-vault.exe` / WebView2) | [`fase6-collaudo-componenti-e-censimento-e2e.txt`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-componenti-e-censimento-e2e.txt) |
| **Isolamento Profilo Windows** | **NON REALIZZATO** (manca account OS o VM dedicato) | [`fase6-collaudo-e2e-16-prove-rettifica.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase6-collaudo-e2e-16-prove-rettifica.md) |
| **Verifica Piattaforma macOS** | Isolamento condizionale verificato su codice; **Runtime Mac: NON VERIFICATO** per assenza hardware Apple Silicon | [`fase7-verifica-condivise-macos.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase7-verifica-condivise-macos.md) |

---

## 3. Completamento Script di Censimento ed Exit Code (Audit Punto 1)

In [`scripts/collaudo_e2e_isolated.ps1`](file:///E:/Projects/vault_memai_obsi/scripts/collaudo_e2e_isolated.ps1):
- **Verifica effettiva delle 7 fixture**: implementato ciclo di controllo su disco con dimensione byte e verifica fisica non nulla di tutti i 7 file (`fixture_1_immagine_autonoma.png` a `fixture_7_doc_legacy.doc`), eliminando la semplice stampa passiva.
- **Distinzione semantica formale**: documentato separatamente e stampato a console e nel log il significato di "Censimento Diagnostico Eseguito" (lo script ha catalogato le prove) rispetto a "Collaudo Superato" (l'app reale ha superato le 16 prove).
- **Exit Code rigoroso**: se ci sono controlli `FAIL` lo script termina con codice `1`; se permangono prove `NON_ESEGUITO_APPLICATIVO` o `BLOCCATO`, lo script termina con codice `2`. È impedito categoricamente che un codice `0` venga restituito o interpretato come accettazione della release.

---

## 4. Esito della Ricognizione e Proposta Ambiente Dedicato

I risultati completi sono documentati in:
- [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/ricognizione_ambiente_collaudo.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/ricognizione_ambiente_collaudo.md)
- [`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/richiesta_amministrativa_ambiente_dedicato.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/richiesta_amministrativa_ambiente_dedicato.md)

1. **Cessazione Tentativi su Account Esistenti**:
   - Definitivamente interrotti tentativi di accesso o modifiche ad account esistenti (`CodexSandboxOffline`, ecc.). Nessuna ricerca di credenziali.
2. **Richiesta Amministrativa Minima per Cesare**:
   - **Soluzione primaria (VM Windows 11 di collaudo)**: verificare in Hyper-V (servizio `vmms` già attivo) la presenza di una VM Windows 11 x64 pulita o crearne una dedicata, con sessione grafica accessibile e nessun collegamento o condivisione verso le cartelle personali dell'host; trasferirvi solo installer, 7 fixture e modelli GGUF.
   - **Alternativa secondaria (Account Standard locale `LimenTester`)**: creazione di un utente standard dedicato da prompt admin. Non sostituisce la macchina pulita ma permette un primo isolamento.
3. **Verifica Controllo GUI e Limiti Tecnici**:
   - Dalla sessione shell dell'host non è possibile interagire direttamente con la GUI interna a una VM remota/isolata.
   - Il controllo automatizzato può avvenire via **Chrome DevTools Protocol (CDP)** abilitando `--remote-debugging-port=9222` su WebView2 (interazione DOM, click bottoni, lettura testo e screenshot), pre-configurando il vault di test per evitare il blocco sui dialoghi modali Win32 (`IFileDialog`).
4. **Percorsi Effettivi nel Codice Rust**:
   - `ai_settings.json`: controlla l'override `LIMEN_AI_SETTINGS_FILE`; altrimenti legge `USERPROFILE` o `HOME` e compone `.limen-vault\ai_settings.json`.
   - `local_model_timing.log` e `history`: leggono `USERPROFILE` o `HOME` e compongono `.limen-vault\...`.
   - *Nota*: le sole variabili d'ambiente non isolano il Gestore Credenziali (WinCred), che è vincolato al token di sicurezza dell'utente OS.
5. **Verifica Sola Lettura Profilo `user`**:
   - Verificato che in `C:\Users\user\.limen-vault` tutti i file risalgono al **25 settembre 2026**. Nessun dato è stato creato o modificato nella sessione odierna. Nessun processo `limen-vault.exe` o `llama-server.exe` attivo.

---

## 5. Conclusioni

L'infrastruttura software (motore OCR Rust, binari PDFium, Tesseract, installer NSIS completo) è presente e verificata a livello di codice e di compilazione release.  
Lo script di censimento è rigorosamente vincolato ad exit code non zero (`exit 2` per prove non eseguite/bloccate).  
È stata formalizzata la richiesta amministrativa minima per la VM di collaudo e definiti i canali tecnici di controllo della GUI.  
La release e l'accettazione della parità funzionale Windows/Mac rimangono pertanto **formalmente aperte** in attesa della disponibilità della VM di collaudo.
