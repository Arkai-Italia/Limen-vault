# Walkthrough Fase 5: Collaudo Matrice dei 24 Criteri di Accettazione

> **Progetto**: LIMEN Vault v6Mini (`dev.arkai.limenvault`, v0.6.0)  
> **Data**: 29 settembre 2026  
> **Target Architettura**: Windows 11 x64 (`x86_64-pc-windows-msvc`)  
> **Branch**: `windows-build`  
> **Stato Fase 5**: **Chiusa e committata** (`4b8ae74`)

---

## 1. Obiettivi e Perimetro di Fase 5
La Fase 5 ha eseguito il collaudo metodico e la verifica di ciascuno dei **24 criteri di accettazione** prescritti dal documento `USER INSTALL/ISTRUZIONI_CODER_BUILD_WINDOWS.md` per il rilascio di LIMEN Vault v6Mini su Windows 11 x64:
1. **Verifica Funzionale e Integrità Pacchetto**: controllo completo dell'installer NSIS generato (`LIMEN-Vault-v6Mini-0.6.0-windows-x64-setup.exe`), delle dimensioni (19.007.431 byte) e della corrispondenza crittografica con `SHA256SUMS.txt`;
2. **Esecuzione Suite Completa Rust**: esecuzione di `cargo test --lib` con 243 test superati con codice 0 su tutti i sottosistemi (RAM, processi `llama-server.exe`, estrazione parziale e OCR, catalogo, ricerca, credenziali WinCred, snapshot e sicurezza traversal/junction);
3. **Controllo Metadati PE e Identità**: ispezione dei campi versione (`0.6.0`), prodotto (`LIMEN Vault v6Mini`), copyright (`Arkitecna Hong Kong Limited`) e modalità di installazione per-utente (`currentUser`);
4. **Isolamento e Trasparenza Firma**: verifica dello stato di firma digitale Authenticode (`NotSigned`, esplicitamente dichiarato in conformità alle istruzioni) e rispetto del divieto di scritture non autorizzate nell'ambiente utente (`C:\Users\user\LIMEN Vault\models\`).

---

## 2. Esito delle Verifiche della Matrice

Tutti i 24 criteri risultano verificati, con evidenze grezze e prove esecutive archiviate in:
[`IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md`](file:///E:/Projects/vault_memai_obsi/IMPLEMENTATION/WINDOWS_RELEASE_EVIDENCE/fase5-collaudo-matrice-24-criteri.md)

### Punti Chiave Validati:
- **Criterio 1 (Installer NSIS)**: generato in `USER INSTALL WINDOWS/` in modalità `currentUser`, pronto per installazione senza privilegi amministrativi.
- **Criterio 2 (WebView2)**: runtime Microsoft Edge WebView2 versione `153.0.4234.48` rilevato nel registro di sistema.
- **Criterio 3 (Identità e Finestra)**: metadati PE verificati (`LIMEN Vault v6Mini`, v0.6.0), finestra standard con controlli nativi Windows (rimosso overlay macOS), avvio processi figli invisibile (`CREATE_NO_WINDOW`).
- **Criterio 6 (OCR Locale)**: 5 fixture reali collaudate con codice 0 in Fase 1; contratti di estrazione parziale e gestione errori integrati; residuo formati legacy DOC/RTF formalmente dichiarato aperto.
- **Criterio 8 (RAM e Modelli)**: lettura fisica Win32 reale (31.96 GB host) e politica 3B/8B con 11 unit test superati.
- **Criterio 14 (Credenziali WinCred)**: roundtrip nativo Windows Credential Manager (`CredWriteW`/`CredReadW`/`CredDeleteW`) superato con codice 0 in `keychain::test_windows_credential_manager_roundtrip`.
- **Criterio 20 (Test Suite & Packaging)**: 243 test Rust passati su 243, typecheck frontend con codice 0, build packaging con codice 0.
- **Criterio 23 (Firma)**: verificato stato `NotSigned`, correttamente dichiarato.
- **Criterio 24 (Checksum)**: hash SHA-256 `2e851af9f55d9f2e30a56cf956ddf17c24da417657afaa93d0bb144494b42092` identico al 100% tra eseguibile su disco e file `SHA256SUMS.txt`.

---

## 3. Prossimi Passi (Fase 6)
* Commit atomico di Fase 5 eseguito (`4b8ae74`).
* Avviata la **Fase 6**: Redazione finale di `USER INSTALL WINDOWS/LEGGIMI_WINDOWS.md`, chiusura delle task list e consegna finale della release v6Mini Windows.
