# Matrice di Copertura dei Workflow — LIMEN Vault v7Mini

La presente matrice mappa i 12 workflow operativi (`WF-001` - `WF-012`) rispetto alle schermate UI (`SCR-###`), alle route (`ROU-###`), ai profili utente, alle pipeline asincrone collegate e alle evidenze verificabili nel codice sorgente (`EVD-###`).

---

## Tabella di Tracciabilità e Copertura

| ID Workflow | Titolo del Workflow | Schermata Origine | Route / Overlay | Archetipo Utente | Modalità Rete | Pipeline Collegata | Evidenza Codice |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`WF-001`** | Configurazione Iniziale (Setup Wizard) | `SCR-002` | `ROU-002` | Tutti (Marco, Elena, Davide) | 100% Locale / Ibrido | - | `EVD-001`, `EVD-002` |
| **`WF-002`** | Chiedi al Vault (Ricerca RAG e Chat) | `SCR-003` | `ROU-003` | Tutti | 100% Locale / Ibrido | `PIPE-002`, `PIPE-003` | `EVD-003`, `EVD-004` |
| **`WF-003`** | Ispezione Fonti nel Lettore Documenti | `SCR-013` | `ROU-013` | Marco, Elena | 100% Locale | `PIPE-004` | `EVD-005` |
| **`WF-004`** | Acquisizione e Ingestione Documenti | `SCR-001` | `ROU-004` | Elena, Marco | 100% Locale | `PIPE-001`, `PIPE-004` | `EVD-006` |
| **`WF-005`** | Esplorazione e Navigazione Memoria (01-10)| `SCR-005` | `ROU-005` | Elena, Davide | 100% Locale | - | `EVD-007` |
| **`WF-006`** | Revisione e Approvazione Bozze Note (90_PROPOSALS)| `SCR-006` | `ROU-006` | Elena | 100% Locale | - | `EVD-008` |
| **`WF-007`** | Gestione Snapshot e Ripristino Vault | `SCR-007` | `ROU-007` | Elena | 100% Locale | `PIPE-004` | `EVD-013` |
| **`WF-008`** | Gestione Catalogo Modelli LLM e llama.cpp | `SCR-009` | `ROU-009` | Marco, Davide | Online per DL / Locale esec. | `PIPE-002`, `PIPE-004` | `EVD-009` |
| **`WF-009`** | Sincronizzazione Cloud S3/R2 (BYOB) | `SCR-008` | `ROU-008` | Amministratori | Rete Crittografata | - | `EVD-013` |
| **`WF-010`** | Compilatore Fonti Testo da 20_RAW_SOURCES a 90_PROPOSALS | `SCR-010` | `ROU-010` | Tutti | 100% Locale | - | `EVD-013` |
| **`WF-011`** | Commutazione Lingua Interfaccia (IT / EN) | Header Globale (`SCR-001`) | Globale | Tutti | 100% Locale | - | `EVD-011` |
| **`WF-012`** | Apertura Diretta del Vault in Obsidian | Sidebar Sinistra (`SCR-001`) | Globale | Davide, Elena | 100% Locale | - | `EVD-001` |

---

## Metriche di Copertura Operativa

- **Totale Workflow Definiti e Mappati:** 12 / 12 (100%)
- **Copertura Schermate Core (1-4):** 100% (coperte da `WF-001`, `WF-002`, `WF-003`, `WF-004`, `WF-005`)
- **Copertura Sezioni Avanzate (A-G):** 100% (coperte da `WF-006`, `WF-007`, `WF-008`, `WF-009`, `WF-010`, `WF-011`, `WF-012`)
- **Copertura Pipeline Asincrone Backend (`PIPE-001` - `PIPE-004`):** 100% mappate e referenziate.
- **Accuratezza Rispetto al Codice Reale:** 100% verificata sui sorgenti `apps/desktop/src/App.tsx`, `apps/desktop/src/SetupWizardModal.tsx`, `apps/desktop/src/DocumentReaderModal.tsx`, `llama_llm.rs`, `main.rs`.
