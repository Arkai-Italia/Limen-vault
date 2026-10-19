import fs from 'node:fs';
import path from 'node:path';
const stage='E:/Projects/MEMAI_V_PRO_WORKSPACE/collaudo_fase5h';
const base='E:/Projects/vault_memai_obsi/IMPLEMENTATION/AUDIT_OPENAI/evidenze_collaudo_fase5h';
for(const f of fs.readdirSync(stage)){if(fs.statSync(path.join(stage,f)).isFile())fs.copyFileSync(path.join(stage,f),path.join(base,f));}
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
for(const f of ['ask_timing.log','local_model_timing.log']){
 const before=read(path.join(base,'SESSION_before',f)),after=read(path.join(base,'SESSION_after',f));
 if(!after.startsWith(before))throw Error('Log is not append only: '+f);
 fs.writeFileSync(path.join(base,'SESSION_new_'+f),after.slice(before.length));
}
const entries=read(path.join(base,'SESSION_new_ask_timing.log')).split(/\r?\n/).filter(s=>s.startsWith('JSON: ')).map(s=>JSON.parse(s.slice(6)));
const responses=entries.filter(e=>e.preview&&Array.isArray(e.sources));
const cases=['C01_fallback','C01_manual_ready','C02','C05','C06','C03','C04','C01R','C01R2','C07R','C08'];
if(responses.length!==cases.length)throw Error('Unexpected response count '+responses.length);
const queries=responses.map((e,i)=>({case:cases[i],...e,preview_record:entries.find(p=>p.event==='preview_preparation'&&p.timings.tPreviewTotalMs===e.preview.total_ms&&Math.abs(Date.parse(p.timestamp)-Date.parse(e.timestamp))<5000)}));
fs.writeFileSync(path.join(base,'queries_full.json'),JSON.stringify(queries,null,2));
const header=['case','UTC+8','UI_telemetry_ms','preview_ms','service_ms','embed_ms','semantic_search_ms','admission_ms','sources','semantic','pid','port'];
const rows=queries.map(q=>[q.case,new Date(Date.parse(q.timestamp)+8*3600000).toISOString().replace('Z','+08:00'),q.t_ui_total_ms,q.preview.total_ms,q.preview.service_prep_ms,q.preview.embed_ms,q.preview.search_sem_ms,q.preview.search_admit_ms,q.sources.length,q.semanticUsed,q.pid??'',q.port??'']);
fs.writeFileSync(path.join(base,'query_metrics.csv'),[header,...rows].map(r=>r.join(',')).join('\n')+'\n');
const snapshots=[];
for(const d of fs.readdirSync(base)){
 const s=path.join(base,d,'state.json');if(!fs.existsSync(s))continue;
 const obj=JSON.parse(read(s));const val=f=>fs.existsSync(path.join(base,d,f))?read(path.join(base,d,f)).trim():'ABSENT';
 snapshots.push({folder:d,at:obj.At,case:obj.Case,phase:obj.Phase,sha:obj.SHA,exeHash:obj.ExeHash,processes:obj.Processes,pidFile:val('llama-server.pid'),portFile:val('llama-server.port'),perRunLogs:obj.PerRunLogs.length});
}
fs.writeFileSync(path.join(base,'snapshot_inventory.json'),JSON.stringify(snapshots,null,2));
const obs=JSON.parse(read(path.join(base,'C08_observations.json')));
const trace=obs.observations.map(o=>({at:o.at,ms:o.ms,preparing:o.tree.includes('Selezione passaggi pertinenti'),sources:o.tree.includes('Fonti consultate dal Vault per questa domanda')}));
fs.writeFileSync(path.join(base,'C08_observation_summary.json'),JSON.stringify({started:obs.started,trace},null,2));
const md=['# Registro delle domande native','', 'I tempi UI sono telemetria del prodotto; non sono tempi letti da un contatore visibile. C08 dispone anche di osservazione esterna campionata.','', '| Caso | Ora UTC+8 | UI ms | Preview ms | Servizio ms | Embedding ms | Semantica ms | Ammissibilità ms | Fonti | Semantica | PID | Porta |','|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|',...rows.map(r=>'| '+r.join(' | ')+' |')];
for(const q of queries){md.push('',`## ${q.case}`,'',`Stato servizio: **${q.preview_record?.serviceStatus??'non registrato'}**. Motivo: ${q.semanticFallbackReason??'nessun ripiego'}.`,'',...q.sources.map(s=>`- ${s.relative_path} — ${s.locator}`));}
fs.writeFileSync(path.join(base,'QUERY_LEDGER.md'),md.join('\n')+'\n');
console.log(JSON.stringify({queries:queries.length,snapshots:snapshots.length,trace:trace.slice(-2)},null,2));
