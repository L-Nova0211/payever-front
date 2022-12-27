import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Inject, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import { tap } from 'rxjs/operators';

import { PebLanguage } from '@pe/builder-core';
import { AppType, APP_TYPE } from '@pe/common';

import {
  PebClientApiService,
  PebClientAuthService,
  PebClientStateService,
  PebClientStoreService,
} from './services';

@Component({
  selector: 'peb-client',
  template: `
    <ng-container *ngIf="appId">
      <router-outlet></router-outlet>
    </ng-container>
    <ng-container *ngIf="!appId">
      <peb-client-not-found [subject]="appType | titlecase"></peb-client-not-found>
    </ng-container>
  `,
  styles: [
    `:host {
      height: 100%;
      width: 100%;
      display: block;
    }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebClientComponent implements OnInit {

  @HostBinding('attr.pe-app-version')
  get attrAppVersion() {
    return this.app?.accessConfig?.version;
  }

  constructor(
    private authService: PebClientAuthService,
    @Optional() @Inject(APP_TYPE) public appType: AppType,
    private clientStore: PebClientStoreService,
    private clientApiService: PebClientApiService,
    @Inject(PLATFORM_ID) private platformId: any,
    private stateService: PebClientStateService,
  ) { }

  private get app(): any {
    return this.clientStore.app;
  }

  public get appId(): string {
    return this.app?._id ?? this.app?.id;
  }

  private get theme(): any {
    return this.clientStore.theme;
  }

  ngOnInit(): void {
    this.authService.getCustomer();
    this.stateService.setLanguages(this.theme?.data?.languages?.reduce(
      (acc: PebLanguage[], l) => {
        if (l.active) {
          acc.push(l.language);
        }

        return acc;
      },
      [],
    ) ?? []);

    if (isPlatformBrowser(this.platformId)) {
      let visitedShops: any[];
      try {
        visitedShops = JSON.parse(localStorage.getItem('visitedShops')) || [];
      } catch (e) {
        visitedShops = [];
      }
      if (!visitedShops.includes(this.appId) && this.authService.token) {
        this.clientApiService.initiateContactSync(this.app)
          .pipe(
            tap(() => {
              localStorage.setItem('visitedShops', JSON.stringify([...visitedShops, this.appId]));
            }))
          .subscribe();
      }
    }
  }

}
