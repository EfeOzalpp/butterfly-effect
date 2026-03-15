import React from "react";
import { Html } from "@react-three/drei";
import CompleteButton from "../../../onboarding/R3F-button/complete-button";

type GraphOverlaysProps = {
  showCompleteUI: boolean;
  isBusy: boolean;
};

export default function GraphOverlays({
  showCompleteUI,
  isBusy,
}: GraphOverlaysProps) {
  return (
    <>
      {showCompleteUI && (
        <Html zIndexRange={[2, 24]} style={{ pointerEvents: "none" }}>
          <div
            className="z-index-respective"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              height: "100vh",
              pointerEvents: "none",
            }}
          >
            <CompleteButton />
          </div>
        </Html>
      )}

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
