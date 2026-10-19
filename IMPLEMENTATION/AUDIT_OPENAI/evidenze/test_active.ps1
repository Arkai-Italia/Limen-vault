$ErrorActionPreference='Stop'
$repo='E:\Projects\vault_memai_obsi'
$ev=Join-Path $PSScriptRoot 'evidenze'
$ai=((& git.exe -c safe.directory=E:/Projects/vault_memai_obsi -C $repo show '67da90f:apps/desktop/src-tauri/src/ai.rs') -join "`n")
$a=$ai.IndexOf('    pub fn cancel(');$b=$ai.IndexOf("`n}",$a)
$methods=$ai.Substring($a,$b-$a)
$prefix=@'
use std::{collections::BTreeMap,sync::{Arc,Mutex,atomic::{AtomicBool,Ordering}},time::{Instant,Duration}};
// Pending is reduced to the two fields used by the extracted methods; no vault/network access.
pub struct Pending{created_at:Instant,sources:Vec<()>}
pub struct ActiveEntry{cancel:Arc<AtomicBool>,started_at:Instant}
#[derive(Default)]
pub struct AiState{pending:Mutex<BTreeMap<String,Pending>>,active:Mutex<BTreeMap<String,ActiveEntry>>}
fn log_begin_rejected(_: &str,_:&str,_:u64){}
'@
$test=@'
fn main(){
 let s=AiState::default();
 for ticket in ["one","two"] {s.pending.lock().unwrap().insert(ticket.into(),Pending{created_at:Instant::now(),sources:vec![()]});}
 let injected=std::panic::catch_unwind(std::panic::AssertUnwindSafe(||{
   let _=s.begin("one").unwrap();
   panic!("audit injected panic after begin, before finish");
   #[allow(unreachable_code)] s.finish("one");
 }));
 assert!(injected.is_err());
 println!("active_after_panic={}",s.active.lock().unwrap().len());
 s.cancel("one");println!("active_after_cancel={}",s.active.lock().unwrap().len());
 assert_eq!(s.begin("two").err().unwrap(),"An AI request is already running");
 println!("second_request=An AI request is already running");
 s.finish("one");assert!(s.begin("two").is_ok());s.finish("two");
 println!("explicit_finish_recovers=true");
}
'@
$prefix+"`nimpl AiState {`n"+$methods+"`n}`n"+$test | Set-Content -Encoding utf8 (Join-Path $ev 'active_harness.rs')
& rustc --edition=2021 (Join-Path $ev 'active_harness.rs') -o (Join-Path $PSScriptRoot 'active_harness.exe') 2>&1 | Set-Content (Join-Path $ev 'active_compile.txt')
if($LASTEXITCODE -ne 0){throw 'rustc failure'}
& (Join-Path $PSScriptRoot 'active_harness.exe') *> (Join-Path $ev '09_active_test.txt')
Get-Content (Join-Path $ev '09_active_test.txt')
