import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { EnvService } from '@pe/common';
import { ThemesApi } from '@pe/themes';

import { SiteEnvService } from '../services/site-env.service';

@Injectable({ providedIn: 'any' })
export class SiteThemeGuard implements CanActivate {
  constructor(
    private api: PebEditorApi,
    private themesApi:ThemesApi,
    @Inject(EnvService) private envService: SiteEnvService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const siteId = this.envService.applicationId || route.parent.params.siteId;
    if (!siteId) {
      throw new Error('There is no SITE ID in the url path');
    }

    return this.api.getShopActiveTheme().pipe(

      switchMap((result) => {
        if(!result.id){
         return this.themesApi.createApplicationTheme('new theme');
        }

        return of(result)
      }),
      map((theme) => {
       return true
      }),
    );
  }
}
