import { useEffect, useRef } from 'react';
import { getCurrentWebview } from '@tauri-apps/api/webview';

export function useNativeFileDrop(enabled: boolean, onDrop: (paths: string[], destination?: string) => Promise<void>, onHover: (active: boolean) => void, onError: (message: string) => void) {
  const handlers = useRef({ onDrop, onHover, onError });
  useEffect(() => { handlers.current = { onDrop, onHover, onError }; });
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let unlisten: (() => void) | undefined;
    getCurrentWebview().onDragDropEvent(({ payload }) => {
      if (disposed) return;
      handlers.current.onHover(payload.type === 'enter' || payload.type === 'over');
      if (payload.type === 'drop' && payload.paths.length) {
        const scale = window.devicePixelRatio || 1;
        const target = document.elementFromPoint(payload.position.x / scale, payload.position.y / scale)?.closest<HTMLElement>('[data-vault-drop-folder]');
        const destination = target?.dataset.vaultDropFolder;
        void handlers.current.onDrop(payload.paths, destination).catch(e => handlers.current.onError(String(e)));
      }
    }).then(stop => { if (disposed) stop(); else unlisten = stop; })
      .catch(e => { if (!disposed) handlers.current.onError(`Trascinamento non disponibile: ${String(e)}`); });
    return () => { disposed = true; unlisten?.(); handlers.current.onHover(false); };
  }, [enabled]);
}
