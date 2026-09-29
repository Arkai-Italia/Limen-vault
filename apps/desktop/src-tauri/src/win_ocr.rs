//! Native document extraction and OCR engine for Windows 11 x64.
//! Uses Chromium PDFium for PDF vector text & page rasterization,
//! Tesseract 5.4 + Leptonica for local offline OCR with ita+eng models,
//! rtf-parser for RTF documents, and cfb for legacy Word 97-2004 DOC binary files.

use std::{
    ffi::c_void,
    io::{Cursor, Read},
    path::PathBuf,
    process::{Command, Stdio},
    time::{Duration, Instant},
};

use crate::extraction::ExtractionOutput;

#[cfg(target_os = "windows")]
use windows_sys::Win32::Foundation::FreeLibrary;
#[cfg(target_os = "windows")]
use windows_sys::Win32::System::LibraryLoader::{GetProcAddress, LoadLibraryW};

const MAX_DOC_SIZE: usize = 16 * 1024 * 1024;
const CREATE_NO_WINDOW: u32 = 0x08000000;

fn err_str(e: impl std::fmt::Display) -> String {
    e.to_string()
}

/// Resolves a bundled native file (binary, dll, or directory) across installation and dev paths.
pub fn resolve_native_file(name: &str) -> Option<PathBuf> {
    // 1. Check relative to current executable (installed layout: %LOCALAPPDATA%\Programs\...\native\name)
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let candidates = [
                parent.join("native").join(name),
                parent.join(name),
                parent.join("resources").join("native").join(name),
            ];
            for cand in &candidates {
                if cand.exists() {
                    return Some(cand.clone());
                }
            }
        }
    }

    // 2. Check development and test paths
    let dev_candidates = [
        format!("apps/desktop/src-tauri/resources/native-windows/{name}"),
        format!("resources/native-windows/{name}"),
        format!("ISOLATED_TEST_ENV/native_binaries/{name}"),
        format!("ISOLATED_TEST_ENV/{name}"),
        format!("apps/desktop/src-tauri/resources/native-windows/tessdata/{name}"),
        format!("resources/native-windows/tessdata/{name}"),
    ];
    for cand in &dev_candidates {
        let p = PathBuf::from(cand);
        if p.exists() {
            return Some(p);
        }
    }

    // 3. Check workspace absolute root if on drive E:
    let abs_candidates = [
        format!("E:/Projects/vault_memai_obsi/apps/desktop/src-tauri/resources/native-windows/{name}"),
        format!("E:/Projects/vault_memai_obsi/ISOLATED_TEST_ENV/native_binaries/{name}"),
        format!("E:/Projects/vault_memai_obsi/ISOLATED_TEST_ENV/{name}"),
    ];
    for cand in &abs_candidates {
        let p = PathBuf::from(cand);
        if p.exists() {
            return Some(p);
        }
    }

    None
}

/// Resolves the tessdata directory containing language models.
pub fn resolve_tessdata_dir() -> Option<PathBuf> {
    if let Some(p) = resolve_native_file("tessdata") {
        if p.is_dir() {
            return Some(p);
        }
    }
    if let Some(ita) = resolve_native_file("ita.traineddata") {
        if let Some(parent) = ita.parent() {
            return Some(parent.to_path_buf());
        }
    }
    None
}

/// Executes native Tesseract OCR on an image file or in-memory image bytes.
pub fn run_tesseract_ocr(image_bytes: &[u8], ext: &str) -> Result<String, String> {
    if image_bytes.len() > MAX_DOC_SIZE {
        return Err("Immagine per OCR oltre 16 MB".into());
    }

    let tesseract_exe = resolve_native_file("tesseract.exe")
        .ok_or_else(|| "Binario tesseract.exe non trovato nel bundle di LIMEN Vault".to_string())?;
    let tessdata_dir = resolve_tessdata_dir()
        .ok_or_else(|| "Cartella modelli tessdata non trovata nel bundle di LIMEN Vault".to_string())?;

    // Create a temporary scratch directory for input and output
    let temp_token = crate::ai::random_token().unwrap_or_else(|_| "ocr-tmp".to_string());
    let temp_dir = std::env::temp_dir().join(format!("limen-tess-{temp_token}"));
    std::fs::create_dir_all(&temp_dir).map_err(err_str)?;

    struct TempDirGuard(PathBuf);
    impl Drop for TempDirGuard {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }
    let _guard = TempDirGuard(temp_dir.clone());

    let input_file = temp_dir.join(format!("input.{ext}"));
    std::fs::write(&input_file, image_bytes).map_err(err_str)?;
    let output_base = temp_dir.join("ocr_result");

    let mut cmd = Command::new(&tesseract_exe);
    cmd.arg(&input_file)
        .arg(&output_base)
        .arg("-l")
        .arg("ita+eng")
        .arg("--tessdata-dir")
        .arg(&tessdata_dir)
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = cmd.spawn().map_err(|e| format!("Avvio tesseract.exe fallito: {e}"))?;
    let start = Instant::now();
    let status = loop {
        if let Some(s) = child.try_wait().map_err(err_str)? {
            break s;
        }
        if start.elapsed() > Duration::from_secs(60) {
            let _ = child.kill();
            let _ = child.wait();
            return Err("Tempo massimo OCR Tesseract superato (60s)".into());
        }
        std::thread::sleep(Duration::from_millis(50));
    };

    let result_file = temp_dir.join("ocr_result.txt");
    if !status.success() || !result_file.exists() {
        return Err("Riconoscimento OCR fallito o testo non rilevabile".into());
    }

    let text = std::fs::read_to_string(&result_file).map_err(err_str)?;
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return Err("Nessun testo riconoscibile nell'immagine".into());
    }

    Ok(trimmed.to_string())
}

