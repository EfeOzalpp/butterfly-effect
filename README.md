### Butterfly Effect

A weight-based questionnaire feeds continuous input into a deterministic 2D rendering system, whose output is reused as sprite textures in a Three.js scene visualizing both personalized and previous responses. 

The system is intentionally divided between a generation phase and a real-time visualization phase.

<p>
  <img src="./screenshots+gifs/survey.gif" width="49%" />
  <img src="./screenshots+gifs/visualization.gif" width="49%" />
</p>

Live at: https://butterflyeff3ct.online/

Notable implementations:
- 2D rendering pipeline used to generate reproducible visuals from continuous survey input.
- Grid-based layout system enforcing spatial constraints and preventing overlap with UI elements.
- Off-screen canvas rendering reused as sprite textures inside a Three.js scene.
- Texture caching and variant limiting to control GPU cost and avoid redundant generation.

#### Key code entry points: 

2D canvas: https://github.com/EfeOzalpp/butterfly-effect/tree/main/frontend/src/canvas-engine 

3D scene: https://github.com/EfeOzalpp/butterfly-effect/tree/main/frontend/src/graph-runtime

