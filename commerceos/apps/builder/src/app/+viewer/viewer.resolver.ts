import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import * as yaml from 'js-yaml';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebShop } from '@pe/builder-core';


@Injectable()
export class SandboxViewerDataResolver implements Resolve<unknown> {
  constructor(
    private api: PebEditorApi,
    private http: HttpClient,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (route.params.type === 'themes') {
      return this.api.getShopThemeById(route.params.identifier).pipe(
        map<any, any>(({ snapshot }) => ({ snapshot, pages: snapshot.pages })),
      );
    }

    if (route.params.type === 'fixtures') {
      return this.loadYml(`/fixtures/${route.params.identifier}/theme.yml`).pipe(
        switchMap((theme: PebShop) => {
          return combineLatest(
            theme.pages.map(
              page => this.loadYml(`/fixtures/${route.params.identifier}/page.${page}.yml`),
            ),
          ).pipe(
            map((pages) => ({ ...theme, pages })),
          );
        }),
      );
    }

    return null;
  }

  private loadYml(path) {
    return this.http.get(path, {
      responseType: 'text',
    }).pipe(
      map((content) => (yaml as any).safeLoad(content)),
    );
  }
}
