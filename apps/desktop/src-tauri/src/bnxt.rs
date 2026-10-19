use serde::Serialize;
use std::path::{Path, PathBuf};
use std::time::Instant;
use tauri::Emitter;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BnxtProgressPayload {
    pub phase: String,
    pub current_file_name: String,
    pub processed_count: usize,
    pub total_count: usize,
    pub bytes_transferred: u64,
    pub total_bytes: u64,
    pub indexed_count: usize,
    pub conserved_count: usize,
    pub error_count: usize,
    pub elapsed_seconds: u64,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BnxtCorpusStatus {
    pub is_present: bool,
    pub file_count: usize,
    pub indexed_count: usize,
    pub conserved_count: usize,
    pub default_source_path: String,
    pub source_available: bool,
    pub default_zip_path: String,
    pub zip_available: bool,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BnxtInspectResult {
    pub source_path: String,
    pub total_files: usize,
    pub total_uncompressed_bytes: u64,
    pub document_files_count: usize,
    pub support_files_count: usize,
    pub existing_files_count: usize,
    pub identical_files_count: usize,
    pub has_existing_files: bool,
}

pub fn default_source_directory() -> PathBuf {
    if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home).join("Documents/bnxt_crm")
    } else {
        PathBuf::from("/Users/cesare/Documents/bnxt_crm")
    }
}

pub fn default_zip_path() -> PathBuf {
    if let Ok(home) = std::env::var("HOME") {
        PathBuf::from(home).join("Downloads/BNXT_LIMEN_V8normalizzato.zip")
    } else {
        PathBuf::from("/Users/cesare/Downloads/BNXT_LIMEN_V8normalizzato.zip")
    }
}

pub fn resolve_source_path(source_path: Option<&str>) -> PathBuf {
    let default_zip = default_zip_path();
    let default_src = default_source_directory();
    if let Some(p) = source_path {
        let trimmed = p.trim();
        if !trimmed.is_empty() {
            let pb = PathBuf::from(trimmed);
            if pb.exists() {
                return pb;
            }
            if default_zip.is_file() && (trimmed.contains("BNXT_LIMEN_V8") || trimmed.ends_with(".zip")) {
                return default_zip;
            }
            if let Ok(home) = std::env::var("HOME") {
                let in_dl = PathBuf::from(&home).join("Downloads").join(trimmed);
                if in_dl.is_file() {
                    return in_dl;
                }
            }
            return pb;
        }
    }
    if default_zip.is_file() {
        default_zip
    } else {
        default_src
    }
}

pub fn install_bnxt_manuals(vault: &Path) {
    let manuals_staging = PathBuf::from(".local/manuals_staging");
    let target_base = vault.join("20_RAW_SOURCES").join("BNXT");
    if manuals_staging.is_dir() {
        for app in &["CRM", "QC", "DELPO", "LIMEN"] {
            let app_dir = manuals_staging.join(app);
            if app_dir.is_dir() {
                let target_app_dir = target_base.join(app);
                let _ = std::fs::create_dir_all(&target_app_dir);
                if let Ok(entries) = std::fs::read_dir(app_dir) {
                    for entry in entries.flatten() {
                        let dest = target_app_dir.join(entry.file_name());
                        let _ = std::fs::copy(entry.path(), dest);
                    }
                }
            }
        }
    }
}

pub fn is_indexable_extension(ext: &str) -> bool {
    let lower = ext.to_lowercase();
    matches!(lower.as_str(), "md" | "pdf" | "docx" | "txt")
}

pub fn should_skip_dir(dir_name: &str) -> bool {
    dir_name.starts_with('.') || matches!(dir_name, "node_modules" | "target" | "dist" | ".git" | ".agents" | ".claude" | ".github")
}

pub fn should_skip_file(file_name: &str) -> bool {
    file_name.starts_with('.') || matches!(file_name, ".DS_Store" | ".gitignore" | ".npmrc")
}

pub fn collect_source_files(
    dir: &Path,
    root: &Path,
    files: &mut Vec<(PathBuf, String, u64, bool)>, // (full_path, rel_path, size, is_indexable)
) {
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            let file_name = entry.file_name().to_string_lossy().to_string();
            if path.is_dir() {
                if !should_skip_dir(&file_name) {
                    collect_source_files(&path, root, files);
                }
            } else if path.is_file() {
                if !should_skip_file(&file_name) {
                    let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                    let rel_path = path
                        .strip_prefix(root)
                        .map(|p| p.to_string_lossy().to_string())
                        .unwrap_or_else(|_| file_name.clone());
                    let ext = path
                        .extension()
                        .and_then(|e| e.to_str())
                        .unwrap_or("");
                    let indexable = is_indexable_extension(ext);
                    files.push((path, rel_path, size, indexable));
                }
            }
        }
    }
}

