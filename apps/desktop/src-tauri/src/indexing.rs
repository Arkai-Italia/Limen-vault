//! Read-only completion evidence shared by the UI and regression tests.
use std::path::Path;
use serde::Serialize;
use crate::{catalog::{self, ExtractionStatus}, embeddings, search};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexingStatus {
    pub pending_documents: usize,
    pub attention_documents: usize,
    pub ready_documents: usize,
    pub unauthorized_documents: usize,
    pub lexical_current: bool,
    pub missing_passages: usize,
    pub coverage: f64,
    pub complete: bool,
}
pub fn status(path: &Path) -> Result<IndexingStatus, String> {
    let catalog = catalog::load_catalog(path)?;
    let index = search::load_index_for_vault(path)?;
    let vectors = embeddings::embeddings_status(path)?;
    let provider = embeddings::get_embeddings_provider(path, 0);
    let compatible = vectors.total_passages == 0 || (vectors.dimensions == provider.dimensions && vectors.model == provider.model);
    let mut pending = 0;
    let mut attention = 0;
    let mut ready = 0;
    let mut unauthorized = 0;
    let mut lexical = index.is_some();
    for doc in catalog.documents.values().filter(|d| catalog::is_original(d) && !catalog::is_support_document(d)) {
        if doc.indexing_authorized_hash.as_deref() != Some(doc.content_hash.as_str()) { unauthorized += 1; }
        match doc.extraction_status {
            ExtractionStatus::Pending | ExtractionStatus::Processing => pending += 1,
            ExtractionStatus::Failed | ExtractionStatus::Protected | ExtractionStatus::Unsupported => attention += 1,
            ExtractionStatus::Ready => {
                ready += 1;
                if !doc.passages.is_empty() {
                    let record = index.as_ref().and_then(|idx| idx.documents.get(&doc.original_path));
                    lexical &= record.is_some_and(|r| r.sha256 == doc.content_hash && r.passages.len() == doc.passages.len() && doc.passages.iter().all(|p| r.passages.iter().any(|q| q.passage_id == p.passage_id && q.sha256 == p.sha256)));
                }
            }
        }
    }
    let missing = if compatible { vectors.missing_passages } else { vectors.total_passages };
    let coverage = if compatible { vectors.coverage } else { 0.0 };
    Ok(IndexingStatus { pending_documents: pending, attention_documents: attention, ready_documents: ready, unauthorized_documents: unauthorized, lexical_current: lexical, missing_passages: missing, coverage, complete: pending == 0 && attention == 0 && unauthorized == 0 && lexical && missing == 0 })
}
