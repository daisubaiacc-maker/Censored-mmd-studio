# Studio / First-Person Seamless Experience

## Core concept

Censored MMD Studio is intended to support two closely related experiences rather than treating them as separate applications:

1. **Studio mode** — compose scenes, poses, lighting, camera, backgrounds, censorship targets, and reusable presets.
2. **First-person adventure mode** — enter the composed/default game world and experience it from a first-person camera.

The transition between the two should be seamless at the scene/state level. A scene prepared in Studio should be usable as an adventure space without rebuilding it for a second runtime.

## Scene model

A scene should be able to contain:

- MMD characters and their animation/pose state
- Bone/mesh/object target metadata
- Background/environment assets
- Lighting and camera presets
- Interaction/perception rules
- Censorship regions and their bindings
- Optional gameplay/interaction metadata
- Saved presets or a default-world configuration

The editor should modify the same underlying scene representation that first-person mode consumes.

## Two camera experiences

### Studio / photography

Studio mode uses an explicit camera and editing controls. Pointer-based focus can be used as a photography effect: the user can place the focus point on a subject while the rest of the scene receives depth-of-field treatment.

### First-person

First-person mode places the camera inside the scene. The pointer/crosshair effectively becomes the user's gaze/focus proxy. This makes the layered perception system especially meaningful:

- A target can be inside the field of view without being the optical focus.
- A peripheral target can still be visually perceived.
- A target near the focus point can be recognizable even when slightly defocused.
- Moving the focus toward a target can transition it from recognizable to focused.
- Censorship rules may trigger on view entry, recognition, or focused observation depending on the scene configuration.

## Perception and censorship

Optical focus must remain separate from censorship state.

Conceptually:

```text
Camera / Pointer
      |
      +--> Field of View
      |       |
      |       +--> peripheral
      |       +--> recognizable
      |
      +--> Focus distance
              |
              +--> focused

Perception state
      |
      +--> Observation rules
              |
              +--> Censorship activation
                      |
                      +--> Region / Mosaic compositor
```

This means depth-of-field is not itself censorship. A region can be visually blurred because it is outside the current focal plane while remaining uncensored. If a configured perception/observation rule says that entering the field of view or becoming recognizable is sufficient to activate protection, censorship can activate independently of optical focus.

## Design goals

- One scene representation for Studio and first-person runtime.
- Camera mode should be replaceable without duplicating scene data.
- Perception rules should be scene-configurable rather than hard-coded to one game mode.
- Censorship remains a first-class subsystem, not an afterthought in the renderer.
- Studio photography and first-person play should share the same focus/perception/censorship pipeline.
- Presets and a default game world should use the same underlying scene format.

## Future extensions

Potential future systems include:

- switching between Studio camera and first-person camera without reloading the scene
- first-person movement and interaction
- gaze/focus smoothing
- configurable field-of-view and recognition radius
- scene-specific perception rules
- scripted encounters/events
- saved Studio setups that become playable locations
- default adventure worlds built from the same Studio tooling
