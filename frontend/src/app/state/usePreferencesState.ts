// src/app/state/usePreferencesState.ts
// Theme preference is app state; sprite invalidation is hidden behind the sprite API.

import { useEffect, useRef, useState } from 'react';

import {
  applyThemeToDocument,
  readStoredDarkMode,
  setSessionItem,
} from '../session';
import { invalidateSpriteTexturesForThemeChange } from '../../graph-runtime/sprites/entry';

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

    try {
      // Theme swaps change sprite colors, so old textures should not be reused.
      invalidateSpriteTexturesForThemeChange();
    } catch (err) {
      console.warn('[usePreferencesState] sprite texture invalidation failed:', err);
    }
  }, [darkMode]);

  return {
    darkMode,
    setDarkMode,
  };
}
