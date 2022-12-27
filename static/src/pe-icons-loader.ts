export interface EnvironmentConfigInterface {
  custom: {
    cdn: string;
  };
}

/**
 * @deprecated Use PeSvgIconsLoader instead.
 */
export class PeIconsLoader {

  private loadingIcons: {[key: string]: boolean} = {};

  public loadIcons(icons: string[], hash: string | null = null, shadowRoot: HTMLElement | null = null): void {
    for (const icon of icons) {
      if (!this.checkIsIconLoaded(icon) && !this.loadingIcons[icon]) {
        this.loadIconJsLoader(icon, 'MICRO_URL_CUSTOM_CDN', hash, shadowRoot);
      } else if (shadowRoot) {
        this.addIconsToShadowRoot(icon, shadowRoot);
      }
    }
  }

  private checkIsIconLoaded(iconName: string): boolean {
    return document.querySelector(`svg[data-id="icons-${iconName}"]`) !== null;
  }

  private loadIconJsLoader(iconName: string, cdnBase: string, hash: string | null = null, shadowRoot: HTMLElement | null = null) {
    this.loadingIcons[iconName] = true;
    const now = new Date();
    if (hash === '[PE_HASH]') {
      hash = null; // Small hack if postbuild script can't replace hash
    }
    hash = hash || (window as any).PE_HASH || `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;
    const scriptEl: HTMLScriptElement = document.createElement('script');
    scriptEl.src = `${cdnBase}/icons-js/pe-icons-${iconName}.js?${hash}`;
    scriptEl.onload = () => {
      this.addIconsToShadowRoot(iconName, shadowRoot);
      this.loadingIcons[iconName] = false;
    };
    (document.head as HTMLScriptElement).appendChild(scriptEl);
  }

  private addIconsToShadowRoot(iconName: string, shadowRoot: HTMLElement | null = null) {
    const existing = document.querySelector(`svg[data-id="icons-${iconName}"]`);
    if (shadowRoot && existing) {
      shadowRoot.appendChild(existing);
    }
  }
}
