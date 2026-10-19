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


fn write_pid_file(path: &Path, pid: u32) {
    let _ = fs::write(path, pid.to_string());
}

fn read_pid_file(path: &Path) -> Option<u32> {
    fs::read_to_string(path).ok()?.trim().parse::<u32>().ok()
}

fn write_port_file(path: &Path, port: u16) {
    let _ = fs::write(path, port.to_string());
}

fn read_port_file(path: &Path) -> Option<u16> {
    fs::read_to_string(path).ok()?.trim().parse::<u16>().ok()
}


pub fn find_free_port() -> Result<u16, String> {
    let listener = std::net::TcpListener::bind("127.0.0.1:0")
        .map_err(|e| format!("Impossibile trovare una porta libera su 127.0.0.1: {}", e))?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    drop(listener);
    Ok(port)
}

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

pub fn verify_dimensions(port: u16) -> Result<(), String> {
    use std::io::{Read, Write};
    use std::net::{SocketAddr, TcpStream};
    let addr: SocketAddr = format!("127.0.0.1:{}", port)
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;
    let mut stream = TcpStream::connect_timeout(&addr, Duration::from_secs(5))
        .map_err(|e| format!("Impossibile connettersi a 127.0.0.1:{}: {}", port, e))?;
    stream
        .set_read_timeout(Some(Duration::from_secs(10)))
        .map_err(|e| e.to_string())?;
    stream
        .set_write_timeout(Some(Duration::from_secs(5)))
        .map_err(|e| e.to_string())?;

    let body = r#"{"input":"test","model":"bge-m3"}"#;
    let req = format!(
        "POST /v1/embeddings HTTP/1.1\r\nHost: 127.0.0.1:{}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        port,
        body.len(),
        body
    );
    stream
        .write_all(req.as_bytes())
        .map_err(|e| e.to_string())?;

    let mut response_bytes = Vec::new();
    stream
        .read_to_end(&mut response_bytes)
        .map_err(|e| e.to_string())?;
    let response_str = String::from_utf8_lossy(&response_bytes);

    let body_part = if let Some(idx) = response_str.find("\r\n\r\n") {
        &response_str[idx + 4..]
    } else {
        &response_str
    };

    let val: serde_json::Value = serde_json::from_str(body_part).map_err(|e| {
        format!(
            "Risposta JSON non valida: {} (corpo: {})",
            e,
            body_part.chars().take(200).collect::<String>()
        )
    })?;

    let dim = val
        .get("data")
        .and_then(|d| d.get(0))
        .and_then(|i| i.get("embedding"))
        .and_then(|e| e.as_array())
        .map(|a| a.len())
        .unwrap_or(0);

    if dim != EXPECTED_EMBEDDINGS_DIMENSIONS {
        return Err(format!(
            "Dimensioni vettore errate: attese {} componenti, ricevute {}",
            EXPECTED_EMBEDDINGS_DIMENSIONS, dim
        ));
    }

    Ok(())
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
    pub fn get_port(&self) -> u16 {
        let s = self.0.lock().unwrap_or_else(|e| e.into_inner());
        s.port
    }

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

    pub fn start(&self) -> Result<LocalServerReport, String> {
        let t_start = Instant::now();
        // 1. Verify model is installed
        let model_rep = local_model_status();
        if !model_rep.installed || !model_rep.sha256_ok {
            return Err("Modello locale bge-m3-Q8_0.gguf non installato o non integro. Esegui il download dalle impostazioni.".into());
        }
        let model_path = PathBuf::from(model_rep.path);

        // 2. Check if already healthy
        {
            let s = self.0.lock().unwrap_or_else(|e| e.into_inner());
            if s.port > 0 && check_health(s.port) {
                drop(s);
                return Ok(self.status());
            }
        }

        // 2b. Un server orfano di un'istanza precedente (app uccisa) va terminato prima di avviarne un altro
        let _ = reap_orphan_server();

        // 3. Find standalone or system binary
        let binary = detect_llama_server_binary().ok_or_else(|| {
            "Binario llama-server non disponibile nel pacchetto o nel sistema.".to_string()
        })?;

        let mut s = self.0.lock().map_err(|e| e.to_string())?;
        stop_child(&mut s);
        s.last_error = None;

        // 4. Choose free port
        let port = find_free_port()?;

        // 5. Spawn llama-server with exact arguments
        let mut cmd = Command::new(&binary);
        cmd.args([
            "-m", &model_path.to_string_lossy(),
            "--embedding",
            "--host", "127.0.0.1",
            "--port", &port.to_string(),
            "-ub", "2048",
            "-b", "2048",
        ]);

        // Backend Metal. ggml cerca i backend nella cartella compilata nel binario
        // (/opt/homebrew/Cellar/ggml/<ver>/libexec): se su questo Mac esiste, trova li' le librerie
        // Homebrew firmate ad-hoc, che il runtime indurito rifiuta ("different Team IDs"), e NON ripiega
        // su quelle incluse nell'app: il server parte con la sola CPU. Verificato il 20/09/2026 con
        // `--list-devices`: "(none)" con la cartella visibile, "BLAS + MTL0" con la cartella nascosta;
        // 0,65 s/passaggio su CPU contro 0,09 s con Metal. GGML_BACKEND_PATH carica esplicitamente la
        // libreria Metal inclusa e non duplica il dispositivo quando e' gia' stato trovato.
        if let Some(metal) = binary.parent().map(|d| d.join("libggml-metal.so")).filter(|p| p.is_file()) {
            cmd.env("GGML_BACKEND_PATH", metal);
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
        // stderr su file accanto al modello: senza, un avvio fallito non lascia alcuna causa
        // leggibile (caso reale: "no backends are loaded" nascosto dietro un semplice "exit status 1").
        let log_path = model_path.parent().map(|p| p.join("llama-server.log"));
        match log_path.as_ref().and_then(|p| std::fs::File::create(p).ok()) {
            Some(f) => { cmd.stderr(Stdio::from(f)); }
            None => { cmd.stderr(Stdio::null()); }
        }

        let child = cmd
            .spawn()
            .map_err(|e| format!("Impossibile avviare il processo llama-server: {}", e))?;

        if let Some(p) = pid_file_path() {
            write_pid_file(&p, child.id());
        }
        if let Some(p) = port_file_path() {
            write_port_file(&p, port);
        }
        s.child = Some(child);
        s.port = port;
        s.model_path = model_path;
        s.binary_path = Some(binary);
        drop(s);

        // 6. Poll /health endpoint up to 25 seconds
        let deadline = Instant::now() + Duration::from_secs(25);
        let mut healthy = false;
        while Instant::now() < deadline {
            std::thread::sleep(Duration::from_millis(200));
            if check_health(port) {
                healthy = true;
                break;
            }

            // Check if crashed
            let mut guard = self.0.lock().map_err(|e| e.to_string())?;
            if let Some(c) = guard.child.as_mut() {
                if let Ok(Some(code)) = c.try_wait() {
                    guard.child = None;
                    // Ultime righe dello stderr: e' la causa reale, va mostrata all'utente.
                    let tail = log_path
                        .as_ref()
                        .and_then(|p| std::fs::read_to_string(p).ok())
                        .map(|t| {
                            let mut last: Vec<&str> = t.lines().filter(|l| !l.trim().is_empty()).collect();
                            let keep = last.len().saturating_sub(3);
                            last.drain(..keep);
                            last.join(" | ")
                        })
                        .unwrap_or_default();
                    let detail = if tail.is_empty() { String::new() } else { format!(" — {}", tail) };
                    guard.last_error = Some(format!("llama-server uscito con codice {}{}", code, detail));
                    return Err(format!("Avvio llama-server fallito (codice {}){}", code, detail));
                }
            }
        }

        if !healthy {
            self.stop()?;
            return Err("Timeout: llama-server non ha risposto sull'endpoint /health entro 25s.".into());
        }

        // 7. Verify dimensions are exactly 1024
        if let Err(e) = verify_dimensions(port) {
            self.stop()?;
            return Err(format!("Controllo dimensioni vettore fallito: {}", e));
        }

        let elapsed = t_start.elapsed().as_millis() as u64;
        let child_pid = {
            let s = self.0.lock().unwrap_or_else(|e| e.into_inner());
            s.child.as_ref().map(|c| c.id())
        };
        log_local_model_timing(
            "SERVICE_START",
            elapsed,
            &format!("port={}, pid={:?}", port, child_pid),
        );

        Ok(self.status())
    }

    pub fn ensure_running(&self) -> Result<u16, String> {
        let s = self.0.lock().map_err(|e| e.to_string())?;
        if s.port > 0 && check_health(s.port) {
            return Ok(s.port);
        }
        drop(s);

        // Try restart up to 3 times (Gate A10 compliance)
        for attempt in 1..=3 {
            match self.start() {
                Ok(rep) if rep.healthy => {
                    let mut guard = self.0.lock().unwrap_or_else(|e| e.into_inner());
                    guard.crash_count = 0;
                    return Ok(rep.port);
                }
                Ok(_) => {}
                Err(e) => {
                    eprintln!("[llama] Tentativo avvio {}/3 fallito: {}", attempt, e);
                    if attempt == 3 {
                        return Err(format!("Riavvio automatico fallito dopo 3 tentativi: {}", e));
                    }
                    std::thread::sleep(Duration::from_millis(500));
                }
            }
        }
        Err("Impossibile avviare il servizio llama-server dopo 3 tentativi".into())
    }

    pub fn stop(&self) -> Result<LocalServerReport, String> {
        let mut s = self.0.lock().map_err(|e| e.to_string())?;
        stop_child(&mut s);
        s.last_error = None;
        drop(s);
        Ok(self.status())
    }
}


fn main() {
    let args:Vec<String>=std::env::args().collect();
    if args.iter().any(|x|x=="-m") {
        use std::io::{Read,Write};
        let p: u16=args[args.iter().position(|x|x=="--port").unwrap()+1].parse().unwrap();
        let listener=std::net::TcpListener::bind(("127.0.0.1",p)).unwrap();
        listener.set_nonblocking(true).unwrap();
        let fail_dimensions=std::env::var_os("AUDIT_FAIL_DIM").is_some();
        let deadline=Instant::now()+Duration::from_secs(if fail_dimensions {35} else {5});
        while Instant::now()<deadline {
            if let Ok((mut client,_))=listener.accept() {
                client.set_read_timeout(Some(Duration::from_millis(500))).unwrap();
                let mut buf=[0u8;2048];let n=client.read(&mut buf).unwrap_or(0);
                let request=String::from_utf8_lossy(&buf[..n]);
                let body=if request.starts_with("GET /health") {"{\"status\":\"ok\"}".to_string()}
                    else if fail_dimensions {"invalid-json".to_string()}
                    else {format!("{{\"data\":[{{\"embedding\":[{}]}}]}}",vec!["0";1024].join(","))};
                let response=format!("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",body.len(),body);
                let _=client.write_all(response.as_bytes());
            } else {std::thread::sleep(Duration::from_millis(5));}
        }
        return;
    }
    let external_port:u16=args[1].parse().unwrap();let external_pid=&args[2];
    let external_healthy=check_health(external_port);
    fs::write(pid_file_path().unwrap(),external_pid).unwrap();
    fs::write(port_file_path().unwrap(),external_port.to_string()).unwrap();
    let state=LlamaServerState::default();
    println!("FOREIGN_REGISTERED port={external_port} pid={external_pid} healthy={external_healthy}");
    println!("FRESH_APP_STATUS {:?}",state.status());
    if std::env::var_os("AUDIT_FAIL_DIM").is_some() {
        let starter=state.clone();let t=Instant::now();
        let worker=std::thread::spawn(move||starter.start());
        std::thread::sleep(Duration::from_secs(2));
        let own_port:u16=fs::read_to_string(port_file_path().unwrap()).unwrap().parse().unwrap();
        println!("DURING_START own_port={own_port} own_health={} mutex_busy={}",check_health(own_port),state.0.try_lock().is_err());
        let status_time=Instant::now();let status=state.status();
        println!("STATUS_UNBLOCKED_AFTER_MS={} report={status:?}",status_time.elapsed().as_millis());
        println!("START_FAILED_RESULT {:?} elapsed_ms={}",worker.join().unwrap(),t.elapsed().as_millis());
        println!("FOREIGN_STILL_HEALTHY {}",check_health(external_port));
        return;
    }
    let t=Instant::now();let result=state.start();println!("START_RESULT {result:?} elapsed_ms={}",t.elapsed().as_millis());
    println!("FILES_AFTER pid={} port={}",fs::read_to_string(pid_file_path().unwrap()).unwrap(),fs::read_to_string(port_file_path().unwrap()).unwrap());
    assert!(result.as_ref().unwrap().port!=external_port);
    println!("FOREIGN_STILL_HEALTHY {}",check_health(external_port));
    let mut child=state.0.lock().unwrap().child.take().unwrap();
    println!("OWN_HELPER_NATURAL_EXIT {:?}",child.wait().unwrap());
}