// ---------------------------------------------------------------------------
// PDFium FFI Dynamic Loader for Windows
// ---------------------------------------------------------------------------

#[cfg(target_os = "windows")]
struct PdfiumLib {
    handle: *mut c_void,
    fpdf_init: unsafe extern "C" fn(*const c_void),
    fpdf_destroy: unsafe extern "C" fn(),
    fpdf_load_mem_doc: unsafe extern "C" fn(*const c_void, i32, *const i8) -> *mut c_void,
    fpdf_close_doc: unsafe extern "C" fn(*mut c_void),
    fpdf_get_page_count: unsafe extern "C" fn(*mut c_void) -> i32,
    fpdf_load_page: unsafe extern "C" fn(*mut c_void, i32) -> *mut c_void,
    fpdf_close_page: unsafe extern "C" fn(*mut c_void),
    fpdf_get_page_width_f: unsafe extern "C" fn(*mut c_void) -> f32,
    fpdf_get_page_height_f: unsafe extern "C" fn(*mut c_void) -> f32,
    fpdf_bitmap_create_ex: unsafe extern "C" fn(i32, i32, i32, *mut c_void, i32) -> *mut c_void,
    fpdf_bitmap_fill_rect: unsafe extern "C" fn(*mut c_void, i32, i32, i32, i32, u32),
    fpdf_render_page_bitmap:
        unsafe extern "C" fn(*mut c_void, *mut c_void, i32, i32, i32, i32, i32, i32),
    fpdf_bitmap_get_buffer: unsafe extern "C" fn(*mut c_void) -> *const u8,
    fpdf_bitmap_get_stride: unsafe extern "C" fn(*mut c_void) -> i32,
    fpdf_bitmap_destroy: unsafe extern "C" fn(*mut c_void),
    fpdf_text_load_page: unsafe extern "C" fn(*mut c_void) -> *mut c_void,
    fpdf_text_close_page: unsafe extern "C" fn(*mut c_void),
    fpdf_text_count_chars: unsafe extern "C" fn(*mut c_void) -> i32,
    fpdf_text_get_text: unsafe extern "C" fn(*mut c_void, i32, i32, *mut u16) -> i32,
}

unsafe impl Send for PdfiumLib {}
unsafe impl Sync for PdfiumLib {}

static PDFIUM_LIB: std::sync::OnceLock<Result<PdfiumLib, String>> = std::sync::OnceLock::new();

#[cfg(target_os = "windows")]
impl PdfiumLib {
    fn global() -> Result<&'static Self, String> {
        PDFIUM_LIB
            .get_or_init(Self::load)
            .as_ref()
            .map_err(|e| e.clone())
    }

    fn load() -> Result<Self, String> {
        let pdfium_path = resolve_native_file("pdfium.dll")
            .ok_or_else(|| "Libreria pdfium.dll non trovata nel pacchetto LIMEN Vault".to_string())?;

        let wide_path: Vec<u16> = pdfium_path
            .as_os_str()
            .to_string_lossy()
            .encode_utf16()
            .chain(std::iter::once(0))
            .collect();

        let handle = unsafe { LoadLibraryW(wide_path.as_ptr()) };
        if handle.is_null() {
            return Err(format!(
                "Caricamento di pdfium.dll fallito da percorso: {}",
                pdfium_path.display()
            ));
        }

        unsafe fn get_sym<T>(handle: *mut c_void, name: &[u8]) -> Result<T, String> {
            let proc = GetProcAddress(handle, name.as_ptr());
            if proc.is_none() {
                let name_str = String::from_utf8_lossy(name);
                return Err(format!("Simbolo PDFium mancante: {name_str}"));
            }
            Ok(std::mem::transmute_copy(&proc))
        }

        let lib = unsafe {
            Self {
                handle,
                fpdf_init: get_sym(handle, b"FPDF_InitLibraryWithConfig\0")?,
                fpdf_destroy: get_sym(handle, b"FPDF_DestroyLibrary\0")?,
                fpdf_load_mem_doc: get_sym(handle, b"FPDF_LoadMemDocument\0")?,
                fpdf_close_doc: get_sym(handle, b"FPDF_CloseDocument\0")?,
                fpdf_get_page_count: get_sym(handle, b"FPDF_GetPageCount\0")?,
                fpdf_load_page: get_sym(handle, b"FPDF_LoadPage\0")?,
                fpdf_close_page: get_sym(handle, b"FPDF_ClosePage\0")?,
                fpdf_get_page_width_f: get_sym(handle, b"FPDF_GetPageWidthF\0")?,
                fpdf_get_page_height_f: get_sym(handle, b"FPDF_GetPageHeightF\0")?,
                fpdf_bitmap_create_ex: get_sym(handle, b"FPDFBitmap_CreateEx\0")?,
                fpdf_bitmap_fill_rect: get_sym(handle, b"FPDFBitmap_FillRect\0")?,
                fpdf_render_page_bitmap: get_sym(handle, b"FPDF_RenderPageBitmap\0")?,
                fpdf_bitmap_get_buffer: get_sym(handle, b"FPDFBitmap_GetBuffer\0")?,
                fpdf_bitmap_get_stride: get_sym(handle, b"FPDFBitmap_GetStride\0")?,
                fpdf_bitmap_destroy: get_sym(handle, b"FPDFBitmap_Destroy\0")?,
                fpdf_text_load_page: get_sym(handle, b"FPDFText_LoadPage\0")?,
                fpdf_text_close_page: get_sym(handle, b"FPDFText_ClosePage\0")?,
                fpdf_text_count_chars: get_sym(handle, b"FPDFText_CountChars\0")?,
                fpdf_text_get_text: get_sym(handle, b"FPDFText_GetText\0")?,
            }
        };

        unsafe {
            (lib.fpdf_init)(std::ptr::null());
        }

        Ok(lib)
    }
}

