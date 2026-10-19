use cap_std::{
    ambient_authority,
    fs::{Dir, OpenOptions},
};
#[cfg(unix)]
use cap_std::fs::OpenOptionsExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    collections::BTreeMap,
    io::{Read, Write},
    path::Path,
};

pub const REQUIRED_VAULT_FOLDERS: [&str; 15] = [
    "00_SYSTEM",
    "01_CLIENTS",
    "02_PROJECTS",
    "03_BRANDS",
    "04_POSITIONING",
    "05_PACKAGING_KNOWLEDGE",
    "06_METHODS",
    "07_CASE_STUDIES",
    "08_MARKET_RESEARCH",
    "09_COMPETITORS",
    "10_APPROVED_OUTPUTS",
    "20_RAW_SOURCES",
    "80_AI_OUTPUTS",
    "90_PROPOSALS",
    "99_ARCHIVE",
];
#[derive(Serialize, Deserialize, Debug, Clone, Default)]
pub struct ValidationResultResponse {
    pub is_valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub checked_folders_count: usize,
    pub checked_files_count: usize,
    pub system_files_valid: bool,
    #[serde(skip)]
    pub manifest: Option<Value>,
    pub page_count: usize,
    pub source_count: usize,
    pub proposal_count: usize,
    pub state: String,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct VaultStatusResponse {
    pub state: String,
    pub path: Option<String>,
    pub name: Option<String>,
    pub page_count: usize,
    pub source_count: usize,
    pub proposal_count: usize,
    pub snapshot_id: Option<String>,
    pub snapshot_age: Option<String>,
    pub integrity_status: String,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct OpenVaultResponse {
    pub status: VaultStatusResponse,
    pub validation: ValidationResultResponse,
}

fn string(v: &Value, key: &str) -> bool {
    v.get(key).is_some_and(Value::is_string)
}
fn optional_string(v: &Value, key: &str) -> bool {
    v.get(key).is_none_or(Value::is_string)
}
fn strings(v: &Value, key: &str) -> bool {
    v.get(key)
        .is_none_or(|a| a.as_array().is_some_and(|a| a.iter().all(Value::is_string)))
}
fn integer(v: &Value) -> bool {
    v.as_f64()
        .is_some_and(|n| n.is_finite() && n.fract() == 0.0)
}
fn datetime(v: &Value, key: &str) -> bool {
    v.get(key)
        .and_then(Value::as_str)
        .is_some_and(|s| s.ends_with('Z') && chrono::DateTime::parse_from_rfc3339(s).is_ok())
}
pub fn valid_manifest(v: &Value) -> bool {
    v.is_object()
        && v.get("schema_version")
            .is_some_and(|n| integer(n) && n.as_f64().unwrap_or(0.0) > 0.0)
        && string(v, "vault_id")
        && string(v, "vault_name")
        && datetime(v, "created_at")
        && datetime(v, "updated_at")
        && optional_string(v, "snapshot_id")
        && v.get("files")
            .and_then(Value::as_array)
            .is_some_and(|files| {
                files.iter().all(|f| {
                    string(f, "path")
                        && f.get("sha256")
                            .and_then(Value::as_str)
                            .is_some_and(|s| s.encode_utf16().count() == 64)
                        && f.get("size")
                            .and_then(Value::as_f64)
                            .is_some_and(|n| n.is_finite() && n >= 0.0)
                        && (f.get("updated_at").is_none() || datetime(f, "updated_at"))
                })
            })
}
pub fn valid_frontmatter(v: &Value) -> bool {
    const TYPES: [&str; 13] = [
        "client",
        "project",
        "brand",
        "positioning",
        "packaging",
        "method",
        "case_study",
        "research",
        "competitor",
        "approved_output",
        "raw_source",
        "ai_output",
        "proposal",
    ];
    v.is_object()
        && ["id", "title", "created_at", "updated_at"]
            .iter()
            .all(|k| string(v, k))
        && v.get("schema_version").is_none_or(integer)
        && v.get("type")
            .and_then(Value::as_str)
            .is_some_and(|t| TYPES.contains(&t))
        && v.get("status").is_none_or(|s| {
            s.as_str()
                .is_some_and(|s| ["draft", "review", "approved", "archived"].contains(&s))
        })
        && ["client", "project", "brand", "snapshot_id"]
            .iter()
            .all(|k| optional_string(v, k))
        && strings(v, "tags")
        && strings(v, "source_ids")
}
pub fn frontmatter(content: &str) -> Result<Option<Value>, String> {
    frontmatter_with_validation(content, true)
}
pub fn frontmatter_unvalidated(content: &str) -> Result<Option<Value>, String> {
    frontmatter_with_validation(content, false)
}
pub fn frontmatter_with_validation(content: &str, validate_schema: bool) -> Result<Option<Value>, String> {
    let normalized = content.replace("\r\n", "\n");
    if !normalized.starts_with("---\n") && normalized != "---" {
        return Ok(None);
    }
    let rest = normalized
        .strip_prefix("---\n")
        .ok_or("Invalid YAML syntax: Unclosed YAML frontmatter")?;
    let end = rest
        .match_indices("\n---")
        .find(|(i, _)| {
            rest.get(i + 4..)
                .is_some_and(|s| s.is_empty() || s.starts_with('\n'))
        })
        .map(|(i, _)| i)
        .ok_or("Invalid YAML syntax: Unclosed YAML frontmatter")?;
    let value: Value =
        serde_yaml::from_str(&rest[..end]).map_err(|e| format!("Invalid YAML syntax: {e}"))?;
    if !value.is_object() {
        return Err("Invalid YAML syntax: frontmatter must be a mapping".into());
    }
    if validate_schema && !valid_frontmatter(&value) {
        return Err("Invalid frontmatter schema".into());
    }
    Ok(Some(value))
}
fn readable_file(root: &Dir, relative: &Path) -> Result<String, String> {
    let meta = root.symlink_metadata(relative).map_err(|e| e.to_string())?;
    if meta.file_type().is_symlink() || !meta.is_file() {
        return Err("Not a regular file (symlinks are not allowed)".into());
    }
    // cap-std resolves all components relative to the opened capability, including during races.
    let mut opts = OpenOptions::new();
    opts.read(true);
    #[cfg(unix)]
    opts.custom_flags(libc::O_NOFOLLOW | libc::O_NONBLOCK);
    let mut file = root
        .open_with(relative, &opts)
        .map_err(|e| e.to_string())?;
    if !file.metadata().map_err(|e| e.to_string())?.is_file() {
        return Err("Not a regular file".into());
    }
    let mut text = String::new();
    file.read_to_string(&mut text).map_err(|e| e.to_string())?;
    Ok(text)
}
fn walk(
    root: &Dir,
    rel: &Path,
    depth: usize,
    result: &mut ValidationResultResponse,
    system: &mut BTreeMap<String, String>,
    originals: &std::collections::BTreeSet<String>,
) -> Result<(), String> {
    if depth > 64 {
        return Err("Directory depth exceeds 64".into());
    }
    let mut names = root
        .read_dir(rel)
        .map_err(|e| e.to_string())?
        .map(|e| e.map(|e| e.file_name()))
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    names.sort();
    for name in names {
        let child_path = rel.join(&name);
        let raw_label = child_path.to_string_lossy().replace('\\', "/");
        let label = raw_label
            .trim_start_matches("./")
            .trim_start_matches('/')
            .to_string();
        let operation = (|| -> Result<(), String> {
            let meta = root.symlink_metadata(&child_path).map_err(|e| e.to_string())?;
            if meta.file_type().is_symlink() {
                return Err("Symlinks inside the Vault are not allowed".into());
            }
            if meta.is_dir() {
                if label != "00_SYSTEM/SNAPSHOTS"
                    && !name.to_string_lossy().starts_with('.')
                    && name != "node_modules"
                {
                    walk(root, &child_path, depth + 1, result, system, originals)?;
                }
            } else if meta.is_file() {
                let mut opts = OpenOptions::new();
                opts.read(true);
                #[cfg(unix)]
                opts.custom_flags(libc::O_NOFOLLOW | libc::O_NONBLOCK);
                let mut opened = root
                    .open_with(&child_path, &opts)
                    .map_err(|e| e.to_string())?;
                if !opened.metadata().map_err(|e| e.to_string())?.is_file() {
                    return Err("Not a regular file".into());
                }
                result.checked_files_count += 1;
                if label.ends_with(".md") || label == "00_SYSTEM/VAULT_MANIFEST.json" {
                    let mut content = String::new();
                    opened
                        .read_to_string(&mut content)
                        .map_err(|e| e.to_string())?;
                    if label.starts_with("00_SYSTEM/") {
                        system.insert(label.clone(), content.clone());
                    }
                    if label.ends_with(".md") {
                        result.page_count += 1;
                        if label.starts_with("20_RAW_SOURCES/") || originals.contains(&label) {
                            result.source_count += 1;
                            let _ = frontmatter_unvalidated(&content);
                        } else {
                            if label.starts_with("90_PROPOSALS/") {
                                result.proposal_count += 1;
                            }
                            if frontmatter(&content)?.is_none() && !label.starts_with("00_SYSTEM/") {
                                result
                                    .warnings
                                    .push(format!("Markdown file missing YAML frontmatter: {label}"));
                            }
                        }
                    }
                }
            } else {
                return Err("Not a regular file or directory".into());
            }
            Ok(())
        })();
        if let Err(e) = operation {
            result.errors.push(format!("{label}: {e}"));
        }
    }
    Ok(())
}
pub fn perform_vault_validation(path: &Path) -> ValidationResultResponse {
    let mut result = ValidationResultResponse::default();
    if path.as_os_str().is_empty() {
        result.state = "NO_VAULT".into();
        result.errors.push("No vault path specified".into());
        return result;
    }
    let root = match Dir::open_ambient_dir(path, ambient_authority()) {
        Ok(root) => root,
        Err(e) => {
            result.state = "NOT_ACCESSIBLE".into();
            result.errors.push(format!(
                "Vault path does not exist or is not accessible: {e}"
            ));
            return result;
        }
    };
    if let Err(e) = root.entries() {
        result.state = "NOT_ACCESSIBLE".into();
        result.errors.push(e.to_string());
        return result;
    }
    validate_dir(&root)
}
fn validate_dir(root: &Dir) -> ValidationResultResponse {
    let mut result = ValidationResultResponse::default();
    let mut missing = false;
    let mut invalid = false;
    for folder in REQUIRED_VAULT_FOLDERS {
        match root.symlink_metadata(folder) {
            Ok(meta) if meta.is_dir() && !meta.file_type().is_symlink() => {
                match root.read_dir(folder) {
                    Ok(_) => result.checked_folders_count += 1,
                    Err(e) => {
                        invalid = true;
                        result.errors.push(format!("{folder}: {e}"));
                    }
                }
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                missing = true;
                result
                    .errors
                    .push(format!("Missing required vault folder: {folder}"));
            }
            _ => {
                invalid = true;
                result
                    .errors
                    .push(format!("Invalid required vault folder: {folder}"));
            }
        }
    }
    let mut system = BTreeMap::new();
    let previous = result.errors.len();
    let originals = crate::snapshots::read_path(root, "00_SYSTEM/VAULT_CATALOG.json").ok()
        .and_then(|bytes| serde_json::from_slice::<crate::catalog::CatalogState>(&bytes).ok())
        .map(|c| c.documents.into_values().filter(crate::catalog::is_original).map(|d| d.original_path).collect()).unwrap_or_default();
    if let Err(e) = walk(root, Path::new("."), 0, &mut result, &mut system, &originals) {
        result.errors.push(e);
    }
    if result.errors.len() > previous {
        invalid = true;
    }
    for file in ["HOME.md", "VAULT_RULES.md", "VAULT_MANIFEST.json"] {
        if !system.contains_key(&format!("00_SYSTEM/{file}")) {
            missing = true;
            result.errors.push(format!(
                "Required system path is missing, unreadable or not a regular file: {file}"
            ));
        }
    }
    if let Some(raw) = system.get("00_SYSTEM/VAULT_MANIFEST.json") {
        match serde_json::from_str::<Value>(raw) {
            Ok(manifest) if valid_manifest(&manifest) => result.manifest = Some(manifest),
            _ => {
                invalid = true;
                result.errors.push("Invalid manifest".into());
            }
        }
    }
    result.system_files_valid = result.manifest.is_some()
        && system.contains_key("00_SYSTEM/HOME.md")
        && system.contains_key("00_SYSTEM/VAULT_RULES.md");
    result.is_valid = result.errors.is_empty();
    result.state = if result.is_valid {
        "READY"
    } else if invalid {
        "INVALID"
    } else if missing {
        "INCOMPLETE"
    } else {
        "INVALID"
    }
    .into();
    if !result.is_valid {
        result.manifest = None;
    }
    result
}
pub fn response(path: &Path, validation: ValidationResultResponse) -> OpenVaultResponse {
    let manifest = validation.manifest.as_ref();
    let name = manifest
        .and_then(|v| v.get("vault_name"))
        .and_then(Value::as_str)
        .map(String::from)
        .or_else(|| path.file_name().map(|s| s.to_string_lossy().into()));
    let status = VaultStatusResponse {
        state: validation.state.clone(),
        path: if path.as_os_str().is_empty() {
            None
        } else {
            Some(path.to_string_lossy().into())
        },
        name,
        page_count: validation.page_count,
        source_count: validation.source_count,
        proposal_count: validation.proposal_count,
        snapshot_id: manifest
            .and_then(|v| v.get("snapshot_id"))
            .and_then(Value::as_str)
            .map(String::from),
        snapshot_age: None,
        integrity_status: "unverified".into(),
    };
    OpenVaultResponse { status, validation }
}
pub fn open(path: &Path) -> OpenVaultResponse {
    response(path, perform_vault_validation(path))
}

pub fn create(
    target: &Path,
    name: Option<String>,
    template_path: &Path,
) -> Result<VaultStatusResponse, String> {
    if !target.is_absolute()
        || target.file_name().is_none()
        || target
            .components()
            .any(|c| matches!(c, std::path::Component::ParentDir))
    {
        return Err("INVALID_ARGUMENT: absolute Vault path required, without traversal".into());
    }
    let template = Dir::open_ambient_dir(template_path, ambient_authority())
        .map_err(|e| format!("TEMPLATE_UNAVAILABLE: {e}"))?;
    let mut files = BTreeMap::new();
    for file in ["HOME.md", "VAULT_RULES.md", "VAULT_MANIFEST.json"] {
        let content = readable_file(&template, Path::new(&format!("00_SYSTEM/{file}")))?;
        let content = if file.ends_with(".md") { content.replace("\r\n", "\n") } else { content };
        files.insert(file, content);
    }
    let mut manifest: Value =
        serde_json::from_str(&files["VAULT_MANIFEST.json"]).map_err(|e| e.to_string())?;
    if !valid_manifest(&manifest) {
        return Err("Invalid template manifest".into());
    }
    for file in ["HOME.md", "VAULT_RULES.md"] {
        frontmatter(&files[file])?;
    }
    manifest["vault_name"] = Value::String(
        name.filter(|s| !s.trim().is_empty())
            .unwrap_or_else(|| target.file_name().unwrap().to_string_lossy().into()),
    );
    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true);
    manifest["created_at"] = Value::String(now.clone());
    manifest["updated_at"] = Value::String(now);
    files.insert(
        "VAULT_MANIFEST.json",
        serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())?,
    );
    // Canonicalize the existing ancestor once (macOS /var -> /private/var is legitimate).
    // All new descendants are then created relative to the opened directory capability.
    let mut ancestor = target.to_path_buf();
    let mut missing = Vec::new();
    while !ancestor.exists() {
        missing.push(
            ancestor
                .file_name()
                .ok_or("Invalid ancestor")?
                .to_os_string(),
        );
        ancestor = ancestor.parent().ok_or("Invalid ancestor")?.to_path_buf();
    }
    let mut root =
        Dir::open_ambient_dir(&ancestor, ambient_authority()).map_err(|e| e.to_string())?;
    for component in missing.into_iter().rev() {
        root.create_dir(&component).map_err(|e| e.to_string())?;
        root = root.open_dir(&component).map_err(|e| e.to_string())?;
    }
    if root.entries().map_err(|e| e.to_string())?.next().is_some() {
        return Err("ALREADY_EXISTS: target directory is not empty".into());
    }
    // Exclusive directory claim; a second creator cannot proceed past 00_SYSTEM.
    for folder in REQUIRED_VAULT_FOLDERS {
        root.create_dir(folder)
            .map_err(|e| format!("CREATE_FAILED: {folder}: {e}"))?;
    }
    let system = root.open_dir("00_SYSTEM").map_err(|e| e.to_string())?;
    for (file, content) in files {
        let mut options = OpenOptions::new();
        options.write(true).create_new(true);
        let mut output = system
            .open_with(file, &options)
            .map_err(|e| e.to_string())?;
        output
            .write_all(content.as_bytes())
            .map_err(|e| e.to_string())?;
        output.sync_all().map_err(|e| e.to_string())?;
    }
    // Preserve partial files on failure; never delete concurrent or pre-existing data.
    let validation = validate_dir(&root);
    if !validation.is_valid {
        return Err(format!(
            "VALIDATION_FAILED: {}",
            validation.errors.join("; ")
        ));
    }
    Ok(response(target, validation).status)
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VaultFolderReport {
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub path: String,
    pub exists: bool,
    #[serde(alias = "file_count")]
    pub file_count: usize,
    #[serde(default)]
    #[serde(alias = "is_standard")]
    pub is_standard: bool,
    pub error: Option<String>,
}

impl Serialize for VaultFolderReport {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(Some(9))?;
        map.serialize_entry("id", &self.id)?;
        map.serialize_entry("name", if self.name.is_empty() { &self.id } else { &self.name })?;
        map.serialize_entry("path", if self.path.is_empty() { &self.id } else { &self.path })?;
        map.serialize_entry("exists", &self.exists)?;
        map.serialize_entry("file_count", &self.file_count)?;
        map.serialize_entry("fileCount", &self.file_count)?;
        map.serialize_entry("is_standard", &self.is_standard)?;
        map.serialize_entry("isStandard", &self.is_standard)?;
        map.serialize_entry("error", &self.error)?;
        map.end()
    }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VaultFileEntry {
    pub name: String,
    #[serde(alias = "relativePath")]
    pub relative_path: String,
    #[serde(alias = "isDir")]
    pub is_dir: bool,
    #[serde(alias = "sizeBytes")]
    pub size_bytes: u64,
    #[serde(alias = "modifiedEpochMs", alias = "modifiedMs", alias = "modified_ms")]
    pub modified_epoch_ms: u64,
    pub extension: String,
}

impl Serialize for VaultFileEntry {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(Some(12))?;
        map.serialize_entry("name", &self.name)?;
        map.serialize_entry("relative_path", &self.relative_path)?;
        map.serialize_entry("relativePath", &self.relative_path)?;
        map.serialize_entry("is_dir", &self.is_dir)?;
        map.serialize_entry("isDir", &self.is_dir)?;
        map.serialize_entry("size_bytes", &self.size_bytes)?;
        map.serialize_entry("sizeBytes", &self.size_bytes)?;
        map.serialize_entry("modified_epoch_ms", &self.modified_epoch_ms)?;
        map.serialize_entry("modifiedEpochMs", &self.modified_epoch_ms)?;
        map.serialize_entry("modified_ms", &self.modified_epoch_ms)?;
        map.serialize_entry("modifiedMs", &self.modified_epoch_ms)?;
        map.serialize_entry("extension", &self.extension)?;
        map.end()
    }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VaultFolderFilesReport {
    pub folder: String,
    pub exists: bool,
    pub files: Vec<VaultFileEntry>,
    pub error: Option<String>,
}

impl Serialize for VaultFolderFilesReport {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeMap;
        let mut map = serializer.serialize_map(Some(4))?;
        map.serialize_entry("folder", &self.folder)?;
        map.serialize_entry("exists", &self.exists)?;
        map.serialize_entry("files", &self.files)?;
        map.serialize_entry("error", &self.error)?;
        map.end()
    }
}

