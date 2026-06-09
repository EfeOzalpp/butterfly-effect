# Render Cache Policy

Render cache policy describes what the runtime may cache and what must stay live.

This belongs to runtime because it controls frame cost, cache memory, bake
budgets, and shape pass reuse. It is not authored scene content like placement,
backgrounds, fog, or ambient particles.

## Default Policy

```ts
export const DEFAULT_RENDER_CACHE_POLICY: RenderCachePolicy = {
  farShapeBitmap: {
    enabled: true,
    farSizeK: 0.5,
    maxPixelsPerCanvasPixel: 3,
    maxBakesPerFrame: 24,
    alwaysLiveShapes: ["snow", "power", "sun", "house"],
  },
  shapeDepthMask: {
    maxPixelsPerCanvasPixel: 5,
    maxBakesPerFrame: 32,
    minBlend: 0.08,
    alwaysLiveShapes: ["power"],
  },
};
```

## Far Shape Bitmap Cache

Far-shape bitmap caching freezes small distant shapes after their first stable
draw.

Use it for:

- tiny background buildings
- far cars
- static decorative objects

Avoid it for:

- particle-heavy shapes
- shapes with visible continuous animation
- environment lights

## Shape Depth Mask Cache

Depth masks are cached separately from the color pass. That lets animated color
details keep moving while the depth tint layer avoids rebuilding every frame.

`maxBakesPerFrame` controls warmup pressure. A lower number spreads work over
more frames; a higher number warms faster but can spike startup or filter
changes.

## Field Meanings

- `farSizeK`: screen-size threshold for bitmap caching.
- `maxPixelsPerCanvasPixel`: memory budget scaled by visible canvas size.
- `maxBakesPerFrame`: per-frame cache bake budget.
- `alwaysLiveShapes`: opt-out list for shapes that should not be cached by that policy.
- `minBlend`: skip depth overlays below this visible contribution.
