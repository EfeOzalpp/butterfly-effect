import { useEffect, useState } from 'react';

import { getSessionItem } from '../session';

export default function useIdentityState() {
  const [mySection, setMySection] = useState<string | null>(() => getSessionItem('be.mySection'));
  const [myEntryId, setMyEntryId] = useState<string | null>(() => getSessionItem('be.myEntryId'));
  const [myRole, setMyRole] = useState<string | null>(() => getSessionItem('be.myRole'));

  useEffect(() => {
    const onStorageSync = () => {
      try {
        setMyEntryId(getSessionItem('be.myEntryId'));
        setMySection(getSessionItem('be.mySection'));
        setMyRole(getSessionItem('be.myRole'));
      } catch (err) {
        console.warn('[useIdentityState] Failed to sync identity from storage:', err);
      }
    };

    // Keep storage listener for cross-tab sync only
    window.addEventListener('storage', onStorageSync);
    return () => window.removeEventListener('storage', onStorageSync);
  }, []);

  return {
    mySection,
    setMySection,
    myEntryId,
    setMyEntryId,
    myRole,
    setMyRole,
  };
}
