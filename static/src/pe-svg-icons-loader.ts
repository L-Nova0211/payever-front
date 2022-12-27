export interface EnvironmentConfigInterface {
  custom: {
    cdn: string;
  };
}

export class PeSvgIconsLoader {

  private loadedIcons: string[] = [];

  public loadIcons(icons: string[], hash: string | null = null): void {
    for (const icon of icons) {
      if (!this.checkIsIconLoaded(icon)) {
        this.loadIconJsLoader(icon, 'MICRO_URL_CUSTOM_CDN', hash);
      }
    }
  }

  private checkIsIconLoaded(iconName: string): boolean {
    const containers = document.getElementsByClassName('pe-svg-icons-container');
    return this.loadedIcons.indexOf(iconName) >= 0 || (
      containers && containers.length ?
        (containers[0].querySelector(`symbol[id="icon-${iconName}"]`) !== null) :
        false
    );
  }

  private loadIconJsLoader(iconName: string, cdnBase: string, hash: string | null = null, shadowRoot: HTMLElement | null = null) {
    this.loadedIcons.push(iconName);
    const now = new Date();
    if (hash === '[PE_HASH]') {
      hash = null; // Small hack if postbuild script can't replace hash
    }
    hash = hash || (window as any).PE_HASH || `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;
    const scriptEl: HTMLScriptElement = document.createElement('script');
    scriptEl.src = `${cdnBase}/icons-js/pe-icon-${iconName}.js?${hash}`;
    (document.head as HTMLScriptElement).appendChild(scriptEl);
  }
}
