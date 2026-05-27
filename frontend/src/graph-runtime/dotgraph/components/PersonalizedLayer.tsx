// src/graph-runtime/dotgraph/components/PersonalizedLayer.tsx

import React, { type CSSProperties } from "react";
import { Html } from "@react-three/drei";
import { SpriteShape } from "../../sprites/entry";
import GamificationPersonalized from "../../gamification/gamification-personal";
import type {
  DotGraphEntry,
  DotGraphPositionClass,
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
  section: string;
  myStats: DotGraphTieStats;
  myClass: DotGraphPositionClass;
  statsLoading: boolean;
  setPersonalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  viewportClass?: string;
  darkMode?: boolean;
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
  section,
  myStats,
  myClass,
  statsLoading,
  setPersonalOpen,
  viewportClass,
  darkMode = false,
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
            tileSize={128}
            seed={bagSeed}
            orderIndex={0}
            freezeParticles={true}
            particleStepMs={33}
            particleFrames={219}
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
              selectedSectionId={section}
              belowCountStrict={myStats.below}
              equalCount={myStats.equal}
              aboveCountStrict={myStats.above}
              positionClass={myClass.position}
              tieContext={myClass.tieContext}
              statsLoading={statsLoading}
              onOpenChange={setPersonalOpen}
            />
          </div>
        </Html>
      )}
    </>
  );
}
