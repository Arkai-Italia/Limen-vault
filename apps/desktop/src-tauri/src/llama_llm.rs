//! Llama LLM server lifecycle and local generative model management for 100% local text generation (Multi-Model Catalog).
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    fs,
    io::{Read, Write},
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

use crate::llama::{check_health, detect_llama_server_binary, find_free_port, get_models_dir};

pub const MINISTRAL_8B_MODEL_FILE_NAME: &str = "Ministral-3-8B-Instruct-2512-Q5_K_M.gguf";
pub const MINISTRAL_8B_MODEL_SIZE_BYTES: u64 = 6_059_268_512;
pub const MINISTRAL_8B_MODEL_SHA256: &str =
    "7a5454127ec772e2389f0e71a77fedb88b83d4366d8a69facd0cfd0898f04d35";
pub const MINISTRAL_8B_DOWNLOAD_URL: &str =
    "https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-GGUF/resolve/main/Ministral-3-8B-Instruct-2512-Q5_K_M.gguf";

pub const MINISTRAL_3B_MODEL_FILE_NAME: &str = "Ministral-3-3B-Instruct-2512-Q5_K_M.gguf";
pub const MINISTRAL_3B_MODEL_SIZE_BYTES: u64 = 2_474_178_720;
pub const MINISTRAL_3B_MODEL_SHA256: &str =
    "e23dd88b0e0951d3f5784d6d4092210cda2b006b251f33b226b283a6c9d1f6bb";
pub const MINISTRAL_3B_DOWNLOAD_URL: &str =
    "https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF/resolve/main/Ministral-3-3B-Instruct-2512-Q5_K_M.gguf";

// Alias per retrocompatibilità
pub const MINISTRAL_MODEL_FILE_NAME: &str = MINISTRAL_8B_MODEL_FILE_NAME;
pub const MINISTRAL_MODEL_SIZE_BYTES: u64 = MINISTRAL_8B_MODEL_SIZE_BYTES;
pub const MINISTRAL_MODEL_SHA256: &str = MINISTRAL_8B_MODEL_SHA256;
pub const MINISTRAL_DOWNLOAD_URL: &str = MINISTRAL_8B_DOWNLOAD_URL;

pub const SIXTEEN_GB_BYTES: u64 = 16 * 1024 * 1024 * 1024;
pub const MINISTRAL_STARTUP_TIMEOUT_SECS: u64 = 90;

/// Definizione statica di un modello nel catalogo locale
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelCatalogDefinition {
    pub id: &'static str,
    pub display_name: &'static str,
    pub file_name: &'static str,
    pub size_bytes: u64,
    pub sha256: &'static str,
    pub download_url: &'static str,
    pub min_ram_gb: u32,
    pub recommended_hardware: &'static str,
    pub description: &'static str,
    pub is_reasoning: bool,
}

