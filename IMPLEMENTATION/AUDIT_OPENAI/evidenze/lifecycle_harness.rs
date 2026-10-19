#![allow(dead_code,unused_imports)]
use std::{fs, path::{Path,PathBuf}, process::{Child,Command,Stdio}, sync::{Arc,Mutex}, time::{Duration,Instant}};
#[derive(Debug)]
struct LocalServerReport { running:bool, port:u16, pid:Option<u32>, model:String, healthy:bool, last_error:Option<String> }
fn pid_file_path()->Option<PathBuf>{None} // Harness isolation: no shared files touched.
fn port_file_path()->Option<PathBuf>{None}
#[derive(Default)]
struct RunningState {
    child: Option<Child>,
    port: u16,
    model_path: PathBuf,
    binary_path: Option<PathBuf>,
    last_error: Option<String>,
    crash_count: u32,
}

#[derive(Clone, Default)]
pub struct LlamaServerState(Arc<Mutex<RunningState>>);


pub fn check_health(port: u16) -> bool {
    if port == 0 {
        return false;
    }
    use std::io::{Read, Write};
    use std::net::{SocketAddr, TcpStream};
    let addr: SocketAddr = match format!("127.0.0.1:{}", port).parse() {
        Ok(a) => a,
        Err(_) => return false,
    };
    let mut stream = match TcpStream::connect_timeout(&addr, Duration::from_millis(400)) {
        Ok(s) => s,
        Err(_) => return false,
    };
    let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
    let _ = stream.set_write_timeout(Some(Duration::from_millis(500)));
    let req = format!(
        "GET /health HTTP/1.1\r\nHost: 127.0.0.1:{}\r\nConnection: close\r\n\r\n",
        port
    );
    if stream.write_all(req.as_bytes()).is_err() {
        return false;
    }
    let mut resp = [0u8; 512];
    match stream.read(&mut resp) {
        Ok(n) if n > 0 => {
            let s = String::from_utf8_lossy(&resp[..n]);
            s.starts_with("HTTP/1.1 200")
                || s.starts_with("HTTP/1.0 200")
                || s.contains("\"ok\"")
                || s.contains("status\":\"ok")
        }
        _ => false,
    }
}


fn stop_child(s: &mut RunningState) {
    if let Some(mut c) = s.child.take() {
        #[cfg(unix)]
        unsafe {
            let pid = c.id() as i32;
            libc::kill(-pid, libc::SIGTERM);
            libc::kill(pid, libc::SIGTERM);
        }
        for _ in 0..20 {
            if c.try_wait().ok().flatten().is_some() {
                break;
            }
            std::thread::sleep(Duration::from_millis(50));
        }
        #[cfg(unix)]
        unsafe {
            let pid = c.id() as i32;
            libc::kill(-pid, libc::SIGKILL);
            libc::kill(pid, libc::SIGKILL);
        }
        let _ = c.wait();
    }
    if let Some(p) = pid_file_path() {
        let _ = fs::remove_file(p);
    }
    if let Some(p) = port_file_path() {
        let _ = fs::remove_file(p);
    }
    s.port = 0;
}


impl LlamaServerState {
    pub fn status(&self) -> LocalServerReport {
        let mut s = match self.0.lock() {
            Ok(guard) => guard,
            Err(poisoned) => poisoned.into_inner(),
        };

        if let Some(c) = s.child.as_mut() {
            if let Ok(Some(exit_status)) = c.try_wait() {
                s.child = None;
                s.last_error = Some(format!("llama-server terminato con stato: {}", exit_status));
            }
        }

        let running = s.child.is_some() || (s.port > 0 && check_health(s.port));
        let healthy = s.port > 0 && check_health(s.port);
        let pid = s.child.as_ref().map(|c| c.id());

        LocalServerReport {
            running,
            port: s.port,
            pid,
            model: "bge-m3-Q8_0.gguf".to_string(),
            healthy,
            last_error: s.last_error.clone(),
        }
    }


}
fn main() {
    if std::env::args().any(|x|x=="--child") {std::thread::sleep(Duration::from_millis(2400));return;}
    let port: u16=std::env::args().nth(1).unwrap().parse().unwrap();
    let healthy=check_health(port);
    let cold=LlamaServerState::default();
    let t=Instant::now(); let report=cold.status();
    println!("external_port={port} external_health={healthy} default_status={report:?} elapsed_ms={}",t.elapsed().as_millis());
    assert_eq!(report.port,0); assert!(!report.healthy);
    use std::os::windows::process::CommandExt;
    let child=Command::new(std::env::current_exe().unwrap()).arg("--child").creation_flags(0x08000000).spawn().unwrap();
    println!("harmless_child_pid={} exits_naturally_after_ms=2400",child.id());
    let running=Arc::new(Mutex::new(RunningState{child:Some(child),..Default::default()}));
    let copy=running.clone(); let (tx,rx)=std::sync::mpsc::channel();
    let t=Instant::now();
    let worker=std::thread::spawn(move||{let mut guard=copy.lock().unwrap();tx.send(()).unwrap();stop_child(&mut guard);});
    rx.recv().unwrap(); std::thread::sleep(Duration::from_millis(1200));
    let blocked=running.try_lock().is_err();
    println!("mutex_blocked_after_1200ms={blocked}");assert!(blocked);
    worker.join().unwrap();println!("stop_child_returned_ms={} child_exit=natural shared_files=untouched",t.elapsed().as_millis());
}

