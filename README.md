## Butterfly Effect

This project connects a weighted questionnaire to a deterministic 2D rendering system.  
That 2D output is then reused as sprite textures in a Three.js scene to visualize both personalized and previous responses.

I built it around two phases:
- generation (2D canvas + placement logic)
- real-time visualization (3D graph scene)

<p>
  <img src="./screenshots+gifs/survey.gif" width="49%" />
  <img src="./screenshots+gifs/visualization.gif" width="49%" />
</p>

Live: https://butterflyeff3ct.online/

## What I implemented

- A 2D rendering pipeline that generates reproducible visuals from continuous survey input.
- A grid-based layout system with spatial constraints to avoid overlap with UI regions.
- Off-screen canvas rendering reused as sprite textures in Three.js.
- Texture caching + variant limiting to reduce GPU overhead and avoid redundant work.

## Key code entry points

- 2D canvas engine: https://github.com/EfeOzalpp/butterfly-effect/tree/main/frontend/src/canvas-engine
- 3D graph runtime: https://github.com/EfeOzalpp/butterfly-effect/tree/main/frontend/src/graph-runtime

## Run locally

1. `cd frontend`
2. `npm install`
3. `npm start`

