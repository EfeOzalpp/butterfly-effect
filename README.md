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

<br />

Each step below corresponds to the screenshots shown from left to right.
<br />
Onboarding | Questionnaire | "Your city" button toggled state
<br />
<p>
  <img src="./screenshots+gifs/mobile1.png" width="25%" />
  <img src="./screenshots+gifs/mobile3.png" width="25%" />
  <img src="./screenshots+gifs/mobile4.png" width="25%" />
</p>

<br />

3D scene entered from "explore answers" or 3D scene entered through survey completion | 
<br />
Solo mode and dark mode toggled separately
<br />
<p>
  <img src="./screenshots+gifs/mobile5.png" width="25%" />
  <img src="./screenshots+gifs/mobile8.png" width="25%" />
  <img src="./screenshots+gifs/mobile9.png" width="25%" />
</p>

