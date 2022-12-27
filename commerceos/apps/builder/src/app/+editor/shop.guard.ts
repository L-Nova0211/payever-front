import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import * as yaml from 'js-yaml';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { pebCreateEmptyShop, PebEnvService, PebShop } from '@pe/builder-core';
import { setSnapshotDefaultRoutes } from '@pe/builder-services';

import { SandboxEditorCreateShopDialog } from './dialogs/create-shop/create-shop.dialog';
import { PrepareShopService } from './prepare-shop.service';



@Injectable()
export class SandboxCreateShopGuard implements CanActivate {
  constructor(
    private apiService: PebEditorApi,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private envService: PebEnvService,
    private prepareShopService: PrepareShopService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>|boolean {
    if (route.params.shopId !== 'new') {
      return true;
    }

    return this.fetchYml<any[]>('/index.yml').pipe(
      switchMap((data) => {
        return this.dialog
          .open(SandboxEditorCreateShopDialog, { data: ['empty', ...data] })
          .afterClosed();
      }),
      switchMap((data: any) => {
        if (data?.fixture === 'empty') {
          return of({ name: data.name, content: pebCreateEmptyShop() });
        }

        return data?.fixture
          ? this.fetchFixtureShop(data.fixture).pipe(
            map(shop => ({ name: data.name, content: shop })),
          )
          : of(data);
      }),
      switchMap((data: any) =>
        data ? this.prepareShopService.replaceAllStylesWithGrid(data.content).pipe(
          map(content => ({ content, name: data.name })),
        ) : of(null),
      ),
      switchMap((data: any) => {
        return data
          ? this.apiService.createShopTheme({
            name: data.name,
            content: setSnapshotDefaultRoutes(data.content) ?? pebCreateEmptyShop(),
          })
          : of(null);
      }),
      map((shop: any) => {
        if (!shop) {
          return false;
        }

        // this.envService.shopId = shop.id;
        return this.router.createUrlTree(shop ? ['editor', shop.id] : ['/']);
      }),
    );
  }

  private fetchYml<T>(path) {
    return this.http.get(`/fixtures/${path}`, { responseType: 'text' }).pipe(
      map(v => (yaml as any).safeLoad(v) as T),
    );
  }

  private fetchFixtureShop(name): Observable<PebShop> {
    return this.fetchYml<PebShop>(`${name}/theme.yml`).pipe(
      switchMap(theme =>
        combineLatest(
          theme.pages.map(pageId => this.fetchYml(`${name}/page.${pageId}.yml`)),
        ).pipe(
          map(pages => ({ ...theme, pages }) as PebShop),
        ),
      ),
    );
  }

}
