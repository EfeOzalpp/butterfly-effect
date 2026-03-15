import React from "react";
import { Html } from "@react-three/drei";
import { SpriteShape } from "../../sprites/entry";
import GamificationPersonalized from "../../gamification/gamification-personal";

type PersonalizedLayerProps = {
  shouldRenderPersonalUI: boolean;
  shouldRenderExtraPersonalSprite: boolean;
  effectiveMyPoint: any;
  effectiveMyEntry: any;
  spriteScale: number;
  bagSeed: string;
  offsetPx: number;
  myDisplayValue: number;
  mode: "absolute" | "relative";
  section: string;
  myStats: { below: number; equal: number; above: number };
  myClass: { position: string; tieContext: string };
  setPersonalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode?: boolean;
};

export default function PersonalizedLayer({
  shouldRenderPersonalUI,
  shouldRenderExtraPersonalSprite,
  effectiveMyPoint,
  effectiveMyEntry,
  spriteScale,
  bagSeed,
  offsetPx,
  myDisplayValue,
  mode,
  section,
  myStats,
  myClass,
  setPersonalOpen,
  darkMode = false,
}: PersonalizedLayerProps) {
  if (!shouldRenderPersonalUI) return null;

  return (
    <>
      {shouldRenderExtraPersonalSprite && effectiveMyPoint && (
        <group position={effectiveMyPoint.position}>
          <SpriteShape
            avg={
              Number.isFinite(effectiveMyEntry?.avgWeight)
                ? Number(effectiveMyEntry.avgWeight)
                : 0.5
            }
            position={[0, 0, 0]}
            scale={spriteScale}
            tileSize={128}
            alpha={215}
            blend={0.6}
            seed={bagSeed}
            orderIndex={0}
            freezeParticles={true}
            particleStepMs={33}
            particleFrames={219}
            darkMode={darkMode}
          />
        </group>
      )}

      {effectiveMyPoint && (
        <Html
          position={effectiveMyPoint.position}
          center
          zIndexRange={[110, 130]}
          style={{
            pointerEvents: "none",
            ["--offset-px" as any]: `${offsetPx}px`,
          }}
        >
          <div>
            <GamificationPersonalized
              userData={effectiveMyEntry}
              percentage={myDisplayValue}
              color={effectiveMyPoint.color}
              mode={mode}
              selectedSectionId={section}
              belowCountStrict={myStats.below}
              equalCount={myStats.equal}
              aboveCountStrict={myStats.above}
              positionClass={myClass.position}
              tieContext={myClass.tieContext}
              onOpenChange={setPersonalOpen}
            />
          </div>
        </Html>
      )}
    </>
  );
}
