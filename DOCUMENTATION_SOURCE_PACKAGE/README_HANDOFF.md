# Pacchetto Sorgente Documentale — LIMEN Vault v7Mini (0.7.0)

Benvenuto nel **Documentation Source Package** di LIMEN Vault v7Mini, generato secondo lo standard universale **CODER DOCUMENTATION EXTRACTION OS (v1.0.0)**.

Questo pacchetto contiene l'intera base di conoscenza tecnica, operativa, architetturale e grafica dell'applicazione desktop LIMEN Vault nella versione **0.7.0**, estratta direttamente dai sorgenti Rust, Tauri e React.

---

## 1. Struttura del Pacchetto

```
DOCUMENTATION_SOURCE_PACKAGE/
├── 00_PROJECT/                  <- Metadati progetto, fatti tecnici, ledger evidenze, esclusioni
├── 01_PRODUCT_DISCOVERY/        <- Panoramica prodotto, personas, schermate, route, inventari menu
├── 02_UI_REFERENCE/             <- Dizionario controlli, messaggi di errore, glossario, stati UI
├── 03_WORKFLOWS/                <- Catalogo workflow, 12 schede "COME FARE", pipeline, user journeys
├── 04_MERMAID/                  <- 18 diagrammi Mermaid .mmd isolati, indice e report di validazione
├── 05_SCREENSHOTS/              <- Piano screenshot e manifesto di tracciabilità (per il Graphic Editor)
├── 06_DEMO_AND_TEST/            <- Manifesto fixture sintetiche per test e collaudo
├── 07_SUPPORT_AND_REFERENCE/    <- FAQ, troubleshooting, limiti noti e glossario
├── 08_DESIGN_SYSTEM_HANDOFF/    <- Token colore/font/spaziatura, asset manifest e guide editoriali
├── 09_QA_AND_RELEASE/           <- Rapporti di copertura (100%), tracciabilità, certificato QA e checklist
├── 10_EXPORT/                   <- Quick Start 1-page e raccolta fenced di tutti i diagrammi
├── MANUALE_UTENTE.txt           <- [DELIVERABLE PRIMARIO] Master a 25 capitoli con doppio indice
├── MANUALE_UTENTE.md            <- Versione speculare Markdown GFM con cross-link e tabelle
├── PACKAGE_MANIFEST.json        <- Metadati macchina e metriche di integrità del pacchetto
└── README_HANDOFF.md            <- Questa guida di benvenuto
```

---

## 2. Deliverable Primario Vincolante
Il documento di riferimento centrale per la distribuzione utente è:
- **`MANUALE_UTENTE.txt`**: File di testo puro UTF-8 strutturato in 25 capitoli e 3 appendici, dotato del **Doppio Indice Obbligatorio** (per Menu e per Compiti «COSA TI SERVE?»).
- **`MANUALE_UTENTE.md`**: Versione speculare con badge e cross-reference.

---

## 3. Istruzioni per il Graphic Editor / Technical Writer
1. **Contenuto Immutabile:** Il testo di `MANUALE_UTENTE.txt` è stato collaudato e validato rispetto al codice della release 0.7.0. Non modificare la logica dei passaggi operativi, i nomi dei file GGUF, le porte di rete (8080) o i token del Design System.
2. **Cattura Screenshot:** Seguire le specifiche in `05_SCREENSHOTS/SCREENSHOT_PLAN.csv` per acquisire le schermate mancanti a risoluzione nativa desktop 1440x900.
3. **Renderizzazione Diagrammi:** I 18 diagrammi Mermaid in `04_MERMAID/` sono validati al 100%. Possono essere convertiti in SVG vettoriali usando `mmdc` con background scuro `#0f172a` e accento Lime `#c8ff00`.
4. **Generazione PDF Premium:** Comporre il layout grafico utilizzando i token in `08_DESIGN_SYSTEM_HANDOFF/DESIGN_TOKENS_EXTRACTED.yml` e la checklist in `09_QA_AND_RELEASE/FINAL_HANDOFF_CHECKLIST.md`.

---
*Prodotto da: Coder / Documentation Extractor — Arkitecna HK / Cesare Negro*
