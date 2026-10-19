#![allow(dead_code)]
pub fn sanitize_answer_prose(text: &str) -> String {
    use std::sync::OnceLock;
    static RE_CITATIONS: OnceLock<regex::Regex> = OnceLock::new();
    static RE_SPACE_PUNCT: OnceLock<regex::Regex> = OnceLock::new();
    static RE_MULTI_SPACE: OnceLock<regex::Regex> = OnceLock::new();
    static RE_EMPTY_PARENS: OnceLock<regex::Regex> = OnceLock::new();
    static RE_BULLET: OnceLock<regex::Regex> = OnceLock::new();
    static RE_BOLD: OnceLock<regex::Regex> = OnceLock::new();
    static RE_ITALIC: OnceLock<regex::Regex> = OnceLock::new();

    let re_citations = RE_CITATIONS.get_or_init(|| {
        regex::Regex::new(r"(?i)\[\s*S\d+\s*(?:[,;]\s*S\d+\s*)*\]|\(\s*S\d+\s*(?:[,;]\s*S\d+\s*)*\)").unwrap()
    });
    let re_bullet = RE_BULLET.get_or_init(|| {
        regex::Regex::new(r"(?m)^([ \t]*)\*[ \t]+").unwrap()
    });
    let re_bold = RE_BOLD.get_or_init(|| {
        regex::Regex::new(r"\*\*([^*]+)\*\*").unwrap()
    });
    let re_italic = RE_ITALIC.get_or_init(|| {
        regex::Regex::new(r"\*([^\s*](?:[^*\n]*?[^\s*])?)\*").unwrap()
    });
    let re_space_punct = RE_SPACE_PUNCT.get_or_init(|| {
        regex::Regex::new(r"[ \t]+([.,;:!?])").unwrap()
    });
    let re_multi_space = RE_MULTI_SPACE.get_or_init(|| {
        regex::Regex::new(r"[ \t]{2,}").unwrap()
    });
    let re_empty_parens = RE_EMPTY_PARENS.get_or_init(|| {
        regex::Regex::new(r"\(\s*\)|\[\s*\]").unwrap()
    });

    // 1. Rimuovi citazioni [S1], (S1), ecc.
    let step1 = re_citations.replace_all(text, "");

    // 2. Converte elenchi puntati con asterisco in trattini: "* elemento" -> "- elemento"
    let step2 = re_bullet.replace_all(&step1, "$1- ");

    // 3. Rimuove grassetti markdown con doppi asterischi: "**testo**" -> "testo"
    let mut step3 = step2.to_string();
    while re_bold.is_match(&step3) {
        step3 = re_bold.replace_all(&step3, "$1").to_string();
    }

    // 4. Rimuove corsivi markdown con singoli asterischi: "*testo*" -> "testo"
    while re_italic.is_match(&step3) {
        step3 = re_italic.replace_all(&step3, "$1").to_string();
    }

    // 5. Rimuove parentesi o quadre rimaste vuote (senza cancellare asterischi letterali come 2*3)
    let no_empty_parens = re_empty_parens.replace_all(&step3, "");

    let lines: Vec<String> = no_empty_parens
        .lines()
        .map(|line| {
            let p = re_space_punct.replace_all(line, "$1");
            let s = re_multi_space.replace_all(&p, " ");
            let trimmed_start = if s.starts_with(' ') && !s.starts_with("  ") {
                s.trim_start()
            } else {
                &s
            };
            trimmed_start.trim_end().to_string()
        })
        .collect();

    let mut res = lines.join("\n");
    if text.ends_with('\n') && !res.ends_with('\n') {
        res.push('\n');
    }
    res
}


#[derive(Debug, Default)]
pub struct StreamProseSanitizer {
    raw_buffer: String,
    clean_accumulated: String,
}

impl StreamProseSanitizer {
    pub fn new() -> Self {
        Self::default()
    }