pub fn count_vault_files_recursive(dir: &Path) -> usize {
    let mut count = 0;
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let n = entry.file_name().to_string_lossy().to_string();
            if n.starts_with('.') || n == "node_modules" {
                continue;
            }
            if let Ok(ft) = entry.file_type() {
                if ft.is_dir() {
                    count += count_vault_files_recursive(&entry.path());
                } else if ft.is_file() {
                    count += 1;
                }
            }
        }
    }
    count
}

pub fn list_vault_folders(vault_path: &Path) -> Result<Vec<VaultFolderReport>, String> {
    if !vault_path.exists() {
        return Err("La cartella del vault non esiste".into());
    }
    let canonical_vault = match vault_path.canonicalize() {
        Ok(p) => p,
        Err(e) => return Err(format!("La cartella del vault non è valida: {}", e)),
    };
    let mut reports = Vec::new();

    // 1. Scansione di tutte le 15 cartelle standard (inclusi 00_SYSTEM e 99_ARCHIVE)
    for &folder_name in &REQUIRED_VAULT_FOLDERS {
        let folder_path = vault_path.join(folder_name);
        if !folder_path.exists() {
            reports.push(VaultFolderReport {
                id: folder_name.to_string(),
                name: folder_name.to_string(),
                path: folder_name.to_string(),
                exists: false,
                file_count: 0,
                is_standard: true,
                error: None,
            });
        } else if let Ok(canonical_f) = folder_path.canonicalize() {
            if !canonical_f.starts_with(&canonical_vault) {
                reports.push(VaultFolderReport {
                    id: folder_name.to_string(),
                    name: folder_name.to_string(),
                    path: folder_name.to_string(),
                    exists: false,
                    file_count: 0,
                    is_standard: true,
                    error: Some("Collegamento esterno non consentito".into()),
                });
            } else if !canonical_f.is_dir() {
                reports.push(VaultFolderReport {
                    id: folder_name.to_string(),
                    name: folder_name.to_string(),
                    path: folder_name.to_string(),
                    exists: false,
                    file_count: 0,
                    is_standard: true,
                    error: Some("Il percorso non è una cartella".into()),
                });
            } else {
                let count = count_vault_files_recursive(&canonical_f);
                reports.push(VaultFolderReport {
                    id: folder_name.to_string(),
                    name: folder_name.to_string(),
                    path: folder_name.to_string(),
                    exists: true,
                    file_count: count,
                    is_standard: true,
                    error: None,
                });
            }
        } else {
            reports.push(VaultFolderReport {
                id: folder_name.to_string(),
                name: folder_name.to_string(),
                path: folder_name.to_string(),
                exists: false,
                file_count: 0,
                is_standard: true,
                error: Some("Percorso non accessibile".into()),
            });
        }
    }

    // 2. Rilevamento dinamico cartelle personalizzate nella radice del vault
    if let Ok(entries) = std::fs::read_dir(&canonical_vault) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with('.') || REQUIRED_VAULT_FOLDERS.contains(&name.as_str()) {
                continue;
            }
            if let Ok(meta) = entry.metadata() {
                if meta.is_dir() {
                    if let Ok(canonical_f) = entry.path().canonicalize() {
                        if canonical_f.starts_with(&canonical_vault) {
                            let count = count_vault_files_recursive(&canonical_f);
                            reports.push(VaultFolderReport {
                                id: name.clone(),
                                name: name.clone(),
                                path: name,
                                exists: true,
                                file_count: count,
                                is_standard: false,
                                error: None,
                            });
                        }
                    }
                }
            }
        }
    }

    Ok(reports)
}

