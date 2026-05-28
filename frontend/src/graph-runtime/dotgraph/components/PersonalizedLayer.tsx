// src/graph-runtime/dotgraph/components/PersonalizedLayer.tsx

import React, { type CSSProperties } from "react";
import { Html } from "@react-three/drei";
import { PERSONALIZED_SPRITE_TILE_SIZE, SpriteShape } from "../../sprites/entry";
import GamificationPersonalized from "../../gamification/gamification-personal";
import type {
  DotGraphEntry,
  DotGraphTieStats,
  PersonalizedDotShape,
} from "../types";

interface PersonalizedLayerProps {
  shouldRenderPersonalUI: boolean;
  shouldRenderExtraPersonalSprite: boolean;
  effectiveMyShape: PersonalizedDotShape | null;
  effectiveMyEntry: DotGraphEntry | null;
  spriteScale: number;
  bagSeed: string;
  offsetPx: number;
  myDisplayValue: number;
  mode: "absolute" | "relative";
  myStats: DotGraphTieStats;
  statsLoading: boolean;
  setPersonalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  viewportClass?: string;
  darkMode?: boolean;
  zoomFraction?: number;
  particleFrames?: number;
}

export default function PersonalizedLayer({
  shouldRenderPersonalUI,
  shouldRenderExtraPersonalSprite,
  effectiveMyShape,
  effectiveMyEntry,
  spriteScale,
  bagSeed,
  offsetPx,
  myDisplayValue,
  mode,
  myStats,
  statsLoading,
  setPersonalOpen,
  viewportClass,
  darkMode = false,
  zoomFraction,
  particleFrames = 219,
}: PersonalizedLayerProps) {
  if (!shouldRenderPersonalUI) return null;
  const htmlStyle: CSSProperties & { "--offset-px": string } = {
    pointerEvents: "none",
    "--offset-px": `${String(offsetPx)}px`,
  };

  return (
    <>
      {shouldRenderExtraPersonalSprite && effectiveMyShape && effectiveMyEntry && (
        <group position={effectiveMyShape.position}>
          <SpriteShape
            avg={
              Number.isFinite(effectiveMyEntry.avgWeight)
                ? Number(effectiveMyEntry.avgWeight)
                : 0.5
            }
            position={[0, 0, 0]}
            scale={spriteScale}
            tileSize={PERSONALIZED_SPRITE_TILE_SIZE}
            seed={bagSeed}
            orderIndex={0}
            freezeParticles={true}
            particleStepMs={33}
            particleFrames={particleFrames}
            occasionalRefreshMs={240}
            darkMode={darkMode}
          />
        </group>
      )}

      {effectiveMyShape && (
        <Html
          position={effectiveMyShape.position}
          center
          zIndexRange={[110, 130]}
          className={viewportClass}
          style={htmlStyle}
        >
          <div>
            <GamificationPersonalized
              userData={effectiveMyEntry}
              percentage={myDisplayValue}
              color={effectiveMyShape.color}
              mode={mode}
              belowCountStrict={myStats.below}
              equalCount={myStats.equal}
              aboveCountStrict={myStats.above}
              statsLoading={statsLoading}
              onOpenChange={setPersonalOpen}
              zoomFraction={zoomFraction}
            />
          </div>
        </Html>
      )}
    </>
  );
}
