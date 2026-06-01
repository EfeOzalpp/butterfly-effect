# Ambient Particles

Ambient particles are optional scene-level motion layers. They are for dust,
pollen, wind flecks, or similar air texture that should not belong to a shape.

They are intentionally separate from `fog` and `foliage`:

- `fog` changes the scene atmosphere and light diffusion.
- `foliage` is currently a static flat decorative layer.
- `ambient-particles` draws lightweight animated particles over the background.

## Basic Shape

```ts
const busAmbientParticles = {
  layers: [
    {
      count: [18, 34],
      xRange: [0.08, 0.92],
      yRange: [0.18, 0.82],
      sizePx: [1, 2.4],
      speedX: [4, 10],
      speedY: [-2, 4],
      color: [
        { color: "rgb(255, 255, 230)", alpha: 0.18 },
        { color: "rgb(190, 220, 200)", alpha: 0.12 },
      ],
      seed: 12,
    },
  ],
};
```

## Fields

- `count`: Fixed count or `[low, high]` controlled by `liveAvg`.
- `xRange`: Horizontal normalized range. `0` is left, `1` is right.
- `yRange`: Vertical normalized range. `0` is top, `1` is bottom.
- `sizePx`: Particle radius range in pixels.
- `speedX`: Horizontal motion speed range in pixels per second.
- `speedY`: Vertical motion speed range in pixels per second.
- `color`: One color or a rotating list of color stops.
- `alpha`: Optional fallback alpha for string colors.
- `seed`: Stable authored seed so motion remains deterministic.

## Spotlight Variants

Spotlight slides can own their own ambient particles:

```ts
export const busSlide = {
  id: "bus",
  shape: "bus",
  background,
  darkBackground,
  ambientParticles: busAmbientParticles,
  padding,
  placement,
};
```

Slides without `ambientParticles` render none.
