# Sprite GPU Memory Note

Observed GPU memory measurements for the dotgraph sprite system should be kept
separate from the DevTools heap/object-retention note.

These numbers refer to GPU-side memory readings gathered from system/browser GPU
reporting during max-sprite testing, not JS heap snapshots.

Current test condition: measurements were taken with the sprite scene capped at
`300` visible sprites.

## Main Takeaway

- Optimized sprite path at `300` visible sprites: about `450 MB`
- Cache-safe reduced-optimization path at `300` visible sprites: about `650 MB`

This suggests the optimization layers save roughly `200 MB` of observed GPU
memory in the tested max-sprite scenario.

## Important Distinction

- `sprite cache` is effectively runtime-essential in the current implementation.
  Turning it off creates leak-like texture-retention behavior and does **not**
  produce a fair optimization benchmark.
- `quantization` and `material cache` are the optimization layers that should be
  compared when benchmarking the sprite system.

## Benchmark Framing

Recommended comparison:

- Baseline optimized:
  - sprite cache on
  - quantization on
  - material cache on
- Reduced-optimization comparison:
  - sprite cache on
  - quantization off
  - material cache off

This keeps the runtime in a stable/safe mode while still isolating the real
optimization gains.

## Theme Toggle Note

Theme switching can increase GPU memory temporarily while alternate light/dark
sprite variants are populated. In testing, that growth appeared to taper toward
a plateau rather than continue linearly, which suggests cache fill rather than
an unbounded leak.
