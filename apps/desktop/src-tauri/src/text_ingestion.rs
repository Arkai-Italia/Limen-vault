//! Incremental, strict UTF-8/UTF-16 decoding. I/O buffers are bounded; retained
//! passages necessarily grow with the indexed content (there is no silent cap).
use crate::catalog::{chunk_text_to_passages, DocumentPassage};
use encoding_rs::{DecoderResult, UTF_8};
use std::io::Read;

pub(crate) fn decode<R: Read>(mut input: R, mut emit: impl FnMut(&str) -> Result<(), String>) -> Result<(), String> {
    let mut decoder = UTF_8.new_decoder(); // BOM sniffing also recognizes UTF-16LE/BE.
    let mut bytes = [0u8; 64 * 1024];
    let mut text = String::with_capacity(256 * 1024);
    loop {
        let n = input.read(&mut bytes).map_err(|e| e.to_string())?;
        let mut offset = 0;
        loop {
            text.clear();
            let (status, consumed) = decoder.decode_to_string_without_replacement(&bytes[offset..n], &mut text, n == 0);
            offset += consumed;
            emit(&text)?;
            match status {
                DecoderResult::InputEmpty => break,
                DecoderResult::OutputFull => continue,
                DecoderResult::Malformed(_, _) => return Err("Codifica testo UTF-8/UTF-16 non valida o incompleta; originale conservato".into()),
            }
        }
        if n == 0 { return Ok(()); }
    }
}

pub(crate) fn passages<R: Read>(input: R, id: &str) -> Result<Vec<DocumentPassage>, String> {
    let mut pending = String::new();
    let mut result = Vec::new();
    let mut paragraph = 1usize;
    let mut append = |text: &str| {
        for mut p in chunk_text_to_passages(id, text) {
            p.passage_id = format!("{id}_p{}", result.len());
            if p.locator.starts_with("Paragraf") { p.locator = format!("Paragrafo {paragraph}"); }
            result.push(p);
        }
        paragraph += text.matches("\n\n").count().max(1);
    };
    decode(input, |text| {
        if text.contains('\0') { return Err("Documento privo di testo leggibile: contiene byte NUL; originale conservato".into()); }
        // A decoded block may end inside a paragraph or a multi-byte character.
        // Decoder state preserves characters; pending preserves paragraph text.
        pending.push_str(text);
        while pending.len() > 16 * 1024 {
            let boundary = pending.char_indices().take_while(|(i, _)| *i <= 8 * 1024)
                .filter(|(_, c)| c.is_whitespace()).last().map(|(i, c)| i + c.len_utf8())
                .unwrap_or_else(|| pending.char_indices().take_while(|(i, _)| *i <= 8 * 1024).last().unwrap().0);
            append(&pending[..boundary]);
            pending.drain(..boundary);
        }
        Ok(())
    })?;
    append(&pending);
    if result.is_empty() { return Err("Documento privo di testo leggibile".into()); }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn unicode_and_tail_survive_streaming() {
        let text = format!("{}é fine", "a".repeat(65535));
        let mut decoded = String::new();
        decode(text.as_bytes(), |part| { decoded.push_str(part); Ok(()) }).unwrap();
        assert_eq!(decoded, text);
        for little_endian in [true, false] {
            let text = "Caffè attività e 😀";
            let mut bytes = if little_endian { vec![0xff, 0xfe] } else { vec![0xfe, 0xff] };
            for unit in text.encode_utf16() { bytes.extend(if little_endian { unit.to_le_bytes() } else { unit.to_be_bytes() }); }
            let mut decoded = String::new();
            decode(bytes.as_slice(), |part| { decoded.push_str(part); Ok(()) }).unwrap();
            assert_eq!(decoded, text);
        }
        let source = format!("{}\nTAIL_SENTINEL", "Paragrafo completo.\n\n".repeat(10000));
        let all = passages(source.as_bytes(), "doc").unwrap();
        assert!(all.last().unwrap().text.contains("TAIL_SENTINEL"));
        assert!(decode(&[0xc3u8][..], |_| Ok(())).is_err());
    }
}
