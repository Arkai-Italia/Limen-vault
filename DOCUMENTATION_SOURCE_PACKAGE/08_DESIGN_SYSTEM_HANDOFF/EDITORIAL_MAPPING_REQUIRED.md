# Mappatura Editoriale Obbligatoria — Per il Redattore del PDF

> **Direttiva Editoriale Fondamentale:**  
> Il PDF LIMEN di riferimento costituisce un benchmark editoriale per l'impaginazione (formato orizzontale, struttura delle sezioni, schede visive, ritmo di lettura e griglia di pagina).  
> **L'identità visiva e cromatica del manuale di LIMEN Vault DEVE tuttavia derivare rigorosamente dal Design System di LIMEN Vault** (tema Light Slate, accenti Lime, testi Slate 900 e contrasti scuri per modali/codice), come formalizzato in `DESIGN_TOKENS_EXTRACTED.yml`.

---

## 1. Mappatura Cromatica per Stampa e Schermo (PDF A4 Orizzontale)

I diagrammi Mermaid forniti in `04_MERMAID/` e `10_EXPORT/ALL_MERMAID_SOURCES.md` sono generati con sintassi universale pulita. In fase di composizione grafica nel documento PDF:

- **Nodi di Ingresso / CTA Principali:**
  - Sfondo: `#c8ff00` (Lime CTA) o `#77F117` (Brand Lime).
  - Testo: `#0f172a` (Slate 900 ad alto contrasto).
- **Nodi di Processo Ordinario:**
  - Sfondo: `#ffffff` (Superficie card chiara) con bordo `#cbd5e1`.
  - Testo: `#0f172a`.
- **Nodi di Selezione Decisionale / Condizioni:**
  - Sfondo: `#f1f5f9` (Light Slate Sidebar) con bordo `#94a3b8`.
  - Testo: `#0f172a`.
- **Riquadri di Codice e Terminali:**
  - Sfondo: `#0f172a` (Dark Slate).
  - Testo: `#f8fafc` (Monospace chiaro).
- **Nodi di Errore / Stop / Allarme:**
  - Sfondo: `#fef2f2` con bordo e testo `#ef4444`.

---

## 2. Gerarchia Tipografica del Manuale

- **Titolo di Parte / Volume (Cover/Sezione):** 32-36 pt Bold, Colore `#0f172a`.
- **Titolo Capitolo (H1):** 24-28 pt Bold, Colore `#0f172a`, con badge identificativo di area (`SCR-###`, `WF-###`).
- **Titolo Paragrafo / Scheda Task (H2):** 18-20 pt Bold.
- **Sottoparagrafi e Campi Dizionario (H3):** 14-16 pt SemiBold.
- **Corpo del Testo:** 10-11 pt Regular (Interlinea 1.4-1.5, Font sans-serif di sistema: SF Pro Display / Inter / Segoe UI), Colore `#0f172a` / `#475569`.
- **Note Tecniche / Blocchi Codice / Hash SHA-256:** 9 pt Regular Monospace (SF Mono / Consolas).

---

## 3. Integrazione Evidenze e Screenshot

- Gli screenshot da inserire devono provenire esclusivamente dalla release documentata (0.7.0).
- Ogni immagine deve riportare la didascalia con `screenshot_id` (`SHOT-001` - `SHOT-016`), la data di cattura e i cerchiati o callout numerati corrispondenti ai passi procedurali descritti nel testo.
