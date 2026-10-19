import fs from 'node:fs';import path from 'node:path';
const root='E:/Projects/vault_memai_obsi/IMPLEMENTATION/AUDIT_OPENAI/evidenze_collaudo_fase5i';
const dir=path.join(root,'monitor');
const files=fs.readdirSync(dir).filter(n=>/^catalog_\d+\.json$/.test(n)).sort();
function diff(a,b,p='',out=[]){
 if(JSON.stringify(a)===JSON.stringify(b))return out;
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
  for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],p+'/'+k,out);
 }else out.push({path:p,before:a,after:b});return out;
}
const result=[];
for(let i=1;i<files.length;i++){
 const a=JSON.parse(fs.readFileSync(path.join(dir,files[i-1]),'utf8'));
 const b=JSON.parse(fs.readFileSync(path.join(dir,files[i]),'utf8'));
 const delta=diff(a,b); result.push({from:files[i-1],to:files[i],changes:delta});
}
fs.writeFileSync(path.join(root,'catalog_deltas.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result.map(r=>({...r,changes:r.changes.slice(0,12),count:r.changes.length})),null,2));
