# Spotlight Scene Rules

Spotlight is an authored scene-rule preset, not a core runtime primitive. The runtime still consumes normal scene rules: `background`, `placements`, `padding`, and `fog`, while cache policy stays runtime-owned.

`slides/` centralizes the content-level relationship between a featured shape, its background, and its placement.

Slide file names use numeric prefixes so the authoring order is visible in the folder:

```txt
slides/
  01-villa.ts
  02-bus.ts
  03-sea.ts
  index.ts
```

`slides/index.ts` imports those files in numeric order. The file names communicate order; the exported array is the order the runtime receives.

```ts
export const SPOTLIGHT_SLIDES = [
  villaSlide,
  busSlide,
  seaSlide,
] as const;
```

The engine-facing rule files derive from this list:

- `backgrounds/spotlight.ts` maps slides to background variants.
- `placement-rules/spotlight.ts` maps slides to placement variants.

This keeps Spotlight's art-directed slide model in one place without making the canvas engine runtime understand "slides."