/// Encodes raw BGRA buffer into BMP file bytes for Leptonica/Tesseract consumption.
fn encode_bmp_bgra(width: i32, height: i32, stride: i32, buffer: &[u8]) -> Vec<u8> {
    let row_size = ((width * 3 + 3) / 4) * 4; // 24-bit BGR padded to 4 bytes
    let image_data_size = row_size as usize * height as usize;
    let file_size = 54 + image_data_size;

    let mut bmp = Vec::with_capacity(file_size);
    // BMP Header (14 bytes)
    bmp.extend_from_slice(b"BM");
    bmp.extend_from_slice(&(file_size as u32).to_le_bytes());
    bmp.extend_from_slice(&0u32.to_le_bytes()); // Reserved
    bmp.extend_from_slice(&54u32.to_le_bytes()); // Offset to pixel data

    // DIB Header (BITMAPINFOHEADER - 40 bytes)
    bmp.extend_from_slice(&40u32.to_le_bytes()); // Header size
    bmp.extend_from_slice(&width.to_le_bytes());
    bmp.extend_from_slice(&height.to_le_bytes()); // Positive for bottom-up
    bmp.extend_from_slice(&1u16.to_le_bytes()); // Color planes
    bmp.extend_from_slice(&24u16.to_le_bytes()); // 24-bit BGR
    bmp.extend_from_slice(&0u32.to_le_bytes()); // BI_RGB (uncompressed)
    bmp.extend_from_slice(&(image_data_size as u32).to_le_bytes());
    bmp.extend_from_slice(&2835u32.to_le_bytes()); // ~72 DPI horizontal (pixels/meter)
    bmp.extend_from_slice(&2835u32.to_le_bytes()); // ~72 DPI vertical
    bmp.extend_from_slice(&0u32.to_le_bytes()); // Colors in palette
    bmp.extend_from_slice(&0u32.to_le_bytes()); // Important colors

    // Pixel data: bottom-up row order
    let padding = (row_size as usize) - (width as usize * 3);
    for y in (0..height).rev() {
        let row_start = (y as usize) * (stride as usize);
        for x in 0..width as usize {
            let px = row_start + x * 4; // BGRA in PDFium buffer
            if px + 2 < buffer.len() {
                bmp.push(buffer[px]); // Blue
                bmp.push(buffer[px + 1]); // Green
                bmp.push(buffer[px + 2]); // Red
            } else {
                bmp.extend_from_slice(&[255, 255, 255]);
            }
        }
        for _ in 0..padding {
            bmp.push(0);
        }
    }

    bmp
}

static PDFIUM_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

