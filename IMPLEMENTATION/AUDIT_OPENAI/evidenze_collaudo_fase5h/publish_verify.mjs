import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const stage='E:/Projects/MEMAI_V_PRO_WORKSPACE/collaudo_fase5h';
const audit='E:/Projects/vault_memai_obsi/IMPLEMENTATION/AUDIT_OPENAI';
const evidence=path.join(audit,'evidenze_collaudo_fase5h');
const name='2026-09-24_COLLAUDO_FASE5H.md';
fs.copyFileSync(path.join(stage,name),path.join(audit,name));
for(const f of ['final_checks.ps1','publish_verify.mjs']) fs.copyFileSync(path.join(stage,f),path.join(evidence,f));
const cat=fs.readFileSync('E:/Projects/vault_memai_obsi_collaudo_6b04271/apps/desktop/src-tauri/src/catalog.rs','utf8');
fs.writeFileSync(path.join(evidence,'source_6b04271_catalog.rs.txt'),cat.split(/\r?\n/).map((l,i)=>`${i+1}: ${l}`).join('\n'));
const report=fs.readFileSync(path.join(audit,name),'utf8');
const links=[...report.matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]);
const missing=links.filter(l=>!fs.existsSync(path.resolve(audit,l)) && !l.endsWith('SHA256SUMS.txt'));
if(missing.length) throw Error('Missing links '+JSON.stringify(missing));
for(let i=1;i<=11;i++) if(!report.includes(`| C${String(i).padStart(2,'0')} |`)) throw Error('Missing case '+i);
const manifest=path.join(evidence,'SHA256SUMS.txt');
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const files=walk(evidence).filter(f=>f!==manifest).concat(path.join(audit,name)).sort();
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const rows=files.map(f=>`${hash(f)}  ${path.relative(evidence,f).replaceAll('\\','/')}`);
fs.writeFileSync(manifest,rows.join('\n')+'\n');
for(const row of fs.readFileSync(manifest,'utf8').trimEnd().split('\n')){
 const expected=row.slice(0,64), f=path.resolve(evidence,row.slice(66));
 if(hash(f)!==expected) throw Error('Manifest mismatch '+f);
}
console.log(JSON.stringify({report:path.join(audit,name),links:links.length,missingLinks:missing,manifestFiles:files.length,manifestVerified:true,reportSHA256:hash(path.join(audit,name))},null,2));
