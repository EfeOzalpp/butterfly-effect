import { useEffect, useState } from 'react';

import type { Mode } from '../types';
import {
  applyThemeToDocument,
  getSessionItem,
  readStoredDarkMode,
  readStoredMode,
  setSessionItem,
} from '../session';

export default function usePreferencesState() {
  const [mode, setMode] = useState<Mode>(() => readStoredMode('relative'));
  useEffect(() => {
    setSessionItem('gp.mode', mode);
  }, [mode]);

  const [darkMode, setDarkMode] = useState<boolean>(() => readStoredDarkMode(true));
  useEffect(() => {
    setSessionItem('gp.darkMode', String(darkMode));
    applyThemeToDocument(darkMode);
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
