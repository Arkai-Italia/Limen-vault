fn main() {
    std::panic::set_hook(Box::new(|info|eprintln!("CAPTURED_PANIC {info}")));
    let inputs=["Il progetto BNXT è un’iniziativa già avviata, perché l’attività è utile. 😀🚀 [S1]", "èàìòù € 👨‍👩‍👧‍👦 **BNXT** (S2) conclusione.", "È un progetto con città e qualità. ".repeat(8).leak()];
    let mut cases=0;let mut panics=0;
    for input in inputs {
        for size in 1..=80 {
            cases+=1;
            let result=std::panic::catch_unwind(||{
                let mut d=Utf8ChunkDecoder::new();let mut s=StreamProseSanitizer::new();
                let mut decoded=String::new();
                for bytes in input.as_bytes().chunks(size){let part=d.decode(bytes);decoded.push_str(&part);s.feed(&part);}
                let part=d.flush();decoded.push_str(&part);s.feed(&part);s.flush();
                assert_eq!(decoded,input);
            });
            if result.is_err(){panics+=1;}
        }
    }
    println!("sanitizer_decoder_cases={cases} panics={panics}");
    for (name,json,expected) in [
        ("literal_emoji",r#"{"answer":"È già città 😀🚀","citation_ids":[]}"#,"È già città 😀🚀"),
        ("escaped_emoji",r#"{"answer":"\u00c8 gi\u00e0 citt\u00e0 \ud83d\ude00","citation_ids":[]}"#,"È già città 😀"),
    ] {
        let mut mismatches=0;let mut parser_panics=0;let mut observed=String::new();
        for size in 1..=80 {
            let result=std::panic::catch_unwind(||{
                let mut d=Utf8ChunkDecoder::new();let mut p=JsonStreamAnswerParser::new();let mut out=String::new();
                for bytes in json.as_bytes().chunks(size){out.push_str(&p.feed(&d.decode(bytes)));}
                out.push_str(&p.feed(&d.flush()));out
            });
            match result {Ok(out)=>{if out!=expected {mismatches+=1;}observed=out;},Err(_)=>parser_panics+=1}
        }
        println!("parser_case={name} chunks=1..80 panics={parser_panics} mismatches={mismatches} output={observed:?}");
    }
}
