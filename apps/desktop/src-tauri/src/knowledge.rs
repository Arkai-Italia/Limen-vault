//! Direct read-only browsing, independent of the search index and cloud services.
use crate::{snapshots::{root,child,names,compute_sha256},vault::{frontmatter,frontmatter_unvalidated}};
use cap_std::fs::{Dir,OpenOptions};
#[cfg(unix)]
use cap_std::fs::OpenOptionsExt;
use serde_json::{json,Value};
use std::{path::Path,io::Read};
const FOLDERS:[&str;10]=["01_CLIENTS","02_PROJECTS","03_BRANDS","04_POSITIONING","05_PACKAGING_KNOWLEDGE","06_METHODS","07_CASE_STUDIES","08_MARKET_RESEARCH","09_COMPETITORS","10_APPROVED_OUTPUTS"];
fn err(e:impl std::fmt::Display)->String{e.to_string()}
pub fn list(path:&Path,folder:&str)->Result<Vec<Value>,String>{
 if folder!="all"&&!FOLDERS.contains(&folder){return Err("Unsupported knowledge category".into())}
 let originals:std::collections::HashSet<String>=crate::catalog::load_catalog_arc(path)?.documents.values().filter(|d|crate::catalog::is_original(d)).map(|d|d.original_path.clone()).collect();
 let root=root(path)?;let mut items=Vec::new();let mut bytes=0;
 for f in FOLDERS.iter().filter(|f|folder=="all"||**f==folder){walk(&child(&root,f)?,f,0,&mut items,&mut bytes,&originals)?;}
 Ok(items)
}
fn walk(dir:&Dir,prefix:&str,depth:usize,items:&mut Vec<Value>,total:&mut usize,originals:&std::collections::HashSet<String>)->Result<(),String>{
 if depth>32{return Err("Knowledge directory depth limit".into())}
 for name in names(dir)?{if name.starts_with('.') {continue}let relative=format!("{prefix}/{name}");let meta=dir.symlink_metadata(&name).map_err(err)?;
 if meta.file_type().is_symlink(){return Err(format!("Symlink rejected: {relative}"))}
 if meta.is_dir(){walk(&child(dir,&name)?,&relative,depth+1,items,total,originals)?;continue}
 if !name.to_lowercase().ends_with(".md"){continue}if !meta.is_file()||meta.len()>512*1024||items.len()>=1000{return Err(format!("Invalid or oversized knowledge category: {relative}"))}
 let mut opts=OpenOptions::new();opts.read(true);
 #[cfg(unix)]{use std::os::unix::fs::OpenOptionsExt;opts.custom_flags(libc::O_NOFOLLOW|libc::O_NONBLOCK);}
 let mut file=dir.open_with(&name,&opts).map_err(err)?;
 let before=file.metadata().map_err(err)?;if !before.is_file(){return Err("Not a regular document".into())}
 let mut data=Vec::new();std::io::Read::by_ref(&mut file).take(512*1024+1).read_to_end(&mut data).map_err(err)?;
 let after=file.metadata().map_err(err)?;if data.len()>512*1024||before.len()!=after.len()||before.modified().map_err(err)?!=after.modified().map_err(err)?{return Err("Knowledge document changed during read".into())}
 *total+=data.len();if *total>8*1024*1024{return Err("Category preview exceeds 8 MiB".into())}let hash=compute_sha256(&data);let text=String::from_utf8(data).map_err(err)?;let parsed=if originals.contains(&relative){frontmatter_unvalidated(&text)}else{frontmatter(&text)};
 let (fm,metadata_warning)=match parsed {Ok(fm)=>(fm,None),Err(error)=>(None,Some(format!("{relative}: {error}")))};
 items.push(json!({"metadataWarning":metadata_warning,"relativePath":relative,"title":fm.as_ref().and_then(|f|f["title"].as_str()).unwrap_or(&name),"status":fm.as_ref().and_then(|f|f["status"].as_str()).unwrap_or("unspecified"),"sha256":hash,"automationKind":fm.as_ref().and_then(|f|f["automation_kind"].as_str()),"markdown":text}));
 }Ok(())
}
pub fn count_notes_by_category(path:&Path)->Result<std::collections::HashMap<String, usize>, String>{
 let root=root(path)?;let mut counts=std::collections::HashMap::new();
 for f in &FOLDERS {
  let mut count=0;
  if let Ok(dir)=child(&root, f) {
   count_walk(&dir, 0, &mut count)?;
  }
  counts.insert((*f).to_string(), count);
 }
 Ok(counts)
}
fn count_walk(dir:&Dir,depth:usize,count:&mut usize)->Result<(),String>{
 if depth>32{return Err("Knowledge directory depth limit".into())}
 for name in names(dir)?{
  if name.starts_with('.') {continue}
  let meta=match dir.symlink_metadata(&name){Ok(m)=>m,Err(_)=>continue};
  if meta.file_type().is_symlink(){continue}
  if meta.is_dir(){if let Ok(c)=child(dir,&name){count_walk(&c,depth+1,count)?;}continue}
  if name.to_lowercase().ends_with(".md")&&meta.is_file(){*count+=1;}
 }
 Ok(())
}
#[cfg(test)]mod tests{use super::*;use std::fs;
 #[test]fn actual_notes_without_index_and_no_mutations(){let t=tempfile::tempdir().unwrap();fs::create_dir_all(t.path().join("01_CLIENTS/nested")).unwrap();let p=t.path().join("01_CLIENTS/nested/note.md");let text="---\nschema_version: 1\nid: knowledge-test\ntitle: Aurora\ntype: client\nstatus: approved\ncreated_at: \"2026-09-12T00:00:00Z\"\nupdated_at: \"2026-09-12T00:00:00Z\"\ntags: []\nsource_ids: []\n---\nActual local note";fs::write(&p,text).unwrap();let rows=list(t.path(),"01_CLIENTS").unwrap();assert_eq!(rows.len(),1);assert_eq!(rows[0]["title"],"Aurora");assert_eq!(rows[0]["sha256"],compute_sha256(text.as_bytes()));assert_eq!(fs::read_to_string(p).unwrap(),text);assert!(!t.path().join("00_SYSTEM").exists());}
 #[test]fn symlink_and_oversized_notes_fail_explicitly(){let t=tempfile::tempdir().unwrap();fs::create_dir(t.path().join("01_CLIENTS")).unwrap();let p=t.path().join("01_CLIENTS/link.md");#[cfg(unix)]{std::os::unix::fs::symlink("/etc/passwd",&p).unwrap();assert!(list(t.path(),"01_CLIENTS").is_err());fs::remove_file(&p).unwrap();}fs::write(&p,vec![b'x';512*1024+1]).unwrap();assert!(list(t.path(),"01_CLIENTS").is_err());assert!(list(t.path(),"20_RAW_SOURCES").is_err());}
 #[test]fn test_count_notes_by_category(){
  let t=tempfile::tempdir().unwrap();
  fs::create_dir_all(t.path().join("01_CLIENTS/sub")).unwrap();
  fs::write(t.path().join("01_CLIENTS/c1.md"),"note 1").unwrap();
  fs::write(t.path().join("01_CLIENTS/sub/c2.md"),"note 2").unwrap();
  fs::write(t.path().join("01_CLIENTS/ignore.txt"),"ignore me").unwrap();
  fs::create_dir_all(t.path().join("02_PROJECTS")).unwrap();
  fs::write(t.path().join("02_PROJECTS/p1.md"),"proj 1").unwrap();
  fs::create_dir_all(t.path().join("03_BRANDS")).unwrap();

  let counts=count_notes_by_category(t.path()).unwrap();
  assert_eq!(counts.get("01_CLIENTS").copied().unwrap_or(0),2);
  assert_eq!(counts.get("02_PROJECTS").copied().unwrap_or(0),1);
  assert_eq!(counts.get("03_BRANDS").copied().unwrap_or(0),0);
  assert_eq!(counts.get("04_POSITIONING").copied().unwrap_or(0),0);
  assert_eq!(counts.len(),10);
 }
}

