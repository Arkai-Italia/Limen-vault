//! Reviewable import plans shared by file selection and native folder/file drops.
use crate::{automation::{self, ImportReceipt}, zip_import};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::{Path, PathBuf}};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportChoice {
    pub source_path: String,
    pub entry_index: Option<usize>,
    pub index: bool,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportItem {
    pub source_path: String,
    pub entry_index: Option<usize>,
    pub name: String,
    pub target_path: String,
    pub size_bytes: u64,
    pub index: bool,
    pub can_extract: bool,
    pub blocked_reason: Option<String>,
}
fn can_extract(name: &str) -> bool {
    let ext = Path::new(name).extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
    zip_import::is_document_extension(&ext) || ["json", "xml", "yaml", "yml", "log", "rtf", "gif", "tif", "tiff", "heic"].contains(&ext.as_str())
}
pub fn inspect(vault: &Path, sources: &[PathBuf]) -> Result<Vec<ImportItem>, String> {
    let mut files = Vec::new();
    let mut errors = Vec::new();
    let mut remaining = 10_000;
    let canonical = vault.canonicalize().map_err(|e| e.to_string())?;
    for source in sources {
        automation::collect_import_files(source, Some(&canonical), 0, &mut remaining, &mut files, &mut errors);
    }
    let mut items = Vec::new();
    for file in files {
        let source_path = file.to_string_lossy().to_string();
        if file.extension().is_some_and(|e| e.eq_ignore_ascii_case("zip")) {
            let report = match zip_import::inspect_zip(vault, &file) {
                Ok(report) => report,
                Err(error) => {
                    items.push(ImportItem { source_path, entry_index: None, name: file.file_name().unwrap_or_default().to_string_lossy().into_owned(), target_path: String::new(), size_bytes: file.metadata().map(|m| m.len()).unwrap_or(0), index: false, can_extract: false, blocked_reason: Some(error) });
                    continue;
                }
            };
            for entry in report.items {
                items.push(ImportItem { source_path: source_path.clone(), entry_index: Some(entry.entry_index), can_extract: can_extract(&entry.source_name), name: entry.source_name, target_path: entry.target_path, size_bytes: entry.size_bytes, index: entry.is_document, blocked_reason: entry.blocked_reason });
            }
        } else {
            let size = file.metadata().map_err(|e| e.to_string())?.len();
            let name = file.file_name().unwrap_or_default().to_string_lossy().to_string();
            let ext = file.extension().and_then(|e| e.to_str()).unwrap_or("");
            items.push(ImportItem { source_path, entry_index: None, target_path: format!("20_RAW_SOURCES/[hash]-{name}"), index: zip_import::is_document_extension(ext), can_extract: can_extract(&name), name, size_bytes: size, blocked_reason: (size > automation::MAX_IMPORT_FILE_SIZE_BYTES).then(|| "File oltre 2 GB".into()) });
        }
    }
    for (path, error) in errors {
        items.push(ImportItem { source_path: path.to_string_lossy().into_owned(), entry_index: None, name: path.to_string_lossy().into_owned(), target_path: String::new(), size_bytes: 0, index: false, can_extract: false, blocked_reason: Some(error) });
    }
    Ok(items)
}

pub fn execute(vault: &Path, choices: &[ImportChoice], progress: &dyn Fn(u64, u64, &str)) -> Result<Vec<ImportReceipt>, String> {
    let previous = crate::catalog::load_catalog_arc(vault)?;
    let sources: Vec<PathBuf> = choices.iter().map(|c| PathBuf::from(&c.source_path)).collect();
    // Revalidate source paths at execution; a preview never grants filesystem access.
    let plan = inspect(vault, &sources.into_iter().collect::<std::collections::BTreeSet<_>>().into_iter().collect::<Vec<_>>())?;
    for choice in choices {
        let item = plan.iter().find(|i| i.source_path == choice.source_path && i.entry_index == choice.entry_index).ok_or("Selezione non più valida: riapri l’anteprima")?;
        if let Some(error) = &item.blocked_reason { return Err(error.clone()); }
        if choice.index && !item.can_extract { return Err("Formato conservabile ma non estraibile".into()); }
    }
    let mut groups: BTreeMap<&str, Vec<&ImportChoice>> = BTreeMap::new();
    for choice in choices { groups.entry(&choice.source_path).or_default().push(choice); }
    let mut receipts = Vec::new();
    for (source, group) in groups {
        if automation::is_import_cancelled() { break; }
        let path = Path::new(source);
        if group[0].entry_index.is_some() {
            let selected = group.iter().map(|c| (c.entry_index.unwrap(), c.index)).collect();
            receipts.extend(zip_import::import_zip_selected(vault, path, Some(&selected), Some(progress)));
        } else {
            let size = path.metadata().map_err(|e| e.to_string())?.len();
            let report = |done| progress(done, size, source);
            let receipt = automation::import_selected_with_progress(vault, path, Some(&report));
            if let Some(path) = &receipt.path {
                if receipt.status == "imported" || receipt.status == "duplicate" {
                    crate::catalog::sync_catalog(vault)?;
                    crate::catalog::set_import_policies(vault, &[(path.clone(), group[0].index)])?;
                }
            }
            receipts.push(receipt);
        }
    }
    // Rebuild immediately only when a previously indexed document was excluded.
    // New pending documents enter the normal, explicit indexing-consent flow.
    if choices.iter().any(|c| !c.index) && receipts.iter().filter_map(|r| r.document_id.as_ref())
        .any(|id| previous.documents.get(id).is_some_and(|doc| !doc.passages.is_empty())) {
        crate::search::index_vault_search(vault)?;
    }
    Ok(receipts)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    #[test]
    fn preview_selection_and_persistent_support_policy() {
        let temp = tempfile::tempdir().unwrap();
        let vault = temp.path().join("vault");
        std::fs::create_dir_all(vault.join("00_SYSTEM")).unwrap();
        std::fs::create_dir_all(vault.join("20_RAW_SOURCES")).unwrap();
        let input = temp.path().join("example.zip");
        let mut zip = zip::ZipWriter::new(std::fs::File::create(&input).unwrap());
        for (name, content) in [("support.txt", "must stay support"), ("document.json", "{\"title\":\"chosen document\"}"), ("skip.txt", "not selected"), ("00_system/VAULT_CATALOG.json", "invalid")] {
            zip.start_file(name, zip::write::SimpleFileOptions::default()).unwrap();
            zip.write_all(content.as_bytes()).unwrap();
        }
        zip.finish().unwrap();
        // Generic archives are nested, so explicitly test all reserved case variants too.
        assert!(zip_import::is_reserved_vault_path(Path::new("00_system/VAULT_CATALOG.json")));
        assert!(zip_import::is_reserved_vault_path(Path::new(".GIT/config")));
        let plan = inspect(&vault, &[input]).unwrap();
        let choices = plan.iter().filter(|i| i.name == "support.txt" || i.name == "document.json")
            .map(|i| ImportChoice { source_path: i.source_path.clone(), entry_index: i.entry_index, index: i.name == "document.json" }).collect::<Vec<_>>();
        let receipts = execute(&vault, &choices, &|_, _, _| {}).unwrap();
        assert_eq!(receipts.len(), 2);
        assert!(receipts.iter().all(|r| r.status == "imported"));
        crate::catalog::process_pending_extractions(&vault).unwrap();
        let catalog = crate::catalog::load_catalog(&vault).unwrap();
        let support = catalog.documents.values().find(|d| d.file_name == "support.txt").unwrap();
        assert!(crate::catalog::is_support_document(support));
        assert!(support.passages.is_empty());
        let document = catalog.documents.values().find(|d| d.file_name == "document.json").unwrap();
        assert_eq!(document.extraction_status, crate::catalog::ExtractionStatus::Ready);
        assert!(document.passages.iter().any(|p| p.text.contains("chosen document")));
        assert!(!vault.join("20_RAW_SOURCES/example/skip.txt").exists());
        std::fs::write(vault.join(&support.original_path), "modified support").unwrap();
        let synced = crate::catalog::sync_catalog(&vault).unwrap();
        assert_eq!(synced.documents[&support.document_id].extraction_status, crate::catalog::ExtractionStatus::Unsupported);
        crate::search::index_vault_search(&vault).unwrap();
        let query = crate::search::SearchQuery { term: Some("chosen".into()), ..Default::default() };
        assert!(!crate::search::search_vault(&vault, query.clone()).unwrap().is_empty());
        let json_choice = choices.iter().find(|c| plan.iter().any(|i| i.entry_index == c.entry_index && i.name == "document.json")).unwrap();
        let as_support = vec![ImportChoice { source_path: json_choice.source_path.clone(), entry_index: json_choice.entry_index, index: false }];
        execute(&vault, &as_support, &|_, _, _| {}).unwrap();
        assert!(crate::search::search_vault(&vault, query).unwrap().is_empty());
    }
}