pub fn list_vault_folder_files(vault_path: &Path, folder: &str) -> Result<VaultFolderFilesReport, String> {
    if folder.contains("..") || folder.starts_with('/') || folder.starts_with('\\') {
        return Err("Percorso cartella non valido o non autorizzato".into());
    }
    let canonical_vault = match vault_path.canonicalize() {
        Ok(p) => p,
        Err(e) => return Err(format!("Vault non accessibile: {}", e)),
    };
    let folder_path = vault_path.join(folder);
    if !folder_path.exists() {
        return Ok(VaultFolderFilesReport {
            folder: folder.to_string(),
            exists: false,
            files: Vec::new(),
            error: None,
        });
    }
    let canonical_folder = match folder_path.canonicalize() {
        Ok(p) => p,
        Err(e) => {
            return Ok(VaultFolderFilesReport {
                folder: folder.to_string(),
                exists: true,
                files: Vec::new(),
                error: Some(format!("Errore risoluzione percorso: {}", e)),
            });
        }
    };
    if !canonical_folder.starts_with(&canonical_vault) {
        return Err("Accesso negato: il percorso punta all'esterno del vault".into());
    }
    if !canonical_folder.is_dir() {
        return Ok(VaultFolderFilesReport {
            folder: folder.to_string(),
            exists: false,
            files: Vec::new(),
            error: Some("Il percorso non è una cartella".into()),
        });
    }

    let entries = match std::fs::read_dir(&canonical_folder) {
        Ok(e) => e,
        Err(e) => {
            return Ok(VaultFolderFilesReport {
                folder: folder.to_string(),
                exists: true,
                files: Vec::new(),
                error: Some(format!("Errore di accesso al disco: {}", e)),
            });
        }
    };

    let mut files = Vec::new();
    for entry in entries.flatten() {
        let file_name = entry.file_name().to_string_lossy().to_string();
        if file_name.starts_with('.') {
            continue;
        }
        let entry_path = entry.path();
        // Verifica contenimento: ogni singolo elemento o symlink deve risiedere all'interno del vault
        let canonical_entry = match entry_path.canonicalize() {
            Ok(p) => p,
            Err(_) => continue, // symlink rotto o inaccessibile
        };
        if !canonical_entry.starts_with(&canonical_vault) {
            // Symlink esterno: ignorato per garantire l'isolamento del vault
            continue;
        }

        let meta = entry.metadata().ok();
        let is_dir = meta.as_ref().map(|m| m.is_dir()).unwrap_or(false);
        let size_bytes = meta.as_ref().map(|m| m.len()).unwrap_or(0);
        let modified_epoch_ms = meta
            .and_then(|m| m.modified().ok())
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0);
        let extension = if is_dir {
            String::new()
        } else {
            Path::new(&file_name)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("")
                .to_lowercase()
        };
        let rel_path = if folder.is_empty() {
            file_name.clone()
        } else {
            format!("{}/{}", folder.trim_end_matches('/'), file_name)
        };

        files.push(VaultFileEntry {
            name: file_name,
            relative_path: rel_path,
            is_dir,
            size_bytes,
            modified_epoch_ms,
            extension,
        });
    }

    files.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    Ok(VaultFolderFilesReport {
        folder: folder.to_string(),
        exists: true,
        files,
        error: None,
    })
}

