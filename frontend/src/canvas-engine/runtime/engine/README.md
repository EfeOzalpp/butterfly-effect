# Engine

This folder owns the runtime engine core. It is not the art layer. It should mostly coordinate state, scheduling, lifecycle, and the frame loop.

Files:

```txt
types.ts            public engine controls and start options
field.ts            shape item payload consumed by the renderer
state.ts            engine-owned default state factories
loop.ts             per-frame orchestration
scheduler.ts        shared frame scheduling
itemLifecycle.ts    appear/replay lifecycle for field items
```

Rule of thumb:

Public caller-facing contracts live in `types.ts`.
The item payload lives in `field.ts`.
Mutable runtime defaults live in `state.ts`.
Frame-only helper types can stay local to `loop.ts`. Runtime ownership contracts
should live with the runtime folder that owns them; `loop.ts` composes those into
its inbound deps.
Mount creation and active mount ownership live in `platform/mount.ts`, not here.

If a type is only needed by one helper, keep it in that helper. Move it here only when it becomes part of the engine contract.
