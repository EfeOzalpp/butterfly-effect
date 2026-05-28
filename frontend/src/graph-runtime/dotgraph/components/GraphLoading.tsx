// src/graph-runtime/dotgraph/components/GraphLoading.tsx

import React from "react";
import { Html } from "@react-three/drei";
import HintBanner from "../../../app/ui/HintBanner";

interface GraphOverlaysProps {
  isBusy: boolean;
}

export default function GraphOverlays({ isBusy }: GraphOverlaysProps) {
  const [visible, setVisible] = React.useState(false);
  const hasLoadedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isBusy) {
      hasLoadedRef.current = true;
      setVisible(false);
      return;
    }
    if (hasLoadedRef.current) return;
    const id = setTimeout(() => {
      setVisible(true);
    }, 800);
    return () => {
      clearTimeout(id);
    };
  }, [isBusy]);

  return (
    <Html center zIndexRange={[200, 250]} style={{ pointerEvents: "none" }}>
      <HintBanner visible={visible}>
        Community is loading
      </HintBanner>
    </Html>
  );
}
