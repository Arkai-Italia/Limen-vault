# Verbale di Validazione e Approvazione Design System — LIMEN Vault v7Mini

- **Data Revisione:** 11 Ottobre 2026
- **Release Software:** LIMEN Vault v7Mini (0.7.0) — commit `677745c367d64de7d21eb66d111cac7558300f84`
- **Standard di Riferimento:** APP USER MANUAL OS v0.2.0 (Bibbia Manuali Utente, Sez. 13 & 14)
- **Stato Gate:** **HOLD (In Sospeso)**

---

## 1. Stato dei Componenti del Gate Design System

| Componente Richiesto | File Corrispondente | Stato Verifica | Note di Conformità |
| :--- | :--- | :--- | :--- |
| **Manifest Design System** | `08_DESIGN_SYSTEM_HANDOFF/design-system-manifest.yml` | **VERIFICATO** | Puntamento sorgenti, versioni, licenze font native e asset |
| **Mappatura UI -> Documento** | `08_DESIGN_SYSTEM_HANDOFF/design-to-document-map.yml` | **PROPOSTO (HOLD)** | Mappatura token UI su stile editoriale A4 landscape da collaudare |
| **Token Estratti da Codice** | `08_DESIGN_SYSTEM_HANDOFF/DESIGN_TOKENS_EXTRACTED.yml` | **VERIFICATO** | Estratti da `packages/ui/src/styles.css` (tema Light Slate, Lime, Slate 900) |
| **Manifest Asset e Brand** | `08_DESIGN_SYSTEM_HANDOFF/BRAND_ASSET_MANIFEST.csv` | **VERIFICATO** | Icone macOS/Win, componenti Lucide React (licenza ISC) |
| **Approvazione Editoriale Finale** | `08_DESIGN_SYSTEM_HANDOFF/DESIGN_APPROVAL.md` | **HOLD** | In attesa di review impaginato e deposito screenshot nativi |

---

## 2. Token Verificati sui Sorgenti dell'Applicazione

I seguenti valori sono stati estratti direttamente da `packages/ui/src/styles.css` e `apps/desktop/src/App.tsx`:
- **Tema Base:** Light Slate
  - `--limen-bg-app`: `#f8fafc` (Sfondo generale)
  - `--limen-bg-surface`: `#ffffff` (Card e superfici di lettura)
  - `--limen-bg-sidebar`: `#f1f5f9` (Barra laterale 240px)
  - `--limen-text-primary`: `#0f172a` (Slate 900)
  - `--limen-text-secondary`: `#475569` (Slate 600)
  - `--limen-border-light`: `#e2e8f0`
- **Accenti Cromatici e Brand:**
  - Brand Lime: `#77F117` (`--limen-lime`)
  - CTA Carica Documenti: `#c8ff00` (Pulsante primario in sidebar)
  - Badge Pronto: `#047857` su sfondo `#ecfdf5`
- **Modali e Contrast Overlays:**
  - Setup Wizard Modal: Sfondo dark `#0f172a`, testo `#f8fafc`, backdrop blur `rgba(7, 11, 20, 0.82)`.

---

## 3. Adattamenti Editoriali Proposti per il Manuale PDF (A4 Orizzontale)

- **Benchmark Editoriale:** Il PDF LIMEN di riferimento è adottato per la griglia orizzontale, le proporzioni delle task card e il ritmo di lettura a due facciate.
- **Identità Visiva:** Lo stile grafico del manuale non è una replica cieca di altri documenti aziendali, ma deriva rigorosamente dalla palette e dai caratteri del Design System di LIMEN Vault (Light Slate / Lime / Slate 900).
- **Tipografia:** Corpo del testo in `Inter` / `SF Pro Text` (10 pt, interlinea 1.45), titoli in `Inter` / `SF Pro Display` (Bold), codice e hash in `SF Mono` / `Roboto Mono` (9 pt).

---

## 4. Condizioni per lo Sblocco (Passaggio a PASS)

L'esito del gate rimarrà **HOLD** finché non saranno soddisfatte le seguenti condizioni:
1. **Acquisizione e Validazione Screenshot:** Deposito delle 16 immagini PNG reali in `05_SCREENSHOTS/` e controllo dell'assenza di sovrapposizioni visive o testi troncati.
2. **Review dell'Impaginato Campione:** Verifica della resa cromatica della palette Light Slate su pagina stampata e su display PDF da parte del Graphic Designer / Technical Writer.
3. **Firma di Accettazione Formale:** Compilazione dei campi `mapping_approved_by` e `mapping_approval_date`.
