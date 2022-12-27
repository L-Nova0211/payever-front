import { Injectable } from '@angular/core';

const InstallTrigger: any = null;

@Injectable({ providedIn: 'root' })
export class BrowserDetectService {
  // Opera 8.0+
  get isOpera(): boolean {
    return (
      (!!this.getWindow().opr && !!this.getWindow().opr.addons) ||
      !!this.getWindow().opera ||
      navigator.userAgent.indexOf(' OPR/') >= 0
    );
  }

  // Firefox 1.0+
  get isFirefox(): boolean {
    return typeof InstallTrigger !== 'undefined';
  }

  get isSafari(): boolean {
    const ua = navigator.appVersion.toLocaleLowerCase()

    return ua.indexOf('safari') != -1
  }

  // Internet Explorer 6-11
  get isIE(): boolean {
    return /*@cc_on!@*/ false || !!this.getDocument().documentMode;
  }

  // Edge 20+
  get isEdge(): boolean {
    return !this.isIE && !!this.getWindow().StyleMedia;
  }

  // Chrome 1+
  get isChrome(): boolean {
    return !!this.getWindow().chrome && !!this.getWindow().chrome.webstore;
  }

  private getWindow(): any {
    return window;
  }

  private getDocument(): any {
    return document;
  }
}
