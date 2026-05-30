import { useState, useEffect, useRef } from 'react';

const getStoragePrefix = () => {
  if (typeof window === 'undefined') return 'dentease.devnayan.';
  const params = new URLSearchParams(window.location.search);
  const clinic = params.get('clinic') || 'devnayan';
  return `dentease.${clinic}.`;
};

const reviveDates = (value) => {
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if ((k === 'start' || k === 'end') && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        out[k] = new Date(v);
      } else {
        out[k] = reviveDates(v);
      }
    }
    return out;
  }
  return value;
};

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(getStoragePrefix() + key);
    if (raw == null) return fallback;
    const parsed = reviveDates(JSON.parse(raw));
    
    // Auto-seed Janki Matroja if she is not present in patients
    if (key === 'patients' && Array.isArray(parsed)) {
      const hasJanki = parsed.some(p => p.phone === '8780149165');
      if (!hasJanki) {
        parsed.push({
          id: '7',
          name: 'Janki Matroja',
          doctorId: 'd1',
          age: 26,
          gender: 'Female',
          phone: '8780149165',
          address: 'Bardoli, Gujarat',
          registrationDate: '2026-05-30',
          lastVisit: '2026-05-30',
          totalVisits: 1,
          balance: 0,
          status: 'Active',
          medicalAlerts: [],
          teethConditions: {},
          history: []
        });
        window.localStorage.setItem(getStoragePrefix() + key, JSON.stringify(parsed));
      }
    }
    
    return parsed;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getStoragePrefix() + key, JSON.stringify(value));
  } catch {
    /* quota exceeded — silently ignore */
  }
};

export function useLocalStorage(key, initialValue) {
  const prefix = getStoragePrefix();
  const fullKey = prefix + key;

  const [value, setValue] = useState(() => readStorage(key, initialValue));
  const [loadedKey, setLoadedKey] = useState(fullKey);

  // If the prefix/clinic changed, reset state to the new storage value in render phase
  if (loadedKey !== fullKey) {
    setLoadedKey(fullKey);
    setValue(readStorage(key, initialValue));
  }

  useEffect(() => {
    // Only write to localStorage if we are fully synced to the current active key
    if (loadedKey === fullKey) {
      writeStorage(key, value);
    }
  }, [fullKey, loadedKey, value]);

  return [value, setValue];
}

export function resetLocalData(keys) {
  if (typeof window === 'undefined') return;
  const prefix = getStoragePrefix();
  keys.forEach(k => window.localStorage.removeItem(prefix + k));
}