/// Extracts text and OCR content from PDF files on Windows using PDFium and Tesseract.
#[cfg(target_os = "windows")]
pub fn extract_pdf_windows(bytes: &[u8]) -> Result<ExtractionOutput, String> {
    let _guard = PDFIUM_LOCK.lock().map_err(|e| e.to_string())?;
    if bytes.len() > MAX_DOC_SIZE {
        return Err("File PDF eccede il limite di 16 MB".into());
    }

    let pdfium = PdfiumLib::global()?;
    let doc = unsafe {
        (pdfium.fpdf_load_mem_doc)(
            bytes.as_ptr() as *const c_void,
            bytes.len() as i32,
            std::ptr::null(),
        )
    };
    if doc.is_null() {
        return Err("Documento PDF corrotto o protetto da password".into());
    }

    struct DocGuard<'a> {
        lib: &'a PdfiumLib,
        doc: *mut c_void,
    }
    impl<'a> Drop for DocGuard<'a> {
        fn drop(&mut self) {
            unsafe {
                (self.lib.fpdf_close_doc)(self.doc);
            }
        }
    }
    let _doc_guard = DocGuard {
        lib: &pdfium,
        doc,
    };

    let page_count = unsafe { (pdfium.fpdf_get_page_count)(doc) };
    if page_count <= 0 {
        return Err("Documento PDF senza pagine".into());
    }

    let mut full_text = String::new();
    let mut is_partial = false;
    let mut warnings = Vec::new();

    for page_idx in 0..page_count {
        let page = unsafe { (pdfium.fpdf_load_page)(doc, page_idx) };
        if page.is_null() {
            is_partial = true;
            warnings.push(format!("Impossibile caricare pagina {} del PDF", page_idx + 1));
            continue;
        }

        struct PageGuard<'a> {
            lib: &'a PdfiumLib,
            page: *mut c_void,
        }
        impl<'a> Drop for PageGuard<'a> {
            fn drop(&mut self) {
                unsafe {
                    (self.lib.fpdf_close_page)(self.page);
                }
            }
        }
        let _page_guard = PageGuard {
            lib: &pdfium,
            page,
        };

        // 1. Digital Vector Text Extraction
        let text_page = unsafe { (pdfium.fpdf_text_load_page)(page) };
        let mut page_digital_text = String::new();
        if !text_page.is_null() {
            let char_count = unsafe { (pdfium.fpdf_text_count_chars)(text_page) };
            if char_count > 0 {
                let mut u16_buf = vec![0u16; (char_count as usize) + 1];
                let extracted_count = unsafe {
                    (pdfium.fpdf_text_get_text)(
                        text_page,
                        0,
                        char_count,
                        u16_buf.as_mut_ptr(),
                    )
                };
                if extracted_count > 0 {
                    let s = String::from_utf16_lossy(&u16_buf[..extracted_count as usize]);
                    page_digital_text = s.trim_matches('\0').trim().to_string();
                }
            }
            unsafe {
                (pdfium.fpdf_text_close_page)(text_page);
            }
        }

        // 2. Check if we need OCR (scanned PDF or mixed PDF)
        // If digital text is empty OR page needs image OCR scanning
        let mut page_ocr_text = String::new();
        let need_ocr = page_digital_text.is_empty() || bytes.len() > 2048; // Try OCR for potential mixed pages

        if need_ocr {
            let width_pt = unsafe { (pdfium.fpdf_get_page_width_f)(page) };
            let height_pt = unsafe { (pdfium.fpdf_get_page_height_f)(page) };

            // Render at 150 DPI (scale factor: 150 / 72 ≈ 2.083) for balanced speed and accuracy
            let scale = 150.0 / 72.0;
            let pix_w = (width_pt * scale) as i32;
            let pix_h = (height_pt * scale) as i32;

            if pix_w > 0 && pix_h > 0 && pix_w <= 4000 && pix_h <= 4000 {
                let stride = pix_w * 4;
                let buf_size = (stride * pix_h) as usize;
                let mut pixel_buf = vec![0u8; buf_size];

                let bitmap = unsafe {
                    (pdfium.fpdf_bitmap_create_ex)(
                        pix_w,
                        pix_h,
                        4, // FPDFBitmap_BGRx
                        pixel_buf.as_mut_ptr() as *mut c_void,
                        stride,
                    )
                };

                if !bitmap.is_null() {
                    unsafe {
                        // Fill white background (0xFFFFFFFF)
                        (pdfium.fpdf_bitmap_fill_rect)(bitmap, 0, 0, pix_w, pix_h, 0xFFFFFFFF);
                        // Render page
                        (pdfium.fpdf_render_page_bitmap)(
                            bitmap, page, 0, 0, pix_w, pix_h, 0, 0x11, // FPDF_ANNOT | FPDF_REVERSE_BYTE_ORDER
                        );
                    }

                    // Convert to BMP format for Tesseract
                    let bmp_bytes = encode_bmp_bgra(pix_w, pix_h, stride, &pixel_buf);
                    unsafe {
                        (pdfium.fpdf_bitmap_destroy)(bitmap);
                    }

                    match run_tesseract_ocr(&bmp_bytes, "bmp") {
                        Ok(ocr_out) => {
                            page_ocr_text = ocr_out;
                        }
                        Err(e) if e.contains("Nessun testo riconoscibile") => {
                            // Valid empty page / image without readable text
                        }
                        Err(e) => {
                            // Only mark as warning if we don't already have digital text
                            if page_digital_text.is_empty() {
                                is_partial = true;
                                warnings.push(format!(
                                    "OCR pagina {} non completato: {e}",
                                    page_idx + 1
                                ));
                            }
                        }
                    }
                }
            }
        }

        // 3. Combine digital text and OCR text without duplicating passages
        let mut page_combined = String::new();
        if !page_digital_text.is_empty() {
            page_combined.push_str(&page_digital_text);
        }

        if !page_ocr_text.is_empty() {
            // Deduplicate: if digital text already contains the line/words, don't repeat them
            let mut unique_ocr_lines = Vec::new();
            for ocr_line in page_ocr_text.lines() {
                let trimmed = ocr_line.trim();
                if trimmed.len() >= 3 && !page_digital_text.contains(trimmed) {
                    unique_ocr_lines.push(trimmed);
                }
            }
            if !unique_ocr_lines.is_empty() {
                if !page_combined.is_empty() {
                    page_combined.push_str("\n\n");
                }
                page_combined.push_str(&unique_ocr_lines.join("\n"));
            }
        }

        if !page_combined.is_empty() {
            if page_count > 1 {
                full_text.push_str(&format!("\n\n## Pagina {}\n\n", page_idx + 1));
            }
            full_text.push_str(&page_combined);
        }
    }

    if full_text.len() > MAX_DOC_SIZE {
        return Err("Documento PDF estratto oltre 16 MB".into());
    }

    if full_text.trim().is_empty() && !is_partial {
        return Err("Documento PDF senza testo riconoscibile".into());
    }

    Ok(ExtractionOutput {
        text: full_text.trim().to_string(),
        is_partial,
        warnings,
    })
}

