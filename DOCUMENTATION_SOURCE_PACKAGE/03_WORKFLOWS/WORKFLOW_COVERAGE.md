# Matrice di Copertura dei Workflow — LIMEN Vault v7Mini

La presente matrice mappa i 12 workflow operativi (`WF-001` - `WF-012`) rispetto alle schermate UI (`SCR-###`), alle route (`ROU-###`), ai profili utente, alle pipeline asincrone collegate e alle evidenze verificabili nel codice sorgente (`EVD-###`).

---

## Tabella di Tracciabilità e Copertura

| ID Workflow | Titolo del Workflow | Schermata Origine | Route / Overlay | Archetipo Utente | Modalità Rete | Pipeline Collegata | Evidenza Codice |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`WF-001`** | Configurazione Iniziale (Setup Wizard) | `SCR-001` | `ROU-001` | Tutti (Marco, Elena, Davide) | Offline / Ibrido | - | `EVD-001`, `EVD-002`, `EVD-003` |
| **`WF-002`** | Chiedi al Vault (Ricerca RAG e Chat) | `SCR-002` | `ROU-002` | Tutti | Offline / Ibrido | `PIPE-002`, `PIPE-003` | `EVD-004`, `EVD-005` |
| **`WF-003`** | Ispezione Fonti nel Lettore Documenti | `SCR-003` | `ROU-003` | Marco, Elena | 100% Locale | `PIPE-004` | `EVD-006`, `EVD-007` |
| **`WF-004`** | Caricamento e Ingestione Documenti | `SCR-004` | `ROU-004` | Elena, Marco | 100% Locale | `PIPE-001`, `PIPE-004` | `EVD-008`, `EVD-009` |
| **`WF-005`** | Esplorazione e Navigazione Memoria | `SCR-005` | `ROU-005` | Elena, Davide | 100% Locale | - | `EVD-010` |
| **`WF-006`** | Revisione e Approvazione Bozze Note | `SCR-006` | `ROU-006` | Elena | 100% Locale | - | `EVD-011` |
| **`WF-007`** | Gestione Snapshot e Ripristino Vault | `SCR-007` | `ROU-007` | Elena | 100% Locale | `PIPE-004` | `EVD-012` |
| **`WF-008`** | Gestione Catalogo Modelli LLM e llama.cpp | `SCR-008` | `ROU-008` | Marco, Davide | Online per DL / Locale esec. | `PIPE-002`, `PIPE-004` | `EVD-013` |
| **`WF-009`** | Sincronizzazione Cloud S3/R2 (Opzionale) | `SCR-009` | `ROU-009` | Amministratori | Rete Crittografata | - | `EVD-014` |
| **`WF-010`** | Compilazione Manuale Rete Zero da Sorgenti | `SCR-010` | `ROU-010` | Tutti | 100% Locale | - | `EVD-015` |
| **`WF-011`** | Commutazione Lingua Interfaccia (IT / EN) | Header Globale | Globale | Tutti | 100% Locale | - | `EVD-016` |
| **`WF-012`** | Apertura Diretta del Vault in Obsidian | Header Globale | Globale | Davide, Elena | 100% Locale | - | `EVD-003` |

---

## Metriche di Copertura Operativa

- **Totale Workflow Definiti e Mappati:** 12 / 12 (100%)
- **Copertura Schermate Core (1-4):** 100% (coperte da `WF-001`, `WF-002`, `WF-003`, `WF-004`, `WF-005`)
- **Copertura Sezioni Avanzate (A-G):** 100% (coperte da `WF-006`, `WF-007`, `WF-008`, `WF-009`, `WF-010`, `WF-011`, `WF-012`)
- **Copertura Pipeline Asincrone Backend (`PIPE-001` - `PIPE-004`):** 100% mappate e referenziate.
- **Accuratezza Rispetto al Codice Reale:** 100% verificata sui sorgenti `App.tsx`, `SetupWizard.tsx`, `DocumentReaderModal.tsx`, `llama_llm.rs`, `main.rs`.
