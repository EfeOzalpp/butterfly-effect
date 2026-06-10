# Spotlight Rules

Spotlight rules define slide-authored scene variants for the spotlight canvas: background, particles, foliage, and dark-mode counterparts.

## Important Files

- `types.ts` - `SpotlightSlide` contract.
- `slides/index.ts` - exports `SPOTLIGHT_SLIDES`.
- `slides/*.ts` - one authored slide per featured subject.

## Call Tree

```txt
spotlight scene profile
  -> backgrounds/spotlight.ts
     -> variants from SPOTLIGHT_SLIDES backgrounds
  -> ambient-particles and foliage variants
     -> runtimeSceneVariants picks slide by spotlight.index
        -> render passes receive the active slide specs
```

## Contracts

External lookup:

```ts
SPOTLIGHT_SLIDES: readonly SpotlightSlide[]
```

Spec schema:

```ts
SpotlightSlide {
  id
  title
  background
  darkBackground
  ambientParticles?
  darkAmbientParticles?
  foliage?
  darkFoliage?
}
```

Rule: slide files author content. Runtime only selects a variant by spotlight signal; it does not know slide-specific art decisions.