#[tauri::command]
pub async fn bnxt_check_status(vault_path: String) -> Result<BnxtCorpusStatus, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let vault = Path::new(&vault_path);
        let bnxt_dir = vault.join("20_RAW_SOURCES").join("BNXT");
        let default_src = default_source_directory();
        let source_available = default_src.is_dir();
        let default_zip = default_zip_path();
        let zip_available = default_zip.is_file();

        let mut file_count = 0usize;
        let mut indexed_count = 0usize;
        let mut conserved_count = 0usize;

        if bnxt_dir.is_dir() {
            let mut scanned = Vec::new();
            collect_source_files(&bnxt_dir, &bnxt_dir, &mut scanned);
            file_count = scanned.len();
            for (_, _, _, indexable) in &scanned {
                if *indexable {
                    indexed_count += 1;
                } else {
                    conserved_count += 1;
                }
            }
        }

        let is_present = file_count >= 50;

        Ok(BnxtCorpusStatus {
            is_present,
            file_count,
            indexed_count,
            conserved_count,
            default_source_path: default_src.to_string_lossy().to_string(),
            source_available,
            default_zip_path: default_zip.to_string_lossy().to_string(),
            zip_available,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn bnxt_inspect_source(
    vault_path: String,
    source_path: Option<String>,
) -> Result<BnxtInspectResult, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let vault = Path::new(&vault_path);
        let src = resolve_source_path(source_path.as_deref());
        if !src.exists() {
            return Err(format!("Sorgente BNXT non trovata: {}", src.display()));
        }

        if src.is_file() {
            let preview = limen_vault::zip_import::inspect_zip(vault, &src)?;
            let mut existing_count = 0usize;
            let mut identical_count = 0usize;

            for item in &preview.items {
                if item.exists {
                    existing_count += 1;
                    let target = vault.join(&item.target_path);
                    if let Ok(m) = std::fs::metadata(&target) {
                        if m.len() == item.size_bytes {
                            identical_count += 1;
                        }
                    }
                }
            }

            Ok(BnxtInspectResult {
                source_path: src.to_string_lossy().to_string(),
                total_files: preview.total_files,
                total_uncompressed_bytes: preview.total_uncompressed_bytes,
                document_files_count: preview.document_files_count,
                support_files_count: preview.support_files_count,
                existing_files_count: existing_count,
                identical_files_count: identical_count,
                has_existing_files: existing_count > 0,
            })
        } else {
            let bnxt_dir = vault.join("20_RAW_SOURCES").join("BNXT");
            let mut scanned = Vec::new();
            collect_source_files(&src, &src, &mut scanned);
            let total_files = scanned.len();
            let total_bytes = scanned.iter().map(|(_, _, sz, _)| *sz).sum();
            let doc_count = scanned.iter().filter(|(_, _, _, idx)| *idx).count();
            let mut existing_count = 0usize;
            let mut identical_count = 0usize;
            if bnxt_dir.is_dir() {
                for (_, rel, sz, _) in &scanned {
                    let dest = bnxt_dir.join(rel);
                    if dest.exists() {
                        existing_count += 1;
                        if let Ok(m) = std::fs::metadata(&dest) {
                            if m.len() == *sz {
                                identical_count += 1;
                            }
                        }
                    }
                }
            }
            Ok(BnxtInspectResult {
                source_path: src.to_string_lossy().to_string(),
                total_files,
                total_uncompressed_bytes: total_bytes,
                document_files_count: doc_count,
                support_files_count: total_files.saturating_sub(doc_count),
                existing_files_count: existing_count,
                identical_files_count: identical_count,
                has_existing_files: existing_count > 0,
            })
        }
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn bnxt_prepare_vault(
    vault_path: String,
    source_path: Option<String>,
    duplicate_policy: Option<String>,
    app: tauri::AppHandle,
) -> Result<BnxtCorpusStatus, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let vault = Path::new(&vault_path);
        if !vault.is_dir() {
            return Err("Percorso Vault specificato non valido".into());
        }

        let src = resolve_source_path(source_path.as_deref());
        if !src.exists() {
            return Err(format!(
                "Sorgente BNXT non trovata: {}",
                src.display()
            ));
        }

        let policy = duplicate_policy.unwrap_or_else(|| "skip".to_string());
        limen_vault::automation::reset_import_cancelled();
        let start_time = Instant::now();
        let last_emit = std::sync::Mutex::new(Instant::now());

        let emit_progress = |phase: &str, file: &str, done: usize, total: usize, b_done: u64, b_total: u64, idx: usize, cons: usize, errs: usize| {
            let elapsed = start_time.elapsed().as_secs();
            let _ = app.emit(
                "bnxt_progress",
                BnxtProgressPayload {
                    phase: phase.to_string(),
                    current_file_name: file.to_string(),
                    processed_count: done,
                    total_count: total,
                    bytes_transferred: b_done,
                    total_bytes: b_total,
                    indexed_count: idx,
                    conserved_count: cons,
                    error_count: errs,
                    elapsed_seconds: elapsed,
                },
            );
        };

        let emit_progress_throttled = |phase: &str, file: &str, done: usize, total: usize, b_done: u64, b_total: u64, idx: usize, cons: usize, errs: usize, force: bool| {
            let mut last = match last_emit.lock() {
                Ok(guard) => guard,
                Err(poisoned) => poisoned.into_inner(),
            };
            if force || last.elapsed().as_millis() >= 120 {
                *last = Instant::now();
                drop(last);
                emit_progress(phase, file, done, total, b_done, b_total, idx, cons, errs);
            }
        };

        let mut processed = 0usize;
        let mut current_indexed = 0usize;
        let mut current_conserved = 0usize;
        let mut error_count = 0usize;
        let mut total_count = 0usize;
        let mut total_bytes = 0u64;
        let mut bytes_transferred = 0u64;

        if policy == "continue_without_upload" {
            emit_progress("verifying", "Controllo file già presenti nel Vault...", 0, 0, 0, 0, 0, 0, 0);
            let bnxt_dir = vault.join("20_RAW_SOURCES").join("BNXT");
            if bnxt_dir.is_dir() {
                let mut scanned = Vec::new();
                collect_source_files(&bnxt_dir, &bnxt_dir, &mut scanned);
                processed = scanned.len();
                total_count = scanned.len();
                current_indexed = scanned.iter().filter(|(_, _, _, idx)| *idx).count();
                current_conserved = total_count.saturating_sub(current_indexed);
                total_bytes = scanned.iter().map(|(_, _, sz, _)| *sz).sum();
                bytes_transferred = total_bytes;
            }
            emit_progress("loading", "Utilizzo file già presenti nel Vault (nessun upload)", processed, total_count, bytes_transferred, total_bytes, current_indexed, current_conserved, 0);
            install_bnxt_manuals(vault);
        } else if src.is_file() {
            // --- FASE 1: Verifica del pacchetto ZIP ---
            emit_progress("verifying", "Ispezione e verifica archivio ZIP BNXT...", 0, 0, 0, 0, 0, 0, 0);
            let preview = match limen_vault::zip_import::inspect_zip(vault, &src) {
                Ok(p) => p,
                Err(e) => return Err(format!("Errore ispezione archivio ZIP: {}", e)),
            };

            total_count = preview.total_files;
            total_bytes = preview.total_uncompressed_bytes;
            current_indexed = preview.document_files_count;
            current_conserved = preview.support_files_count;

            emit_progress(
                "verifying",
                &format!("Archivio BNXT verificato: {} file documentali ({} MB)", total_count, total_bytes / (1024 * 1024)),
                total_count,
                total_count,
                0,
                total_bytes,
                current_indexed,
                current_conserved,
                0,
            );

            if limen_vault::automation::is_import_cancelled() {
                emit_progress("cancelled", "Operazione annullata", 0, total_count, 0, total_bytes, 0, 0, 0);
                return Err("Operazione annullata dall'utente".into());
            }

            // --- FASE 2: Installazione del Vault ---
            emit_progress("loading", "Decompressione e installazione nel Vault...", 0, total_count, 0, total_bytes, 0, 0, 0);
            let overwrite = policy == "overwrite";
            let receipts = limen_vault::zip_import::import_zip_selected_ext(
                vault,
                &src,
                None,
                overwrite,
                Some(&|written, total, name| {
                    emit_progress_throttled("loading", name, 0, total_count, written, total, 0, 0, 0, false);
                }),
            );

            let errors: Vec<_> = receipts.iter().filter(|r| r.status == "error").collect();
            error_count = errors.len();
            processed = receipts.iter().filter(|r| r.status == "imported" || r.status == "duplicate").count();
            bytes_transferred = total_bytes;

            // Integra i manuali applicativi consolidati
            install_bnxt_manuals(vault);
        } else {
            // --- FASE 1: Verifica dei file (fallback cartella sorgente) ---
            emit_progress("verifying", "Scansione file sorgente...", 0, 0, 0, 0, 0, 0, 0);
            let mut source_files = Vec::new();
            collect_source_files(&src, &src, &mut source_files);

            if source_files.is_empty() {
                return Err("Nessun file trovato nella directory sorgente BNXT".into());
            }

            total_count = source_files.len();
            total_bytes = source_files.iter().map(|(_, _, sz, _)| *sz).sum();
            let total_indexable = source_files.iter().filter(|(_, _, _, idx)| *idx).count();
            let total_conserved = total_count - total_indexable;

            emit_progress(
                "verifying",
                &format!("Verificati {} file ({} MB)", total_count, total_bytes / (1024 * 1024)),
                total_count,
                total_count,
                0,
                total_bytes,
                total_indexable,
                total_conserved,
                0,
            );

            if limen_vault::automation::is_import_cancelled() {
                emit_progress("cancelled", "Operazione annullata", 0, total_count, 0, total_bytes, 0, 0, 0);
                return Err("Operazione annullata dall'utente".into());
            }

            // --- FASE 2: Caricamento nel Vault ---
            let target_base = vault.join("20_RAW_SOURCES").join("BNXT");
            if let Err(e) = std::fs::create_dir_all(&target_base) {
                return Err(format!("Impossibile creare directory target BNXT: {}", e));
            }

            for (src_path, rel_path, size, is_idx) in &source_files {
                if limen_vault::automation::is_import_cancelled() {
                    emit_progress(
                        "cancelled",
                        "Operazione annullata",
                        processed,
                        total_count,
                        bytes_transferred,
                        total_bytes,
                        current_indexed,
                        current_conserved,
                        error_count,
                    );
                    return Err("Operazione annullata dall'utente".into());
                }

                let dest_path = target_base.join(rel_path);
                if let Some(parent) = dest_path.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }

                // Controllo idempotente: se già esiste con stessa dimensione, non riscrittura
                let need_copy = match std::fs::metadata(&dest_path) {
                    Ok(m) => m.len() != *size,
                    Err(_) => true,
                };

                if need_copy {
                    if let Err(e) = std::fs::copy(src_path, &dest_path) {
                        error_count += 1;
                        eprintln!("Errore copia {}: {}", src_path.display(), e);
                    }
                }

                bytes_transferred += *size;
                processed += 1;
                if *is_idx {
                    current_indexed += 1;
                } else {
                    current_conserved += 1;
                }

                emit_progress(
                    "loading",
                    rel_path,
                    processed,
                    total_count,
                    bytes_transferred,
                    total_bytes,
                    current_indexed,
                    current_conserved,
                    error_count,
                );
            }

            // Integra i manuali applicativi consolidati
            install_bnxt_manuals(vault);
        }

        // --- FASE 3: Estrazione dei contenuti ---
        emit_progress(
            "extracting",
            "Sincronizzazione catalogo...",
            processed,
            total_count,
            bytes_transferred,
            total_bytes,
            current_indexed,
            current_conserved,
            error_count,
        );

        if let Err(e) = limen_vault::catalog::sync_catalog(vault) {
            eprintln!("Avviso sync catalogo: {}", e);
        }

        emit_progress(
            "extracting",
            "Estrazione testo in streaming...",
            processed,
            total_count,
            bytes_transferred,
            total_bytes,
            current_indexed,
            current_conserved,
            error_count,
        );

        if let Err(e) = limen_vault::catalog::process_pending_extractions(vault) {
            eprintln!("Avviso estrazione documenti: {}", e);
        }

        // --- FASE 4: Indicizzazione per la ricerca ---
        emit_progress(
            "indexing",
            "Aggiornamento indici di ricerca BM25 e vettoriali...",
            processed,
            total_count,
            bytes_transferred,
            total_bytes,
            current_indexed,
            current_conserved,
            error_count,
        );

        if let Err(e) = limen_vault::search::index_vault_search(vault) {
            eprintln!("Avviso indicizzazione ricerca: {}", e);
        }

        // --- FASE 5: Verifica finale ---
        emit_progress(
            "finalizing",
            "Allineamento catalogo e verifica finale...",
            processed,
            total_count,
            bytes_transferred,
            total_bytes,
            current_indexed,
            current_conserved,
            error_count,
        );

        let _ = limen_vault::catalog::sync_catalog(vault);

        emit_progress(
            "completed",
            "Vault BNXT pronto",
            processed,
            total_count,
            bytes_transferred,
            total_bytes,
            current_indexed,
            current_conserved,
            error_count,
        );

        let def_zip = default_zip_path();
        let zip_avail = def_zip.is_file();
        Ok(BnxtCorpusStatus {
            is_present: true,
            file_count: processed,
            indexed_count: current_indexed,
            conserved_count: current_conserved,
            default_source_path: src.to_string_lossy().to_string(),
            source_available: true,
            default_zip_path: def_zip.to_string_lossy().to_string(),
            zip_available: zip_avail,
        })
    })
    .await
    .map_err(|e| e.to_string())?
}
