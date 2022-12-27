import { DOCUMENT, isPlatformServer } from '@angular/common';
import { Component, HostBinding, Inject, OnInit, Optional, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'peb-app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppRootComponent implements OnInit {

  @HostBinding('attr.pe-app-version')
    get attrAppVersion() {
      return this.app?.accessConfig?.version;
    }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    @Optional() @Inject('APP') public app: any,
  ) {}

  ngOnInit(): void {
    if (isPlatformServer(this.platformId)) {
      this.document.body.setAttribute('pe-client-version', require('../../../../../package.json').version);
    }
  }
}