// ---------------------------------------------------------------------------
// RTF Extraction Engine (Pure Rust)
// ---------------------------------------------------------------------------

/// Extracts plain text from RTF documents using rtf-parser with a resilient fallback scanner.
pub fn extract_rtf(bytes: &[u8]) -> Result<ExtractionOutput, String> {
    if bytes.len() > MAX_DOC_SIZE {
        return Err("Documento RTF oltre 16 MB".into());
    }

    let rtf_str = match std::str::from_utf8(bytes) {
        Ok(s) => s.to_string(),
        Err(_) => String::from_utf8_lossy(bytes).into_owned(),
    };

    // Primary parser: rtf-parser
    if let Ok(doc) = rtf_parser::document::RtfDocument::try_from(rtf_str.as_str()) {
        let text = doc.get_text();
        if !text.trim().is_empty() {
            return Ok(ExtractionOutput::simple(text.trim().to_string()));
        }
    }

    // Fallback resilient scanner for non-standard RTF documents
    let fallback = fallback_rtf_scanner(&rtf_str);
    if !fallback.trim().is_empty() {
        return Ok(ExtractionOutput::simple(fallback.trim().to_string()));
    }

    Err("Documento RTF privo di testo estraibile".into())
}

fn fallback_rtf_scanner(input: &str) -> String {
    let mut out = String::new();
    let mut chars = input.chars().peekable();
    let mut group_depth = 0;
    let mut skip_group_depth = 0;

    while let Some(c) = chars.next() {
        match c {
            '{' => {
                group_depth += 1;
                // Check if this group should be skipped (font tables, color tables, styles, info)
                if chars.peek() == Some(&'\\') {
                    // Peek ahead
                }
            }
            '}' => {
                if skip_group_depth > 0 && group_depth <= skip_group_depth {
                    skip_group_depth = 0;
                }
                if group_depth > 0 {
                    group_depth -= 1;
                }
            }
            '\\' => {
                // Read control word
                let mut word = String::new();
                while let Some(&next_c) = chars.peek() {
                    if next_c.is_alphabetic() {
                        word.push(chars.next().unwrap());
                    } else {
                        break;
                    }
                }
                // Read optional numeric argument
                let mut num = String::new();
                if chars.peek() == Some(&'-') {
                    num.push(chars.next().unwrap());
                }
                while let Some(&next_c) = chars.peek() {
                    if next_c.is_ascii_digit() {
                        num.push(chars.next().unwrap());
                    } else {
                        break;
                    }
                }
                // Discard trailing single space delimiter
                if chars.peek() == Some(&' ') {
                    chars.next();
                }

                if skip_group_depth > 0 {
                    continue;
                }

                match word.as_str() {
                    "par" | "line" => out.push('\n'),
                    "tab" => out.push('\t'),
                    "fonttbl" | "colortbl" | "stylesheet" | "info" | "generator" => {
                        skip_group_depth = group_depth;
                    }
                    "u" => {
                        if let Ok(code) = num.parse::<i32>() {
                            let codepoint = if code < 0 { (code + 65536) as u32 } else { code as u32 };
                            if let Some(ch) = char::from_u32(codepoint) {
                                out.push(ch);
                            }
                        }
                    }
                    "" => {
                        // Escaped character like \'xx or \{ \} \\
                        if let Some(&esc) = chars.peek() {
                            match esc {
                                '\'' => {
                                    chars.next();
                                    let mut hex = String::new();
                                    if let Some(h1) = chars.next() { hex.push(h1); }
                                    if let Some(h2) = chars.next() { hex.push(h2); }
                                    if let Ok(byte_val) = u8::from_str_radix(&hex, 16) {
                                        // Windows-1252 to char
                                        let decoded = match byte_val {
                                            0xE0 => 'à',
                                            0xE8 => 'è',
                                            0xE9 => 'é',
                                            0xEC => 'ì',
                                            0xF2 => 'ò',
                                            0xF9 => 'ù',
                                            0x20..=0x7E => byte_val as char,
                                            _ => ' ',
                                        };
                                        out.push(decoded);
                                    }
                                }
                                '{' | '}' | '\\' => {
                                    out.push(chars.next().unwrap());
                                }
                                _ => {}
                            }
                        }
                    }
                    _ => {}
                }
            }
            _ => {
                if skip_group_depth == 0 {
                    out.push(c);
                }
            }
        }
    }

    out
}

// ---------------------------------------------------------------------------
// DOC (Word 97-2004 OLE2) Extraction Engine
// ---------------------------------------------------------------------------

