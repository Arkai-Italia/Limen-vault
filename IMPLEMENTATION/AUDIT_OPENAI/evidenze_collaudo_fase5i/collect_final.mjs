import fs from 'node:fs';import path from 'node:path';
const root='E:/Projects/vault_memai_obsi/IMPLEMENTATION/AUDIT_OPENAI/evidenze_collaudo_fase5i';
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const out=(p,v)=>fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2));
for(const name of ['ask_timing.log','local_model_timing.log']){
 const a=fs.readFileSync(path.join(root,'SESSION_before',name));const b=fs.readFileSync(path.join(root,'SESSION_after',name));
 if(!b.subarray(0,a.length).equals(a))throw Error('Log prefix differs '+name);
 fs.writeFileSync(path.join(root,'delta_'+name),b.subarray(a.length));
}
const queries=read('delta_ask_timing.log').split(/\r?\n/).filter(s=>s.startsWith('JSON: ')).map(s=>JSON.parse(s.slice(6)));
out('queries.json',queries);
console.log(JSON.stringify(queries.filter(q=>q.sources).map(q=>({timestamp:q.timestamp,preview:q.preview,ui:q.t_ui_total_ms,pid:q.pid,semantic:q.semanticUsed,fallback:q.semanticFallbackReason,sources:q.sources.length})),null,2));
const before=JSON.parse(read('SESSION_before/state.json'));const after=JSON.parse(read('SESSION_after/state.json'));
out('integrity_comparison.json',{model:before.Models.filter(x=>x.Path.endsWith('.gguf')).map(a=>({before:a,after:after.Models.find(b=>b.Path===a.Path)})),settings:{before:before.Shared.find(x=>x.Path.endsWith('ai_settings.json')),after:after.Shared.find(x=>x.Path.endsWith('ai_settings.json'))},catalog:{before:before.Catalog,after:after.Catalog}});
out('snapshot_inventory.json',fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&fs.existsSync(path.join(root,d.name,'state.json'))).map(d=>({folder:d.name,...JSON.parse(read(d.name+'/state.json'))})).map(({folder,Started,Completed,Processes,Shared,Catalog})=>({folder,Started,Completed,Processes,Shared,Catalog})));
