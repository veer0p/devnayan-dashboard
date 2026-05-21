import { toast } from 'sonner';

const STORAGE_KEY = 'dentease.openwa.config';

const DEFAULT_CONFIG = {
  enabled: false,
  apiUrl: 'http://localhost:2785',
  apiKey: 'dev-admin-key',
  sessionName: 'dentease-session',
  sessionId: '',
};

export function getOpenWaConfig() {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? { ...DEFAULT_CONFIG, ...JSON.parse(item) } : DEFAULT_CONFIG;
  } catch (e) {
    console.error('Failed to parse OpenWA config from local storage', e);
    return DEFAULT_CONFIG;
  }
}

export function saveOpenWaConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save OpenWA config to local storage', e);
  }
}

export function getWhatsAppChatId(phoneRaw) {
  let phone = phoneRaw.replace(/[^0-9]/g, '');
  if (phone.length === 10) {
    phone = '91' + phone; // Default to India country code
  }
  return `${phone}@c.us`;
}

// REST API calls to OpenWA server
export async function fetchSessions(config) {
  const cfg = config || getOpenWaConfig();
  const response = await fetch(`${cfg.apiUrl}/api/sessions`, {
    headers: {
      'X-API-Key': cfg.apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: status ${response.status}`);
  }
  return response.json();
}

export async function createSession(config, name) {
  const cfg = config || getOpenWaConfig();
  const response = await fetch(`${cfg.apiUrl}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': cfg.apiKey,
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create session: status ${response.status}`);
  }
  return response.json();
}

export async function startSession(config, id) {
  const cfg = config || getOpenWaConfig();
  const response = await fetch(`${cfg.apiUrl}/api/sessions/${id}/start`, {
    method: 'POST',
    headers: {
      'X-API-Key': cfg.apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to start session: status ${response.status}`);
  }
  return response.json();
}

export async function getQRCode(config, id) {
  const cfg = config || getOpenWaConfig();
  const response = await fetch(`${cfg.apiUrl}/api/sessions/${id}/qr`, {
    headers: {
      'X-API-Key': cfg.apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to get QR code: status ${response.status}`);
  }
  return response.json();
}

export async function stopSession(config, id) {
  const cfg = config || getOpenWaConfig();
  const response = await fetch(`${cfg.apiUrl}/api/sessions/${id}/stop`, {
    method: 'POST',
    headers: {
      'X-API-Key': cfg.apiKey,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to stop session: status ${response.status}`);
  }
  return response.json();
}

export async function deleteSession(config, id) {
  const cfg = config || getOpenWaConfig();
  const response = await fetch(`${cfg.apiUrl}/api/sessions/${id}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': cfg.apiKey,
    },
  });
  if (response.status !== 204 && !response.ok) {
    throw new Error(`Failed to delete session: status ${response.status}`);
  }
  return true;
}

export async function sendWhatsAppMessage(phoneRaw, text) {
  const config = getOpenWaConfig();
  const phoneClean = phoneRaw.replace(/[^0-9]/g, '');

  if (!config.enabled) {
    // Manual fallback
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        toast.info('Message text copied to clipboard!');
      } catch (err) {
        console.warn('Failed to copy text to clipboard:', err);
      }
    }
    let url = `https://wa.me/${phoneClean}`;
    if (text) {
      url += `?text=${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
    return { success: true, manual: true };
  }

  // If no text supplied, signal caller to open a custom compose dialog
  let finalMsg = text;
  if (!finalMsg || !finalMsg.trim()) {
    return { success: false, needsMessage: true };
  }

  // Automatic API send
  const chatId = getWhatsAppChatId(phoneRaw);
  if (!config.sessionId) {
    throw new Error('OpenWA integration is enabled but no session is configured. Please set up the connection first.');
  }

  const response = await fetch(`${config.apiUrl}/api/sessions/${config.sessionId}/messages/send-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
    },
    body: JSON.stringify({
      chatId,
      text: finalMsg,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to send message: status ${response.status}`);
  }

  return { success: true };
}

export async function sendWhatsAppMedia(phoneRaw, mediaObj) {
  const config = getOpenWaConfig();
  const phoneClean = phoneRaw.replace(/[^0-9]/g, '');

  if (!config.enabled) {
    // 1. Copy the caption text to clipboard for convenience
    if (mediaObj.caption) {
      try {
        await navigator.clipboard.writeText(mediaObj.caption);
        toast.info('Message text copied to clipboard!');
      } catch (err) {
        console.warn('Failed to copy text to clipboard:', err);
      }
    }

    // 2. Trigger automatic client-side file download if base64 is provided
    if (mediaObj.base64) {
      try {
        const link = document.createElement('a');
        link.href = mediaObj.base64;
        link.download = mediaObj.filename || 'invoice.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Visual copy downloaded to your computer!');
      } catch (err) {
        console.warn('Failed to download image automatically:', err);
      }
    }

    let url = `https://wa.me/${phoneClean}`;
    if (mediaObj.caption) {
      url += `?text=${encodeURIComponent(mediaObj.caption)}`;
    }
    window.open(url, '_blank');
    return { success: true, manual: true };
  }

  const chatId = getWhatsAppChatId(phoneRaw);
  if (!config.sessionId) {
    throw new Error('OpenWA integration is enabled but no session is configured. Please set up the connection first.');
  }

  const isDoc = mediaObj.mimetype && !mediaObj.mimetype.startsWith('image/');
  const endpoint = isDoc ? 'send-document' : 'send-image';

  const payload = {
    chatId,
    caption: mediaObj.caption || '',
    filename: mediaObj.filename || 'invoice.png',
  };

  if (mediaObj.url) {
    payload.url = mediaObj.url;
  } else if (mediaObj.base64) {
    let cleanBase64 = mediaObj.base64;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }
    payload.base64 = cleanBase64;
    payload.mimetype = mediaObj.mimetype || 'image/png';
  } else {
    throw new Error('Either url or base64 must be provided to sendWhatsAppMedia.');
  }

  const response = await fetch(`${config.apiUrl}/api/sessions/${config.sessionId}/messages/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to send media: status ${response.status}`);
  }

  return { success: true };
}
