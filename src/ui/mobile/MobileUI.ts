import type { StudioUIElements } from '../StudioUI';

export type MobileUIElements = StudioUIElements;

export function createMobileUI(app: HTMLElement): MobileUIElements {
  app.innerHTML = `
    <main class="mobile-studio-shell">
      <header class="mobile-studio-header">
        <button id="mobile-menu-button" type="button" aria-label="Menu">☰</button>
        <strong id="studio-title"></strong>
        <div class="mobile-header-actions">
          <button id="save-project-button" type="button">保存</button>
          <button id="load-project-button" type="button">読み込み</button>
        </div>
        <input id="project-file-input" type="file" accept="application/json,.json" hidden />
        <label class="mobile-locale"><span id="language-label" class="sr-only"></span><select id="locale-select"><option value="ja"></option><option value="en"></option></select></label>
      </header>

      <section id="viewport" class="mobile-studio-viewport" aria-label="3D viewport"></section>

      <aside class="mobile-zoom-control" aria-label="Camera zoom">
        <input id="camera-zoom" type="range" min="0" max="1" step="0.001" value="0.5" aria-label="Camera zoom" />
      </aside>

      <form id="model-form" class="mobile-model-loader">
        <input id="model-file" type="file" accept=".zip,application/zip,application/x-zip-compressed" />
        <button id="load-model-button" type="submit"></button>
        <span id="model-status" role="status" aria-live="polite"></span>
      </form>

      <section class="mobile-mode-bar" aria-label="Studio mode">
        <button type="button" class="mobile-mode-button is-active" data-mobile-mode="camera">Camera</button>
        <button type="button" class="mobile-mode-button" data-mobile-mode="model">Model</button>
        <button type="button" class="mobile-mode-button" data-mobile-mode="region">Region</button>
      </section>

      <section class="mobile-context-panel" aria-label="Current mode controls">
        <div class="mobile-model-controls" data-mobile-panel="model">
          <select id="model-select" aria-label="Model selection"><option value=""></option></select>
          <select id="transform-mode" aria-label="Transform mode"><option value="translate">Move</option><option value="rotate">Rotate</option><option value="scale">Scale</option></select>
          <div class="mobile-transform-buttons">
            <button type="button" data-axis="x" data-sign="-1">X−</button><button type="button" data-axis="x" data-sign="1">X+</button>
            <button type="button" data-axis="y" data-sign="-1">Y−</button><button type="button" data-axis="y" data-sign="1">Y+</button>
            <button type="button" data-axis="z" data-sign="-1">Z−</button><button type="button" data-axis="z" data-sign="1">Z+</button>
          </div>
        </div>

        <div class="mobile-region-controls" data-mobile-panel="region">
          <button id="censorship-edit-button" type="button">検閲対象を選択</button>
          <select id="censorship-size-mode"><option value="model">モデル追従</option><option value="screen">画面固定</option></select>
          <button id="censorship-billboard-button" type="button" disabled>Billboard OFF</button>
          <label>モザイク粒度 <input id="censorship-pixel-size" type="range" min="2" max="64" step="1" value="18" /></label>
          <span id="censorship-status" role="status" aria-live="polite"></span>
        </div>

        <div class="mobile-camera-controls" data-mobile-panel="camera">
          <span>カメラ操作: 1本指ドラッグで回転</span>
        </div>
      </section>
    </main>`;

  return {
    root: app,
    viewportElement: app.querySelector<HTMLElement>('#viewport')!,
    form: app.querySelector<HTMLFormElement>('#model-form')!,
    modelFile: app.querySelector<HTMLInputElement>('#model-file')!,
    status: app.querySelector<HTMLSpanElement>('#model-status')!,
    localeSelect: app.querySelector<HTMLSelectElement>('#locale-select')!,
    title: app.querySelector<HTMLElement>('#studio-title')!,
    languageLabel: app.querySelector<HTMLElement>('#language-label')!,
    loadModelButton: app.querySelector<HTMLButtonElement>('#load-model-button')!,
    saveProjectButton: app.querySelector<HTMLButtonElement>('#save-project-button')!,
    loadProjectButton: app.querySelector<HTMLButtonElement>('#load-project-button')!,
    projectFileInput: app.querySelector<HTMLInputElement>('#project-file-input')!,
    modelSelect: app.querySelector<HTMLSelectElement>('#model-select')!,
    transformMode: app.querySelector<HTMLSelectElement>('#transform-mode')!,
    cameraZoom: app.querySelector<HTMLInputElement>('#camera-zoom')!,
    censorshipEditButton: app.querySelector<HTMLButtonElement>('#censorship-edit-button')!,
    censorshipStatus: app.querySelector<HTMLSpanElement>('#censorship-status')!,
    censorshipSizeMode: app.querySelector<HTMLSelectElement>('#censorship-size-mode')!,
    censorshipBillboardButton: app.querySelector<HTMLButtonElement>('#censorship-billboard-button')!,
    censorshipPixelSize: app.querySelector<HTMLInputElement>('#censorship-pixel-size')!,
  };
}
