import {invoke} from '@tauri-apps/api/core';

export interface ConversationTurn {
  question: string;
  answer: string;
}

export interface AiOptions {
  prompt: string;
  model: string;
  includeDrafts: boolean;
  sourceIds: string[];
  category?: string;
  client?: string;
  project?: string;
  tags?: string[];
  conversationId?: string;
  turnIndex?: number;
  parentEntryId?: string;
  previousTurns?: ConversationTurn[];
  previousQuestion?: string;
  mode?: 'hybrid' | 'local_only';
}
export interface AiSource {documentId:string;relativePath:string;title:string;category:string;status?:string;sha256:string;content:string;locator?:string;passageId?:string;revision?:number;passageHashes?:[string,string][]}
export interface AiPreview {
  ticket: string;
  sources: AiSource[];
  contextBytes: number;
  semanticUsed?: boolean;
  semanticFallbackReason?: string;
}
export interface AiAnswer {
  answer: string;
  provider: string;
  model: string;
  status?: string;
  incomplete?: boolean;
  incompleteReason?: string;
  warning?: string;
  citations: Omit<AiSource, 'content'>[];
  citedIndices?: number[];
  tokensUsed?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
  tokensReasoning?: number;
  uiTotalMs?: number;
  semanticUsed?: boolean;
  semanticFallbackReason?: string;
  historyEntryId?: string;
  conversationId?: string;
  turnIndex?: number;
}

export interface AiStreamChunkPayload {
  ticket: string;
  delta: string;
  fullText: string;
}

export interface AiStreamEndPayload {
  ticket: string;
  answer: string;
  citations: Omit<AiSource, 'content'>[];
  citedIndices?: number[];
  status: string;
  incomplete?: boolean;
  incompleteReason?: string;
  warning?: string;
  error?: string;
  cancelled?: boolean;
  tokensUsed?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
  tokensReasoning?: number;
  semanticUsed?: boolean;
  semanticFallbackReason?: string;
  historyEntryId?: string;
  conversationId?: string;
  turnIndex?: number;
}

export interface EmbeddingsProviderReport {
  provider: 'local' | 'openai';
  model: string;
  dimensions: number;
  endpoint: string;
  cacheDimensions: number;
  cacheEntries: number;
  totalPassages: number;
  matchedPassages: number;
  needsReindex: boolean;
}

export interface LocalModelReport {
  installed: boolean;
  path: string;
  bytes: number;
  sha256Ok: boolean;
  modelName?: string;
  physicalRamBytes?: number;
  ramWarning?: string | null;
}

export interface LocalServerReport {
  running: boolean;
  port: number;
  model: string;
  healthy: boolean;
  lastError: string | null;
  starting?: boolean;
  pid?: number;
  physicalRamBytes?: number;
  ramWarning?: string | null;
}

export interface LocalModelProgress {
  modelId?: string;
  downloaded: number;
  total: number;
  percent: number;
}

export interface LocalModelCatalogEntry {
  id: string;
  displayName: string;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  downloadUrl: string;
  minRamGb: number;
  recommendedHardware: string;
  description: string;
  isReasoning: boolean;
  installed: boolean;
  path: string;
  currentBytes: number;
  sha256Ok: boolean;
  isActive: boolean;
}

export interface LocalCatalogReport {
  models: LocalModelCatalogEntry[];
  activeModelId: string;
  physicalRamBytes: number;
  ramWarning?: string | null;
}

let mockProvider: EmbeddingsProviderReport = {
  provider: 'local',
  model: 'bge-m3',
  dimensions: 1024,
  endpoint: 'http://127.0.0.1:57471/v1/embeddings',
  cacheDimensions: 1024,
  cacheEntries: 9458,
  totalPassages: 9458,
  matchedPassages: 9458,
  needsReindex: false,
};

let mockModel: LocalModelReport = {
  installed: true,
  path: '/Users/cesare/Library/Application Support/LIMEN Vault/models/bge-m3-Q8_0.gguf',
  bytes: 634553760,
  sha256Ok: true,
};

let mockServer: LocalServerReport = {
  running: true,
  port: 57471,
  model: 'bge-m3-Q8_0.gguf',
  healthy: true,
  lastError: null,
};

