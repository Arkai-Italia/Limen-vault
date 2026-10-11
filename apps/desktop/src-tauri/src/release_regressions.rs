use crate::{catalog, embeddings, indexing, search, vault};
use std::fs;
use std::path::PathBuf;
fn fixture() -> tempfile::TempDir {
    let tmp = tempfile::tempdir().unwrap();
    let template = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
    vault::create(tmp.path(), Some("Synthetic regression".into()), &template).unwrap();
    tmp
}
#[test]
fn release_mode_is_per_vault_persisted_and_independent_of_embeddings() {
    let a = fixture(); let b = fixture();
    embeddings::set_ai_mode(a.path(), "local_only").unwrap();
    embeddings::set_ai_mode(b.path(), "hybrid").unwrap();
    embeddings::set_embeddings_provider(b.path(), "local", 0).unwrap();
    assert!(embeddings::require_cloud_allowed(a.path()).is_err());
    assert!(embeddings::require_cloud_allowed(b.path()).is_ok());
    assert_eq!(embeddings::get_ai_mode(a.path()), "local_only");
    assert!(embeddings::set_embeddings_provider(a.path(), "openai", 0).is_err());
    assert!(embeddings::set_ai_mode(a.path(), "invalid").is_err());
    assert_eq!(embeddings::get_ai_mode(a.path()), "local_only");
    fs::write(a.path().join("00_SYSTEM/SYNC_PROFILE.json"), "broken").unwrap();
    assert!(embeddings::require_cloud_allowed(a.path()).is_err());
    assert!(embeddings::set_ai_mode(a.path(), "hybrid").is_err());
}
#[test]
fn release_all_extraction_failures_are_persisted() {
    let t = fixture();
    fs::write(t.path().join("20_RAW_SOURCES/bad.docx"), b"not a ZIP").unwrap();
    catalog::sync_catalog(t.path()).unwrap();
    assert_eq!(catalog::process_pending_extractions(t.path()).unwrap(), 0);
    let docs = catalog::load_catalog(t.path()).unwrap();
    let raw = docs.documents.values().find(|d| d.file_name == "bad.docx").unwrap();
    assert!(!matches!(raw.extraction_status, catalog::ExtractionStatus::Pending | catalog::ExtractionStatus::Processing | catalog::ExtractionStatus::Ready));
    assert!(raw.extraction_error.is_some());
    assert!(raw.indexing_authorized_hash.is_some());
    let status = indexing::status(t.path()).unwrap();
    assert_eq!(status.attention_documents, 1);
    assert!(!status.complete);
}
#[test]
fn release_completion_scans_beyond_500_and_requires_index_and_vectors() {
    let t = fixture();
    for i in 0..501 { fs::write(t.path().join(format!("20_RAW_SOURCES/{i:04}.txt")), format!("synthetic text document {i}")).unwrap(); }
    fs::write(t.path().join("20_RAW_SOURCES/zz-bad.docx"), b"not a ZIP").unwrap();
    catalog::sync_catalog(t.path()).unwrap();
    assert_eq!(catalog::process_pending_extractions(t.path()).unwrap(), 501);
    let before = indexing::status(t.path()).unwrap();
    assert_eq!(before.attention_documents, 1);
    assert!(!before.lexical_current);
    search::index_vault_search(t.path()).unwrap();
    let after = indexing::status(t.path()).unwrap();
    assert!(after.lexical_current);
    assert!(after.missing_passages >= 501);
    assert!(!after.complete);
}
#[test]
fn release_serialized_explorer_contract_and_external_links() {
    let t = fixture(); let outside = tempfile::tempdir().unwrap();
    fs::create_dir_all(t.path().join("CUSTOM/nested")).unwrap();
    fs::write(t.path().join("CUSTOM/nested/file.txt"), "sample").unwrap();
    let folders = serde_json::to_value(vault::list_vault_folders(t.path()).unwrap()).unwrap();
    assert!(folders.as_array().unwrap().iter().any(|f| f["id"] == "CUSTOM"));
    let files = serde_json::to_value(vault::list_vault_folder_files(t.path(), "CUSTOM/nested").unwrap()).unwrap();
    assert_eq!(files["files"][0]["relativePath"], "CUSTOM/nested/file.txt");
    assert_eq!(files["files"][0]["sizeBytes"], 6);
    #[cfg(unix)] {
        std::os::unix::fs::symlink(outside.path(), t.path().join("CUSTOM/external")).unwrap();
        assert!(vault::list_vault_folder_files(t.path(), "CUSTOM/external").is_err());
        assert!(!vault::list_vault_folder_files(t.path(), "CUSTOM").unwrap().files.iter().any(|f| f.name == "external"));
    }
}

#[test]
fn release_recursive_import_and_document_format_filters() {
    let t = fixture();
    let input = tempfile::tempdir().unwrap();
    fs::create_dir(input.path().join("nested")).unwrap();
    fs::write(input.path().join("one.txt"), "testo uno").unwrap();
    fs::write(input.path().join("nested/two.md"), "# nota due").unwrap();
    fs::write(input.path().join("nested/three.PDF"), "%PDF synthetic filter only").unwrap();
    fs::write(input.path().join(".DS_Store"), "hidden").unwrap();
    #[cfg(unix)]
    std::os::unix::fs::symlink(input.path(), input.path().join("loop")).unwrap();
    let results = crate::automation::import_paths(t.path(), &[input.path()]);
    assert_eq!(results.iter().filter(|r| r.status == "imported").count(), 3);
    #[cfg(unix)]
    assert_eq!(results.iter().filter(|r| r.status == "error").count(), 1);
    assert!(results.iter().all(|r| !r.name.contains("DS_Store")));
    let catalog = catalog::load_catalog(t.path()).unwrap();
    assert_eq!(catalog.documents.values().filter(|d| d.original_path.starts_with("20_RAW_SOURCES/")).count(), 3);
    assert!(catalog.documents.values().all(|d| d.indexing_authorized_hash.is_none()));
    for (format, expected) in [("pdf", 1), ("md", 1), ("txt", 1), ("xlsx", 0)] {
        let response = catalog::list_documents(t.path(), catalog::CatalogListOptions {
            format: Some(format.into()), ..Default::default()
        }).unwrap();
        assert_eq!(response.documents.len(), expected, "format {format}");
        assert!(response.documents.iter().all(|d| d.extension.eq_ignore_ascii_case(format)));
    }
    let again = crate::automation::import_paths(t.path(), &[input.path()]);
    assert_eq!(again.iter().filter(|r| r.status == "duplicate").count(), 3);
    assert_eq!(again.iter().filter(|r| r.status == "imported").count(), 0);
    assert_eq!(fs::read_to_string(input.path().join("one.txt")).unwrap(), "testo uno");
    let self_import = crate::automation::import_paths(t.path(), &[t.path()]);
    assert_eq!(self_import.len(), 1);
    assert_eq!(self_import[0].status, "error");
    let empty = tempfile::tempdir().unwrap();
    let empty_receipts = crate::automation::import_paths(t.path(), &[empty.path()]);
    assert_eq!(empty_receipts.len(), 1);
    assert!(empty_receipts[0].error.as_deref().unwrap().contains("Nessun file importabile"));
}
