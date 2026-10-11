import assert from 'node:assert/strict';
import { activateLocalMode, LocalSetupRequired } from '../src/ai-mode';
import { runIndexing, type IndexingApi, type IndexingStatus } from '../src/indexing';

const full: IndexingStatus = { pendingDocuments: 0, attentionDocuments: 0, readyDocuments: 600, unauthorizedDocuments: 0, lexicalCurrent: true, missingPassages: 0, coverage: 1, complete: true };
const run = async (overrides: Partial<IndexingApi>) => {
  const progress: number[] = [];
  const result = await runIndexing({ extract: async () => 2, index: async () => ({}), vectors: async () => ({}), status: async () => full, ...overrides }, '/fixture', (_, percent) => progress.push(percent));
  return { result, progress };
};
assert.equal((await run({})).result.complete, true);
for (const stage of ['extract', 'index', 'vectors'] as const) {
  const { result, progress } = await run({ [stage]: async () => { throw new Error(stage); } });
  assert.equal(result.complete, false);
  assert.equal(result.errors.length, 1);
  assert.ok(!progress.includes(100));
}
for (const status of [
  { ...full, attentionDocuments: 1, complete: false },
  { ...full, pendingDocuments: 1, complete: false },
  { ...full, lexicalCurrent: false, complete: false },
  { ...full, missingPassages: 5, coverage: 0.75, complete: false },
]) {
  const { result, progress } = await run({ status: async () => status });
  assert.equal(result.complete, false);
  assert.ok(!progress.includes(100));
}
await assert.rejects(run({ status: async () => { throw new Error('status unavailable'); } }), /status unavailable/);

function localApi(overrides: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const api = {
    aiSetMode: async () => { calls.push('save'); return 'local_only'; },
    localLlmCatalog: async () => { calls.push('catalog'); return { models: [{ id: 'downloaded', displayName: 'Downloaded LLM', installed: true, sha256Ok: true, isActive: false }] }; },
    localModelStatus: async () => ({ installed: true, sha256Ok: true }),
    localLlmSetActive: async (id: string) => { calls.push(`select:${id}`); return id; },
    localServerStart: async () => { calls.push('search'); return { healthy: true }; },
    localLlmServerStart: async () => { calls.push('llm'); return { healthy: true }; },
    ...overrides,
  } as unknown as Parameters<typeof activateLocalMode>[0];
  return { api, calls };
}
{
  const { api, calls } = localApi();
  assert.equal((await activateLocalMode(api, '/fixture')).model, 'Downloaded LLM');
  assert.deepEqual(calls, ['save', 'catalog', 'select:downloaded', 'search', 'llm']);
}
{
  const { api, calls } = localApi({ aiSetMode: async () => { throw new Error('disk failure'); } });
  await assert.rejects(activateLocalMode(api, '/fixture'), /disk failure/);
  assert.deepEqual(calls, []);
}
{
  const { api } = localApi({ localLlmCatalog: async () => ({ models: [] }) });
  await assert.rejects(activateLocalMode(api, '/fixture'), e => e instanceof LocalSetupRequired && e.section === 'llm');
}
{
  const { api } = localApi({ localModelStatus: async () => ({ installed: false }) });
  await assert.rejects(activateLocalMode(api, '/fixture'), e => e instanceof LocalSetupRequired && e.section === 'semantic');
}
{
  const { api } = localApi({ localLlmServerStart: async () => ({ healthy: false, lastError: 'startup failed' }) });
  await assert.rejects(activateLocalMode(api, '/fixture'), /startup failed/);
}
console.log('PASS: production indexing flow (success, each failed stage, partial status, unreadable status); local activation (save ordering, downloaded model, missing prerequisites, startup failure).');


// Production orchestration: uncertain destinations never move; chosen folders bypass AI.
const { organizeDocuments } = await import('../src/organization');
const docs = ['a', 'b', 'c'].map(id => ({ documentId: id, fileName: `${id}.txt`, contentHash: `hash-${id}`, extractionStatus: 'ready' })) as import('../src/vault-ipc').DocumentRecord[];
{
  const calls: string[] = [];
  const api = {
    plan: async () => ({ documents: docs, folders: ['02_PROJECTS', '01_CLIENTS'], lastMove: null }),
    classify: async (_p: string, id: string) => { calls.push(`classify:${id}`); return { category: id === 'a' ? 'project' : 'uncertain', certainty: id === 'a' ? 'clear' : 'uncertain', evidence: 'text' }; },
    move: async (_p: string, id: string, _h: string, destination: string) => { calls.push(`move:${id}:${destination}`); return { id, documentId: id, from: '20_RAW_SOURCES/file', to: destination }; },
  };
  const result = await organizeDocuments(api, '/fixture', { c: '01_CLIENTS' }, () => {});
  assert.equal(result.pending.length, 1);
  assert.equal(result.pending[0].document.documentId, 'b');
  assert.equal(result.moved.length, 2);
  assert.deepEqual(calls, ['classify:a', 'move:a:02_PROJECTS', 'classify:b', 'move:c:01_CLIENTS']);
}
{
  let calls = 0;
  const result = await organizeDocuments({
    plan: async () => ({ documents: docs, folders: ['02_PROJECTS'], lastMove: null }),
    classify: async () => { calls++; throw new Error('No local model'); },
    move: async () => { throw new Error('Must not move'); },
  }, '/fixture', {}, () => {});
  assert.equal(calls, 1, 'Do not retry unavailable service for every file');
  assert.equal(result.pending.length, 3);
}
assert.equal((await run({ organize: async () => { throw new Error('Destination needed'); } })).result.complete, false);
console.log('PASS organization: clear vs uncertain, manual bypass, unavailable model stops repeated calls, incomplete status.');
