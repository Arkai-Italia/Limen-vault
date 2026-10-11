import type { DocumentRecord } from './vault-ipc';
export interface MoveSummary { id: string; from: string; to: string; documentId: string }
export interface OrganizationPlan { documents: DocumentRecord[]; folders: string[]; lastMove: MoveSummary | null; destinations?: Record<string, string> }
export interface PendingDestination { document: DocumentRecord; reason: string }
export interface OrganizationApi {
  plan(path: string): Promise<OrganizationPlan>;
  classify(path: string, id: string, hash: string): Promise<{ category: string; certainty: string; evidence: string }>;
  move(path: string, id: string, hash: string, destination: string): Promise<MoveSummary>;
}
const folders: Record<string, string> = { client: '01_CLIENTS', project: '02_PROJECTS', brand: '03_BRANDS', positioning: '04_POSITIONING', packaging: '05_PACKAGING_KNOWLEDGE', method: '06_METHODS', case_study: '07_CASE_STUDIES', research: '08_MARKET_RESEARCH', competitor: '09_COMPETITORS' };
export async function organizeDocuments(api: OrganizationApi, path: string, choices: Record<string, string>, progress: (message: string) => void) {
  const plan = await api.plan(path);
  const pending: PendingDestination[] = [];
  const moved: MoveSummary[] = [];
  let providerError: string | null = null;
  for (const [i, doc] of plan.documents.entries()) {
    progress(`Organizzazione ${i + 1}/${plan.documents.length}: ${doc.fileName}`);
    try {
      let destination = choices[doc.documentId] || plan.destinations?.[doc.documentId];
      if (!destination) {
        if (doc.extractionStatus !== 'ready') throw new Error('Estrazione da completare; puoi scegliere la cartella manualmente.');
        if (providerError) throw new Error(providerError);
        let decision;
        try { decision = await api.classify(path, doc.documentId, doc.contentHash); }
        catch (e) { providerError = `Classificazione locale non disponibile: ${String(e)}. Scegli la cartella o configura il modello locale.`; throw new Error(providerError); }
        if (decision.certainty !== 'clear' || !folders[decision.category]) {
          pending.push({ document: doc, reason: 'Destinazione incerta: scegli la cartella.' }); continue;
        }
        destination = folders[decision.category];
      }
      if (!plan.folders.includes(destination) || (destination === '20_RAW_SOURCES' || destination.startsWith('20_RAW_SOURCES/'))) throw new Error('Seleziona una cartella di destinazione valida.');
      moved.push(await api.move(path, doc.documentId, doc.contentHash, destination));
    } catch (e) { pending.push({ document: doc, reason: String(e) }); }
  }
  return { pending, moved, folders: plan.folders.filter(f => f !== '20_RAW_SOURCES' && !f.startsWith('20_RAW_SOURCES/')), lastMove: moved.at(-1) || plan.lastMove };
}
