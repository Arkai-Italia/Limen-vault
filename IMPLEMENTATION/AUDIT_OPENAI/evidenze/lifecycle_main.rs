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
