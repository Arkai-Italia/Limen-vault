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
