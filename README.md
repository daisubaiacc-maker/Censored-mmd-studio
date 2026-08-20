# Censored MMD Studio

Browser-based MMD studio for loading PMX/PMD models, posing characters, controlling cameras, and experimenting with visual censorship effects such as mosaic overlays.

## Project goals

- Load and display MMD PMX/PMD models in a browser.
- Provide a studio-like viewport for posing and camera work.
- Keep model, rendering, studio, and censorship systems modular.
- Treat censorship as a first-class visual effect rather than an afterthought.

## Planned architecture

```text
src/
├── core/          # Shared application state and utilities
├── mmd/           # PMX/PMD loading, model data, bones and animation
├── renderer/      # Three.js/WebGL rendering pipeline
├── studio/        # Viewport, camera, lights and posing UI
└── censorship/    # Mosaic, mask and other censorship effects
```

## Development roadmap

1. Establish the web application shell.
2. Load and render a PMX/PMD model.
3. Add camera controls and basic studio lighting.
4. Add bone selection and pose manipulation.
5. Add censorship regions and mosaic rendering.
6. Add scene save/load and photography/export features.

## Status

Early-stage prototype. Architecture is intentionally lightweight and subject to change as the rendering and MMD requirements become clearer.
