# Render Cache Policy

Cache policy owns runtime knobs for what may cache, how much memory it may use, and how quickly missing entries may bake.

## Important Files

- `types.ts` - `RenderCachePolicy`, `FarShapeBitmapCachePolicy`, and `ShapeDepthMaskCachePolicy`.
- `index.ts` - `DEFAULT_RENDER_CACHE_POLICY` and always-live shape lists. Upstream: scene profile resolution; downstream: `shapeRenderCache`.

## Call Tree

```txt
scene-rules/resolver
  -> SceneProfile.renderCache
     -> runtime/index.ts setSceneProfile
        -> engine/loop.ts createShapeRenderCache(() => profile.renderCache)
           -> farShapeBitmap policy
           -> shapeDepthMask policy
```

## Contracts

External API:

```ts
RenderCachePolicy {
  farShapeBitmap: {
    enabled
    farSizeK
    maxPixelsPerCanvasPixel
    maxBakesPerFrame
    alwaysLiveShapes
  }
  shapeDepthMask: {
    maxPixelsPerCanvasPixel
    maxBakesPerFrame
    minBlend
    alwaysLiveShapes
  }
}
```

Default lookup:

```ts
DEFAULT_RENDER_CACHE_POLICY
```

Rule: policy does not draw and does not build keys. It only tells cache strategies what they are allowed to reuse.
