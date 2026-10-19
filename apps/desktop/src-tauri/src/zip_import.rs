//! Direct ZIP archive import with directory structure preservation, symlink guards, collision prevention and safety limits.
use crate::automation::{ImportReceipt, MAX_IMPORT_FILE_SIZE_BYTES};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    fs::{self, File},
    io::{BufReader, Read, Write},
    path::{Path, PathBuf},
};
use unicode_normalization::UnicodeNormalization;

pub const MAX_ZIP_UNCOMPRESSED_TOTAL_BYTES: u64 = 10_000_000_000; // 10 GB limit for uncompressed content
pub const MAX_ZIP_ENTRIES: usize = 10_000;
pub const MAX_ZIP_DEPTH: usize = 32;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ZipPreviewItem {
    pub source_name: String,
    pub entry_index: usize,
    pub blocked_reason: Option<String>,
    pub target_path: String,
    pub size_bytes: u64,
    pub is_document: bool,
    pub category: String, // "document" | "support"
    pub exists: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ZipPreviewReport {
    pub zip_name: String,
    pub zip_size_bytes: u64,
    pub total_uncompressed_bytes: u64,
    pub total_files: usize,
    pub document_files_count: usize,
    pub support_files_count: usize,
    pub items: Vec<ZipPreviewItem>,
}

struct ExtractedItem {
    staging_file: PathBuf,
    rel_vault_path: String,
    file_name: String,
    size_bytes: u64,
    sha256: String,
    index: bool,
}

/// Sanitizes a ZIP entry name: applies NFC Unicode normalization, replaces backslashes with slashes,
/// rejects paths escaping destination (`..`, colon/drive prefixes, absolute roots) and enforces depth limit.
pub fn sanitize_zip_entry_path(raw_name: &str) -> Result<PathBuf, String> {
    let normalized: String = raw_name.nfc().collect();
    let forward_slashed = normalized.replace('\\', "/");

    if forward_slashed.starts_with('/') {
        return Err("Percorso assoluto non consentito nello ZIP".into());
    }

    if forward_slashed.contains(':') {
        return Err("Percorso con drive assoluto o due punti non consentito nello ZIP".into());
    }

    let mut clean_components = Vec::new();
    for part in forward_slashed.split('/') {
        let trimmed = part.trim();
        if trimmed.is_empty() || trimmed == "." {
            continue;
        }
        if trimmed == ".." {
            return Err("Tentativo di path traversal non sicuro (..) rilevato nello ZIP".into());
        }
        clean_components.push(trimmed);
    }

    if clean_components.is_empty() {
        return Err("Nome voce ZIP vuoto o non valido".into());
    }

    if clean_components.len() > MAX_ZIP_DEPTH {
        return Err(format!("Profondità cartelle nello ZIP oltre il limite di {}", MAX_ZIP_DEPTH));
    }

    let mut buf = PathBuf::new();
    for comp in clean_components {
        buf.push(comp);
    }
    Ok(buf)
}

/// Verifies that no component along the destination relative path is a symbolic link.
fn verify_no_symlinks_in_path(vault: &Path, rel_path: &Path) -> Result<PathBuf, String> {
    let mut current = vault.to_path_buf();
    for comp in rel_path.components() {
        let comp_name = match comp {
            std::path::Component::Normal(n) => n,
            _ => return Err("Componente percorso non valido".into()),
        };
        current.push(comp_name);
        if let Ok(meta) = std::fs::symlink_metadata(&current) {
            if meta.file_type().is_symlink() {
                return Err(format!(
                    "Rilevato link simbolico non consentito nella destinazione: {}",
                    current.display()
                ));
            }
        }
    }
    Ok(current)
}

fn publish_staged(vault: &Path, source: &Path, relative: &Path) -> std::io::Result<()> {
    let map = |e: String| std::io::Error::other(e);
    let root = crate::snapshots::root(vault).map_err(map)?;
    let source_relative = source.strip_prefix(vault).map_err(std::io::Error::other)?;
    let mut destination = root.try_clone()?;
    let parts: Vec<_> = relative.iter().collect();
    for part in &parts[..parts.len() - 1] {
        match destination.create_dir(part) {
            Ok(()) => {},
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {},
            Err(e) => return Err(e),
        }
        destination = crate::snapshots::child(&destination, part.to_str().ok_or_else(|| std::io::Error::other("Nome non UTF-8"))?).map_err(map)?;
    }
    let file = crate::snapshots::open_read_path(&root, source_relative.to_str().ok_or_else(|| std::io::Error::other("Percorso non UTF-8"))?).map_err(map)?;
    file.sync_all()?;
    // linkat creates a new name atomically and fails if any destination already exists.
    root.hard_link(source_relative, &destination, parts.last().unwrap())?;
    root.remove_file(source_relative)?;
    Ok(())
}

/// Checks whether a relative vault destination path targets a reserved system or hidden directory.
pub fn is_reserved_vault_path(rel_path: &Path) -> bool {
    let p_str = rel_path.to_string_lossy().replace('\\', "/");
    let top = p_str.trim_start_matches('/').split('/').next().unwrap_or("").to_lowercase();
    top.starts_with('.') || ["00_system", "80_ai_outputs", "90_proposals", "99_archive"].contains(&top.as_str())
}

/// Checks whether a ZIP entry path is a technical file that must be strictly excluded.
pub fn is_technical_zip_exclusion(p_str: &str) -> bool {
    let forward_slashed = p_str.replace('\\', "/");
    let parts: Vec<&str> = forward_slashed.split('/').collect();
    for part in &parts {
        let trimmed = part.trim();
        if trimmed == "__MACOSX"
            || trimmed.starts_with("._")
            || trimmed == ".DS_Store"
            || trimmed == "SUPPORTO_NON_IMPORTARE"
            || trimmed == "LEGGIMI_PRIMA.txt"
            || trimmed == "SHA256SUMS.txt"
            || trimmed == "CHUNKS_RAG.jsonl"
        {
            return true;
        }
    }
    false
}

/// Resolves the vault destination relative path for a ZIP entry.
/// Handles BNXT Edition archives by mapping `BNXT_LIMEN_V8/20_RAW_SOURCES/BNXT/...` directly to `20_RAW_SOURCES/BNXT/...`.
/// For standard archives, preserves folder hierarchy under `20_RAW_SOURCES/<zip_stem>/...` or root `20_RAW_SOURCES/...`.
pub fn resolve_vault_destination_path(sanitized: &Path, zip_stem: &str, has_vault_prefix: bool) -> Option<String> {
    let p_str = sanitized.to_string_lossy().to_string();
    if is_technical_zip_exclusion(&p_str) {
        return None;
    }

    // Special recognition for BNXT Edition archives:
    // If the path starts with BNXT_LIMEN_V8/20_RAW_SOURCES/BNXT/, re-root directly to 20_RAW_SOURCES/BNXT/...
    if let Some(sub) = p_str.strip_prefix("BNXT_LIMEN_V8/20_RAW_SOURCES/BNXT/") {
        return Some(format!("20_RAW_SOURCES/BNXT/{}", sub));
    }
    if p_str == "BNXT_LIMEN_V8/20_RAW_SOURCES/BNXT" {
        return Some("20_RAW_SOURCES/BNXT".into());
    }
    // If the entry is inside BNXT_LIMEN_V8/ but not under 20_RAW_SOURCES/BNXT/ (e.g. root scripts/support), exclude it
    if p_str.starts_with("BNXT_LIMEN_V8/") {
        return None;
    }

    if has_vault_prefix {
        Some(p_str)
    } else {
        Some(format!("20_RAW_SOURCES/{}/{}", zip_stem, p_str))
    }
}

/// Helper to classify whether a file extension is an indexable document or technical support.
pub fn is_document_extension(ext: &str) -> bool {
    matches!(
        ext.to_lowercase().as_str(),
        "pdf" | "docx" | "doc" | "pptx" | "xlsx" | "xls" | "xlsb" | "ods" | "odt"
            | "txt" | "md" | "markdown" | "csv" | "tsv" | "html" | "htm" | "eml"
            | "png" | "jpg" | "jpeg" | "webp" | "rtf" | "gif" | "tif" | "tiff" | "heic"
    )
}

/// Previews the contents of a ZIP archive without extracting them.
pub fn inspect_zip(vault: &Path, zip_path: &Path) -> Result<ZipPreviewReport, String> {
    let zip_file_name = zip_path
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "archive.zip".to_string());

    let meta = fs::metadata(zip_path).map_err(|e| format!("Impossibile accedere al file ZIP: {}", e))?;
    if !meta.is_file() || meta.len() > MAX_IMPORT_FILE_SIZE_BYTES {
        return Err("Archivio ZIP non regolare o oltre 2 GB".into());
    }

    let file = File::open(zip_path).map_err(|e| format!("Impossibile aprire il file ZIP: {}", e))?;
    let reader = BufReader::new(file);
    let mut archive = zip::ZipArchive::new(reader).map_err(|e| format!("Archivio ZIP non valido o protetto: {}", e))?;

    if archive.len() > MAX_ZIP_ENTRIES {
        return Err(format!("Archivio ZIP contiene troppi elementi ({} > {})", archive.len(), MAX_ZIP_ENTRIES));
    }

    let mut has_vault_prefix = false;
    for i in 0..archive.len() {
        let entry = archive.by_index(i).map_err(|e| format!("Errore voce {}: {}", i, e))?;
        if let Ok(sanitized) = sanitize_zip_entry_path(entry.name()) {
            let s = sanitized.to_string_lossy();
            if s.starts_with("20_RAW_SOURCES/") || s == "20_RAW_SOURCES" || s.starts_with("BNXT_LIMEN_V8/20_RAW_SOURCES/") {
                has_vault_prefix = true;
                break;
            }
        }
    }

    let zip_stem = zip_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "archivio".to_string());

    let mut total_uncompressed: u64 = 0;
    let mut items = Vec::new();
    let mut doc_count = 0;
    let mut support_count = 0;

    for i in 0..archive.len() {
        let entry = archive.by_index(i).map_err(|e| format!("Errore voce {}: {}", i, e))?;
        if entry.is_dir() {
            continue;
        }

        let sanitized = sanitize_zip_entry_path(entry.name())?;
        if is_technical_zip_exclusion(&sanitized.to_string_lossy()) {
            continue;
        }

        let rel_vault_path = match resolve_vault_destination_path(&sanitized, &zip_stem, has_vault_prefix) {
            Some(p) => p,
            None => continue,
        };

        total_uncompressed = total_uncompressed.saturating_add(entry.size());
        if total_uncompressed > MAX_ZIP_UNCOMPRESSED_TOTAL_BYTES {
            return Err("Dimensione totale decompressa dello ZIP oltre il limite di 10 GB".into());
        }

        let ext = Path::new(&rel_vault_path).extension().and_then(|s| s.to_str()).unwrap_or("");
        let is_doc = is_document_extension(ext);
        if is_doc {
            doc_count += 1;
        } else {
            support_count += 1;
        }

        let exists = vault.join(&rel_vault_path).exists();
        items.push(ZipPreviewItem {
            source_name: entry.name().to_string(),
            entry_index: i,
            blocked_reason: if is_reserved_vault_path(Path::new(&rel_vault_path)) { Some("Cartella riservata al sistema del Vault".into()) } else if entry.size() > MAX_IMPORT_FILE_SIZE_BYTES { Some("Documento oltre 2 GB".into()) } else { None },
            target_path: rel_vault_path,
            size_bytes: entry.size(),
            is_document: is_doc,
            category: if is_doc { "document".into() } else { "support".into() },
            exists,
        });
    }

    Ok(ZipPreviewReport {
        zip_name: zip_file_name,
        zip_size_bytes: meta.len(),
        total_uncompressed_bytes: total_uncompressed,
        total_files: items.len(),
        document_files_count: doc_count,
        support_files_count: support_count,
        items,
    })
}

