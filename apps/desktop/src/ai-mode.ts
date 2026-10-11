import type { aiIpc } from './ai-ipc';
export type AiMode = 'local_only' | 'hybrid';
type LocalApi = Pick<typeof aiIpc, 'aiSetMode' | 'localLlmCatalog' | 'localLlmSetActive' | 'localLlmServerStart' | 'localModelStatus' | 'localServerStart'>;
export class LocalSetupRequired extends Error {
  constructor(public section: 'llm' | 'semantic', message: string) { super(message); }
}
export async function activateLocalMode(api: LocalApi, vaultPath: string) {
  // Persist the privacy boundary before starting services, and never ignore failure.
  await api.aiSetMode(vaultPath, 'local_only');
  const catalog = await api.localLlmCatalog();
  const installed = catalog.models.filter(m => m.installed && m.sha256Ok);
  const selected = installed.find(m => m.isActive) ?? installed[0];
  if (!selected) throw new LocalSetupRequired('llm', 'Scarica un modello linguistico locale per continuare.');
  const semantic = await api.localModelStatus();
  if (!semantic.installed || !semantic.sha256Ok) throw new LocalSetupRequired('semantic', 'Completa il modello di ricerca locale per continuare.');
  if (!selected.isActive) await api.localLlmSetActive(selected.id);
  const search = await api.localServerStart();
  if (!search.healthy) throw new Error(search.lastError || 'Il motore di ricerca locale non è pronto.');
  const llm = await api.localLlmServerStart();
  if (!llm.healthy) throw new Error(llm.lastError || 'Il modello linguistico locale non è pronto.');
  return { model: selected.displayName, server: llm };
}
