# LIMEN Vault — Landing Design Direction

Status: proposed marketing extension, 11 October 2026. Not a redesign of the desktop app.
Use with DESIGN_SYSTEM.md and PROMPT_GOOGLE_STITCH.txt.

## Purpose

Explain how documents become searchable knowledge and automatically generated wikis.
Primary conversion: download the macOS Apple Silicon preview. Secondary: view GitHub.
English copy. Audience: researchers, consultants, professionals with document collections.
Do not position the product as an Obsidian plugin or a Markdown editor.

## Visual direction

Premium LIGHT editorial design, explicitly requested by the user. White and light Slate
surfaces, deep Slate text, restrained LIMEN lime accents, generous whitespace and precise
alignment. Coherent with the current desktop UI. No dark hero or dark full-width sections.
Use the original black Limen logo without altering its glyphs. The previously generated
dark social cover is NOT the reference for this landing. Preserve screenshots in their
real Light Slate/lime appearance. Prefer product-led visuals and a clean document-to-wiki
flow over decorative architecture. Premium means clarity, typography and proportion.

## Proposed website tokens

Base palette derives from the verified UI; web sizing and composition are proposals.

| Role | Value |
|---|---|
| Background | #FFFFFF |
| Alternating section | #F8FAFC |
| Subtle surface | #F1F5F9 |
| Primary text | #0F172A |
| Secondary text | #475569 |
| Decorative border | #E2E8F0 |
| Interactive boundary | #64748B |
| Brand accent | #77F117 |
| Primary CTA background | #0F172A |
| Primary CTA text | #FFFFFF |
| Primary CTA hover | #1E293B |
| Focus outline | #0F172A |

Use dark primary buttons with white text and white secondary buttons with dark borders.
Reserve lime for small accents, step markers or highlighted labels with dark text. No
lime body text on white. Verify contrast; light decorative borders do not suffice for
interactive input boundaries. Avoid champagne/gold, black backgrounds and luxury textures.

## Type, grid and rhythm

Use a system sans-serif stack for body and controls. Use clean sans-serif headings with deliberate weight and tracking; never redraw the logo. H1: 68/72 px desktop, 40/44 px mobile;
H2: 44/50 px desktop, 30/36 px mobile. Body: 18/28 px; captions: 14/20 px.
Maximum content width 1200 px. Desktop 12 columns, gap 24 px; mobile one column,
24 px side padding. Section spacing 112 px desktop, 64 px mobile.
Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 112.
Buttons: 48 px minimum height, 8 px radius. Product frame: 12 px radius, 1 px border.
Use broad editorial bands and dividers rather than a wall of identical feature cards.
Transitions 160–220 ms; no parallax, autoplay video or scroll hijacking. Respect reduced motion.

## Page anatomy

1. Header: original logo + VAULT; links How it works, Search & Wikis, Privacy, FAQ;
   primary Download for macOS button. Compact mobile menu.
2. Hero: “Your documents. Connected knowledge.” Subheading: “Import documents, turn
   their text into indexed knowledge, search with RAG, and generate thematic wikis.”
   Primary CTA “Download for macOS”; secondary “View on GitHub”. Availability note:
   “macOS Apple Silicon · Preview”. A clean, product-led document-to-knowledge visual on the right.
3. Workflow: Import → Extract & convert → Index & retrieve → Generate wikis.
   Explain Markdown as the generated storage format in supporting copy only.
4. Product evidence: large supplied app screenshot, caption “Desktop v3 — historical
   interface capture, September 2026.” No fabricated current UI or invented results.
5. Two editorial feature stories: RAG search grounded in document passages; automatic
   thematic wikis connecting sources with references. Label conceptual examples as illustrative.
6. Formats strip: Text & structured files; Office documents; Spreadsheets; PDFs & images.
   Note: supported formats and extraction vary by platform; PDF/image OCR currently macOS.
7. Privacy and modes: local search / local answers require configured local models;
   automatic classification and wiki generation currently use OpenAI and send source
   content to that provider, requiring API key and internet. Put this next to the wiki story
   as well, not only in the footer. No “everything offline” claim.
8. FAQ: Need Obsidian? No. Need Markdown input? No. All files supported? No, supported
   formats only. Wikis offline? Current automation uses OpenAI. Windows? Preview development,
   no final installer asserted. License? Decision pending, no open-source-license promise.
9. Final download invitation and light, restrained footer with GitHub link.

## Links

GitHub: https://github.com/cesarenegro/Limen-vault
macOS preview: https://github.com/cesarenegro/Limen-vault/raw/windows-build/USER%20INSTALL/LIMEN-Vault-v7Mini.dmg
The download URL was checked earlier in this session; recheck before a site goes live.
No fake pricing, testimonials, customer logos, install counts, ratings or mailing-list forms.

## Acceptance

Design desktop 1440 px and mobile 390 px. Preserve readable headings, a clear CTA, visible
focus, semantic hierarchy and no horizontal overflow. Present visuals as website design,
not a functioning document upload service. No cloud file upload form. Do not imply a
browser demo can process the visitor's files. Nothing is deployed by this brief.

## Stitch references consulted

https://developers.googleblog.com/en/stitch-a-new-way-to-design-uis/
https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/
These inform use of textual and visual design references; no account-specific UI path
or import action is claimed to have been tested.