/// Extracts plain text from legacy Word 97-2004 (.doc) binary files using CFBF.
pub fn extract_doc(bytes: &[u8]) -> Result<ExtractionOutput, String> {
    if bytes.len() > MAX_DOC_SIZE {
        return Err("Documento DOC oltre 16 MB".into());
    }

    let cursor = Cursor::new(bytes);
    let mut comp = match cfb::CompoundFile::open(cursor) {
        Ok(c) => c,
        Err(_) => {
            // Not a compound file, try fallback text scanner
            let text = fallback_doc_stream_scanner(bytes);
            if !text.trim().is_empty() {
                return Ok(ExtractionOutput::simple(text.trim().to_string()));
            }
            return Err("Documento DOC corrotto o non conforme OLE2".into());
        }
    };

    // Locate WordDocument stream
    let mut stream_data = Vec::new();
    let word_stream_path = if comp.is_stream("/WordDocument") {
        Some("/WordDocument".to_string())
    } else {
        comp.read_storage("/")
            .ok()
            .and_then(|entries| {
                entries
                    .into_iter()
                    .find(|e| e.name().eq_ignore_ascii_case("WordDocument"))
                    .map(|e| e.path().to_string_lossy().into_owned())
            })
    };

    if let Some(path) = word_stream_path {
        if let Ok(mut stream) = comp.open_stream(&path) {
            let _ = stream.read_to_end(&mut stream_data);
        }
    }

    if stream_data.is_empty() {
        return Err("Stream WordDocument non trovato nel file DOC".into());
    }

    // Try structured FIB parsing for Word 97-2003
    if let Some(text) = parse_fib_text(&stream_data, &mut comp) {
        if !text.trim().is_empty() {
            return Ok(ExtractionOutput::simple(text.trim().to_string()));
        }
    }

    // Fallback scanner on the WordDocument stream data
    let text = fallback_doc_stream_scanner(&stream_data);
    if !text.trim().is_empty() {
        return Ok(ExtractionOutput::simple(text.trim().to_string()));
    }

    Err("Documento DOC privo di testo estraibile".into())
}

fn parse_fib_text<R: std::io::Read + std::io::Seek>(
    stream: &[u8],
    comp: &mut cfb::CompoundFile<R>,
) -> Option<String> {
    if stream.len() < 0x0200 {
        return None;
    }

    // FIB magic check: wIdent == 0xA5EC
    let ident = u16::from_le_bytes([stream[0], stream[1]]);
    if ident != 0xA5EC {
        return None;
    }

    // Read Table stream name from flags
    let flags = u16::from_le_bytes([stream[0x000A], stream[0x000B]]);
    let table_name = if (flags & 0x0200) != 0 {
        "/1Table"
    } else {
        "/0Table"
    };

    let mut table_data = Vec::new();
    if let Ok(mut t) = comp.open_stream(table_name) {
        let _ = t.read_to_end(&mut table_data);
    }

    // In FIB, offset 0x01A2 has fcClx (4 bytes) and lcbClx (4 bytes) in FibRgFcLcb97
    if stream.len() >= 0x01AA && !table_data.is_empty() {
        let fc_clx = u32::from_le_bytes([
            stream[0x01A2],
            stream[0x01A3],
            stream[0x01A4],
            stream[0x01A5],
        ]) as usize;
        let lcb_clx = u32::from_le_bytes([
            stream[0x01A6],
            stream[0x01A7],
            stream[0x01A8],
            stream[0x01A9],
        ]) as usize;

        if fc_clx + lcb_clx <= table_data.len() && lcb_clx > 0 {
            let clx = &table_data[fc_clx..fc_clx + lcb_clx];
            if let Some(text) = parse_clx_pieces(clx, stream, &table_data) {
                if !text.trim().is_empty() {
                    return Some(text);
                }
            }
        }
    }

    None
}

