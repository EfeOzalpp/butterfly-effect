import { useEffect, useRef, useState } from 'react';

import type { Mode } from '../types';
import {
  applyThemeToDocument,
  getSessionItem,
  readStoredDarkMode,
  readStoredMode,
  setSessionItem,
} from '../session';
import {
  bumpGeneration,
  resetQueue,
  disposeAllSpriteTextures,
  disposeStaticTextures,
} from '../../graph-runtime/sprites/entry';

export default function usePreferencesState() {
  const [mode, setMode] = useState<Mode>(() => readStoredMode('absolute'));
  useEffect(() => {
    setSessionItem('gp.mode', mode);
  }, [mode]);

  const [darkMode, setDarkMode] = useState<boolean>(() => readStoredDarkMode(true));
  const didInitThemeRef = useRef(false);
  useEffect(() => {
    setSessionItem('gp.darkMode', String(darkMode));
    applyThemeToDocument(darkMode);

    if (!didInitThemeRef.current) {
      didInitThemeRef.current = true;
      return;
    }

    try { bumpGeneration(); } catch (err) { console.warn('[usePreferencesState] bumpGeneration failed:', err); }
    try { resetQueue(); } catch (err) { console.warn('[usePreferencesState] resetQueue failed:', err); }
    try { disposeAllSpriteTextures(); } catch (err) { console.warn('[usePreferencesState] disposeAllSpriteTextures failed:', err); }
    try { disposeStaticTextures(); } catch (err) { console.warn('[usePreferencesState] disposeStaticTextures failed:', err); }
  }, [darkMode]);

  const [navPanelOpen, setNavPanelOpen] = useState<boolean>(false);
  const [navVisible, setNavVisible] = useState<boolean>(true);

  const [radarMode, setRadarMode] = useState<boolean>(() => getSessionItem('gp.radarMode') === '1');
  useEffect(() => {
    setSessionItem('gp.radarMode', radarMode ? '1' : '0');
  }, [radarMode]);

  return {
    mode,
    setMode,
    darkMode,
    setDarkMode,
    navPanelOpen,
    setNavPanelOpen,
    navVisible,
    setNavVisible,
    radarMode,
    setRadarMode,
  };
}
