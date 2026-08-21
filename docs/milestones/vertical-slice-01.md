# Vertical Slice 01 — Studio Project Loop

## Goal

Reach the first practical checkpoint before bundled-model and smartphone testing.

## Definition of done

- [x] Project data structure exists with format versioning.
- [x] Runtime models can be registered in project scene state.
- [x] Scene model transforms and visibility can be captured/restored.
- [x] Browser project JSON save/load helpers exist.
- [x] Project store and snapshots exist for future editing/history.
- [x] UI localization foundation exists (Japanese first, English available).
- [ ] Expose save/load actions in the Studio UI.
- [ ] Restore loaded project state into runtime models.
- [ ] Add basic model selection and transform editing.
- [ ] Add a redistribution-safe bundled test model.
- [ ] Build and publish through GitHub Pages.
- [ ] Test the published application on a smartphone browser.

## Scope rule

Do not expand into full Experience/first-person, Focus/Perception, advanced censorship, or physics before this checkpoint is usable end-to-end. Those systems remain architectural targets and can be implemented after the first real-device test.

## Test target

The first real-device test should answer practical questions about WebGL loading, asset delivery, touch/browser behavior, viewport sizing, and static hosting before deeper feature development continues.