let mockLlmModel: LocalModelReport = {
  installed: true,
  path: '/Users/cesare/Library/Application Support/LIMEN Vault/models/Ministral-3-8B-Instruct-2512-Q5_K_M.gguf',
  bytes: 6059268512,
  sha256Ok: true,
};

let mockLlmServer: LocalServerReport = {
  running: true,
  port: 58921,
  model: 'Ministral-3-8B-Instruct-2512-Q5_K_M.gguf',
  healthy: true,
  lastError: null,
};

let mockCatalog: LocalCatalogReport = {
  activeModelId: 'ministral-8b',
  physicalRamBytes: 17179869184,
  ramWarning: null,
  models: [
    {
      id: 'ministral-3b',
      displayName: 'Ministral 3 3B Instruct',
      fileName: 'Ministral-3-3B-Instruct-2512-Q5_K_M.gguf',
      sizeBytes: 2474178720,
      sha256: 'e23dd88b0e0951d3f5784d6d4092210cda2b006b251f33b226b283a6c9d1f6bb',
      downloadUrl: 'https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-GGUF/resolve/main/Ministral-3-3B-Instruct-2512-Q5_K_M.gguf',
      minRamGb: 8,
      recommendedHardware: 'Mac 8 GB RAM / Consumi minimi',
      description: 'Ultra-compatto e veloce, ottimizzato per Mac con 8 GB di memoria unificata.',
      isReasoning: false,
      installed: false,
      path: '',
      currentBytes: 0,
      sha256Ok: false,
      isActive: false,
    },
    {
      id: 'ministral-8b',
      displayName: 'Ministral 3 8B Instruct',
      fileName: 'Ministral-3-8B-Instruct-2512-Q5_K_M.gguf',
      sizeBytes: 6059268512,
      sha256: '7a5454127ec772e2389f0e71a77fedb88b83d4366d8a69facd0cfd0898f04d35',
      downloadUrl: 'https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-GGUF/resolve/main/Ministral-3-8B-Instruct-2512-Q5_K_M.gguf',
      minRamGb: 16,
      recommendedHardware: 'Mac 16 GB+ / GPU 8-12 GB',
      description: 'Massima naturalezza espressiva e comprensione del testo in italiano.',
      isReasoning: false,
      installed: true,
      path: '/Users/cesare/Library/Application Support/LIMEN Vault/models/Ministral-3-8B-Instruct-2512-Q5_K_M.gguf',
      currentBytes: 6059268512,
      sha256Ok: true,
      isActive: true,
    },
    {
      id: 'qwen-2.5-7b',
      displayName: 'Qwen 2.5 7B Instruct',
      fileName: 'Qwen2.5-7B-Instruct-Q4_K_M.gguf',
      sizeBytes: 4683074240,
      sha256: '65b8fcd92af6b4fefa935c625d1ac27ea29dcb6ee14589c55a8f115ceaaa1423',
      downloadUrl: 'https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf',
      minRamGb: 16,
      recommendedHardware: 'Mac 16 GB+ / GPU 8 GB VRAM',
      description: 'Eccezionale per estrazione dati da note, tabelle, sintassi Markdown e risposte strutturate.',
      isReasoning: false,
      installed: false,
      path: '',
      currentBytes: 0,
      sha256Ok: false,
      isActive: false,
    },
    {
      id: 'llama-3.1-8b',
      displayName: 'Llama 3.1 8B Instruct (Meta)',
      fileName: 'Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
      sizeBytes: 4920739232,
      sha256: '7b064f5842bf9532c91456deda288a1b672397a54fa729aa665952863033557c',
      downloadUrl: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
      minRamGb: 16,
      recommendedHardware: 'Mac 16 GB+ / GPU 8 GB VRAM',
      description: 'Lo standard globale open-weight: grande fedeltà alle istruzioni di sistema e RAG.',
      isReasoning: false,
      installed: false,
      path: '',
      currentBytes: 0,
      sha256Ok: false,
      isActive: false,
    },
    {
      id: 'deepseek-r1-7b',
      displayName: 'DeepSeek-R1-Distill-Qwen-7B',
      fileName: 'DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf',
      sizeBytes: 4683073248,
      sha256: '78272d8d32084548bd450394a560eb2d70de8232ab96a725769b1f9171235c1c',
      downloadUrl: 'https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-7B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf',
      minRamGb: 16,
      recommendedHardware: 'Mac 16 GB+ / GPU 8 GB VRAM',
      description: 'Modello di ragionamento analitico: formula il pensiero logico (<think>) prima di rispondere.',
      isReasoning: true,
      installed: false,
      path: '',
      currentBytes: 0,
      sha256Ok: false,
      isActive: false,
    },
    {
      id: 'deepseek-r1-14b',
      displayName: 'DeepSeek-R1-Distill-Qwen-14B',
      fileName: 'DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf',
      sizeBytes: 8988109984,
      sha256: '67a7933cf2ad596a393c8e13b30bc4da2d50b283e250b78554aed18817eca31c',
      downloadUrl: 'https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-14B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf',
      minRamGb: 24,
      recommendedHardware: 'Mac 24-36 GB+ / GPU 12 GB VRAM (es. RTX 3060)',
      description: 'Ragionamento avanzato e correlazione profonda di concetti. Richiede GPU 12 GB o Mac 24 GB+.',
      isReasoning: true,
      installed: false,
      path: '',
      currentBytes: 0,
      sha256Ok: false,
      isActive: false,
    },
  ],
};

