# Render Passes

The engine loop imports from these pass folders so the frame pipeline stays readable.

`../cache/`
Owns shared offscreen canvas cache mechanics. Pass folders still decide keys, bounds, bake behavior, and draw behavior.

`background/`
Draws the static scene base: base color, gradients, anchors, and cached background fills.

`atmosphere/`
Draws air-like effects that sit behind scene objects right now: stars and fog washes.

`ambient-particles/`
Draws scene-level animated particles such as dust, pollen, wind flecks, or rain streaks.

`foliage/`
Draws optional static plant-detail layers from scene rules.

`light/`
Draws scene-wide light overlays. Per-shape light response still belongs inside the shape color pass.

`shape/`
Draws scene items. This is where item ordering, the shape gradient cache,
far-shape bitmap caching, and depth mask overlays live.

`shared/`
Small helpers used by multiple passes. These are not a pass by themselves.
