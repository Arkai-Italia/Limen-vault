use std::{collections::BTreeMap,sync::{Arc,Mutex,atomic::{AtomicBool,Ordering}},time::{Instant,Duration}};
// Pending is reduced to the two fields used by the extracted methods; no vault/network access.
pub struct Pending{created_at:Instant,sources:Vec<()>}
pub struct ActiveEntry{cancel:Arc<AtomicBool>,started_at:Instant}
#[derive(Default)]
pub struct AiState{pending:Mutex<BTreeMap<String,Pending>>,active:Mutex<BTreeMap<String,ActiveEntry>>}
fn log_begin_rejected(_: &str,_:&str,_:u64){}
impl AiState {
    pub fn cancel(&self, ticket: &str) {
        if let Ok(mut p) = self.pending.lock() {
            p.remove(ticket);
        }
        if let Ok(a) = self.active.lock() {
            if let Some(entry) = a.get(ticket) {
                entry.cancel.store(true, Ordering::SeqCst);
            }
        }
    }
    pub fn begin(&self, ticket: &str) -> Result<(Pending, Arc<AtomicBool>), String> {
        let mut active = self.active.lock().map_err(|_| "AI unavailable")?;
        if !active.is_empty() {
            if let Some((active_ticket, entry)) = active.iter().next() {
                let active_elapsed_ms = entry.started_at.elapsed().as_millis() as u64;
                log_begin_rejected(ticket, active_ticket, active_elapsed_ms);
            }
            return Err("An AI request is already running".into());
        }
        let p = self
            .pending
            .lock()
            .map_err(|_| "AI unavailable")?
            .remove(ticket)
            .ok_or("Preview expired; select sources again")?;
        if p.created_at.elapsed() > Duration::from_secs(300) || p.sources.is_empty() {
            return Err("Preview expired or no eligible sources".into());
        }
        let flag = Arc::new(AtomicBool::new(false));
        active.insert(ticket.into(), ActiveEntry {
            cancel: flag.clone(),
            started_at: Instant::now(),
        });
        Ok((p, flag))
    }
    pub fn finish(&self, ticket: &str) {
        if let Ok(mut a) = self.active.lock() {
            a.remove(ticket);
        }
    }
}
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
