$ErrorActionPreference = 'Stop'
$repo = 'E:\Projects\vault_memai_obsi'
$ev = Join-Path $PSScriptRoot 'evidenze'
$deps = Join-Path $repo 'apps\desktop\src-tauri\target\debug\deps'
function Read-Revision([string]$rev,[string]$file) {
    $data = & git.exe -c safe.directory=E:/Projects/vault_memai_obsi -C $repo show "${rev}:apps/desktop/src-tauri/src/$file"
    if ($LASTEXITCODE -ne 0) { throw 'git show failed' }
    return ($data -join "`n")
}
function Between([string]$data,[string]$first,[string]$last) {
    $a=$data.IndexOf($first); $b=$data.IndexOf($last,$a)
    if($a -lt 0 -or $b -lt 0){throw "Missing extraction marker $first"}
    return $data.Substring($a,$b-$a)
}
$llama=Read-Revision '67da90f' 'llama.rs'
$prefix=@'
#![allow(dead_code,unused_imports)]
use std::{fs, path::{Path,PathBuf}, process::{Child,Command,Stdio}, sync::{Arc,Mutex}, time::{Duration,Instant}};
#[derive(Debug)]
struct LocalServerReport { running:bool, port:u16, pid:Option<u32>, model:String, healthy:bool, last_error:Option<String> }
fn pid_file_path()->Option<PathBuf>{None} // Harness isolation: no shared files touched.
fn port_file_path()->Option<PathBuf>{None}
'@
$state=Between $llama '#[derive(Default)]' 'use std::sync::atomic'
$health=Between $llama 'pub fn check_health(' 'pub fn verify_dimensions('
$stop=Between $llama 'fn stop_child(' 'impl LlamaServerState {'
$status=Between $llama '    pub fn status(' '    pub fn start('
$main=Get-Content -Raw (Join-Path $PSScriptRoot 'lifecycle_main.rs')
$prefix+"`n"+$state+"`n"+$health+"`n"+$stop+"`nimpl LlamaServerState {`n"+$status+"`n}`n"+$main | Set-Content -Encoding utf8 (Join-Path $ev 'lifecycle_harness.rs')
& rustc --edition=2021 (Join-Path $ev 'lifecycle_harness.rs') -o (Join-Path $PSScriptRoot 'lifecycle_harness.exe') 2>&1 | Set-Content (Join-Path $ev 'lifecycle_compile.txt')
if($LASTEXITCODE -ne 0){throw 'lifecycle rustc failed'}
$regex=(Get-ChildItem $deps -Filter 'libregex-*.rlib' | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
foreach($rev in @('efa0cef','ef2532c','e0afe10','67da90f')) {
    $ai=Read-Revision $rev 'ai.rs'
    $sanitize=Between $ai 'pub fn sanitize_answer_prose(' 'pub fn parse_response('
    $classes=Between $ai '#[derive(Debug, Default)]' '/// Esegue l''interrogazione ad OpenAI in modalit'
    if(-not $classes.Contains('pub struct StreamProseSanitizer')) {throw 'Incorrect sanitizer extraction'}
    $test=Get-Content -Raw (Join-Path $PSScriptRoot 'stream_main.rs')
    "#![allow(dead_code)]`n"+$sanitize+"`n"+$classes+"`n"+$test | Set-Content -Encoding utf8 (Join-Path $ev "stream_$rev.rs")
    & rustc --edition=2021 (Join-Path $ev "stream_$rev.rs") -L "dependency=$deps" --extern "regex=$regex" -o (Join-Path $PSScriptRoot "stream_$rev.exe") 2>&1 | Set-Content (Join-Path $ev "stream_compile_$rev.txt")
    if($LASTEXITCODE -ne 0){throw "stream rustc failed $rev"}
}
'Harness compilation complete'
