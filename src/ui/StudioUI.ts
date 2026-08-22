import type { Locale } from '../i18n';

export interface StudioUIElements {
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

export type StudioLocale = Locale;