let mockConsent = true;
const mockAiModes = new Map<string, 'local_only' | 'hybrid'>();

async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!('__TAURI_INTERNALS__' in window)) {
    // Browser preview fallback mode for headless verification / screenshot capture
    if (command === 'ai_get_mode') return (mockAiModes.get(String(args?.vaultPath)) ?? 'local_only') as T;
    if (command === 'ai_set_mode') { mockAiModes.set(String(args?.vaultPath), args?.mode as 'local_only' | 'hybrid'); return args?.mode as T; }
    if (command === 'ai_get_consent') return mockConsent as unknown as T;
    if (command === 'ai_set_consent') {
      mockConsent = Boolean(args?.granted);
      return undefined as unknown as T;
    }
    if (command === 'embeddings_get_provider') return mockProvider as unknown as T;
    if (command === 'embeddings_set_provider') {
      const p = (args?.provider as 'local' | 'openai') ?? 'local';
      mockProvider = {
        ...mockProvider,
        provider: p,
        dimensions: p === 'local' ? 1024 : 1536,
        endpoint: p === 'local' ? (mockServer.running ? `http://127.0.0.1:${mockServer.port}/v1/embeddings` : '') : 'https://api.openai.com/v1/embeddings',
      };
      return mockProvider as unknown as T;
    }
    if (command === 'local_model_status' || command === 'local_model_verify_integrity') return mockModel as unknown as T;
    if (command === 'local_server_status') return mockServer as unknown as T;
    if (command === 'local_server_start') {
      mockServer = { running: true, port: 57471, model: 'bge-m3-Q8_0.gguf', healthy: true, lastError: null };
      mockProvider.endpoint = 'http://127.0.0.1:57471/v1/embeddings';
      return mockServer as unknown as T;
    }
    if (command === 'local_server_stop') {
      mockServer = { running: false, port: 0, model: 'bge-m3-Q8_0.gguf', healthy: false, lastError: null };
      mockProvider.endpoint = '';
      return mockServer as unknown as T;
    }
    if (command === 'local_llm_status' || command === 'local_llm_verify_integrity') return mockLlmModel as unknown as T;
    if (command === 'local_llm_server_status') return mockLlmServer as unknown as T;
    if (command === 'local_llm_server_start') {
      mockLlmServer = { running: true, port: 58921, model: mockCatalog.activeModelId, healthy: true, lastError: null };
      return mockLlmServer as unknown as T;
    }
    if (command === 'local_llm_server_stop') {
      mockLlmServer = { running: false, port: 0, model: mockCatalog.activeModelId, healthy: false, lastError: null };
      return mockLlmServer as unknown as T;
    }
    if (command === 'local_llm_catalog') {
      return mockCatalog as unknown as T;
    }
    if (command === 'local_llm_set_active') {
      const mid = String((args as any)?.modelId || 'ministral-8b');
      mockCatalog.activeModelId = mid;
      mockCatalog.models.forEach((m) => {
        m.isActive = m.id === mid;
      });
      const chosen = mockCatalog.models.find((m) => m.id === mid);
      if (chosen) {
        mockLlmModel.modelName = chosen.fileName;
        mockLlmServer.model = chosen.fileName;
      }
      return mid as unknown as T;
    }
    if (command === 'local_llm_download_model') {
      const mid = String((args as any)?.modelId || 'ministral-8b');
      const chosen = mockCatalog.models.find((m) => m.id === mid);
      if (chosen) {
        chosen.installed = true;
        chosen.sha256Ok = true;
        chosen.currentBytes = chosen.sizeBytes;
      }
      return mockLlmModel as unknown as T;
    }
    if (command === 'local_llm_verify_model_integrity') {
      const mid = String((args as any)?.modelId || 'ministral-8b');
      const chosen = mockCatalog.models.find((m) => m.id === mid) || mockCatalog.models[0];
      return chosen as unknown as T;
    }
    if (command === 'embeddings_sync_vault') {
      return { total_passages: 9458, cached_passages: 9458, missing_passages: 0, coverage: 1.0, is_available: true } as unknown as T;
    }
    if (command === 'ai_key_status') return false as unknown as T;
    if (command === 'ai_list_models') return [] as unknown as T;
    if (command === 'ai_get_selected_model') {
      return (localStorage.getItem('limen_selected_ai_model') || null) as unknown as T;
    }
    if (command === 'ai_save_selected_model') {
      const m = (args as any)?.model || '';
      localStorage.setItem('limen_selected_ai_model', m);
      return undefined as unknown as T;
    }
    if (command === 'ai_preview') {
      return {
        ticket: 't_mock_123',
        contextBytes: 3420,
        sources: [
          {
            documentId: 'doc_bnxt_spec_p0',
            relativePath: '01_CLIENTS/BNXT_Specifiche.md',
            title: 'Progetto BNXT — Specifiche Tecniche',
            category: 'client',
            status: 'approved',
            sha256: '4a8b7c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
            content: '[Sezione 1] Il progetto BNXT è un sistema di architettura modulare per la gestione della conoscenza aziendale con crittografia end-to-end e consenso esplicito.',
            locator: '## Sezione 1',
            passageId: 'doc_bnxt_spec_p0'
          },
          {
            documentId: 'doc_scena_arch_p1',
            relativePath: '02_PROJECTS/SCENA_Architettura.md',
            title: 'Progetto SCENA — Guida Utente e Moduli',
            category: 'project',
            status: 'approved',
            sha256: '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e',
            content: '[## Moduli] Il progetto SCENA comprende le applicazioni PWA Studente, PWA Admin e Scena Hub per la coordinazione del personale.',
            locator: '## Moduli',
            passageId: 'doc_scena_arch_p1'
          }
        ]
      } as unknown as T;
    }
    if (command === 'ai_ask' || command === 'ai_ask_stream') {
      return {
        answer: 'Il progetto BNXT è una piattaforma di conoscenza aziendale modulare con crittografia end-to-end e gestione granulare del consenso degli utenti. Integra la ricerca ibrida locale per garantire che nessun dato venga trasmesso all\'esterno senza autorizzazione.',
        provider: 'OpenAI',
        model: 'gpt-4o',
        tokensUsed: 412,
        citations: [
          {
            documentId: 'doc_bnxt_spec_p0',
            relativePath: '01_CLIENTS/BNXT_Specifiche.md',
            title: 'Progetto BNXT — Specifiche Tecniche',
            category: 'client',
            status: 'approved',
            sha256: '4a8b7c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
            locator: '## Sezione 1',
            passageId: 'doc_bnxt_spec_p0'
          }
        ]
      } as unknown as T;
    }
    throw new Error(`Comando '${command}' non disponibile in anteprima browser`);
  }
  return invoke<T>(command, args);
}

