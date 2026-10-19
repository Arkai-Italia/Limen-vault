import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const base='E:/Projects/vault_memai_obsi/IMPLEMENTATION/AUDIT_OPENAI';const root=path.join(base,'evidenze_collaudo_fase5i');
const report=path.join(base,'2026-09-24_COLLAUDO_FASE5I.md');
const text=fs.readFileSync(report,'utf8');
const links=[...text.matchAll(/\]\((evidenze_collaudo_fase5i\/[^)]+)\)/g)].map(m=>m[1]);
const missing=links.filter(p=>!fs.existsSync(path.join(base,p)));if(missing.length)throw Error(JSON.stringify(missing));
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);}
const files=[report,...walk(root).filter(p=>!p.endsWith('SHA256SUMS.json'))];
const manifest=files.map(p=>({path:path.relative(base,p).replaceAll('\\','/'),bytes:fs.statSync(p).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}));
fs.writeFileSync(path.join(root,'SHA256SUMS.json'),JSON.stringify({at:new Date().toISOString(),files:manifest},null,2));
for(const f of manifest){const h=crypto.createHash('sha256').update(fs.readFileSync(path.join(base,f.path))).digest('hex');if(h!==f.sha256)throw Error('Changed '+f.path);}
console.log(JSON.stringify({report,linksChecked:links.length,filesHashed:manifest.length,totalBytes:manifest.reduce((a,f)=>a+f.bytes,0),verified:true}));
