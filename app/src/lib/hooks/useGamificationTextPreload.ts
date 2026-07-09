// src/utils/GamificationCopyPreloader.tsx
import { useGeneralPools, usePersonalizedPools } from './useGamificationPools';

export default function GamificationCopyPreloader() {
  // Mounting both hooks starts one shared cached fetch for all gamification copy.
  useGeneralPools();
  usePersonalizedPools();

  // no UI
  return null;
}