pub fn read_vault_text(vault_path: &Path, relative_path: &str) -> Result<String, String> {
    if relative_path.split('/').any(|c| c.is_empty() || c == "." || c == ".." || c.contains(['\\', '\0'])) { return Err("Percorso non valido".into()); }
    let root = crate::snapshots::root(vault_path)?;
    let mut options = OpenOptions::new();
    options.read(true);
    #[cfg(unix)] { use std::os::unix::fs::OpenOptionsExt; options.custom_flags(libc::O_NOFOLLOW | libc::O_NONBLOCK); }
    let file = root.open_with(relative_path, &options).map_err(|e| e.to_string())?;
    if !file.metadata().map_err(|e| e.to_string())?.is_file() { return Err("Seleziona un file".into()); }
    let mut bytes = Vec::new();
    file.take(1_048_576).read_to_end(&mut bytes).map_err(|e| e.to_string())?;
    String::from_utf8(bytes.clone()).or_else(|_| Ok(String::from_utf8_lossy(&bytes).to_string()))
}

pub fn reveal_vault_path(vault_path: &Path, target: &str) -> Result<(), String> {
    if target.is_empty() {
        return Err("Percorso da aprire non specificato".into());
    }

    let canonical_vault = vault_path.canonicalize().map_err(|e| format!("Vault non accessibile: {}", e))?;

    // 1. Prova prima se il target corrisponde a un document_id nel catalogo
    let path_to_reveal = if let Ok(doc) = crate::catalog::get_document(vault_path, target) {
        canonical_vault.join(&doc.original_path)
    } else {
        // 2. Altrimenti tratta il target come percorso relativo
        if target.contains("..") {
            return Err("Percorso non valido".into());
        }
        canonical_vault.join(target)
    };

    let canonical_target = path_to_reveal.canonicalize().map_err(|e| format!("File non trovato sul disco: {}", e))?;

    if !canonical_target.starts_with(&canonical_vault) {
        return Err("Accesso negato: il file si trova al di fuori del vault".into());
    }

    #[cfg(target_os = "macos")]
    {
        let status = std::process::Command::new("/usr/bin/open")
            .arg("-R")
            .arg(&canonical_target)
            .status()
            .map_err(|e| format!("Impossibile aprire il Finder: {}", e))?;
        if !status.success() {
            return Err("Comando Finder fallito".into());
        }
    }

    #[cfg(target_os = "windows")]
    {
        let status = std::process::Command::new("explorer")
            .arg(format!("/select,\"{}\"", canonical_target.display()))
            .status()
            .map_err(|e| format!("Impossibile aprire Esplora File: {}", e))?;
        if !status.success() {
            return Err("Comando Esplora File fallito".into());
        }
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = canonical_target;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    #[test]
    fn shared_frontmatter_fixtures() {
        let fixtures: Value = serde_json::from_str(include_str!(
            "../../../../tests/fixtures/m2/frontmatter.json"
        ))
        .unwrap();
        for fixture in fixtures.as_array().unwrap() {
            let ok = frontmatter(fixture["content"].as_str().unwrap()).is_ok();
            assert_eq!(ok, fixture["state"] == "READY", "{}", fixture["name"]);
        }
    }
    #[test]
    fn manifest_is_consumed_without_reopening() {
        let t = tempfile::tempdir().unwrap();
        let p = t.path().join("vault");
        create(
            &p,
            Some("Original".into()),
            &PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template"),
        )
        .unwrap();
        let validation = perform_vault_validation(&p);
        std::fs::write(p.join("00_SYSTEM/VAULT_MANIFEST.json"), "{}").unwrap();
        assert_eq!(
            response(&p, validation).status.name.as_deref(),
            Some("Original")
        );
        assert_eq!(open(&p).status.state, "INVALID");
    }
    #[test]
    fn exclusive_creation_preserves_existing_bytes() {
        let t = tempfile::tempdir().unwrap();
        let p = t.path().join("vault");
        let template = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
        create(&p, None, &template).unwrap();
        let before = std::fs::read(p.join("00_SYSTEM/VAULT_MANIFEST.json")).unwrap();
        assert!(create(&p, None, &template).is_err());
        assert_eq!(
            before,
            std::fs::read(p.join("00_SYSTEM/VAULT_MANIFEST.json")).unwrap()
        );
    }
    #[test]
    fn concurrent_creation_has_one_winner() {
        let temp = tempfile::tempdir().unwrap();
        let target = temp.path().join("vault");
        std::fs::create_dir(&target).unwrap();
        let template = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
        let barrier = std::sync::Arc::new(std::sync::Barrier::new(2));
        let handles: Vec<_> = (0..2)
            .map(|_| {
                let p = target.clone();
                let t = template.clone();
                let b = barrier.clone();
                std::thread::spawn(move || {
                    b.wait();
                    create(&p, None, &t).is_ok()
                })
            })
            .collect();
        let wins = handles
            .into_iter()
            .map(|h| usize::from(h.join().unwrap()))
            .sum::<usize>();
        assert_eq!(wins, 1);
        assert_eq!(open(&target).status.state, "READY");
    }
    #[test]
    fn capability_blocks_external_symlinks_and_broken_links() {
        let t = tempfile::tempdir().unwrap();
        let p = t.path().join("vault");
        let template = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
        create(&p, None, &template).unwrap();
        std::fs::write(t.path().join("outside"), "external data must never be read").unwrap();
        #[cfg(unix)]
        {
            std::os::unix::fs::symlink(t.path(), p.join("01_CLIENTS/link")).unwrap();
            assert_eq!(open(&p).status.state, "INVALID");
            let dir = Dir::open_ambient_dir(&p, ambient_authority()).unwrap();
            assert!(dir.read("01_CLIENTS/link/outside").is_err());
        }
    }
    #[cfg(windows)]
    #[test]
    fn capability_blocks_external_junctions() {
        let t = tempfile::tempdir().unwrap();
        let p = t.path().join("vault");
        let template = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
        create(&p, None, &template).unwrap();
        let outside = t.path().join("outside_dir");
        std::fs::create_dir(&outside).unwrap();
        std::fs::write(outside.join("data.txt"), "external data").unwrap();
        let target_link = p.join("01_CLIENTS/jlink");
        let status = std::process::Command::new("cmd")
            .args(["/c", "mklink", "/J", target_link.to_str().unwrap(), outside.to_str().unwrap()])
            .output();
        if let Ok(out) = status {
            if out.status.success() {
                assert_eq!(open(&p).status.state, "INVALID");
                let dir = Dir::open_ambient_dir(&p, ambient_authority()).unwrap();
                assert!(dir.read("01_CLIENTS/jlink/data.txt").is_err());
            }
        }
    }
    #[test]
    fn raw_sources_foreign_yaml_frontmatter_allows_vault_opening() {
        let t = tempfile::tempdir().unwrap();
        let p = t.path().join("vault");
        let template = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
        create(&p, None, &template).unwrap();

        let foreign_yaml = "---\nforeign_key: 123\ncustom_meta: test\n---\nRaw imported document body\n";
        std::fs::write(p.join("20_RAW_SOURCES/raw_doc.md"), foreign_yaml).unwrap();

        let res = open(&p);
        assert_eq!(res.status.state, "READY", "Vault with foreign YAML frontmatter in 20_RAW_SOURCES must be READY");

        std::fs::write(p.join("01_CLIENTS/bad_doc.md"), foreign_yaml).unwrap();
        let res_outside = open(&p);
        assert_eq!(res_outside.status.state, "INVALID", "Vault with foreign YAML frontmatter in 01_CLIENTS must be INVALID");
    }

    #[test]
    fn test_vault_explorer_list_folders_and_files() {
        let t = tempfile::tempdir().unwrap();
        let p = t.path().join("vault");
        let template = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
        create(&p, None, &template).unwrap();

        // Popola con file di vario tipo (Markdown, PDF, XLSX), cartella custom e sottocartelle
        std::fs::write(p.join("20_RAW_SOURCES/documento.pdf"), b"%PDF-1.4 dummy pdf bytes").unwrap();
        std::fs::write(p.join("20_RAW_SOURCES/tabella.xlsx"), b"dummy excel bytes").unwrap();
        std::fs::write(p.join("80_AI_OUTPUTS/sintesi.md"), "# Sintesi AI").unwrap();
        std::fs::write(p.join("90_PROPOSALS/bozza.md"), "# Bozza").unwrap();
        std::fs::create_dir(p.join("NOTE_PERSONALIZZATE")).unwrap();
        std::fs::write(p.join("NOTE_PERSONALIZZATE/extra.txt"), b"nota extra").unwrap();

        // 1. Test elenco cartelle standard + custom
        let folders = list_vault_folders(&p).unwrap();
        assert!(folders.iter().any(|f| f.id == "20_RAW_SOURCES" && f.exists && f.file_count >= 2));
        assert!(folders.iter().any(|f| f.id == "80_AI_OUTPUTS" && f.exists && f.file_count >= 1));
        assert!(folders.iter().any(|f| f.id == "90_PROPOSALS" && f.exists && f.file_count >= 1));
        assert!(folders.iter().any(|f| f.id == "01_CLIENTS" && f.exists));
        assert!(folders.iter().any(|f| f.id == "00_SYSTEM" && f.exists && f.is_standard));
        assert!(folders.iter().any(|f| f.id == "99_ARCHIVE" && f.exists && f.is_standard));
        assert!(folders.iter().any(|f| f.id == "NOTE_PERSONALIZZATE" && f.exists && !f.is_standard && f.file_count == 1));

        // 2. Test serializzazione duale (camelCase e snake_case)
        let serialized_folders = serde_json::to_string(&folders).unwrap();
        assert!(serialized_folders.contains("\"fileCount\":"));
        assert!(serialized_folders.contains("\"file_count\":"));
        assert!(serialized_folders.contains("\"isStandard\":"));
        assert!(serialized_folders.contains("\"is_standard\":"));

        // 3. Test elenco file cartella reale
        let rep_raw = list_vault_folder_files(&p, "20_RAW_SOURCES").unwrap();
        assert!(rep_raw.exists);
        assert!(rep_raw.error.is_none());
        assert!(rep_raw.files.iter().any(|f| f.name == "documento.pdf" && f.extension == "pdf" && !f.is_dir && f.size_bytes > 0));
        assert!(rep_raw.files.iter().any(|f| f.name == "tabella.xlsx" && f.extension == "xlsx" && !f.is_dir && f.size_bytes > 0));

        let serialized_files = serde_json::to_string(&rep_raw).unwrap();
        assert!(serialized_files.contains("\"relativePath\":"));
        assert!(serialized_files.contains("\"relative_path\":"));
        assert!(serialized_files.contains("\"isDir\":"));
        assert!(serialized_files.contains("\"is_dir\":"));
        assert!(serialized_files.contains("\"sizeBytes\":"));
        assert!(serialized_files.contains("\"size_bytes\":"));
        assert!(serialized_files.contains("\"modifiedMs\":"));
        assert!(serialized_files.contains("\"modifiedEpochMs\":"));

        // 4. Test cartella inesistente
        let rep_missing = list_vault_folder_files(&p, "non_existent_folder").unwrap();
        assert!(!rep_missing.exists);
        assert_eq!(rep_missing.files.len(), 0);

        // 5. Test protezione path traversal e symlink esterni
        assert!(list_vault_folder_files(&p, "../outside").is_err());
        assert!(reveal_vault_path(&p, "../outside").is_err());

        #[cfg(unix)]
        {
            let outside_file = t.path().join("segreto.txt");
            std::fs::write(&outside_file, "segreto esterno").unwrap();
            std::os::unix::fs::symlink(&outside_file, p.join("20_RAW_SOURCES/link_segreto.txt")).unwrap();

            let rep_sym = list_vault_folder_files(&p, "20_RAW_SOURCES").unwrap();
            assert!(!rep_sym.files.iter().any(|f| f.name == "link_segreto.txt"), "I symlink a file esterni devono essere ignorati/bloccati dall'esploratore");
        }
    }
}