pub const MODEL_CATALOG: &[ModelCatalogDefinition] = &[
    ModelCatalogDefinition {
        id: "ministral-3b",
        display_name: "Ministral 3 3B Instruct",
        file_name: MINISTRAL_3B_MODEL_FILE_NAME,
        size_bytes: MINISTRAL_3B_MODEL_SIZE_BYTES,
        sha256: MINISTRAL_3B_MODEL_SHA256,
        download_url: MINISTRAL_3B_DOWNLOAD_URL,
        min_ram_gb: 8,
        recommended_hardware: "Mac 8 GB RAM / Consumi minimi",
        description: "Ultra-compatto e veloce, ottimizzato per Mac con 8 GB di memoria unificata.",
        is_reasoning: false,
    },
    ModelCatalogDefinition {
        id: "ministral-8b",
        display_name: "Ministral 3 8B Instruct",
        file_name: MINISTRAL_8B_MODEL_FILE_NAME,
        size_bytes: MINISTRAL_8B_MODEL_SIZE_BYTES,
        sha256: MINISTRAL_8B_MODEL_SHA256,
        download_url: MINISTRAL_8B_DOWNLOAD_URL,
        min_ram_gb: 16,
        recommended_hardware: "Mac 16 GB+ / GPU 8-12 GB",
        description: "Massima naturalezza espressiva e comprensione del testo in italiano.",
        is_reasoning: false,
    },
    ModelCatalogDefinition {
        id: "qwen-2.5-7b",
        display_name: "Qwen 2.5 7B Instruct",
        file_name: "Qwen2.5-7B-Instruct-Q4_K_M.gguf",
        size_bytes: 4_683_074_240,
        sha256: "65b8fcd92af6b4fefa935c625d1ac27ea29dcb6ee14589c55a8f115ceaaa1423",
        download_url: "https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf",
        min_ram_gb: 16,
        recommended_hardware: "Mac 16 GB+ / GPU 8 GB VRAM",
        description: "Eccezionale per estrazione dati da note, tabelle, sintassi Markdown e risposte strutturate.",
        is_reasoning: false,
    },
    ModelCatalogDefinition {
        id: "llama-3.1-8b",
        display_name: "Llama 3.1 8B Instruct (Meta)",
        file_name: "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
        size_bytes: 4_920_739_232,
        sha256: "7b064f5842bf9532c91456deda288a1b672397a54fa729aa665952863033557c",
        download_url: "https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
        min_ram_gb: 16,
        recommended_hardware: "Mac 16 GB+ / GPU 8 GB VRAM",
        description: "Lo standard globale open-weight: grande fedeltà alle istruzioni di sistema e RAG.",
        is_reasoning: false,
    },
    ModelCatalogDefinition {
        id: "deepseek-r1-7b",
        display_name: "DeepSeek-R1-Distill-Qwen-7B",
        file_name: "DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf",
        size_bytes: 4_683_073_248,
        sha256: "78272d8d32084548bd450394a560eb2d70de8232ab96a725769b1f9171235c1c",
        download_url: "https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-7B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf",
        min_ram_gb: 16,
        recommended_hardware: "Mac 16 GB+ / GPU 8 GB VRAM",
        description: "Modello di ragionamento analitico: formula il pensiero logico (<think>) prima di rispondere.",
        is_reasoning: true,
    },
    ModelCatalogDefinition {
        id: "deepseek-r1-14b",
        display_name: "DeepSeek-R1-Distill-Qwen-14B",
        file_name: "DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf",
        size_bytes: 8_988_109_984,
        sha256: "67a7933cf2ad596a393c8e13b30bc4da2d50b283e250b78554aed18817eca31c",
        download_url: "https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-14B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf",
        min_ram_gb: 24,
        recommended_hardware: "Mac 24-36 GB+ / GPU 12 GB VRAM (es. RTX 3060)",
        description: "Ragionamento avanzato e correlazione profonda di concetti. Richiede GPU 12 GB o Mac 24 GB+.",
        is_reasoning: true,
    },
];

pub fn find_model_def(model_id: &str) -> Option<&'static ModelCatalogDefinition> {
    MODEL_CATALOG
        .iter()
        .find(|m| m.id.eq_ignore_ascii_case(model_id) || m.file_name.eq_ignore_ascii_case(model_id))
}

pub fn get_selected_model_config_path() -> Result<PathBuf, String> {
    let dir = get_models_dir()?;
    Ok(dir.join("selected_local_model.txt"))
}

pub fn get_selected_model_id() -> String {
    if let Ok(cfg_path) = get_selected_model_config_path() {
        if cfg_path.is_file() {
            if let Ok(content) = fs::read_to_string(&cfg_path) {
                let id = content.trim();
                if find_model_def(id).is_some() {
                    return id.to_string();
                }
            }
        }
    }
    // Default in base all'hardware se nessuna selezione salvata
    if is_sub_16gb_system() {
        "ministral-3b".to_string()
    } else {
        "ministral-8b".to_string()
    }
}

pub fn set_selected_model_id(id: &str) -> Result<String, String> {
    let def = find_model_def(id).ok_or_else(|| format!("Modello '{}' non trovato nel catalogo.", id))?;
    let cfg_path = get_selected_model_config_path()?;
    fs::write(&cfg_path, def.id).map_err(|e| format!("Impossibile salvare selezione modello: {}", e))?;
    Ok(def.id.to_string())
}

pub fn get_active_model_def() -> &'static ModelCatalogDefinition {
    let id = get_selected_model_id();
    find_model_def(&id).unwrap_or_else(|| {
        if is_sub_16gb_system() {
            &MODEL_CATALOG[0]
        } else {
            &MODEL_CATALOG[1]
        }
    })
}

pub fn get_active_model_display_name() -> String {
    format!("{} (Locale)", get_active_model_def().display_name)
}

pub fn is_sub_16gb_system() -> bool {
    let ram = get_physical_ram_bytes();
    ram > 0 && ram < SIXTEEN_GB_BYTES
}

pub fn get_active_model_file_name() -> &'static str {
    get_active_model_def().file_name
}

pub fn get_active_model_size_bytes() -> u64 {
    get_active_model_def().size_bytes
}

pub fn get_active_model_sha256() -> &'static str {
    get_active_model_def().sha256
}