fn parse_clx_pieces(clx: &[u8], doc_stream: &[u8], table_stream: &[u8]) -> Option<String> {
    let mut pos = 0;
    while pos < clx.len() {
        let clxt = clx[pos];
        pos += 1;
        if clxt == 0x01 {
            // Prc: skip cbGrpprl
            if pos + 2 > clx.len() { break; }
            let cb = u16::from_le_bytes([clx[pos], clx[pos + 1]]) as usize;
            pos += 2 + cb;
        } else if clxt == 0x02 {
            // Plcfpcd (piece table)
            if pos + 4 > clx.len() { break; }
            let lcb = u32::from_le_bytes([clx[pos], clx[pos + 1], clx[pos + 2], clx[pos + 3]]) as usize;
            pos += 4;
            if pos + lcb > clx.len() { break; }
            let pcd_data = &clx[pos..pos + lcb];

            // Plcfpcd contains (n + 1) CPs (4 bytes each) and n PCDs (8 bytes each)
            // Total size: (n + 1) * 4 + n * 8 = 12n + 4 = lcb => n = (lcb - 4) / 12
            if lcb < 16 || (lcb - 4) % 12 != 0 { break; }
            let n = (lcb - 4) / 12;
            let cp_array = &pcd_data[0..(n + 1) * 4];
            let pcd_array = &pcd_data[(n + 1) * 4..];

            let mut out = String::new();
            for i in 0..n {
                let cp_start = u32::from_le_bytes([
                    cp_array[i * 4],
                    cp_array[i * 4 + 1],
                    cp_array[i * 4 + 2],
                    cp_array[i * 4 + 3],
                ]);
                let cp_end = u32::from_le_bytes([
                    cp_array[(i + 1) * 4],
                    cp_array[(i + 1) * 4 + 1],
                    cp_array[(i + 1) * 4 + 2],
                    cp_array[(i + 1) * 4 + 3],
                ]);
                let char_count = (cp_end.saturating_sub(cp_start)) as usize;
                if char_count == 0 { continue; }

                let pcd = &pcd_array[i * 8..(i + 1) * 8];
                let fc = u32::from_le_bytes([pcd[2], pcd[3], pcd[4], pcd[5]]);

                let is_compressed = (fc & 0x40000000) != 0;
                let actual_fc = (fc & 0x3FFFFFFF) as usize;

                if is_compressed {
                    // 8-bit CP1252 text
                    let byte_offset = actual_fc / 2;
                    let target_stream = if byte_offset < doc_stream.len() { doc_stream } else { table_stream };
                    if byte_offset + char_count <= target_stream.len() {
                        let slice = &target_stream[byte_offset..byte_offset + char_count];
                        for &b in slice {
                            match b {
                                0x0D | 0x07 => out.push('\n'),
                                0x09 => out.push('\t'),
                                0x20..=0x7E => out.push(b as char),
                                0xE0 => out.push('à'),
                                0xE8 => out.push('è'),
                                0xE9 => out.push('é'),
                                0xEC => out.push('ì'),
                                0xF2 => out.push('ò'),
                                0xF9 => out.push('ù'),
                                _ => {}
                            }
                        }
                    }
                } else {
                    // 16-bit UTF-16LE text
                    let byte_offset = actual_fc;
                    let target_stream = if byte_offset < doc_stream.len() { doc_stream } else { table_stream };
                    if byte_offset + char_count * 2 <= target_stream.len() {
                        let slice = &target_stream[byte_offset..byte_offset + char_count * 2];
                        let mut u16_words = Vec::with_capacity(char_count);
                        for chunk in slice.chunks_exact(2) {
                            u16_words.push(u16::from_le_bytes([chunk[0], chunk[1]]));
                        }
                        let s = String::from_utf16_lossy(&u16_words);
                        out.push_str(&s.replace('\r', "\n").replace('\x07', "\n"));
                    }
                }
            }

            if !out.trim().is_empty() {
                return Some(out);
            }
            break;
        } else {
            break;
        }
    }
    None
}

