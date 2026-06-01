# Foliage Scene Rules

Foliage rules describe optional background plant detail. They are independent
from fog: disabling fog should not remove foliage, and adding foliage should not
add haze or depth wash.

```ts
const FOLIAGE_START_DARK: FoliageSceneSpec = {
  layers: [
    {
      count: [24, 48],
      yK: { anchor: "visualHorizon", offset: 0.03 },
      xRange: [0.05, 0.95],
      heightPx: [10, 28],
      widthPx: [3, 7],
      color: [
        { color: "rgb(90, 128, 104)", alpha: 0.34 },
        { color: "rgb(72, 110, 96)", alpha: 0.28 },
      ],
      seed: 14,
    },
  ],
};
```

`yK` uses the same anchor syntax as background stops. Use
`"visualHorizon"` or `{ anchor: "visualHorizon", offset: 0.04 }` when the
foliage should follow the authored sky/ground split.

`count` may be fixed or a `[low, high]` range driven by the engine live average.
The renderer keeps generated positions stable and only changes how many
precomputed foliage pieces are drawn.
