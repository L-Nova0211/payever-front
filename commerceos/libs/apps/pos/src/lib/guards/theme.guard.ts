import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PebClientStoreService } from '@pe/builder-client';
import { EnvService } from '@pe/common';

import { BuilderPosApi } from '../services/builder/abstract.builder-pos.api';
import { PosEnvService } from '../services/pos/pos-env.service';


@Injectable({ providedIn: 'any' })
export class PosThemeGuard implements CanActivate {
  constructor(
    private apiService: BuilderPosApi,
    @Inject(EnvService) private envService: PosEnvService,
    private clientStore: PebClientStoreService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const posId = this.envService.posId || route.parent.params.posId;
    if (!posId) {
      throw new Error('There is no TERMINAL ID in the url path');
    }

    const result$ = this.apiService.getPosPreview(posId).pipe(
      switchMap((preview) => {
        const result = preview.published || preview.current;
        if (result) {
          if (typeof result === 'object' && preview.publishStatus?.applicationSynced) {
            return of(result);
          }

          return timer(500).pipe(
            switchMap(() => result$),
          );
        }

        return this.apiService.getTemplateThemes().pipe(
          switchMap((template: any) => {
            return this.apiService.getTemplateItemThemes(template[0].items[0].id).pipe(
              switchMap((items: any) => {
                return this.apiService.installTemplateTheme(posId, items.themes[0].id).pipe(
                  switchMap(() => {
                    return this.apiService.getPosPreview(posId).pipe(
                      map((theme => theme.published || theme.current)),
                    );
                  }),
                );
              }),
            );
          }),
        );
      }),
      catchError((err) => {

        return of(false);
      }),
    );

    return result$.pipe(
      map((theme) => {
        this.clientStore.theme = theme;

        return !!theme;
      }),
      catchError((err) => {
        console.error(err);

        return of(false);
      }),
    );
  }
}