pub fn get_active_download_url() -> &'static str {
    get_active_model_def().download_url
}

/// Legge la memoria RAM fisica del sistema in byte (macOS sysctl hw.memsize).
#[cfg(target_os = "macos")]
pub fn get_physical_ram_bytes() -> u64 {
    let mut mib = [libc::CTL_HW, libc::HW_MEMSIZE];
    let mut mem_size: u64 = 0;
    let mut len = std::mem::size_of::<u64>();
    unsafe {
        if libc::sysctl(
            mib.as_mut_ptr(),
            2,
            &mut mem_size as *mut u64 as *mut libc::c_void,
            &mut len,
            std::ptr::null_mut(),
            0,
        ) == 0
        {
            mem_size
        } else {
            0
        }
    }
}

#[cfg(not(target_os = "macos"))]
pub fn get_physical_ram_bytes() -> u64 {
    SIXTEEN_GB_BYTES
}

/// Restituisce l'avviso RAM se la memoria fisica è inferiore a 16 GB.
pub fn ram_warning_for_bytes(bytes: u64) -> Option<String> {
    if bytes > 0 && bytes < SIXTEEN_GB_BYTES {
        Some(
            "Questo Mac ha meno di 16 GB di RAM: viene raccomandato Ministral 3 3B Instruct Q5_K_M (2.47 GB) ottimizzato per memoria unificata."
                .to_string(),
        )
    } else {
        None
    }
}