    /// Determina la lunghezza del suffisso ambiguo da trattenere nel buffer scorrevole.
    pub fn ambiguous_suffix_len(s: &str) -> usize {
        let bytes = s.as_bytes();
        let len = bytes.len();
        if len == 0 {
            return 0;
        }

        // 1. Prefisso di citazione aperto: es. `[` senza `]` o `(` senza `)` (finestra fino a 30 caratteri)
        let check_window = len.saturating_sub(30);
        if let Some(pos) = s[check_window..].rfind(|c| c == '[' || c == '(') {
            let abs_pos = check_window + pos;
            let candidate_slice = &s[abs_pos..];
            let has_closing = candidate_slice.contains(']') || candidate_slice.contains(')');
            if !has_closing {
                let inside = &candidate_slice[1..];
                let is_citation_prefix = inside.chars().all(|c| {
                    c.is_ascii_whitespace() || c == 'S' || c == 's' || c.is_ascii_digit() || c == ',' || c == ';'
                });
                if is_citation_prefix {
                    return len - abs_pos;
                }
            }
        }

        // 2. Grassetto markdown `**` aperto (conteggio dispari nella finestra di 60 caratteri)
        let star_window = len.saturating_sub(60);
        let star_slice = &s[star_window..];
        let dstar_count = star_slice.matches("**").count();
        if dstar_count % 2 != 0 {
            if let Some(pos) = star_slice.rfind("**") {
                return len - (star_window + pos);
            }
        }

        // 3. Corsivo markdown `*` aperto (conteggio dispari escludendo `**`)
        let without_dstar = star_slice.replace("**", "");
        let single_star_count = without_dstar.chars().filter(|&c| c == '*').count();
        if single_star_count % 2 != 0 {
            if let Some(pos) = star_slice.rfind('*') {
                return len - (star_window + pos);
            }
        }

        0
    }

    /// Ingestiona un nuovo frammento grezzo di prosa, sanifica la porzione sicura ed emette solo il delta pulito.
    pub fn feed(&mut self, chunk: &str) -> String {
        self.raw_buffer.push_str(chunk);
        let suffix_len = Self::ambiguous_suffix_len(&self.raw_buffer);
        let safe_boundary = self.raw_buffer.len().saturating_sub(suffix_len);

        let mut char_safe_boundary = safe_boundary;
        while char_safe_boundary > 0 && !self.raw_buffer.is_char_boundary(char_safe_boundary) {
            char_safe_boundary -= 1;
        }

        let safe_raw = &self.raw_buffer[..char_safe_boundary];
        let sanitized = sanitize_answer_prose(safe_raw);

        if sanitized.len() > self.clean_accumulated.len() && sanitized.starts_with(&self.clean_accumulated) {
            let delta = sanitized[self.clean_accumulated.len()..].to_string();
            self.clean_accumulated = sanitized;
            delta
        } else if sanitized != self.clean_accumulated {
            let common_prefix_len = sanitized
                .chars()
                .zip(self.clean_accumulated.chars())
                .take_while(|(a, b)| a == b)
                .map(|(a, _)| a.len_utf8())
                .sum::<usize>();
            if sanitized.len() > common_prefix_len && common_prefix_len == self.clean_accumulated.len() {
                let delta = sanitized[self.clean_accumulated.len()..].to_string();
                self.clean_accumulated = sanitized;
                delta
            } else {
                String::new()
            }
        } else {
            String::new()
        }
    }

    /// Svuota l'eventuale residuo trattenuto nel buffer a fine stream.
    pub fn flush(&mut self) -> String {
        let sanitized = sanitize_answer_prose(&self.raw_buffer);
        if sanitized.len() > self.clean_accumulated.len() && sanitized.starts_with(&self.clean_accumulated) {
            let delta = sanitized[self.clean_accumulated.len()..].to_string();
            self.clean_accumulated = sanitized;
            delta
        } else if sanitized != self.clean_accumulated {
            let common_prefix_len = sanitized
                .chars()
                .zip(self.clean_accumulated.chars())
                .take_while(|(a, b)| a == b)
                .map(|(a, _)| a.len_utf8())
                .sum::<usize>();
            let delta = if sanitized.len() > common_prefix_len {
                sanitized[common_prefix_len..].to_string()
            } else {
                String::new()
            };
            self.clean_accumulated = sanitized;
            delta
        } else {
            String::new()
        }
    }

    pub fn get_accumulated(&self) -> &str {
        &self.clean_accumulated
    }
}

/// Parser incrementale per estrarre la stringa "answer" dal JSON di risposta OpenAI durante lo streaming,
/// decodificando in tempo reale le sequenze di escape JSON (\n, \", \uXXXX, ecc.).
#[derive(Debug, PartialEq, Eq)]
enum JsonParserState {
    SeekingKey,
    InAnswerString,
    FinishedAnswer,
}

#[derive(Debug)]
pub struct JsonStreamAnswerParser {
    state: JsonParserState,
    raw_buffer: String,
    in_escape: bool,
    in_unicode: bool,
    unicode_buffer: String,
}