fn fallback_doc_stream_scanner(stream: &[u8]) -> String {
    let mut out = String::new();
    let mut i = 0;

    // Search for UTF-16LE text runs (length >= 4)
    while i + 1 < stream.len() {
        if stream[i] >= 0x20 && stream[i] <= 0x7E && stream[i + 1] == 0 {
            let _start = i;
            let mut words = Vec::new();
            while i + 1 < stream.len() && stream[i + 1] == 0 && (stream[i] >= 0x20 || stream[i] == 0x0D || stream[i] == 0x0A || stream[i] == 0x09) {
                words.push(u16::from_le_bytes([stream[i], stream[i + 1]]));
                i += 2;
            }
            if words.len() >= 4 {
                let s = String::from_utf16_lossy(&words);
                let trimmed = s.trim();
                if !trimmed.is_empty() {
                    out.push_str(trimmed);
                    out.push('\n');
                }
            }
        } else {
            i += 1;
        }
    }

    if out.trim().is_empty() {
        // Search for ASCII printable runs (length >= 5)
        let mut j = 0;
        while j < stream.len() {
            if stream[j] >= 0x20 && stream[j] <= 0x7E {
                let start = j;
                while j < stream.len() && (stream[j] >= 0x20 && stream[j] <= 0x7E || stream[j] == 0x0D || stream[j] == 0x0A || stream[j] == 0x09) {
                    j += 1;
                }
                let len = j - start;
                if len >= 5 {
                    if let Ok(s) = std::str::from_utf8(&stream[start..j]) {
                        let trimmed = s.trim();
                        if !trimmed.is_empty() {
                            out.push_str(trimmed);
                            out.push('\n');
                        }
                    }
                }
            } else {
                j += 1;
            }
        }
    }

    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn get_fixture_path(name: &str) -> PathBuf {
        let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        manifest_dir
            .parent()
            .unwrap()
            .join("tests")
            .join("fixtures")
            .join("ocr-spike")
            .join(name)
    }

    #[test]
    fn test_real_fixture_1_tesseract_standalone_image() {
        let path = get_fixture_path("fixture_1_immagine_autonoma.png");
        assert!(path.exists(), "Fixture 1 deve esistere: {:?}", path);
        let bytes = std::fs::read(&path).expect("Lettura fixture 1");
        
        let res = run_tesseract_ocr(&bytes, "png");
        assert!(res.is_ok(), "Tesseract OCR deve avere successo su Fixture 1: {:?}", res.err());
        let text = res.unwrap();
        println!("[SPIKE REAL FIXTURE 1 OCR OUTPUT]:\n{}", text);
        assert!(text.contains("LIMEN") || text.contains("Memoria") || text.contains("Ottico"),
            "Il testo estratto da Fixture 1 deve contenere lemmi attesi: {}", text);
    }

    #[test]
    fn test_real_fixture_2_pdfium_vector_pdf() {
        let path = get_fixture_path("fixture_2_pdf_vettoriale_puro.pdf");
        assert!(path.exists(), "Fixture 2 deve esistere: {:?}", path);
        let bytes = std::fs::read(&path).expect("Lettura fixture 2");

        let res = extract_pdf_windows(&bytes);
        assert!(res.is_ok(), "Estrazione PDF vettoriale deve riuscire: {:?}", res.err());
        let out = res.unwrap();
        println!("[SPIKE REAL FIXTURE 2 OUTPUT]:\n{}", out.text);
        assert!(!out.is_partial, "is_partial deve essere false");
        assert!(out.warnings.is_empty(), "Warnings deve essere vuoto: {:?}", out.warnings);
        assert!(out.text.contains("LIMEN-PDF-VETTORIALE-PURO"), "Deve contenere header vettoriale");
        assert!(out.text.contains("digitale vettoriale nativo"), "Deve contenere corpo vettoriale");
    }

    #[test]
    fn test_real_fixture_3_pdfium_tesseract_scanned_pdf() {
        let path = get_fixture_path("fixture_3_pdf_scansionato_puro.pdf");
        assert!(path.exists(), "Fixture 3 deve esistere: {:?}", path);
        let bytes = std::fs::read(&path).expect("Lettura fixture 3");

        let res = extract_pdf_windows(&bytes);
        assert!(res.is_ok(), "Estrazione PDF scansionato deve riuscire: {:?}", res.err());
        let out = res.unwrap();
        println!("[SPIKE REAL FIXTURE 3 OUTPUT]:\n{}", out.text);
        assert!(out.text.contains("LIMEN-PDF-SCANSIONE-PURA") || out.text.contains("SCANSIONE") || out.text.contains("rasterizzato"),
            "Il testo estratto tramite rasterizzazione e OCR deve contenere lemmi attesi: {}", out.text);
    }

    #[test]
    fn test_real_fixture_4_pdfium_tesseract_mixed_pdf() {
        let path = get_fixture_path("fixture_4_pdf_misto.pdf");
        assert!(path.exists(), "Fixture 4 deve esistere: {:?}", path);
        let bytes = std::fs::read(&path).expect("Lettura fixture 4");

        let res = extract_pdf_windows(&bytes);
        assert!(res.is_ok(), "Estrazione PDF misto deve riuscire: {:?}", res.err());
        let out = res.unwrap();
        println!("[SPIKE REAL FIXTURE 4 OUTPUT]:\n{}", out.text);
        assert!(out.text.contains("LIMEN-PDF-MISTO-TESTO-VETTORIALE"), "Deve contenere testo vettoriale");
        // Verifica che la porzione vettoriale non sia duplicata
        let count = out.text.matches("LIMEN-PDF-MISTO-TESTO-VETTORIALE").count();
        assert_eq!(count, 1, "Il testo vettoriale deve comparire una sola volta senza duplicazioni");
    }

    #[test]
    fn test_real_fixture_5_office_docx_graceful_handling() {
        let path = get_fixture_path("fixture_5_office_guasto_ocr.docx");
        assert!(path.exists(), "Fixture 5 deve esistere: {:?}", path);
        let bytes = std::fs::read(&path).expect("Lettura fixture 5");

        let res = crate::extraction::extract(&bytes, "fixture_5_office_guasto_ocr.docx");
        assert!(res.is_ok(), "Estrazione DOCX deve completare con successo: {:?}", res.err());
        let out = res.unwrap();
        assert!(out.text.contains("LIMEN-DOCX-GUASTO-TESTO-XML") || out.text.contains("Testo principale"), "Deve estrarre il testo principale DOCX");
        assert!(out.is_partial, "is_partial deve essere true per immagine guasta");
        assert!(!out.warnings.is_empty(), "I warning devono contenere il fallimento dell'immagine incorporata");
    }

    #[test]
    fn test_real_fixture_6_rtf_document_native() {
        let path = get_fixture_path("fixture_6_rtf_document.rtf");
        assert!(path.exists(), "Fixture 6 deve esistere: {:?}", path);
        let bytes = std::fs::read(&path).expect("Lettura fixture 6");

        let res = extract_rtf(&bytes);
        assert!(res.is_ok(), "Estrazione RTF nativa deve riuscire: {:?}", res.err());
        let out = res.unwrap();
        println!("[SPIKE REAL FIXTURE 6 OUTPUT]:\n{}", out.text);
        assert!(out.text.contains("LIMEN Vault"), "Deve contenere LIMEN Vault: {}", out.text);
        assert!(out.text.contains("accentati") || out.text.contains("documento RTF"), "Deve contenere testo del documento: {}", out.text);
    }

    #[test]
    fn test_real_fixture_7_doc_legacy_ole2() {
        let path = get_fixture_path("fixture_7_doc_legacy.doc");
        assert!(path.exists(), "Fixture 7 deve esistere: {:?}", path);
        let bytes = std::fs::read(&path).expect("Lettura fixture 7");

        let res = extract_doc(&bytes);
        assert!(res.is_ok(), "Estrazione DOC OLE2 nativa deve riuscire: {:?}", res.err());
        let out = res.unwrap();
        println!("[SPIKE REAL FIXTURE 7 OUTPUT]:\n{}", out.text);
        assert!(out.text.contains("LIMEN Vault"), "Deve contenere LIMEN Vault: {}", out.text);
        assert!(out.text.contains("DOC Legacy"), "Deve contenere DOC Legacy: {}", out.text);
    }
}