/// Legge l'ultima riga non vuota da un file di log (es. stderr di llama-server).
pub fn read_last_log_line(path: &Path) -> Option<String> {
    if let Ok(content) = fs::read_to_string(path) {
        content
            .lines()
            .rev()
            .find(|l| !l.trim().is_empty())
            .map(|l| l.trim().to_string())
    } else {
        None
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalLlmReport {
    pub installed: bool,
    pub path: String,
    pub bytes: u64,
    pub sha256_ok: bool,
    #[serde(default)]
    pub model_name: String,
    #[serde(default)]
    pub physical_ram_bytes: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ram_warning: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalModelCatalogEntry {
    pub id: String,
    pub display_name: String,
    pub file_name: String,
    pub size_bytes: u64,
    pub sha256: String,
    pub download_url: String,
    pub min_ram_gb: u32,
    pub recommended_hardware: String,
    pub description: String,
    pub is_reasoning: bool,
    pub installed: bool,
    pub path: String,
    pub current_bytes: u64,
    pub sha256_ok: bool,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalCatalogReport {
    pub models: Vec<LocalModelCatalogEntry>,
    pub active_model_id: String,
    pub physical_ram_bytes: u64,
    pub ram_warning: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalLlmServerReport {
    pub running: bool,
    pub port: u16,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pid: Option<u32>,
    pub model: String,
    pub healthy: bool,
    pub last_error: Option<String>,
    #[serde(default)]
    pub starting: bool,
    #[serde(default)]
    pub physical_ram_bytes: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ram_warning: Option<String>,
}

#[derive(Default)]
struct LlmRunningState {
    child: Option<Child>,
    port: u16,
    owned_pid: Option<u32>,
    model_path: PathBuf,
    binary_path: Option<PathBuf>,
    log_path: Option<PathBuf>,
    last_error: Option<String>,
    starting: bool,
    running_model_file: Option<String>,
}

#[derive(Clone, Default)]
pub struct LlamaLlmServerState(Arc<Mutex<LlmRunningState>>);

pub fn get_target_ministral_path() -> Result<PathBuf, String> {
    let dir = get_models_dir()?;
    Ok(dir.join(get_active_model_file_name()))
}

pub fn get_target_model_path_for_id(model_id: &str) -> Result<PathBuf, String> {
    let def = find_model_def(model_id)
        .ok_or_else(|| format!("Modello '{}' non trovato nel catalogo.", model_id))?;
    let dir = get_models_dir()?;
    Ok(dir.join(def.file_name))
}

pub fn get_ministral_verification_cache_path() -> Result<PathBuf, String> {
    let dir = get_models_dir()?;
    Ok(dir.join(format!("{}.verified.json", get_active_model_file_name())))
}

pub fn get_verification_cache_path_for_file(file_name: &str) -> Result<PathBuf, String> {
    let dir = get_models_dir()?;
    Ok(dir.join(format!("{}.verified.json", file_name)))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MinistralVerificationCache {
    pub path: String,
    pub bytes: u64,
    pub mtime_ms: u64,
    pub sha256: String,
    pub sha256_ok: bool,
    pub verified_at: String,
}

pub fn compute_file_sha256(path: &Path) -> Result<String, String> {
    let mut file =
        fs::File::open(path).map_err(|e| format!("Impossibile aprire il file per hash: {}", e))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 1024 * 1024]; // 1MB buffer for fast streaming hash
    loop {
        let n = file
            .read(&mut buffer)
            .map_err(|e| format!("Errore lettura hash: {}", e))?;
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

pub fn get_model_status(
    def: &ModelCatalogDefinition,
    active_id: &str,
    force_recompute: bool,
) -> LocalModelCatalogEntry {
    let models_dir = get_models_dir().ok();
    let path = models_dir.map(|d| d.join(def.file_name));
    let is_active = def.id.eq_ignore_ascii_case(active_id);

    let (installed, path_str, current_bytes, sha256_ok) = match path {
        Some(p) if p.is_file() => {
            let meta = fs::metadata(&p).ok();
            let bytes = meta.as_ref().map(|m| m.len()).unwrap_or(0);
            if bytes == 0 {
                (false, p.to_string_lossy().to_string(), 0, false)
            } else {
                let cache_file = get_verification_cache_path_for_file(def.file_name).ok();
                let mtime_ms = meta
                    .and_then(|m| m.modified().ok())
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_millis() as u64)
                    .unwrap_or(0);

                let mut hash_ok = false;
                if !force_recompute {
                    if let Some(ref cf) = cache_file {
                        if cf.is_file() {
                            if let Ok(c) = fs::read_to_string(cf) {
                                if let Ok(cached) = serde_json::from_str::<MinistralVerificationCache>(&c) {
                                    if cached.path == p.to_string_lossy()
                                        && cached.bytes == bytes
                                        && cached.mtime_ms == mtime_ms
                                    {
                                        hash_ok = cached.sha256_ok;
                                    }
                                }
                            }
                        }
                    }
                }

                if !hash_ok {
                    if let Ok(h) = compute_file_sha256(&p) {
                        hash_ok = def.sha256.is_empty() || h.eq_ignore_ascii_case(def.sha256);
                        if let Some(ref cf) = cache_file {
                            let entry = MinistralVerificationCache {
                                path: p.to_string_lossy().to_string(),
                                bytes,
                                mtime_ms,
                                sha256: h,
                                sha256_ok: hash_ok,
                                verified_at: chrono::Utc::now().to_rfc3339(),
                            };
                            if let Ok(ser) = serde_json::to_string_pretty(&entry) {
                                let _ = fs::write(cf, ser);
                            }
                        }
                    }
                }

                (bytes > 0 && hash_ok, p.to_string_lossy().to_string(), bytes, hash_ok)
            }
        }
        Some(p) => (false, p.to_string_lossy().to_string(), 0, false),
        None => (false, String::new(), 0, false),
    };

    LocalModelCatalogEntry {
        id: def.id.to_string(),
        display_name: def.display_name.to_string(),
        file_name: def.file_name.to_string(),
        size_bytes: def.size_bytes,
        sha256: def.sha256.to_string(),
        download_url: def.download_url.to_string(),
        min_ram_gb: def.min_ram_gb,
        recommended_hardware: def.recommended_hardware.to_string(),
        description: def.description.to_string(),
        is_reasoning: def.is_reasoning,
        installed,
        path: path_str,
        current_bytes,
        sha256_ok,
        is_active,
    }
}

pub fn get_local_llm_catalog() -> LocalCatalogReport {
    let active_id = get_selected_model_id();
    let ram = get_physical_ram_bytes();
    let ram_warning = ram_warning_for_bytes(ram);

    let models = MODEL_CATALOG
        .iter()
        .map(|def| get_model_status(def, &active_id, false))
        .collect();

    LocalCatalogReport {
        models,
        active_model_id: active_id,
        physical_ram_bytes: ram,
        ram_warning,
    }
}

pub fn local_llm_status() -> LocalLlmReport {
    local_llm_status_with_recheck(false)
}

pub fn local_llm_status_with_recheck(force_recompute_hash: bool) -> LocalLlmReport {
    let active_def = get_active_model_def();
    let active_id = get_selected_model_id();
    let status_entry = get_model_status(active_def, &active_id, force_recompute_hash);
    let ram = get_physical_ram_bytes();
    let ram_warning = ram_warning_for_bytes(ram);

    LocalLlmReport {
        installed: status_entry.installed,
        path: status_entry.path,
        bytes: status_entry.current_bytes,
        sha256_ok: status_entry.sha256_ok,
        model_name: active_def.file_name.to_string(),
        physical_ram_bytes: ram,
        ram_warning,
    }
}

pub async fn download_ministral_with_progress<F>(on_progress: F) -> Result<LocalLlmReport, String>
where
    F: Fn(u64, u64, f64) + Send + 'static,
{
    let active_id = get_selected_model_id();
    download_model_with_progress(&active_id, on_progress).await
}

pub async fn download_model_with_progress<F>(
    model_id: &str,
    on_progress: F,
) -> Result<LocalLlmReport, String>
where
    F: Fn(u64, u64, f64) + Send + 'static,
{
    let def = find_model_def(model_id)
        .ok_or_else(|| format!("Modello '{}' non trovato nel catalogo.", model_id))?;
    let dir = get_models_dir()?;
    let target = dir.join(def.file_name);
    let temp_target = target.with_extension("downloading");
    let _ = fs::remove_file(&temp_target);

    let client = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(20))
        .timeout(Duration::from_secs(14400)) // 4 ore per file grandi fino a 9 GB
        .build()
        .map_err(|e| e.to_string())?;

    let download_url = def.download_url;
    let expected_size = def.size_bytes;
    let expected_sha256 = def.sha256;

    let mut resp = client
        .get(download_url)
        .send()
        .await
        .map_err(|e| format!("Richiesta download fallita: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("Download fallito con stato HTTP: {}", resp.status()));
    }

    let total_bytes = resp.content_length().unwrap_or(expected_size);

    let mut out = fs::File::create(&temp_target).map_err(|e| e.to_string())?;

    let mut downloaded: u64 = 0;
    let mut hasher = Sha256::new();
    let mut last_emit = Instant::now();

    while let Some(chunk) = resp
        .chunk()
        .await
        .map_err(|e| format!("Errore lettura chunk: {}", e))?
    {
        out.write_all(&chunk).map_err(|e| e.to_string())?;
        hasher.update(&chunk);
        downloaded += chunk.len() as u64;

        if last_emit.elapsed() >= Duration::from_millis(250)
            || (total_bytes > 0 && downloaded == total_bytes)
        {
            let pct = if total_bytes > 0 {
                (downloaded as f64 / total_bytes as f64) * 100.0
            } else {
                0.0
            };
            on_progress(downloaded, total_bytes, pct);
            last_emit = Instant::now();
        }
    }

    out.flush().map_err(|e| e.to_string())?;
    drop(out);

    let final_hash = format!("{:x}", hasher.finalize());
    if !expected_sha256.is_empty() && final_hash.to_lowercase() != expected_sha256.to_lowercase() {
        let _ = fs::remove_file(&temp_target);
        return Err(format!(
            "Verifica SHA-256 fallita su {}: calcolato {} vs atteso {}",
            def.display_name, final_hash, expected_sha256
        ));
    }

    fs::rename(&temp_target, &target).map_err(|e| e.to_string())?;

    // Salva cache di verifica
    let cache_file = get_verification_cache_path_for_file(def.file_name)?;
    let meta = fs::metadata(&target).ok();
    let mtime_ms = meta
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);
    let entry = MinistralVerificationCache {
        path: target.to_string_lossy().to_string(),
        bytes: downloaded,
        mtime_ms,
        sha256: final_hash,
        sha256_ok: true,
        verified_at: chrono::Utc::now().to_rfc3339(),
    };
    if let Ok(serialized) = serde_json::to_string_pretty(&entry) {
        let _ = fs::write(cache_file, serialized);
    }

    Ok(local_llm_status_with_recheck(false))
}

impl LlamaLlmServerState {
    pub fn new() -> Self {
        Self(Arc::new(Mutex::new(LlmRunningState::default())))
    }

    /// Attende che il server sia avviato e pronto entro il limite configurato (90s).
    pub fn ensure_running(&self) -> Result<u16, String> {
        let t_deadline = Instant::now() + Duration::from_secs(MINISTRAL_STARTUP_TIMEOUT_SECS);
        let active_def = get_active_model_def();
        loop {
            let rep = self.start()?;
            if rep.running && rep.healthy && rep.port > 0 && rep.model == active_def.file_name {
                return Ok(rep.port);
            }
            if rep.starting {
                while Instant::now() < t_deadline {
                    std::thread::sleep(Duration::from_millis(250));
                    let status = self.status();
                    if status.running && status.healthy && status.port > 0 && status.model == active_def.file_name {
                        return Ok(status.port);
                    }
                    if !status.starting {
                        if let Some(err) = status.last_error {
                            return Err(err);
                        }
                        break;
                    }
                }
                if Instant::now() >= t_deadline {
                    return Err(
                        "Timeout attesa avvio in corso del servizio LLM locale.".to_string(),
                    );
                }
            } else {
                return Err(rep.last_error.unwrap_or_else(|| {
                    "Impossibile avviare il servizio LLM locale".to_string()
                }));
            }
        }
    }

    pub fn status(&self) -> LocalLlmServerReport {
        let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
        let ram = get_physical_ram_bytes();
        let ram_warning = ram_warning_for_bytes(ram);

        if s.owned_pid.is_some() {
            if let Some(ref mut child) = s.child {
                match child.try_wait() {
                    Ok(Some(status)) => {
                        let code = status.code().unwrap_or(-1);
                        s.child = None;
                        s.owned_pid = None;
                        let last_line = s
                            .log_path
                            .as_deref()
                            .and_then(read_last_log_line)
                            .unwrap_or_default();
                        s.last_error = Some(if !last_line.is_empty() {
                            format!("Il processo LLM locale è terminato: {}", last_line)
                        } else {
                            format!("Il processo LLM locale è terminato con codice: {}", code)
                        });
                        s.port = 0;
                        s.running_model_file = None;
                    }
                    Ok(None) => {}
                    Err(e) => {
                        s.last_error = Some(format!("Errore controllo processo LLM: {}", e));
                    }
                }
            }
        }

        let is_running = s.port > 0 && s.owned_pid.is_some();
        let healthy = is_running && check_health(s.port);

        let active_file = s.running_model_file.clone().unwrap_or_else(|| get_active_model_file_name().to_string());

        LocalLlmServerReport {
            running: is_running,
            port: s.port,
            pid: s.owned_pid,
            model: active_file,
            healthy,
            last_error: s.last_error.clone(),
            starting: s.starting,
            physical_ram_bytes: ram,
            ram_warning,
        }
    }

    pub fn start(&self) -> Result<LocalLlmServerReport, String> {
        let active_def = get_active_model_def();
        let current = self.status();
        if current.running && current.healthy {
            if current.model == active_def.file_name {
                return Ok(current);
            }
            // Modello cambiato: arresta il modello precedente prima di avviare il nuovo
            let _ = self.stop();
        }

        let ram = get_physical_ram_bytes();
        let ram_warning = ram_warning_for_bytes(ram);

        {
            let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
            if s.starting {
                return Ok(LocalLlmServerReport {
                    running: false,
                    port: 0,
                    pid: None,
                    model: active_def.file_name.to_string(),
                    healthy: false,
                    last_error: None,
                    starting: true,
                    physical_ram_bytes: ram,
                    ram_warning,
                });
            }
            s.starting = true;
            s.last_error = None;
        }

        let model_path = match get_target_model_path_for_id(active_def.id) {
            Ok(p) => {
                if !p.is_file() {
                    let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
                    s.starting = false;
                    let err = format!(
                        "Modello '{}' non trovato su disco. Eseguire prima il download dalle Impostazioni.",
                        active_def.display_name
                    );
                    s.last_error = Some(err.clone());
                    return Err(err);
                }
                p
            }
            Err(e) => {
                let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
                s.starting = false;
                s.last_error = Some(e.clone());
                return Err(e);
            }
        };

        let binary = match detect_llama_server_binary() {
            Some(b) => b,
            None => {
                let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
                s.starting = false;
                let err =
                    "Binario llama-server non disponibile nel pacchetto o nel sistema.".to_string();
                s.last_error = Some(err.clone());
                return Err(err);
            }
        };

        let free_port = match find_free_port() {
            Ok(p) => p,
            Err(e) => {
                let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
                s.starting = false;
                s.last_error = Some(e.clone());
                return Err(e);
            }
        };

        let log_path = match model_path.parent() {
            Some(dir) => dir.join("llama-llm.log"),
            None => PathBuf::from("llama-llm.log"),
        };
        let stderr_file = match fs::File::create(&log_path) {
            Ok(f) => Stdio::from(f),
            Err(_) => Stdio::null(),
        };

        let mut cmd = Command::new(&binary);
        cmd.args([
            "-m",
            &model_path.to_string_lossy(),
            "--host",
            "127.0.0.1",
            "--port",
            &free_port.to_string(),
            "-c",
            "8192",
            "-np",
            "1",
            "-ctk",
            "q8_0",
            "-ctv",
            "q8_0",
            "-ngl",
            "99",
            "-ub",
            "512",
            "-b",
            "512",
        ]);

        if let Some(parent) = binary.parent() {
            cmd.current_dir(parent);
            let metal = parent.join("libggml-metal.so");
            if metal.is_file() {
                cmd.env("GGML_BACKEND_PATH", metal);
            }
        }

        #[cfg(unix)]
        {
            use std::os::unix::process::CommandExt;
            cmd.process_group(0);
        }
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }

        cmd.stdin(Stdio::null());
        cmd.stdout(Stdio::null());
        cmd.stderr(stderr_file);

        let child = match cmd.spawn() {
            Ok(c) => c,
            Err(e) => {
                let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
                s.starting = false;
                let err = format!("Impossibile avviare il processo LLM locale: {}", e);
                s.last_error = Some(err.clone());
                return Err(err);
            }
        };

        let pid = child.id();

        {
            let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
            s.child = Some(child);
            s.owned_pid = Some(pid);
            s.port = free_port;
            s.model_path = model_path;
            s.binary_path = Some(binary);
            s.log_path = Some(log_path.clone());
            s.running_model_file = Some(active_def.file_name.to_string());
        }

        let t_deadline = Instant::now() + Duration::from_secs(MINISTRAL_STARTUP_TIMEOUT_SECS);
        let mut is_healthy = false;

        while Instant::now() < t_deadline {
            std::thread::sleep(Duration::from_millis(300));
            if check_health(free_port) {
                is_healthy = true;
                break;
            }

            let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
            if let Some(ref mut c) = s.child {
                if let Ok(Some(st)) = c.try_wait() {
                    s.starting = false;
                    s.child = None;
                    s.owned_pid = None;
                    s.port = 0;
                    s.running_model_file = None;
                    let last_line = read_last_log_line(&log_path).unwrap_or_default();
                    let err = if !last_line.is_empty() {
                        format!("Il processo LLM è uscito prematuramente: {}", last_line)
                    } else {
                        format!("Il processo LLM è uscito prematuramente con codice: {}", st)
                    };
                    s.last_error = Some(err.clone());
                    return Err(err);
                }
            }
        }

        {
            let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
            s.starting = false;
        }

        if !is_healthy {
            let last_line = read_last_log_line(&log_path).unwrap_or_default();
            self.stop()?;
            let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());
            let err = if !last_line.is_empty() {
                format!(
                    "Timeout attesa salute (/health) del servizio LLM locale: {}",
                    last_line
                )
            } else {
                "Timeout attesa salute (/health) del servizio LLM locale.".to_string()
            };
            s.last_error = Some(err.clone());
            return Err(err);
        }

        Ok(self.status())
    }

    pub fn stop(&self) -> Result<LocalLlmServerReport, String> {
        let mut s = self.0.lock().unwrap_or_else(|e| e.into_inner());

        if let Some(mut child) = s.child.take() {
            let _ = child.kill();
            let _ = child.wait();
        }

        s.owned_pid = None;
        s.port = 0;
        s.starting = false;
        s.running_model_file = None;

        let ram = get_physical_ram_bytes();
        let ram_warning = ram_warning_for_bytes(ram);

        Ok(LocalLlmServerReport {
            running: false,
            port: 0,
            pid: None,
            model: get_active_model_file_name().to_string(),
            healthy: false,
            last_error: None,
            starting: false,
            physical_ram_bytes: ram,
            ram_warning,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ministral_constants() {
        assert_eq!(
            MINISTRAL_MODEL_FILE_NAME,
            "Ministral-3-8B-Instruct-2512-Q5_K_M.gguf"
        );
        assert_eq!(MINISTRAL_MODEL_SIZE_BYTES, 6_059_268_512);
        assert_eq!(MINISTRAL_MODEL_SHA256.len(), 64);
        assert!(MINISTRAL_DOWNLOAD_URL.starts_with("https://huggingface.co/"));
    }

    #[test]
    fn test_llama_llm_state_initial_status() {
        let state = LlamaLlmServerState::new();
        let rep = state.status();
        assert!(!rep.running);
        assert!(!rep.healthy);
        assert_eq!(rep.port, 0);
        assert!(rep.pid.is_none());
        assert_eq!(rep.model, get_active_model_file_name());
        assert!(!rep.starting);
        assert!(rep.physical_ram_bytes > 0);
    }

    #[test]
    fn test_llama_llm_report_serialization() {
        let rep = LocalLlmReport {
            installed: true,
            path: "/path/to/Ministral.gguf".to_string(),
            bytes: 6_059_268_512,
            sha256_ok: true,
            model_name: "Ministral-3-8B-Instruct-2512-Q5_K_M.gguf".to_string(),
            physical_ram_bytes: 8589934592,
            ram_warning: Some("Mac sotto i 16 GB".to_string()),
        };
        let json = serde_json::to_string(&rep).unwrap();
        assert!(json.contains("\"installed\":true"));
        assert!(json.contains("\"sha256Ok\":true"));
        assert!(json.contains("\"bytes\":6059268512"));
        assert!(json.contains("\"physicalRamBytes\":8589934592"));
        assert!(json.contains("\"ramWarning\":\"Mac sotto i 16 GB\""));
    }

    #[test]
    fn test_compute_file_sha256() {
        let tmp = tempfile::tempdir().unwrap();
        let file_path = tmp.path().join("test.bin");
        fs::write(&file_path, b"hello limen vault local llm ministral").unwrap();

        let hash = compute_file_sha256(&file_path).unwrap();
        assert_eq!(hash.len(), 64);

        // Verifica consistenza con sha2::Sha256
        let mut hasher = Sha256::new();
        hasher.update(b"hello limen vault local llm ministral");
        let expected = format!("{:x}", hasher.finalize());
        assert_eq!(hash, expected);
    }

    #[test]
    fn test_physical_ram_and_warning() {
        let ram = get_physical_ram_bytes();
        assert!(ram > 0, "RAM fisica deve essere maggiore di 0");
        if ram < SIXTEEN_GB_BYTES {
            let warn = ram_warning_for_bytes(ram);
            assert!(warn.is_some());
            assert!(warn.unwrap().contains("16 GB"));
        } else {
            let warn = ram_warning_for_bytes(ram);
            assert!(warn.is_none());
        }
    }

    #[test]
    fn test_read_last_log_line() {
        let tmp = tempfile::tempdir().unwrap();
        let log_file = tmp.path().join("test-llama.log");
        fs::write(
            &log_file,
            "line 1\nline 2 info\nllama-server: error: unable to allocate metal memory\n\n",
        )
        .unwrap();

        let last = read_last_log_line(&log_file);
        assert_eq!(
            last,
            Some("llama-server: error: unable to allocate metal memory".to_string())
        );
    }

    #[test]
    fn test_ensure_running_with_already_starting_eventually_resolves() {
        let state = LlamaLlmServerState::new();
        // Simula starting == true impostato da un altro thread
        {
            let mut s = state.0.lock().unwrap();
            s.starting = true;
        }
        let state_clone = state.clone();
        std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(150));
            let mut s = state_clone.0.lock().unwrap();
            s.starting = false;
            s.last_error = Some("Errore simulato terminazione avvio".to_string());
        });

        let res = state.ensure_running();
        assert!(res.is_err());
        assert_eq!(res.unwrap_err(), "Errore simulato terminazione avvio");
    }

    #[test]
    fn test_model_catalog_definitions() {
        assert_eq!(MODEL_CATALOG.len(), 6);
        for m in MODEL_CATALOG {
            assert!(!m.id.is_empty());
            assert!(!m.display_name.is_empty());
            assert!(m.file_name.ends_with(".gguf"));
            assert!(m.size_bytes > 1_000_000_000);
            assert!(m.download_url.starts_with("https://huggingface.co/"));
            assert!(m.min_ram_gb >= 8);
            assert!(!m.description.is_empty());
        }
    }

    #[test]
    fn test_find_model_def() {
        assert!(find_model_def("ministral-3b").is_some());
        assert!(find_model_def("ministral-8b").is_some());
        assert!(find_model_def("qwen-2.5-7b").is_some());
        assert!(find_model_def("llama-3.1-8b").is_some());
        assert!(find_model_def("deepseek-r1-7b").is_some());
        assert!(find_model_def("deepseek-r1-14b").is_some());
        assert!(find_model_def("non-existent-model").is_none());

        let qwen = find_model_def("qwen-2.5-7b").unwrap();
        assert_eq!(qwen.display_name, "Qwen 2.5 7B Instruct");
        assert!(!qwen.is_reasoning);

        let r1_7b = find_model_def("deepseek-r1-7b").unwrap();
        assert!(r1_7b.is_reasoning);

        let r1_14b = find_model_def("deepseek-r1-14b").unwrap();
        assert!(r1_14b.is_reasoning);
        assert_eq!(r1_14b.min_ram_gb, 24);
    }

    #[test]
    fn test_catalog_report_serialization() {
        let cat = get_local_llm_catalog();
        assert_eq!(cat.models.len(), 6);
        assert!(!cat.active_model_id.is_empty());
        let json = serde_json::to_string(&cat).unwrap();
        assert!(json.contains("\"activeModelId\""));
        assert!(json.contains("\"models\""));
        assert!(json.contains("\"minRamGb\""));
        assert!(json.contains("\"recommendedHardware\""));
    }
}

