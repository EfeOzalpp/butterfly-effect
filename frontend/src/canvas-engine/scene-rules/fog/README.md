# Fog Rules

Fog rules describe atmosphere overlays that sit between the background and shapes. Fog can be left as default, authored per scene, or disabled through engine style.

Important distinction:

- `sceneProfile.fog === null` means "use default fog behavior."
- `engine.style.fog === false` means "do not draw fog."

## Default Fog

```ts
export const FOG = {
  start: {},
  questionnaire: {},
  city: {},
  spotlight: null,
};
```

An empty object uses default colors and opacity. `null` also allows the runtime default path.

## Authored Dark Fog

```ts
const DARK_FOG: FogSceneSpec = {
  lightRadiusK: 0.13,
  sky: {
    color: { r: 33, g: 32, b: 40 },
    skyGradient: {
      leftEdgeColor: { r: 55, g: 58, b: 72 },
      rightEdgeColor: { r: 14, g: 10, b: 32 },
      innerRadiusK: 0.13,
    },
  },
  ground: {
    color: { r: 33, g: 32, b: 40 },
    groundGradient: {
      leftEdgeColor: { r: 52, g: 54, b: 54 },
      rightEdgeColor: { r: 15, g: 9, b: 30 },
      innerRadiusK: 0.13,
    },
  },
};
```

Use `sky` and `ground` when a scene has a horizon. Flat canvases may still use fog, but the runtime does not need horizon-specific calculations when `horizonPos` is absent.

## Explicit Gradient Stops

```ts
const FOG_WITH_STOPS: FogSceneSpec = {
  ground: {
    color: { r: 33, g: 32, b: 40 },
    groundGradient: [
      { k: 0, color: { r: 68, g: 70, b: 88 } },
      { k: 1, color: { r: 18, g: 18, b: 28 } },
    ],
  },
};
```

Use explicit stops when the gradient should be authored independent of the environment light helper.

## Environment Light Gradient

The fog pass can derive a centered gradient from a declared environment light shape. Shape metadata declares the light source and color, and the runtime uses the rendered item position to center the fog highlight.

This keeps scene authors from hardcoding "center glow" values that drift when the light object moves.

