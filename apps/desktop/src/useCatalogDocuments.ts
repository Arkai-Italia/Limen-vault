import { useEffect, useState } from 'react';
import type { CatalogListOptions, CatalogListResponse, DocumentRecord } from './vault-ipc';

export function useCatalogDocuments(
  load: (path: string, options: CatalogListOptions) => Promise<CatalogListResponse>,
  path: string, enabled: boolean, revision: number, format: string, status: string, filter: string,
) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    setDocuments([]);
    setError(null);
    setLoading(enabled && !!path);
    if (!enabled || !path) return;
    const timer = setTimeout(async () => {
      try {
        const result = await load(path, {
          limit: 500,
          format: format === 'all' ? undefined : format,
          status: status === 'all' ? undefined : status,
          filter: filter.trim() || undefined,
        });
        if (live) setDocuments(result.documents);
      } catch (e) { if (live) setError(`Impossibile caricare i documenti: ${String(e)}`); }
      finally { if (live) setLoading(false); }
    }, 150);
    return () => { live = false; clearTimeout(timer); };
  }, [load, path, enabled, revision, format, status, filter]);
  return { documents, loading, error };
}