/// Imports a ZIP archive into the vault preserving internal folder hierarchy and relative links.
pub fn import_zip_archive(vault: &Path, zip_path: &Path) -> Vec<ImportReceipt> {
    import_zip_selected(vault, zip_path, None, None)
}

pub fn import_zip_selected(
    vault: &Path,
    zip_path: &Path,
    selection: Option<&std::collections::BTreeMap<usize, bool>>,
    progress: Option<&dyn Fn(u64, u64, &str)>,
) -> Vec<ImportReceipt> {
    import_zip_selected_ext(vault, zip_path, selection, false, progress)
}

pub fn import_zip_selected_ext(
    vault: &Path,
    zip_path: &Path,
    selection: Option<&std::collections::BTreeMap<usize, bool>>,
    overwrite: bool,
    progress: Option<&dyn Fn(u64, u64, &str)>,
) -> Vec<ImportReceipt> {
    let zip_file_name = zip_path
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "archive.zip".to_string());

    // 1. Verify zip archive size <= 2 GB
    let meta = match fs::metadata(zip_path) {
        Ok(m) => m,
        Err(e) => {
            return vec![ImportReceipt {
                name: zip_file_name,
                path: None,
                status: "error".into(),
                error: Some(format!("Impossibile accedere al file ZIP: {}", e)),
                document_id: None,
                hash: None,
                size_bytes: None,
            }];
        }
    };

    if !meta.is_file() || meta.len() > MAX_IMPORT_FILE_SIZE_BYTES {
        return vec![ImportReceipt {
            name: zip_file_name,
            path: None,
            status: "error".into(),
            error: Some("Archivio ZIP non regolare o oltre il limite di 2 GB (2.000.000.000 byte)".into()),
            document_id: None,
            hash: None,
            size_bytes: Some(meta.len()),
        }];
    }

    let file = match File::open(zip_path) {
        Ok(f) => f,
        Err(e) => {
            return vec![ImportReceipt {
                name: zip_file_name,
                path: None,
                status: "error".into(),
                error: Some(format!("Impossibile aprire il file ZIP: {}", e)),
                document_id: None,
                hash: None,
                size_bytes: Some(meta.len()),
            }];
        }
    };

    let reader = BufReader::new(file);
    let mut archive = match zip::ZipArchive::new(reader) {
        Ok(a) => a,
        Err(e) => {
            return vec![ImportReceipt {
                name: zip_file_name,
                path: None,
                status: "error".into(),
                error: Some(format!("Archivio ZIP non valido, corrotto o protetto da password: {}", e)),
                document_id: None,
                hash: None,
                size_bytes: Some(meta.len()),
            }];
        }
    };

    if archive.len() > MAX_ZIP_ENTRIES {
        return vec![ImportReceipt {
            name: zip_file_name,
            path: None,
            status: "error".into(),
            error: Some(format!(
                "Archivio ZIP contiene troppi elementi ({} > limite di {})",
                archive.len(),
                MAX_ZIP_ENTRIES
            )),
            document_id: None,
            hash: None,
            size_bytes: Some(meta.len()),
        }];
    }

    // 2. Pre-flight verification (uncompressed size, Zip Slip protection, directory depth, structure detection)
    let mut total_uncompressed: u64 = 0;
    let mut has_vault_prefix = false;

    for i in 0..archive.len() {
        let entry = match archive.by_index(i) {
            Ok(e) => e,
            Err(e) => {
                return vec![ImportReceipt {
                    name: zip_file_name,
                    path: None,
                    status: "error".into(),
                    error: Some(format!("Errore nella lettura dell'archivio alla voce {}: {}", i, e)),
                    document_id: None,
                    hash: None,
                    size_bytes: Some(meta.len()),
                }];
            }
        };

        // Strictly sanitize path upfront (NFC, backslash replacement, .. check)
        let sanitized = match sanitize_zip_entry_path(entry.name()) {
            Ok(p) => p,
            Err(e) => {
                return vec![ImportReceipt {
                    name: zip_file_name,
                    path: None,
                    status: "error".into(),
                    error: Some(format!("Archivio rifiutato: {}", e)),
                    document_id: None,
                    hash: None,
                    size_bytes: Some(meta.len()),
                }];
            }
        };

        if is_technical_zip_exclusion(&sanitized.to_string_lossy()) {
            continue;
        }

        let p_str = sanitized.to_string_lossy();
        if p_str.starts_with("20_RAW_SOURCES/") || p_str == "20_RAW_SOURCES" || p_str.starts_with("BNXT_LIMEN_V8/20_RAW_SOURCES/") {
            has_vault_prefix = true;
        }

        total_uncompressed = total_uncompressed.saturating_add(entry.size());
        if total_uncompressed > MAX_ZIP_UNCOMPRESSED_TOTAL_BYTES {
            return vec![ImportReceipt {
                name: zip_file_name,
                path: None,
                status: "error".into(),
                error: Some("Dimensione totale decompressa dello ZIP oltre il limite consentito (10 GB)".into()),
                document_id: None,
                hash: None,
                size_bytes: Some(meta.len()),
            }];
        }
    }

    // 3. Staging directory setup
    let token = crate::ai::random_token().unwrap_or_else(|_| "stage".into());
    let raw_sources_dir = vault.join("20_RAW_SOURCES");
    if let Err(e) = fs::create_dir_all(&raw_sources_dir) {
        return vec![ImportReceipt {
            name: zip_file_name,
            path: None,
            status: "error".into(),
            error: Some(format!("Impossibile creare la cartella 20_RAW_SOURCES: {}", e)),
            document_id: None,
            hash: None,
            size_bytes: Some(meta.len()),
        }];
    }

    let staging_dir = raw_sources_dir.join(format!(".staging-zip-{}", token));
    if let Err(e) = fs::create_dir_all(&staging_dir) {
        return vec![ImportReceipt {
            name: zip_file_name,
            path: None,
            status: "error".into(),
            error: Some(format!("Impossibile creare l'area di staging temporanea: {}", e)),
            document_id: None,
            hash: None,
            size_bytes: Some(meta.len()),
        }];
    }

    let zip_stem = zip_path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "archivio".to_string());

    let mut extracted_items: Vec<ExtractedItem> = Vec::new();
    let mut early_receipts: Vec<ImportReceipt> = Vec::new();
    let mut seen_in_archive: std::collections::HashMap<String, (usize, String)> = std::collections::HashMap::new();
    let mut extract_error: Option<String> = None;

    let mut total_written = 0u64;
    // 4. Extract into staging
    for i in 0..archive.len() {
        if selection.is_some_and(|s| !s.contains_key(&i)) { continue; }
        if crate::automation::is_import_cancelled() {
            extract_error = Some("Importazione archivio ZIP annullata dall'utente".into());
            break;
        }

        let mut entry = match archive.by_index(i) {
            Ok(e) => e,
            Err(e) => {
                extract_error = Some(format!("Errore lettura elemento {}: {}", i, e));
                break;
            }
        };

        let sanitized = match sanitize_zip_entry_path(entry.name()) {
            Ok(p) => p,
            Err(e) => {
                extract_error = Some(format!("Percorso non sicuro rilevato: {}", e));
                break;
            }
        };

        if is_technical_zip_exclusion(&sanitized.to_string_lossy()) {
            continue;
        }

        let mut rel_vault_path = match resolve_vault_destination_path(&sanitized, &zip_stem, has_vault_prefix) {
            Some(p) => p,
            None => continue,
        };

        // Each entry is extracted to its own isolated subdirectory in staging to prevent any collision
        let entry_staging_folder = staging_dir.join(format!("entry_{:06}", i));
        let staging_target = entry_staging_folder.join(&sanitized);

        if entry.is_dir() {
            if let Err(e) = fs::create_dir_all(&staging_target) {
                extract_error = Some(format!("Impossibile creare la cartella in staging: {}", e));
                break;
            }
            continue;
        }

        if let Some(parent) = staging_target.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                extract_error = Some(format!("Impossibile creare le directory intermedie in staging: {}", e));
                break;
            }
        }

        // Stream entry to staging target and compute sha256
        let mut out_file = match File::create(&staging_target) {
            Ok(f) => f,
            Err(e) => {
                extract_error = Some(format!("Impossibile creare il file temporaneo {}: {}", staging_target.display(), e));
                break;
            }
        };

        let mut hasher = Sha256::new();
        let mut buf = [0u8; 128 * 1024];
        let mut written_bytes: u64 = 0;
        let mut read_failed = false;

        loop {
            if crate::automation::is_import_cancelled() {
                extract_error = Some("Importazione archivio ZIP annullata dall'utente".into());
                read_failed = true;
                break;
            }
            match entry.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    hasher.update(&buf[..n]);
                    if let Err(e) = out_file.write_all(&buf[..n]) {
                        extract_error = Some(format!("Errore scrittura su disco: {}", e));
                        read_failed = true;
                        break;
                    }
                    written_bytes += n as u64;
                    total_written += n as u64;
                    if written_bytes > MAX_IMPORT_FILE_SIZE_BYTES || total_written > MAX_ZIP_UNCOMPRESSED_TOTAL_BYTES {
                        extract_error = Some("Limite di dimensione ZIP/documento superato durante l’estrazione".into());
                        read_failed = true;
                        break;
                    }
                    if let Some(report) = progress { report(total_written, total_uncompressed, entry.name()); }
                }
                Err(e) => {
                    extract_error = Some(format!("Errore decompressione voce {}: {}", sanitized.display(), e));
                    read_failed = true;
                    break;
                }
            }
        }

        if read_failed {
            break;
        }

        if let Err(e) = out_file.flush() {
            extract_error = Some(format!("Errore flush del file: {}", e));
            break;
        }
        drop(out_file);

        let hash = format!("{:x}", hasher.finalize());
        let file_name = sanitized
            .file_name()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_else(|| "file".to_string());

        // 1. Reserved directory protection: NEVER allow writes into 00_SYSTEM, .git, .obsidian, etc.
        if is_reserved_vault_path(Path::new(&rel_vault_path)) {
            let _ = fs::remove_file(&staging_target);
            early_receipts.push(ImportReceipt {
                name: file_name,
                path: Some(rel_vault_path),
                status: "error".into(),
                error: Some("Destinazione non consentita: la cartella '00_SYSTEM' è riservata al sistema del Vault".into()),
                document_id: None,
                hash: Some(hash),
                size_bytes: Some(written_bytes),
            });
            continue;
        }

        // 2. Intra-archive normalized path collision check
        if let Some((_prev_i, prev_hash)) = seen_in_archive.get(&rel_vault_path) {
            if *prev_hash == hash {
                // Exact identical bytes within the archive: duplicate!
                let _ = fs::remove_file(&staging_target);
                let doc_id = crate::catalog::make_document_id(&rel_vault_path);
                early_receipts.push(ImportReceipt {
                    name: file_name,
                    path: Some(rel_vault_path.clone()),
                    status: "duplicate".into(),
                    error: None,
                    document_id: Some(doc_id),
                    hash: Some(hash),
                    size_bytes: Some(written_bytes),
                });
                continue;
            } else {
                // Different bytes converging to the same normalized path: disambiguate to prevent data loss!
                let mut counter = 1;
                let rel_path_buf = PathBuf::from(&rel_vault_path);
                let parent_str = rel_path_buf.parent().map(|p| p.to_string_lossy().to_string()).unwrap_or_default();
                let stem_str = rel_path_buf.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "file".to_string());
                let ext_str = rel_path_buf.extension().map(|e| format!(".{}", e.to_string_lossy())).unwrap_or_default();

                let mut candidate = if parent_str.is_empty() {
                    format!("{}_{}{}", stem_str, counter, ext_str)
                } else {
                    format!("{}/{}_{}{}", parent_str, stem_str, counter, ext_str)
                };
                while seen_in_archive.contains_key(&candidate) || vault.join(&candidate).exists() {
                    counter += 1;
                    candidate = if parent_str.is_empty() {
                        format!("{}_{}{}", stem_str, counter, ext_str)
                    } else {
                        format!("{}/{}_{}{}", parent_str, stem_str, counter, ext_str)
                    };
                }
                rel_vault_path = candidate;
            }
        }
        seen_in_archive.insert(rel_vault_path.clone(), (i, hash.clone()));

        extracted_items.push(ExtractedItem {
            staging_file: staging_target,
            rel_vault_path,
            file_name,
            size_bytes: written_bytes,
            sha256: hash,
            index: selection.and_then(|s| s.get(&i)).copied().unwrap_or_else(|| is_document_extension(sanitized.extension().and_then(|e| e.to_str()).unwrap_or(""))),
        });
    }

    // Rollback staging on extraction error
    if let Some(err_msg) = extract_error {
        let _ = fs::remove_dir_all(&staging_dir);
        return vec![ImportReceipt {
            name: zip_file_name,
            path: None,
            status: "error".into(),
            error: Some(err_msg),
            document_id: None,
            hash: None,
            size_bytes: Some(meta.len()),
        }];
    }

    if extracted_items.is_empty() && early_receipts.is_empty() {
        let _ = fs::remove_dir_all(&staging_dir);
        return vec![ImportReceipt {
            name: zip_file_name,
            path: None,
            status: "error".into(),
            error: Some("L'archivio ZIP non contiene file validi da importare".into()),
            document_id: None,
            hash: None,
            size_bytes: Some(meta.len()),
        }];
    }

    // 5. Publish from staging to final location in vault with strict symlink and collision protection
    let mut receipts = early_receipts;
    let mut policies = Vec::new();

    for item in extracted_items {
        if crate::automation::is_import_cancelled() {
            let _ = fs::remove_file(&item.staging_file);
            receipts.push(ImportReceipt {
                name: item.file_name,
                path: None,
                status: "error".into(),
                error: Some("Importazione annullata dall'utente".into()),
                document_id: None,
                hash: Some(item.sha256),
                size_bytes: Some(item.size_bytes),
            });
            break;
        }
        policies.push((item.rel_vault_path.clone(), item.index));
        let rel_path = PathBuf::from(&item.rel_vault_path);

        // Security check: verify no symlinks exist along the path from vault root to destination
        let final_dest = match verify_no_symlinks_in_path(vault, &rel_path) {
            Ok(p) => p,
            Err(e) => {
                let _ = fs::remove_file(&item.staging_file);
                receipts.push(ImportReceipt {
                    name: item.file_name,
                    path: None,
                    status: "error".into(),
                    error: Some(e),
                    document_id: None,
                    hash: Some(item.sha256),
                    size_bytes: Some(item.size_bytes),
                });
                continue;
            }
        };

        if let Some(parent) = final_dest.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                let _ = fs::remove_file(&item.staging_file);
                receipts.push(ImportReceipt {
                    name: item.file_name,
                    path: None,
                    status: "error".into(),
                    error: Some(format!("Impossibile creare cartella di destinazione: {}", e)),
                    document_id: None,
                    hash: Some(item.sha256),
                    size_bytes: Some(item.size_bytes),
                });
                continue;
            }
        }

        // Check if destination already exists: handle overwrite, duplicate or collision
        if final_dest.exists() {
            if overwrite {
                let _ = fs::remove_file(&final_dest);
                if let Err(_) = fs::rename(&item.staging_file, &final_dest) {
                    let _ = fs::copy(&item.staging_file, &final_dest);
                    let _ = fs::remove_file(&item.staging_file);
                }
                let doc_id = crate::catalog::make_document_id(&item.rel_vault_path);
                receipts.push(ImportReceipt {
                    name: item.file_name,
                    path: Some(item.rel_vault_path),
                    status: "imported".into(),
                    error: None,
                    document_id: Some(doc_id),
                    hash: Some(item.sha256),
                    size_bytes: Some(item.size_bytes),
                });
                continue;
            }

            let is_duplicate = if let Ok(existing_meta) = fs::metadata(&final_dest) {
                if existing_meta.len() == item.size_bytes {
                    if let Ok(existing_file) = File::open(&final_dest) {
                        if let Ok((existing_hash, _)) = crate::snapshots::compute_sha256_stream(existing_file) {
                            existing_hash == item.sha256
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                } else {
                    false
                }
            } else {
                false
            };

            let _ = fs::remove_file(&item.staging_file);
            let doc_id = crate::catalog::make_document_id(&item.rel_vault_path);

            if is_duplicate {
                receipts.push(ImportReceipt {
                    name: item.file_name,
                    path: Some(item.rel_vault_path),
                    status: "duplicate".into(),
                    error: None,
                    document_id: Some(doc_id),
                    hash: Some(item.sha256),
                    size_bytes: Some(item.size_bytes),
                });
            } else {
                // COLLISION: File exists but content differs!
                // NEVER overwrite! Preserve original file intact.
                receipts.push(ImportReceipt {
                    name: item.file_name,
                    path: Some(item.rel_vault_path),
                    status: "error".into(),
                    error: Some("Destinazione già occupata con contenuto differente (collisione: originale preservato senza sovrascrittura)".into()),
                    document_id: Some(doc_id),
                    hash: Some(item.sha256),
                    size_bytes: Some(item.size_bytes),
                });
            }
            continue;
        }

        let move_result = publish_staged(vault, &item.staging_file, &rel_path);

        match move_result {
            Ok(_) => {
                let doc_id = crate::catalog::make_document_id(&item.rel_vault_path);
                receipts.push(ImportReceipt {
                    name: item.file_name,
                    path: Some(item.rel_vault_path),
                    status: "imported".into(),
                    error: None,
                    document_id: Some(doc_id),
                    hash: Some(item.sha256),
                    size_bytes: Some(item.size_bytes),
                });
            }
            Err(e) => {
                receipts.push(ImportReceipt {
                    name: item.file_name,
                    path: None,
                    status: "error".into(),
                    error: Some(format!("Errore spostamento file nella destinazione finale: {}", e)),
                    document_id: None,
                    hash: Some(item.sha256),
                    size_bytes: Some(item.size_bytes),
                });
            }
        }
    }

    // Clean up staging directory
    let _ = fs::remove_dir_all(&staging_dir);

    // Sync vault catalog to register newly imported documents
    policies.retain(|(p, _)| receipts.iter().any(|r| r.path.as_ref() == Some(p) && (r.status == "imported" || r.status == "duplicate")));
    let catalog_result = crate::catalog::sync_catalog(vault).and_then(|_| crate::catalog::set_import_policies(vault, &policies));
    if let Err(e) = catalog_result {
        receipts.push(ImportReceipt { name: zip_file_name, path: None, status: "error".into(), error: Some(format!("File conservati; aggiornamento catalogo non completato: {e}")), document_id: None, hash: None, size_bytes: None });
    }

    receipts
}

