# Player Kinematics and Collision Design

## Goal

The first-person experience should feel like controlling a normal human character, without requiring a full physics simulation.

The project does **not** currently need general-purpose rigid-body physics. It does need deterministic collision, grounded movement, camera/body constraints, and human-plausible motion.

## Core principle

Separate three concerns:

1. **Collision / locomotion** — where the player can move.
2. **Character kinematics** — how the body and camera are allowed to move.
3. **Physics** — optional future subsystem, not a dependency of basic movement.

A capsule-style player controller with sweep tests is sufficient for the initial implementation.

## Required constraints

The player should not:

- remain suspended in mid-air without a gameplay reason
- move through solid world geometry
- instantly snap to arbitrary heights
- rotate the body/camera into anatomically implausible orientations
- maintain impossible body poses merely because a camera transform allows it

Examples such as being approximately 1 cm above the floor while looking upward at an extreme angle should be treated as a **character/pose constraint problem**, not solved by adding arbitrary rigid-body physics.

## Proposed player representation

```text
PlayerController
  |
  +-- Collision shape (capsule)
  |
  +-- Locomotion state
  |     +-- grounded
  |     +-- falling
  |     +-- blocked
  |
  +-- Character kinematics
  |     +-- root position
  |     +-- body yaw
  |     +-- head/camera pitch limits
  |     +-- stance / eye height
  |
  +-- First-person camera
        +-- eye position derived from character
        +-- constrained pitch
        +-- optional head/neck animation
```

## Grounding

Use collision queries/sweep tests to determine the ground contact and maintain a stable grounded state. Do not fake grounding by forcing the camera to an arbitrary Y coordinate.

The player's eye position should be derived from the character's stance and root transform. A small controlled eye offset is acceptable for camera smoothing, but it must remain within a defined human movement envelope.

## Rotation constraints

First-person camera rotation should not be treated as an unconstrained transform independent of the body.

At minimum:

- body yaw can rotate freely within the normal locomotion model
- head/camera pitch has configurable anatomical limits
- extreme pitch can cause body/head animation to compensate rather than allowing an impossible neck angle
- optional turn-in-place behavior can rotate the body when the view exceeds a configurable yaw threshold

This lets the game preserve a believable human relationship between the player's body and view direction.

## Animation integration

The controller should drive a kinematic animation layer rather than directly teleporting bones.

```text
Input
  ↓
Locomotion / Collision
  ↓
Character state
  ↓
Animation controller
  ↓
Body / head pose
  ↓
Camera
```

The animation system can later add foot placement, turning, idle sway, head tracking, and other natural movement without changing collision rules.

## Studio interaction

Studio mode does not need to inherit player locomotion constraints when posing an MMD character. Studio posing is an authoring operation.

However, when a scene is entered through first-person mode, the player camera and movement controller must obey the first-person kinematic constraints.

This distinction is important:

- **Studio pose freedom** = authoring freedom.
- **First-person player movement** = human-constrained runtime behavior.

## Future extension

If a later feature genuinely requires physical simulation, it should be introduced behind a physics abstraction. Basic player locomotion must remain usable without it.
