import { useState, useEffect, useRef } from 'react';

const STORAGE_PREFIX = 'dentease.';

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
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (raw == null) return fallback;
    return reviveDates(JSON.parse(raw));
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota exceeded — silently ignore */
  }
};

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) {
      writeStorage(key, value);
    } else {
      initialised.current = true;
      // Persist initial seed so it shows up on first run
      if (readStorage(key, undefined) === undefined) {
        writeStorage(key, value);
      }
    }
  }, [key, value]);

  return [value, setValue];
}

export function resetLocalData(keys) {
  if (typeof window === 'undefined') return;
  keys.forEach(k => window.localStorage.removeItem(STORAGE_PREFIX + k));
}
