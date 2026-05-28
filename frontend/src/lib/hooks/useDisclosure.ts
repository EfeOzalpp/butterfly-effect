import { useCallback, useState } from "react";

export function useDisclosure(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  const openDisclosure = useCallback(() => { setOpen(true); }, []);
  const closeDisclosure = useCallback(() => { setOpen(false); }, []);
  const toggleDisclosure = useCallback(() => { setOpen((value) => !value); }, []);

  return { open, setOpen, openDisclosure, closeDisclosure, toggleDisclosure };
}
