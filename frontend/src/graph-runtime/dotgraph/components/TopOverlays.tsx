import React from "react";
import { Html } from "@react-three/drei";
import CompleteButton from "../../../weighted-survey/R3F-button/CompleteButton";

type TopOverlaysProps = {
  showCompleteUI: boolean;
  isBusy: boolean;
  pending: number;
  loaderCardStyle: React.CSSProperties;
};

export default function TopOverlays({
  showCompleteUI,
  isBusy,
  pending,
  loaderCardStyle,
}: TopOverlaysProps) {
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
          <div style={loaderCardStyle} className="loading-dots">
            Community is loading...
            {Number.isFinite(pending) ? ` (${pending})` : ""}
          </div>
        </Html>
      )}
    </>
  );
}
