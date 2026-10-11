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
