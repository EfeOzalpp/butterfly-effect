import { useEffect, useState } from 'react';

import { getSessionItem } from '../session';

export default function useIdentityState() {
  const [mySection, setMySection] = useState<string | null>(() => getSessionItem('gp.mySection'));
  const [myEntryId, setMyEntryId] = useState<string | null>(() => getSessionItem('gp.myEntryId'));
  const [myRole, setMyRole] = useState<string | null>(() => getSessionItem('gp.myRole'));

  useEffect(() => {
    const onIdentityUpdated = () => {
      try {
        setMyEntryId(getSessionItem('gp.myEntryId'));
        setMySection(getSessionItem('gp.mySection'));
        setMyRole(getSessionItem('gp.myRole'));
      } catch {}
    };

    window.addEventListener('gp:identity-updated', onIdentityUpdated);
    window.addEventListener('storage', onIdentityUpdated);

    return () => {
      window.removeEventListener('gp:identity-updated', onIdentityUpdated);
      window.removeEventListener('storage', onIdentityUpdated);
    };
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
