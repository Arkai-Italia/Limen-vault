//! Deterministic text extraction and macOS OCR. No generative model invents source text.
use quick_xml::{events::Event, Reader};
use serde::{Deserialize, Serialize};
use std::{
    io::{Cursor, Read},
    path::Path,
};
#[cfg(target_os = "macos")]
use std::{
    process::{Command, Stdio},
    time::{Duration, Instant},
};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ExtractionOutput {
    pub text: String,
    pub is_partial: bool,
    pub warnings: Vec<String>,
}

impl ExtractionOutput {
    pub fn simple(text: String) -> Self {
        Self {
            text,
            is_partial: false,
            warnings: Vec::new(),
        }
    }
}

fn err(e: impl std::fmt::Display) -> String {
    e.to_string()
}
const MAX: usize = 16 * 1024 * 1024;
struct Scratch(std::path::PathBuf);
impl Scratch {
    fn new() -> Result<Self, String> {
        let p = std::env::temp_dir().join(format!("limen-extract-{}", crate::ai::random_token()?));
        let mut builder = std::fs::DirBuilder::new();
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            builder.mode(0o700);
        }
        builder.create(&p).map_err(err)?;
        Ok(Self(p))
    }
}
impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}
fn xml_text(bytes: &[u8]) -> Result<String, String> {
    let mut r = Reader::from_reader(bytes);
    let mut out = String::new();
    loop {
        match r.read_event().map_err(err)? {
            Event::Text(t) => out.push_str(&t.unescape().map_err(err)?),
            Event::End(e) => match e.local_name().as_ref() {
                b"p" | b"h" => out.push_str("\n\n"),
                b"tc" => out.push('\t'),
                b"tr" => out.push('\n'),
                _ => {}
            },
            Event::Empty(e) if e.local_name().as_ref() == b"br" => out.push('\n'),
            Event::Empty(e) if e.local_name().as_ref() == b"tab" => out.push('\t'),
            Event::DocType(_) => return Err("DTD non consentito nei documenti".into()),
            Event::Eof => break,
            _ => {}
        }
        if out.len() > MAX {
            return Err("Documento estratto oltre 16 MB".into());
        }
    }
    Ok(out)
}
fn entry(z: &mut zip::ZipArchive<Cursor<&[u8]>>, name: &str) -> Result<Vec<u8>, String> {
    let mut f = z.by_name(name).map_err(err)?;
    if f.size() > MAX as u64 {
        return Err("Componente documento oltre 16 MB".into());
    }
    let mut b = Vec::new();
    f.by_ref()
        .take(MAX as u64 + 1)
        .read_to_end(&mut b)
        .map_err(err)?;
    if b.len() > MAX {
        return Err("Componente documento eccessivo".into());
    }
    Ok(b)
}
fn relationships(bytes: &[u8]) -> Result<std::collections::BTreeMap<String, String>, String> {
    let mut r = Reader::from_reader(bytes);
    let mut m = std::collections::BTreeMap::new();
    loop {
        match r.read_event().map_err(err)? {
            Event::Start(e) | Event::Empty(e) if e.local_name().as_ref() == b"Relationship" => {
                let mut id = String::new();
                let mut target = String::new();
                for a in e.attributes() {
                    let a = a.map_err(err)?;
                    match a.key.as_ref() {
                        b"Id" => id = a.decode_and_unescape_value(&r).map_err(err)?.into_owned(),
                        b"Target" => {
                            target = a.decode_and_unescape_value(&r).map_err(err)?.into_owned()
                        }
                        _ => {}
                    }
                }
                m.insert(id, target);
            }
            Event::Eof => break,
            _ => {}
        }
    }
    Ok(m)
}
fn office(bytes: &[u8], ext: &str) -> Result<ExtractionOutput, String> {
    let mut z = zip::ZipArchive::new(Cursor::new(bytes))
        .map_err(|_| "Documento Office corrotto o protetto")?;
    if z.len() > 20000 {
        return Err("Troppi componenti nel documento".into());
    }
    let mut out = String::new();
    if ext == "docx" {
        out = xml_text(&entry(&mut z, "word/document.xml")?)?;
        let extras: Vec<_> = z
            .file_names()
            .filter(|n| {
                n.starts_with("word/header")
                    || n.starts_with("word/footer")
                    || *n == "word/footnotes.xml"
                    || *n == "word/endnotes.xml"
            })
            .map(str::to_owned)
            .collect();
        for n in extras {
            out.push_str(&format!("\n\n## {n}\n\n{}", xml_text(&entry(&mut z, &n)?)?));
        }
    } else if ext == "odt" {
        out = xml_text(&entry(&mut z, "content.xml")?)?;
    } else {
        let rel = relationships(&entry(&mut z, "ppt/_rels/presentation.xml.rels")?)?;
        let xml = entry(&mut z, "ppt/presentation.xml")?;
        let mut r = Reader::from_reader(xml.as_slice());
        let mut slide = 0;
        loop {
            match r.read_event().map_err(err)? {
                Event::Start(e) | Event::Empty(e) if e.local_name().as_ref() == b"sldId" => {
                    for a in e.attributes() {
                        let a = a.map_err(err)?;
                        if a.key.as_ref() == b"r:id" {
                            let id = a.decode_and_unescape_value(&r).map_err(err)?;
                            let target = rel.get(id.as_ref()).ok_or("Relazione slide mancante")?;
                            let name = if target.starts_with("/ppt/") {
                                target.trim_start_matches('/').to_string()
                            } else {
                                format!("ppt/{target}")
                            };
                            slide += 1;
                            out.push_str(&format!(
                                "\n\n## Slide {slide}\n\n{}",
                                xml_text(&entry(&mut z, &name)?)?
                            ));
                        }
                    }
                }
                Event::Eof => break,
                _ => {}
            }
        }
    }
    let pictures: Vec<_> = z
        .file_names()
        .filter(|n| {
            (n.starts_with("word/media/")
                || n.starts_with("ppt/media/")
                || n.starts_with("Pictures/"))
                && ["png", "jpg", "jpeg", "tif", "tiff", "webp"]
                    .contains(&n.rsplit('.').next().unwrap_or("").to_lowercase().as_str())
        })
        .map(str::to_owned)
        .collect();
    let mut is_partial = false;
    let mut warnings = Vec::new();
    for picture in pictures {
        let data = match entry(&mut z, &picture) {
            Ok(d) => d,
            Err(e) => {
                is_partial = true;
                warnings.push(format!("Impossibile leggere componente immagine '{picture}': {e}"));
                continue;
            }
        };
        match vision(&data, picture.rsplit('.').next().unwrap_or("png")) {
            Ok(text) => out.push_str(&format!(
                "\n\n### Testo immagine incorporata: {picture}\n\n{text}"
            )),
            Err(e) if e.contains("Nessun testo riconoscibile") => {}
            Err(e) => {
                is_partial = true;
                warnings.push(format!("OCR immagine incorporata '{picture}' non completato: {e}"));
            }
        }
    }
    if out.len() > MAX {
        return Err("Documento estratto oltre 16 MB".into());
    }
    if out.trim().is_empty() && !is_partial {
        return Err("Documento senza testo riconoscibile".into());
    }
    Ok(ExtractionOutput {
        text: out,
        is_partial,
        warnings,
    })
}
#[cfg(test)]
thread_local! {
    static TEST_OCR_MOCK: std::cell::RefCell<Option<Box<dyn Fn(&[u8], &str) -> Result<String, String>>>> =
        std::cell::RefCell::new(None);
}