#[cfg(test)]
mod metadata_regressions {
 use super::*;
 use std::fs;
 #[test]
 fn organized_original_and_invalid_note_do_not_block_memory() {
  let t=tempfile::tempdir().unwrap();
  let template=Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../vault-template");
  crate::vault::create(t.path(),Some("Memory test".into()),&template).unwrap();
  let source="---\ntitle: Documento esterno\ncustom: value\n---\nContenuto originale";
  let imported=crate::automation::import(t.path(),"original.md",source.as_bytes()).unwrap();
  crate::catalog::sync_catalog(t.path()).unwrap();
  crate::catalog::process_pending_extractions(t.path()).unwrap();
  let doc=crate::catalog::get_document_by_path(t.path(),&imported).unwrap();
  let moved=crate::organization::move_document(t.path(),&doc.document_id,&doc.content_hash,"01_CLIENTS").unwrap();
  let bad="---\ntitle: Nota incompleta\n---\nContenuto recuperabile";
  fs::write(t.path().join("01_CLIENTS/bad.md"),bad).unwrap();
  fs::write(t.path().join("01_CLIENTS/broken.md"),"---\ntitle: [\n---\nTesto disponibile").unwrap();
  fs::write(t.path().join("01_CLIENTS/plain.md"),"Nota senza metadati").unwrap();
  let rows=list(t.path(),"all").unwrap();
  let original=rows.iter().find(|r|r["relativePath"]==moved.to).unwrap();
  assert_eq!(original["title"],"Documento esterno");
  assert!(original["metadataWarning"].is_null());
  assert_eq!(original["markdown"],source);
  let invalid=rows.iter().find(|r|r["relativePath"]=="01_CLIENTS/bad.md").unwrap();
  assert!(invalid["metadataWarning"].as_str().unwrap().contains("01_CLIENTS/bad.md"));
  assert_eq!(invalid["status"],"unspecified");
  assert_eq!(invalid["markdown"],bad);
  assert!(rows.iter().find(|r|r["relativePath"]=="01_CLIENTS/broken.md").unwrap()["metadataWarning"].as_str().unwrap().contains("Invalid YAML"));
  assert!(rows.iter().any(|r|r["relativePath"]=="01_CLIENTS/plain.md"));
  assert_eq!(fs::read_to_string(t.path().join(&moved.to)).unwrap(),source);
  assert_eq!(fs::read_to_string(t.path().join("01_CLIENTS/bad.md")).unwrap(),bad);
  assert_eq!(list(t.path(),"01_CLIENTS").unwrap().len(),count_notes_by_category(t.path()).unwrap()["01_CLIENTS"]);
 }
}
