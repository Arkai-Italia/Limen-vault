import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Key,
  Sparkles,
  X,
  Loader2,
  HardDrive,
  Download,
  Check,
} from 'lucide-react';
import {
  aiIpc,
  type LocalCatalogReport,
  type LocalModelCatalogEntry,
  type LocalModelProgress,
} from './ai-ipc';
import { listen } from '@tauri-apps/api/event';
import { useTranslation } from './i18n';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVaultPath: string | null;
  isVaultLoaded: boolean;
  vaultName: string | null;
  onOpenVault: (path: string) => Promise<boolean>;
  onCreateVault: (path: string) => Promise<boolean>;
  onBrowseFolder: () => Promise<string | null>;
  isTauriEnv: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function SetupWizardModal({
  isOpen,
  onClose,
  currentVaultPath,
  isVaultLoaded,
  vaultName,
  onOpenVault,
  onCreateVault,
  onBrowseFolder,
  isTauriEnv,
}: SetupWizardModalProps) {
  const { t, language } = useTranslation();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [vaultPathInput, setVaultPathInput] = useState<string>(currentVaultPath || '');
  const [vaultActionLoading, setVaultActionLoading] = useState<boolean>(false);
  const [vaultActionError, setVaultActionError] = useState<string | null>(null);

  // Step 2: Catalog state
  const [catalogReport, setCatalogReport] = useState<LocalCatalogReport | null>(null);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(false);
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<LocalModelProgress | null>(null);
  const [modelActionError, setModelActionError] = useState<string | null>(null);

  // Step 3: API Key & Mode state
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiKeySaving, setApiKeySaving] = useState<boolean>(false);
  const [isLocalOnlyMode, setIsLocalOnlyMode] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('limen_ai_mode') === 'local_only';
    }
    return false;
  });
  const [apiActionError, setApiActionError] = useState<string | null>(null);
  const [apiActionSuccess, setApiActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentVaultPath) {
      setVaultPathInput(currentVaultPath);
    }
  }, [currentVaultPath]);

  // Load status for Catalog and API key on open
  useEffect(() => {
    if (!isOpen) return;

    let unlistenProgress: (() => void) | undefined;

    const loadInitialState = async () => {
      setCatalogLoading(true);
      try {
        const [cat, keyStatus] = await Promise.all([
          aiIpc.localLlmCatalog().catch(() => null),
          aiIpc.status().catch(() => false),
        ]);
        if (cat) setCatalogReport(cat);
        setHasApiKey(Boolean(keyStatus));
      } catch (err) {
        console.error('[SetupWizard] Errore caricamento stato:', err);
      } finally {
        setCatalogLoading(false);
      }
    };

    void loadInitialState();

    void listen<LocalModelProgress>('local_llm_download_progress', (e) => {
      setDownloadProgress(e.payload);
    }).then((unlisten) => {
      unlistenProgress = unlisten;
    }).catch(() => {});

    return () => {
      if (unlistenProgress) unlistenProgress();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine readiness for each step
  const isStep1Ready = isVaultLoaded && Boolean(currentVaultPath);
  const hasInstalledLocalModel = catalogReport?.models.some((m) => m.installed && m.sha256Ok) || false;
  const isStep2Ready = hasInstalledLocalModel;
  const isStep3Ready = hasApiKey || isLocalOnlyMode;
  const allStepsReady = isStep1Ready && isStep2Ready && isStep3Ready;

  // Step 1 Actions
  const handleBrowse = async () => {
    setVaultActionError(null);
    const chosen = await onBrowseFolder();
    if (chosen) {
      setVaultPathInput(chosen);
    }
  };

  const handleOpenVault = async () => {
    if (!vaultPathInput.trim()) {
      setVaultActionError('Seleziona o inserisci il percorso di una cartella.');
      return;
    }
    setVaultActionLoading(true);
    setVaultActionError(null);
    try {
      const ok = await onOpenVault(vaultPathInput.trim());
      if (ok) {
        setActiveStep(2);
      } else {
        setVaultActionError('Impossibile aprire il vault selezionato. Verifica che contenga una struttura LIMEN valida.');
      }
    } catch (e) {
      setVaultActionError(String(e));
    } finally {
      setVaultActionLoading(false);
    }
  };

  const handleCreateVault = async () => {
    if (!vaultPathInput.trim()) {
      setVaultActionError('Seleziona o inserisci il percorso per il nuovo vault.');
      return;
    }
    setVaultActionLoading(true);
    setVaultActionError(null);
    try {
      const ok = await onCreateVault(vaultPathInput.trim());
      if (ok) {
        setActiveStep(2);
      } else {
        setVaultActionError('Impossibile creare il vault nel percorso specificato.');
      }
    } catch (e) {
      setVaultActionError(String(e));
    } finally {
      setVaultActionLoading(false);
    }
  };

  // Step 2 Actions
  const handleDownloadModel = async (model: LocalModelCatalogEntry) => {
    setDownloadingModelId(model.id);
    setModelActionError(null);
    setDownloadProgress({ modelId: model.id, downloaded: 0, total: model.sizeBytes, percent: 0 });
    try {
      await aiIpc.localLlmDownloadModel(model.id);
      await aiIpc.localLlmSetActive(model.id);
      const cat = await aiIpc.localLlmCatalog();
      setCatalogReport(cat);
    } catch (e) {
      setModelActionError(`Download fallito per ${model.displayName}: ${String(e)}`);
    } finally {
      setDownloadingModelId(null);
      setDownloadProgress(null);
    }
  };

  const handleSetActiveModel = async (modelId: string) => {
    setModelActionError(null);
    try {
      await aiIpc.localLlmSetActive(modelId);
      const cat = await aiIpc.localLlmCatalog();
      setCatalogReport(cat);
    } catch (e) {
      setModelActionError(`Impossibile attivare il modello: ${String(e)}`);
    }
  };

  // Step 3 Actions
  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setApiActionError('Inserisci una chiave API valida nel formato sk-...');
      return;
    }
    setApiKeySaving(true);
    setApiActionError(null);
    setApiActionSuccess(null);
    try {
      await aiIpc.saveKey(apiKeyInput.trim());
      setHasApiKey(true);
      setApiKeyInput('');
      setApiActionSuccess('Chiave API salvata con successo nel portachiavi di sistema.');
    } catch (e) {
      setApiActionError(`Errore nel salvataggio della chiave: ${String(e)}`);
    } finally {
      setApiKeySaving(false);
    }
  };

  const handleSetLocalOnlyMode = (enabled: boolean) => {
    setIsLocalOnlyMode(enabled);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('limen_ai_mode', enabled ? 'local_only' : 'hybrid');
    }
    if (enabled) {
      setApiActionSuccess('Modalità 100% Solo Locale attivata. Nessuna chiamata di rete a OpenAI.');
    }
  };

  const systemRam = catalogReport?.physicalRamBytes || 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(7, 11, 20, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: 20,
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '90vh',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(119, 241, 23, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.2) 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: 'var(--limen-lime, #77f117)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(119, 241, 23, 0.4)',
                }}
              >
                <Sparkles size={16} color="#0f172a" />
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                {t.wizard.title} — LIMEN Vault
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              {language === 'en'
                ? 'Configure the 3 essential requirements to start working with your private Vault.'
                : 'Verifica e configurazione dei 3 requisiti essenziali per iniziare a usare il tuo vault.'}
            </p>
          </div>

          <button
            onClick={onClose}
            title={t.common.close}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <X size={18} />
          </button>
        </div>

        {/* STEPPER PILLS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            padding: '12px 28px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* STEP 1 PILL */}
          <button
            onClick={() => setActiveStep(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              border: activeStep === 1 ? '1px solid var(--limen-lime, #77f117)' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: activeStep === 1 ? 'rgba(119, 241, 23, 0.08)' : 'transparent',
              cursor: 'pointer',
              color: activeStep === 1 ? '#ffffff' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: isStep1Ready ? '#22c55e' : activeStep === 1 ? 'var(--limen-lime, #77f117)' : '#334155',
                color: isStep1Ready || activeStep === 1 ? '#0f172a' : '#94a3b8',
              }}
            >
              {isStep1Ready ? <Check size={12} strokeWidth={3} /> : '1'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                1. {t.wizard.step1Title}
              </div>
              <div style={{ fontSize: 10, color: isStep1Ready ? '#4ade80' : '#64748b' }}>
                {isStep1Ready ? '✓' : (language === 'en' ? 'Select' : 'Da selezionare')}
              </div>
            </div>
          </button>

          {/* STEP 2 PILL */}
          <button
            onClick={() => setActiveStep(2)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              border: activeStep === 2 ? '1px solid var(--limen-lime, #77f117)' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: activeStep === 2 ? 'rgba(119, 241, 23, 0.08)' : 'transparent',
              cursor: 'pointer',
              color: activeStep === 2 ? '#ffffff' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: isStep2Ready ? '#22c55e' : activeStep === 2 ? 'var(--limen-lime, #77f117)' : '#334155',
                color: isStep2Ready || activeStep === 2 ? '#0f172a' : '#94a3b8',
              }}
            >
              {isStep2Ready ? <Check size={12} strokeWidth={3} /> : '2'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                2. {t.wizard.step2Title}
              </div>
              <div style={{ fontSize: 10, color: isStep2Ready ? '#4ade80' : '#64748b' }}>
                {isStep2Ready ? '✓' : (language === 'en' ? 'Download' : 'Da scaricare')}
              </div>
            </div>
          </button>

          {/* STEP 3 PILL */}
          <button
            onClick={() => setActiveStep(3)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 8,
              border: activeStep === 3 ? '1px solid var(--limen-lime, #77f117)' : '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: activeStep === 3 ? 'rgba(119, 241, 23, 0.08)' : 'transparent',
              cursor: 'pointer',
              color: activeStep === 3 ? '#ffffff' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: isStep3Ready ? '#22c55e' : activeStep === 3 ? 'var(--limen-lime, #77f117)' : '#334155',
                color: isStep3Ready || activeStep === 3 ? '#0f172a' : '#94a3b8',
              }}
            >
              {isStep3Ready ? <Check size={12} strokeWidth={3} /> : '3'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                3. {t.wizard.step3Title}
              </div>
              <div style={{ fontSize: 10, color: isStep3Ready ? '#4ade80' : '#64748b' }}>
                {isStep3Ready ? '✓' : (language === 'en' ? 'Optional' : 'Opzionale')}
              </div>
            </div>
          </button>
        </div>

        {/* STEP CONTENT AREA */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* STEP 1: VAULT */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                  Collega o Crea la tua Cartella Vault
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  LIMEN Vault opera su cartelle locali in formato Markdown trasparente. Tutti i file, note e metadati restano interamente memorizzati sul tuo computer.
                </p>
              </div>

              {isStep1Ready ? (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <CheckCircle2 size={24} color="#22c55e" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                      Vault Attivo: <span style={{ color: 'var(--limen-lime, #77f117)' }}>{vaultName || 'Vault'}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>
                      {currentVaultPath}
                    </div>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>
                  Percorso della cartella Vault
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={vaultPathInput}
                    onChange={(e) => setVaultPathInput(e.target.value)}
                    placeholder="/Users/.../MioVault"
                    disabled={vaultActionLoading}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleBrowse}
                    disabled={vaultActionLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <FolderOpen size={16} />
                    <span>Sfoglia…</span>
                  </button>
                </div>
              </div>

              {vaultActionError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{vaultActionError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleOpenVault}
                  disabled={vaultActionLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 18px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'var(--limen-lime, #77f117)',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: vaultActionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(119, 241, 23, 0.25)',
                  }}
                >
                  {vaultActionLoading ? <Loader2 size={16} className="spin" /> : <FolderOpen size={16} />}
                  <span>APRI VAULT ESISTENTE</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateVault}
                  disabled={vaultActionLoading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 18px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: vaultActionLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {vaultActionLoading ? <Loader2 size={16} className="spin" /> : <PlusCircle size={16} />}
                  <span>CREA NUOVO VAULT</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCAL AI MODEL */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                  Scegli il Modello LLM Locale (100% Offline)
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  LIMEN Vault esegue direttamente i modelli generativi sul tuo processore e GPU (Metal). I modelli indicati girano a zero rete senza richiedere chiavi o abbonamenti.
                </p>
              </div>

              {/* Hardware Detected Box */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Cpu size={20} color="var(--limen-lime, #77f117)" />
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>
                    Hardware Rilevato: <span style={{ color: 'var(--limen-lime, #77f117)' }}>{systemRam > 0 ? formatBytes(systemRam) : 'RAM di Sistema'}</span>
                  </div>
                  <div style={{ color: '#94a3b8', marginTop: 2 }}>
                    {systemRam > 0 && systemRam < 16 * 1024 * 1024 * 1024
                      ? 'Consigliato Ministral 3 3B per evitare swap di memoria su Mac 8 GB.'
                      : 'Memoria sufficiente per tutti i modelli da 7B / 8B con offload GPU completo.'}
                  </div>
                </div>
              </div>

              {modelActionError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: 12,
                  }}
                >
                  {modelActionError}
                </div>
              )}

              {/* Models List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {catalogReport?.models.map((model) => {
                  const isDownloadingThis = downloadingModelId === model.id;
                  const exceedsRam = systemRam > 0 && systemRam < model.minRamGb * 1024 * 1024 * 1024;

                  return (
                    <div
                      key={model.id}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: model.isActive ? 'rgba(119, 241, 23, 0.06)' : 'rgba(30, 41, 59, 0.35)',
                        border: model.isActive ? '1px solid var(--limen-lime, #77f117)' : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                            {model.displayName}
                          </span>
                          {model.isReasoning && (
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                              }}
                            >
                              Ragionamento &lt;think&gt;
                            </span>
                          )}
                          {model.isActive && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: 10,
                                fontWeight: 700,
                                backgroundColor: 'var(--limen-lime, #77f117)',
                                color: '#0f172a',
                              }}
                            >
                              ATTIVO
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                          <span>{formatBytes(model.sizeBytes)}</span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              backgroundColor: model.installed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                              color: model.installed ? '#4ade80' : '#94a3b8',
                            }}
                          >
                            {model.installed ? 'Installato' : 'Non presente'}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                        {model.description}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          <span>Minimo: {model.minRamGb} GB RAM · Consigliato: {model.recommendedHardware}</span>
                          {exceedsRam && (
                            <div style={{ color: '#fbbf24', marginTop: 2 }}>
                              ⚠️ Questo computer ha meno di {model.minRamGb} GB di RAM. L'uso potrebbe rallentare il sistema.
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          {model.installed ? (
                            !model.isActive && (
                              <button
                                type="button"
                                onClick={() => handleSetActiveModel(model.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  backgroundColor: '#1e293b',
                                  color: '#ffffff',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Imposta come Attivo
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDownloadModel(model)}
                              disabled={Boolean(downloadingModelId)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 14px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: 'var(--limen-lime, #77f117)',
                                color: '#0f172a',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: downloadingModelId ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <Download size={14} />
                              <span>{isDownloadingThis ? 'Scaricamento…' : `Scarica (${formatBytes(model.sizeBytes)})`}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Download Progress Bar */}
                      {isDownloadingThis && downloadProgress && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                            <span>Download in corso da Hugging Face…</span>
                            <span style={{ color: 'var(--limen-lime, #77f117)', fontWeight: 600 }}>
                              {downloadProgress.percent.toFixed(1)}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${downloadProgress.percent}%`,
                                backgroundColor: 'var(--limen-lime, #77f117)',
                                transition: 'width 0.2s ease',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: API KEY / MODE */}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                  Modalità di Risposta & Chiave API
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  Decidi come generare le risposte nel vault. Puoi scegliere la riservatezza al 100% in locale, oppure inserire una chiave OpenAI per la modalità ibrida.
                </p>
              </div>

              {/* OPTION 1: 100% SOLO LOCALE */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  backgroundColor: isLocalOnlyMode ? 'rgba(119, 241, 23, 0.08)' : 'rgba(30, 41, 59, 0.4)',
                  border: isLocalOnlyMode ? '1px solid var(--limen-lime, #77f117)' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <ShieldCheck size={22} color={isLocalOnlyMode ? 'var(--limen-lime, #77f117)' : '#94a3b8'} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                      100% Solo Locale (Rete Zero)
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, lineHeight: 1.4 }}>
                      Nessun passaggio esce dal computer, zero costi API e massima privacy. Le risposte sono formulate dai modelli locali scaricati al passo precedente.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSetLocalOnlyMode(!isLocalOnlyMode)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: isLocalOnlyMode ? 'var(--limen-lime, #77f117)' : '#1e293b',
                    color: isLocalOnlyMode ? '#0f172a' : '#ffffff',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isLocalOnlyMode ? 'ATTIVA ✓' : 'Attiva Solo Locale'}
                </button>
              </div>

              {/* OPTION 2: CHIAVE API OPENAI */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Key size={20} color="#cbd5e1" />
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                    Chiave API OpenAI (Modalità Ibrida Cloud)
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                  Opzionale. Memorizzata in modo sicuro nel portachiavi nativo del sistema operativo (Keychain su macOS, Credential Manager su Windows).
                </div>

                {hasApiKey ? (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      color: '#4ade80',
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Chiave API configurata e verificata nel portachiavi di sistema.</span>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-proj-..."
                    disabled={apiKeySaving}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      color: '#ffffff',
                      fontSize: 13,
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    disabled={apiKeySaving || !apiKeyInput.trim()}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: '#1e293b',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: apiKeySaving || !apiKeyInput.trim() ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {apiKeySaving ? <Loader2 size={16} className="spin" /> : 'Salva Chiave'}
                  </button>
                </div>
              </div>

              {apiActionError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: 12,
                  }}
                >
                  {apiActionError}
                </div>
              )}

              {apiActionSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    fontSize: 12,
                  }}
                >
                  {apiActionSuccess}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                <span>Indietro</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : 3))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>Avanti</span>
                <ArrowRight size={14} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: allStepsReady ? 'var(--limen-lime, #77f117)' : '#334155',
                color: allStepsReady ? '#0f172a' : '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: allStepsReady ? '0 0 16px rgba(119, 241, 23, 0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>ENTRA IN LIMEN VAULT</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