/// Compatibility wrapper for automation pipeline
pub fn import_zip(vault: &Path, zip_path: &Path) -> Result<Vec<ImportReceipt>, String> {
    let receipts = import_zip_archive(vault, zip_path);
    if receipts.is_empty() {
        return Err("Nessun file importato dallo ZIP".into());
    }
    Ok(receipts)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_zip_entry_sanitization() {
        assert!(sanitize_zip_entry_path("progetti/doc.md").is_ok());
        assert!(sanitize_zip_entry_path(r"20_RAW_SOURCES\..\..\outside.txt").is_err());
        assert!(sanitize_zip_entry_path("../outside.txt").is_err());
        assert!(sanitize_zip_entry_path("C:\\windows\\win.ini").is_err());
        assert!(sanitize_zip_entry_path("/etc/passwd").is_err());
    }

    #[test]
    fn test_zip_import_with_subfolders_unicode_and_deduplication() {
        let t = tempdir().unwrap();
        let vault = t.path();
        fs::create_dir_all(vault.join("20_RAW_SOURCES")).unwrap();
        fs::create_dir_all(vault.join("00_SYSTEM")).unwrap();

        let zip_file_path = t.path().join("archivio_test.zip");
        {
            let file = File::create(&zip_file_path).unwrap();
            let mut zip = zip::ZipWriter::new(file);
            let options = zip::write::SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Deflated);

            zip.start_file("cartella1/sottocartella/nota_caffè.md", options).unwrap();
            zip.write_all(b"# Nota Caff\xc3\xa8\nContenuto test.").unwrap();

            zip.start_file("immagini/logo.txt", options).unwrap();
            zip.write_all(b"LOGO TEXT").unwrap();

            zip.finish().unwrap();
        }

        // Prima importazione: deve importare entrambi
        let receipts1 = import_zip_archive(vault, &zip_file_path);
        assert_eq!(receipts1.len(), 2);
        assert!(receipts1.iter().all(|r| r.status == "imported"));

        let file1 = vault.join("20_RAW_SOURCES/archivio_test/cartella1/sottocartella/nota_caffè.md");
        let file2 = vault.join("20_RAW_SOURCES/archivio_test/immagini/logo.txt");
        assert!(file1.exists(), "Il file con sottocartelle e caratteri accentati deve esistere");
        assert!(file2.exists(), "Il secondo file deve esistere");

        // Seconda importazione: deve rilevare duplicati
        let receipts2 = import_zip_archive(vault, &zip_file_path);
        assert_eq!(receipts2.len(), 2);
        assert!(receipts2.iter().all(|r| r.status == "duplicate"));
    }

    #[test]
    fn test_zip_collision_preserves_original() {
        let t = tempdir().unwrap();
        let vault = t.path();
        fs::create_dir_all(vault.join("00_SYSTEM")).unwrap();
        let target = vault.join("20_RAW_SOURCES/collision/nota.txt");
        fs::create_dir_all(target.parent().unwrap()).unwrap();
        fs::write(&target, b"ORIGINALE").unwrap();

        let zip_file_path = t.path().join("collision.zip");
        {
            let file = File::create(&zip_file_path).unwrap();
            let mut zip = zip::ZipWriter::new(file);
            let options = zip::write::SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Deflated);

            zip.start_file("20_RAW_SOURCES/collision/nota.txt", options).unwrap();
            zip.write_all(b"NUOVO").unwrap();
            zip.finish().unwrap();
        }

        let receipts = import_zip_archive(vault, &zip_file_path);
        assert_eq!(receipts.len(), 1);
        assert_eq!(receipts[0].status, "error");
        assert!(receipts[0].error.as_ref().unwrap().contains("collisione"));
        // Original file must be preserved!
        assert_eq!(fs::read(&target).unwrap(), b"ORIGINALE");
    }

    #[test]
    fn test_zip_symlink_destination_blocked() {
        let t = tempdir().unwrap();
        let vault = t.path();
        let outside = t.path().join("outside_dir");
        fs::create_dir_all(&outside).unwrap();
        fs::create_dir_all(vault.join("20_RAW_SOURCES")).unwrap();
        fs::create_dir_all(vault.join("00_SYSTEM")).unwrap();

        #[cfg(unix)]
        {
            std::os::unix::fs::symlink(&outside, vault.join("20_RAW_SOURCES/link")).unwrap();
            let zip_file_path = t.path().join("symlink_test.zip");
            {
                let file = File::create(&zip_file_path).unwrap();
                let mut zip = zip::ZipWriter::new(file);
                let options = zip::write::SimpleFileOptions::default()
                    .compression_method(zip::CompressionMethod::Deflated);

                zip.start_file("20_RAW_SOURCES/link/marker.txt", options).unwrap();
                zip.write_all(b"DANGEROUS").unwrap();
                zip.finish().unwrap();
            }

            let receipts = import_zip_archive(vault, &zip_file_path);
            assert_eq!(receipts.len(), 1);
            assert_eq!(receipts[0].status, "error");
            assert!(receipts[0].error.as_ref().unwrap().contains("link simbolico"));
            assert!(!outside.join("marker.txt").exists(), "Writing through symlink must be blocked!");
        }
    }

    #[test]
    fn test_bnxt_zip_root_remapping_and_exclusions() {
        let t = tempdir().unwrap();
        let vault = t.path();
        fs::create_dir_all(vault.join("20_RAW_SOURCES")).unwrap();
        fs::create_dir_all(vault.join("00_SYSTEM")).unwrap();

        let zip_file_path = t.path().join("bnxt_package.zip");
        {
            let file = File::create(&zip_file_path).unwrap();
            let mut zip = zip::ZipWriter::new(file);
            let options = zip::write::SimpleFileOptions::default()
                .compression_method(zip::CompressionMethod::Deflated);

            // 1. Valid BNXT RAG document
            zip.start_file("BNXT_LIMEN_V8/20_RAW_SOURCES/BNXT/RAG/doc1.md", options).unwrap();
            zip.write_all(b"# Doc 1\nContenuto RAG.").unwrap();

            // 2. Valid BNXT WIKI document
            zip.start_file("BNXT_LIMEN_V8/20_RAW_SOURCES/BNXT/WIKI/wiki1.md", options).unwrap();
            zip.write_all(b"# Wiki 1\nContenuto Wiki.").unwrap();

            // 3. Technical support to be excluded
            zip.start_file("BNXT_LIMEN_V8/SUPPORTO_NON_IMPORTARE/report.json", options).unwrap();
            zip.write_all(b"{\"report\": true}").unwrap();

            // 4. AppleDouble file to be excluded
            zip.start_file("__MACOSX/._doc1.md", options).unwrap();
            zip.write_all(b"mac metadata").unwrap();

            // 5. Old pre-calculated chunks to be excluded
            zip.start_file("BNXT_LIMEN_V8/CHUNKS_RAG.jsonl", options).unwrap();
            zip.write_all(b"{\"chunk\": 1}\n").unwrap();

            zip.finish().unwrap();
        }

        let receipts = import_zip_archive(vault, &zip_file_path);
        // Only the 2 valid documents should be imported!
        assert_eq!(receipts.len(), 2, "Solo i 2 documenti validi devono essere importati");
        assert!(receipts.iter().all(|r| r.status == "imported"));

        // Must be placed directly in 20_RAW_SOURCES/BNXT/... without redundant folders
        let doc1 = vault.join("20_RAW_SOURCES/BNXT/RAG/doc1.md");
        let wiki1 = vault.join("20_RAW_SOURCES/BNXT/WIKI/wiki1.md");
        let support = vault.join("20_RAW_SOURCES/BNXT/SUPPORTO_NON_IMPORTARE/report.json");
        let chunks = vault.join("20_RAW_SOURCES/BNXT/CHUNKS_RAG.jsonl");

        assert!(doc1.exists(), "doc1.md deve trovarsi direttamente in 20_RAW_SOURCES/BNXT/RAG/");
        assert!(wiki1.exists(), "wiki1.md deve trovarsi direttamente in 20_RAW_SOURCES/BNXT/WIKI/");
        assert!(!support.exists(), "SUPPORTO_NON_IMPORTARE non deve essere importato");
        assert!(!chunks.exists(), "CHUNKS_RAG.jsonl non deve essere importato");
    }
}
