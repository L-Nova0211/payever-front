export function loadStyles(files: string[], excludeBy?: string[]) {
  if (excludeBy && excludeBy.length) {
    for (const file of excludeBy) {
      if (document.getElementById(file)) {
        return;
      }
    }
  }
  files.filter(file => !document.getElementById(file)).map((file: string) => {
    const elem: HTMLElement = document.createElement('link');
    elem.setAttribute('rel', 'stylesheet');
    elem.setAttribute('href', `MICRO_COMMERCEOS_VERSION/${file}.css`);
    elem.setAttribute('id', file);
    document.getElementsByTagName('head')[0].appendChild(elem);
  });
}
