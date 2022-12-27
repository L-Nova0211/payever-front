import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {  forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// test MR

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService, PebTheme, PebThemeDetailInterface } from '@pe/builder-core';

@Injectable({ providedIn: 'root' })
export class SandboxShopResolver implements Resolve<{theme: PebTheme, snapshot: PebThemeDetailInterface}> {
  // TODO: If theme has been just created it can be passed in route data to
  //       prevent reloading
  constructor(
    private api: PebEditorApi,
    private envService: PebEnvService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<{theme: PebTheme, snapshot: PebThemeDetailInterface}> {
    // this.envService.shopId = route.params.shopId;
    return forkJoin([
      this.api.getShopThemeById(route.params.shopId),
      this.api.getThemeDetail(route.params.shopId),
    ]).pipe(
      map(([theme, snapshot]) => ({ theme, snapshot })),
    );
  }
}
