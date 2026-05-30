import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  WhatsappLogo,
  X,
  Gear,
  CheckCircle,
  Warning,
  CircleNotch,
  ArrowClockwise,
  Power,
  Trash,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  getOpenWaConfig,
  saveOpenWaConfig,
  fetchSessions,
  createSession,
  startSession,
  getQRCode,
  stopSession,
  deleteSession,
} from '../../lib/openwa';

export default function WhatsAppStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(getOpenWaConfig());
  const [status, setStatus] = useState('DISCONNECTED'); // DISCONNECTED | SERVER_UNREACHABLE | NO_SESSION | CREATED | INITIALIZING | QR_READY | READY | FAILED
  const [qrCodeData, setQrCodeData] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Form states
  const [apiUrl, setApiUrl] = useState(config.apiUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [sessionName, setSessionName] = useState(config.sessionName);
  const [enabled, setEnabled] = useState(config.enabled);

  const pollIntervalRef = useRef(null);
  const bootstrappingRef = useRef(false);
  const startingSessionRef = useRef(null);

  const [showApiKey, setShowApiKey] = useState(false);

  // Handle configuration changes
  const handleToggleEnabled = async (val) => {
    setEnabled(val);
    const newConfig = { ...config, enabled: val };
    setConfig(newConfig);
    saveOpenWaConfig(newConfig);
    
    if (val) {
      toast.success('OpenWA Integration enabled');
      checkConnectionStatus(newConfig);
    } else {
      toast.info('OpenWA Integration disabled');
      if (config.sessionId) {
        try {
          await stopSession(newConfig, config.sessionId);
        } catch (err) {
          console.error('Failed to stop session on disable:', err);
        }
      }
      setStatus('DISCONNECTED');
      setSessionDetails(null);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const newConfig = {
      ...config,
      apiUrl,
      apiKey,
      sessionName,
    };
    setConfig(newConfig);
    saveOpenWaConfig(newConfig);
    setShowSettings(false);
    toast.success('OpenWA credentials saved');
    checkConnectionStatus(newConfig);
  };

  // Status check & polling
  const checkConnectionStatus = async (currentConfig) => {
    const cfg = currentConfig || config;
    if (!cfg.enabled) {
      setStatus('DISCONNECTED');
      setSessionDetails(null);
      return;
    }

    try {
      const sessions = await fetchSessions(cfg);
      const activeSession = sessions.find((s) => s.name === cfg.sessionName);

      if (!activeSession) {
        setStatus('NO_SESSION');
        setSessionDetails(null);
        // Clear sessionId in config if it was set
        if (cfg.sessionId) {
          const updated = { ...cfg, sessionId: '' };
          setConfig(updated);
          saveOpenWaConfig(updated);
        }
        autoInitAndStart(cfg);
        return;
      }

      // Update sessionId in config if not set or mismatched
      if (cfg.sessionId !== activeSession.id) {
        const updated = { ...cfg, sessionId: activeSession.id };
        setConfig(updated);
        saveOpenWaConfig(updated);
      }

      const upperStatus = activeSession.status.toUpperCase();
      setStatus(upperStatus);
      setSessionDetails(activeSession);

      // If QR code is ready, fetch it
      if (upperStatus === 'QR_READY') {
        try {
          const qrResp = await getQRCode(cfg, activeSession.id);
          setQrCodeData(qrResp.qrCode);
        } catch (err) {
          console.error('Failed to fetch QR code', err);
        }
      } else {
        setQrCodeData('');
      }

      if (upperStatus === 'READY' || upperStatus === 'QR_READY') {
        startingSessionRef.current = null;
      }

      // Automatically start session if disconnected/failed/created and not currently starting
      if (
        (upperStatus === 'CREATED' ||
         upperStatus === 'DISCONNECTED' ||
         upperStatus === 'FAILED') &&
        startingSessionRef.current !== activeSession.id
      ) {
        autoStart(cfg, activeSession.id);
      }
    } catch (err) {
      console.error('OpenWA connection error:', err);
      setStatus('SERVER_UNREACHABLE');
      setSessionDetails(null);
    }
  };

  // Poll status when modal is open or when integration is enabled
  useEffect(() => {
    checkConnectionStatus();

    // Set up polling interval
    const intervalTime = isOpen ? 2500 : 7500; // Poll faster if modal is open
    pollIntervalRef.current = setInterval(() => {
      checkConnectionStatus();
    }, intervalTime);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, enabled, config.sessionName, config.apiUrl]);

  const autoInitAndStart = async (cfg) => {
    if (bootstrappingRef.current) return;
    bootstrappingRef.current = true;
    try {
      const session = await createSession(cfg, cfg.sessionName);
      const updatedConfig = { ...cfg, sessionId: session.id };
      setConfig(updatedConfig);
      saveOpenWaConfig(updatedConfig);
      startingSessionRef.current = session.id;
      await startSession(updatedConfig, session.id);
    } catch (err) {
      console.error('Auto bootstrap failed:', err);
    } finally {
      bootstrappingRef.current = false;
      checkConnectionStatus();
    }
  };

  const autoStart = async (cfg, sessionId) => {
    if (bootstrappingRef.current) return;
    bootstrappingRef.current = true;
    try {
      startingSessionRef.current = sessionId;
      await startSession(cfg, sessionId);
    } catch (err) {
      console.error('Auto start failed:', err);
    } finally {
      bootstrappingRef.current = false;
      checkConnectionStatus();
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out of WhatsApp? This will disconnect your device.')) {
      return;
    }
    setLoading(true);
    try {
      if (config.sessionId) {
        await deleteSession(config, config.sessionId);
      }
      const updatedConfig = { ...config, sessionId: '' };
      setConfig(updatedConfig);
      saveOpenWaConfig(updatedConfig);
      setStatus('DISCONNECTED');
      setSessionDetails(null);
      startingSessionRef.current = null;
      toast.success('Logged out successfully');
      checkConnectionStatus(updatedConfig);
    } catch (err) {
      toast.error(err.message || 'Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  // Determine button status color & text
  let statusColor = 'text-text-muted hover:text-text-main';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200/50 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20';
  let statusText = 'Disabled';

  if (enabled) {
    if (status === 'READY') {
      statusColor = 'text-emerald-500 hover:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
      statusText = 'Connected';
    } else if (status === 'QR_READY') {
      statusColor = 'text-amber-500 hover:text-amber-400 animate-pulse';
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-200/50 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
      statusText = 'Scan QR';
    } else if (status === 'INITIALIZING' || status === 'AUTHENTICATING' || status === 'CREATED' || status === 'NO_SESSION') {
      statusColor = 'text-orange-500 hover:text-orange-400 animate-pulse';
      badgeColor = 'bg-orange-50 text-orange-800 border-orange-200/50 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30';
      statusText = 'Connecting';
    } else if (status === 'SERVER_UNREACHABLE') {
      statusColor = 'text-rose-500 hover:text-rose-400';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30';
      statusText = 'Server Error';
    } else {
      statusColor = 'text-gray-400 hover:text-text-main';
      badgeColor = 'bg-gray-500/15 text-gray-400 border-gray-500/30';
      statusText = 'Disconnected';
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className={`h-9 px-3 rounded-lg bg-bg-body/40 border border-border-color flex items-center gap-2 text-sm font-semibold transition-all ${statusColor}`}
          title={`WhatsApp Integration: ${statusText}`}
        >
          <WhatsappLogo size={18} weight={enabled && status === 'READY' ? 'fill' : 'bold'} />
          <span className="hidden lg:inline text-xs">{statusText}</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[92vw] max-w-md bg-bg-card rounded-2xl shadow-2xl z-[70] focus:outline-none border border-border-color overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-body">
            <div className="flex items-center gap-2">
              <WhatsappLogo size={22} className="text-emerald-500" weight="fill" />
              <Dialog.Title className="text-base font-bold text-text-main">
                WhatsApp Integration
              </Dialog.Title>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => checkConnectionStatus()}
                className="p-1.5 text-text-muted hover:bg-bg-body rounded-lg transition-colors"
                title="Refresh Status"
              >
                <ArrowClockwise size={16} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showSettings ? 'text-primary bg-bg-body' : 'text-text-muted hover:bg-bg-body'
                }`}
                title="Configuration Settings"
              >
                <Gear size={16} />
              </button>
              <Dialog.Close className="p-1.5 text-text-muted hover:bg-bg-body rounded-lg transition-colors">
                <X size={18} />
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {showSettings ? (
              /* Settings Form */
              <form onSubmit={handleSaveSettings} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-text-muted">Connection Credentials</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Server URL</label>
                  <input
                    type="url"
                    required
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary"
                    placeholder="http://localhost:2785"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">API Access Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      required
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 text-sm bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary"
                      placeholder="dev-admin-key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                      title={showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showApiKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Session name</label>
                  <input
                    type="text"
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-bg-body border border-border-color rounded-lg focus:outline-none focus:border-primary"
                    placeholder="dentease-session"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 h-10 rounded-xl bg-bg-body border border-border-color hover:bg-bg-card text-text-main text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-semibold transition-colors"
                  >
                    Save & Test
                  </button>
                </div>
              </form>
            ) : (
              /* Status & Interaction Panel */
              <div className="space-y-4">
                {/* Integration Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-bg-body border border-border-color rounded-xl">
                  <div>
                    <div className="font-bold text-sm text-text-main">Enable WhatsApp API</div>
                    <div className="text-xs text-text-muted mt-0.5">Route reminders via OpenWA backend</div>
                  </div>
                  <button
                    onClick={() => handleToggleEnabled(!enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enabled ? 'bg-primary' : 'bg-border-strong'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {enabled && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Status Badge Block */}
                    <div className="flex items-center justify-between p-3.5 bg-bg-body border border-border-color rounded-xl">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Connection Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${badgeColor}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Server Unreachable Alert */}
                    {status === 'SERVER_UNREACHABLE' && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl flex gap-3 text-rose-400">
                        <Warning size={20} className="shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Cannot Connect to OpenWA Server</div>
                          <p className="text-xs mt-1 leading-relaxed text-rose-400/80">
                            The API gateway at <code className="font-mono text-[11px] bg-rose-500/15 px-1 rounded">{config.apiUrl}</code> is unreachable.
                            Make sure the server process is started and your credentials are correct in the settings.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Connecting loader */}
                    {(status === 'NO_SESSION' || status === 'CREATED' || status === 'DISCONNECTED' || status === 'FAILED' || status === 'INITIALIZING' || status === 'AUTHENTICATING') && (
                      <div className="p-8 border border-border-color bg-bg-body rounded-xl flex flex-col items-center justify-center space-y-3 text-center animate-in fade-in duration-200">
                        <CircleNotch size={32} className="text-primary animate-spin" />
                        <div>
                          <div className="font-bold text-sm text-text-main">Connecting WhatsApp...</div>
                          <div className="text-xs text-text-muted mt-1">Starting driver and preparing QR code. This will only take a moment.</div>
                        </div>
                      </div>
                    )}

                    {/* QR Code Ready for Scanning */}
                    {status === 'QR_READY' && qrCodeData && (
                      <div className="p-5 border border-border-color bg-bg-body rounded-xl flex flex-col items-center space-y-4 text-center animate-in fade-in duration-200">
                        <div className="bg-white p-3.5 rounded-2xl shadow-inner border border-gray-200">
                          <img src={qrCodeData} alt="WhatsApp QR Code" className="w-[180px] h-[180px]" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-text-main">Scan QR Code</div>
                          <p className="text-xs text-text-muted leading-relaxed px-4">
                            Open WhatsApp on your phone, tap Menu or Settings, select <strong>Linked Devices</strong>, and scan this QR code.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Connected Details */}
                    {status === 'READY' && (
                      <div className="p-5 border border-border-color bg-bg-body rounded-xl space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <CheckCircle size={22} weight="fill" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-text-main">WhatsApp Connected</div>
                            {sessionDetails?.phone && (
                              <div className="text-xs text-text-muted mt-0.5">
                                Phone: +{sessionDetails.phone} {sessionDetails.pushName ? `(${sessionDetails.pushName})` : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex pt-2 border-t border-border-color/60">
                          <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="flex-1 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {loading ? <CircleNotch size={14} className="animate-spin" /> : null}
                            Log Out / Link Another Device
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
