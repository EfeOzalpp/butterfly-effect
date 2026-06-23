# Server Rendering

This folder owns the server-side HTML document boundary.

- `streamDocument.tsx` streams the app document with React 18 `renderToPipeableStream`.
- `entry-server.tsx` is the Vite-built React server entry consumed by the Express runtime.
- `assetManifest.ts` reads Vite's client manifest so the streamed document can point at the current JS/CSS assets.
- Future SSR work belongs here: critical CSS injection, hydration data serialization, and route-specific document data.
- `src/server` should stay focused on HTTP setup, API routes, security, static assets, and upstream services.

The production server uses `express.static(..., { index: false })` so this folder remains the only path that answers app document requests.
