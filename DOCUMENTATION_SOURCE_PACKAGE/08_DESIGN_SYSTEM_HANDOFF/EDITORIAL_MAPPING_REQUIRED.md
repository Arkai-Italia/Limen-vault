# Mappatura Editoriale Obbligatoria — Per il Redattore del PDF

> **Nota per il Technical Writer / Graphic Editor:**  
> Il presente pacchetto fornisce i testi, gli inventari, le tabelle e i sorgenti Mermaid. Nella composizione del volume PDF finale (previsto in formato A4 orizzontale secondo la Bibbia dei Manuali):

1. **Mappatura Cromatica per Stampa / Schermo:**
   - I diagrammi Mermaid forniti in `04_MERMAID/` sono volutamente generati con sintassi universale pulita (senza colori hardcoded).
   - In fase di impaginazione, applicare ai box dei diagrammi i colori della palette estratta:
     - Nodi di ingresso / azione primaria: `#c8ff00` o `#77f117` con testo scuro `#0f172a`.
     - Nodi di processo ordinario: fondo `#1e293b` con testo chiaro `#f8fafc`.
     - Nodi decisionali / condizioni: bordo `#334155` e sfondo scuro.
     - Nodi di errore / stop: accento `#ef4444`.

2. **Gerarchia Tipografica del Manuale:**
   - Titolo Capitolo (H1): 24-28 pt Bold
   - Titolo Paragrafo / Scheda Task (H2): 18-20 pt Bold
   - Sottoparagrafi (H3): 14-16 pt SemiBold
   - Corpo del testo: 10-11 pt Regular (Interlinea 1.4-1.5)
   - Note tecniche / Codice / Monospazio: 9 pt Regular

3. **Integrazione Screenshot:**
   - Inserire le schermate reali acquisite dal client con i riquadri di messa a fuoco (callout numerati) corrispondenti ai passi della sequenza descritta.
