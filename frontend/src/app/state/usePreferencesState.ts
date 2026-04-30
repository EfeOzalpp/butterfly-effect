import { useEffect, useRef, useState } from 'react';

import {
  applyThemeToDocument,
  readStoredDarkMode,
  setSessionItem,
} from '../session';
import {
  bumpGeneration,
  resetQueue,
} from '../../graph-runtime/sprites/entry';

export default function usePreferencesState() {
  const [darkMode, setDarkMode] = useState<boolean>(() => readStoredDarkMode(true));
  const didInitThemeRef = useRef(false);
  useEffect(() => {
    setSessionItem('be.darkMode', String(darkMode));
    applyThemeToDocument(darkMode);

    if (!didInitThemeRef.current) {
      didInitThemeRef.current = true;
      return;
    }

    try { bumpGeneration(); } catch (err) { console.warn('[usePreferencesState] bumpGeneration failed:', err); }
    try { resetQueue(); } catch (err) { console.warn('[usePreferencesState] resetQueue failed:', err); }
  }, [darkMode]);

  return {
    darkMode,
    setDarkMode,
  };
}
