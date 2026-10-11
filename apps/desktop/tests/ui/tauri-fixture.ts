export async function invoke<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  (window as any).__calls.push({ command, args });
  if (['vault_list_folders', 'vault_list_folder_files', 'vault_read_text', 'ai_get_mode', 'ai_set_mode'].includes(command)) {
    if (command === 'ai_set_mode' && (window as any).__failSave) throw new Error('Salvataggio modalità non riuscito');
    const r = await fetch('/native', { method: 'POST', body: JSON.stringify({ command, args }) });
    const data = await r.json();
    if (!data.ok) throw new Error(data.error);
    return data.value;
  }
  if (command === 'local_llm_catalog') return { models: [], activeModelId: '', physicalRamBytes: 0 } as T;
  if (command.endsWith('_server_status')) return { running: false, healthy: false } as T;
  if (command === 'local_llm_status') return { installed: false, sha256Ok: false, modelName: 'Ministral-3-3B-Instruct-2512-Q5_K_M.gguf', ramWarning: 'Memoria limitata per il test' } as T;
  if (command === 'ai_list_models') return ['gpt-4o'] as T;
  if (command === 'ai_get_selected_model') return 'gpt-4o' as T;
  if (command === 'ai_get_consent') return false as T;
  throw new Error(`Unexpected fixture command: ${command}`);
}
export async function listen() { return () => {}; }
export async function emit() {}

export function getCurrentWebview() {
  return { onDragDropEvent: async (handler: (event: unknown) => void) => {
    (window as any).__nativeDrop = handler;
    return () => { delete (window as any).__nativeDrop; };
  } };
}
