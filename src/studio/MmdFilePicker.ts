export interface MmdFileSelection {
  file: File;
  url: string;
}

export class MmdFilePicker {
  private readonly input: HTMLInputElement;

  constructor() {
    this.input = document.createElement('input');
    this.input.type = 'file';
    this.input.accept = '.pmx,.pmd';
    this.input.style.display = 'none';
    document.body.appendChild(this.input);
  }

  async pick(): Promise<MmdFileSelection | null> {
    return new Promise((resolve) => {
      const onChange = () => {
        const file = this.input.files?.[0] ?? null;
        this.input.removeEventListener('change', onChange);
        if (!file) return resolve(null);
        resolve({ file, url: URL.createObjectURL(file) });
      };
      this.input.addEventListener('change', onChange, { once: true });
      this.input.click();
    });
  }

  dispose(): void {
    this.input.remove();
  }
}
