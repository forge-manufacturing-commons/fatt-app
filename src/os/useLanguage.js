// ============================================================
// FORGE OS — useLanguage
// A real, application-wide system preference. The selected language
// lives in one shared store (persisted to localStorage), so every
// component that reads useLanguage() reflects the same choice and
// re-renders when it changes — the existing localisation mechanism.
// It publishes a real event onto the Activity Engine bus and fakes
// no translations: t() falls back to the key until content exists.
// ============================================================

import { useCallback, useSyncExternalStore } from 'react';
import { useForgeActivity } from './ActivityEngine.jsx';
import { SUPPORTED_LANGUAGES, t as translate } from './i18n.js';

// --- Shared preference store (module-level, app-wide) ------------------------
let currentLang = (() => {
  try { return localStorage.getItem('forge-lang') || 'en'; } catch { return 'en'; }
})();
const listeners = new Set();
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function getSnapshot() { return currentLang; }
function commit(code) {
  if (code === currentLang) return;
  currentLang = code;
  try { localStorage.setItem('forge-lang', code); } catch { /* best-effort persistence */ }
  listeners.forEach((fn) => fn());
}

export function useLanguage() {
  const { publish } = useForgeActivity();
  const lang = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setLang = useCallback((code) => {
    const valid = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (!valid) return;
    commit(code);
    publish({ type: 'system.language.changed', language: code, hub: 'language' });
  }, [publish]);

  const tFn = useCallback((key) => translate(key, lang), [lang]);

  return { lang, setLang, t: tFn, languages: SUPPORTED_LANGUAGES };
}

export default useLanguage;
