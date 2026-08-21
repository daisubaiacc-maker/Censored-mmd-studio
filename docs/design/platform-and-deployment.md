# Platform and Deployment Direction

## Core product model

Censored MMD Studio is a web application built around browser graphics APIs (Three.js/WebGL, with room for future graphics API evolution).

The application should be usable from a normal browser without requiring the end user to run a local development server.

## Target usage

The primary workflow is:

- PC: full Studio authoring and detailed scene/model setup.
- Smartphone/tablet: quickly open the published web app, view/play created scenes in Experience mode, and perform lighter Studio editing when convenient.

The same application and project architecture should support both. Device performance differences should be handled through normal optimization later, not by making mobile a separate product or forcing a mobile-specific architecture now.

## Deployment goal

The project should be deployable as a static web application so that a user can open the published project site directly in a browser.

GitHub Pages is the intended initial deployment target. The desired development-to-use flow is:

```text
GitHub repository
      |
      v
build
      |
      v
static web application
      |
      v
GitHub Pages
      |
      +---- PC browser
      |
      +---- Smartphone/tablet browser
```

The repository page and the deployed application page are distinct concerns. The repository contains source and development materials; the Pages site is the user-facing application.

## Architectural implication

Do not make a local server a runtime requirement for end users. Local servers may be used during development, but production assets and application code should be capable of being served as static files.

Asset loading, routing, and build output should therefore remain compatible with static hosting and a repository-subpath deployment such as GitHub Pages.

## Product philosophy

Build and author on PC, then open the same web application on a phone for convenient viewing, Experience play, or small Studio adjustments. Do not create separate PC and mobile codebases unless a future concrete requirement makes that necessary.
