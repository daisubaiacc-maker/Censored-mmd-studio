export interface SelectedMmdFile {
  file: File;
  url: string;
}

/** Browser-side PMX/PMD picker. Asset lifetime is owned by the caller. */
export class MmdFilePicker {
  async pick(): Promise<SelectedMmdFile | null> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pmx,.pmd';
    input.style.display = 'none';
    document.body.appendChild(input);

    return new Promise((resolve) => {
      input.addEventListener('change', () => {
        const file = input.files?.[0] ?? null;
        input.remove();
        if (!file) {
          resolve(null);
          return;
        }
        resolve({ file, url: URL.createObjectURL(file) });
      }, { once: true });
      input.click();
    });
  }
}
