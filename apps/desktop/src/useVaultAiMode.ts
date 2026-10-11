import { useCallback, useEffect, useState } from 'react';
import { aiIpc } from './ai-ipc';
import type { AiMode } from './ai-mode';
const EVENT = 'limen-vault-ai-mode';
export function useVaultAiMode(vaultPath: string | null) {
  const [state, setState] = useState<{ path: string | null; mode: AiMode; ready: boolean; error: string | null }>({ path: null, mode: 'local_only', ready: false, error: null });
  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = async () => {
      if (!vaultPath) return;
      const ticket = revision;
      try {
        const mode = await aiIpc.aiGetMode(vaultPath);
        if (active && ticket === revision) setState({ path: vaultPath, mode, ready: true, error: null });
      } catch (e) {
        if (active && ticket === revision) setState({ path: vaultPath, mode: 'local_only', ready: false, error: String(e) });
      }
    };
    const changed = (event: Event) => {
      const detail = (event as CustomEvent<{ path: string; mode: AiMode }>).detail;
      if (detail.path === vaultPath) { revision += 1; setState({ path: vaultPath, mode: detail.mode, ready: true, error: null }); }
    };
    window.addEventListener(EVENT, changed);
    void refresh();
    return () => { active = false; window.removeEventListener(EVENT, changed); };
  }, [vaultPath]);
  const setMode = useCallback(async (mode: AiMode) => {
    if (!vaultPath) throw new Error('Seleziona prima un vault.');
    const saved = await aiIpc.aiSetMode(vaultPath, mode);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { path: vaultPath, mode: saved } }));
    return saved;
  }, [vaultPath]);
  return { mode: state.path === vaultPath ? state.mode : 'local_only' as AiMode, ready: state.path === vaultPath && state.ready, error: state.path === vaultPath ? state.error : null, setMode };
}
