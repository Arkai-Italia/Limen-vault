$ErrorActionPreference='Stop'
$repo='E:\Projects\vault_memai_obsi'
$ev=Join-Path $PSScriptRoot 'evidenze'
$deps=Join-Path $repo 'apps\desktop\src-tauri\target\debug\deps'
function Extract([string]$data,[string]$first,[string]$last){$a=$data.IndexOf($first);$b=$data.IndexOf($last,$a);if($a -lt 0 -or $b -lt 0){throw 'marker missing'};$data.Substring($a,$b-$a)}
$prefix=@'
#![allow(dead_code,private_interfaces)]
use std::{fs,path::{Path,PathBuf},process::{Child,Command,Stdio},sync::{Arc,Mutex},time::{Duration,Instant}};
const EXPECTED_EMBEDDINGS_DIMENSIONS:usize=1024;
#[derive(Debug)]
struct LocalServerReport{running:bool,port:u16,pid:Option<u32>,model:String,healthy:bool,last_error:Option<String>}
struct ModelReport{installed:bool,sha256_ok:bool,path:String}
// Explicit harness boundaries: fake model/binary, separate registration directory,
// no orphan reaping, console-only logger. Lifecycle methods remain exact source.
fn audit_dir()->PathBuf{PathBuf::from(std::env::var("AUDIT_LIFECYCLE_DIR").unwrap())}
fn pid_file_path()->Option<PathBuf>{Some(audit_dir().join("llama-server.pid"))}
fn port_file_path()->Option<PathBuf>{Some(audit_dir().join("llama-server.port"))}
fn local_model_status()->ModelReport{ModelReport{installed:true,sha256_ok:true,path:audit_dir().join("fake.gguf").to_string_lossy().to_string()}}
fn reap_orphan_server()->Option<u32>{println!("HARNESS orphan reaping disabled");None}
fn detect_llama_server_binary()->Option<PathBuf>{Some(std::env::current_exe().unwrap())}
fn log_local_model_timing(event:&str,elapsed:u64,detail:&str){println!("HARNESS_LOG {event} {elapsed} {detail}");}
'@
$json=(Get-ChildItem $deps -Filter 'libserde_json-*.rlib' | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
foreach($rev in 'e0afe10','67da90f'){
    $llama=((& git.exe -c safe.directory=E:/Projects/vault_memai_obsi -C $repo show "${rev}:apps/desktop/src-tauri/src/llama.rs") -join "`n")
    if($LASTEXITCODE -ne 0){throw 'git failure'}
    $state=Extract $llama '#[derive(Default)]' 'use std::sync::atomic'
    $write=Extract $llama 'fn write_pid_file(' '/// Trova la porta TCP'
    $methods=Extract $llama 'pub fn find_free_port(' 'impl Drop for LlamaServerState'
    $prefix+"`n"+$state+"`n"+$write+"`n"+$methods+"`n"+(Get-Content -Raw (Join-Path $PSScriptRoot 'start_main.rs')) | Set-Content -Encoding utf8 (Join-Path $ev "start_$rev.rs")
    & rustc --edition=2021 (Join-Path $ev "start_$rev.rs") -L "dependency=$deps" --extern "serde_json=$json" -o (Join-Path $PSScriptRoot "start_$rev.exe") 2>&1 | Set-Content (Join-Path $ev "start_compile_$rev.txt")
    if($LASTEXITCODE -ne 0){throw "compile failed $rev"}
}
'Start harnesses compiled'
