import type { Locale } from '../../i18n';

export interface PCUIElements {
  root: HTMLElement;
  viewportElement: HTMLElement;
  form: HTMLFormElement;
  modelFile: HTMLInputElement;
  status: HTMLSpanElement;
  localeSelect: HTMLSelectElement;
  title: HTMLElement;
  languageLabel: HTMLElement;
  loadModelButton: HTMLButtonElement;
  saveProjectButton: HTMLButtonElement;
  loadProjectButton: HTMLButtonElement;
  projectFileInput: HTMLInputElement;
  modelSelect: HTMLSelectElement;
  transformMode: HTMLSelectElement;
  cameraZoom: HTMLInputElement;
  censorshipEditButton: HTMLButtonElement;
  censorshipStatus: HTMLSpanElement;
  censorshipSizeMode: HTMLSelectElement;
  censorshipBillboardButton: HTMLButtonElement;
  censorshipPixelSize: HTMLInputElement;
}

export function createPCUI(app: HTMLElement): PCUIElements {
  app.innerHTML = `
    <main class="studio-shell">
      <header class="studio-toolbar">
        <strong id="studio-title"></strong><span id="studio-mode">Studio</span>
        <label><span id="language-label" class="sr-only"></span><select id="locale-select"><option value="ja"></option><option value="en"></option></select></label>
        <button id="save-project-button" type="button">保存</button><button id="load-project-button" type="button">読み込み</button>
        <input id="project-file-input" type="file" accept="application/json,.json" hidden />
        <form id="model-form" class="model-loader-form"><input id="model-file" type="file" accept=".zip,application/zip,application/x-zip-compressed" /><button id="load-model-button" type="submit"></button><span id="model-status" role="status" aria-live="polite"></span></form>
      </header>
      <aside class="studio-panel" aria-label="Studio controls">
        <select id="model-select" aria-label="Model selection"><option value=""></option></select>
        <select id="transform-mode" aria-label="Transform mode"><option value="translate">Move</option><option value="rotate">Rotate</option><option value="scale">Scale</option></select>
        <div class="transform-buttons"><button type="button" data-axis="x" data-sign="-1">X−</button><button type="button" data-axis="x" data-sign="1">X+</button><button type="button" data-axis="y" data-sign="-1">Y−</button><button type="button" data-axis="y" data-sign="1">Y+</button><button type="button" data-axis="z" data-sign="-1">Z−</button><button type="button" data-axis="z" data-sign="1">Z+</button></div>
        <div class="camera-touch-controls" aria-label="Camera touch controls">
          <span class="camera-touch-label">Camera</span>
          <input id="camera-zoom" class="camera-zoom" type="range" min="0" max="1" step="0.001" value="0.5" aria-label="Camera zoom" />
        </div>
        <hr />
        <button id="censorship-edit-button" type="button">検閲対象を選択</button>
        <label>検閲モード <select id="censorship-size-mode"><option value="model">モデル追従</option><option value="screen">画面固定</option></select></label>
        <label>Billboard <button id="censorship-billboard-button" type="button" disabled>ON</button></label>
        <label>モザイク粒度 <input id="censorship-pixel-size" type="range" min="2" max="64" step="1" value="18" /></label>
        <span id="censorship-status" role="status" aria-live="polite"></span>
      </aside>
      <section id="viewport" class="studio-viewport" aria-label="3D viewport"></section>
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