export const aiIpc = {
  getConsent: (vaultPath: string) => call<boolean>('ai_get_consent', { vaultPath }),
  setConsent: (vaultPath: string, granted: boolean) => call<void>('ai_set_consent', { vaultPath, granted }),
  models: (vaultPath: string) => call<string[]>('ai_list_models', { vaultPath }),
  getSelectedModel: () => call<string | null>('ai_get_selected_model'),
  saveSelectedModel: (model: string) => call<void>('ai_save_selected_model', { model }),
  status: () => call<boolean>('ai_key_status'),
  saveKey: (key: string) => call<void>('ai_save_key', { key }),
  deleteKey: () => call<void>('ai_delete_key'),
  preview: (vaultPath: string, options: AiOptions) => call<AiPreview>('ai_preview', { vaultPath, options }),
  ask: (ticket: string, uiElapsedMs?: number) => call<AiAnswer>('ai_ask', { ticket, uiElapsedMs }),
  askStream: (ticket: string, uiElapsedMs?: number) => call<AiAnswer>('ai_ask_stream', { ticket, uiElapsedMs }),
  cancel: (ticket: string) => call<void>('ai_cancel', { ticket }),
  read: (vaultPath: string, s: Omit<AiSource, 'content'>, includeDrafts: boolean) =>
    call<AiSource>('ai_read_source', { vaultPath, documentId: s.documentId, sha256: s.sha256, includeDrafts }),
  mcpStatus: () => call<{ active: boolean; endpoint?: string; vaultId?: string }>('mcp_status'),
  mcpStart: (vaultPath: string, includeDrafts: boolean) =>
    call<{ endpoint: string; token: string; vaultId: string }>('mcp_start', { vaultPath, includeDrafts }),
  mcpStop: () => call<void>('mcp_stop'),
  tunnelStop: () => call<void>('tunnel_stop'),

  // Semantic & Local RAG IPC methods (Gate A04 / Compito 1)
  embeddingsGetProvider: (vaultPath: string) => call<EmbeddingsProviderReport>('embeddings_get_provider', { vaultPath }),
  embeddingsSetProvider: (vaultPath: string, provider: 'local' | 'openai') =>
    call<EmbeddingsProviderReport>('embeddings_set_provider', { vaultPath, provider }),
  localModelStatus: () => call<LocalModelReport>('local_model_status'),
  localModelDownload: () => call<LocalModelReport>('local_model_download'),
  localModelSelectFile: (filePath: string) => call<LocalModelReport>('local_model_select_file', { filePath }),
  localModelPickAndInstall: () => call<LocalModelReport>('local_model_pick_and_install'),
  localModelVerifyIntegrity: () => call<LocalModelReport>('local_model_verify_integrity'),
  localServerStart: () => call<LocalServerReport>('local_server_start'),
  localServerStop: () => call<LocalServerReport>('local_server_stop'),
  localServerStatus: () => call<LocalServerReport>('local_server_status'),
  embeddingsCancelSync: () => call<void>('embeddings_cancel_sync'),
  embeddingsSyncVault: (vaultPath: string, apiKey?: string, model?: string) =>
    call<any>('embeddings_sync_vault', { vaultPath, apiKey: apiKey ?? null, model: model ?? null }),
  aiGetMode: (vaultPath: string) => call<'hybrid' | 'local_only'>('ai_get_mode', { vaultPath }),
  aiSetMode: (vaultPath: string, mode: 'hybrid' | 'local_only') => call<'hybrid' | 'local_only'>('ai_set_mode', { vaultPath, mode }),

  // Local Generative LLM (Multi-Model Catalog) IPC methods
  localLlmStatus: () => call<LocalModelReport>('local_llm_status'),
  localLlmDownload: () => call<LocalModelReport>('local_llm_download'),
  localLlmVerifyIntegrity: () => call<LocalModelReport>('local_llm_verify_integrity'),
  localLlmServerStart: () => call<LocalServerReport>('local_llm_server_start'),
  localLlmServerStop: () => call<LocalServerReport>('local_llm_server_stop'),
  localLlmServerStatus: () => call<LocalServerReport>('local_llm_server_status'),
  localLlmCatalog: () => call<LocalCatalogReport>('local_llm_catalog'),
  localLlmSetActive: (modelId: string) => call<string>('local_llm_set_active', { modelId }),
  localLlmDownloadModel: (modelId: string) => call<LocalModelReport>('local_llm_download_model', { modelId }),
  localLlmVerifyModelIntegrity: (modelId: string) =>
    call<LocalModelCatalogEntry>('local_llm_verify_model_integrity', { modelId }),
};
