export interface IndexingStatus {
  pendingDocuments: number;
  attentionDocuments: number;
  readyDocuments: number;
  unauthorizedDocuments: number;
  lexicalCurrent: boolean;
  missingPassages: number;
  coverage: number;
  complete: boolean;
}
export interface IndexingApi {
  extract(path: string): Promise<number>;
  organize?(path: string): Promise<void>;
  index(path: string): Promise<unknown>;
  vectors(path: string): Promise<unknown>;
  status(path: string): Promise<IndexingStatus>;
}
export async function runIndexing(api: IndexingApi, path: string, progress: (phase: string, percent: number) => void) {
  const errors: string[] = [];
  let documents = 0;
  progress('Estrazione dei documenti…', 10);
  try { documents = await api.extract(path); } catch (e) { errors.push(`Estrazione: ${String(e)}`); }
  if (api.organize) {
    progress('Organizzazione dei documenti…', 30);
    try { await api.organize(path); } catch (e) { errors.push(`Organizzazione: ${String(e)}`); }
  }
  progress('Aggiornamento della ricerca testuale…', 65);
  try { await api.index(path); } catch (e) { errors.push(`Indice testuale: ${String(e)}`); }
  progress('Aggiornamento della ricerca semantica…', 75);
  try { await api.vectors(path); } catch (e) { errors.push(`Ricerca semantica: ${String(e)}`); }
  // A failed status read is never interpreted as completion.
  const status = await api.status(path);
  const complete = status.complete && errors.length === 0;
  progress(complete ? 'Indicizzazione completata' : 'Elaborazione parziale: verifica i dettagli', complete ? 100 : 90);
  return { status, complete, documents, errors };
}
