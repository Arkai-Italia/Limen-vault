# Report di Validazione Sintattica Diagrammi Mermaid — LIMEN Vault v7Mini

Data di validazione: 11 Ottobre 2026  
Versione applicazione: LIMEN Vault v7Mini (0.7.0)  
Totale diagrammi censiti e validati: **18 / 18 (100%)**

---

## 1. Esito del Collaudo Sintattico

Tutti i 18 diagrammi Mermaid contenuti nella cartella `04_MERMAID/` sono stati ispezionati e collaudati conformemente alle specifiche di parsing standard di Mermaid.js (v10+), con piena compatibilità verificata per:
- GitHub Flavored Markdown renderer
- Obsidian Markdown Mermaid viewer
- VS Code Markdown Preview Mermaid Support
- Mermaid CLI (`mmdc`)

---

## 2. Registro Dettagliato dei Diagrammi

| ID | File Sorgente | Tipologia | Nodi / Fasi | Connettori / Frecce | Esito Sintassi | Note di Validazione |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`MMD-001`** | `SYSTEM_NAVIGATION.mmd` | `graph TD` | 24 nodi, 5 subgraph | 8 collegamenti | **SUPERATO** | ClassDef per ardesia e lime con quote corrette |
| **`MMD-002`** | `AUTH_LIFECYCLE.mmd` | `sequenceDiagram` | 5 partecipanti | 18 messaggi, 1 alt block | **SUPERATO** | Autonumber attivo, sintassi `alt/else/end` corretta |
| **`MMD-003`** | `WF-001.mmd` | `graph TD` | 13 nodi, 3 decisioni | 13 archi con etichette | **SUPERATO** | Etichette quote e branching valido |
| **`MMD-004`** | `WF-002.mmd` | `graph TD` | 12 nodi, 3 decisioni | 13 archi condizionali | **SUPERATO** | Tag `&lt;think&gt;` correttamente escapati |
| **`MMD-005`** | `WF-003.mmd` | `graph TD` | 13 nodi, 2 decisioni | 13 archi di flusso | **SUPERATO** | Salto citazioni e hash check quotati |
| **`MMD-006`** | `WF-004.mmd` | `graph TD` | 14 nodi, 2 decisioni | 14 archi con loop batch | **SUPERATO** | Ingestione asincrona e feedback |
| **`MMD-007`** | `WF-005.mmd` | `graph TD` | 11 nodi, 2 decisioni | 11 archi | **SUPERATO** | Layout semantico e collegamenti nota |
| **`MMD-008`** | `WF-006.mmd` | `graph TD` | 11 nodi, 2 decisioni | 11 archi | **SUPERATO** | Spostamento 00_INBOX -> 10_KNOWLEDGE tracciato |
| **`MMD-009`** | `WF-007.mmd` | `graph TD` | 11 nodi, 2 decisioni | 11 archi | **SUPERATO** | Compressione e ripristino con manifest SHA-256 |
| **`MMD-010`** | `WF-008.mmd` | `graph TD` | 15 nodi, 3 decisioni | 15 archi | **SUPERATO** | Download Hugging Face e porta 8080 tracciati |
| **`MMD-011`** | `WF-009.mmd` | `graph TD` | 11 nodi, 2 decisioni | 11 archi | **SUPERATO** | Push / Pull S3/R2 asincrono |
| **`MMD-012`** | `WF-010.mmd` | `graph TD` | 8 nodi, 1 decisione | 8 archi | **SUPERATO** | Comandi cli offline quotati |
| **`MMD-013`** | `WF-011.mmd` | `graph TD` | 9 nodi, 1 decisione | 9 archi | **SUPERATO** | Switch lingua IT / EN a caldo tracciato |
| **`MMD-014`** | `WF-012.mmd` | `graph TD` | 8 nodi, 1 decisione | 8 archi | **SUPERATO** | URI scheme `obsidian://open` documentato |
| **`MMD-015`** | `PIPE-001.mmd` | `flowchart TD` | 11 blocchi di flusso | 11 connettori direzionali | **SUPERATO** | Pipeline bge-m3 ed estrazione |
| **`MMD-016`** | `PIPE-002.mmd` | `flowchart TD` | 11 blocchi di routing | 11 frecce logiche | **SUPERATO** | Fallback locale/cloud trasparente |
| **`MMD-017`** | `PIPE-003.mmd` | `flowchart TD` | 12 blocchi streaming | 12 passaggi asincroni | **SUPERATO** | Parsing reasoning trace escapato |
| **`MMD-018`** | `PIPE-004.mmd` | `flowchart TD` | 14 blocchi su 3 subgraph | 14 controlli hash | **SUPERATO** | Verifica integrità tripla |

---

## 3. Conformità alle Regole di Redazione
1. **Nessun testo non quotato con caratteri riservati:** Tutti i blocchi contenenti parentesi tonde, quadre o doppi apici utilizzano le virgolette `["..."]` o forme grafiche idonee.
2. **Escaping entità speciali:** I riferimenti al tag di reasoning `<think>` sono trascritti come `&lt;think&gt;` per impedire interpretazioni errate da parser XML/HTML integrati.
3. **Consistenza cromatica e semantica:** Il file `SYSTEM_NAVIGATION.mmd` definisce le classi colore speculari ai token reali di LIMEN Vault (`#0f172a`, `#1e293b`, `#c8ff00`, `#3b82f6`).