impl Default for JsonStreamAnswerParser {
    fn default() -> Self {
        Self {
            state: JsonParserState::SeekingKey,
            raw_buffer: String::new(),
            in_escape: false,
            in_unicode: false,
            unicode_buffer: String::new(),
        }
    }
}

impl JsonStreamAnswerParser {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn feed(&mut self, chunk: &str) -> String {
        let mut emitted = String::new();
        let mut chars = chunk.chars().peekable();

        while let Some(c) = chars.next() {
            match self.state {
                JsonParserState::SeekingKey => {
                    self.raw_buffer.push(c);
                    if let Some(pos) = self.raw_buffer.find("\"answer\"") {
                        let after_key = &self.raw_buffer[pos + 8..];
                        if let Some(quote_pos) = after_key.find('"') {
                            let between = &after_key[..quote_pos];
                            if between.contains(':') {
                                self.state = JsonParserState::InAnswerString;
                                self.raw_buffer.clear();
                            }
                        }
                    }
                }
                JsonParserState::InAnswerString => {
                    if self.in_escape {
                        if self.in_unicode {
                            self.unicode_buffer.push(c);
                            if self.unicode_buffer.len() == 4 {
                                if let Ok(val) = u16::from_str_radix(&self.unicode_buffer, 16) {
                                    if let Some(ch) = char::from_u32(val as u32) {
                                        emitted.push(ch);
                                    }
                                }
                                self.in_escape = false;
                                self.in_unicode = false;
                                self.unicode_buffer.clear();
                            }
                        } else {
                            match c {
                                '"' => { emitted.push('"'); self.in_escape = false; }
                                '\\' => { emitted.push('\\'); self.in_escape = false; }
                                '/' => { emitted.push('/'); self.in_escape = false; }
                                'b' => { self.in_escape = false; }
                                'f' => { self.in_escape = false; }
                                'n' => { emitted.push('\n'); self.in_escape = false; }
                                'r' => { emitted.push('\r'); self.in_escape = false; }
                                't' => { emitted.push('\t'); self.in_escape = false; }
                                'u' => {
                                    self.in_unicode = true;
                                    self.unicode_buffer.clear();
                                }
                                other => {
                                    emitted.push(other);
                                    self.in_escape = false;
                                }
                            }
                        }
                    } else if c == '\\' {
                        self.in_escape = true;
                    } else if c == '"' {
                        self.state = JsonParserState::FinishedAnswer;
                    } else {
                        emitted.push(c);
                    }
                }
                JsonParserState::FinishedAnswer => {}
            }
        }
        emitted
    }

    pub fn is_finished(&self) -> bool {
        self.state == JsonParserState::FinishedAnswer
    }
}

/// Decodificatore incrementale per stream di byte di rete:
/// trattiene i byte di sequenze UTF-8 multibyte incomplete alla fine di un frammento,
/// garantendo che nessun carattere multibyte (es. "è", "à", "€", emoji) venga convertito
/// nel carattere di rimpiazzo ("") sui confini dei pacchetti di rete.
#[derive(Debug, Default)]
pub struct Utf8ChunkDecoder {
    buffer: Vec<u8>,
}

impl Utf8ChunkDecoder {
    pub fn new() -> Self {
        Self { buffer: Vec::new() }
    }

    pub fn decode(&mut self, chunk: &[u8]) -> String {
        self.buffer.extend_from_slice(chunk);
        let valid_len = match std::str::from_utf8(&self.buffer) {
            Ok(s) => s.len(),
            Err(e) => {
                if e.error_len().is_none() {
                    // Sequenza UTF-8 multibyte incompleta alla fine del buffer
                    e.valid_up_to()
                } else {
                    let valid_up_to = e.valid_up_to();
                    if valid_up_to > 0 {
                        valid_up_to
                    } else {
                        // Byte corrotto o non valido: consuma un byte per evitare deadlock
                        self.buffer.remove(0);
                        return "\u{FFFD}".to_string();
                    }
                }
            }
        };

        if valid_len > 0 {
            let valid_str = match std::str::from_utf8(&self.buffer[..valid_len]) {
                Ok(s) => s.to_string(),
                Err(_) => String::from_utf8_lossy(&self.buffer[..valid_len]).to_string(),
            };
            self.buffer.drain(..valid_len);
            valid_str
        } else {
            String::new()
        }
    }

    pub fn flush(&mut self) -> String {
        if self.buffer.is_empty() {
            String::new()
        } else {
            let s = String::from_utf8_lossy(&self.buffer).to_string();
            self.buffer.clear();
            s
        }
    }
}


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

