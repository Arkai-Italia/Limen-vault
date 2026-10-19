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
