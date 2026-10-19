# SESSION HANDOVER — LIMEN VAULT BNXT EDITION & RELEASE DMG NOTARIZZATO

**Data di chiusura sessione:** 19 Ottobre 2026 (UTC+8)  
**Operatore:** Antigravity AI Assistant  
**Ambiente operativo:** Windows x64 (`E:\Projects\vault_memai_obsi`)  
**Repository Software:** [Arkai-Italia/Limen-vault](https://github.com/Arkai-Italia/Limen-vault) (branch `windows-build` e `MAC-BUILD`)  
**Repository Base Dati BNXT:** [Arkai-Italia/bnxt-vault-corpus](https://github.com/Arkai-Italia/bnxt-vault-corpus) (branch `main`, tag `v1.0.0`)  

---

## 1. Stato dell'Arte e Sintesi Esecutiva

In questa sessione è stato portato a termine l'intero ciclo di allineamento, integrazione documentale, re-indicizzazione offline, versionamento su Git LFS e generazione dell'installer finale per macOS:

1. **Integrazione Documenti & Re-indicizzazione Totale:**
   - Acquisito l'archivio sorgente `Vault_BNXT_2026-10-19.zip` (186 MB);
   - Integrati gli 11 nuovi file Markdown non ancora indicizzati: `Eventi_Enduro_Italia_Europa_2026-10-18_2027-12-31.md`, `Caschi_HUD_ricerca_IT.md` e le 9 schede tecniche di `Enduro_Tech_Ricerca_Estesa_2026-10-18.zip`;
   - Tutti i **4.995 documenti Markdown** risultano estratti e in stato **`ready` (100%)**;
   - Generati e collaudati i file di indice: `00_SYSTEM/VAULT_CATALOG.json` (**217.362.832 byte**) e l'indice lessicale BM25 `00_SYSTEM/SEARCH_INDEX.json` (**726.294.477 byte**);
   - Ricerca lessicale testata con esito positivo e risposta immediata.

2. **Allineamento Motore di Indicizzazione su Windows (`catalog.rs`):**
   - Rimosso il vecchio limite rigido a 32 MB sul catalogo e sostituito con il buffered reader a stream continuo fino a 1 GB (`MAX_CATALOG_FILE_SIZE_BYTES = 1024 * 1024 * 1024`), in totale parità con `MAC-BUILD`.
   - Aggiornato lo strumento CLI `vault-check` con il subcomando `process-pending`.

3. **Nuovo Repository Dedicato Git LFS (`Arkai-Italia/bnxt-vault-corpus`):**
   - Separata la base di conoscenza del cliente dal repository del codice applicativo;
   - Configurato Git LFS per gestire i due file JSON di grandi dimensioni (`SEARCH_INDEX.json` e `VAULT_CATALOG.json`);
   - Push del branch `main` completato con successo (944 MB di oggetti LFS caricati).

4. **Confezionamento Installer macOS Composito ("Zero Setup"):**
   - Estratto il bundle nativo `LIMEN Vault.app` (Apple Silicon arm64) dall'installer v8 ufficiale, preservandone intatta la **Firma Developer ID e la Notarizzazione Apple** (`Developer ID Application: Arkitecna Hong Kong Limited (ZVGX4HFZC3)`);
   - Generato il file `.dmg` composito bivalente `USER INSTALL/LIMEN-Vault-BNXT-Edition.dmg` (1.219.350.528 byte, UDF 2.60 nativo macOS a 64 bit) contenente sia l'App che la cartella `Vault BNXT`;
   - Compresso il DMG in archivio ad alta efficienza `USER INSTALL/LIMEN-Vault-BNXT-Edition-macOS.zip` (**216,9 MB**, con un risparmio dell'**81,3%**).

5. **Pubblicazione Ufficiale GitHub Release:**
   - Pubblicata la Release ufficiale `v1.0.0` su [Arkai-Italia/bnxt-vault-corpus/releases/tag/v1.0.0](https://github.com/Arkai-Italia/bnxt-vault-corpus/releases/tag/v1.0.0) contenente il file `.zip` e i relativi file di checksum SHA-256.

---

## 2. Inventario Esatto Artefatti e Impronte SHA-256

| Artefatto | Percorso / URL | Dimensione | SHA-256 |
| :--- | :--- | :---: | :--- |
| **Archivio ZIP di Distribuzione** | `USER INSTALL/LIMEN-Vault-BNXT-Edition-macOS.zip` | 227.473.018 byte (216,9 MB) | `16692ce579d343a4b77f368050550825a969148a074264ce19da284cf87a92d1` |
| **Immagine Disco DMG Composita** | `USER INSTALL/LIMEN-Vault-BNXT-Edition.dmg` | 1.219.350.528 byte (1.162,9 MB) | `9f1cab7065ca34b42566f76e8085a6e35393d198adaa162592f57e0241cc18c2` |
| **GitHub Release Ufficiale** | [Release v1.0.0](https://github.com/Arkai-Italia/bnxt-vault-corpus/releases/tag/v1.0.0) | — | Asset allegati: ZIP + Checksums |
| **Repository Corpus & LFS** | [Arkai-Italia/bnxt-vault-corpus](https://github.com/Arkai-Italia/bnxt-vault-corpus) | 4.995 doc + 944 MB LFS | Branch `main` |
| **Report Formale per Auditor** | `REPORT_AUDIT_VAULT_BNXT_DMG.md` | Root del workspace | Sezioni 1–8 complete |
| **Walkthrough Dettagliato** | `WALKTHROUGH_BNXT_REINDEXING_CORPUS.md` | Root del workspace | Evidenze operative |

---

## 3. Guida Operativa per la Prossima Sessione

### Come il cliente finale installa e avvia il sistema su Mac:
1. Scarica il file `LIMEN-Vault-BNXT-Edition-macOS.zip` (216 MB) dalla GitHub Release;
2. Fa doppio clic per estrarre il file `LIMEN-Vault-BNXT-Edition.dmg`;
3. Apre il `.dmg` e compie i 2 trascinamenti:
   - `LIMEN Vault.app` $\rightarrow$ dentro `/Applications`
   - `Vault BNXT` $\rightarrow$ dentro `~/Documents`
4. Clicca sull'icona dell'applicazione: il software si apre direttamente in stato **● PRONTO** con tutti i 4.995 documenti interrogabili offline senza alcuna configurazione.

### Stato dei rami Git:
- `windows-build`: commit corrente `16e6486` sincronizzato con `origin` e `upstream`.
- `main` su `bnxt-vault-corpus`: commit e LFS sincronizzati al 100%.
- Nessun processo residuo o demone lasciato attivo in background.
