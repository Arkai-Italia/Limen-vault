# Report di Tracciabilità Completa — LIMEN Vault v7Mini (0.7.0)

Il presente registro stabilisce la catena di tracciabilità end-to-end tra gli obiettivi dell'utente (`GOAL-###`), le evidenze del codice sorgente (`EVD-###`), le schermate UI (`SCR-###`), i workflow operativi (`WF-###`), i diagrammi Mermaid (`MMD-###`) e i capitoli del Manuale Utente Master.

---

## Tabella di Tracciabilità Integrata

| Obiettivo Utente | Evidenza Sorgente | Schermata UI | Workflow Operativo | Pipeline Collegata | Diagramma Mermaid | Capitolo Manuale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`GOAL-001`** (Primo Avvio e Setup) | `EVD-001`, `EVD-002` | `SCR-002` | `WF-001` | - | `MMD-002`, `MMD-003` | Capitolo 4, 5 |
| **`GOAL-002`** (Ricerca RAG e Chat) | `EVD-004`, `EVD-005` | `SCR-003` | `WF-002` | `PIPE-002`, `PIPE-003` | `MMD-004`, `MMD-016`, `MMD-017` | Capitolo 8, 9 |
| **`GOAL-003`** (Ispezione e Hash SHA-256)| `EVD-006`, `EVD-007` | `SCR-013`, `SCR-014` | `WF-003` | `PIPE-004` | `MMD-005`, `MMD-018` | Capitolo 10, 11, 25 |
| **`GOAL-004`** (Acquisizione Documenti) | `EVD-008`, `EVD-009` | `SCR-004` | `WF-004` | `PIPE-001`, `PIPE-004` | `MMD-006`, `MMD-015` | Capitolo 12, 13 |
| **`GOAL-005`** (Navigazione Memoria 01-10)| `EVD-010` | `SCR-005` | `WF-005` | - | `MMD-007` | Capitolo 14 |
| **`GOAL-006`** (Approvazione Bozze) | `EVD-011` | `SCR-006` | `WF-006` | - | `MMD-008` | Capitolo 16 |
| **`GOAL-007`** (Snapshot e Ripristino) | `EVD-012` | `SCR-007` | `WF-007` | `PIPE-004` | `MMD-009`, `MMD-018` | Capitolo 17 |
| **`GOAL-008`** (Gestione Modelli LLM) | `EVD-013` | `SCR-009` | `WF-008` | `PIPE-002`, `PIPE-004` | `MMD-010`, `MMD-016` | Capitolo 18, 19 |
| **`GOAL-009`** (Sincronizzazione Cloud S3)| `EVD-014` | `SCR-008` | `WF-009` | - | `MMD-011` | Capitolo 20 |
| **`GOAL-010`** (Apertura in Obsidian) | `EVD-003` | `SCR-001` (Sidebar) | `WF-012` | - | `MMD-014` | Capitolo 24 |
| **Localizzazione IT / EN** | `EVD-016` | `SCR-001` (Header) | `WF-011` | - | `MMD-013` | Capitolo 7 |
| **Compilatore Fonti Testo** | `EVD-015` | `SCR-010` | `WF-010` | - | `MMD-012` | Capitolo 21 |

---

## Integrità della Catena di Tracciabilità
- **Orfani Funzionali:** 0 (tutti gli elementi di UI, workflow e pipeline trovano corrispondenza nel manuale e nei diagrammi).
- **Uniformità Terminologica:** 100% allineata al dizionario bilingue `02_UI_REFERENCE/CONTROL_AND_FIELD_DICTIONARY.csv` e al catalogo `WORKFLOW_CATALOG.csv`.
- **Verificabilità del Codice:** Tutte le voci poggiano su file e funzioni verificate nel codice sorgente della release 0.7.0.
