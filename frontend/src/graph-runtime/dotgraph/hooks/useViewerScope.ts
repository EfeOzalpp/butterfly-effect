import { useMemo } from "react";
import {
  ROLE,
  normSection,
  deriveRoleFromSectionId,
  allowPersonalInSection,
} from "../dotgraph.scoping";

type UseViewerScopeArgs = {
  mySection: string | null | undefined;
  section: string | null | undefined;
};

export default function useViewerScope(args: UseViewerScopeArgs) {
  const { mySection, section } = args;

  const effectiveMySection = useMemo(() => {
    if (mySection && mySection !== "") return mySection;
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem("be.mySection");
      if (s && s !== "") return s;
    }
    return "";
  }, [mySection]);

  const viewerRole = useMemo(
    () => deriveRoleFromSectionId(effectiveMySection),
    [effectiveMySection]
  );

  const shouldShowPersonalized = useMemo(() => {
    const viewing =
      section ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("be.viewingSection")
        : null) ||
      "all";

    const ok = allowPersonalInSection(viewerRole, effectiveMySection, viewing);

    // Visitors only in Everyone/Visitors contexts.
    if (viewerRole === ROLE.VISITOR) {
      const v = normSection(viewing);
      return v === "all" || v === "visitor";
    }
    return ok;
  }, [viewerRole, effectiveMySection, section]);

  return {
    effectiveMySection,
    viewerRole,
    shouldShowPersonalized,
  };
}
