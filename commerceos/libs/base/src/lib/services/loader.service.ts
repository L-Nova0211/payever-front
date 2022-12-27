import { Injectable } from '@angular/core';

@Injectable({ providedIn:'root' })
export class LoaderService {

  constructor() {
  }

  hideLoader(): void {
    setTimeout(() => {
      const loader = window.document.getElementById('pe-root-loader');
      if (loader) {
        loader.parentNode.removeChild(loader);
      }
    }, 200);
  }
}
