# Model Semantic Mapping

## Purpose

Model anatomy and clothing must be mapped to semantic regions once when a model is imported. Runtime censorship should consume this mapping rather than performing real-time visual/anatomical recognition.

## Automatic analysis is only an initial guess

The importer may inspect:

- Mesh and node names
- Scene hierarchy and parent/child relationships
- Bone relationships
- VRM/MMD metadata
- Materials and other model metadata
- Geometry/location heuristics as a last-resort hint

Possible initial semantic categories include:

- `chest`
- `groin`
- `buttocks`
- `face`
- `upperClothing`
- `lowerClothing`
- `customProtected`

Automatic classification is expected to be imperfect. It must never be treated as authoritative.

## User correction is a first-class workflow

After import, the Studio should expose the model's Mesh/Node hierarchy and allow the user to select a Mesh or Node and immediately assign or change its semantic role.

Example workflow:

```text
Import model
  -> Automatic semantic analysis
  -> Review map
  -> Select Mesh/Node
  -> Assign "Chest", "Groin", "Clothing", or Custom Protected
  -> Save mapping
```

The correction workflow should be quick enough that a wrong automatic classification is not a meaningful obstacle.

## Visibility and censorship integration

Visibility is a general model-editing capability, not a censorship-only feature. A clothing Mesh/Node can be hidden in Studio, and that state change may be observed by the censorship rule system.

Example:

```text
Clothing.Top becomes hidden
        |
        v
Semantic mapping identifies protected chest region
        |
        v
Configured censorship rule activates protection
        |
        v
Censorship compositor applies the configured effect
```

The system should not scan the rendered image to rediscover the body region after clothing visibility changes. The protected region is already known from the semantic map.

## Data ownership and persistence

Semantic mappings should be persistable per model, with room for project/scene overrides later.

Conceptually:

```text
Model defaults
      |
      v
Project overrides
      |
      v
Scene-specific overrides
```

A model-specific semantic map may be stored alongside the model asset (for example as a metadata/JSON sidecar) so a corrected mapping can be reused on subsequent imports.

## Important design boundary

Do not couple semantic labels directly to the censorship renderer. The semantic layer answers **what a Mesh/Node represents**. The censorship rule layer decides **when and how that semantic region is protected**.

This separation allows future uses such as clothing visibility, accessories, hair variants, focus targets, interaction targets, and custom protected regions without rewriting the censorship renderer.
