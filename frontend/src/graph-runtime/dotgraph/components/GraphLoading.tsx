import React from "react";
import { Html } from "@react-three/drei";

type GraphOverlaysProps = {
  isBusy: boolean;
};

export default function GraphOverlays({
  isBusy,
}: GraphOverlaysProps) {
  return (
    <>
      {isBusy && (
        <Html center zIndexRange={[200, 250]} style={{ pointerEvents: "none" }}>
          <div className="graph-loading-card loading-dots" role="status" aria-live="polite">
            <span className="graph-loading-text">Community is loading</span>
            <span className="graph-loading-ellipsis" aria-hidden="true">
              <span className="graph-loading-dot">.</span>
              <span className="graph-loading-dot">.</span>
              <span className="graph-loading-dot">.</span>
            </span>
          </div>
        </Html>
      )}
    </>
  );
}