#[cfg(test)]
pub fn with_test_ocr<F, R>(mock: Box<dyn Fn(&[u8], &str) -> Result<String, String>>, f: F) -> R
where
    F: FnOnce() -> R,
{
    TEST_OCR_MOCK.with(|m| {
        *m.borrow_mut() = Some(mock);
    });
    struct Reset;
    impl Drop for Reset {
        fn drop(&mut self) {
            TEST_OCR_MOCK.with(|m| *m.borrow_mut() = None);
        }
    }
    let _reset = Reset;
    f()
}

fn vision(bytes: &[u8], ext: &str) -> Result<String, String> {
    #[cfg(test)]
    {
        let custom = TEST_OCR_MOCK.with(|m| {
            if let Some(ref f) = *m.borrow() {
                Some(f(bytes, ext))
            } else {
                None
            }
        });
        if let Some(res) = custom {
            return res;
        }
    }
    vision_impl(bytes, ext)
}

#[cfg(target_os = "macos")]
fn vision_impl(bytes: &[u8], ext: &str) -> Result<String, String> {
    use std::os::unix::fs::PermissionsExt;
    let scratch = Scratch::new()?;
    // A distributed app executes its signed, notarized bundled helper.
    // Unit tests and the unbundled development harness use the embedded helper.
    let executable = std::env::current_exe().map_err(err)?;
    let bundle_contents = executable.parent().filter(|p| p.file_name().is_some_and(|n| n == "MacOS")).and_then(|p| p.parent());
    let binary = if let Some(contents) = bundle_contents {
        let helper = contents.join("Resources/native/limen-extract");
        if !helper.is_file() { return Err("Componente OCR mancante nel pacchetto LIMEN".into()); }
        helper
    } else {
    let binary = scratch.0.join("extract");
    std::fs::write(
        &binary,
        include_bytes!(concat!(env!("OUT_DIR"), "/limen-extract")),
    )
    .map_err(err)?;
    std::fs::set_permissions(&binary, std::fs::Permissions::from_mode(0o700)).map_err(err)?;
    binary
    };
    let input = scratch.0.join("input");
    let output = scratch.0.join("result.json");
    std::fs::write(&input, bytes).map_err(err)?;
    let mut child = Command::new(&binary)
        .arg(&input)
        .arg(ext)
        .arg(&output)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(err)?;
    let start = Instant::now();
    let status = loop {
        if let Some(s) = child.try_wait().map_err(err)? {
            break s;
        }
        if start.elapsed() > Duration::from_secs(180) {
            let _ = child.kill();
            let _ = child.wait();
            return Err("Tempo massimo estrazione OCR superato".into());
        }
        std::thread::sleep(Duration::from_millis(50));
    };
    let result: serde_json::Value =
        serde_json::from_slice(&std::fs::read(output).map_err(err)?).map_err(err)?;
    if !status.success() {
        return Err(result["error"]
            .as_str()
            .unwrap_or("Estrazione OCR non riuscita")
            .into());
    }
    result["markdown"]
        .as_str()
        .map(str::to_owned)
        .ok_or("Testo estratto assente".into())
}
#[cfg(target_os = "windows")]
fn vision_impl(bytes: &[u8], ext: &str) -> Result<String, String> {
    if ext == "pdf" {
        let out = crate::win_ocr::extract_pdf_windows(bytes)?;
        Ok(out.text)
    } else {
        crate::win_ocr::run_tesseract_ocr(bytes, ext)
    }
}
#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn vision_impl(_: &[u8], _: &str) -> Result<String, String> {
    Err("OCR locale supportato solo su macOS e Windows".into())
}
pub fn extract(bytes: &[u8], name: &str) -> Result<ExtractionOutput, String> {
    let ext = Path::new(name)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    match ext.as_str() {
        "docx" | "pptx" | "odt" => office(bytes, &ext),
        #[cfg(target_os = "windows")]
        "pdf" => {
            #[cfg(test)]
            {
                let custom = TEST_OCR_MOCK.with(|m| {
                    if let Some(ref f) = *m.borrow() {
                        Some(f(bytes, "pdf"))
                    } else {
                        None
                    }
                });
                if let Some(res) = custom {
                    return res.map(ExtractionOutput::simple);
                }
            }
            crate::win_ocr::extract_pdf_windows(bytes)
        }
        #[cfg(not(target_os = "windows"))]
        "pdf" => vision(bytes, &ext).map(ExtractionOutput::simple),
        "png" | "jpg" | "jpeg" | "webp" | "gif" | "tif" | "tiff" | "heic" => {
            vision(bytes, &ext).map(ExtractionOutput::simple)
        }
        #[cfg(target_os = "macos")]
        "doc" | "rtf" => {
            let scratch = Scratch::new()?;
            let input = scratch.0.join(format!("input.{ext}"));
            std::fs::write(&input, bytes).map_err(err)?;
            let output = scratch.0.join("output.txt");
            let mut child = Command::new("/usr/bin/textutil")
                .args(["-convert", "txt", "-output"])
                .arg(&output)
                .arg(input)
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .spawn()
                .map_err(err)?;
            let start = Instant::now();
            let status = loop {
                if let Some(status) = child.try_wait().map_err(err)? {
                    break status;
                }
                if start.elapsed() > Duration::from_secs(60) {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err("Tempo massimo conversione documento superato".into());
                }
                std::thread::sleep(Duration::from_millis(50));
            };
            if !status.success() {
                return Err("Documento non leggibile o protetto".into());
            }
            if std::fs::metadata(&output).map_err(err)?.len() > MAX as u64 {
                return Err("Documento estratto oltre 16 MB".into());
            }
            std::fs::read_to_string(output)
                .map_err(err)
                .map(ExtractionOutput::simple)
        }
        #[cfg(target_os = "windows")]
        "rtf" => crate::win_ocr::extract_rtf(bytes),
        #[cfg(target_os = "windows")]
        "doc" => crate::win_ocr::extract_doc(bytes),
        #[cfg(not(any(target_os = "macos", target_os = "windows")))]
        "doc" | "rtf" => Err("Conversione DOC/RTF non supportata su questa piattaforma".into()),
        _ => Err("Formato non documentale o non supportato: originale conservato".into()),
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn word_and_slides_are_literal() {
        let doc = extract(
            include_bytes!("../../tests/fixtures/auto-knowledge/documento.docx"),
            "x.docx",
        )
        .unwrap();
        assert!(doc.text.contains("LIMEN-DOCX-742"));
        assert!(!doc.is_partial);
        assert!(doc.warnings.is_empty());

        let slides = extract(
            include_bytes!("../../tests/fixtures/auto-knowledge/presentazione.pptx"),
            "x.pptx",
        )
        .unwrap();
        assert!(slides.text.contains("LIMEN-PPTX-318"));
        assert!(!slides.text.contains("Metodologia"));
        assert_eq!(slides.text.matches("## Slide").count(), 1);
        assert!(!slides.is_partial);
        assert!(slides.warnings.is_empty());
    }

    #[test]
    fn test_controlled_ocr_success_merges_text_and_no_warnings() {
        let bytes = include_bytes!("../../tests/fixtures/auto-knowledge/documento_con_immagine.docx");
        with_test_ocr(
            Box::new(|_, _| Ok("TESTO-OCR-RICONOSCIUTO-SUCCESS-42".into())),
            || {
                let out = extract(bytes, "doc_img.docx").expect("Estrazione con OCR riuscito deve avere successo");
                assert!(!out.is_partial, "Con OCR riuscito is_partial deve essere false");
                assert!(out.warnings.is_empty(), "I warning devono essere vuoti con OCR riuscito");
                assert!(out.text.contains("LIMEN-DOCX-742"), "Il testo principale deve essere presente");
                assert!(out.text.contains("TESTO-OCR-RICONOSCIUTO-SUCCESS-42"), "Il testo OCR dell'immagine deve essere unito");
            },
        );
    }

    #[test]
    fn test_controlled_ocr_failure_preserves_text_and_records_specific_warning() {
        let bytes = include_bytes!("../../tests/fixtures/auto-knowledge/documento_con_immagine.docx");
        with_test_ocr(
            Box::new(|_, _| Err("Contrasto scanner insufficiente".into())),
            || {
                let out = extract(bytes, "doc_img.docx").expect("Estrazione parziale deve restituire Ok con testo principale");
                assert!(out.is_partial, "Con OCR fallito is_partial deve essere true");
                assert!(!out.warnings.is_empty(), "I warning devono contenere la causa");
                assert!(
                    out.warnings.iter().any(|w| w.contains("Contrasto scanner insufficiente")),
                    "Il warning deve specificare la causa controllata dell'errore: {:?}",
                    out.warnings
                );
                assert!(out.text.contains("LIMEN-DOCX-742"), "Il testo principale deve essere preservato");
            },
        );
    }

    #[test]
    fn test_unreadable_or_oversized_image_component_handled_gracefully() {
        use std::io::Write;
        let mut cur = std::io::Cursor::new(Vec::new());
        {
            let mut writer = zip::ZipWriter::new(&mut cur);
            let opts = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
            writer.start_file("word/document.xml", opts).unwrap();
            writer
                .write_all(b"<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p><w:r><w:t>TESTO-PRINCIPALE-PRESERVATO-999</w:t></w:r></w:p></w:body></w:document>")
                .unwrap();
            // Inseriamo un componente immagine oltre la soglia massima (17 MB di zeri, compressi a pochissimi byte)
            writer.start_file("word/media/image_huge.png", opts).unwrap();
            let zeros = vec![0u8; 17 * 1024 * 1024];
            writer.write_all(&zeros).unwrap();
            writer.finish().unwrap();
        }
        let docx_bytes = cur.into_inner();
        let out = extract(&docx_bytes, "test_huge.docx").expect("Documento con componente immagine oltre limite deve restituire Ok parziale");
        assert!(out.is_partial, "is_partial deve essere true per componente oltre limite");
        assert!(
            out.warnings.iter().any(|w| w.contains("Componente documento oltre 16 MB") || w.contains("Impossibile leggere componente immagine")),
            "Deve essere registrato l'avviso sul componente non leggibile: {:?}",
            out.warnings
        );
        assert!(out.text.contains("TESTO-PRINCIPALE-PRESERVATO-999"), "Il testo XML principale deve essere integro");
    }

    #[test]
    fn test_empty_text_document_with_failed_ocr_yields_partial_status() {
        use std::io::Write;
        let mut cur = std::io::Cursor::new(Vec::new());
        {
            let mut writer = zip::ZipWriter::new(&mut cur);
            let opts = zip::write::SimpleFileOptions::default();
            writer.start_file("word/document.xml", opts).unwrap();
            writer
                .write_all(b"<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p/></w:body></w:document>")
                .unwrap();
            writer.start_file("word/media/image1.png", opts).unwrap();
            writer.write_all(b"\x89PNG\r\n\x1a\nfakeimage").unwrap();
            writer.finish().unwrap();
        }
        let docx_bytes = cur.into_inner();
        with_test_ocr(
            Box::new(|_, _| Err("Riconoscimento fallito: immagine sfuocata".into())),
            || {
                let out = extract(&docx_bytes, "empty_text.docx").expect("Testo vuoto ma con errore OCR deve restituire Ok con is_partial=true");
                assert!(out.is_partial, "is_partial deve essere true");
                assert!(out.text.trim().is_empty(), "Il testo deve essere vuoto");
                assert!(
                    out.warnings.iter().any(|w| w.contains("immagine sfuocata")),
                    "L'avviso specifico deve essere registrato nei warning: {:?}",
                    out.warnings
                );
            },
        );
    }

    #[test]
    fn test_spike_fixture_5_office_controlled_ocr_failure() {
        let fixture_bytes = include_bytes!("../../tests/fixtures/ocr-spike/fixture_5_office_guasto_ocr.docx");
        let out = extract(fixture_bytes, "fixture_5_office_guasto_ocr.docx")
            .expect("Estrazione DOCX con immagine corrotta deve restituire Ok con contratto parziale");
        assert!(out.is_partial, "is_partial deve essere true per immagine con guasto OCR");
        assert!(
            out.text.contains("LIMEN-DOCX-GUASTO-TESTO-XML"),
            "Il testo XML principale deve essere estratto integralmente: {}",
            out.text
        );
        assert!(
            out.warnings.iter().any(|w| w.contains("word/media/image1.png")),
            "Deve essere registrato l'avviso specifico sul fallimento dell'immagine: {:?}",
            out.warnings
        );
    }

    #[test]
    fn test_spike_fixture_1_standalone_image_with_accents() {
        let fixture_bytes = include_bytes!("../../tests/fixtures/ocr-spike/fixture_1_immagine_autonoma.png");
        let expected_ocr_text = "LIMEN Vault: Sistema di Memoria Locale con Riconoscimento Ottico ed Accenti: caffe, perche, citta, virtu.";
        with_test_ocr(
            Box::new(move |bytes, ext| {
                assert_eq!(ext, "png");
                assert!(!bytes.is_empty());
                Ok(expected_ocr_text.to_string())
            }),
            || {
                let out = extract(fixture_bytes, "fixture_1_immagine_autonoma.png")
                    .expect("Estrazione immagine PNG con OCR riuscito deve completare");
                assert!(!out.is_partial, "is_partial deve essere false");
                assert!(out.warnings.is_empty(), "I warning devono essere vuoti");
                assert_eq!(out.text, expected_ocr_text);
            },
        );
    }

    #[test]
    fn test_spike_fixture_2_vector_pdf_extracts_cleanly() {
        let fixture_bytes = include_bytes!("../../tests/fixtures/ocr-spike/fixture_2_pdf_vettoriale_puro.pdf");
        let expected_text = "LIMEN-PDF-VETTORIALE-PURO: Questo documento contiene esclusivamente testo digitale vettoriale nativo.";
        with_test_ocr(
            Box::new(move |bytes, ext| {
                assert_eq!(ext, "pdf");
                assert!(!bytes.is_empty());
                Ok(expected_text.to_string())
            }),
            || {
                let out = extract(fixture_bytes, "fixture_2_pdf_vettoriale_puro.pdf")
                    .expect("Estrazione PDF vettoriale puro deve completare con successo");
                assert!(!out.is_partial, "is_partial deve essere false");
                assert!(out.warnings.is_empty(), "I warning devono essere vuoti");
                assert_eq!(out.text, expected_text);
            },
        );
    }

    #[test]
    fn test_spike_fixture_3_scanned_pure_pdf() {
        let fixture_bytes = include_bytes!("../../tests/fixtures/ocr-spike/fixture_3_pdf_scansionato_puro.pdf");
        let expected_text = "LIMEN-PDF-SCANSIONE-PURA: Documento rasterizzato senza stream di testo.";
        with_test_ocr(
            Box::new(move |bytes, ext| {
                assert_eq!(ext, "pdf");
                assert!(!bytes.is_empty());
                Ok(expected_text.to_string())
            }),
            || {
                let out = extract(fixture_bytes, "fixture_3_pdf_scansionato_puro.pdf")
                    .expect("Estrazione PDF scansionato puro deve restituire testo OCR");
                assert!(!out.is_partial);
                assert!(out.warnings.is_empty());
                assert_eq!(out.text, expected_text);
            },
        );
    }

    #[test]
    fn test_spike_fixture_4_mixed_pdf_extracts_both_without_duplication() {
        let fixture_bytes = include_bytes!("../../tests/fixtures/ocr-spike/fixture_4_pdf_misto.pdf");
        let vector_text = "LIMEN-PDF-MISTO-TESTO-VETTORIALE: Sezione 1 testo digitale estratto nativamente.";
        let graphic_text = "LIMEN-PDF-MISTO-TESTO-GRAFICO: Sezione 2 testo grafico immagine distinta.";
        
        // Simula la pipeline ibrida OCR per PDF misto: estrazione vettoriale + OCR grafico distinto
        with_test_ocr(
            Box::new(move |bytes, ext| {
                assert_eq!(ext, "pdf");
                assert!(!bytes.is_empty());
                // La pipeline ibrida combina testo vettoriale e testo grafico distinto
                Ok(format!("{vector_text}\n\n{graphic_text}"))
            }),
            || {
                let out = extract(fixture_bytes, "fixture_4_pdf_misto.pdf").unwrap();
                assert!(!out.is_partial);
                assert!(out.warnings.is_empty());
                assert!(out.text.contains(vector_text), "Testo vettoriale deve essere presente");
                assert!(out.text.contains(graphic_text), "Testo grafico deve essere presente");
                // Verifica assenza di duplicazioni: ciascun blocco compare esattamente una volta
                assert_eq!(out.text.matches(vector_text).count(), 1, "Il testo vettoriale non deve essere duplicato");
                assert_eq!(out.text.matches(graphic_text).count(), 1, "Il testo grafico non deve essere duplicato");
            },
        );
    }

    #[test]
    #[cfg(target_os = "macos")]
    fn pdf_and_scans_use_native_extraction() {
        let pdf = extract(
            include_bytes!("../../tests/fixtures/auto-knowledge/documento.pdf"),
            "x.pdf",
        )
        .unwrap();
        assert!(pdf.text.contains("LIMEN-PDF-529"));
        assert!(pdf.text.contains("LIMEN-PDF-FINE"));
        for (name, b) in [
            (
                "x.png",
                include_bytes!("../../tests/fixtures/auto-knowledge/scansione.png").as_slice(),
            ),
            (
                "x.pdf",
                include_bytes!("../../tests/fixtures/auto-knowledge/scansione.pdf").as_slice(),
            ),
        ] {
            assert!(extract(b, name).unwrap().text.contains("LIMEN-OCR-861"));
        }
    }
}
