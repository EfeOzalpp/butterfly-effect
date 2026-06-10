# Modifiers

Modifiers are reusable drawing/math helpers for shapes and render passes. They provide primitives, not scene ownership or runtime state.

## Important Files

- `index.ts` - public modifier barrel used by shapes and runtime passes.
- `projection/` - footprint and grid projection helpers.
- `lighting/` - `SceneLightContext`, light sampling, and directional light helpers.
- `color-modifiers/` - blending, exposure/contrast, fog/tint helpers.
- `shape-modifiers/` - reusable shape envelopes and transform modifiers.
- `particles/` - particle store contracts and perspective helpers.

## Call Tree

```txt
shape file or render pass
  -> import helper from modifiers/index.ts
     -> projection/color/lighting/particles helper
        -> return resolved draw values
        -> caller performs actual drawing
```

Lighting path:

```txt
engine/loop.ts
  -> createSceneLightContext
     -> shape style.lightCtx
        -> shape samples surfaces with lighting helpers
```

## Contracts

External API:

```ts
SceneLightContext
ProjectionContext
ParticleStore
applySrgbExposureContrast(...)
blendRGB(...)
footprintToPx(...)
sampleDirectionalLightRect(...)
shapeColorForRenderPass(...)
shouldDrawInRenderPass(...)
```

Rule: modifiers may calculate values and provide small draw helpers. They should not know scene lookup keys, runtime cache keys, or app state.
