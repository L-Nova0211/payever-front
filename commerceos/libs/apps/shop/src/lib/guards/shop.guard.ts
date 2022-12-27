import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PebShopsApi } from '../services/abstract.shops.api';
import { ShopEnvService } from '../services/shop-env.service';

@Injectable()
export class PebShopGuard implements CanActivate {

  constructor(
    private api: PebShopsApi,
    @Inject(EnvService) private shopEnvService: ShopEnvService,
    private pebEnvService: PebEnvService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route?.firstChild?.firstChild?.params.shopId) {
      this.shopEnvService.shopId = route?.firstChild?.firstChild?.params?.shopId;

      return this.api.getSingleShop(route?.firstChild?.firstChild?.params?.shopId).pipe(
        map((data) => {
          route.data = { ...route.data, shop: data };

          return true;
        })
      )
    }

    return this.api.getShopsList().pipe(
      switchMap((shops) => {
        return shops.length ? of(shops) :
        this.api.createShop({ name: this.shopEnvService.businessName }).pipe(map(shop => [shop]));
      }),
      map((shops) => {
        const defaultShop = shops.find(shop => shop.isDefault === true);

        if (!defaultShop) {
          this.shopEnvService.shopId = shops[0].id;
          this.pebEnvService.applicationId = shops[0].id;
          route.data = { ...route.data, shop: shops[0] };

          return true;
        }
        this.shopEnvService.shopId = defaultShop.id;
        this.pebEnvService.applicationId = defaultShop.id;
        route.data = { ...route.data, shop: defaultShop };

        return true;
      }),
      catchError(() => {
        return of(false);
      }),
    )
  }
}
